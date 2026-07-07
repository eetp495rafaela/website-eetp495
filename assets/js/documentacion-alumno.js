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

const BACKEND_DOCUMENTACION_URL =
  "https://script.google.com/macros/s/AKfycbyJA5XiNV_JqALCztCcSctp4eVpW25jxJaKPYvGD8qVm7mbM6oJWx99Op4vqX7pk2Eqzw/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

const cuerpoTablaDocumentacionAlumno = document.getElementById(
  "cuerpoTablaDocumentacionAlumno",
);

const mensajeDocumentacionAlumno = document.getElementById(
  "mensajeDocumentacionAlumno",
);

const filtroTipoDocumentacionAlumno = document.getElementById(
  "filtroTipoDocumentacionAlumno",
);

let documentosAlumno = [];

function mostrarMensajeDocumentacionAlumno(texto, tipo = "") {
  if (!mensajeDocumentacionAlumno) return;

  mensajeDocumentacionAlumno.textContent = texto;
  mensajeDocumentacionAlumno.className = `mensaje-formulario ${tipo}`.trim();
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
    throw new Error("No se pudo establecer comunicación con el servidor.");
  }

  return respuesta.json();
}

function escaparHtml(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerEtiquetaTipoDocumento(tipoDocumento) {
  const etiquetas = {
    PROGRAMA_EXAMEN: "Programa de Examen",
    MATERIAL_ESTUDIO: "Material de Estudio",
  };

  return etiquetas[tipoDocumento] || "Sin tipo";
}

function formatearFechaCarga(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!fecha) {
    return "Sin fecha";
  }

  return fecha.replace(" ", " · ");
}

function mostrarDocumentosEnTabla(documentos) {
  if (!cuerpoTablaDocumentacionAlumno) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No hay documentación disponible para tu curso.
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentacionAlumno.innerHTML = documentos
    .map((documento) => {
      const driveUrl = escaparHtml(documento.driveUrl);

      return `
        <tr>
          <td>${escaparHtml(
            obtenerEtiquetaTipoDocumento(documento.tipoDocumento),
          )}</td>
          <td>${escaparHtml(documento.espacioCurricular)}</td>
          <td>${escaparHtml(formatearFechaCarga(documento.fechaCarga))}</td>
          <td>
            <a
              class="btn-ver-documento-alumno"
              href="${driveUrl}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fa-solid fa-eye"></i>
              Ver
            </a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function aplicarFiltroTipoDocumento() {
  const tipoSeleccionado = String(
    filtroTipoDocumentacionAlumno?.value || "",
  ).trim();

  const documentosFiltrados = documentosAlumno.filter(
    (documento) =>
      !tipoSeleccionado ||
      String(documento.tipoDocumento || "").trim() === tipoSeleccionado,
  );

  mostrarDocumentosEnTabla(documentosFiltrados);
}

async function cargarDocumentosAlumno() {
  if (!cuerpoTablaDocumentacionAlumno) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  cuerpoTablaDocumentacionAlumno.innerHTML = `
    <tr>
      <td colspan="4" class="tabla-vacia">
        Cargando documentación disponible...
      </td>
    </tr>
  `;

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackend({
      accion: "obtener_documentos_alumno",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo cargar la documentación disponible.",
      );
    }

    documentosAlumno = resultado.documentos || [];

    aplicarFiltroTipoDocumento();

    mostrarMensajeDocumentacionAlumno("");
  } catch (error) {
    console.error("Error al cargar documentación del alumno:", error);

    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No se pudo cargar la documentación disponible.
        </td>
      </tr>
    `;

    mostrarMensajeDocumentacionAlumno(
      error.message || "No se pudo cargar la documentación disponible.",
      "error",
    );
  }
}

if (filtroTipoDocumentacionAlumno) {
  filtroTipoDocumentacionAlumno.addEventListener(
    "change",
    aplicarFiltroTipoDocumento,
  );
}

onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    cargarDocumentosAlumno();
  }
});
