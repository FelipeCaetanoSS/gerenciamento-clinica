const prisma = require("../lib/client");

const listarTodos = async (filtros) => {
  let resultado = await prisma.paciente;
  const { busca, sexo } = filtros;

  if (busca) {
    resultado = resultado.filter((p) =>
      (p.nome || "").toLowerCase().includes(busca.toLowerCase()),
    );
  }

  if (sexo) {
    resultado = resultado.filter(
      (p) => p.sexo.toUpperCase() === sexo.toUpperCase(),
    );
  }
  return resultado;
};

const criar = async (dados) => {
  const novoUsuario = await prisma.usuario.create({
    data: {  
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        idade: dados.idade,
        sexo: dados.sexo,
        telefone: dados.telefone,
        rg: dados.rg,
        cpf: dados.cpf,
        role: dados.role,
        }
    })
};

const buscarPorId = (id) => {
  return pacientes.find((p) => p.id === id);
};


module.exports = {
  listarTodos,
  buscarPorId,
  criar
};