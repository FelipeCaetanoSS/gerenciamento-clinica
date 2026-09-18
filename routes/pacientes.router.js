const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacientes.controller");
const upload = require("../middleware/upload.middleware");
const {
  verificarPacienteRelacionadoAoMedico,
  verificarPacienteProprio,
  verificarPerfis,
} = require("../middleware/auth.middleware");

// GET /pacientes
router.get("/", verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO", "PACIENTE"), pacienteController.listar);

// GET /pacientes/cpf/:cpf
router.get("/cpf/:cpf", verificarPerfis("ADMIN", "RECEPCIONISTA"), pacienteController.buscarPorCPF);

// GET /pacientes/:id/prontuario
router.get(
  "/:id/prontuario",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO", "PACIENTE"),
  verificarPacienteProprio,
  verificarPacienteRelacionadoAoMedico,
  pacienteController.listarProntuario
);

// POST /pacientes/:id/prontuario
router.post(
  "/:id/prontuario",
  verificarPerfis("ADMIN", "RECEPCIONISTA"),
  pacienteController.criarProntuario
);

// POST /pacientes/:id/prontuario/:prontuarioId/exames
router.post(
  "/:id/prontuario/:prontuarioId/exames",
  verificarPerfis("ADMIN", "RECEPCIONISTA"),
  pacienteController.adicionarExame
);

// POST /pacientes/:id/prontuario/:prontuarioId/receita/download
router.post(
  "/:id/prontuario/:prontuarioId/receita/download",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "MEDICO", "PACIENTE"),
  verificarPacienteProprio,
  verificarPacienteRelacionadoAoMedico,
  pacienteController.baixarReceitaProntuario
);

// POST /pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo
router.post(
  "/:id/prontuario/:prontuarioId/exames/:exameId/anexo",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "PACIENTE"),
  verificarPacienteProprio,
  upload.single("anexo"),
  pacienteController.adicionarAnexoExame
);

// GET /pacientes/:id/prontuario/:prontuarioId/exames/:exameId/anexo/abrir
router.get(
  "/:id/prontuario/:prontuarioId/exames/:exameId/anexo/abrir",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "PACIENTE"),
  verificarPacienteProprio,
  pacienteController.abrirAnexoExame
);

// GET /pacientes/:id
router.get(
  "/:id",
  verificarPerfis("ADMIN", "RECEPCIONISTA", "PACIENTE"),
  verificarPacienteProprio,
  pacienteController.buscarPorId
);

// POST /pacientes
router.post("/", verificarPerfis("ADMIN", "RECEPCIONISTA"), pacienteController.criar);

// POST /pacientes/criar (compatibilidade)
router.post("/criar", verificarPerfis("ADMIN", "RECEPCIONISTA"), pacienteController.criar);

// PUT /pacientes/:id
router.put("/:id", verificarPerfis("ADMIN", "RECEPCIONISTA"), pacienteController.atualizar);

// PATCH /pacientes/:id
router.patch("/:id", verificarPerfis("ADMIN", "RECEPCIONISTA"), pacienteController.atualizar);

// DELETE /pacientes/:id
router.delete("/:id", verificarPerfis("ADMIN"), pacienteController.remover);

module.exports = router;
