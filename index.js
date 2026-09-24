require("dotenv").config();
process.env.TZ = "America/Sao_Paulo";

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require('cors'); 
const multer = require("multer");
const { formatarDataHoraClinica, getClinicTimeZone } = require("./lib/timezone");

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
const usuariosRoute = require("./routes/usuarios.router");
const middleware = require("./middleware/auth.middleware");
const rotaProtegida = [middleware.verificarAuth, middleware.bloquearSenhaTemporaria];

app.use("/", indexRoute);
app.use("/auth", authRoute);
app.get("/saude", (req, res) => {
  const agora = new Date();
  const timezone = getClinicTimeZone();

  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: agora.toISOString(),
    timezone,
    timezoneProcesso: process.env.TZ,
    horarioBrasilia: formatarDataHoraClinica(agora),
  });
});
app.use("/agendamentos", rotaProtegida, agendamentosRoute);
app.use("/medicos", rotaProtegida, medicosRoute);
app.use("/pacientes", rotaProtegida, pacientesRoute);
app.use("/notificacoes", rotaProtegida, notificacoesRoute);
app.use("/usuarios", rotaProtegida, usuariosRoute);
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.isUploadError) {
    const mensagem =
      err.code === "LIMIT_FILE_SIZE"
        ? "Arquivo muito grande. O limite e 5MB."
        : err.message;

    return res.status(err.status || 400).json({ erro: mensagem });
  }

  if (process.env.NODE_ENV !== "production") {
    const horario = formatarDataHoraClinica(new Date());
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
