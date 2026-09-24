const prisma = require("../lib/client");
const { numeroSomenteDigitos, texto } = require("../lib/normalizacao");
const { onzeDigitosNumericos } = require("../lib/validacao");
const { hashSenha, senhaTemporaria } = require("../lib/senha");
const { erroHttp } = require("../lib/http-error");
const { dadosAuditoria, dadosAuditoriaRelacao, dadosDesativacaoRelacao, includeAlteradoPor, usuarioPublicoSelect, withUltimaAlteracao } = require("./auditoria.repository");

const includeUsuario = {
  usuario: {
    select: usuarioPublicoSelect,
  },
  _count: {
    select: {
      agendamento: true,
    },
  },
  ...includeAlteradoPor,
};

function calcularHorariosDisponiveis(horarioInicio, horarioFim, duracaoMinutos, data) {
  if (!horarioInicio || !horarioFim || !duracaoMinutos) return [];

  const inicio = horarioInicio.split(":").map(Number);
  const fim = horarioFim.split(":").map(Number);
  const duracao = Number(duracaoMinutos) || 30;

  const horarios = [];
  let atual = inicio[0] * 60 + inicio[1];
  const fimMinutos = fim[0] * 60 + fim[1];

  while (atual + duracao <= fimMinutos) {
    const h = Math.floor(atual / 60).toString().padStart(2, "0");
    const m = (atual % 60).toString().padStart(2, "0");
    horarios.push(`${h}:${m}`);
    atual += duracao;
  }

  return horarios;
}

function diasAtendimentoValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(",");
  if (value === undefined || value === null) return null;
  return String(value);
}

function possuiDiasAtendimento(value) {
  if (Array.isArray(value)) return value.some(Boolean);
  return String(value || "").split(",").some((dia) => dia.trim());
}

function validarDiasAtendimento(value) {
  if (!possuiDiasAtendimento(value)) {
    throw erroHttp("Selecione ao menos um dia de atendimento", 400);
  }
}

function duracaoConsultaMinutosValue(dados) {
  return Number(dados.duracaoConsultaMinutos) || numeroSomenteDigitos(dados.duracaoConsulta) || null;
}

function camposAgendaCreate(dados) {
  return {
    diasAtendimento: diasAtendimentoValue(dados.diasAtendimento),
    horarioInicio: dados.horarioInicio || null,
    horarioFim: dados.horarioFim || null,
    duracaoConsulta: dados.duracaoConsulta || null,
    duracaoConsultaMinutos: duracaoConsultaMinutosValue(dados),
    maxConsultasDia: Number(dados.maxConsultasDia) || null,
  };
}

function camposAgendaUpdate(dados) {
  const agenda = {};

  if (dados.diasAtendimento !== undefined) agenda.diasAtendimento = diasAtendimentoValue(dados.diasAtendimento);
  if (dados.horarioInicio !== undefined) agenda.horarioInicio = dados.horarioInicio || null;
  if (dados.horarioFim !== undefined) agenda.horarioFim = dados.horarioFim || null;
  if (dados.duracaoConsulta !== undefined) agenda.duracaoConsulta = dados.duracaoConsulta || null;
  if (dados.duracaoConsultaMinutos !== undefined || dados.duracaoConsulta !== undefined) {
    agenda.duracaoConsultaMinutos = duracaoConsultaMinutosValue(dados);
  }
  if (dados.maxConsultasDia !== undefined) agenda.maxConsultasDia = Number(dados.maxConsultasDia) || null;

  return agenda;
}

const listarTodos = async (filtros = {}) => {
  const { busca, usuarioId } = filtros;

  const medicos = await prisma.medico.findMany({
    where: {
      ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
      ...(busca
        ? {
            usuario: {
              nome: {
                contains: busca,
              },
            },
          }
        : {}),
    },
    include: includeUsuario,
    orderBy: { id: "desc" },
  });

  return medicos.map((m) => {
    const diasArray = m.diasAtendimento
      ? m.diasAtendimento.split(",").map((d) => d.trim()).filter(Boolean)
      : [];

    const horarios = calcularHorariosDisponiveis(
      m.horarioInicio,
      m.horarioFim,
      m.duracaoConsultaMinutos
    );

    const medico = withUltimaAlteracao(m);

    return {
      ...medico,
      usuario: m.usuario
        ? {
            ...m.usuario,
            idade: m.usuario.idade || 0,
          }
        : null,
      crmUf: m.crmUf || "",
      diasAtendimento: diasArray,
      agenda: {
        startTime: m.horarioInicio || "",
        endTime: m.horarioFim || "",
        workDays: diasArray,
        consultDuration: m.duracaoConsulta || `${m.duracaoConsultaMinutos || 30} min`,
        maxConsults: m.maxConsultasDia || 0,
        available: horarios,
      },
    };
  });
};

const buscarPorId = async (id) => {
  const medico = await prisma.medico.findUnique({
    where: { id },
    include: includeUsuario,
  });

  return withUltimaAlteracao(medico);
};

const criar = async (dados, usuarioAlteracaoId) => {
  validarDiasAtendimento(dados.diasAtendimento);

  return prisma.medico.create({
    data: {
      crm: numeroSomenteDigitos(dados.crm),
      crmUf: dados.crmUf || null,
      especialidade: dados.especialidade || dados.specialty || null,
      ...camposAgendaCreate(dados),
      usuario: {
        create: {
          nome: dados.nome,
          email: dados.email || `${numeroSomenteDigitos(dados.crm) || Date.now()}@medico.local`,
          senha: dados.senha || (await hashSenha(dados.senhaPlana)),
          senhaTemporaria: senhaTemporaria(dados),
          idade: Number(dados.idade) || 0,
          sexo: dados.sexo || "Nao informado",
          rg: dados.rg,
          cpf: onzeDigitosNumericos(dados.cpf, "CPF"),
          telefone: onzeDigitosNumericos(dados.telefone, "Telefone"),
          role: "MEDICO",
        },
      },
      ...dadosAuditoriaRelacao(usuarioAlteracaoId),
    },
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

const atualizar = async (id, dados, usuarioAlteracaoId) => {
  if (dados.diasAtendimento !== undefined) {
    validarDiasAtendimento(dados.diasAtendimento);
  }

  const medico = await prisma.medico.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!medico) return null;

  return prisma.medico.update({
    where: { id },
    data: {
      ...(dados.crm !== undefined ? { crm: numeroSomenteDigitos(dados.crm) } : {}),
      ...(dados.crmUf !== undefined ? { crmUf: dados.crmUf || null } : {}),
      ...(dados.especialidade !== undefined ? { especialidade: dados.especialidade } : {}),
      ...camposAgendaUpdate(dados),
      ...dadosAuditoriaRelacao(usuarioAlteracaoId),
      ...(medico.usuarioId
        ? {
            usuario: {
              update: {
                ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
                ...(dados.email !== undefined ? { email: dados.email } : {}),
                ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
                ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
                ...(dados.rg !== undefined && texto(dados.rg) ? { rg: dados.rg } : {}),
                ...(dados.cpf !== undefined ? { cpf: onzeDigitosNumericos(dados.cpf, "CPF") } : {}),
                ...(dados.telefone !== undefined ? { telefone: onzeDigitosNumericos(dados.telefone, "Telefone") } : {}),
              },
            },
          }
        : {}),
    },
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

const remover = async (id, usuarioAlteracaoId) => {
  const medico = await prisma.medico.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!medico || !medico.usuarioId) return null;

  return prisma.medico.update({
    where: { id },
    data: dadosDesativacaoRelacao(usuarioAlteracaoId),
    include: includeUsuario,
  }).then(withUltimaAlteracao);
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
