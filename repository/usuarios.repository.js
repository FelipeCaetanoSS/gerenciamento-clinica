const prisma = require("../lib/client");
const { booleano, normalizarRole } = require("../lib/normalizacao");
const { onzeDigitosNumericos } = require("../lib/validacao");
const { hashSenha, verificarSenha } = require("../lib/senha");
const { dadosAuditoria, dadosDesativacao, usuarioAuditoriaSelect, withUltimaAlteracao } = require("./auditoria.repository");

const usuarioSelect = {
  id: true,
  email: true,
  nome: true,
  senhaTemporaria: true,
  idade: true,
  sexo: true,
  rg: true,
  cpf: true,
  telefone: true,
  ativo: true,
  role: true,
  alteradoPorId: true,
  alteradoEm: true,
  alteradoPor: {
    select: usuarioAuditoriaSelect,
  },
};

const listarTodos = (filtros = {}) => {
  const { busca, sexo, role } = filtros;

  return prisma.usuario.findMany({
    where: {
      ...(role ? { role: normalizarRole(role) } : {}),
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
  }).then((usuarios) => usuarios.map(withUltimaAlteracao));
};

const buscarPorId = (id) => {
  return prisma.usuario.findUnique({
    where: { id },
    select: usuarioSelect,
  }).then(withUltimaAlteracao);
};

const criar = async (dados, usuarioAlteracaoId) => {
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || (await hashSenha(dados.senhaPlana)),
      senhaTemporaria: dados.senhaTemporaria === true,
      idade: Number(dados.idade) || 0,
      sexo: dados.sexo,
      telefone: onzeDigitosNumericos(dados.telefone, "Telefone"),
      cpf: onzeDigitosNumericos(dados.cpf, "CPF"),
      rg: dados.rg,
      role: normalizarRole(dados.role),
      ...(dados.ativo !== undefined ? { ativo: booleano(dados.ativo) } : {}),
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    select: usuarioSelect,
  }).then(withUltimaAlteracao);
};

const atualizar = async (id, dados, usuarioAlteracaoId) => {
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
      ...(dados.telefone !== undefined ? { telefone: onzeDigitosNumericos(dados.telefone, "Telefone") } : {}),
      ...(dados.cpf !== undefined ? { cpf: onzeDigitosNumericos(dados.cpf, "CPF") } : {}),
      ...(dados.rg !== undefined ? { rg: dados.rg } : {}),
      ...(dados.role !== undefined ? { role: normalizarRole(dados.role) } : {}),
      ...(dados.ativo !== undefined ? { ativo: booleano(dados.ativo) } : {}),
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    select: usuarioSelect,
  }).then(withUltimaAlteracao);
};

const alterarSenha = async (id, dados, usuarioAlteracaoId) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, senha: true },
  });

  if (!usuario) return { status: "not_found" };

  const senhaValida = await verificarSenha(usuario.senha, dados.senhaAtual);

  if (!senhaValida) return { status: "invalid_password" };

  const usuarioAtualizado = await prisma.usuario.update({
    where: { id },
    data: {
      senha: await hashSenha(dados.novaSenha),
      senhaTemporaria: false,
      ...dadosAuditoria(usuarioAlteracaoId),
    },
    select: usuarioSelect,
  }).then(withUltimaAlteracao);

  return { status: "updated", usuario: usuarioAtualizado };
};

const remover = async (id, usuarioAlteracaoId) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!usuario) return null;

  return prisma.usuario.update({
    where: { id },
    data: dadosDesativacao(usuarioAlteracaoId),
    select: usuarioSelect,
  }).then(withUltimaAlteracao);
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  alterarSenha,
  remover,
  usuarioSelect,
};
