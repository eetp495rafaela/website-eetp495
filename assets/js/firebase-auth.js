import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account",
});

const CLAVE_ROL_ACTIVO = "rolActivoPortal";

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

  DIRECCION: {
    etiqueta: "Dirección",
    icono: "fa-school",
    url: "gestion/index.html",
  },
};

const boton = document.getElementById("btnGoogle");
const mensaje = document.querySelector("#vistaLogin .mensaje-login");

const vistaLogin = document.getElementById("vistaLogin");
const vistaSeleccionRol = document.getElementById("vistaSeleccionRol");
const opcionesRoles = document.getElementById("opcionesRoles");

const btnElegirOtraCuenta = document.getElementById("btnElegirOtraCuenta");

const mensajeSeleccionRol = document.getElementById("mensajeSeleccionRol");

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

function mostrarVistaLogin() {
  if (vistaLogin) {
    vistaLogin.hidden = false;
  }

  if (vistaSeleccionRol) {
    vistaSeleccionRol.hidden = true;
  }

  if (boton) {
    boton.disabled = false;
  }
}

function mostrarVistaSeleccionRol() {
  if (vistaLogin) {
    vistaLogin.hidden = true;
  }

  if (vistaSeleccionRol) {
    vistaSeleccionRol.hidden = false;
  }
}

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
      "Tu cuenta Google no está autorizada para usar el Portal Institucional.",
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

    mostrarMensaje(`Acceso denegado: ${error.message}`);

    if (boton) {
      boton.disabled = false;
    }
  }
}

await setPersistence(auth, browserSessionPersistence);

if (boton) {
  boton.addEventListener("click", async () => {
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

if (btnElegirOtraCuenta) {
  btnElegirOtraCuenta.addEventListener("click", async () => {
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

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    mostrarVistaLogin();
    return;
  }

  await procesarUsuarioAutenticado(user);
});
