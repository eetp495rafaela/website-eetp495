import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const BACKEND_SIME_URL =
  "https://script.google.com/macros/s/AKfycbwAoJxUZp7KRFneMwMUsfilojhYM7HdBl8_JVue1T9AukKD-EIacqT7UxhdokdSO6TRdQ/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

async function enviarAlBackendSime(datos) {
  const respuesta = await fetch(BACKEND_SIME_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo establecer comunicación con S.I.M.E.");
  }

  return respuesta.json();
}

async function cargarConfiguracionSimeAlumno(usuario) {
  const idToken = await usuario.getIdToken(true);

  const resultado = await enviarAlBackendSime({
    accion: "obtener_configuracion_alumno",
    idToken,
  });

  if (!resultado.ok) {
    throw new Error(
      resultado.mensaje || "No se pudo cargar la configuración de S.I.M.E.",
    );
  }

  console.log("Configuración S.I.M.E. Alumno:", resultado);

  return resultado;
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  try {
    await cargarConfiguracionSimeAlumno(usuario);
  } catch (error) {
    console.error("Error al cargar S.I.M.E.:", error);
  }
});
