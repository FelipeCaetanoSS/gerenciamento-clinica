const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const medicos = [
  { id: 1, medico: 'Maria', crm: 123456, idade: 46, sexo: 'F' },
  { id: 2, medico: 'Miguel', crm: 654321, idade: 49, sexo: 'M' }
];

const pacientes = [
  { id: 1, paciente: 'Ana', idade: 26, sexo: 'F' },
  { id: 2, paciente: 'Carlos', idade: 37, sexo: 'M' },
  { id: 3, paciente: 'Mariana', idade: 29, sexo: 'F' }
];

const agendamentos = [
  { id: 1, paciente: 'Ana', pacienteId: 1, dia: '2026-06-15', horario: '09:00', medicoId: 1 },
  { id: 2, paciente: 'Carlos', pacienteId: 2, dia: '2026-06-15', horario: '10:30', medicoId: 2 },
  { id: 3, paciente: 'Mariana', pacienteId: 3, dia: '2026-06-15', horario: '11:00', medicoId: 1 }
];

app.get('/', (req, res) => {
  res.json({
    projeto: 'Sistema de Gestão',
    descricao: 'API para gerenciar Clinica médica',
    status: 'online'
  });
});

app.get('/medicos', (req, res) => {
  res.json(medicos);
});

app.post('/medicos', (req, res) => {
  const { medico, crm, idade, sexo } = req.body;

  if (!medico || !crm || !idade || !sexo) {
    return res.status(400).json({ erro: 'medico, crm, idade e sexo são obrigatórios' });
  }

  const novoMedico = {
    id: medicos.length + 1,
    medico,
    crm,
    idade,
    sexo
  };

  medicos.push(novoMedico);
  res.status(201).json(novoMedico);
});

app.get('/pacientes', (req, res) => {
  res.json(pacientes);
});

app.post('/pacientes', (req, res) => {
  const { paciente, idade, sexo } = req.body;

  if (!paciente || !idade || !sexo) {
    return res.status(400).json({ erro: 'paciente, idade e sexo são obrigatórios' });
  }

  const novoPaciente = {
    id: pacientes.length + 1,
    paciente,
    idade,
    sexo
  };

  pacientes.push(novoPaciente);
  res.status(201).json(novoPaciente);
});

app.get('/agendamentos', (req, res) => {
  res.json(agendamentos);
});

app.post('/agendamentos', (req, res) => {
  const { paciente, pacienteId, dia, horario, medicoId } = req.body;

  if (!paciente || !pacienteId || !dia || !horario || !medicoId) {
    return res.status(400).json({ erro: 'paciente, pacienteId, dia, horario e medicoId são obrigatórios' });
  }

  const novoAgendamento = {
    id: agendamentos.length + 1,
    paciente,
    pacienteId,
    dia,
    horario,
    medicoId
  };

  agendamentos.push(novoAgendamento);
  res.status(201).json(novoAgendamento);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});