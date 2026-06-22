const express = require('express');
const router = express.Router();

const medicos = [
  { id: 1, nome: "Maria", crm: 123456, idade: 46, sexo: "F" },
  { id: 2, nome: "Miguel", crm: 654321, idade: 49, sexo: "M" },
];

// GET /medicos
router.get("/", (req, res) => {
  const { busca, sexo } = req.query;
  let resultado = medicos;

  if (busca) {
    resultado = resultado.filter((m) =>
      (m.nome || "").toLowerCase().includes(busca.toLowerCase())
    );
  }

  if (sexo) {
    resultado = resultado.filter(
      (m) => m.sexo.toUpperCase() === sexo.toUpperCase()
    );
  }

  res.json(resultado);
});

// GET /medicos/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const medico = medicos.find((m) => m.id === id);

  if (!medico) {
    return res.status(404).json({ erro: "Médico não encontrado" });
  }

  res.json(medico);
});

// POST /medicos
router.post("/", (req, res) => {
  const { medico, crm, idade, sexo } = req.body;

  if (!medico || !crm || !idade || !sexo) {
    return res.status(400).json({
      erro: "medico, crm, idade e sexo são obrigatórios",
    });
  }

  const novoMedico = {
    id: medicos.length + 1,
    medico,
    crm,
    idade,
    sexo,
  };

  medicos.push(novoMedico);

  res.status(201).json(novoMedico);
});

// PUT /medicos/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = medicos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Medico não encontrado" });
  }

  const { medico, crm, idade, sexo } = req.body;

  medicos[index] = { id, medico, crm, idade, sexo };

  res.json(medicos[index]);
});

// PATCH /medicos/:id
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = medicos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Medico não encontrado" });
  }

  medicos[index] = {
    ...medicos[index],
    ...req.body,
  };

  res.json(medicos[index]);
});

// DELETE /medicos/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = medicos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Medico não encontrado" });
  }

  medicos.splice(index, 1);

  res.status(204).send();
});

module.exports = router;