const argon2 = require("argon2");

const SENHA_PADRAO = "123456";
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

function senhaInicial(senhaPlana) {
  return senhaPlana || SENHA_PADRAO;
}

async function hashSenha(senhaPlana) {
  return argon2.hash(senhaInicial(senhaPlana), ARGON2_CONFIG);
}

function verificarSenha(hash, senhaPlana) {
  return argon2.verify(hash, senhaPlana);
}

function senhaTemporaria(dados = {}) {
  return dados.senhaTemporaria === true;
}

module.exports = {
  SENHA_PADRAO,
  hashSenha,
  verificarSenha,
  senhaTemporaria,
};
