function mapNotificacao(notificacao, overrides = {}) {
  if (!notificacao) return notificacao;

  const tipo = notificacao.tipo || notificacao.categoria || "notification";
  const data = notificacao.data?.toISOString?.() || "";
  const lida = overrides.lida !== undefined ? overrides.lida : notificacao.lida;

  return {
    id: notificacao.id,
    type: tipo,
    tipo,
    categoria: notificacao.categoria || notificacao.tipo || "notification",
    title: notificacao.titulo,
    titulo: notificacao.titulo,
    description: notificacao.mensagem,
    descricao: notificacao.mensagem,
    mensagem: notificacao.mensagem,
    time: data,
    createdAt: data,
    criadoEm: data,
    read: lida,
    lida,
    lido: lida,
    visualizada: lida,
  };
}

module.exports = {
  mapNotificacao,
};
