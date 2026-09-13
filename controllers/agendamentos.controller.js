const agendamentoModel = require("../repository/agendamentos.repository");

const listar = async (req, res, next) => {
  try {
    const filtros = { ...req.query };

    if (req.usuario?.role === "MEDICO") {
      delete filtros.medicoId;
      filtros.medicoUsuarioId = Number(req.usuario.id);
    } else if (req.usuario?.role === "PACIENTE") {
      filtros.pacienteUsuarioId = Number(req.usuario.id);
    }

    const agendamentos = await agendamentoModel.listarTodos(filtros);
    res.status(200).json(agendamentos);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const agendamento = await agendamentoModel.buscarPorId(id);

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
    }

    res.json(agendamento);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const { pacienteId, medicoId, dia, horario } = req.body;

    if (!pacienteId || !medicoId || !dia || !horario) {
      return res
        .status(400)
        .json({ erro: "pacienteId, medicoId, dia e horario sao obrigatorios" });
    }

    const novoAgendamento = await agendamentoModel.criar({
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

const atualizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const agendamentoAtualizado = await agendamentoModel.atualizar(id, req.body);

    if (!agendamentoAtualizado) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
    }

    res.json(agendamentoAtualizado);
  } catch (err) {
    next(err);
  }
};

const finalizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Agendamento invalido" });
    }

    const resultado = await agendamentoModel.finalizar(id, req.body);

    if (!resultado) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
    }

    res.json(resultado);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = await agendamentoModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
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
  finalizar,
  remover,
};
