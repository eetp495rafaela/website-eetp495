/* E.E.T.P. N° 495 · Adaptador de interfaz para Portal Soporte 2027.
   Sin autenticación ni escrituras: delega todo en los scripts originales. */
(() => {
  "use strict";
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const groups = $$("#side-nav .nav-section");
  const links = $$("#side-nav a.nav-item");
  const panes = $$("#inicio>section.p27-pane");
  const info = {
    inicio: [
      "Tu portal en un solo lugar.",
      "Seleccioná una herramienta del menú lateral para comenzar.",
    ],
  };
  for (const pane of panes) {
    const label = $(`#side-nav a[href="#${pane.id}"]`);
    info[pane.id] = [
      label?.textContent.trim() || pane.id,
      "Herramientas institucionales del Portal Soporte.",
    ];
  }
  function closeMenu() {
    $("#sidebar")?.classList.remove("open");
    $("#sidebar-overlay")?.classList.remove("open");
    $("#sidebar-toggle")?.setAttribute("aria-expanded", "false");
  }
  function show(id) {
    const current = Object.prototype.hasOwnProperty.call(info, id)
      ? id
      : "inicio";
    $("#home-panel").hidden = current !== "inicio";
    for (const pane of panes)
      pane.classList.toggle("p27-active", pane.id === current);
    for (const a of links) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
      if (a.classList.contains("is-active"))
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    $("#view-title").textContent = info[current][0];
    $("#view-description").textContent = info[current][1];
    $("#breadcrumb-role").textContent =
      current === "inicio" ? "Portal Soporte" : info[current][0];
    closeMenu();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navigate(id) {
    if (location.hash === "#" + id) show(id);
    else location.hash = "#" + id;
  }
  links.forEach((link) =>
    link.addEventListener("click", (evt) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      evt.preventDefault();
      navigate(href.slice(1));
    }),
  );
  window.addEventListener("hashchange", () =>
    show(decodeURIComponent(location.hash.slice(1))),
  );
  $("#sidebar-toggle")?.addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("open");
    $("#sidebar-overlay").classList.toggle("open", open);
    $("#sidebar-toggle").setAttribute("aria-expanded", String(open));
  });
  $("#sidebar-overlay")?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  $$("[data-toggle-group]").forEach((button) =>
    button.addEventListener("click", () => {
      const grp = button.closest(".nav-section");
      const items = $(".nav-items", grp);
      items.hidden = !items.hidden;
      $(".nav-group", grp).setAttribute("aria-expanded", String(!items.hidden));
    }),
  );
  const search = $("#module-search");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLocaleLowerCase("es-AR");
    for (const group of groups) {
      let total = 0;
      for (const link of $$(".nav-item", group)) {
        const match = link.textContent.toLocaleLowerCase("es-AR").includes(q);
        link.classList.toggle("p27-filtered", !match);
        if (match) total++;
      }
      group.classList.toggle("p27-filtered", !total);
      if (q) {
        $(".nav-items", group).hidden = false;
        $(".nav-group", group).setAttribute("aria-expanded", "true");
      }
    }
  });
  // El botón real está en la cabecera original, preservado para la lógica de seguridad.
  $("#p27-logout")?.addEventListener("click", () =>
    $("#btnCerrarSesionPortal")?.click(),
  );
  // La autenticación original escribe en el primer [data-nombre-usuario]. Lo reflejamos.
  const originalUser = $(".p27-original-header [data-nombre-usuario]");
  const user = $("#p27-username");
  const syncUser = () => {
    if (user && originalUser)
      user.textContent =
        originalUser.textContent.trim() || "Usuario institucional";
  };
  if (originalUser) {
    new MutationObserver(syncUser).observe(originalUser, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    syncUser();
  }
  const wa = $("#p27-contact-dialog");
  $("#p27-whatsapp")?.addEventListener("click", () => wa?.showModal());
  $("#p27-dialog-close")?.addEventListener("click", () => wa?.close());
  $("#p27-dialog-ok")?.addEventListener("click", () => wa?.close());
  wa?.addEventListener("click", (e) => {
    if (e.target === wa) wa.close();
  });
  const year = $("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
  show(decodeURIComponent(location.hash.slice(1)) || "inicio");
})();
