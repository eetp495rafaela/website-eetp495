import test from "node:test";
import assert from "node:assert/strict";

import {
  crearEstadoMigracion,
  validarRecuperacion,
  completarMigracion,
} from "../assets/js/migracion-ciclo-estado.mjs";

const datos = {
  origen: 2026,
  destino: 2027,
  huella: "a".repeat(64),
  total: 1095,
};

const crear = () => crearEstadoMigracion(datos);

test("crea el registro de migración", () => {
  const estado = crear();
  assert.equal(estado.estado, "EN_PROCESO");
  assert.equal(estado.total, 1095);
});

test("genera un identificador determinista", () => {
  assert.equal(crear().migracionId, crear().migracionId);
});

test("rechaza ciclos no consecutivos", () => {
  assert.throws(() => crearEstadoMigracion({
    ...datos,
    destino: 2028,
  }));
});

test("rechaza una huella inválida", () => {
  assert.throws(() => crearEstadoMigracion({
    ...datos,
    huella: "incorrecta",
  }));
});

test("rechaza una migración vacía", () => {
  assert.throws(() => crearEstadoMigracion({
    ...datos,
    total: 0,
  }));
});

test("permite recuperar la misma migración", () => {
  assert.equal(validarRecuperacion(crear(), crear()), true);
});

test("rechaza cambios en el plan original", () => {
  const otro = crearEstadoMigracion({
    ...datos,
    huella: "b".repeat(64),
  });

  assert.throws(() => validarRecuperacion(crear(), otro));
});

test("rechaza cambios en la cantidad de documentos", () => {
  assert.throws(() => validarRecuperacion(
    { ...crear(), total: 1094 },
    crear()
  ));
});

test("rechaza una migración sin registro", () => {
  assert.throws(() => validarRecuperacion(null, crear()));
});

test("no completa una migración parcial", () => {
  assert.throws(() => completarMigracion(crear(), 1094));
});

test("completa una migración totalmente verificada", () => {
  const estado = completarMigracion(crear(), 1095);
  assert.equal(estado.estado, "PREPARADO");
});

test("no reanuda una migración ya preparada", () => {
  const estado = completarMigracion(crear(), 1095);
  assert.throws(() => validarRecuperacion(estado, crear()));
});

test("completar no modifica el estado original", () => {
  const estado = crear();
  completarMigracion(estado, 1095);
  assert.equal(estado.estado, "EN_PROCESO");
});
