const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
const indexRoute = require('./routes/index.router');
const agendamentosRoute = require('./routes/agendamentos.router');
const medicosRoute = require('./routes/medicos.router');
const pacientesRoute = require('./routes/pacientes.router');

app.use('/', indexRoute);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});