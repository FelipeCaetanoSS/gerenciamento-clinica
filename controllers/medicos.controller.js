const medicoModel = require("../repository/medicos.repository");
const {
  camposObrigatorios,
  mensagemCamposObrigatorios,
} = require("../lib/validacao");

const listar = async (req, res, next) => {
  try {
    const filtros = {
      ...req.query,
      ...(req.usuario?.role === "MEDICO" ? { usuarioId: Number(req.usuario.id) } : {}),
    };
    const medicos = await medicoModel.listarTodos(filtros);
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
    const camposFaltando = camposObrigatorios(req.body, ["nome", "crm", "rg", "telefone", "email"]);

    if (camposFaltando.length > 0) {
      return res
        .status(400)
        .json({ erro: mensagemCamposObrigatorios(camposFaltando) });
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
    const medicoRemovido = await medicoModel.remover(id);

    if (!medicoRemovido) {
      return res.status(404).json({ erro: "Medico não encontrado" });
    }

    res.json(medicoRemovido);
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
