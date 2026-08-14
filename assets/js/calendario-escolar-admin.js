"use strict";

import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

/* =====================================================
   BACKEND CALENDARIO ESCOLAR
===================================================== */

const BACKEND_CALENDARIO_ESCOLAR_URL =
  "https://script.google.com/macros/s/AKfycbzRqnjl70VJosj9WHL-JGBn0hQ5COZtYQKNiYrJFfyfrdMQ_xDSJxNt0B7RUUbgW2z4iw/exec";

/* =====================================================
   ELEMENTOS
===================================================== */

const formCalendarioEscolarAdmin = document.getElementById(
  "formCalendarioEscolarAdmin",
);

const calendarioFechaInicioAdmin = document.getElementById(
  "calendarioFechaInicioAdmin",
);

const calendarioFechaFinAdmin = document.getElementById(
  "calendarioFechaFinAdmin",
);

const calendarioEtiquetaAdmin = document.getElementById(
  "calendarioEtiquetaAdmin",
);

const calendarioTituloAdmin = document.getElementById("calendarioTituloAdmin");

const calendarioDescripcionAdmin = document.getElementById(
  "calendarioDescripcionAdmin",
);

const btnGuardarEventoCalendarioAdmin = document.getElementById(
  "btnGuardarEventoCalendarioAdmin",
);

const mensajeCalendarioEscolarAdmin = document.getElementById(
  "mensajeCalendarioEscolarAdmin",
);

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensajeCalendarioAdmin(texto, tipo = "") {
  if (!mensajeCalendarioEscolarAdmin) {
    return;
  }

  mensajeCalendarioEscolarAdmin.textContent = texto || "";

  mensajeCalendarioEscolarAdmin.className = "mensaje-formulario";

  if (tipo) {
    mensajeCalendarioEscolarAdmin.classList.add(tipo);
  }
}

/* =====================================================
   COMUNICACIÓN CON APPS SCRIPT
===================================================== */

async function enviarAlBackendCalendario(datos) {
  const respuesta = await fetch(BACKEND_CALENDARIO_ESCOLAR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error(
      "No se pudo establecer comunicación con el Calendario Escolar.",
    );
  }

  return respuesta.json();
}

/* =====================================================
   GUARDAR EVENTO
===================================================== */

if (formCalendarioEscolarAdmin) {
  formCalendarioEscolarAdmin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = auth.currentUser;

    if (!usuario) {
      mostrarMensajeCalendarioAdmin(
        "No se detectó una sesión activa.",
        "error",
      );

      return;
    }

    const eventoCalendario = {
      fechaInicio: calendarioFechaInicioAdmin.value.trim(),

      fechaFin: calendarioFechaFinAdmin.value.trim(),

      etiqueta: calendarioEtiquetaAdmin.value.trim(),

      titulo: calendarioTituloAdmin.value.trim(),

      descripcion: calendarioDescripcionAdmin.value.trim(),
    };

    if (
      !eventoCalendario.fechaInicio ||
      !eventoCalendario.fechaFin ||
      !eventoCalendario.etiqueta ||
      !eventoCalendario.titulo ||
      !eventoCalendario.descripcion
    ) {
      mostrarMensajeCalendarioAdmin(
        "Completá todos los campos obligatorios.",
        "error",
      );

      return;
    }

    if (eventoCalendario.fechaFin < eventoCalendario.fechaInicio) {
      mostrarMensajeCalendarioAdmin(
        "La fecha de finalización no puede ser anterior a la fecha de inicio.",
        "error",
      );

      return;
    }

    const confirmacion = await Swal.fire({
      title: "Guardar evento",
      text: "¿Confirmás agregar este evento al Calendario Escolar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    const textoOriginal = btnGuardarEventoCalendarioAdmin.innerHTML;

    try {
      btnGuardarEventoCalendarioAdmin.disabled = true;

      btnGuardarEventoCalendarioAdmin.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i>
          Guardando...
        `;

      mostrarMensajeCalendarioAdmin("Guardando evento...");

      const idToken = await usuario.getIdToken(true);

      const resultado = await enviarAlBackendCalendario({
        accion: "guardar_evento_calendario",

        idToken,

        evento: eventoCalendario,
      });

      if (!resultado.ok) {
        throw new Error(resultado.error || "No se pudo guardar el evento.");
      }

      formCalendarioEscolarAdmin.reset();

      mostrarMensajeCalendarioAdmin(
        resultado.mensaje || "Evento guardado correctamente.",
        "ok",
      );

      await Swal.fire({
        title: "Evento guardado",
        text: "El evento fue agregado correctamente al Calendario Escolar.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error al guardar evento del Calendario Escolar:", error);

      mostrarMensajeCalendarioAdmin(
        error.message || "No se pudo guardar el evento.",
        "error",
      );
    } finally {
      btnGuardarEventoCalendarioAdmin.disabled = false;

      btnGuardarEventoCalendarioAdmin.innerHTML = textoOriginal;
    }
  });
}
