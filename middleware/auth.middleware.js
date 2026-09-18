const jwt = require("jsonwebtoken");
const prisma = require("../lib/client");

function roleUsuario(req) {
  return String(req.usuario?.role || "").toUpperCase();
}

function idUsuario(req) {
  return Number(req.usuario?.id);
}

function verificarAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token nao informado" });
  }

  const token = authHeader.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ erro: "Token expirado" });
      }

      return res.status(403).json({ erro: "Token invalido" });
    }

    req.usuario = decoded;
    next();
  });
}

function verificarPerfis(...roles) {
  const rolesPermitidos = roles.map((role) => String(role).toUpperCase());

  return (req, res, next) => {
    if (!rolesPermitidos.includes(roleUsuario(req))) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    next();
  };
}

function verificarAdmin(req, res, next) {
  if (roleUsuario(req) !== "ADMIN") {
    return res.status(403).json({ erro: "Acesso restrito a administradores" });
  }

  next();
}

async function bloquearSenhaTemporaria(req, res, next) {
  try {
    const usuarioId = idUsuario(req);

    if (!usuarioId) {
      return res.status(401).json({ erro: "Usuario nao autenticado" });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { senhaTemporaria: true },
    });

    if (!usuario) {
      return res.status(401).json({ erro: "Usuario nao encontrado" });
    }

    if (!usuario.senhaTemporaria) {
      return next();
    }

    const idRotaUsuarios = Number(String(req.path || "").split("/").filter(Boolean)[0]);
    const isTrocaSenhaPropria =
      req.method === "PATCH" &&
      req.baseUrl === "/usuarios" &&
      idRotaUsuarios === usuarioId;

    if (isTrocaSenhaPropria) {
      return next();
    }

    return res.status(403).json({ erro: "Altere sua senha antes de acessar o sistema." });
  } catch (err) {
    next(err);
  }
}

async function verificarPacienteProprio(req, res, next) {
  try {
    if (roleUsuario(req) !== "PACIENTE") {
      return next();
    }

    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Paciente invalido" });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: { usuarioId: true },
    });

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente nao encontrado" });
    }

    if (Number(paciente.usuarioId) !== idUsuario(req)) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    next();
  } catch (err) {
    next(err);
  }
}

async function verificarMedicoProprio(req, res, next) {
  try {
    if (roleUsuario(req) !== "MEDICO") {
      return next();
    }

    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Medico invalido" });
    }

    const medico = await prisma.medico.findUnique({
      where: { id },
      select: { usuarioId: true },
    });

    if (!medico) {
      return res.status(404).json({ erro: "Medico nao encontrado" });
    }

    if (Number(medico.usuarioId) !== idUsuario(req)) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    next();
  } catch (err) {
    next(err);
  }
}

async function verificarAgendamentoMedicoProprio(req, res, next) {
  try {
    if (roleUsuario(req) !== "MEDICO") {
      return next();
    }

    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Agendamento invalido" });
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      select: {
        medico: {
          select: {
            usuarioId: true,
          },
        },
      },
    });

    if (!agendamento) {
      return res.status(404).json({ erro: "Agendamento nao encontrado" });
    }

    if (Number(agendamento.medico?.usuarioId) !== idUsuario(req)) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    next();
  } catch (err) {
    next(err);
  }
}

async function verificarPacienteRelacionadoAoMedico(req, res, next) {
  try {
    if (roleUsuario(req) !== "MEDICO") {
      return next();
    }

    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ erro: "Paciente invalido" });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!paciente) {
      return res.status(404).json({ erro: "Paciente nao encontrado" });
    }

    const [agendamentos, prontuarios] = await Promise.all([
      prisma.agendamento.count({
        where: {
          pacienteId: id,
          medico: {
            usuarioId: idUsuario(req),
          },
        },
      }),
      prisma.prontuario.count({
        where: {
          pacienteId: id,
          medico: {
            usuarioId: idUsuario(req),
          },
        },
      }),
    ]);

    if (agendamentos === 0 && prontuarios === 0) {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verificarAuth,
  bloquearSenhaTemporaria,
  verificarPerfis,
  verificarAdmin,
  verificarPacienteProprio,
  verificarMedicoProprio,
  verificarAgendamentoMedicoProprio,
  verificarPacienteRelacionadoAoMedico,
};
