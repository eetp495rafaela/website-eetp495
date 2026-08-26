import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider(
    "6Ld7BmwtAAAAADhZkCRmdmMaJtodHEzLsr4Ep2O8",
  ),
  isTokenAutoRefreshEnabled: true,
});

const auth = getAuth(app);
const db = getFirestore(app);
window.portalDb = db;

const CLAVE_ROL_ACTIVO = "rolActivoPortal";

const ROLES_VALIDOS = new Set([
  "ALUMNO",
  "DOCENTE",
  "SOPORTE",
  "PRECEPTORIA",
  "SECRETARIA",
  "ASISTENTE_ADMINISTRATIVO",
  "DIRECCION",
]);

const TIEMPO_MAXIMO_INACTIVIDAD = 15 * 60 * 1000;

function normalizarRol(rol) {
  return String(rol || "")
    .trim()
    .toUpperCase();
}

function obtenerRolesPerfil(perfil) {
  const rolPrincipal = normalizarRol(perfil.rol);

  const rolesAdicionales = Array.isArray(perfil.roles)
    ? perfil.roles.map(normalizarRol)
    : [];

  return Array.from(new Set([rolPrincipal, ...rolesAdicionales])).filter(
    (rol) => ROLES_VALIDOS.has(rol),
  );
}

function obtenerRolActivoSesion() {
  try {
    return normalizarRol(sessionStorage.getItem(CLAVE_ROL_ACTIVO));
  } catch (error) {
    console.warn("No se pudo consultar el rol activo de la sesión:", error);

    return "";
  }
}

function guardarRolActivoSesion(rol) {
  try {
    sessionStorage.setItem(CLAVE_ROL_ACTIVO, normalizarRol(rol));
  } catch (error) {
    console.warn("No se pudo guardar el rol activo de la sesión:", error);
  }
}

function eliminarRolActivoSesion() {
  try {
    sessionStorage.removeItem(CLAVE_ROL_ACTIVO);
  } catch (error) {
    console.warn("No se pudo eliminar el rol activo de la sesión:", error);
  }
}

const EVENTOS_ACTIVIDAD = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

let temporizadorInactividad = null;
let controlInactividadActivo = false;
let ultimaActualizacionActividad = 0;

async function cerrarSesionPorInactividad() {
  controlInactividadActivo = false;

  if (temporizadorInactividad) {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = null;
  }

  EVENTOS_ACTIVIDAD.forEach((evento) => {
    window.removeEventListener(evento, registrarActividadUsuario);
  });

  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar la sesión por inactividad:", error);
  }

  volverAlLogin();
}

function reiniciarTemporizadorInactividad() {
  if (!controlInactividadActivo) {
    return;
  }

  if (temporizadorInactividad) {
    clearTimeout(temporizadorInactividad);
  }

  temporizadorInactividad = setTimeout(
    cerrarSesionPorInactividad,
    TIEMPO_MAXIMO_INACTIVIDAD,
  );
}

function registrarActividadUsuario() {
  const ahora = Date.now();

  /*
   * Evita reiniciar el temporizador cientos de veces por segundo
   * mientras el usuario mueve el mouse.
   */
  if (ahora - ultimaActualizacionActividad < 1000) {
    return;
  }

  ultimaActualizacionActividad = ahora;
  reiniciarTemporizadorInactividad();
}

function iniciarControlInactividad() {
  if (controlInactividadActivo) {
    return;
  }

  controlInactividadActivo = true;
  ultimaActualizacionActividad = Date.now();

  EVENTOS_ACTIVIDAD.forEach((evento) => {
    window.addEventListener(evento, registrarActividadUsuario, {
      passive: true,
    });
  });

  reiniciarTemporizadorInactividad();
}

function volverAlLogin(mensaje = "") {
  eliminarRolActivoSesion();

  const url = new URL("../login.html", window.location.href);

  if (mensaje) {
    url.searchParams.set("mensaje", mensaje);
  }

  window.location.replace(url.toString());
}

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

async function registrarUltimoIngreso(user, perfil, correo, rolUsuario) {
  const marcaSesion = String(user.metadata?.lastSignInTime || "").trim();
  const claveRegistro = `portal_ultimo_ingreso_${user.uid}`;

  try {
    const sesionYaRegistrada =
      marcaSesion && localStorage.getItem(claveRegistro) === marcaSesion;

    if (sesionYaRegistrada) {
      return;
    }
  } catch (error) {
    console.warn(
      "No se pudo comprobar el registro local del último ingreso:",
      error,
    );
  }

  try {
    const referenciaAcceso = doc(db, "accesos_recientes", user.uid);

    await setDoc(
      referenciaAcceso,
      {
        uid: user.uid,
        nombreCompleto: perfil.nombreCompleto || user.displayName || correo,
        correo,
        rol: rolUsuario,
        ultimoIngreso: serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    if (marcaSesion) {
      try {
        localStorage.setItem(claveRegistro, marcaSesion);
      } catch (error) {
        console.warn(
          "No se pudo guardar localmente la sesión registrada:",
          error,
        );
      }
    }

    console.log("Último ingreso registrado:", correo);
  } catch (error) {
    /*
     * El registro de actividad es complementario.
     * Si falla, el usuario igualmente puede utilizar el portal.
     */
    console.warn("No se pudo registrar el último ingreso:", error);
  }
}

function obtenerRolesPermitidos() {
  const rolUnico = String(document.body.dataset.rolPermitido || "")
    .trim()
    .toUpperCase();

  const rolesMultiples = String(document.body.dataset.rolesPermitidos || "")
    .split(",")
    .map((rol) => rol.trim().toUpperCase())
    .filter(Boolean);

  if (rolesMultiples.length) {
    return rolesMultiples;
  }

  return rolUnico ? [rolUnico] : [];
}

function normalizarValorComparacion(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function ocultarElementoPortalAlumno(selector) {
  const elemento = document.querySelector(selector);

  if (!elemento) return;

  elemento.style.display = "none";
  elemento.setAttribute("hidden", "true");
}

function ajustarVistaPortalAlumno(perfil, rolUsuario) {
  if (rolUsuario !== "ALUMNO") return;

  const situacionRevista = normalizarValorComparacion(perfil.situacionRevista);

  const tipoVinculo = normalizarValorComparacion(perfil.tipoVinculo);

  const esCursadaCompleta =
    situacionRevista === "CURSADA COMPLETA" ||
    tipoVinculo === "CURSADA COMPLETA";

  if (!esCursadaCompleta) return;

  /* Horarios */
  ocultarElementoPortalAlumno("#tarjetaHorariosAlumno");
  ocultarElementoPortalAlumno('a[href="#horarios"]');
  ocultarElementoPortalAlumno("#horarios");

  /* Mis docentes */
  ocultarElementoPortalAlumno("#tarjetaMisDocentesAlumno");
  ocultarElementoPortalAlumno('a[href="#mis-docentes-alumno"]');
  ocultarElementoPortalAlumno("#mis-docentes-alumno");

  /* Mis compañeros */
  ocultarElementoPortalAlumno("#tarjetaMisCompanerosAlumno");
  ocultarElementoPortalAlumno('a[href="#mis-companeros-alumno"]');
  ocultarElementoPortalAlumno("#mis-companeros-alumno");

  console.log("Vista del Portal Alumno ajustada para Cursada Completa.");
}

function mostrarDatosUsuario(perfil, user, correo, rolUsuario) {
  const elementoNombre = document.querySelector("[data-nombre-usuario]");
  const elementoRol = document.querySelector("[data-rol-usuario]");

  const nombreVisible = perfil.nombreCompleto || user.displayName || correo;

  const rolesLegibles = {
    ALUMNO: "Estudiante",
    DOCENTE: "Docente",
    SOPORTE: "Soporte Institucional",
    PRECEPTORIA: "Preceptoría",
    SECRETARIA: "Secretaría",
    ASISTENTE_ADMINISTRATIVO: "Asistente Administrativo",
    DIRECCION: "Dirección",
  };

  if (elementoNombre) {
    elementoNombre.textContent = nombreVisible;
  }

  if (elementoRol) {
    elementoRol.textContent = rolesLegibles[rolUsuario] || rolUsuario;
  }
}

function cargarEstilosModalCierreSesion() {
  if (document.getElementById("estilosModalCierreSesionPortal")) {
    return;
  }

  const estilos = document.createElement("style");

  estilos.id = "estilosModalCierreSesionPortal";

  estilos.textContent = `
  /*
   * El contenedor se convierte en flex únicamente para este SweetAlert.
   * Así el ancho del popup depende del viewport real y no de las columnas
   * internas de la grilla de SweetAlert2 ni del ancho del documento.
   */
  .swal2-container.contenedor-cierre-sesion-portal {
    position: fixed !important;
    inset: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    padding: 12px !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }

  .swal2-container.contenedor-cierre-sesion-portal
    .swal2-popup.modal-cierre-sesion-portal {
    flex: 0 1 420px !important;
    width: min(420px, calc(100vw - 24px)) !important;
    min-width: 0 !important;
    max-width: calc(100vw - 24px) !important;
    height: auto !important;
    max-height: calc(100dvh - 24px) !important;
    margin: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    box-sizing: border-box !important;
    border-radius: 16px !important;
  }

  .contenedor-cierre-sesion-portal
    .modal-cierre-sesion-portal .swal2-actions {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  @media (max-width: 600px) {
    .swal2-container.contenedor-cierre-sesion-portal {
      padding: 10px !important;
    }

    .swal2-container.contenedor-cierre-sesion-portal
      .swal2-popup.modal-cierre-sesion-portal {
      flex-basis: auto !important;
      width: calc(100vw - 20px) !important;
      min-width: 0 !important;
      max-width: calc(100vw - 20px) !important;
      padding: 12px 14px 14px !important;
    }

    .modal-cierre-sesion-portal .swal2-icon {
      width: 52px !important;
      height: 52px !important;
      margin: 2px auto 7px !important;
    }

    .modal-cierre-sesion-portal .swal2-icon-content {
      font-size: 34px !important;
    }

    .modal-cierre-sesion-portal .swal2-title {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 1.25rem !important;
      line-height: 1.2 !important;
    }

    .modal-cierre-sesion-portal .swal2-html-container {
      width: 100% !important;
      margin: 7px 0 0 !important;
      padding: 0 !important;
      font-size: 0.95rem !important;
      line-height: 1.3 !important;
    }

    .modal-cierre-sesion-portal .swal2-actions {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 8px !important;
      width: 100% !important;
      margin: 10px 0 0 !important;
      padding: 0 !important;
    }

    .modal-cierre-sesion-portal .swal2-actions button {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      min-height: 40px !important;
      margin: 0 !important;
      padding: 7px 13px !important;
      font-size: 0.92rem !important;
      white-space: normal !important;
    }
  }
`;

  document.head.appendChild(estilos);
}

cargarEstilosModalCierreSesion();

const btnCerrarSesionPortal = document.getElementById("btnCerrarSesionPortal");

if (btnCerrarSesionPortal) {
  btnCerrarSesionPortal.addEventListener("click", async () => {
    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Cerrar sesión?",
      text: "Vas a salir del Portal Institucional.",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,

      customClass: {
        container: "contenedor-cierre-sesion-portal",
        popup: "modal-cierre-sesion-portal",
      },
    });

    if (!resultado.isConfirmed) return;

    try {
      eliminarRolActivoSesion();

      await signOut(auth);
      window.location.replace("../login.html");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cerrar sesión",
        text: "Intentá nuevamente.",
        confirmButtonText: "Entendido",
      });
    }
  });
}
function accesoVencido(fechaFinAcceso) {
  if (!fechaFinAcceso) {
    return false;
  }

  const fechaTexto = String(fechaFinAcceso).trim();

  if (!fechaTexto) {
    return false;
  }

  // Se interpreta como válido hasta las 23:59:59 del día indicado.
  const fechaVencimiento = new Date(`${fechaTexto}T23:59:59`);
  const ahora = new Date();

  if (Number.isNaN(fechaVencimiento.getTime())) {
    console.warn(
      "Fecha de finalización inválida en el perfil:",
      fechaFinAcceso,
    );

    return false;
  }

  return ahora > fechaVencimiento;
}

onAuthStateChanged(auth, async (user) => {
  const rolesPermitidos = obtenerRolesPermitidos();

  if (!user || !rolesPermitidos.length) {
    volverAlLogin();
    return;
  }

  try {
    const correo = normalizarCorreo(user.email);

    if (!correo) {
      await signOut(auth);
      volverAlLogin("No se pudo validar el correo de la cuenta.");
      return;
    }

    const referencia = doc(db, "usuarios", correo);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      await signOut(auth);
      volverAlLogin("Tu cuenta no está autorizada.");
      return;
    }

    const perfil = documento.data();

    const estado = String(perfil.estado || "")
      .trim()
      .toUpperCase();

    const rolesUsuario = obtenerRolesPerfil(perfil);

    if (estado !== "ACTIVO") {
      await signOut(auth);
      volverAlLogin("Tu cuenta no se encuentra activa.");
      return;
    }

    if (accesoVencido(perfil.fechaFinAcceso)) {
      await signOut(auth);
      volverAlLogin("Tu acceso al portal ha finalizado.");
      return;
    }

    if (!rolesUsuario.length) {
      await signOut(auth);
      volverAlLogin("Tu cuenta no tiene roles válidos configurados.");
      return;
    }

    /*
     * El rol ALUMNO es exclusivo y no puede combinarse
     * con ningún otro rol institucional.
     */
    if (rolesUsuario.includes("ALUMNO") && rolesUsuario.length > 1) {
      await signOut(auth);

      volverAlLogin("La configuración de roles de esta cuenta no es válida.");

      return;
    }

    let rolUsuario = obtenerRolActivoSesion();

    /*
     * Compatibilidad con usuarios que poseen un solo rol.
     * Si ingresan sin una selección guardada, se toma automáticamente.
     */
    if (!rolUsuario && rolesUsuario.length === 1) {
      rolUsuario = rolesUsuario[0];
      guardarRolActivoSesion(rolUsuario);
    }

    /*
     * Los usuarios con varios roles deben elegir uno
     * desde la pantalla de ingreso.
     */
    if (!rolUsuario) {
      volverAlLogin("Elegí el rol con el que querés ingresar.");

      return;
    }

    /*
     * sessionStorage no otorga permisos.
     * El rol seleccionado debe existir realmente en Firestore.
     */
    if (!rolesUsuario.includes(rolUsuario)) {
      volverAlLogin("El rol seleccionado no está autorizado para esta cuenta.");

      return;
    }

    /*
     * El rol elegido también debe estar permitido
     * en el portal que se está intentando abrir.
     */
    if (!rolesPermitidos.includes(rolUsuario)) {
      volverAlLogin("El rol seleccionado no tiene permiso para este portal.");

      return;
    }

    await registrarUltimoIngreso(user, perfil, correo, rolUsuario);
    iniciarControlInactividad();
    ajustarVistaPortalAlumno(perfil, rolUsuario);

    window.portalUsuario = {
      correo,
      nombreCompleto: perfil.nombreCompleto || user.displayName || correo,
      rol: rolUsuario,
      roles: rolesUsuario,
      estado,
      tipoVinculo: perfil.tipoVinculo || "",
      situacionRevista: perfil.situacionRevista || "",
    };

    window.dispatchEvent(
      new CustomEvent("portalUsuarioListo", {
        detail: window.portalUsuario,
      }),
    );

    mostrarDatosUsuario(perfil, user, correo, rolUsuario);

    console.log("Acceso Autorizado:", {
      correo,
      nombreCompleto: perfil.nombreCompleto || "",
      rol: rolUsuario,
      fechaFinAcceso: perfil.fechaFinAcceso || null,
    });
  } catch (error) {
    console.error("Error al verificar acceso:", error);

    await signOut(auth);
    volverAlLogin("No fue posible validar el acceso.");
  }
});
