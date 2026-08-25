require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Routes
const indexRoute = require("./routes/index.router");
const agendamentosRoute = require("./routes/agendamentos.router");
const medicosRoute = require("./routes/medicos.router");
const pacientesRoute = require("./routes/pacientes.router");
const authRoute = require("./routes/auth.router");
const notificacoesRoute = require("./routes/notificacoes.router");
const middleware = require("./middleware/auth.middleware");

app.use("/", indexRoute);
app.use("/auth", authRoute);
app.use(middleware.verificarAuth);
app.use("/agendamentos", agendamentosRoute);
app.use("/medicos", medicosRoute);
app.use("/pacientes", pacientesRoute);
app.use("/notificacoes", notificacoesRoute);
app.get("/saude", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    const horario = new Date().toLocaleTimeString("pt-BR");
    console.log(`[${horario}] ${req.method} ${req.path}`);
  } else {
    console.error(`[ERRO] ${err.message || "Erro interno"}`);
  }

  const status = err.status || 500;

  const mensagem =
    process.env.NODE_ENV !== "production"
      ? err.message || "Erro interno do servidor"
      : "Ocorreu um erro interno no servidor.";

  res.status(status).json({ erro: mensagem });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
