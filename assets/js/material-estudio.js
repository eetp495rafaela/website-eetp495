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
const archivoDocumentoAcademico = document.getElementById(
  "archivoDocumentoAcademico",
);

const btnSubirDocumentoAcademico = document.getElementById(
  "btnSubirDocumentoAcademico",
);
const cuerpoTablaDocumentosDocente = document.getElementById(
  "cuerpoTablaDocumentosDocente",
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
function convertirArchivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      const resultado = String(lector.result || "");
      const base64 = resultado.includes(",") ? resultado.split(",")[1] : "";

      if (!base64) {
        reject(new Error("No se pudo preparar el archivo para enviarlo."));
        return;
      }

      resolve(base64);
    };

    lector.onerror = () => {
      reject(new Error("No se pudo leer el archivo seleccionado."));
    };

    lector.readAsDataURL(archivo);
  });
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

  return fecha;
}

function escaparHtml(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarDocumentosEnTabla(documentos) {
  if (!cuerpoTablaDocumentosDocente) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentosDocente.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-documentos-vacia">
          No hay documentación cargada para tus cursos y espacios curriculares asignados.
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentosDocente.innerHTML = documentos
    .map((documento) => {
      const url = escaparHtml(documento.driveUrl);

      return `
        <tr>
          <td>${escaparHtml(documento.curso)}</td>
          <td>${escaparHtml(
            obtenerEtiquetaTipoDocumento(documento.tipoDocumento),
          )}</td>
          <td>${escaparHtml(documento.espacioCurricular)}</td>
          <td>${escaparHtml(formatearFechaCarga(documento.fechaCarga))}</td>
          <td>
            <a
              class="btn-ver-documento"
              href="${url}"
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

async function cargarDocumentosDisponibles() {
  if (!cuerpoTablaDocumentosDocente) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  cuerpoTablaDocumentosDocente.innerHTML = `
    <tr>
      <td colspan="5" class="tabla-documentos-vacia">
        Cargando documentación disponible...
      </td>
    </tr>
  `;

  const idToken = await usuario.getIdToken(true);

  const resultado = await enviarAlBackend({
    accion: "obtener_documentos_docente",
    idToken,
  });

  if (!resultado.ok) {
    throw new Error(
      resultado.mensaje || "No se pudo cargar la documentación disponible.",
    );
  }

  mostrarDocumentosEnTabla(resultado.documentos || []);
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

      await cargarDocumentosDisponibles();

      mostrarMensajeDocumentacion(
        `Asignaciones y documentos cargados correctamente para ${resultado.docente.nombreCompleto}.`,
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
  formDocumentacionAcademica.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = auth.currentUser;

    const tipoDocumento = String(tipoDocumentoAcademico.value || "")
      .trim()
      .toUpperCase();

    const cursoAnio = String(cursoDocumentoAcademico.value || "").trim();

    const espacioId = String(espacioDocumentoAcademico.value || "").trim();

    const opcionEspacio =
      espacioDocumentoAcademico.options[
        espacioDocumentoAcademico.selectedIndex
      ];

    const archivo = archivoDocumentoAcademico.files[0];

    if (!usuario) {
      mostrarMensajeDocumentacion(
        "No se detectó una sesión activa. Volvé a iniciar sesión.",
        "error",
      );
      return;
    }

    if (!tipoDocumento || !cursoAnio || !espacioId) {
      mostrarMensajeDocumentacion(
        "Seleccioná tipo de documento, curso y espacio curricular.",
        "error",
      );
      return;
    }

    if (!archivo) {
      mostrarMensajeDocumentacion(
        "Seleccioná un archivo PDF antes de continuar.",
        "error",
      );
      return;
    }

    const tipoMime = String(archivo.type || "")
      .trim()
      .toLowerCase();

    if (
      tipoMime !== "application/pdf" &&
      !archivo.name.toLowerCase().endsWith(".pdf")
    ) {
      mostrarMensajeDocumentacion("Solo se permiten archivos PDF.", "error");
      return;
    }

    const LIMITE_ARCHIVO_MB = 10;

    if (archivo.size > LIMITE_ARCHIVO_MB * 1024 * 1024) {
      mostrarMensajeDocumentacion(
        `El archivo supera el tamaño máximo permitido de ${LIMITE_ARCHIVO_MB} MB.`,
        "error",
      );
      return;
    }

    btnSubirDocumentoAcademico.disabled = true;

    mostrarMensajeDocumentacion("Preparando archivo y verificando permisos...");

    try {
      const idToken = await usuario.getIdToken(true);

      const archivoBase64 = await convertirArchivoABase64(archivo);

      const resultado = await enviarAlBackend({
        accion: "subir_documento",
        idToken,
        tipoDocumento,
        cicloLectivo: cicloLectivoDocumento.value,
        cursoAnio,
        espacioId,
        espacioNombre: opcionEspacio?.dataset.nombre || "",
        nombreOriginal: archivo.name,
        tipoMime: "application/pdf",
        archivoBase64,
      });

      if (!resultado.ok) {
        throw new Error(resultado.mensaje || "No se pudo cargar el documento.");
      }

      await Swal.fire({
        title: "Documento cargado",
        html: `
            <p><strong>${resultado.documento.nombre}</strong></p>
            <p>
              ${
                resultado.documento.reemplazo
                  ? "Se reemplazó la versión anterior del documento."
                  : "El documento fue guardado correctamente."
              }
            </p>
          `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      archivoDocumentoAcademico.value = "";

      await cargarDocumentosDisponibles();

      mostrarMensajeDocumentacion(
        "Documento cargado correctamente. La tabla fue actualizada.",
        "ok",
      );
    } catch (error) {
      console.error("Error al subir documentación académica:", error);

      mostrarMensajeDocumentacion(
        error.message || "No se pudo cargar el documento.",
        "error",
      );
    } finally {
      btnSubirDocumentoAcademico.disabled = false;
    }
  });
}
