const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const medicos = [
  { id: 1, nome: "Maria", crm: 123456, idade: 46, sexo: "F" },
  { id: 2, nome: "Miguel", crm: 654321, idade: 49, sexo: "M" },
];

const pacientes = [
  { id: 1, nome: "Ana", idade: 26, sexo: "F" },
  { id: 2, nome: "Carlos", idade: 37, sexo: "M" },
  { id: 3, nome: "Mariana", idade: 29, sexo: "F" },
];

const agendamentos = [
  { id: 1, pacienteId: 1, medicoId: 1, dia: "2026-06-15", horario: "09:00" },
  { id: 2, pacienteId: 2, medicoId: 2, dia: "2026-06-15", horario: "10:30" },
  { id: 3, pacienteId: 3, medicoId: 1, dia: "2026-06-15", horario: "11:00" },
];

app.get("/", (req, res) => {
  res.json({
    projeto: "Sistema de Gestão",
    descricao: "API para gerenciar Clinica médica",
    status: "online",
  });
});

// medicos

app.get("/medicos", (req, res) => {
  res.json(medicos);
});

app.get("/medicos/:id", (req, res) => {
  const id = Number(req.params.id);
  const medico = medicos.find((m) => m.id === id);

  if (!medico) {
    return res.status(404).json({ erro: "Médico não encontrado" });
  }

  res.json(medico);
});

app.post("/medicos", (req, res) => {
  const { medico, crm, idade, sexo } = req.body;

  if (!medico || !crm || !idade || !sexo) {
    return res
      .status(400)
      .json({ erro: "medico, crm, idade e sexo são obrigatórios" });
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

app.put("/medicos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = medicos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Medico não encontrado" });
  }

  const { medico, crm, idade, sexo } = req.body;

  medicos[index] = { id, medico, crm, idade, sexo };
  res.json(medicos[index]);
});

app.delete("/medicos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = medicos.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Medico não encontrado" });
  }

  medicos.splice(index, 1);
  res.status(204).send();
});

// Pacientes

app.get("/pacientes", (req, res) => {
  res.json(pacientes);
});

app.get("/pacientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return res.status(404).json({ erro: "Paciente não encontrado" });
  }

  res.json(paciente);
});

app.post("/pacientes", (req, res) => {
  const { paciente, idade, sexo } = req.body;

  if (!paciente || !idade || !sexo) {
    return res
      .status(400)
      .json({ erro: "paciente, idade e sexo são obrigatórios" });
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

app.put("/pacientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Paciente não encontrado" });
  }

  const { paciente, idade, sexo } = req.body;

  pacientes[index] = { id, paciente, idade, sexo };
  res.json(pacientes[index]);
});

app.delete("/pacientes/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Paciente não encontrado" });
  }

  pacientes.splice(index, 1);
  res.status(204).send();
});

// Agendamentos

app.get("/agendamentos", (req, res) => {
  res.json(agendamentos);
});

app.get("/agendamentos/:id", (req, res) => {
  const id = Number(req.params.id);
  const agendamento = agendamentos.find((a) => a.id === id);

  if (!agendamento) {
    return res.status(404).json({ erro: "Agendamento não encontrado" });
  }

  res.json(agendamento);
});

app.post("/agendamentos", (req, res) => {
  const { paciente, pacienteId, dia, horario, medicoId } = req.body;

  if (!paciente || !pacienteId || !dia || !horario || !medicoId) {
    return res
      .status(400)
      .json({
        erro: "paciente, pacienteId, dia, horario e medicoId são obrigatórios",
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

app.put("/agendamentos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = agendamentos.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Agendamento não encontrado" });
  }

  const { paciente, pacienteId, dia, horario, medicoId } = req.body;

  agendamentos[index] = { id, paciente, pacienteId, dia, horario, medicoId };
  res.json(agendamentos[index]);
});

app.delete("/agendamentos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = agendamentos.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Agendamento não encontrado" });
  }

  agendamentos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
