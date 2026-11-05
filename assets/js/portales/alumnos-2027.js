/* Portal Alumnos 2027 · Adaptador de presentación.
   Sin consultas, escrituras, roles ni permisos propios; reutiliza los JS vigentes. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const panelInfo = {
    inicio: [
      "Bienvenido a tu espacio institucional",
      "Tus horarios, materiales y trámites. Elegí una opción del menú lateral para comenzar.",
    ],
    horarios: [
      "Mis horarios",
      "Consultá tus horarios de Aula, Taller y Educación Física.",
    ],
    "mis-docentes-alumno": [
      "Mis docentes",
      "Contactos docentes y referentes institucionales de tu curso.",
    ],
    "mis-companeros-alumno": [
      "Mis compañeros",
      "Contactos institucionales de estudiantes de tu curso.",
    ],
    "documentacion-academica": [
      "Documentación Académica",
      "Programas de examen y materiales de estudio disponibles.",
    ],
    examenes: [
      "S.I.M.E. · Inscripción a Exámenes",
      "Consultá inscripciones y registrá las que estén habilitadas.",
    ],
    "mesas-examen-alumno": [
      "Mesas de Examen",
      "Consultá las mesas publicadas y sus filtros.",
    ],
  };
  const sectionLinks = $$("#side-nav [data-tool]");
  const panes = $$("#legacy-sections [data-portal-panel]");
  const valid = Object.keys(panelInfo);
  const side = $("#sidebar"),
    overlay = $("#sidebar-overlay");
  const toggle = $("#sidebar-toggle");
  const closeMenu = () => {
    side?.classList.remove("open");
    overlay?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Abrir menú");
  };
  toggle?.addEventListener("click", () => {
    const opened = !side.classList.contains("open");
    side.classList.toggle("open", opened);
    overlay.classList.toggle("open", opened);
    toggle.setAttribute("aria-expanded", String(opened));
    toggle.setAttribute("aria-label", opened ? "Cerrar menú" : "Abrir menú");
  });
  overlay?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  $$("#side-nav [data-toggle-group]").forEach((button) =>
    button.addEventListener("click", () => {
      const wrap = button.closest(".nav-section"),
        head = wrap?.querySelector(".nav-group"),
        list = wrap?.querySelector(".nav-items");
      if (!head || !list) return;
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      list.hidden = !open;
      button.setAttribute(
        "aria-label",
        (open ? "Contraer " : "Expandir ") +
          head.querySelector("span").textContent,
      );
    }),
  );
  const search = $("#module-search");
  search?.addEventListener("input", () => {
    const q = search.value.trim().toLocaleLowerCase("es");
    $$("#side-nav .nav-section").forEach((group) => {
      let hits = 0;
      $$(".nav-item", group).forEach((link) => {
        const visible =
          link.textContent.toLocaleLowerCase("es").includes(q) &&
          link.dataset.roleHidden !== "yes";
        link.hidden = !visible;
        if (visible) hits++;
      });
      group.hidden = !hits;
      if (q) {
        const items = $(".nav-items", group),
          head = $(".nav-group", group);
        if (items) items.hidden = false;
        if (head) head.setAttribute("aria-expanded", "true");
      }
    });
  });
  const isRoleHidden = (el) =>
    !!el &&
    (el.getAttribute("data-role-hidden") === "yes" ||
      el.style.display === "none");
  function switchPanel(id) {
    const target = valid.includes(id) ? id : "inicio";
    // El script de seguridad del sitio vigente puede ocultar módulos de alumnos con cursada completa.
    const pane = $(
      '#legacy-sections [data-portal-panel="' + CSS.escape(target) + '"]',
    );
    const nav = $('#side-nav [href="#' + CSS.escape(target) + '"]');
    if (
      target !== "inicio" &&
      (pane?.style.display === "none" ||
        nav?.style.display === "none" ||
        nav?.dataset.roleHidden === "yes")
    ) {
      if (location.hash !== "#inicio")
        history.replaceState(null, "", "#inicio");
      return switchPanel("inicio");
    }
    $("#home-panel").hidden = target !== "inicio";
    panes.forEach((p) => {
      p.hidden = p.dataset.portalPanel !== target;
    });
    sectionLinks.forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + target);
    });
    const info = panelInfo[target];
    $("#view-title").textContent = info[0];
    $("#view-description").textContent = info[1];
    $("#breadcrumb-role").textContent =
      target === "inicio" ? "Portal Alumnos" : info[0];
    closeMenu();
    window.scrollTo({ top: 0, behavior: "instant" });
    // La agenda docente y los compañeros se cargaban al seleccionar una tarjeta.
    if (
      target === "mis-docentes-alumno" ||
      target === "mis-companeros-alumno"
    ) {
      const card = $(
        "#" +
          (target === "mis-docentes-alumno"
            ? "tarjetaMisDocentesAlumno"
            : "tarjetaMisCompanerosAlumno"),
      );
      if (card && !card.hidden && card.style.display !== "none") card.click();
    }
  }
  function syncRoleMenu() {
    // Respetar restricciones establecidas por proteger-portal.js, SIN modificar autorizaciones.
    for (const id of [
      "horarios",
      "mis-docentes-alumno",
      "mis-companeros-alumno",
    ]) {
      const section = $("#" + id),
        link = $('#side-nav [href="#' + id + '"]');
      if (!section || !link) continue;
      if (section.style.display === "none" || link.style.display === "none") {
        link.dataset.roleHidden = "yes";
        link.hidden = true;
      }
    }
    const active = decodeURIComponent(location.hash.slice(1));
    if (
      ["horarios", "mis-docentes-alumno", "mis-companeros-alumno"].includes(
        active,
      )
    ) {
      const p = $("#" + active);
      if (p && p.style.display === "none") switchPanel("inicio");
    }
  }
  // Los cambios de visibilidad son aplicados asincrónicamente por el script original de seguridad.
  const obs = new MutationObserver(syncRoleMenu);
  for (const id of [
    "horarios",
    "mis-docentes-alumno",
    "mis-companeros-alumno",
  ]) {
    const section = $("#" + id),
      link = $('#side-nav [href="#' + id + '"]');
    if (section)
      obs.observe(section, {
        attributes: true,
        attributeFilter: ["style", "hidden"],
      });
    if (link)
      obs.observe(link, { attributes: true, attributeFilter: ["style"] });
  }
  $$("#side-nav [data-tool]").forEach((a) =>
    a.addEventListener("click", (event) => {
      const link = a.getAttribute("href");
      if (!link.startsWith("#")) return;
      if (a.hasAttribute("data-launch")) {
        event.preventDefault();
        const original = $("#" + a.dataset.launch);
        if (original && original.style.display !== "none" && !original.hidden)
          original.click();
        closeMenu();
        return;
      }
      event.preventDefault();
      if (location.hash === link) switchPanel(link.substring(1));
      else location.hash = link;
    }),
  );
  // Control auxiliar de la pizarra, sin duplicar su lógica de impresión.
  const viewHorario = $("#horarios .acciones");
  if (viewHorario) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-accion";
    b.textContent = "Ver horario completo";
    b.addEventListener("click", () => $("#btnGenerarPizarraHorarios")?.click());
    viewHorario.append(b);
  }
  window.addEventListener("hashchange", () =>
    switchPanel(decodeURIComponent(location.hash.slice(1))),
  );
  $("#current-year").textContent = String(new Date().getFullYear());
  $("#whatsapp-demo")?.addEventListener("click", () =>
    $("#whatsapp-dialog")?.showModal(),
  );
  $("#close-wa-dialog")?.addEventListener("click", () =>
    $("#whatsapp-dialog")?.close(),
  );
  $("#wa-dialog-ok")?.addEventListener("click", () =>
    $("#whatsapp-dialog")?.close(),
  );
  $("#whatsapp-dialog")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.close();
  });
  switchPanel(decodeURIComponent(location.hash.slice(1)) || "inicio");
  syncRoleMenu();
})();
