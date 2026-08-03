
const prisma = require("../lib/client")

const listarTodos = async (filtros) => {
  let resultado = await prisma.paciente;
  const { busca, sexo } = filtros;

  if (busca) {
    resultado = resultado.filter((p) =>
      (p.nome || "").toLowerCase().includes(busca.toLowerCase()),
    );
  }

  if (sexo) {
    resultado = resultado.filter(
      (p) => p.sexo.toUpperCase() === sexo.toUpperCase(),
    );
  }

  return resultado;
};

const buscarPorId = (id) => {
  return pacientes.find((p) => p.id === id);
};

const criar = (dados) => {
  const novoPaciente = prisma.paciente.create({

  })

  return novoPaciente;
};

const atualizar = (id, dados) => {
  const index = pacientes.findIndex((p) => p.id === id);
  if (index === -1) return null;

  pacientes[index] = { ...pacientes[index], ...dados, id };
  return pacientes[index];
};

const remover = (id) => {
  const index = pacientes.findIndex((p) => p.id === id);
  if (index === -1) return false;

  pacientes.splice(index, 1);
  return true;
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
