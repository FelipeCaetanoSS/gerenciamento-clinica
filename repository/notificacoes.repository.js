const prisma = require("../lib/client");

function booleano(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "sim", "s", "lida", "visualizada"].includes(value.toLowerCase());
  }
  return false;
}

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
  }).then((notificacoes) =>
    notificacoes.map((n) => ({
      id: n.id,
      type: n.tipo || n.categoria || "notification",
      tipo: n.tipo || n.categoria || "notification",
      categoria: n.categoria || n.tipo || "notification",
      title: n.titulo,
      titulo: n.titulo,
      description: n.mensagem,
      descricao: n.mensagem,
      mensagem: n.mensagem,
      time: n.data?.toISOString() || "",
      createdAt: n.data?.toISOString() || "",
      criadoEm: n.data?.toISOString() || "",
      read: n.lida,
      lida: n.lida,
      lido: n.lida,
      visualizada: n.lida,
    }))
  );
};

const visualizarTodos = async () => {
  await prisma.notificacao.updateMany({
    where: { lida: false },
    data: { lida: true },
  });

  const notificacoes = await prisma.notificacao.findMany({
    orderBy: { data: "desc" },
  });

  return notificacoes.map((n) => ({
    id: n.id,
    type: n.tipo || n.categoria || "notification",
    tipo: n.tipo || n.categoria || "notification",
    categoria: n.categoria || n.tipo || "notification",
    title: n.titulo,
    titulo: n.titulo,
    description: n.mensagem,
    descricao: n.mensagem,
    mensagem: n.mensagem,
    time: n.data?.toISOString() || "",
    createdAt: n.data?.toISOString() || "",
    criadoEm: n.data?.toISOString() || "",
    read: true,
    lida: true,
    lido: true,
    visualizada: true,
  }));
};

const visualizarId = async (id) => {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id: Number(id) },
  });

  if (!notificacao) return null;

  const atualizada = await prisma.notificacao.update({
    where: { id: Number(id) },
    data: { lida: true },
  });

  return {
    notificacao: {
      id: atualizada.id,
      type: atualizada.tipo || atualizada.categoria || "notification",
      tipo: atualizada.tipo || atualizada.categoria || "notification",
      categoria: atualizada.categoria || atualizada.tipo || "notification",
      title: atualizada.titulo,
      titulo: atualizada.titulo,
      description: atualizada.mensagem,
      descricao: atualizada.mensagem,
      mensagem: atualizada.mensagem,
      time: atualizada.data?.toISOString() || "",
      createdAt: atualizada.data?.toISOString() || "",
      criadoEm: atualizada.data?.toISOString() || "",
      read: true,
      lida: true,
      lido: true,
      visualizada: true,
    },
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
