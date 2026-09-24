const prisma = require("../lib/client");
const notificacoesModel = require("./notificacoes.repository");
const pacientesModel = require("./pacientes.repository");
const { statusCancelado, statusConcluido } = require("../lib/agendamento-status");
const { erroHttp } = require("../lib/http-error");
const { dataEHorarioValidos, dataHoraComAntecedenciaMinima } = require("../lib/validacao");
const {
  adicionarDiaHorarioClinica,
  formatarDataHoraClinica,
  intervaloDiaClinica,
  montarDataHoraClinica,
} = require("../lib/timezone");
const { dadosAuditoria, includeAlteradoPor, usuarioPublicoSelect, withUltimaAlteracao } = require("./auditoria.repository");

const includePacienteMedico = {
  paciente: {
    include: {
      usuario: {
        select: usuarioPublicoSelect,
      },
    },
  },
  medico: {
    include: {
      usuario: {
        select: usuarioPublicoSelect,
      },
    },
  },
  ...includeAlteradoPor,
};

function montarData(dia, horario) {
  return montarDataHoraClinica(dia, horario);
}

function mapAgendamentoResposta(agendamento) {
  return adicionarDiaHorarioClinica(withUltimaAlteracao(agendamento));
}

async function criarNotificacaoSegura(dados) {
  try {
    await notificacoesModel.criarNotificacao(dados);
  } catch (err) {
    console.error("Nao foi possivel criar notificacao:", err.message);
  }
}

function descricaoAgendamento(agendamento) {
  const paciente = agendamento?.paciente?.usuario?.nome || "Paciente";
  const medico = agendamento?.medico?.usuario?.nome || "medico";
  const data = agendamento?.data instanceof Date
    ? formatarDataHoraClinica(agendamento.data)
    : "";

  return { paciente, medico, data };
}

function dadosNotificacaoPaciente(agendamento) {
  return {
    usuarioId: agendamento?.paciente?.usuarioId,
    tipo: "appointment",
    categoria: "appointment",
  };
}

function erroHorarioIndisponivel() {
  return erroHttp("Horario indisponivel para este medico ou paciente", 409);
}

function erroAntecedenciaMinima() {
  return erroHttp("A consulta deve ser marcada com no minimo 2 horas de antecedencia", 400);
}

function erroDataHorarioInvalido() {
  return erroHttp("dia e horario sao invalidos", 400);
}

function validarDataHorarioAgendamento(dia, horario) {
  if (!dataEHorarioValidos(dia, horario)) {
    throw erroDataHorarioInvalido();
  }

  if (!dataHoraComAntecedenciaMinima(dia, horario)) {
    throw erroAntecedenciaMinima();
  }
}

async function validarHorarioDisponivel({ pacienteId, medicoId, data, status, ignorarId }) {
  if (statusCancelado(status)) return;

  const conflitos = await prisma.agendamento.findMany({
    where: {
      data,
      ...(ignorarId !== undefined ? { id: { not: Number(ignorarId) } } : {}),
      OR: [
        { medicoId },
        { pacienteId },
      ],
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (conflitos.some((agendamento) => !statusCancelado(agendamento.status))) {
    throw erroHorarioIndisponivel();
  }
}

const listarTodos = async (filtros = {}) => {
  const { dia, medicoId, medicoUsuarioId, pacienteUsuarioId } = filtros;
  const where = {};

  if (medicoUsuarioId) {
    where.medico = {
      usuarioId: Number(medicoUsuarioId),
    };
  } else if (medicoId) {
    where.medicoId = Number(medicoId);
  }

  if (pacienteUsuarioId) {
    where.paciente = {
      usuarioId: Number(pacienteUsuarioId),
    };
  }

  if (dia) {
    const intervalo = intervaloDiaClinica(dia);
    if (intervalo) {
      where.data = {
        gte: intervalo.inicio,
        lt: intervalo.proximoInicio,
      };
    }
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: includePacienteMedico,
    orderBy: { data: "asc" },
  });

  return agendamentos.map(mapAgendamentoResposta);
};

const buscarPorId = async (id) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: includePacienteMedico,
  });

  return mapAgendamentoResposta(agendamento);
};

const criar = async (dados, usuarioAlteracaoId) => {
  const pacienteId = Number(dados.pacienteId);
  const medicoId = Number(dados.medicoId);

  validarDataHorarioAgendamento(dados.dia, dados.horario);

  const data = montarData(dados.dia, dados.horario);

  await validarHorarioDisponivel({
    pacienteId,
    medicoId,
    data,
    status: dados.status,
  });

  const agendamento = await prisma.agendamento.create({
    data: {
      pacienteId,
      medicoId,
      data,
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    include: includePacienteMedico,
  });

  const descricao = descricaoAgendamento(agendamento);
  await criarNotificacaoSegura({
    ...dadosNotificacaoPaciente(agendamento),
    titulo: "Novo agendamento",
    mensagem: `${descricao.paciente} foi agendado com ${descricao.medico}${descricao.data ? ` em ${descricao.data}` : ""}.`,
  });

  return mapAgendamentoResposta(agendamento);
};

const atualizar = async (id, dados, usuarioAlteracaoId) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return null;

  const pacienteId = dados.pacienteId !== undefined ? Number(dados.pacienteId) : agendamento.pacienteId;
  const medicoId = dados.medicoId !== undefined ? Number(dados.medicoId) : agendamento.medicoId;

  if ((dados.dia && !dados.horario) || (!dados.dia && dados.horario)) {
    throw erroHttp("Para alterar data/hora, envie dia e horario juntos", 400);
  }

  if (dados.dia && dados.horario) {
    validarDataHorarioAgendamento(dados.dia, dados.horario);
  }

  const data = dados.dia && dados.horario ? montarData(dados.dia, dados.horario) : agendamento.data;
  const status = dados.status !== undefined ? dados.status : agendamento.status;

  await validarHorarioDisponivel({
    pacienteId,
    medicoId,
    data,
    status,
    ignorarId: id,
  });

  const atualizado = await prisma.agendamento.update({
    where: { id },
    data: {
      ...(dados.pacienteId !== undefined ? { pacienteId: Number(dados.pacienteId) } : {}),
      ...(dados.medicoId !== undefined ? { medicoId: Number(dados.medicoId) } : {}),
      ...(dados.dia && dados.horario ? { data: montarData(dados.dia, dados.horario) } : {}),
      ...(dados.status !== undefined ? { status: dados.status } : {}),
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    include: includePacienteMedico,
  });

  if (dados.status !== undefined && statusCancelado(dados.status) && !statusCancelado(agendamento.status)) {
    const descricao = descricaoAgendamento(atualizado);
    await criarNotificacaoSegura({
      ...dadosNotificacaoPaciente(atualizado),
      titulo: "Agendamento cancelado",
      mensagem: `${descricao.paciente} teve a consulta cancelada${descricao.data ? ` de ${descricao.data}` : ""}.`,
      tipo: "cancellation",
      categoria: "appointment_cancelled",
    });
  }

  return mapAgendamentoResposta(atualizado);
};

const finalizar = async (id, dados = {}, usuarioAlteracaoId) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(id) },
    include: includePacienteMedico,
  });

  if (!agendamento) return null;

  if (statusCancelado(agendamento.status)) {
    throw erroHttp("Nao e possivel finalizar um agendamento cancelado", 400);
  }

  if (statusConcluido(agendamento.status)) {
    throw erroHttp("Agendamento ja finalizado", 400);
  }

  const prontuario = await pacientesModel.criarProntuario(agendamento.pacienteId, {
    ...dados,
    medicoId: agendamento.medicoId,
    data: dados.data || agendamento.data,
    notificar: false,
  }, usuarioAlteracaoId);

  const agendamentoAtualizado = await prisma.agendamento.update({
    where: { id: Number(id) },
    data: {
      status: "concluido",
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    include: includePacienteMedico,
  });

  const descricao = descricaoAgendamento(agendamentoAtualizado);
  await criarNotificacaoSegura({
    ...dadosNotificacaoPaciente(agendamentoAtualizado),
    titulo: "Consulta finalizada",
    mensagem: `${descricao.paciente} teve prontuario registrado por ${descricao.medico}.`,
    categoria: "appointment_completed",
  });

  return {
    agendamento: mapAgendamentoResposta(agendamentoAtualizado),
    prontuario,
  };
};

const remover = async (id) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return false;

  await prisma.agendamento.delete({ where: { id } });
  return true;
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  finalizar,
  remover,
};
