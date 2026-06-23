const express = require("express");
const router = express.Router();
const agendamentoController = require("../controllers/agendamentos.controller");

// GET /agendamentos
router.get("/", agendamentoController.listar);

// GET /agendamentos/:id
router.get("/:id", agendamentoController.buscarPorId);

// POST /agendamentos
router.post("/", agendamentoController.criar);

// PUT /agendamentos/:id
router.put("/:id", agendamentoController.atualizar);

// PATCH /agendamentos/:id
router.patch("/:id", agendamentoController.atualizar);

// DELETE /agendamentos/:id
router.delete("/:id", agendamentoController.remover);

module.exports = router;
