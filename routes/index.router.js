const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    projeto: "Sistema de Gestão",
    descricao: "API para gerenciar Clínica médica",
    status: "online",
  });
});

module.exports = router