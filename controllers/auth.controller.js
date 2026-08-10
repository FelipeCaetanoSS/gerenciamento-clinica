const { medico } = require("../lib/client");
const medicoModel = require("../repository/medicos.repository");
const pacienteModel = require("../repository/pacientes.repository");
const usuarioModel = require("../repository/usuarios.repository");
const prisma = require("../lib/client");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const registrar = async (req, res, next) =>{
  const argon2 = require('argon2');
    const { 
      // Dados específicos do ADMIN ou RECEPCIONISTA
      nome, email, senhaPlana, idade, sexo, telefone, cpf, rg, role,
      // Dados específicos do MÉDICO
      crm,
      // Dados específicos do PACIENTE
      localnasc, estadoCivil, tipoSanguineo, peso, altura, alergia, medicamento, observacao
    } = req.body;

    const senha = await argon2.hash(senhaPlana, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
      });
    
  switch (role) {
    case 'ADMIN':
      try{
        if (!nome || !idade || !senhaPlana || !sexo || !cpf || !email || !rg || !telefone || !role) {
          return res
            .status(400)
            .json({ erro: "campos em branco ou não preenchidos são obrigatórios"});
          }
        const novoUsuario = usuarioModel.criar({ nome, email, senha, idade, sexo, telefone, cpf, rg, role});
        res.status(201).json(novoUsuario);

        } catch (err) {
          next(err);
        }
      
      break;

    case 'RECEPCIONISTA':
      if (!nome || !idade || !senhaPlana || !sexo || !cpf || !email || !rg || !telefone || !role) {
          return res
            .status(400)
            .json({ erro: "campos em branco ou não preenchidos são obrigatórios" });
          }
        const novaRecepcionista = usuarioModel.criar({ nome, email, senha, idade, sexo, telefone, cpf, rg, role});
        res.status(201).json(novaRecepcionista);
      break;

    case 'MEDICO':
      if (!nome || !idade || senhaPlana || !sexo || !cpf || !email ||  !rg || !crm || !telefone || !role) {
          return res
            .status(400)
            .json({ erro: "campos em branco ou não preenchidos são obrigatórios" });
          }
        const novoMedico = medicoModel.criar({ nome, email, senha, idade, sexo, telefone, cpf, rg, crm, role});
        res.status(201).json(novoMedico);
      break;

    case 'PACIENTE':
      if (!nome || !idade || senhaPlana || !sexo || !cpf || !email ||  !rg ||  !telefone || !role || !localnasc||  !estadoCivil||  !tipoSanguineo||  !peso||  !altura||  !alergia||  !medicamento) {
          return res
            .status(400)
            .json({ erro: "campos em branco ou não preenchidos são obrigatórios" });
        }
        const novoPaciente = pacienteModel.criar({ nome, email, senha, idade, sexo, telefone, cpf, rg, role, localnasc, estadoCivil, tipoSanguineo, peso, altura, alergia, medicamento, observacao});
        res.status(201).json(novoPaciente);
      break;

    default:
      return res.status(400).json({
        erro: 'Role inválido'
      });
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

    const senhaValida = await argon2.verify(
      usuario.senha,
      senha
    );

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      token,
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  registrar,
  login,
};