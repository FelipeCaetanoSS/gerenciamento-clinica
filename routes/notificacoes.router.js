const express = require("express");
const router = express.Router();
const notificacoesController = require("../controllers/notificacoes.controller");

// GET /notificacoes
router.get("/", notificacoesController.listar);

// POST /notificacoes
router.post("/nova", notificacoesController.criar);

// PATCH /notificacoes/:id
router.patch("/:id", notificacoesController.visualizarUnica);

// PATCH /notificacoes
router.patch("/visualizar-todas", notificacoesController.visualizarTodas);

// DELETE /notificacoes/:id
router.delete("/:id", notificacoesController.remover);

module.exports = router;