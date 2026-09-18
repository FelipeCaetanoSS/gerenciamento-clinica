function normalizarStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function statusCancelado(status) {
  return ["cancelado", "cancelada", "cancelled", "canceled"].includes(normalizarStatus(status));
}

function statusConcluido(status) {
  return ["concluido", "concluida", "concluído", "concluída", "completed", "encerrado", "finalizado"].includes(
    normalizarStatus(status)
  );
}

module.exports = {
  normalizarStatus,
  statusCancelado,
  statusConcluido,
};
