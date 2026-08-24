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

function onlyDigits(value) {
  return Number(String(value || "").replace(/\D/g, "")) || 0;
}

async function hashSenha(senha) {
  return argon2.hash(senha || "123456", {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

const listarTodos = (filtros = {}) => {
  const { busca } = filtros;

  return prisma.medico.findMany({
    where: {
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
      especialidade: dados.especialidade || dados.specialty || null,
      usuario: {
        create: {
          nome: dados.nome,
          email: dados.email || `${onlyDigits(dados.crm) || Date.now()}@medico.local`,
          senha: dados.senha || (await hashSenha(dados.senhaPlana)),
          idade: Number(dados.idade) || 0,
          sexo: dados.sexo || "Nao informado",
          rg: dados.rg || `RG-${Date.now()}`,
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
      ...(dados.especialidade !== undefined ? { especialidade: dados.especialidade } : {}),
      ...(medico.usuarioId
        ? {
            usuario: {
              update: {
                ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
                ...(dados.email !== undefined ? { email: dados.email } : {}),
                ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
                ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
                ...(dados.rg !== undefined ? { rg: dados.rg } : {}),
                ...(dados.cpf !== undefined ? { cpf: onlyDigits(dados.cpf) } : {}),
                ...(dados.telefone !== undefined ? { telefone: onlyDigits(dados.telefone) } : {}),
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

  if (!medico) return false;

  await prisma.medico.delete({ where: { id } });

  if (medico.usuarioId) {
    await prisma.usuario.delete({ where: { id: medico.usuarioId } });
  }

  return true;
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
