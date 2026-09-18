const pacienteModel = require("../repository/pacientes.repository");
const prisma = require("../lib/client");
const { temValor } = require("../lib/validacao");
const { verificarSenha } = require("../lib/senha");
const { normalizarRole } = require("../lib/normalizacao");
const jwt = require("jsonwebtoken");

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
      localnasc,
      estadoCivil,
      tipoSanguineo,
      peso,
      altura,
      alergia,
      medicamento,
      observacao,
    } = req.body;

    if (
      !temValor(nome) ||
      !temValor(idade) ||
      !temValor(senhaPlana) ||
      !temValor(sexo) ||
      !temValor(cpf) ||
      !temValor(email) ||
      !temValor(rg) ||
      !temValor(telefone) ||
      !temValor(role)
    ) {
      return res
        .status(400)
        .json({ erro: "campos em branco ou nao preenchidos sao obrigatorios" });
    }

    if (normalizarRole(role) !== "PACIENTE") {
      return res.status(403).json({ erro: "Cadastro publico permitido apenas para pacientes" });
    }

    const novoPaciente = await pacienteModel.criar({
      nome,
      email,
      senhaPlana,
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
        erro: "Credenciais invalidas",
      });
    }

    if (usuario.ativo === false) {
      return res.status(403).json({ erro: "Usuario inativo" });
    }

    const senhaValida = await verificarSenha(usuario.senha, senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Credenciais invalidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
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
        senhaTemporaria: usuario.senhaTemporaria === true,
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
