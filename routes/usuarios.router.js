const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarios.controller");
const middleware = require("../middleware/auth.middleware");

// GET /usuarios
router.get("/", middleware.verificarAdmin, usuarioController.listar);

// GET /usuarios/:id
router.get("/:id", middleware.verificarAdmin, usuarioController.buscarPorId);

// POST /usuarios
router.post("/", middleware.verificarAdmin, usuarioController.criar);

// PUT /usuarios/:id
router.put("/:id", middleware.verificarAdmin, usuarioController.atualizar);

// PATCH /usuarios/:id
router.patch("/:id", usuarioController.atualizar);

// DELETE /usuarios/:id
router.delete("/:id", middleware.verificarAdmin, usuarioController.remover);

module.exports = router;
