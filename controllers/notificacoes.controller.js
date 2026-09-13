const notificacoesModel = require("../repository/notificacoes.repository");

const criar = async (req, res, next) => {
  try {
    const dados = {
      ...req.body,
      ...(req.usuario?.id ? { usuarioId: req.usuario.id } : {}),
    };
    const notificacoes = await notificacoesModel.criarNotificacao(dados);
    res.status(201).json(notificacoes);
  } catch (err) {
    next(err);
  }
}

const listar = async (req, res, next) => {
  try {
    const filtros = { ...req.query };

    if (req.usuario?.role === "PACIENTE") {
      filtros.usuarioId = Number(req.usuario.id);
    }

    const notificacoes = await notificacoesModel.listarTodos(filtros);
    res.status(200).json(notificacoes);
  } catch (err) {
    next(err);
  }
};

const visualizarTodas = async (req, res, next) => {
  try {
    const notificacoes = await notificacoesModel.visualizarTodos();

    if (!notificacoes) {
      return res.status(404).json({ erro: "Notificação não encontrada" });
    }

    res.json(notificacoes);
  } catch (err) {
    next(err);
  }
}

const visualizarUnica = async (req, res, next) => {
  try {
    const notificacao = await notificacoesModel.visualizarId(req.params.id);

    if (!notificacao) {
      return res.status(404).json({ erro: "Notificação não encontrada" });
    }

    res.json(notificacao);
  } catch (err) {
    next(err);
  }
}

const remover = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const sucesso = await notificacoesModel.remover(id);

    if (!sucesso) {
      return res.status(404).json({ erro: "Notificação não encontrada" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  criar,
  listar,
  visualizarTodas,
  visualizarUnica,
  remover,
};
