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

const btnActualizarEventosCalendarioAdmin = document.getElementById(
  "btnActualizarEventosCalendarioAdmin",
);

const cuerpoTablaCalendarioAdmin = document.getElementById(
  "cuerpoTablaCalendarioAdmin",
);

const mensajeListadoCalendarioAdmin = document.getElementById(
  "mensajeListadoCalendarioAdmin",
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

const btnCancelarEdicionCalendarioAdmin = document.getElementById(
  "btnCancelarEdicionCalendarioAdmin",
);

const mensajeCalendarioEscolarAdmin = document.getElementById(
  "mensajeCalendarioEscolarAdmin",
);

let eventosCalendarioAdmin = [];
let idEventoEditandoCalendarioAdmin = "";

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

function iniciarEdicionCalendarioAdmin(evento) {
  idEventoEditandoCalendarioAdmin = evento.id || "";

  calendarioFechaInicioAdmin.value = evento.fechaInicio || "";

  calendarioFechaFinAdmin.value = evento.fechaFin || "";

  calendarioEtiquetaAdmin.value = evento.etiqueta || "";

  calendarioTituloAdmin.value = evento.titulo || "";

  calendarioDescripcionAdmin.value = evento.descripcion || "";

  btnGuardarEventoCalendarioAdmin.innerHTML = `
    <i class="fa-solid fa-floppy-disk"></i>
    Guardar cambios
  `;

  if (btnCancelarEdicionCalendarioAdmin) {
    btnCancelarEdicionCalendarioAdmin.hidden = false;
  }

  mostrarMensajeCalendarioAdmin("Estás editando un evento existente.");

  calendarioFechaInicioAdmin.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  setTimeout(() => {
    calendarioFechaInicioAdmin.focus({
      preventScroll: true,
    });
  }, 400);
}

function cancelarEdicionCalendarioAdmin() {
  idEventoEditandoCalendarioAdmin = "";

  formCalendarioEscolarAdmin.reset();

  btnGuardarEventoCalendarioAdmin.innerHTML = `
    <i class="fa-solid fa-calendar-plus"></i>
    Guardar evento
  `;

  if (btnCancelarEdicionCalendarioAdmin) {
    btnCancelarEdicionCalendarioAdmin.hidden = true;
  }

  mostrarMensajeCalendarioAdmin("");
}

if (btnCancelarEdicionCalendarioAdmin) {
  btnCancelarEdicionCalendarioAdmin.addEventListener(
    "click",
    cancelarEdicionCalendarioAdmin,
  );
}

/* =====================================================
   LISTADO DE EVENTOS
===================================================== */

function mostrarMensajeListadoCalendarioAdmin(texto, tipo = "") {
  if (!mensajeListadoCalendarioAdmin) {
    return;
  }

  mensajeListadoCalendarioAdmin.textContent = texto || "";

  mensajeListadoCalendarioAdmin.className = "mensaje-formulario";

  if (tipo) {
    mensajeListadoCalendarioAdmin.classList.add(tipo);
  }
}

function formatearFechaCalendarioAdmin(fechaISO) {
  const partes = String(fechaISO || "").split("-");

  if (partes.length !== 3) {
    return fechaISO || "-";
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

async function cargarEventosCalendarioAdmin() {
  if (!cuerpoTablaCalendarioAdmin) {
    return;
  }

  cuerpoTablaCalendarioAdmin.innerHTML = `
    <tr>
      <td colspan="5" class="tabla-vacia">
        Cargando eventos...
      </td>
    </tr>
  `;

  mostrarMensajeListadoCalendarioAdmin("Consultando eventos publicados...");

  try {
    const respuesta = await fetch(BACKEND_CALENDARIO_ESCOLAR_URL);

    if (!respuesta.ok) {
      throw new Error("No se pudieron consultar los eventos.");
    }

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(datos.error || "No se pudieron consultar los eventos.");
    }

    eventosCalendarioAdmin = Array.isArray(datos.eventos) ? datos.eventos : [];

    const eventos = eventosCalendarioAdmin;

    eventos.sort((a, b) =>
      String(a.fechaInicio || "").localeCompare(String(b.fechaInicio || "")),
    );

    cuerpoTablaCalendarioAdmin.innerHTML = "";

    if (!eventos.length) {
      cuerpoTablaCalendarioAdmin.innerHTML = `
        <tr>
          <td colspan="5" class="tabla-vacia">
            Todavía no hay eventos publicados.
          </td>
        </tr>
      `;

      mostrarMensajeListadoCalendarioAdmin(
        "Todavía no hay eventos publicados.",
      );

      return;
    }

    eventos.forEach((evento) => {
      const fila = document.createElement("tr");

      const fechaInicio = document.createElement("td");

      fechaInicio.textContent = formatearFechaCalendarioAdmin(
        evento.fechaInicio,
      );

      const fechaFin = document.createElement("td");

      fechaFin.textContent = formatearFechaCalendarioAdmin(evento.fechaFin);

      const etiqueta = document.createElement("td");

      etiqueta.textContent = evento.etiqueta || "-";

      const titulo = document.createElement("td");

      titulo.textContent = evento.titulo || "-";

      const acciones = document.createElement("td");

      const btnEditar = document.createElement("button");

      btnEditar.type = "button";
      btnEditar.className = "btn-accion";
      btnEditar.innerHTML = `
  <i class="fa-solid fa-pen"></i>
  Editar
`;

      btnEditar.addEventListener("click", () => {
        iniciarEdicionCalendarioAdmin(evento);
      });

      acciones.appendChild(btnEditar);

      const btnEliminar = document.createElement("button");

      btnEliminar.type = "button";
      btnEliminar.className = "btn-accion";
      btnEliminar.innerHTML = `
  <i class="fa-solid fa-trash"></i>
  Eliminar
`;

      btnEliminar.addEventListener("click", async () => {
        const confirmacion = await Swal.fire({
          title: "Eliminar evento",
          text: "¿Confirmás eliminar este evento del Calendario Escolar?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) {
          return;
        }

        try {
          const usuario = auth.currentUser;

          if (!usuario) {
            throw new Error("No se detectó una sesión activa.");
          }

          const idToken = await usuario.getIdToken(true);

          const resultado = await enviarAlBackendCalendario({
            accion: "eliminar_evento_calendario",

            idToken,

            idEvento: evento.id,
          });

          if (!resultado.ok) {
            throw new Error(
              resultado.error || "No se pudo eliminar el evento.",
            );
          }

          await cargarEventosCalendarioAdmin();

          await Swal.fire({
            title: "Evento eliminado",
            text: "El evento fue eliminado correctamente del Calendario Escolar.",
            icon: "success",
            confirmButtonText: "Aceptar",
          });
        } catch (error) {
          console.error(
            "Error al eliminar evento del Calendario Escolar:",
            error,
          );

          await Swal.fire({
            title: "No se pudo eliminar",
            text: error.message || "Ocurrió un error al eliminar el evento.",
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        }
      });

      acciones.appendChild(btnEliminar);

      fila.appendChild(fechaInicio);
      fila.appendChild(fechaFin);
      fila.appendChild(etiqueta);
      fila.appendChild(titulo);
      fila.appendChild(acciones);

      cuerpoTablaCalendarioAdmin.appendChild(fila);
    });

    mostrarMensajeListadoCalendarioAdmin(
      `${eventos.length} evento(s) cargado(s).`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar eventos del Calendario Escolar:", error);

    cuerpoTablaCalendarioAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          No se pudieron cargar los eventos.
        </td>
      </tr>
    `;

    mostrarMensajeListadoCalendarioAdmin(
      error.message || "No se pudieron cargar los eventos.",
      "error",
    );
  }
}

if (btnActualizarEventosCalendarioAdmin) {
  btnActualizarEventosCalendarioAdmin.addEventListener(
    "click",
    cargarEventosCalendarioAdmin,
  );
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

      const estaEditando = Boolean(idEventoEditandoCalendarioAdmin);

      const resultado = await enviarAlBackendCalendario({
        accion: estaEditando
          ? "editar_evento_calendario"
          : "guardar_evento_calendario",

        idToken,

        idEvento: estaEditando ? idEventoEditandoCalendarioAdmin : "",

        evento: eventoCalendario,
      });

      if (!resultado.ok) {
        throw new Error(resultado.error || "No se pudo guardar el evento.");
      }

      const fueEdicion = Boolean(idEventoEditandoCalendarioAdmin);

      cancelarEdicionCalendarioAdmin();

      await cargarEventosCalendarioAdmin();

      mostrarMensajeCalendarioAdmin(
        resultado.mensaje || "Evento guardado correctamente.",
        "ok",
      );

      await Swal.fire({
        title: fueEdicion ? "Evento actualizado" : "Evento guardado",

        text: fueEdicion
          ? "Los cambios fueron guardados correctamente."
          : "El evento fue agregado correctamente al Calendario Escolar.",

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

      btnGuardarEventoCalendarioAdmin.innerHTML =
        idEventoEditandoCalendarioAdmin
          ? `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar cambios
    `
          : `
      <i class="fa-solid fa-calendar-plus"></i>
      Guardar evento
    `;
    }
  });
}
