const express = require("express");
const router = express.Router();
const agendamentoController = require("../controllers/agendamentos.controller");
const {
  verificarAgendamentoMedicoProprio,
  verificarPerfis,
} = require("../middleware/auth.middleware");

// GET /agendamentos
router.get(
  "/",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO", "PACIENTE"),
  agendamentoController.listar
);

// GET /agendamentos/:id
router.get(
  "/:id",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO"),
  verificarAgendamentoMedicoProprio,
  agendamentoController.buscarPorId
);

// POST /agendamentos
router.post("/", verificarPerfis("ADMIN", "RECEPCIONISTA"), agendamentoController.criar);

// POST /agendamentos/novo (compatibilidade)
router.post("/novo", verificarPerfis("ADMIN", "RECEPCIONISTA"), agendamentoController.criar);

// POST /agendamentos/:id/finalizar
router.post(
  "/:id/finalizar",
  verificarPerfis("ADMIN", "RECEPCIONISTA"),
  agendamentoController.finalizar
);

// PUT /agendamentos/:id
router.put("/:id", verificarPerfis("ADMIN", "RECEPCIONISTA"), agendamentoController.atualizar);

// PATCH /agendamentos/:id
router.patch("/:id", verificarPerfis("ADMIN", "RECEPCIONISTA"), agendamentoController.atualizar);

// DELETE /agendamentos/:id
router.delete("/:id", verificarPerfis("ADMIN", "RECEPCIONISTA"), agendamentoController.remover);

module.exports = router;
