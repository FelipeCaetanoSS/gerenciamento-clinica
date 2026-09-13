const argon2 = require("argon2");
const prisma = require("../lib/client");

const includeUsuario = {
  usuario: true,
  _count: {
    select: {
      agendamento: true,
    },
  },
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

function onlyDigits(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

function hasDigits(value) {
  return String(value || "").replace(/\D/g, "").length > 0;
}

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function diasAtendimentoValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(",");
  if (value === undefined || value === null) return null;
  return String(value);
}

function duracaoConsultaMinutosValue(dados) {
  return Number(dados.duracaoConsultaMinutos) || onlyDigits(dados.duracaoConsulta) || null;
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

async function hashSenha(senha) {
  return argon2.hash(senha || "123456", {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
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

    return {
      ...m,
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

const buscarPorId = (id) => {
  return prisma.medico.findUnique({
    where: { id },
    include: includeUsuario,
  });
};

const criar = async (dados) => {
  return prisma.medico.create({
    data: {
      crm: onlyDigits(dados.crm),
      crmUf: dados.crmUf || null,
      especialidade: dados.especialidade || dados.specialty || null,
      ...camposAgendaCreate(dados),
      usuario: {
        create: {
          nome: dados.nome,
          email: dados.email || `${onlyDigits(dados.crm) || Date.now()}@medico.local`,
          senha: dados.senha || (await hashSenha(dados.senhaPlana)),
          idade: Number(dados.idade) || 0,
          sexo: dados.sexo || "Nao informado",
          rg: dados.rg,
          cpf: onlyDigits(dados.cpf) || Date.now(),
          telefone: onlyDigits(dados.telefone),
          role: "MEDICO",
        },
      },
    },
    include: includeUsuario,
  });
};

const atualizar = async (id, dados) => {
  const medico = await prisma.medico.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!medico) return null;

  return prisma.medico.update({
    where: { id },
    data: {
      ...(dados.crm !== undefined ? { crm: onlyDigits(dados.crm) } : {}),
      ...(dados.crmUf !== undefined ? { crmUf: dados.crmUf || null } : {}),
      ...(dados.especialidade !== undefined ? { especialidade: dados.especialidade } : {}),
      ...camposAgendaUpdate(dados),
      ...(medico.usuarioId
        ? {
            usuario: {
              update: {
                ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
                ...(dados.email !== undefined ? { email: dados.email } : {}),
                ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
                ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
                ...(dados.rg !== undefined && hasText(dados.rg) ? { rg: dados.rg } : {}),
                ...(dados.cpf !== undefined && hasDigits(dados.cpf) ? { cpf: onlyDigits(dados.cpf) } : {}),
                ...(dados.telefone !== undefined && hasDigits(dados.telefone) ? { telefone: onlyDigits(dados.telefone) } : {}),
              },
            },
          }
        : {}),
    },
    include: includeUsuario,
  });
};

const remover = async (id) => {
  const medico = await prisma.medico.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!medico || !medico.usuarioId) return null;

  return prisma.medico.update({
    where: { id },
    data: {
      usuario: {
        update: {
          ativo: false,
        },
      },
    },
    include: includeUsuario,
  });
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
