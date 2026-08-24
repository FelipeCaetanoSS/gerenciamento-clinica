const medicoModel = require("../repository/medicos.repository");

const listar = async (req, res, next) => {
  try {
    const medicos = await medicoModel.listarTodos(req.query);
    res.status(200).json(medicos);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const medico = await medicoModel.buscarPorId(id);

    if (!medico) {
      return res.status(404).json({ erro: "Medico não encontrado" });
    }

    res.json(medico);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const { nome, crm, telefone } = req.body;

    if (!nome || !crm || !telefone) {
      return res
        .status(400)
        .json({ erro: "nome, crm e telefone são obrigatórios" });
    }

    const novoMedico = await medicoModel.criar(req.body);
    res.status(201).json(novoMedico);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const medicoAtualizado = await medicoModel.atualizar(id, req.body);

    if (!medicoAtualizado) {
      return res.status(404).json({ erro: "Medico não encontrado" });
    }

    res.json(medicoAtualizado);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = await medicoModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Medico não encontrado" });
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
