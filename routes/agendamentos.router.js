const express = require('express');
const router = express.Router();

const agendamentos = [
  { id: 1, pacienteId: 1, medicoId: 1, dia: "2026-06-15", horario: "09:00" },
  { id: 2, pacienteId: 2, medicoId: 2, dia: "2026-06-15", horario: "10:30" },
  { id: 3, pacienteId: 3, medicoId: 1, dia: "2026-06-15", horario: "11:00" },
];

// GET /agendamentos
router.get("/", (req, res) => {
  const { dia, medicoId } = req.query;
  let resultado = agendamentos;

  if (dia) {
    resultado = resultado.filter((a) =>
      a.dia.toLowerCase().includes(dia.toLowerCase())
    );
  }

  if (medicoId) {
    resultado = resultado.filter(
      (a) => a.medicoId === Number(medicoId)
    );
  }

  res.json(resultado);
});

// GET /agendamentos/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  const agendamento = agendamentos.find((a) => a.id === id);

  if (!agendamento) {
    return res.status(404).json({
      erro: "Agendamento não encontrado",
    });
  }

  res.json(agendamento);
});

// POST /agendamentos
router.post("/", (req, res) => {
  const {
    paciente,
    pacienteId,
    dia,
    horario,
    medicoId,
  } = req.body;

  if (
    !paciente ||
    !pacienteId ||
    !dia ||
    !horario ||
    !medicoId
  ) {
    return res.status(400).json({
      erro:
        "paciente, pacienteId, dia, horario e medicoId são obrigatórios",
    });
  }

  const novoAgendamento = {
    id: agendamentos.length + 1,
    paciente,
    pacienteId,
    dia,
    horario,
    medicoId,
  };

  agendamentos.push(novoAgendamento);

  res.status(201).json(novoAgendamento);
});

// PUT /agendamentos/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = agendamentos.findIndex(
    (a) => a.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      erro: "Agendamento não encontrado",
    });
  }

  const {
    paciente,
    pacienteId,
    dia,
    horario,
    medicoId,
  } = req.body;

  agendamentos[index] = {
    id,
    paciente,
    pacienteId,
    dia,
    horario,
    medicoId,
  };

  res.json(agendamentos[index]);
});

// PATCH /agendamentos/:id
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = agendamentos.findIndex(
    (a) => a.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      erro: "Agendamento não encontrado",
    });
  }

  agendamentos[index] = {
    ...agendamentos[index],
    ...req.body,
  };

  res.json(agendamentos[index]);
});

// DELETE /agendamentos/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = agendamentos.findIndex(
    (a) => a.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      erro: "Agendamento não encontrado",
    });
  }

  agendamentos.splice(index, 1);

  res.status(204).send();
});

module.exports = router;