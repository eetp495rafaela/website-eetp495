const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..", "..");
const pages = ["index.html", ...[
  "escuela", "plan-estudios", "proyectos", "novedades", "calendario", "inscripciones",
].map(p => "vista-2027/" + p + ".html")];
const js = fs.readFileSync(path.join(root, "vista-2027/assets/js/tema-publico-2027.js"), "utf8");
const css = fs.readFileSync(path.join(root, "vista-2027/assets/css/tema-publico-2027.css"), "utf8");

test("las siete páginas públicas comparten el selector y sus recursos", () => {
  for (const page of pages) {
    const s = fs.readFileSync(path.join(root, page), "utf8");
    assert.equal(s.split("data-public-theme-toggle").length - 1, 1, page);
    assert.match(s, /tema-publico-2027\.css\?v=45/);
    assert.match(s, /tema-publico-2027\.js\?v=45/);
    assert.match(s, /localStorage\.getItem\("eetp495-public-theme"\)/);
  }
});
function createPage(blockStorage = false) {
  const attributes = {};
  let stored = null;
  const toggle = {
    properties: {}, title: "", click: null,
    setAttribute(k, v) { this.properties[k] = v; },
    addEventListener(name, fn) { if (name === "click") this.click = fn; },
  };
  const root = {
    getAttribute(k) { return attributes[k] ?? null; },
    setAttribute(k, v) { attributes[k] = v; },
    removeAttribute(k) { delete attributes[k]; },
  };
  const ctx = {
    document: {documentElement: root, querySelectorAll: () => [toggle]},
    localStorage: {setItem(k, v) { if (blockStorage) throw new Error("denied"); stored = [k, v]; }},
  };
  vm.runInNewContext(js, ctx);
  return {toggle, root, storage: () => stored};
}
test("alternar claro/oscuro guarda preferencia y actualiza accesibilidad", () => {
  const page = createPage();
  assert.equal(page.toggle.properties["aria-pressed"], "false");
  page.toggle.click();
  assert.equal(page.root.getAttribute("data-public-theme"), "dark");
  assert.equal(page.toggle.properties["aria-pressed"], "true");
  assert.equal(page.toggle.properties["aria-label"], "Activar modo claro");
  assert.deepEqual(page.storage(), ["eetp495-public-theme", "dark"]);
  page.toggle.click();
  assert.equal(page.root.getAttribute("data-public-theme"), null);
  assert.equal(page.toggle.properties["aria-pressed"], "false");
  assert.deepEqual(page.storage(), ["eetp495-public-theme", "light"]);
});
test("la alternancia funciona aun si localStorage está bloqueado", () => {
  const page = createPage(true);
  page.toggle.click();
  assert.equal(page.root.getAttribute("data-public-theme"), "dark");
  page.toggle.click();
  assert.equal(page.root.getAttribute("data-public-theme"), null);
});
test("la capa oscura preserva fotografías y no afecta portales", () => {
  assert.match(css, /html\[data-public-theme="dark"\]/);
  assert(!/filter:\s*invert\(/i.test(css));
  const files = ["admin/index.html","gestion/index.html","docentes/index.html","alumnos/index.html","login.html"];
  for(const file of files) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert(!html.includes("tema-publico-2027.css"), file);
  }
});
