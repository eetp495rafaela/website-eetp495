/*
 * E.E.T.P. N° 495 · Integración 39
 * Cálculo puro, sin Firebase y sin escrituras. Horarios Si.R.A. previstos hoy.
 */

const DIAS = {
  MONDAY: "LUNES",
  TUESDAY: "MARTES",
  WEDNESDAY: "MIERCOLES",
  THURSDAY: "JUEVES",
  FRIDAY: "VIERNES",
  SATURDAY: "SABADO",
  SUNDAY: "DOMINGO",
};

const ZONA = "America/Argentina/Buenos_Aires";

export function normalizar(valor) {
  return String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function obtenerFechaArgentina(instante = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
    })
      .formatToParts(instante)
      .map(({ type, value }) => [type, value]),
  );
  const fechaISO = `${partes.year}-${partes.month}-${partes.day}`;
  const rotulo = new Intl.DateTimeFormat("es-AR", {
    timeZone: ZONA,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(instante);
  return {
    fechaISO,
    anio: Number(partes.year),
    dia: DIAS[normalizar(partes.weekday)] || "",
    rotulo: rotulo.charAt(0).toLocaleUpperCase("es-AR") + rotulo.slice(1),
  };
}

export function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function obtenerClasesPrevistas(horarios, fecha) {
  if (!fecha || !["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"].includes(fecha.dia)) {
    return [];
  }

  return horarios
    .filter((dato) => {
      const tipo = normalizar(dato.tipoHorario);
      return (
        normalizar(dato.estado) === "ACTIVO" &&
        (tipo === "TALLER" || tipo === "EDUCACION_FISICA") &&
        normalizar(dato.dia) === fecha.dia &&
        Number(dato.cicloLectivo) === fecha.anio &&
        ["MANANA", "TARDE"].includes(normalizar(dato.turno))
      );
    })
    .map((dato) => ({ ...dato }))
    .sort((a, b) => {
      const turnoA = normalizar(a.turno) === "MANANA" ? 0 : 1;
      const turnoB = normalizar(b.turno) === "MANANA" ? 0 : 1;
      if (turnoA !== turnoB) return turnoA - turnoB;
      const anio = Number(a.cursoAnio || 0) - Number(b.cursoAnio || 0);
      if (anio) return anio;
      const division = String(a.cursoDivision || "").localeCompare(
        String(b.cursoDivision || ""),
        "es-AR",
        { numeric: true },
      );
      if (division) return division;
      const grupo = String(a.grupoTaller || "").localeCompare(
        String(b.grupoTaller || ""),
        "es-AR",
        { numeric: true },
      );
      if (grupo) return grupo;
      return String(a.horaInicio || "").localeCompare(String(b.horaInicio || ""));
    });
}

export function reemplazoDeClase(clase, reemplazos, fecha) {
  const asignacion = String(clase.asignacionId || "").trim();
  return reemplazos.find((r) => {
    if (normalizar(r.estado) !== "ACTIVO") return false;
    if (normalizar(r.tipoHorario) !== normalizar(clase.tipoHorario)) return false;
    if (Number(r.cicloLectivo || Number(String(r.fechaDesde || "").slice(0, 4))) !== fecha.anio) return false;
    if (!r.fechaDesde || !r.fechaHasta || fecha.fechaISO < r.fechaDesde || fecha.fechaISO > r.fechaHasta) return false;
    const asignacionReemplazo = String(r.asignacionTitularId || "").trim();
    if (asignacion && asignacionReemplazo) return asignacion === asignacionReemplazo;
    return (
      !!clase.cursoId &&
      !!clase.espacioId &&
      normalizar(clase.docenteCorreo) === normalizar(r.titularCorreo) &&
      String(clase.cursoId) === String(r.cursoId) &&
      String(clase.espacioId) === String(r.espacioId)
    );
  }) || null;
}

export function obtenerCursoGrupo(clase) {
  const nombre = String(clase.cursoNombre || "").trim() ||
    `${String(clase.cursoAnio || "").trim()}° ${String(clase.cursoDivision || "").trim()}`.trim();
  const grupo = String(clase.grupoTaller || "").trim();
  return grupo ? `${nombre} ${/^G\d+$/i.test(grupo) ? grupo.toUpperCase() : grupo}` : nombre;
}

export function obtenerActividad(clase) {
  if (normalizar(clase.tipoHorario) === "EDUCACION_FISICA") return "Educación Física";
  const espacio = String(clase.espacioCurricular || "").trim();
  if (!espacio) return "Taller";
  return /^taller\b/i.test(espacio) ? espacio : `Taller: ${espacio}`;
}

export function obtenerHorario(clase) {
  const inicio = String(clase.horaInicio || "").trim();
  const fin = String(clase.horaFin || "").trim();
  return inicio && fin ? `${inicio} a ${fin}` : String(clase.horarioTexto || "").trim() || "—";
}
