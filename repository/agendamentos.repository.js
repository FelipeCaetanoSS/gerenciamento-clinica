const prisma = require("../lib/client")

const listarTodos = (filtros) => {
  let resultado = agendamentos;
  const { dia, medicoId } = filtros;

  if (dia) {
    resultado = resultado.filter((a) =>
      a.dia.toLowerCase().includes(dia.toLowerCase()),
    );
  }

  if (medicoId) {
    resultado = resultado.filter((a) => a.medicoId === Number(medicoId));
  }

  return resultado;
};

const buscarPorId = (id) => {
  return agendamentos.find((a) => a.id === id);
};

const criar = (dados) => {
  const novoAgendamento = { id: proximoId++, ...dados };
  agendamentos.push(novoAgendamento);
  return novoAgendamento;
};

const atualizar = (id, dados) => {
  const index = agendamentos.findIndex((a) => a.id === id);
  if (index === -1) return null;

  agendamentos[index] = { ...agendamentos[index], ...dados, id };
  return agendamentos[index];
};

const remover = (id) => {
  const index = agendamentos.findIndex((a) => a.id === id);
  if (index === -1) return false;

  agendamentos.splice(index, 1);
  return true;
};

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover };
