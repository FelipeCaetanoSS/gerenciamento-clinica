const prisma = require("../lib/client");

const includePacienteMedico = {
  paciente: {
    include: {
      usuario: true,
    },
  },
  medico: {
    include: {
      usuario: true,
    },
  },
};

function montarData(dia, horario) {
  return new Date(`${dia}T${horario}:00`);
}

const listarTodos = (filtros = {}) => {
  const { dia, medicoId } = filtros;
  const where = {};

  if (medicoId) {
    where.medicoId = Number(medicoId);
  }

  if (dia) {
    const inicio = new Date(`${dia}T00:00:00`);
    const fim = new Date(`${dia}T23:59:59.999`);
    where.data = {
      gte: inicio,
      lte: fim,
    };
  }

  return prisma.agendamento.findMany({
    where,
    include: includePacienteMedico,
    orderBy: { data: "asc" },
  });
};

const buscarPorId = (id) => {
  return prisma.agendamento.findUnique({
    where: { id },
    include: includePacienteMedico,
  });
};

const criar = (dados) => {
  return prisma.agendamento.create({
    data: {
      pacienteId: Number(dados.pacienteId),
      medicoId: Number(dados.medicoId),
      data: montarData(dados.dia, dados.horario),
    },
    include: includePacienteMedico,
  });
};

const atualizar = async (id, dados) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return null;

  return prisma.agendamento.update({
    where: { id },
    data: {
      ...(dados.pacienteId !== undefined ? { pacienteId: Number(dados.pacienteId) } : {}),
      ...(dados.medicoId !== undefined ? { medicoId: Number(dados.medicoId) } : {}),
      ...(dados.dia && dados.horario ? { data: montarData(dados.dia, dados.horario) } : {}),
    },
    include: includePacienteMedico,
  });
};

const remover = async (id) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
  });

  if (!agendamento) return false;

  await prisma.agendamento.delete({ where: { id } });
  return true;
};

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
