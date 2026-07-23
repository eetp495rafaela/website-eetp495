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

const boton = document.getElementById("btnGoogle");
const mensaje = document.querySelector(".mensaje-login");

function mostrarMensaje(texto) {
  if (mensaje) {
    mensaje.textContent = texto;
  }
}

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
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
  const rol = String(perfil.rol || "")
    .trim()
    .toUpperCase();

  if (estado !== "ACTIVO") {
    await signOut(auth);

    throw new Error(
      `Tu cuenta no está habilitada. Estado actual: ${estado || "SIN ESTADO"}.`,
    );
  }

  if (
    ![
      "ALUMNO",
      "DOCENTE",
      "SOPORTE",
      "PRECEPTORIA",
      "SECRETARIA",
      "DIRECCION",
    ].includes(rol)
  ) {
    await signOut(auth);

    throw new Error("Tu cuenta no tiene un rol válido configurado.");
  }

  return {
    correo,
    nombreCompleto: perfil.nombreCompleto || user.displayName || correo,
    rol,
    estado,
    tipoVinculo: perfil.tipoVinculo || "",
  };
}

async function procesarUsuarioAutenticado(user) {
  mostrarMensaje("Verificando autorización...");

  try {
    const perfil = await validarPerfilUsuario(user);

    console.log("Perfil autorizado:", perfil);

    mostrarMensaje(
      `Bienvenido/a, ${perfil.nombreCompleto}. Ingresando al portal...`,
    );

    setTimeout(() => {
      if (perfil.rol === "SOPORTE") {
        window.location.href = "admin/index.html";
        return;
      }

      if (perfil.rol === "DOCENTE") {
        window.location.href = "docentes/index.html";
        return;
      }

      if (perfil.rol === "ALUMNO") {
        window.location.href = "alumnos/index.html";
        return;
      }

      if (["PRECEPTORIA", "SECRETARIA", "DIRECCION"].includes(perfil.rol)) {
        window.location.href = "gestion/index.html";
        return;
      }

      mostrarMensaje("Tu cuenta no tiene un portal asignado.");
      boton.disabled = false;
    }, 900);
  } catch (error) {
    console.error("Error de autorización:", error);

    mostrarMensaje(`Acceso denegado: ${error.message}`);

    boton.disabled = false;
  }
}

await setPersistence(auth, browserSessionPersistence);

if (boton) {
  boton.addEventListener("click", async () => {
    mostrarMensaje("Abriendo acceso con Google...");
    boton.disabled = true;

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error Firebase:", error);

      mostrarMensaje(`Error de acceso: ${error.code || "Desconocido"}`);

      boton.disabled = false;
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return;
  }

  await procesarUsuarioAutenticado(user);
});
