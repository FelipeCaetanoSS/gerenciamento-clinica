function texto(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function textoOuNull(value) {
  const valor = texto(value);
  return valor ? valor : null;
}

function somenteDigitos(value) {
  return String(value || "").replace(/\D/g, "");
}

function numeroSomenteDigitos(value) {
  const digitos = somenteDigitos(value);
  return digitos ? Number(digitos) : 0;
}

function temDigitos(value) {
  return somenteDigitos(value).length > 0;
}

function booleano(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "sim", "s", "lida", "visualizada"].includes(value.toLowerCase());
  }

  return Boolean(value);
}

function normalizarRole(role) {
  return texto(role).toUpperCase();
}

function dataOuNull(value) {
  if (value === undefined || value === null || value === "") return null;

  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? null : data;
}

module.exports = {
  texto,
  textoOuNull,
  somenteDigitos,
  numeroSomenteDigitos,
  temDigitos,
  booleano,
  normalizarRole,
  dataOuNull,
};
