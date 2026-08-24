const jwt = require("jsonwebtoken");

function verificarAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token nao informado" });
  }

  const token = authHeader.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ erro: "Token expirado" });
      }
      
      return res.status(403).json({ erro: "Token inválido" });
    }

    req.usuario = decoded; // dados do usuário disponíveis nas próximas rotas
    next();
  });
}

module.exports = {
  verificarAuth,
};
