const prisma = require("../lib/client");

const criarNotificacao = (dados) => {
  return prisma.notificacao.create({
    data: {
      titulo: dados.titulo,
      mensagem: dados.mensagem,
      lida: dados.lida,
      data: new Date(),
    },
  });
};

const listarTodos = () => {
  return prisma.notificacao.findMany();
};

const visualizarTodos = async()=>{
  const notificacao = await prisma.notificacao.updateMany({
    where: { lida: false },
    data: { lida: true },
  });

  if (!notificacao) return null;

  return notificacao;
}

const visualizarId = async (id) => {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id },
    data: { lida: true },
  });

  if (!notificacao) return null;

  return notificacao;
};

const remover = async (id) => {
  const notificacao = await prisma.notificacao.findUnique({
    where: { id },
  });

  if (!notificacao) return false;

  await prisma.notificacao.delete({ where: { id } });
  return true;
};

module.exports = {
  criarNotificacao,
  listarTodos,
  visualizarTodos,
  visualizarId,
  remover,
};
