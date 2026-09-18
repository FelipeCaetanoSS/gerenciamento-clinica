const prisma = require("../lib/client");
const notificacoesModel = require("./notificacoes.repository");
const pacientesModel = require("./pacientes.repository");
const { statusCancelado, statusConcluido } = require("../lib/agendamento-status");
const { erroHttp } = require("../lib/http-error");
const { dadosAuditoria, includeAlteradoPor, withUltimaAlteracao } = require("./auditoria.repository");

const includePacienteMedico = {
  paciente: {
    include: {
      usuario: true,
    },
  },
  medico: {
    include: {
      usuario: true,
    },
  },
  ...includeAlteradoPor,
};

function montarData(dia, horario) {
  return new Date(`${dia}T${horario}:00`);
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
    ? agendamento.data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
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
    const inicio = new Date(`${dia}T00:00:00`);
    const fim = new Date(`${dia}T23:59:59.999`);
    where.data = {
      gte: inicio,
      lte: fim,
    };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: includePacienteMedico,
    orderBy: { data: "asc" },
  });

  return agendamentos.map(withUltimaAlteracao);
};

const buscarPorId = async (id) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: includePacienteMedico,
  });

  return withUltimaAlteracao(agendamento);
};

const criar = async (dados, usuarioAlteracaoId) => {
  const pacienteId = Number(dados.pacienteId);
  const medicoId = Number(dados.medicoId);
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

  return withUltimaAlteracao(agendamento);
};

const atualizar = async (id, dados, usuarioAlteracaoId) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return null;

  const pacienteId = dados.pacienteId !== undefined ? Number(dados.pacienteId) : agendamento.pacienteId;
  const medicoId = dados.medicoId !== undefined ? Number(dados.medicoId) : agendamento.medicoId;
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

  return withUltimaAlteracao(atualizado);
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
    agendamento: withUltimaAlteracao(agendamentoAtualizado),
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
