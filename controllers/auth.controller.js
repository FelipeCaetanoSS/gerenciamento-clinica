const medicoModel = require("../repository/medicos.repository");
const pacienteModel = require("../repository/pacientes.repository");
const usuarioModel = require("../repository/usuarios.repository");
const prisma = require("../lib/client");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

async function gerarHashSenha(senhaPlana) {
  return argon2.hash(senhaPlana, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
}

const registrar = async (req, res, next) => {
  try {
    const {
      nome,
      email,
      senhaPlana,
      idade,
      sexo,
      telefone,
      cpf,
      rg,
      role,
      crm,
      localnasc,
      estadoCivil,
      tipoSanguineo,
      peso,
      altura,
      alergia,
      medicamento,
      observacao,
    } = req.body;

    if (!nome || !idade || !senhaPlana || !sexo || !cpf || !email || !rg || !telefone || !role) {
      return res
        .status(400)
        .json({ erro: "campos em branco ou não preenchidos são obrigatórios" });
    }

    const senha = await gerarHashSenha(senhaPlana);

    switch (role) {
      case "ADMIN":
      case "RECEPCIONISTA": {
        const novoUsuario = await usuarioModel.criar({
          nome,
          email,
          senha,
          idade,
          sexo,
          telefone,
          cpf,
          rg,
          role,
        });

        return res.status(201).json(novoUsuario);
      }

      case "MEDICO": {
        if (!crm) {
          return res.status(400).json({ erro: "crm é obrigatório para medicos" });
        }

        const novoMedico = await medicoModel.criar({
          nome,
          email,
          senha,
          idade,
          sexo,
          telefone,
          cpf,
          rg,
          crm,
        });

        return res.status(201).json(novoMedico);
      }

      case "PACIENTE": {
        const novoPaciente = await pacienteModel.criar({
          nome,
          email,
          senha,
          idade,
          sexo,
          telefone,
          cpf,
          rg,
          localnasc,
          estadoCivil,
          tipoSanguineo,
          peso,
          altura,
          alergia,
          medicamento,
          observacao,
        });

        return res.status(201).json(novoPaciente);
      }

      default:
        return res.status(400).json({ erro: "Role inválido" });
    }
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Credenciais inválidas",
      });
    }

    const senhaValida = await argon2.verify(usuario.senha, senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrar,
  login,
};
