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

function volverAlLogin() {
  window.location.replace("../login.html");
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
      volverAlLogin();
      return;
    }

    const referencia = doc(db, "usuarios", correo);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      await signOut(auth);
      volverAlLogin();
      return;
    }

    const perfil = documento.data();

    const estado = String(perfil.estado || "")
      .trim()
      .toUpperCase();

    const rolUsuario = String(perfil.rol || "")
      .trim()
      .toUpperCase();

    if (estado !== "ACTIVO" || rolUsuario !== rolEsperado) {
      await signOut(auth);
      volverAlLogin();
      return;
    }

    console.log("Acceso autorizado:", {
      correo,
      nombreCompleto: perfil.nombreCompleto || "",
      rol: rolUsuario,
    });
  } catch (error) {
    console.error("Error al verificar acceso:", error);

    await signOut(auth);
    volverAlLogin();
  }
});
