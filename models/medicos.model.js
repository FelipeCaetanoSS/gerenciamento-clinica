const medicos = [
  { id: 1, nome: "Maria", crm: 123456, idade: 46, sexo: "F" },
  { id: 2, nome: "Miguel", crm: 654321, idade: 49, sexo: "M" },
];

let proximoId = 3;

const listarTodos = (filtros) => {
  let resultado = medicos;
  const { busca, sexo } = filtros;

  if (busca) {
    resultado = resultado.filter((m) =>
      (m.nome || "").toLowerCase().includes(busca.toLowerCase()),
    );
  }

  if (sexo) {
    resultado = resultado.filter(
      (m) => m.sexo.toUpperCase() === sexo.toUpperCase(),
    );
  }

  return resultado;
};

const buscarPorId = (id) => {
  return medicos.find((m) => m.id === id);
};

const criar = (dados) => {
  const novoMedico = { id: proximoId++, ...dados };
  medicos.push(novoMedico);
  return novoMedico;
};

const atualizar = (id, dados) => {
  const index = medicos.findIndex((m) => m.id === id);
  if (index === -1) return null;

  medicos[index] = { ...medicos[index], ...dados, id };
  return medicos[index];
};

const remover = (id) => {
  const index = medicos.findIndex((m) => m.id === id);
  if (index === -1) return false;

  medicos.splice(index, 1);
  return true;
};

module.exports = { listarTodos, buscarPorId, criar, atualizar, remover };
