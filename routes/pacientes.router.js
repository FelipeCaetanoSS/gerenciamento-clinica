const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacientes.controller");

// GET /pacientes
router.get("/", pacienteController.listar);

// GET /pacientes/:id
router.get("/:id", pacienteController.buscarPorId);

// POST /pacientes
router.post("/", pacienteController.criar);

// PUT /pacientes/:id
router.put("/:id", pacienteController.atualizar);

// PATCH /pacientes/:id
router.patch("/:id", pacienteController.atualizar);

// DELETE /pacientes/:id
router.delete("/:id", pacienteController.remover);

module.exports = router;
