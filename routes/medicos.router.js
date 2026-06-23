const express = require("express");
const router = express.Router();
const medicoController = require("../controllers/medicos.controller");

// GET /medicos
router.get("/", medicoController.listar);

// GET /medicos/:id
router.get("/:id", medicoController.buscarPorId);

// POST /medicos
router.post("/", medicoController.criar);

// PUT /medicos/:id
router.put("/:id", medicoController.atualizar);

// PATCH /medicos/:id
router.patch("/:id", medicoController.atualizar);

// DELETE /medicos/:id
router.delete("/:id", medicoController.remover);

module.exports = router;