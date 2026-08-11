import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-check.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
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

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

const CLAVE_ROL_ACTIVO = "rolActivoPortal";
const CLAVE_MODO_SOLICITUD = "modoSolicitudAlumno";

const PORTALES_POR_ROL = {
  ALUMNO: {
    etiqueta: "Estudiante",
    icono: "fa-user-graduate",
    url: "alumnos/index.html",
  },

  DOCENTE: {
    etiqueta: "Docente",
    icono: "fa-chalkboard-user",
    url: "docentes/index.html",
  },

  SOPORTE: {
    etiqueta: "Soporte Institucional",
    icono: "fa-user-gear",
    url: "admin/index.html",
  },

  PRECEPTORIA: {
    etiqueta: "Preceptoría",
    icono: "fa-clipboard",
    url: "gestion/index.html",
  },

  SECRETARIA: {
    etiqueta: "Secretaría",
    icono: "fa-folder-open",
    url: "gestion/index.html",
  },

  ASISTENTE_ADMINISTRATIVO: {
    etiqueta: "Asistente Administrativo",
    icono: "fa-briefcase",
    url: "gestion/index.html",
  },

  DIRECCION: {
    etiqueta: "Dirección",
    icono: "fa-school",
    url: "gestion/index.html",
  },
};

/* =====================================================
   LOGIN NORMAL
===================================================== */

const boton = document.getElementById("btnGoogle");

const mensaje = document.querySelector("#vistaLogin .mensaje-login");

const vistaLogin = document.getElementById("vistaLogin");

const vistaSeleccionRol = document.getElementById("vistaSeleccionRol");

const opcionesRoles = document.getElementById("opcionesRoles");

const btnElegirOtraCuenta = document.getElementById("btnElegirOtraCuenta");

const mensajeSeleccionRol = document.getElementById("mensajeSeleccionRol");

/* =====================================================
   SOLICITUD DE ALUMNO
===================================================== */

const vistaSolicitudAlumno = document.getElementById("vistaSolicitudAlumno");

const btnGoogleSolicitud = document.getElementById("btnGoogleSolicitud");

const btnVolverLoginSolicitud = document.getElementById(
  "btnVolverLoginSolicitud",
);

const solicitudCorreo = document.getElementById("solicitudCorreo");

const mensajeSolicitudAlumno = document.getElementById(
  "mensajeSolicitudAlumno",
);

const formSolicitudAlumno = document.getElementById("formSolicitudAlumno");

const solicitudNombreCompleto = document.getElementById(
  "solicitudNombreCompleto",
);

const solicitudDni = document.getElementById("solicitudDni");

const btnEnviarSolicitud = document.getElementById("btnEnviarSolicitud");
const tituloSolicitudAlumno = document.getElementById("tituloSolicitudAlumno");

const descripcionSolicitudAlumno = document.getElementById(
  "descripcionSolicitudAlumno",
);

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensaje(texto) {
  if (mensaje) {
    mensaje.textContent = texto;
  }
}

function mostrarMensajeSeleccionRol(texto) {
  if (mensajeSeleccionRol) {
    mensajeSeleccionRol.textContent = texto;
  }
}

function mostrarMensajeSolicitud(texto) {
  if (mensajeSolicitudAlumno) {
    mensajeSolicitudAlumno.textContent = texto;
  }
}

/* =====================================================
   VISTAS
===================================================== */

function mostrarVistaLogin() {
  if (vistaLogin) {
    vistaLogin.hidden = false;
  }

  if (vistaSeleccionRol) {
    vistaSeleccionRol.hidden = true;
  }

  if (vistaSolicitudAlumno) {
    vistaSolicitudAlumno.hidden = true;
  }

  if (boton) {
    boton.disabled = false;
  }
}

function mostrarVistaSeleccionRol() {
  if (vistaLogin) {
    vistaLogin.hidden = true;
  }

  if (vistaSolicitudAlumno) {
    vistaSolicitudAlumno.hidden = true;
  }

  if (vistaSeleccionRol) {
    vistaSeleccionRol.hidden = false;
  }
}

function mostrarVistaSolicitudAlumno() {
  if (vistaLogin) {
    vistaLogin.hidden = true;
  }

  if (vistaSeleccionRol) {
    vistaSeleccionRol.hidden = true;
  }

  if (vistaSolicitudAlumno) {
    vistaSolicitudAlumno.hidden = false;
  }
}

/* =====================================================
   NORMALIZACIÓN
===================================================== */

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarRol(rol) {
  return String(rol || "")
    .trim()
    .toUpperCase();
}

/* =====================================================
   ROLES
===================================================== */

function obtenerRolesPerfil(perfil) {
  const rolPrincipal = normalizarRol(perfil.rol);

  const rolesAdicionales = Array.isArray(perfil.roles)
    ? perfil.roles.map(normalizarRol)
    : [];

  return Array.from(new Set([rolPrincipal, ...rolesAdicionales])).filter(
    (rol) => PORTALES_POR_ROL[rol],
  );
}

function guardarRolActivo(rol) {
  sessionStorage.setItem(CLAVE_ROL_ACTIVO, normalizarRol(rol));
}

function eliminarRolActivo() {
  sessionStorage.removeItem(CLAVE_ROL_ACTIVO);
}

/* =====================================================
   MODO SOLICITUD
===================================================== */

function activarModoSolicitud() {
  sessionStorage.setItem(CLAVE_MODO_SOLICITUD, "1");
}

function desactivarModoSolicitud() {
  sessionStorage.removeItem(CLAVE_MODO_SOLICITUD);
}

function estaEnModoSolicitud() {
  return sessionStorage.getItem(CLAVE_MODO_SOLICITUD) === "1";
}

/* =====================================================
   CORREO VERIFICADO DE LA SOLICITUD
===================================================== */

function completarCorreoSolicitud(user) {
  const correo = String(user?.email || "").trim();

  if (!correo) {
    throw new Error("La cuenta Google no tiene un correo disponible.");
  }

  if (solicitudCorreo) {
    solicitudCorreo.value = correo;
  }

  mostrarVistaSolicitudAlumno();

  /*
    No mostramos otro mensaje porque el correo
    ya queda visible en el campo correspondiente.
  */
  mostrarMensajeSolicitud("");
}

function limpiarCorreoSolicitud() {
  if (solicitudCorreo) {
    solicitudCorreo.value = "";
  }

  mostrarMensajeSolicitud("");
}

/* =====================================================
   INGRESAR AL PORTAL
===================================================== */

function ingresarAlPortalDelRol(rol) {
  const rolNormalizado = normalizarRol(rol);

  const portal = PORTALES_POR_ROL[rolNormalizado];

  if (!portal) {
    mostrarMensajeSeleccionRol(
      "El rol seleccionado no tiene un portal asignado.",
    );

    return;
  }

  guardarRolActivo(rolNormalizado);

  window.location.href = portal.url;
}

/* =====================================================
   SELECTOR DE ROLES
===================================================== */

function construirSelectorRoles(perfil) {
  if (!opcionesRoles) {
    throw new Error("No se encontró el contenedor para seleccionar el rol.");
  }

  opcionesRoles.innerHTML = "";

  mostrarMensajeSeleccionRol("");

  perfil.roles.forEach((rol) => {
    const portal = PORTALES_POR_ROL[rol];

    if (!portal) {
      return;
    }

    const botonRol = document.createElement("button");

    botonRol.type = "button";

    botonRol.className = "btn-rol-portal";

    botonRol.dataset.rol = rol;

    const icono = document.createElement("i");

    icono.className = `fa-solid ${portal.icono}`;

    const texto = document.createElement("span");

    texto.textContent = `Ingresar como ${portal.etiqueta}`;

    botonRol.append(icono, texto);

    botonRol.addEventListener("click", () => {
      const botonesRoles = opcionesRoles.querySelectorAll(".btn-rol-portal");

      botonesRoles.forEach((botonOpcion) => {
        botonOpcion.disabled = true;
      });

      mostrarMensajeSeleccionRol(`Ingresando como ${portal.etiqueta}...`);

      ingresarAlPortalDelRol(rol);
    });

    opcionesRoles.appendChild(botonRol);
  });

  mostrarVistaSeleccionRol();
}

/* =====================================================
   VALIDAR USUARIO YA REGISTRADO
===================================================== */

async function validarPerfilUsuario(user) {
  const correo = normalizarCorreo(user.email);

  if (!correo) {
    throw new Error("La cuenta Google no tiene un correo disponible.");
  }

  const referenciaUsuario = doc(db, "usuarios", correo);

  const documentoUsuario = await getDoc(referenciaUsuario);

  if (!documentoUsuario.exists()) {
    await signOut(auth);

    throw new Error(
      "Esta cuenta no está autorizada. Comunícate con soportetecnico.tec495@gmail.com",
    );
  }

  const perfil = documentoUsuario.data();

  const estado = String(perfil.estado || "")
    .trim()
    .toUpperCase();

  const roles = obtenerRolesPerfil(perfil);

  if (estado !== "ACTIVO") {
    await signOut(auth);

    throw new Error(
      `Tu cuenta no está habilitada. Estado actual: ${estado || "SIN ESTADO"}.`,
    );
  }

  if (!roles.length) {
    await signOut(auth);

    throw new Error("Tu cuenta no tiene ningún rol válido configurado.");
  }

  return {
    correo,

    nombreCompleto: perfil.nombreCompleto || user.displayName || correo,

    rol: roles[0],

    roles,

    estado,

    tipoVinculo: perfil.tipoVinculo || "",
  };
}

/* =====================================================
   PROCESAR LOGIN NORMAL
===================================================== */

async function procesarUsuarioAutenticado(user) {
  mostrarMensaje("Verificando autorización...");

  try {
    eliminarRolActivo();

    const perfil = await validarPerfilUsuario(user);

    console.log("Perfil autorizado:", perfil);

    if (perfil.roles.length === 1) {
      const portal = PORTALES_POR_ROL[perfil.roles[0]];

      mostrarMensaje(
        `Bienvenido/a, ${perfil.nombreCompleto}. Ingresando como ${portal.etiqueta}...`,
      );

      setTimeout(() => {
        ingresarAlPortalDelRol(perfil.roles[0]);
      }, 900);

      return;
    }

    construirSelectorRoles(perfil);
  } catch (error) {
    console.error("Error de autorización:", error);

    mostrarVistaLogin();

    mostrarMensaje(error.message);

    if (boton) {
      boton.disabled = false;
    }
  }
}

/* =====================================================
   PERSISTENCIA
===================================================== */

await setPersistence(auth, browserSessionPersistence);

/* =====================================================
   BOTÓN LOGIN NORMAL
===================================================== */

if (boton) {
  boton.addEventListener("click", async () => {
    desactivarModoSolicitud();

    eliminarRolActivo();

    mostrarMensaje(
      "Seleccioná la cuenta de Google con la que querés ingresar...",
    );

    boton.disabled = true;

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error Firebase:", error);

      if (error.code === "auth/popup-closed-by-user") {
        mostrarMensaje("No se seleccionó ninguna cuenta.");
      } else {
        mostrarMensaje(
          `Error de acceso: ${error.code || error.message || "Desconocido"}`,
        );
      }

      boton.disabled = false;
    }
  });
}

/* =====================================================
   VERIFICAR GOOGLE PARA SOLICITUD

   NO escribe nada en Firestore.
===================================================== */

if (btnGoogleSolicitud) {
  btnGoogleSolicitud.addEventListener("click", async () => {
    activarModoSolicitud();

    eliminarRolActivo();

    mostrarMensajeSolicitud("Elegí tu cuenta de Google...");

    btnGoogleSolicitud.disabled = true;

    try {
      const resultado = await signInWithPopup(auth, provider);

      completarCorreoSolicitud(resultado.user);
    } catch (error) {
      console.error("Error al verificar el correo de la solicitud:", error);

      desactivarModoSolicitud();

      if (error.code === "auth/popup-closed-by-user") {
        mostrarMensajeSolicitud("No se seleccionó ninguna cuenta.");
      } else {
        mostrarMensajeSolicitud(
          `No se pudo verificar la cuenta: ${
            error.code || error.message || "Error desconocido"
          }`,
        );
      }
    } finally {
      btnGoogleSolicitud.disabled = false;
    }
  });
}

/* =====================================================
   ENVIAR SOLICITUD DE ALTA

   IMPORTANTE:
   - NO crea usuarios.
   - NO asigna roles.
   - NO modifica la colección usuarios.
   - Solo crea una solicitud PENDIENTE.
===================================================== */

if (formSolicitudAlumno) {
  formSolicitudAlumno.addEventListener("submit", async (event) => {
    event.preventDefault();

    mostrarMensajeSolicitud("");

    const user = auth.currentUser;

    /* ================================================
         CUENTA GOOGLE
      ================================================= */

    if (!user || !user.email) {
      mostrarMensajeSolicitud("Primero verificá tu cuenta de Google.");

      return;
    }

    const correoAutenticado = String(user.email).trim();

    /* ================================================
         DATOS DEL FORMULARIO
      ================================================= */

    const nombreCompleto = String(solicitudNombreCompleto?.value || "")
      .trim()
      .replace(/\s+/g, " ");

    const dni = String(solicitudDni?.value || "").replace(/\D/g, "");

    /* ================================================
         VALIDACIONES
      ================================================= */

    if (nombreCompleto.length < 5) {
      mostrarMensajeSolicitud("Ingresá tu apellido y nombre completo.");

      solicitudNombreCompleto?.focus();

      return;
    }

    if (!/^[0-9]{7,8}$/.test(dni)) {
      mostrarMensajeSolicitud("Ingresá un DNI válido de 7 u 8 números.");

      solicitudDni?.focus();

      return;
    }

    /* ================================================
         BLOQUEAMOS EL BOTÓN DURANTE EL PROCESO
      ================================================= */

    if (btnEnviarSolicitud) {
      btnEnviarSolicitud.disabled = true;
    }

    mostrarMensajeSolicitud("");

    if (btnEnviarSolicitud) {
      btnEnviarSolicitud.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Enviando...
  `;
    }

    try {
      /* ==============================================
           1. COMPROBAR SI YA ES USUARIO DEL PORTAL

           Esto es solo una comprobación amigable.
           Las reglas de Firestore también lo impiden.
        =============================================== */

      const correoUsuario = normalizarCorreo(correoAutenticado);

      const referenciaUsuario = doc(db, "usuarios", correoUsuario);

      const usuarioExistente = await getDoc(referenciaUsuario);

      if (usuarioExistente.exists()) {
        mostrarMensajeSolicitud(
          "Esta cuenta ya tiene acceso al Portal Institucional.",
        );

        return;
      }

      /* ==============================================
           2. COMPROBAR SI YA ENVIÓ UNA SOLICITUD
        =============================================== */

      const referenciaSolicitud = doc(db, "solicitudes_alta_alumnos", user.uid);

      const solicitudExistente = await getDoc(referenciaSolicitud);

      if (solicitudExistente.exists()) {
        const datos = solicitudExistente.data();

        const estado = String(datos.estado || "PENDIENTE").toUpperCase();

        mostrarMensajeSolicitud("");

        if (estado === "PENDIENTE") {
          if (tituloSolicitudAlumno) {
            tituloSolicitudAlumno.textContent =
              "Ya tenés una solicitud enviada.";
          }

          if (descripcionSolicitudAlumno) {
            descripcionSolicitudAlumno.textContent =
              "La escuela puede demorar hasta 24 hs en procesar el alta.";
          }

          if (btnEnviarSolicitud) {
            btnEnviarSolicitud.innerHTML = `
        <i class="fa-solid fa-check"></i>
        Solicitud Enviada.
      `;

            btnEnviarSolicitud.disabled = true;
          }

          if (solicitudNombreCompleto) {
            solicitudNombreCompleto.disabled = true;
          }

          if (solicitudDni) {
            solicitudDni.disabled = true;
          }

          if (btnGoogleSolicitud) {
            btnGoogleSolicitud.disabled = true;
          }

          return;
        }

        /* Para otros estados lo dejamos preparado
     hasta que implementemos aprobación/rechazo. */

        if (btnEnviarSolicitud) {
          btnEnviarSolicitud.innerHTML = `
      <i class="fa-solid fa-paper-plane"></i>
      Enviar solicitud
    `;
        }

        mostrarMensajeSolicitud(
          `La solicitud asociada a esta cuenta tiene estado: ${estado}.`,
        );

        return;
      }

      /* ==============================================
           3. CREAR SOLICITUD

           Los únicos datos que aporta el alumno son:
           - nombreCompleto
           - correo
           - dni

           Estado y fecha los controla el sistema.
        =============================================== */

      await setDoc(referenciaSolicitud, {
        uid: user.uid,

        correo: correoAutenticado,

        nombreCompleto,

        dni,

        estado: "PENDIENTE",

        fechaSolicitud: serverTimestamp(),
      });

      /* ==============================================
   ÉXITO
============================================== */

      mostrarMensajeSolicitud("");

      if (tituloSolicitudAlumno) {
        tituloSolicitudAlumno.textContent = "Solicitud enviada correctamente.";
      }

      if (descripcionSolicitudAlumno) {
        descripcionSolicitudAlumno.textContent =
          "La escuela puede demorar hasta 24 hs en procesar el alta.";
      }

      if (btnEnviarSolicitud) {
        btnEnviarSolicitud.innerHTML = `
    <i class="fa-solid fa-check"></i>
    Solicitud Enviada.
  `;

        btnEnviarSolicitud.disabled = true;
      }

      if (solicitudNombreCompleto) {
        solicitudNombreCompleto.disabled = true;
      }

      if (solicitudDni) {
        solicitudDni.disabled = true;
      }

      if (btnGoogleSolicitud) {
        btnGoogleSolicitud.disabled = true;
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);

      if (error.code === "permission-denied") {
        mostrarMensajeSolicitud(
          "No se pudo enviar la solicitud. Verificá que la cuenta no tenga ya acceso al Portal.",
        );
      } else {
        mostrarMensajeSolicitud(
          "No se pudo enviar la solicitud. Intentá nuevamente.",
        );
      }
      if (btnEnviarSolicitud) {
        btnEnviarSolicitud.innerHTML = `
    <i class="fa-solid fa-paper-plane"></i>
    Enviar solicitud
  `;
      }
    } finally {
      /*
          Si los campos siguen habilitados significa
          que la solicitud no fue creada.
        */

      if (btnEnviarSolicitud && !solicitudNombreCompleto?.disabled) {
        btnEnviarSolicitud.disabled = false;
      }
    }
  });
}

/* =====================================================
   VOLVER DESDE SOLICITUD
===================================================== */

if (btnVolverLoginSolicitud) {
  btnVolverLoginSolicitud.addEventListener("click", async () => {
    desactivarModoSolicitud();

    limpiarCorreoSolicitud();

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error al cerrar la identificación de solicitud:", error);
    }
  });
}

/* =====================================================
   CAMBIAR CUENTA EN SELECTOR DE ROLES
===================================================== */

if (btnElegirOtraCuenta) {
  btnElegirOtraCuenta.addEventListener("click", async () => {
    desactivarModoSolicitud();

    eliminarRolActivo();

    if (opcionesRoles) {
      opcionesRoles.innerHTML = "";
    }

    mostrarMensajeSeleccionRol("");

    try {
      await signOut(auth);

      mostrarVistaLogin();

      mostrarMensaje(
        "Presioná “Ingresar con Google” para seleccionar otra cuenta.",
      );
    } catch (error) {
      console.error("Error al cambiar de cuenta:", error);

      mostrarMensajeSeleccionRol(
        "No se pudo cambiar de cuenta. Intentá nuevamente.",
      );
    }
  });
}

/* =====================================================
   OBSERVADOR DE AUTENTICACIÓN
===================================================== */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!estaEnModoSolicitud()) {
      mostrarVistaLogin();
    }

    return;
  }

  /*
      Si estamos verificando una solicitud,
      NO buscamos todavía al usuario en
      la colección usuarios.
    */

  if (estaEnModoSolicitud()) {
    try {
      completarCorreoSolicitud(user);
    } catch (error) {
      console.error("Error al recuperar el correo de la solicitud:", error);

      mostrarMensajeSolicitud(error.message);
    }

    return;
  }

  /*
      Login institucional normal.
      Funciona como hasta ahora.
    */

  await procesarUsuarioAutenticado(user);
});
