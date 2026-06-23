const agendamentoModel = require("../models/agendamentos.model");

const listar = (req, res, next) => {
  try {
    const agendamentos = agendamentoModel.listarTodos(req.query);
    res.status(200).json(agendamentos);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const agendamento = agendamentoModel.buscarPorId(id);

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    res.json(agendamento);
  } catch (err) {
    next(err);
  }
};

const criar = (req, res, next) => {
  try {
    const { pacienteId, medicoId, dia, horario } = req.body;

    if (!pacienteId || !medicoId || !dia || !horario) {
      return res
        .status(400)
        .json({ erro: "pacienteId, medicoId, dia e horario são obrigatórios" });
    }

    const novoAgendamento = agendamentoModel.criar({
      pacienteId,
      medicoId,
      dia,
      horario,
    });
    res.status(201).json(novoAgendamento);
  } catch (err) {
    next(err);
  }
};

const atualizar = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dados = req.body;

    const agendamentoAtualizado = agendamentoModel.atualizar(id, dados);

    if (!agendamentoAtualizado) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    res.json(agendamentoAtualizado);
  } catch (err) {
    next(err);
  }
};

const remover = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = agendamentoModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Agendamento não encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
