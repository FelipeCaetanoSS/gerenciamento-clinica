function erroHttp(message, status = 500, extra = {}) {
  const erro = new Error(message);
  erro.status = status;
  Object.assign(erro, extra);
  return erro;
}

module.exports = {
  erroHttp,
};
