/* Integración 45 · Selector claro/oscuro del sitio público (sin Firebase). */
(() => {
  "use strict";
  const clave = "eetp495-public-theme";
  const raiz = document.documentElement;
  const botones = document.querySelectorAll("[data-public-theme-toggle]");

  function estaOscuro() {
    return raiz.getAttribute("data-public-theme") === "dark";
  }

  function actualizarBotones() {
    const oscuro = estaOscuro();
    botones.forEach((boton) => {
      boton.setAttribute("aria-pressed", String(oscuro));
      boton.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
      boton.title = oscuro ? "Activar modo claro" : "Activar modo oscuro";
    });
  }

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const nuevo = estaOscuro() ? "light" : "dark";
      if (nuevo === "dark") {
        raiz.setAttribute("data-public-theme", "dark");
      } else {
        raiz.removeAttribute("data-public-theme");
      }
      try {
        localStorage.setItem(clave, nuevo);
      } catch (_) {
        // El cambio visual sigue funcionando aunque el navegador bloquee storage.
      }
      actualizarBotones();
    });
  });

  actualizarBotones();
})();
