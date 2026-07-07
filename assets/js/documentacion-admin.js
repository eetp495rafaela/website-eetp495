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

const cuerpoTablaDocumentacionAdmin = document.getElementById(
  "cuerpoTablaDocumentacionAdmin",
);

const mensajeDocumentacionAdmin = document.getElementById(
  "mensajeDocumentacionAdmin",
);

function mostrarMensajeDocumentacionAdmin(texto, tipo = "") {
  if (!mensajeDocumentacionAdmin) return;

  mensajeDocumentacionAdmin.textContent = texto;
  mensajeDocumentacionAdmin.className = `mensaje-formulario ${tipo}`.trim();
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
    PLAN_ANUAL: "Plan Anual",
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
  if (!cuerpoTablaDocumentacionAdmin) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentacionAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          No hay documentación académica cargada.
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentacionAdmin.innerHTML = documentos
    .map((documento) => {
      const idDocumento = escaparHtml(documento.id);
      const driveUrl = escaparHtml(documento.driveUrl);

      return `
        <tr>
          <td>${escaparHtml(documento.curso)}</td>
          <td>${escaparHtml(
            obtenerEtiquetaTipoDocumento(documento.tipoDocumento),
          )}</td>
          <td>${escaparHtml(documento.espacioCurricular)}</td>
          <td>${escaparHtml(formatearFechaCarga(documento.fechaCarga))}</td>
          <td>
            <div class="acciones-documentacion-admin">
              <a
                class="btn-documento-admin btn-ver-documento-admin"
                href="${driveUrl}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fa-solid fa-eye"></i>
                Ver
              </a>

              <button
                class="btn-documento-admin btn-eliminar-documento-admin"
                type="button"
                data-id-documento="${idDocumento}"
              >
                <i class="fa-solid fa-trash-can"></i>
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function cargarDocumentosAdministracion() {
  if (!cuerpoTablaDocumentacionAdmin) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    return;
  }

  cuerpoTablaDocumentacionAdmin.innerHTML = `
    <tr>
      <td colspan="5" class="tabla-vacia">
        Cargando documentación académica...
      </td>
    </tr>
  `;

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackend({
      accion: "obtener_documentos_admin",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo cargar la documentación académica.",
      );
    }

    mostrarDocumentosEnTabla(resultado.documentos || []);

    mostrarMensajeDocumentacionAdmin("");
  } catch (error) {
    console.error("Error al cargar documentación académica:", error);

    cuerpoTablaDocumentacionAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          No se pudo cargar la documentación académica.
        </td>
      </tr>
    `;

    mostrarMensajeDocumentacionAdmin(
      error.message || "No se pudo cargar la documentación académica.",
      "error",
    );
  }
}

async function eliminarDocumentoAcademico(idDocumento) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  const confirmacion = await Swal.fire({
    title: "¿Eliminar documento?",
    html: `
      <p>El PDF será enviado a la papelera de Drive.</p>
      <p>También se eliminará su registro de Firestore.</p>
      <p><strong>Esta acción no se puede deshacer desde el portal.</strong></p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#c0392b",
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  const idToken = await usuario.getIdToken(true);

  const resultado = await enviarAlBackend({
    accion: "eliminar_documento_admin",
    idToken,
    idDocumento,
  });

  if (!resultado.ok) {
    throw new Error(resultado.mensaje || "No se pudo eliminar el documento.");
  }

  await Swal.fire({
    title: "Documento eliminado",
    text: resultado.mensaje || "El documento fue eliminado correctamente.",
    icon: "success",
    confirmButtonText: "Aceptar",
  });

  await cargarDocumentosAdministracion();
}

if (cuerpoTablaDocumentacionAdmin) {
  cuerpoTablaDocumentacionAdmin.addEventListener("click", async (event) => {
    const botonEliminar = event.target.closest(".btn-eliminar-documento-admin");

    if (!botonEliminar) return;

    const idDocumento = String(botonEliminar.dataset.idDocumento || "").trim();

    if (!idDocumento) {
      mostrarMensajeDocumentacionAdmin(
        "No se pudo identificar el documento a eliminar.",
        "error",
      );
      return;
    }

    botonEliminar.disabled = true;

    try {
      await eliminarDocumentoAcademico(idDocumento);
    } catch (error) {
      console.error("Error al eliminar documentación académica:", error);

      mostrarMensajeDocumentacionAdmin(
        error.message || "No se pudo eliminar el documento.",
        "error",
      );
    } finally {
      botonEliminar.disabled = false;
    }
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    cargarDocumentosAdministracion();
  }
});
