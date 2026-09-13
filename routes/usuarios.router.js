const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarios.controller");

// GET /usuarios
router.get("/", usuarioController.listar);

// GET /usuarios/:id
router.get("/:id", usuarioController.buscarPorId);

// POST /usuarios
router.post("/", usuarioController.criar);

// PUT /usuarios/:id
router.put("/:id", usuarioController.atualizar);

// PATCH /usuarios/:id
router.patch("/:id", usuarioController.atualizar);

// DELETE /usuarios/:id
router.delete("/:id", usuarioController.remover);

module.exports = router;
