const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.json({
        projeto: 'Sistema de Gestão',
        descricao: 'API para gerenciar Clinica médica',
        status: 'online'
    })
});

app.get('/medicos', (req, res) => {
  res.json([
    { id: 1, medico: 'Maria', crm: 123456 },
    { id: 2, medico: 'Miguel', crm: 654321 }
  ])
})

app.get('/pacientes', (req, res) => {
  res.json([
    { id: 1, paciente: 'Ana', idade: 26, sexo: "F" },
    { id: 2, paciente: 'Carlos', idade: 37, sexo: "M" }
  ])
})

app.get('/agendamentos', (req, res) => {
  res.json([
    { id: 1, paciente: 'Ana', horario: '09:00' },
    { id: 2, paciente: 'Carlos', horario: '10:30' }
  ])
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})