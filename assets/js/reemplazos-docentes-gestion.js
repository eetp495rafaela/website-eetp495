const tarjetaReemplazosDocentesGestion = document.getElementById(
  "tarjetaReemplazosDocentesGestion",
);

const seccionReemplazosDocentesGestion = document.getElementById(
  "reemplazos-docentes-gestion",
);

const panelRegistroReemplazoGestion = document.getElementById(
  "panelRegistroReemplazoGestion",
);

function configurarAccesoReemplazosDocentesGestion() {
  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  const rolesConsulta = new Set([
    "DIRECCION",
    "SECRETARIA",
    "ASISTENTE_ADMINISTRATIVO",
    "PRECEPTORIA",
  ]);

  const rolesAdministracion = new Set([
    "DIRECCION",
    "SECRETARIA",
    "ASISTENTE_ADMINISTRATIVO",
  ]);

  const puedeConsultar = rolesConsulta.has(rol);
  const puedeAdministrar = rolesAdministracion.has(rol);

  if (tarjetaReemplazosDocentesGestion) {
    tarjetaReemplazosDocentesGestion.hidden = !puedeConsultar;
  }

  if (seccionReemplazosDocentesGestion) {
    seccionReemplazosDocentesGestion.hidden = !puedeConsultar;
  }

  if (panelRegistroReemplazoGestion) {
    panelRegistroReemplazoGestion.style.display = puedeAdministrar
      ? ""
      : "none";
  }
}

window.addEventListener(
  "portalUsuarioListo",
  configurarAccesoReemplazosDocentesGestion,
);

if (window.portalUsuario) {
  configurarAccesoReemplazosDocentesGestion();
}
