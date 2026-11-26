import test from "node:test";
import assert from "node:assert/strict";

import {
  validarCicloLectivo,
  obtenerCicloSiguiente,
  interpretarConfiguracion,
} from "../assets/js/ciclo-lectivo-core.mjs";

test("acepta el ciclo vigente 2026", () => {
  assert.equal(validarCicloLectivo(2026), 2026);
});

test("acepta el nuevo ciclo 2027", () => {
  assert.equal(validarCicloLectivo(2027), 2027);
});

test("calcula el siguiente ciclo", () => {
  assert.equal(obtenerCicloSiguiente(2026), 2027);
});

test("permite reutilizarlo en años posteriores", () => {
  assert.equal(obtenerCicloSiguiente(2027), 2028);
});

test("rechaza ciclos almacenados como texto", () => {
  assert.throws(() => validarCicloLectivo("2026"));
});

test("rechaza ciclos fuera de rango", () => {
  assert.throws(() => validarCicloLectivo(2019));
  assert.throws(() => validarCicloLectivo(2101));
});

test("rechaza ciclos fraccionarios", () => {
  assert.throws(() => validarCicloLectivo(2026.5));
});

test("rechaza configuraciones inexistentes", () => {
  assert.throws(() => interpretarConfiguracion(null));
});

test("rechaza configuraciones incompletas", () => {
  assert.throws(() => interpretarConfiguracion({}));
});

test("utiliza el ciclo institucional configurado", () => {
  assert.equal(
    interpretarConfiguracion({ cicloVigente: 2026 }),
    2026
  );
});
