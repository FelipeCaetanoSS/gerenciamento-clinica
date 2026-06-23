const agendamentos = [
  { id: 1, pacienteId: 1, medicoId: 1, dia: "2026-06-15", horario: "09:00" },
  { id: 2, pacienteId: 2, medicoId: 2, dia: "2026-06-15", horario: "10:30" },
  { id: 3, pacienteId: 3, medicoId: 1, dia: "2026-06-15", horario: "11:00" },
];

let proximoId = 4;

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
