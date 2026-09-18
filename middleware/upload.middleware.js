const fs = require("fs");
const path = require("path");
const multer = require("multer");
const prisma = require("../lib/client");
const { getUploadBaseDir } = require("../lib/upload-dir");

const uploadBaseDir = getUploadBaseDir();

fs.mkdirSync(uploadBaseDir, { recursive: true });

function erroUpload(message, status = 400) {
  const erro = new Error(message);
  erro.status = status;
  erro.isUploadError = true;
  return erro;
}

function nomeSeguro(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function dadosDoExame(req) {
  const pacienteId = Number(req.params.id);
  const prontuarioId = Number(req.params.prontuarioId);
  const exameId = Number(req.params.exameId);

  if (!pacienteId || !prontuarioId || !exameId) {
    throw erroUpload("Parametros invalidos");
  }

  const exame = await prisma.exame.findUnique({
    where: { id: exameId },
    select: {
      id: true,
      nome: true,
      pacienteId: true,
      prontuarioId: true,
      paciente: {
        select: {
          usuarioId: true,
        },
      },
    },
  });

  if (!exame) {
    throw erroUpload("Exame nao encontrado", 404);
  }

  if (exame.pacienteId !== pacienteId || exame.prontuarioId !== prontuarioId) {
    throw erroUpload("Exame nao encontrado", 404);
  }

  if (!exame.paciente?.usuarioId) {
    throw erroUpload("Paciente sem usuario vinculado", 400);
  }

  return exame;
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const exame = await dadosDoExame(req);
      const pastaUsuario = path.join(uploadBaseDir, String(exame.paciente.usuarioId));

      fs.mkdirSync(pastaUsuario, { recursive: true });
      req.exameUpload = exame;

      cb(null, pastaUsuario);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    const exameId = Number(req.params.exameId);
    const nomeBase = nomeSeguro(req.exameUpload?.nome) || `exame-${exameId}`;

    cb(null, `${nomeBase}${extensao}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
