const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.resolve(__dirname, "../../assets/js/docentes-apoyo-gestion.js"), "utf8"
).replace(/^import\s+\{[^\n]+\}\s+from\s+"[^"]+";\s*$/gm, "");

function createPage(response) {
  const records = [];
  function element(tag) {
    return {
      tag, children: [], className: "", textContent: "", disabled: false,
      handlers: {},
      setAttribute(key, value) { this[key] = value; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = [...children]; },
      addEventListener(event, callback) { this.handlers[event] = callback; },
    };
  }
  const button = element("button"), view = element("div");
  const document = {
    getElementById(id) {
      return id === "btnVerDAIGestion" ? button : id === "vistaDAIGestion" ? view : null;
    },
    createElement: element,
  };
  const ctx = {
    document,
    getApp: () => ({}),
    getAuth: () => ({currentUser: {getIdToken: async () => "TOKEN_PRUEBA"}}),
    fetch: async (_url, args) => {
      records.push(args);
      return {ok: true, json: async () => response};
    },
  };
  vm.runInNewContext(source, ctx);
  return {button, view, records};
}

function texts(node) {
  return [node.textContent || "", ...(node.children || []).flatMap(texts)].join(" ");
}

test("no consulta Firestore ni Apps Script al abrir la pantalla", () => {
  const app = createPage({ok:true,docentes:[]});
  assert.equal(app.records.length, 0);
  assert.equal(typeof app.button.handlers.click, "function");
});

test("consulta solamente después de pulsar el botón y envía token", async () => {
  const app = createPage({ok:true,docentes:[
    {nombre:"DAI Ejemplo",correo:"apoyo@example.edu",
     estudiantes:[{nombre:"Alumno Ejemplo",cursoNombre:"2° B"}]},
  ]});
  await app.button.handlers.click();
  assert.equal(app.records.length, 1);
  assert.equal(app.button.disabled, false);
  const payload = JSON.parse(app.records[0].body);
  assert.equal(payload.accion, "listar_docentes_apoyo_gestion");
  assert.equal(payload.idToken, "TOKEN_PRUEBA");
  assert.match(texts(app.view), /DAI Ejemplo/);
  assert.match(texts(app.view), /Alumno Ejemplo/);
  assert.match(texts(app.view), /2° B/);
  await app.button.handlers.click();
  assert.equal(app.records.length, 2); // segunda consulta SOLO por segundo clic
});

test("sin asignaciones muestra mensaje y nunca escribe datos", async () => {
  const app = createPage({ok:true,docentes:[
    {nombre:"Sin Alumnos",correo:"sin@example.edu",estudiantes:[]},
  ]});
  await app.button.handlers.click();
  assert.match(texts(app.view), /Sin estudiantes vinculados/);
  assert.equal(app.records[0].method, "POST");
  assert(!("write" in app.records[0]));
});

test("respuesta de acceso denegado se informa y libera el botón", async () => {
  const app = createPage({ok:false,mensaje:"Acceso no permitido"});
  await app.button.handlers.click();
  assert.match(texts(app.view), /Acceso no permitido/);
  assert.equal(app.button.disabled, false);
});

test("no usa innerHTML: nombre externo se inserta como texto", async () => {
  const app = createPage({ok:true,docentes:[
    {nombre:'<script>alert(1)</script>',correo:"dai@example.edu",estudiantes:[]},
  ]});
  await app.button.handlers.click();
  assert.match(texts(app.view), /<script>alert\(1\)<\/script>/);
  assert.equal(source.includes("innerHTML"), false);
});
