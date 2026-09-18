const prisma = require("../lib/client");
const { booleano } = require("../lib/normalizacao");
const { mapNotificacao } = require("../lib/notificacoes.mapper");

const criarNotificacao = (dados) => {
  return prisma.notificacao.create({
    data: {
      titulo: dados.titulo || dados.title || "Notificacao",
      mensagem: dados.mensagem || dados.message || "",
      tipo: dados.tipo || dados.type || null,
      categoria: dados.categoria || dados.category || null,
      ...(dados.usuarioId ? { usuarioId: Number(dados.usuarioId) } : {}),
      ...(dados.lida !== undefined ? { lida: booleano(dados.lida) } : {}),
      data: new Date(),
    },
  });
};

const listarTodos = (filtros = {}) => {
  const { usuarioId } = filtros;

  return prisma.notificacao.findMany({
    where: {
      ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
    },
    orderBy: { data: "desc" },
  }).then((notificacoes) => notificacoes.map(mapNotificacao));
};

const visualizarTodos = async (filtros = {}) => {
  const { usuarioId } = filtros;
  const where = {
    lida: false,
    ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
  };

  await prisma.notificacao.updateMany({
    where,
    data: { lida: true },
  });

  const notificacoes = await prisma.notificacao.findMany({
    where: {
      ...(usuarioId ? { usuarioId: Number(usuarioId) } : {}),
    },
    orderBy: { data: "desc" },
  });

  return notificacoes.map((n) => mapNotificacao(n, { lida: true }));
};

const visualizarId = async (id, filtros = {}) => {
  const { usuarioId } = filtros;
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: Number(id) },
  });

  if (!notificacao) return null;
  if (usuarioId && Number(notificacao.usuarioId) !== Number(usuarioId)) return null;

  const atualizada = await prisma.notificacao.update({
    where: { id: Number(id) },
    data: { lida: true },
  });

  return {
    notificacao: mapNotificacao(atualizada, { lida: true }),
  };
};

const remover = async (id) => {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: Number(id) },
  });

  if (!notificacao) return false;

  await prisma.notificacao.delete({ where: { id: Number(id) } });
  return true;
};

module.exports = {
  criarNotificacao,
  listarTodos,
  visualizarTodos,
  visualizarId,
  remover,
};
