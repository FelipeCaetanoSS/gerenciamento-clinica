const auth = require("../controllers/auth.controller");
const express = require("express");
const router = express.Router();

router.post("/registrar", auth.registrar);

router.post("/login", auth.login);

module.exports = router;