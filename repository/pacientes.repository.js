const argon2 = require("argon2");
const prisma = require("../lib/client");

const includeUsuario = {
  usuario: true,
  convenio: true,
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
  const { busca, sexo } = filtros;

  return prisma.paciente.findMany({
    where: {
      usuario: {
        ...(sexo ? { sexo } : {}),
        ...(busca ? { nome: { contains: busca } } : {}),
      },
    },
    include: includeUsuario,
    orderBy: { id: "desc" },
  });
};

const buscarPorId = (id) => {
  return prisma.paciente.findUnique({
    where: { id },
    include: includeUsuario,
  });
};

const criar = async (dados) => {
  const usuarioData = {
    nome: dados.nome,
    email: dados.email || `${onlyDigits(dados.cpf) || Date.now()}@paciente.local`,
    senha: dados.senha || (await hashSenha(dados.senhaPlana)),
    idade: Number(dados.idade) || 0,
    sexo: dados.sexo || "Nao informado",
    rg: dados.rg || `RG-${Date.now()}`,
    cpf: onlyDigits(dados.cpf),
    telefone: onlyDigits(dados.telefone),
    role: "PACIENTE",
  };

  return prisma.paciente.create({
    data: {
      localnasc: dados.localnasc || null,
      estadoCivil: dados.estadoCivil || null,
      tipoSanguineo: dados.tipoSanguineo || null,
      peso: dados.peso === undefined || dados.peso === "" ? null : Number(dados.peso),
      altura: dados.altura === undefined || dados.altura === "" ? null : Number(dados.altura),
      alergia: dados.alergia || null,
      medicamento: dados.medicamento || null,
      observacao: dados.observacao || null,
      usuario: {
        create: usuarioData,
      },
    },
    include: includeUsuario,
  });
};

const atualizar = async (id, dados) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!paciente) return null;

  return prisma.paciente.update({
    where: { id },
    data: {
      ...(dados.localnasc !== undefined ? { localnasc: dados.localnasc } : {}),
      ...(dados.estadoCivil !== undefined ? { estadoCivil: dados.estadoCivil } : {}),
      ...(dados.tipoSanguineo !== undefined ? { tipoSanguineo: dados.tipoSanguineo } : {}),
      ...(dados.peso !== undefined ? { peso: Number(dados.peso) || null } : {}),
      ...(dados.altura !== undefined ? { altura: Number(dados.altura) || null } : {}),
      ...(dados.alergia !== undefined ? { alergia: dados.alergia } : {}),
      ...(dados.medicamento !== undefined ? { medicamento: dados.medicamento } : {}),
      ...(dados.observacao !== undefined ? { observacao: dados.observacao } : {}),
      ...(paciente.usuarioId
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
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: { usuarioId: true },
  });

  if (!paciente) return false;

  await prisma.paciente.delete({ where: { id } });

  if (paciente.usuarioId) {
    await prisma.usuario.delete({ where: { id: paciente.usuarioId } });
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
