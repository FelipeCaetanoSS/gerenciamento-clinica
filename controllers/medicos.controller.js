const medicoModel = require("../repository/medicos.repository");
const argon2 = require('argon2');

const listar = (req, res, next) => {
  try {
    const medicos = medicoModel.listarTodos(req.query);
    res.status(200).json(medicos);
  } catch (err) {
    console.log("erro:", err);
    next(err);
  }
};

const buscarPorId = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const medico = medicoModel.buscarPorId(id);

    if (!medico) {
      return res.status(404).json({ erro: "Médico não encontrado" });
    }

    res.json(medico);
  } catch (err) {
    next(err);
  }
};

const atualizar = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dados = req.body;

    const medicoAtualizado = medicoModel.atualizar(id, dados);

    if (!medicoAtualizado) {
      return res.status(404).json({ erro: "Médico não encontrado" });
    }

    res.json(medicoAtualizado);
  } catch (err) {
    next(err);
  }
};

const remover = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = medicoModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Médico não encontrado" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  buscarPorId,
  atualizar,
  remover,
};
