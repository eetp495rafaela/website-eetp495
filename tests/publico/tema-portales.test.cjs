const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const fivePortals = ["alumnos/index.html","docentes/index.html","docentes-apoyo/index.html","gestion/index.html","admin/index.html"];
const load = p => fs.readFileSync(path.join(root, p), "utf8");

test("cada portal tiene un solo botón de tema en su encabezado visible", () => {
  for (const p of fivePortals) {
    const html = load(p);
    assert.equal((html.match(/data-public-theme-toggle/g) || []).length, 1, p);
    const active = html.slice(html.indexOf('class="portal-content"'));
    const topbar = active.slice(active.indexOf('<header'),active.indexOf('</header>')+9);
    assert.match(topbar,/data-public-theme-toggle/,p);
    assert.match(topbar,/aria-label="Activar modo oscuro"/,p);
    assert.match(topbar,/portal-theme-sun/,p);
    assert.match(topbar,/portal-theme-moon/,p);
  }
});
test("preferencia local se aplica antes de que cargue el CSS del portal", () => {
  for (const p of fivePortals) {
    const html = load(p);
    const boot = html.indexOf('localStorage.getItem("eetp495-public-theme")');
    const css = html.indexOf("tema-portales-2027.css?v=45");
    assert(boot > 0 && css > boot, p);
    assert.match(html, /tema-publico-2027\.js\?v=45/, p);
  }
});
test("el código compartido permite volver al modo claro", () => {
  const js = load("vista-2027/assets/js/tema-publico-2027.js");
  assert.match(js, /removeAttribute\("data-public-theme"\)/);
  assert.match(js, /localStorage\.setItem\(clave, nuevo\)/);
  assert.match(js, /aria-pressed/);
});
test("paleta oscura aplicada únicamente a los cinco portales", () => {
  const css = load("assets/css/portales/tema-portales-2027.css");
  assert.match(css, /html\[data-public-theme="dark"\]/);
  for (const cls of ["portal-alumnos-2027","portal-docentes-2027","portal-docentes-apoyo-2027","portal-gestion-2027","portal-soporte-2027"]) {
    assert(css.includes(cls),cls);
  }
  assert(!/filter:\s*invert\(/i.test(css));
  assert(!/display:\s*none\s*!important/i.test(css));
});
test("el título Nuestra historia usa el color adaptable", () => {
  const html = load("vista-2027/escuela.html");
  assert.match(html, /<h2 style="margin-top: 60px; color: var\(--navy\)">Nuestra historia<\/h2>/);
  const css = load("vista-2027/assets/css/tema-publico-2027.css");
  assert.match(css, /--navy:\s*#eaf2ff/i);
});
test("login institucional permanece sin control de tema ni cambios visuales", () => {
  const html = load("login.html");
  assert(!html.includes("data-public-theme-toggle"));
  assert(!html.includes("tema-portales-2027.css"));
});
