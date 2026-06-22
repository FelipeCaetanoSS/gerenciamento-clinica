const express = require('express');
const router = express.Router();

const pacientes = [
  { id: 1, nome: "Ana", idade: 26, sexo: "F" },
  { id: 2, nome: "Carlos", idade: 37, sexo: "M" },
  { id: 3, nome: "Mariana", idade: 29, sexo: "F" },
];

// GET /pacientes
router.get("/", (req, res) => {
  const { busca, sexo } = req.query;
  let resultado = pacientes;

  if (busca) {
    resultado = resultado.filter((p) => {
      const nomeDoPaciente = p.nome || p.paciente || "";
      return nomeDoPaciente.toLowerCase().includes(busca.toLowerCase());
    });
  }

  if (sexo) {
    resultado = resultado.filter(
      (p) => p.sexo.toUpperCase() === sexo.toUpperCase()
    );
  }

  res.json(resultado);
});

// GET /pacientes/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }

  res.json(paciente);
});

// POST /pacientes
router.post("/", (req, res) => {
  const { paciente, idade, sexo } = req.body;

  if (!paciente || !idade || !sexo) {
    return res.status(400).json({
      erro: "paciente, idade e sexo são obrigatórios",
    });
  }

  const novoPaciente = {
    id: pacientes.length + 1,
    paciente,
    idade,
    sexo,
  };

  pacientes.push(novoPaciente);

  res.status(201).json(novoPaciente);
});

// PUT /pacientes/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }

  const { paciente, idade, sexo } = req.body;

  pacientes[index] = {
    id,
    paciente,
    idade,
    sexo,
  };

  res.json(pacientes[index]);
});

// PATCH /pacientes/:id
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }

  pacientes[index] = {
    ...pacientes[index],
    ...req.body,
  };

  res.json(pacientes[index]);
});

// DELETE /pacientes/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }

  pacientes.splice(index, 1);

  res.status(204).send();
});

module.exports = router;
