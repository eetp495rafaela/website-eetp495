/*
 * Navegación visual del Portal Docentes de Apoyo.
 * No concede permisos ni realiza lecturas de información institucional.
 */
const vistas = {
  inicio: { panel: "home-panel", titulo: "Bienvenido a tu espacio institucional",
    descripcion: "Elegí una opción del menú lateral para consultar la información que tenés autorizada." },
  informes: { panel: "panelInformesApoyo", titulo: "Informes Pedagógico-Didácticos",
    descripcion: "Informes de tus estudiantes vinculados, en modo lectura." },
  agenda: { panel: "panelAgendaApoyo", titulo: "Agenda Institucional",
    descripcion: "Estudiantes a tu cargo y contactos institucionales autorizados." },
  asistencia: { panel: "panelAsistenciaApoyo", titulo: "Situación de Asistencia · Si.R.A.",
    descripcion: "Consulta de asistencia individual y de solo lectura." },
};
const paneles = ["home-panel", "panelInformesApoyo", "panelAgendaApoyo", "panelAsistenciaApoyo"];
const enlaces = [...document.querySelectorAll("#side-nav [data-vista]")];
const barra = document.getElementById("sidebar");
const botonMenu = document.getElementById("sidebar-toggle");
const velo = document.getElementById("sidebar-overlay");

function cerrarMenu() {
  barra?.classList.remove("open");
  velo?.classList.remove("open");
  botonMenu?.setAttribute("aria-expanded", "false");
  botonMenu?.setAttribute("aria-label", "Abrir menú");
}
function abrirMenu() {
  barra?.classList.add("open");
  velo?.classList.add("open");
  botonMenu?.setAttribute("aria-expanded", "true");
  botonMenu?.setAttribute("aria-label", "Cerrar menú");
}
function mostrarVista(nombre) {
  const clave = Object.hasOwn(vistas, nombre) ? nombre : "inicio";
  const vista = vistas[clave];
  paneles.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.hidden = id !== vista.panel;
  });
  const titulo = document.getElementById("view-title");
  const descripcion = document.getElementById("view-description");
  if (titulo) titulo.textContent = vista.titulo;
  if (descripcion) descripcion.textContent = vista.descripcion;
  enlaces.forEach(enlace => {
    const seleccionado = enlace.dataset.vista === clave;
    enlace.classList.toggle("is-active", seleccionado);
    if (seleccionado) enlace.setAttribute("aria-current", "page");
    else enlace.removeAttribute("aria-current");
  });
  cerrarMenu();
  window.scrollTo({top: 0, behavior: "instant"});
}
function navegar(nombre) {
  if (nombre === "pizarra") {
    cerrarMenu();
    document.getElementById("btnGenerarPizarraHorarios")?.click();
    return;
  }
  if (!Object.hasOwn(vistas, nombre)) return;
  if (location.hash === "#" + nombre || (nombre === "inicio" && !location.hash)) {
    mostrarVista(nombre);
  } else {
    location.hash = nombre;
  }
}
enlaces.forEach(enlace => enlace.addEventListener("click", event => {
  event.preventDefault();
  navegar(enlace.dataset.vista);
}));
window.addEventListener("hashchange", () => {
  const nombre = location.hash.slice(1);
  mostrarVista(nombre === "pizarra" ? "inicio" : nombre);
});
botonMenu?.addEventListener("click", () => {
  if (barra?.classList.contains("open")) cerrarMenu();
  else abrirMenu();
});
velo?.addEventListener("click", cerrarMenu);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") cerrarMenu();
});
document.getElementById("module-search")?.addEventListener("input", event => {
  const texto = String(event.target.value || "").trim().toLocaleLowerCase("es");
  enlaces.forEach(enlace => {
    enlace.hidden = Boolean(texto) && !enlace.textContent.toLocaleLowerCase("es").includes(texto);
  });
});
mostrarVista(location.hash.slice(1));
