const medicoModel = require("../repository/medicos.repository")
const argon2 = require('argon2');

const criar = async (req, res, next) => {
  try {
    const { nome, crm, idade, sexo, senha, telefone, cpf, rg } = req.body;

    if (!nome || !crm || !idade || !sexo || !senha || !cpf || !rg || !telefone) {
      return res
        .status(400)
        .json({ erro: "campos em branco ou não preenchidos são obrigatórios" });
    }
    
  const senhaHash = await argon2.hash(senha, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
    });

    const novoMedico = medicoModel.criar({ nome, crm, idade, sexo, senhaHash, telefone, cpf, rg});

    res.status(201).json(novoMedico);
  } catch (err) {
    next(err);
  }
};
