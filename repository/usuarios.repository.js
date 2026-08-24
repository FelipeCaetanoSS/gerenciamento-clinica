const prisma = require("../lib/client");

const listarTodos = (filtros = {}) => {
  const { busca, sexo, role } = filtros;

  return prisma.usuario.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(sexo ? { sexo: { equals: sexo } } : {}),
      ...(busca
        ? {
            nome: {
              contains: busca,
            },
          }
        : {}),
    },
    orderBy: { nome: "asc" },
  });
};

const buscarPorId = (id) => {
  return prisma.usuario.findUnique({
    where: { id },
  });
};

const criar = (dados) => {
  return prisma.usuario.create({
    data: dados,
  });
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
};
