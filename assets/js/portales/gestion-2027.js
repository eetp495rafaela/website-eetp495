/* Website 2027 · Gestión: solo adaptación visual, sin cambios en autenticación o datos. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const nav = $("#side-nav");
  const links = $$("a.nav-item", nav);
  const panes = $$("#inicio>section.p27-pane");
  const roles = {
    inicio: [
      "Tu portal en un solo lugar.",
      "Seleccioná una herramienta del menú lateral para comenzar.",
    ],
  };
  for (const pane of panes) {
    const a = links.find((x) => x.getAttribute("href") === "#" + pane.id);
    roles[pane.id] = [
      (a?.textContent || pane.id).trim(),
      "Herramientas de Gestión Institucional.",
    ];
  }
  function authorized(id) {
    const target = $("#" + CSS.escape(id));
    const link = links.find((x) => x.getAttribute("href") === "#" + id);
    return !!target && !!link && !target.hidden && !link.hidden;
  }
  const gated = $$("a.nav-item[data-original-card]", nav);
  function syncPermissions() {
    for (const link of gated) {
      const card = document.getElementById(link.dataset.originalCard);
      const sec = document.getElementById(link.getAttribute("href").slice(1));
      link.hidden = !card || !sec || card.hidden || sec.hidden;
    }
    const curr = decodeURIComponent(location.hash.slice(1));
    if (curr && curr !== "inicio" && !authorized(curr)) show("inicio");
  }
  function closeMenu() {
    $("#sidebar")?.classList.remove("open");
    $("#sidebar-overlay")?.classList.remove("open");
    $("#sidebar-toggle")?.setAttribute("aria-expanded", "false");
  }
  function show(id) {
    const current = id === "inicio" || authorized(id) ? id : "inicio";
    $("#home-panel").hidden = current !== "inicio";
    panes.forEach((el) => el.classList.toggle("p27-active", el.id === current));
    links.forEach((el) => {
      const selected = el.getAttribute("href") === "#" + current;
      el.classList.toggle("is-active", selected);
      if (selected) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    $("#view-title").textContent = roles[current][0];
    $("#view-description").textContent = roles[current][1];
    $("#breadcrumb-role").textContent =
      current === "inicio" ? "Portal Gestión" : roles[current][0];
    closeMenu();
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navigate(id) {
    if (id !== "inicio" && !authorized(id)) return;
    if (location.hash === "#" + id) show(id);
    else location.hash = "#" + id;
  }
  links.forEach((a) =>
    a.addEventListener("click", (evt) => {
      const h = a.getAttribute("href") || "";
      if (!h.startsWith("#")) return;
      evt.preventDefault();
      navigate(h.slice(1));
    }),
  );
  window.addEventListener("hashchange", () =>
    show(decodeURIComponent(location.hash.slice(1)) || "inicio"),
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
      const section = button.closest(".nav-section");
      const container = $(".nav-items", section);
      container.hidden = !container.hidden;
      $(".nav-group", section).setAttribute(
        "aria-expanded",
        String(!container.hidden),
      );
    }),
  );
  $("#module-search")?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLocaleLowerCase("es-AR");
    $$(".nav-section", nav).forEach((group) => {
      let count = 0;
      $$(".nav-item", group).forEach((a) => {
        const match = a.textContent.toLocaleLowerCase("es-AR").includes(q);
        a.classList.toggle("p27-filtered", !match);
        if (match && !a.hidden) count++;
      });
      group.classList.toggle("p27-filtered", count === 0);
      if (q) {
        $(".nav-items", group).hidden = false;
        $(".nav-group", group).setAttribute("aria-expanded", "true");
      }
    });
  });
  $("#p27-logout")?.addEventListener("click", () =>
    $("#btnCerrarSesionPortal")?.click(),
  );
  const fromName = $(".p27-original-header [data-nombre-usuario]"),
    toName = $("#p27-username");
  const fromRole = $(".p27-original-header [data-rol-usuario]"),
    toRole = $("#p27-role");
  function syncIdentity() {
    if (toName && fromName)
      toName.textContent =
        fromName.textContent.trim() || "Usuario institucional";
    if (toRole && fromRole)
      toRole.textContent =
        fromRole.textContent.trim() || "Gestión Institucional";
  }
  for (const el of [fromName, fromRole])
    if (el)
      new MutationObserver(syncIdentity).observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
      });
  syncIdentity();
  // Legacy access scripts update hidden attributes on the original cards/sections.
  for (const el of gated
    .flatMap((a) => [
      document.getElementById(a.dataset.originalCard),
      document.getElementById(a.getAttribute("href").slice(1)),
    ])
    .filter(Boolean)) {
    new MutationObserver(syncPermissions).observe(el, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  }
  const dialog = $("#p27-contact-dialog");
  $("#p27-whatsapp")?.addEventListener("click", () => dialog?.showModal());
  $("#p27-dialog-close")?.addEventListener("click", () => dialog?.close());
  $("#p27-dialog-ok")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  $("#current-year").textContent = String(new Date().getFullYear());
  syncPermissions();
  show(decodeURIComponent(location.hash.slice(1)) || "inicio");
})();
