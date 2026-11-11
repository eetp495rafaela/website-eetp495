import test from "node:test";
import assert from "node:assert/strict";
import {
  obtenerFechaArgentina,
  obtenerClasesPrevistas,
  obtenerCursoGrupo,
  obtenerActividad,
  reemplazoDeClase,
  escaparHtml,
} from "../assets/js/sira-previsiones-core.mjs";

const fecha = obtenerFechaArgentina(new Date("2026-11-11T14:00:00Z"));
const asignacion = {
  estado: "ACTIVO", cicloLectivo: 2026, dia: "MIERCOLES",
  tipoHorario: "TALLER", turno: "MANANA",
  cursoAnio: 1, cursoDivision: "A", cursoNombre: "1° A", grupoTaller: "G1",
  asignacionId: "asignacion-1", cursoId: "curso-1", espacioId: "electricidad",
  docenteCorreo: "docente@escuela.edu.ar", docenteNombre: "Juan Pérez",
  espacioCurricular: "Electricidad", horaInicio: "07:15", horaFin: "10:55",
};

test("la fecha se obtiene en la zona de Argentina y con día semanal correcto", () => {
  assert.deepEqual({dia: fecha.dia, anio: fecha.anio, fechaISO: fecha.fechaISO}, {
    dia: "MIERCOLES", anio: 2026, fechaISO: "2026-11-11",
  });
  assert.equal(obtenerFechaArgentina(new Date("2026-11-12T01:00:00Z")).fechaISO, "2026-11-11");
});

test("solo muestra horarios activos de Taller/EF del día y año vigentes", () => {
  const horarios = [
    asignacion,
    {...asignacion, tipoHorario: "EDUCACION_FISICA", grupoTaller: "", cursoAnio: 3, cursoDivision: "B"},
    {...asignacion, tipoHorario: "AULA"},
    {...asignacion, estado: "INACTIVO"},
    {...asignacion, dia: "JUEVES"},
    {...asignacion, cicloLectivo: 2027},
  ];
  assert.equal(obtenerClasesPrevistas(horarios, fecha).length, 2);
});

test("fin de semana no consulta previsiones", () => {
  const sabado = obtenerFechaArgentina(new Date("2026-11-14T15:00:00Z"));
  assert.equal(obtenerClasesPrevistas([ {...asignacion, dia: "SABADO"} ], sabado).length, 0);
});

test("construye filas de grupo y tipo correctamente", () => {
  assert.equal(obtenerCursoGrupo(asignacion), "1° A G1");
  assert.equal(obtenerActividad(asignacion), "Taller: Electricidad");
  assert.equal(obtenerActividad({...asignacion, tipoHorario: "EDUCACION_FISICA"}), "Educación Física");
});

test("muestra el reemplazo vigente solo para la asignación correspondiente", () => {
  const reemplazos = [{
    asignacionTitularId: "asignacion-1",
    reemplazanteNombre: "Martina López",
    tipoHorario: "TALLER", cicloLectivo: 2026,
    estado: "ACTIVO", fechaDesde: "2026-11-10", fechaHasta: "2026-11-13",
  }];
  assert.equal(reemplazoDeClase(asignacion, reemplazos, fecha)?.reemplazanteNombre, "Martina López");
  assert.equal(reemplazoDeClase({...asignacion, asignacionId: "otro"}, reemplazos, fecha), null);
  assert.equal(reemplazoDeClase(asignacion, reemplazos, {...fecha, fechaISO: "2026-11-20"}), null);
});

test("escapa los textos almacenados antes de mostrarlos en la tabla", () => {
  assert.equal(escaparHtml('<img src="x" onerror="alert(1)">'),
    '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
});
