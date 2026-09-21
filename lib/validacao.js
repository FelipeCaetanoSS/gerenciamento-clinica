const {
  numeroSomenteDigitos,
  somenteDigitos,
} = require("./normalizacao");

function temValor(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function camposObrigatorios(dados, campos) {
  const body = dados || {};
  return campos.filter((campo) => !temValor(body[campo]));
}

function camposEnviadosEmBranco(dados, campos) {
  const body = dados || {};
  return campos.filter(
    (campo) => Object.prototype.hasOwnProperty.call(body, campo) && !temValor(body[campo])
  );
}

function formatarLista(campos) {
  if (campos.length <= 1) return campos[0] || "";
  if (campos.length === 2) return `${campos[0]} e ${campos[1]}`;

  return `${campos.slice(0, -1).join(", ")} e ${campos[campos.length - 1]}`;
}

function mensagemCamposObrigatorios(campos) {
  return `${formatarLista(campos)} ${campos.length === 1 ? "e obrigatorio" : "sao obrigatorios"}`;
}

function mensagemCamposInvalidos(campos) {
  return `${formatarLista(campos)} ${campos.length === 1 ? "e invalido" : "sao invalidos"}`;
}

function onzeDigitosNumericos(value, campo) {
  const texto = String(value ?? "").trim();

  if (!/^\d{11}$/.test(texto)) {
    const erro = new Error(`${campo} deve conter exatamente 11 digitos numericos`);
    erro.status = 400;
    throw erro;
  }

  return somenteDigitos(texto);
}

function temDigitosPositivos(value) {
  return numeroSomenteDigitos(value) > 0;
}

function numeroInteiroPositivo(value) {
  if (!temValor(value)) return false;

  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0;
  }

  const texto = String(value).trim();
  return /^\d+$/.test(texto) && Number(texto) > 0;
}

function dataValida(value) {
  if (!temValor(value)) return false;
  if (value instanceof Date) return !Number.isNaN(value.getTime());

  const texto = String(value).trim();
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );
}

function dataHoraValida(value) {
  if (!temValor(value)) return false;

  const data = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(data.getTime());
}

function horarioValido(value) {
  if (!temValor(value)) return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value).trim());
}

function dataEHorarioValidos(dia, horario) {
  return dataValida(dia) && horarioValido(horario);
}

function montarDataHoraLocal(dia, horario) {
  if (!dataEHorarioValidos(dia, horario)) return null;
  return new Date(`${String(dia).trim()}T${String(horario).trim()}:00`);
}

function dataHoraComAntecedenciaMinima(dia, horario, referencia = new Date(), antecedenciaMinutos = 120) {
  const dataHora = montarDataHoraLocal(dia, horario);
  if (!dataHora || Number.isNaN(dataHora.getTime())) return false;

  const limiteMinimo = new Date(referencia.getTime() + antecedenciaMinutos * 60 * 1000);
  return dataHora.getTime() >= limiteMinimo.getTime();
}

module.exports = {
  temValor,
  camposObrigatorios,
  camposEnviadosEmBranco,
  mensagemCamposObrigatorios,
  mensagemCamposInvalidos,
  onzeDigitosNumericos,
  somenteDigitos,
  numeroSomenteDigitos,
  temDigitosPositivos,
  numeroInteiroPositivo,
  dataValida,
  dataHoraValida,
  horarioValido,
  dataEHorarioValidos,
  montarDataHoraLocal,
  dataHoraComAntecedenciaMinima,
};
