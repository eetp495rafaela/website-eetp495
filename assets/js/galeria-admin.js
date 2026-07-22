"use strict";

/* =====================================================
   ADMINISTRACIÓN DE GALERÍA INSTITUCIONAL
===================================================== */

import {
  initializeApp,
  getApp,
  getApps,
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

const BACKEND_GALERIA_URL =
  "https://script.google.com/macros/s/AKfycbwgqaaYJLlGZl7CcxcYRwy-qqPrlqKoL2L1qDxk0nqsPCbVZqmmbTS5KaCsdDNxVpq-/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const btnSincronizarGaleria = document.getElementById("btnSincronizarGaleria");

const mensajeSincronizacionGaleria = document.getElementById(
  "mensajeSincronizacionGaleria",
);

const cuerpoTablaGaleriaAdmin = document.getElementById(
  "cuerpoTablaGaleriaAdmin",
);

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensajeGaleriaAdmin(mensaje, tipo = "") {
  if (!mensajeSincronizacionGaleria) return;

  mensajeSincronizacionGaleria.textContent = mensaje || "";
  mensajeSincronizacionGaleria.className = "mensaje-formulario";

  if (tipo) {
    mensajeSincronizacionGaleria.classList.add(tipo);
  }
}

/* =====================================================
   USUARIO AUTENTICADO
===================================================== */

function obtenerUsuarioAutenticado() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let cancelarObservador = () => {};

    const temporizador = window.setTimeout(() => {
      cancelarObservador();

      reject(
        new Error(
          "No fue posible comprobar la sesión del usuario. Recargá el panel.",
        ),
      );
    }, 10000);

    cancelarObservador = onAuthStateChanged(
      auth,
      (usuario) => {
        window.clearTimeout(temporizador);
        cancelarObservador();

        if (!usuario) {
          reject(
            new Error(
              "La sesión no está disponible. Ingresá nuevamente al portal.",
            ),
          );

          return;
        }

        resolve(usuario);
      },
      (error) => {
        window.clearTimeout(temporizador);
        cancelarObservador();

        reject(error);
      },
    );
  });
}

/* =====================================================
   TABLA DE RESULTADOS
===================================================== */

function obtenerFilasGaleriaAdmin() {
  if (!cuerpoTablaGaleriaAdmin) {
    return [];
  }

  return Array.from(
    cuerpoTablaGaleriaAdmin.querySelectorAll("tr[data-categoria]"),
  );
}

function prepararTablaParaRevision() {
  obtenerFilasGaleriaAdmin().forEach((fila) => {
    const estado = fila.querySelector(".estado-galeria-admin");
    const cantidad = fila.querySelector(".cantidad-galeria-admin");

    if (estado) {
      estado.textContent = "Revisando...";
    }

    if (cantidad) {
      cantidad.textContent = "—";
    }

    fila.removeAttribute("title");
  });
}

function mostrarErrorEnTabla() {
  obtenerFilasGaleriaAdmin().forEach((fila) => {
    const estado = fila.querySelector(".estado-galeria-admin");
    const cantidad = fila.querySelector(".cantidad-galeria-admin");

    if (estado) {
      estado.textContent = "No completada";
    }

    if (cantidad) {
      cantidad.textContent = "—";
    }
  });
}

function mostrarResultadosEnTabla(categorias) {
  const resultados = new Map(
    Array.isArray(categorias)
      ? categorias.map((categoria) => [categoria.clave, categoria])
      : [],
  );

  obtenerFilasGaleriaAdmin().forEach((fila) => {
    const clave = String(fila.dataset.categoria || "").trim();
    const resultado = resultados.get(clave);

    const estado = fila.querySelector(".estado-galeria-admin");
    const cantidad = fila.querySelector(".cantidad-galeria-admin");

    if (!resultado) {
      if (estado) {
        estado.textContent = "Sin información";
      }

      if (cantidad) {
        cantidad.textContent = "—";
      }

      return;
    }

    const nuevas = Number(resultado.nuevas || 0);
    const existentes = Number(resultado.existentes || 0);
    const omitidas = Number(resultado.omitidas || 0);

    if (estado) {
      estado.textContent =
        nuevas > 0 ? "Fotografías publicadas" : "Sin novedades";
    }

    if (cantidad) {
      cantidad.textContent = String(nuevas);
    }

    fila.title =
      `Nuevas: ${nuevas} · ` +
      `Ya publicadas: ${existentes} · ` +
      `Archivos omitidos: ${omitidas}`;
  });
}

/* =====================================================
   COMUNICACIÓN CON APPS SCRIPT
===================================================== */

async function enviarSincronizacionGaleria(idToken) {
  const respuesta = await fetch(BACKEND_GALERIA_URL, {
    method: "POST",
    body: JSON.stringify({
      accion: "sincronizar_galeria",
      idToken,
    }),
  });

  const texto = await respuesta.text();

  let datos;

  try {
    datos = JSON.parse(texto || "{}");
  } catch (error) {
    console.error("Respuesta recibida:", texto);

    throw new Error(
      "El servidor devolvió una respuesta que no pudo interpretarse.",
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        `El servidor respondió con el código HTTP ${respuesta.status}.`,
    );
  }

  if (!datos.ok) {
    throw new Error(
      datos.mensaje || "No se pudo sincronizar la galería institucional.",
    );
  }

  return datos;
}

/* =====================================================
   SINCRONIZACIÓN
===================================================== */

async function sincronizarGaleriaInstitucional() {
  if (!btnSincronizarGaleria) return;

  const confirmacion = await Swal.fire({
    icon: "question",
    title: "¿Revisar las carpetas de la galería?",
    text: "Se publicarán únicamente las fotografías nuevas cargadas en Google Drive.",
    showCancelButton: true,
    confirmButtonText: "Sí, revisar y publicar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: "#0b4edb",
    cancelButtonColor: "#6c757d",
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  const contenidoOriginalBoton = btnSincronizarGaleria.innerHTML;

  try {
    btnSincronizarGaleria.disabled = true;

    btnSincronizarGaleria.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Revisando fotografías...
    `;

    mostrarMensajeGaleriaAdmin(
      "Revisando las seis carpetas de Google Drive. Esto puede tardar unos segundos...",
    );

    prepararTablaParaRevision();

    const usuario = await obtenerUsuarioAutenticado();

    const idToken = await usuario.getIdToken(true);

    const datos = await enviarSincronizacionGaleria(idToken);

    const resultado = datos.resultado || {};
    const totalNuevas = Number(resultado.totalNuevas || 0);
    const totalExistentes = Number(resultado.totalExistentes || 0);
    const totalOmitidas = Number(resultado.totalOmitidas || 0);

    mostrarResultadosEnTabla(resultado.categorias);

    if (totalNuevas > 0) {
      mostrarMensajeGaleriaAdmin(
        `Se publicaron ${totalNuevas} fotografía${totalNuevas === 1 ? "" : "s"} nueva${totalNuevas === 1 ? "" : "s"}.`,
        "mensaje-exito",
      );
    } else {
      mostrarMensajeGaleriaAdmin(
        "La revisión finalizó correctamente. No se encontraron fotografías nuevas.",
        "mensaje-exito",
      );
    }

    await Swal.fire({
      icon: "success",
      title: totalNuevas > 0 ? "Fotografías publicadas" : "Galería actualizada",
      html: `
        <p>
          Fotografías nuevas:
          <strong>${totalNuevas}</strong>
        </p>

        <p>
          Ya publicadas:
          <strong>${totalExistentes}</strong>
        </p>

        <p>
          Archivos omitidos:
          <strong>${totalOmitidas}</strong>
        </p>
      `,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0b4edb",
    });
  } catch (error) {
    console.error("Error al sincronizar la galería:", error);

    mostrarErrorEnTabla();

    mostrarMensajeGaleriaAdmin(
      error.message ||
        "Ocurrió un error al sincronizar la galería institucional.",
      "mensaje-error",
    );

    await Swal.fire({
      icon: "error",
      title: "No se pudo actualizar la galería",
      text: error.message || "Ocurrió un error al sincronizar las fotografías.",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0b4edb",
    });
  } finally {
    btnSincronizarGaleria.disabled = false;
    btnSincronizarGaleria.innerHTML = contenidoOriginalBoton;
  }
}

/* =====================================================
   EVENTOS
===================================================== */

if (btnSincronizarGaleria) {
  btnSincronizarGaleria.addEventListener(
    "click",
    sincronizarGaleriaInstitucional,
  );
}
