import test from "node:test";
import assert from "node:assert/strict";
import {
  prepararMigracion,
} from "../assets/js/migracion-ciclo-core.mjs";

function ejemplo() {
  const base = {
    docenteCorreo: "docente@ejemplo.edu.ar",
    cursoId: "curso1",
    espacioId: "espacio1",
    cicloLectivo: 2026,
  };

  return {
    origen: 2026,
    destino: 2027,
    asignaciones: [{
      id: "asignacion1",
      datos: { ...base, estado: "ACTIVA" },
    }],
    horarios: [{
      id: "horario1",
      datos: {
        ...base,
        tipoHorario: "TALLER",
        estado: "ACTIVO",
        asignacionId: "asignacion1",
      },
    }],
  };
}

test("copia asignaciones y horarios al nuevo ciclo", () => {
  const r = prepararMigracion(ejemplo());
  assert.equal(r.asignaciones[0].datos.cicloLectivo, 2027);
  assert.equal(r.horarios[0].datos.cicloLectivo, 2027);
});

test("actualiza la referencia de Taller", () => {
  const r = prepararMigracion(ejemplo());
  assert.equal(
    r.horarios[0].datos.asignacionId,
    r.asignaciones[0].id
  );
});

test("actualiza la referencia de Educación Física", () => {
  const e = ejemplo();
  e.horarios[0].datos.tipoHorario = "EDUCACION_FISICA";
  const r = prepararMigracion(e);
  assert.equal(
    r.horarios[0].datos.asignacionId,
    r.asignaciones[0].id
  );
});

test("respeta la estructura de horarios de Aula", () => {
  const e = ejemplo();
  e.horarios[0].datos.tipoHorario = "AULA";
  delete e.horarios[0].datos.asignacionId;
  const r = prepararMigracion(e);
  assert.equal(r.resumen.aula, 1);
  assert.equal(r.horarios[0].datos.asignacionId, undefined);
});

test("no modifica los datos originales", () => {
  const e = ejemplo();
  const original = structuredClone(e);
  prepararMigracion(e);
  assert.deepEqual(e, original);
});

test("bloquea destino con asignaciones existentes", () => {
  const e = ejemplo();
  e.asignacionesDestino = [{}];
  assert.throws(() => prepararMigracion(e));
});

test("bloquea destino con horarios existentes", () => {
  const e = ejemplo();
  e.horariosDestino = [{}];
  assert.throws(() => prepararMigracion(e));
});

test("bloquea horarios sin asignación válida", () => {
  const e = ejemplo();
  e.horarios[0].datos.asignacionId = "inexistente";
  assert.throws(() => prepararMigracion(e));
});

test("excluye registros inactivos", () => {
  const e = ejemplo();
  e.horarios.push({
    id: "inactivo",
    datos: { ...e.horarios[0].datos, estado: "INACTIVO" },
  });
  assert.equal(prepararMigracion(e).horarios.length, 1);
});

test("rechaza asignaciones duplicadas", () => {
  const e = ejemplo();
  e.asignaciones.push({
    id: "duplicada",
    datos: { ...e.asignaciones[0].datos },
  });
  assert.throws(() => prepararMigracion(e));
});

test("rechaza ciclos no consecutivos", () => {
  const e = ejemplo();
  e.destino = 2029;
  assert.throws(() => prepararMigracion(e));
});

test("permite reutilizar el motor en años posteriores", () => {
  const e = ejemplo();
  e.origen = 2027;
  e.destino = 2028;
  e.asignaciones[0].datos.cicloLectivo = 2027;
  e.horarios[0].datos.cicloLectivo = 2027;
  assert.equal(prepararMigracion(e).destino, 2028);
});
