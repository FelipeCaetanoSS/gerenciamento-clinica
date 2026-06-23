const medicoModel = require("../models/medicos.model");

const listar = (req, res, next) => {
  try {
    const medicos = medicoModel.listarTodos(req.query);
    res.status(200).json(medicos);
  } catch (err) {
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

const criar = (req, res, next) => {
  try {
    // Padronizando a propriedade 'medico' para 'nome'
    const { nome, crm, idade, sexo } = req.body;

    if (!nome || !crm || !idade || !sexo) {
      return res
        .status(400)
        .json({ erro: "nome, crm, idade e sexo são obrigatórios" });
    }

    const novoMedico = medicoModel.criar({ nome, crm, idade, sexo });
    res.status(201).json(novoMedico);
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
  criar,
  atualizar,
  remover,
};
