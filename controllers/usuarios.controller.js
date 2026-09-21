const usuarioModel = require("../repository/usuarios.repository");
const {
  camposEnviadosEmBranco,
  camposObrigatorios,
  mensagemCamposObrigatorios,
} = require("../lib/validacao");
const { normalizarRole } = require("../lib/normalizacao");
const { SENHA_PADRAO } = require("../lib/senha");

const ROLES_PERMITIDOS = ["ADMIN", "RECEPCIONISTA"];

function removerSenha(usuario) {
  if (!usuario || typeof usuario !== "object") return usuario;
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

function roleValida(role) {
  return ROLES_PERMITIDOS.includes(normalizarRole(role));
}

function idParam(req) {
  return Number(req.params.id);
}

function temTrocaSenha(body = {}) {
  return body.senhaAtual !== undefined || body.novaSenha !== undefined;
}

const listar = async (req, res, next) => {
  try {
    const query = {
      ...req.query,
      role: roleValida(req.query.role) ? normalizarRole(req.query.role) : undefined,
    };
    const usuarios = await usuarioModel.listarTodos(query);
    res.status(200).json(usuarios.map(removerSenha));
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const id = idParam(req);

    if (!id) {
      return res.status(400).json({ erro: "Usuario invalido" });
    }

    const usuario = await usuarioModel.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuario nao encontrado" });
    }

    res.json(removerSenha(usuario));
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const camposFaltando = camposObrigatorios(req.body, [
      "nome",
      "email",
      "senhaPlana",
      "idade",
      "sexo",
      "telefone",
      "cpf",
      "rg",
      "role",
    ]);

    if (camposFaltando.length > 0) {
      return res.status(400).json({ erro: mensagemCamposObrigatorios(camposFaltando) });
    }

    if (!roleValida(req.body.role)) {
      return res.status(400).json({ erro: "Role invalido" });
    }

    const novoUsuario = await usuarioModel.criar({
      ...req.body,
      role: normalizarRole(req.body.role),
      senhaTemporaria: true,
    }, req.usuario?.id);

    res.status(201).json(removerSenha(novoUsuario));
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const id = idParam(req);

    if (!id) {
      return res.status(400).json({ erro: "Usuario invalido" });
    }

    if (temTrocaSenha(req.body)) {
      if (Number(req.usuario?.id) !== id) {
        return res.status(403).json({ erro: "A senha so pode ser alterada pelo proprio usuario" });
      }

      if (!req.body.senhaAtual || !req.body.novaSenha) {
        return res.status(400).json({ erro: "Senha atual e nova senha sao obrigatorias" });
      }

      if (String(req.body.novaSenha).length < 6) {
        return res.status(400).json({ erro: "A nova senha deve ter ao menos 6 caracteres" });
      }

      if (String(req.body.novaSenha) === SENHA_PADRAO) {
        return res.status(400).json({ erro: "Escolha uma senha diferente da senha padrao" });
      }

      const resultado = await usuarioModel.alterarSenha(id, {
        senhaAtual: req.body.senhaAtual,
        novaSenha: req.body.novaSenha,
      }, req.usuario?.id);

      if (resultado.status === "not_found") {
        return res.status(404).json({ erro: "Usuario nao encontrado" });
      }

      if (resultado.status === "invalid_password") {
        return res.status(400).json({ erro: "Senha atual invalida" });
      }

      return res.json(removerSenha(resultado.usuario));
    }

    if (normalizarRole(req.usuario?.role) !== "ADMIN") {
      return res.status(403).json({ erro: "Acesso restrito a administradores" });
    }

    const camposEmBranco = camposEnviadosEmBranco(req.body, [
      "nome",
      "email",
      "idade",
      "sexo",
      "telefone",
      "cpf",
      "rg",
      "role",
    ]);

    if (camposEmBranco.length > 0) {
      return res.status(400).json({ erro: mensagemCamposObrigatorios(camposEmBranco) });
    }

    if (req.body.role !== undefined && !roleValida(req.body.role)) {
      return res.status(400).json({ erro: "Role invalido" });
    }

    const usuarioAtualizado = await usuarioModel.atualizar(id, {
      ...req.body,
      ...(req.body.role !== undefined ? { role: normalizarRole(req.body.role) } : {}),
    }, req.usuario?.id);

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuario nao encontrado" });
    }

    res.json(removerSenha(usuarioAtualizado));
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    const id = idParam(req);

    if (!id) {
      return res.status(400).json({ erro: "Usuario invalido" });
    }

    if (Number(req.usuario?.id) === id) {
      return res.status(400).json({ erro: "Nao e possivel desativar o proprio usuario" });
    }

    const usuarioRemovido = await usuarioModel.remover(id, req.usuario?.id);

    if (!usuarioRemovido) {
      return res.status(404).json({ erro: "Usuario nao encontrado" });
    }

    res.json(removerSenha(usuarioRemovido));
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
  removerSenha,
};
