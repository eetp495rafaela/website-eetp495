/* Website 2027 · Adaptador visual Portal Docentes.
   Reutiliza el HTML funcional, las reglas y los JS del portal vigente.
   No consulta ni modifica Firebase, roles, permisos ni datos. */
(() => {
  "use strict";
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));
  const paneInfo = {
    inicio: [
      "Bienvenido a tu espacio institucional",
      "Tu actividad docente en un solo lugar. Elegí una opción del menú lateral para comenzar.",
    ],
    "mis-horarios-docente": [
      "Mis Horarios",
      "Consultá los bloques de Aula, Taller y Educación Física de tus asignaciones.",
    ],
    "sira-docente": [
      "Si.R.A. · Registro de Asistencia",
      "Cargá y corregí asistencias en las clases habilitadas.",
    ],
    "parte-sira-docente": [
      "Parte de Asistencia",
      "Consultá el parte semanal de Taller y Educación Física.",
    ],
    "situacion-asistencia-docente": [
      "Situación de Asistencia",
      "Consultá resúmenes por curso y período.",
    ],
    "listas-estudiantes-docente": [
      "Listas de Estudiantes",
      "Nóminas de estudiantes de tus cursos asignados.",
    ],
    "agenda-institucional-docente": [
      "Agenda Institucional",
      "Contactos de colegas, personal institucional y estudiantes autorizados.",
    ],
    "calificaciones-taller-docente": [
      "Registro de Calificaciones",
      "Consultá el registro autorizado de Taller.",
    ],
    panelDocumentacionAcademica: [
      "Documentación Académica",
      "Cargá planes, programas y materiales de estudio.",
    ],
    "informes-pedagogicos-docente": [
      "Informes Pedagógico-Didácticos",
      "Consultá los informes disponibles de estudiantes autorizados.",
    ],
    "mesas-examen-docente": [
      "Mesas de Examen",
      "Consultá las mesas publicadas y sus filtros.",
    ],
    "gestiones-docentes-2027": [
      "Gestiones Docentes",
      "Documentos PDF para gestiones y trámites docentes.",
    ],
    "normativa-vigente-2027": [
      "Normativa Vigente",
      "Documentos oficiales y normativa de consulta docente.",
    ],
    "enlaces-institucionales-docente": [
      "Enlaces Institucionales",
      "Servicios y plataformas oficiales para docentes.",
    ],
  };
  const panes = $$("main#inicio>section.p27-pane");
  const sidebar = $("#sidebar"),
    overlay = $("#sidebar-overlay"),
    toggle = $("#sidebar-toggle");
  const links = $$("#side-nav .nav-item[data-tool]");
  const closeMenu = () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Abrir menú");
  };
  toggle?.addEventListener("click", () => {
    const show = !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", show);
    overlay.classList.toggle("open", show);
    toggle.setAttribute("aria-expanded", String(show));
    toggle.setAttribute("aria-label", show ? "Cerrar menú" : "Abrir menú");
  });
  overlay?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeMenu();
  });
  $$("#side-nav [data-toggle-group]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const group = btn.closest(".nav-section");
      const head = $(".nav-group", group);
      const items = $(".nav-items", group);
      if (!head || !items) return;
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      items.hidden = !open;
      btn.setAttribute(
        "aria-label",
        (open ? "Contraer " : "Expandir ") + $("span", head).textContent,
      );
    }),
  );
  const restricted = new Set([
    "sira-docente",
    "parte-sira-docente",
    "situacion-asistencia-docente",
  ]);
  const isHidden = (el) => !el || el.hidden || el.style.display === "none";
  const limited = () => document.body.dataset.docenteAccesoLimitado === "true";
  function allow(id) {
    if (id === "inicio") return true;
    const section = document.getElementById(id);
    if (!section || isHidden(section)) return false;
    if (limited() && !section.hasAttribute("data-acceso-docente-limitado"))
      return false;
    if (id === "calificaciones-taller-docente") {
      const card = $("#tarjetaCalificacionesTallerDocente");
      if (isHidden(card)) return false;
    }
    return true;
  }
  const search = $("#module-search");
  function refreshMenu() {
    const q = (search?.value || "").trim().toLocaleLowerCase("es-AR");
    $$("#side-nav .nav-section").forEach((group) => {
      let count = 0;
      $$(".nav-item", group).forEach((link) => {
        const url = link.getAttribute("href") || "";
        const id = url.startsWith("#") ? url.slice(1) : "";
        const only = link.hasAttribute("data-solo-docente-taller");
        const oldCard = link.dataset.originalCard
          ? document.getElementById(link.dataset.originalCard)
          : null;
        const permitted =
          !limited() || link.hasAttribute("data-acceso-docente-limitado");
        const visible =
          permitted &&
          (!only || !isHidden(link)) &&
          (!oldCard || !isHidden(oldCard)) &&
          (!id ||
            !(id in paneInfo) ||
            (id === "panelDocumentacionAcademica" ? !limited() : allow(id))) &&
          link.textContent.toLocaleLowerCase("es-AR").includes(q);
        // No reescribir `hidden` del enlace: permisos-taller-docente.js controla ese atributo.
        link.classList.toggle("p27-filtered", !visible);
        if (visible) count++;
      });
      group.classList.toggle("p27-filtered", !count);
      if (q) {
        $(".nav-items", group).hidden = false;
        $(".nav-group", group).setAttribute("aria-expanded", "true");
      }
    });
  }
  function show(id) {
    const requested = Object.hasOwn(paneInfo, id) ? id : "inicio";
    const active =
      requested === "inicio" || allow(requested) ? requested : "inicio";
    if (active !== requested && location.hash !== "#inicio")
      history.replaceState(null, "", "#inicio");
    $("#home-panel").hidden = active !== "inicio";
    for (const pane of panes)
      pane.classList.toggle("p27-active", pane.id === active);
    links.forEach((link) =>
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === "#" + active,
      ),
    );
    $("#view-title").textContent = paneInfo[active][0];
    $("#view-description").textContent = paneInfo[active][1];
    $("#breadcrumb-role").textContent =
      active === "inicio" ? "Portal Docentes" : paneInfo[active][0];
    closeMenu();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navigate(id, launch) {
    if (id === "pizarra") {
      const btn = $("#btnGenerarPizarraHorarios");
      if (btn && !isHidden(btn)) btn.click();
      closeMenu();
      return;
    }
    if (
      id in paneInfo &&
      id !== "inicio" &&
      id !== "panelDocumentacionAcademica" &&
      !allow(id)
    ) {
      closeMenu();
      return;
    }
    if (id === "panelDocumentacionAcademica") {
      // La tarjeta original hace visible el panel antes de cargar las asignaciones.
      // Reproducimos solo esa apertura de pantalla y delegamos la consulta al evento vigente.
      const section = $("#panelDocumentacionAcademica");
      if (section) section.hidden = false;
      const button = $("#btnAbrirDocumentacionAcademica");
      if (button) button.click();
    }
    if (id === "agenda-institucional-docente") {
      const card = $("#tarjetaAgendaInstitucionalDocente");
      if (card) card.click();
    }
    if (id === "inicio") {
      if (location.hash !== "#inicio") location.hash = "#inicio";
      else show("inicio");
      return;
    }
    if (location.hash === "#" + id) show(id);
    else location.hash = "#" + id;
  }
  links.forEach((link) =>
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) {
        closeMenu();
        return;
      }
      event.preventDefault();
      navigate(href.slice(1), link.dataset.launch);
    }),
  );
  // Los scripts originales modifican visibilidad de módulos después de autenticar.
  const obs = new MutationObserver(() => {
    refreshMenu();
    const current = decodeURIComponent(location.hash.slice(1));
    if (current in paneInfo && current !== "inicio" && !allow(current))
      show("inicio");
  });
  for (const pane of panes)
    obs.observe(pane, {
      attributes: true,
      attributeFilter: ["style", "hidden"],
    });
  for (const id of ["tarjetaCalificacionesTallerDocente"]) {
    const element = document.getElementById(id);
    if (element)
      obs.observe(element, {
        attributes: true,
        attributeFilter: ["style", "hidden"],
      });
  }
  obs.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-docente-acceso-limitado"],
  });
  for (const link of links) {
    if (link.hasAttribute("data-solo-docente-taller"))
      obs.observe(link, {
        attributes: true,
        attributeFilter: ["style", "hidden"],
      });
  }
  search?.addEventListener("input", refreshMenu);
  window.addEventListener("hashchange", () => {
    show(decodeURIComponent(location.hash.slice(1)));
    refreshMenu();
  });
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
  const year = $("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
  refreshMenu();
  show(decodeURIComponent(location.hash.slice(1)) || "inicio");
})();
