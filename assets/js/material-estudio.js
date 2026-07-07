import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const BACKEND_DOCUMENTACION_URL =
  "https://script.google.com/macros/s/AKfycbyJA5XiNV_JqALCztCcSctp4eVpW25jxJaKPYvGD8qVm7mbM6oJWx99Op4vqX7pk2Eqzw/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

const btnAbrirDocumentacionAcademica = document.getElementById(
  "btnAbrirDocumentacionAcademica",
);

const panelDocumentacionAcademica = document.getElementById(
  "panelDocumentacionAcademica",
);

const btnProbarConexionDocumentacion = document.getElementById(
  "btnProbarConexionDocumentacion",
);

const formDocumentacionAcademica = document.getElementById(
  "formDocumentacionAcademica",
);

const tipoDocumentoAcademico = document.getElementById(
  "tipoDocumentoAcademico",
);

const cicloLectivoDocumento = document.getElementById("cicloLectivoDocumento");

const cursoDocumentoAcademico = document.getElementById(
  "cursoDocumentoAcademico",
);

const espacioDocumentoAcademico = document.getElementById(
  "espacioDocumentoAcademico",
);

const mensajeDocumentacionAcademica = document.getElementById(
  "mensajeDocumentacionAcademica",
);

let opcionesDocumentacion = [];

function mostrarMensajeDocumentacion(texto, tipo = "") {
  if (!mensajeDocumentacionAcademica) return;

  mensajeDocumentacionAcademica.textContent = texto;
  mensajeDocumentacionAcademica.className = `mensaje-formulario ${tipo}`.trim();
}

async function enviarAlBackend(datos) {
  const respuesta = await fetch(BACKEND_DOCUMENTACION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo establecer comunicación con el backend.");
  }

  return respuesta.json();
}

function cargarCursosDisponibles() {
  if (!cursoDocumentoAcademico) return;

  const cursos = [
    ...new Map(
      opcionesDocumentacion.map((opcion) => [
        opcion.cursoAnio,
        {
          anio: opcion.cursoAnio,
          nombre: opcion.curso,
        },
      ]),
    ).values(),
  ].sort((a, b) => a.anio - b.anio);

  cursoDocumentoAcademico.innerHTML =
    '<option value="">Seleccionar curso</option>';

  cursos.forEach((curso) => {
    const opcion = document.createElement("option");

    opcion.value = String(curso.anio);
    opcion.textContent = curso.nombre;

    cursoDocumentoAcademico.appendChild(opcion);
  });

  cursoDocumentoAcademico.disabled = false;

  espacioDocumentoAcademico.innerHTML =
    '<option value="">Primero seleccioná un curso</option>';

  espacioDocumentoAcademico.disabled = true;
}

function cargarEspaciosDisponibles() {
  const anioSeleccionado = Number(cursoDocumentoAcademico.value || 0);

  espacioDocumentoAcademico.innerHTML =
    '<option value="">Seleccionar espacio curricular</option>';

  if (!anioSeleccionado) {
    espacioDocumentoAcademico.disabled = true;
    return;
  }

  const espacios = opcionesDocumentacion
    .filter((opcion) => opcion.cursoAnio === anioSeleccionado)
    .sort((a, b) => a.espacioNombre.localeCompare(b.espacioNombre, "es"));

  espacios.forEach((espacio) => {
    const opcion = document.createElement("option");

    opcion.value = espacio.espacioId;
    opcion.textContent = espacio.espacioNombre;

    opcion.dataset.nombre = espacio.espacioNombre;
    opcion.dataset.tipo = espacio.espacioTipo || "";

    espacioDocumentoAcademico.appendChild(opcion);
  });

  espacioDocumentoAcademico.disabled = !espacios.length;
}

async function cargarOpcionesDocumentacion() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  const idToken = await usuario.getIdToken(true);

  const resultado = await enviarAlBackend({
    accion: "obtener_opciones_documentacion",
    idToken,
  });

  if (!resultado.ok) {
    throw new Error(
      resultado.mensaje || "No se pudieron cargar tus asignaciones.",
    );
  }

  opcionesDocumentacion = Array.isArray(resultado.opciones)
    ? resultado.opciones
    : [];

  if (!opcionesDocumentacion.length) {
    throw new Error(
      "No tenés asignaciones docentes activas para cargar documentación.",
    );
  }

  cicloLectivoDocumento.value = resultado.cicloLectivoActual || "2026";

  cargarCursosDisponibles();

  return resultado;
}

if (btnAbrirDocumentacionAcademica) {
  btnAbrirDocumentacionAcademica.addEventListener("click", async () => {
    panelDocumentacionAcademica.hidden = false;

    panelDocumentacionAcademica.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (opcionesDocumentacion.length) {
      mostrarMensajeDocumentacion("Tus asignaciones ya están cargadas.", "ok");
      return;
    }

    mostrarMensajeDocumentacion(
      "Cargando tus cursos y espacios curriculares...",
    );

    try {
      const resultado = await cargarOpcionesDocumentacion();

      mostrarMensajeDocumentacion(
        `Asignaciones cargadas correctamente para ${resultado.docente.nombreCompleto}.`,
        "ok",
      );
    } catch (error) {
      console.error("Error al cargar asignaciones de documentación:", error);

      mostrarMensajeDocumentacion(
        error.message || "No se pudieron cargar tus asignaciones.",
        "error",
      );
    }
  });
}

if (btnProbarConexionDocumentacion) {
  btnProbarConexionDocumentacion.addEventListener("click", async () => {
    btnProbarConexionDocumentacion.disabled = true;

    mostrarMensajeDocumentacion("Verificando sesión y asignaciones...");

    try {
      const resultado = await cargarOpcionesDocumentacion();

      await Swal.fire({
        title: "Conexión correcta",
        html: `
            <p><strong>${resultado.docente.nombreCompleto}</strong></p>
            <p>Se cargaron correctamente tus cursos y espacios curriculares habilitados.</p>
          `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      mostrarMensajeDocumentacion("Asignaciones cargadas correctamente.", "ok");
    } catch (error) {
      console.error("Error al cargar opciones de documentación:", error);

      mostrarMensajeDocumentacion(
        error.message || "No se pudieron cargar las asignaciones.",
        "error",
      );
    } finally {
      btnProbarConexionDocumentacion.disabled = false;
    }
  });
}

if (cursoDocumentoAcademico) {
  cursoDocumentoAcademico.addEventListener("change", cargarEspaciosDisponibles);
}

if (formDocumentacionAcademica) {
  formDocumentacionAcademica.addEventListener("submit", (event) => {
    event.preventDefault();

    const tipo = String(tipoDocumentoAcademico.value || "").trim();

    const curso = String(cursoDocumentoAcademico.value || "").trim();

    const espacio = String(espacioDocumentoAcademico.value || "").trim();

    if (!tipo || !curso || !espacio) {
      mostrarMensajeDocumentacion(
        "Seleccioná tipo de documento, curso y espacio curricular.",
        "error",
      );

      return;
    }

    mostrarMensajeDocumentacion(
      "La subida de PDF se agregará en el próximo paso.",
    );
  });
}
