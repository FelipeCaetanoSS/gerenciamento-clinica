const pacienteModel = require("../repository/pacientes.repository");

const listar = async (req, res, next) => {
  try {
    const pacientes = await pacienteModel.listarTodos(req.query);
    res.status(200).json(pacientes);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const paciente = await pacienteModel.buscarPorId(id);

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    res.json(paciente);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const { nome, cpf, telefone, sexo } = req.body;

    if (!nome || !cpf || !telefone) {
      return res
        .status(400)
        .json({ erro: "nome, cpf e telefone são obrigatorios" });
    }

    const novoPaciente = await pacienteModel.criar({
      ...req.body,
      sexo: sexo || "Não informado",
    });

    res.status(201).json(novoPaciente);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pacienteAtualizado = await pacienteModel.atualizar(id, req.body);

    if (!pacienteAtualizado) {
      return res.status(404).json({ erro: "Paciente nâo encontrado" });
    }

    res.json(pacienteAtualizado);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = await pacienteModel.remover(id);

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
