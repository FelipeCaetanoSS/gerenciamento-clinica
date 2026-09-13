const express = require("express");
const router = express.Router();
const medicoController = require("../controllers/medicos.controller");
const {
  verificarMedicoProprio,
  verificarPerfis,
} = require("../middleware/auth.middleware");

// GET /medicos
router.get(
  "/",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO"),
  medicoController.listar
);

// GET /medicos/:id
router.get(
  "/:id",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO"),
  verificarMedicoProprio,
  medicoController.buscarPorId
);

// POST /medicos
router.post("/novo", verificarPerfis("ADMIN"), medicoController.criar);

// PUT /medicos/:id
router.put("/:id", verificarPerfis("ADMIN"), medicoController.atualizar);

// PATCH /medicos/:id
router.patch("/:id", verificarPerfis("ADMIN"), medicoController.atualizar);

// DELETE /medicos/:id
router.delete("/:id", verificarPerfis("ADMIN"), medicoController.remover);

module.exports = router;
