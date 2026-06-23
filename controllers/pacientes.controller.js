const pacienteModel = require("../models/pacientes.model");

const listar = (req, res, next) => {
  try {
    const pacientes = pacienteModel.listarTodos(req.query);
    res.status(200).json(pacientes);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const paciente = pacienteModel.buscarPorId(id);

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    res.json(paciente);
  } catch (err) {
    next(err);
  }
};

const criar = (req, res, next) => {
  try {
    const { nome, idade, sexo } = req.body;

    if (!nome || !idade || !sexo) {
      return res
        .status(400)
        .json({ erro: "nome, idade e sexo são obrigatórios" });
    }

    const novoPaciente = pacienteModel.criar({ nome, idade, sexo });
    res.status(201).json(novoPaciente);
  } catch (err) {
    next(err);
  }
};

const atualizar = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dados = req.body;

    const pacienteAtualizado = pacienteModel.atualizar(id, dados);

    if (!pacienteAtualizado) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    res.json(pacienteAtualizado);
  } catch (err) {
    next(err);
  }
};

const remover = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = pacienteModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
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
