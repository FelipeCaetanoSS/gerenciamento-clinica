const DEFAULT_CLINIC_TIME_ZONE = "America/Sao_Paulo";

function getClinicTimeZone() {
  return DEFAULT_CLINIC_TIME_ZONE;
}

function getDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function partsInTimeZone(date, timeZone = getClinicTimeZone()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = {};

  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function timeZoneOffsetMs(date, timeZone = getClinicTimeZone()) {
  const parts = partsInTimeZone(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return localAsUtc - date.getTime();
}

function parseDia(dia) {
  const match = String(dia || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function addDias(dia, quantidade) {
  const parsed = parseDia(dia);
  if (!parsed) return "";

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + quantidade));
  return date.toISOString().slice(0, 10);
}

function montarDataHoraClinica(dia, horario, timeZone = getClinicTimeZone()) {
  const parsedDia = parseDia(dia);
  const horarioMatch = String(horario || "").trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!parsedDia || !horarioMatch) return null;

  const utcGuess = new Date(Date.UTC(
    parsedDia.year,
    parsedDia.month - 1,
    parsedDia.day,
    Number(horarioMatch[1]),
    Number(horarioMatch[2]),
    0,
    0
  ));
  const firstOffset = timeZoneOffsetMs(utcGuess, timeZone);
  const firstDate = new Date(utcGuess.getTime() - firstOffset);
  const finalOffset = timeZoneOffsetMs(firstDate, timeZone);

  if (finalOffset !== firstOffset) {
    return new Date(utcGuess.getTime() - finalOffset);
  }

  return firstDate;
}

function intervaloDiaClinica(dia, timeZone = getClinicTimeZone()) {
  const inicio = montarDataHoraClinica(dia, "00:00", timeZone);
  const proximoDia = addDias(dia, 1);
  const proximoInicio = montarDataHoraClinica(proximoDia, "00:00", timeZone);

  if (!inicio || !proximoInicio) return null;

  return {
    inicio,
    fim: new Date(proximoInicio.getTime() - 1),
    proximoInicio,
  };
}

function dataParaPartesClinica(date, timeZone = getClinicTimeZone()) {
  const data = getDate(date);
  if (!data) {
    return { dia: "", horario: "" };
  }

  const parts = partsInTimeZone(data, timeZone);

  return {
    dia: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`,
    horario: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
  };
}

function formatarDataHoraClinica(date, timeZone = getClinicTimeZone()) {
  const data = getDate(date);
  if (!data) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function hojeClinica(referencia = new Date(), timeZone = getClinicTimeZone()) {
  return dataParaPartesClinica(referencia, timeZone).dia;
}

function adicionarDiasClinica(referencia = new Date(), quantidade = 0, timeZone = getClinicTimeZone()) {
  const diaBase = typeof referencia === "string" && parseDia(referencia)
    ? referencia
    : hojeClinica(referencia, timeZone);

  return addDias(diaBase, quantidade);
}

function adicionarDiaHorarioClinica(registro, campo = "data", timeZone = getClinicTimeZone()) {
  if (!registro || typeof registro !== "object") return registro;

  const partes = dataParaPartesClinica(registro[campo], timeZone);
  return {
    ...registro,
    dia: partes.dia,
    horario: partes.horario,
  };
}

module.exports = {
  DEFAULT_CLINIC_TIME_ZONE,
  getClinicTimeZone,
  hojeClinica,
  adicionarDiasClinica,
  montarDataHoraClinica,
  intervaloDiaClinica,
  dataParaPartesClinica,
  formatarDataHoraClinica,
  adicionarDiaHorarioClinica,
};
