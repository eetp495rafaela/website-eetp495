const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const codigo = fs.readFileSync(
  path.resolve(__dirname, "../../assets/js/informes-docente.js"), "utf8",
);
const indiceEscapar = codigo.indexOf("function escaparHtmlDocente(");
const finEscapar = codigo.indexOf("function mostrarMensajeInformesDocente(", indiceEscapar);
const indiceDAI = codigo.indexOf("function renderizarDocentesApoyoEnInforme(");
const finDAI = codigo.indexOf("async function enviarAlBackendInformesDocente(", indiceDAI);
assert(indiceEscapar !== -1 && finEscapar > indiceEscapar);
assert(indiceDAI !== -1 && finDAI > indiceDAI);

// Se prueban las funciones puras sin Firebase ni datos de estudiantes reales.
const render = new Function(
  codigo.slice(indiceEscapar, finEscapar) +
  codigo.slice(indiceDAI, finDAI) +
  "return renderizarDocentesApoyoEnInforme;",
)();

test("sin DAI activos no se dibuja información adicional", () => {
  assert.equal(render({docentesApoyo: []}), "");
  assert.equal(render({}), "");
});

test("un DAI aparece con nombre y correo debajo del DNI", () => {
  const salida = render({docentesApoyo: [{nombre:"Ana Ejemplo", correo:"ana@example.test"}]});
  assert.match(salida, /DAI:.*Ana Ejemplo/);
  assert.match(salida, /mailto:ana@example\.test/);
});

test("dos DAI se muestran por separado sin perder información", () => {
  const salida = render({docentesApoyo: [
    {nombre:"Ana Ejemplo", correo:"ana@example.test"},
    {nombre:"Beatriz Ejemplo", correo:"beatriz@example.test"},
  ]});
  assert.equal((salida.match(/DAI:/g) || []).length, 2);
});

test("una dirección duplicada se dibuja una sola vez", () => {
  const salida = render({docentesApoyo: [
    {nombre:"Ana", correo:"ANA@example.test"},
    {nombre:"Ana", correo:"ana@example.test"},
  ]});
  assert.equal((salida.match(/DAI:/g) || []).length, 1);
});

test("nombre peligroso se escapa y dirección inválida se rechaza", () => {
  const salida = render({docentesApoyo: [
    {nombre:'<img src=x onerror="alert(1)">', correo:"ana@example.test"},
    {nombre:"Invalido", correo:"javascript:alert(1)"},
  ]});
  assert(!salida.includes("<img"));
  assert(salida.includes("&lt;img"));
  assert.equal((salida.match(/DAI:/g) || []).length, 1);
});
