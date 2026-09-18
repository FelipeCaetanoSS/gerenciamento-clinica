const path = require("path");
const fs = require("fs");
const pacienteModel = require("../repository/pacientes.repository");
const { onzeDigitosNumericos } = require("../lib/validacao");

const uploadBaseDir = path.resolve(__dirname, "..", "uploads");

function caminhoUpload(file) {
  if (!file?.path) return null;

  return path.relative(process.cwd(), file.path).replace(/\\/g, "/");
}

function caminhoSeguroUpload(caminhoRelativo) {
  if (!caminhoRelativo) return null;

  const caminhoNormalizado = String(caminhoRelativo).replace(/\\/g, "/");
  const caminhoSemUploads = caminhoNormalizado.startsWith("uploads/")
    ? caminhoNormalizado.slice("uploads/".length)
    : caminhoNormalizado;
  const caminhoAbsoluto = path.resolve(uploadBaseDir, caminhoSemUploads);

  if (caminhoAbsoluto !== uploadBaseDir && !caminhoAbsoluto.startsWith(`${uploadBaseDir}${path.sep}`)) {
    return null;
  }

  return caminhoAbsoluto;
}

const listar = async (req, res, next) => {
  try {
    const filtros = { ...req.query };

    if (req.usuario?.role === "PACIENTE") {
      filtros.usuarioId = Number(req.usuario.id);
    } else if (req.usuario?.role === "MEDICO") {
      filtros.medicoUsuarioId = Number(req.usuario.id);
    }

    const pacientes = await pacienteModel.listarTodos(filtros);
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

const buscarPorCPF = async (req, res, next) => {
  try {
    const cpf = onzeDigitosNumericos(req.params.cpf, "CPF");

    const paciente = await pacienteModel.buscarPorCPF(cpf);

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    res.json(paciente);
  } catch (err) {
    next(err);
  }
};

const listarProntuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Paciente invalido" });
    }

    const registros = await pacienteModel.listarProntuario(id);
    res.json(registros);
  } catch (err) {
    next(err);
  }
};

const criarProntuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Paciente invalido" });
    }

    const registro = await pacienteModel.criarProntuario(id, req.body, req.usuario?.id);

    if (!registro) {
      return res.status(404).json({ erro: "Paciente nao encontrado" });
    }

    res.status(201).json(registro);
  } catch (err) {
    next(err);
  }
};

const adicionarExame = async (req, res, next) => {
  try {
    const pacienteId = Number(req.params.id);
    const prontuarioId = Number(req.params.prontuarioId);

    if (!pacienteId || !prontuarioId) {
      return res.status(400).json({ erro: "Paciente ou prontuario invalido" });
    }

    const resultado = await pacienteModel.adicionarExame(pacienteId, prontuarioId, req.body, req.usuario?.id);

    if (!resultado) {
      return res.status(404).json({ erro: "Paciente ou prontuario nao encontrado" });
    }

    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
};

const baixarReceitaProntuario = async (req, res, next) => {
  try {
    const pacienteId = Number(req.params.id);
    const prontuarioId = Number(req.params.prontuarioId);

    if (!pacienteId || !prontuarioId) {
      return res.status(400).json({ erro: "Paciente ou prontuario invalido" });
    }

    const resultado = await pacienteModel.baixarReceitaProntuario(pacienteId, prontuarioId, req.usuario?.id);

    if (!resultado) {
      return res.status(404).json({ erro: "Paciente ou prontuario nao encontrado" });
    }

    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const adicionarAnexoExame = async (req, res, next) => {
  try {
    const pacienteId = Number(req.params.id);
    const prontuarioId = Number(req.params.prontuarioId);
    const exameId = Number(req.params.exameId);

    if (!pacienteId || !prontuarioId || !exameId) {
      return res.status(400).json({ erro: "Parametros invalidos" });
    }

    const arquivoUrl = caminhoUpload(req.file) || req.body?.imagem || req.body?.imageUrl;

    if (!arquivoUrl) {
      return res.status(400).json({ erro: "Arquivo e obrigatorio" });
    }

    const resultado = await pacienteModel.adicionarAnexoExame(pacienteId, prontuarioId, exameId, arquivoUrl, req.usuario?.id);

    if (!resultado) {
      return res.status(404).json({ erro: "Exame nao encontrado" });
    }

    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const abrirAnexoExame = async (req, res, next) => {
  try {
    const pacienteId = Number(req.params.id);
    const prontuarioId = Number(req.params.prontuarioId);
    const exameId = Number(req.params.exameId);

    if (!pacienteId || !prontuarioId || !exameId) {
      return res.status(400).json({ erro: "Parametros invalidos" });
    }

    const anexo = await pacienteModel.buscarAnexoExame(pacienteId, prontuarioId, exameId);

    if (!anexo) {
      return res.status(404).json({ erro: "Anexo nao encontrado" });
    }

    const caminhoArquivo = caminhoSeguroUpload(anexo.caminho);

    if (!caminhoArquivo || !fs.existsSync(caminhoArquivo)) {
      return res.status(404).json({ erro: "Anexo nao encontrado" });
    }

    res.sendFile(caminhoArquivo);
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
      usuarioAlteracaoId: req.usuario?.id,
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
    const pacienteAtualizado = await pacienteModel.atualizar(id, req.body, req.usuario?.id);

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
    const pacienteRemovido = await pacienteModel.remover(id, req.usuario?.id);

    if (!pacienteRemovido) {
      return res.status(404).json({ erro: "Paciente não encontrado" });
    }

    res.json(pacienteRemovido);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listar,
  buscarPorId,
  buscarPorCPF,
  listarProntuario,
  criarProntuario,
  adicionarExame,
  baixarReceitaProntuario,
  adicionarAnexoExame,
  abrirAnexoExame,
  criar,
  atualizar,
  remover,
};
