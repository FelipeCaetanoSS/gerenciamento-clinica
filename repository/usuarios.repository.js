const argon2 = require("argon2");
const prisma = require("../lib/client");

const usuarioSelect = {
  id: true,
  email: true,
  nome: true,
  idade: true,
  sexo: true,
  rg: true,
  cpf: true,
  telefone: true,
  ativo: true,
  role: true,
};

function onlyDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["true", "1", "sim", "s"].includes(value.toLowerCase());
  return Boolean(value);
}

async function hashSenha(senhaPlana) {
  return argon2.hash(senhaPlana, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

const listarTodos = (filtros = {}) => {
  const { busca, sexo, role } = filtros;

  return prisma.usuario.findMany({
    where: {
      ...(role ? { role: String(role).toUpperCase() } : {}),
      ...(sexo ? { sexo: { equals: sexo } } : {}),
      ...(busca
        ? {
            nome: {
              contains: busca,
            },
          }
        : {}),
    },
    select: usuarioSelect,
    orderBy: { nome: "asc" },
  });
};

const buscarPorId = (id) => {
  return prisma.usuario.findUnique({
    where: { id },
    select: usuarioSelect,
  });
};

const criar = async (dados) => {
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || (await hashSenha(dados.senhaPlana)),
      idade: Number(dados.idade) || 0,
      sexo: dados.sexo,
      telefone: onlyDigits(dados.telefone),
      cpf: onlyDigits(dados.cpf),
      rg: dados.rg,
      role: String(dados.role || "").toUpperCase(),
      ...(dados.ativo !== undefined ? { ativo: toBoolean(dados.ativo) } : {}),
    },
    select: usuarioSelect,
  });
};

const atualizar = async (id, dados) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!usuario) return null;

  return prisma.usuario.update({
    where: { id },
    data: {
      ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
      ...(dados.email !== undefined ? { email: dados.email } : {}),
      ...(dados.idade !== undefined ? { idade: Number(dados.idade) || 0 } : {}),
      ...(dados.sexo !== undefined ? { sexo: dados.sexo } : {}),
      ...(dados.telefone !== undefined ? { telefone: onlyDigits(dados.telefone) } : {}),
      ...(dados.cpf !== undefined ? { cpf: onlyDigits(dados.cpf) } : {}),
      ...(dados.rg !== undefined ? { rg: dados.rg } : {}),
      ...(dados.role !== undefined ? { role: String(dados.role).toUpperCase() } : {}),
      ...(dados.ativo !== undefined ? { ativo: toBoolean(dados.ativo) } : {}),
    },
    select: usuarioSelect,
  });
};

const remover = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!usuario) return null;

  return prisma.usuario.update({
    where: { id },
    data: { ativo: false },
    select: usuarioSelect,
  });
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
  usuarioSelect,
};
