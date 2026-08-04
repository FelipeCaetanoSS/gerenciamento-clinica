const medico = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/registrarMedico", medico.criar);

module.exports = router;