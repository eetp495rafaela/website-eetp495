import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
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

function volverAlLogin(mensaje = "") {
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

function obtenerRolEsperado() {
  return String(document.body.dataset.rolPermitido || "")
    .trim()
    .toUpperCase();
}

function mostrarDatosUsuario(perfil, user, correo, rolUsuario) {
  const elementoNombre = document.querySelector("[data-nombre-usuario]");
  const elementoRol = document.querySelector("[data-rol-usuario]");

  const nombreVisible = perfil.nombreCompleto || user.displayName || correo;

  const rolesLegibles = {
    ALUMNO: "Estudiante",
    DOCENTE: "Docente",
    SOPORTE: "Soporte Institucional",
  };

  if (elementoNombre) {
    elementoNombre.textContent = nombreVisible;
  }

  if (elementoRol) {
    elementoRol.textContent = rolesLegibles[rolUsuario] || rolUsuario;
  }
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
  const rolEsperado = obtenerRolEsperado();

  if (!user || !rolEsperado) {
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

    const rolUsuario = String(perfil.rol || "")
      .trim()
      .toUpperCase();

    if (estado !== "ACTIVO") {
      await signOut(auth);
      volverAlLogin("Tu cuenta no se encuentra activa.");
      return;
    }

    if (accesoVencido(perfil.fechaFinAcceso)) {
      await signOut(auth);
      volverAlLogin("Tu acceso institucional ha finalizado.");
      return;
    }

    if (rolUsuario !== rolEsperado) {
      await signOut(auth);
      volverAlLogin("Tu cuenta no tiene permiso para este portal.");
      return;
    }
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
