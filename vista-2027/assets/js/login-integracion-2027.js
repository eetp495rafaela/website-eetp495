/* Acciones de interfaz del Login 2027. No modifica Firebase ni los permisos. */
(() => {
  const top = document.getElementById("go-top");
  const wa = document.getElementById("contacto-institucional");
  const dlg = document.getElementById("contacto-dialog");
  if (top)
    top.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  if (wa && dlg) wa.addEventListener("click", () => dlg.showModal());
  dlg
    ?.querySelectorAll("[data-contacto-close]")
    .forEach((btn) => btn.addEventListener("click", () => dlg.close()));
  dlg?.addEventListener("click", (event) => {
    if (event.target === dlg) dlg.close();
  });
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
})();
