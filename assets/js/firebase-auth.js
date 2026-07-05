import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

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
const provider = new GoogleAuthProvider();

const boton = document.getElementById("btnGoogle");
const mensaje = document.querySelector(".mensaje-login");

function mostrarMensaje(texto) {
  if (mensaje) {
    mensaje.textContent = texto;
  }
}

await setPersistence(auth, browserLocalPersistence);

if (boton) {
  boton.addEventListener("click", async () => {
    mostrarMensaje("Redirigiendo a Google...");
    boton.disabled = true;

    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error(error);
      mostrarMensaje("No fue posible iniciar sesión con Google.");
      boton.disabled = false;
    }
  });
}

try {
  await getRedirectResult(auth);
} catch (error) {
  console.error(error);
  mostrarMensaje("No fue posible completar el acceso con Google.");
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  mostrarMensaje(`Cuenta detectada: ${user.email}`);

  console.log("Usuario Firebase:", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  });
});
