const notificacoesModel = require("../repository/notificacoes.repository");

const criar = async (req, res, next) => {
  try {
    const notificacoes = await notificacoesModel.criarNotificacao(req.body);
    res.status(200).json(notificacoes);
  } catch (err) {
    next(err);
  }
}

const listar = async (req, res, next) => {
  try {
    const notificacoes = await notificacoesModel.listarTodos(req.query);
    res.status(200).json(notificacoes);
  } catch (err) {
    next(err);
  }
};

const visualizarTodas = async (req, res, next) => {
  try {
    const notificacoes = await notificacoesModel.visualizarTodos(req.body);

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
