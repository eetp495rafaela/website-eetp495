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

const filtroEspacioDocumentacionAlumno = document.getElementById(
  "filtroEspacioDocumentacionAlumno",
);

const contenedorFiltroTipoDocumentacionAlumno = document.getElementById(
  "contenedorFiltroTipoDocumentacionAlumno",
);

const contenedorFiltroEspacioDocumentacionAlumno = document.getElementById(
  "contenedorFiltroEspacioDocumentacionAlumno",
);

const encabezadoTipoCursoDocumentacionAlumno = document.getElementById(
  "encabezadoTipoCursoDocumentacionAlumno",
);

const tituloDocumentacionAlumno = document.getElementById(
  "tituloDocumentacionAlumno",
);

const descripcionDocumentacionAlumno = document.getElementById(
  "descripcionDocumentacionAlumno",
);

const descripcionTarjetaDocumentacionAlumno = document.getElementById(
  "descripcionTarjetaDocumentacionAlumno",
);

const btnVerMiDocumentacion = document.getElementById("btnVerMiDocumentacion");

let documentosAlumno = [];
let esCursadaCompletaAlumno = false;

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

function normalizarTextoFiltro(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarSituacionAlumno(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function obtenerEtiquetaTipoDocumento(tipoDocumento) {
  const etiquetas = {
    PROGRAMA_EXAMEN: "Programa de Examen",
    MATERIAL_ESTUDIO: "Material de Estudio",
  };

  return etiquetas[tipoDocumento] || "Sin tipo";
}

function obtenerCursoVisibleDocumento(documento) {
  const curso = String(documento?.curso || "").trim();

  if (curso) {
    return curso;
  }

  const cursoAnio = Number(documento?.cursoAnio || 0);

  return cursoAnio ? `${cursoAnio}º` : "Sin curso";
}

function formatearFechaCarga(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!fecha) {
    return "Sin fecha";
  }

  return fecha.replace(" ", " · ");
}

function actualizarTextoBotonDocumentacion() {
  if (!btnVerMiDocumentacion) return;

  btnVerMiDocumentacion.innerHTML = esCursadaCompletaAlumno
    ? `
      <i class="fa-solid fa-folder-open"></i>
      Ver programas de examen
    `
    : `
      <i class="fa-solid fa-folder-open"></i>
      Ver mi documentación
    `;
}

function configurarVistaDocumentacionAlumno(resultado) {
  const alumno = resultado?.alumno || {};

  const tipoVinculo = normalizarSituacionAlumno(alumno.tipoVinculo);

  esCursadaCompletaAlumno =
    Boolean(alumno.esCursadaCompleta) ||
    resultado?.modoConsulta === "CURSADA_COMPLETA" ||
    tipoVinculo === "CURSADA_COMPLETA";

  /* =====================================================
     SELECTOR DE TIPO DE DOCUMENTO

     CURSANDO:
     Se muestra normalmente.

     CURSADA COMPLETA:
     Se oculta.
  ===================================================== */

  if (contenedorFiltroTipoDocumentacionAlumno) {
    const mostrarSelectorTipo = !esCursadaCompletaAlumno;

    contenedorFiltroTipoDocumentacionAlumno.hidden = !mostrarSelectorTipo;

    contenedorFiltroTipoDocumentacionAlumno.style.setProperty(
      "display",
      mostrarSelectorTipo ? "flex" : "none",
      "important",
    );
  }

  /* =====================================================
     BUSCADOR POR ESPACIO CURRICULAR

     Se oculta para todos los estudiantes.
  ===================================================== */

  if (contenedorFiltroEspacioDocumentacionAlumno) {
    contenedorFiltroEspacioDocumentacionAlumno.hidden = true;

    contenedorFiltroEspacioDocumentacionAlumno.style.setProperty(
      "display",
      "none",
      "important",
    );
  }

  /* Reiniciar valores de filtros */

  if (filtroTipoDocumentacionAlumno) {
    filtroTipoDocumentacionAlumno.value = "";
  }

  if (filtroEspacioDocumentacionAlumno) {
    filtroEspacioDocumentacionAlumno.value = "";
  }

  /* =====================================================
     ENCABEZADO DE LA PRIMERA COLUMNA
  ===================================================== */

  if (encabezadoTipoCursoDocumentacionAlumno) {
    encabezadoTipoCursoDocumentacionAlumno.textContent = esCursadaCompletaAlumno
      ? "Curso"
      : "Tipo";
  }

  /* =====================================================
     TÍTULO DE LA SECCIÓN
  ===================================================== */

  if (tituloDocumentacionAlumno) {
    tituloDocumentacionAlumno.textContent = esCursadaCompletaAlumno
      ? "Programas de examen disponibles"
      : "Documentos disponibles";
  }

  /* =====================================================
     DESCRIPCIÓN DE LA SECCIÓN
  ===================================================== */

  if (descripcionDocumentacionAlumno) {
    descripcionDocumentacionAlumno.textContent = esCursadaCompletaAlumno
      ? "Consultá los programas de examen disponibles de todos los años."
      : "Consultá los programas de examen y el material de estudio correspondiente a tu curso.";
  }

  /* =====================================================
     DESCRIPCIÓN DE LA TARJETA PRINCIPAL
  ===================================================== */

  if (descripcionTarjetaDocumentacionAlumno) {
    descripcionTarjetaDocumentacionAlumno.textContent = esCursadaCompletaAlumno
      ? "Consultá y descargá los programas de examen disponibles para preparar tus materias pendientes."
      : "Consultá programas de examen y material de estudio de tu curso.";
  }

  actualizarTextoBotonDocumentacion();
}

function obtenerMensajeSinDocumentos() {
  if (esCursadaCompletaAlumno) {
    const busqueda = String(
      filtroEspacioDocumentacionAlumno?.value || "",
    ).trim();

    return busqueda
      ? "No se encontraron programas de examen para ese espacio curricular."
      : "No hay programas de examen disponibles.";
  }

  return "No hay documentación disponible para tu curso.";
}

function mostrarDocumentosEnTabla(documentos) {
  if (!cuerpoTablaDocumentacionAlumno) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          ${escaparHtml(obtenerMensajeSinDocumentos())}
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentacionAlumno.innerHTML = documentos
    .map((documento) => {
      const driveUrl = escaparHtml(documento.driveUrl);

      const primeraColumna = esCursadaCompletaAlumno
        ? obtenerCursoVisibleDocumento(documento)
        : obtenerEtiquetaTipoDocumento(documento.tipoDocumento);

      return `
        <tr>
          <td>${escaparHtml(primeraColumna)}</td>
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
              Ver PDF
            </a>
          </td>
        </tr>
      `;
    })
    .join("");
}

function aplicarFiltrosDocumentacionAlumno() {
  let documentosFiltrados = [...documentosAlumno];

  if (esCursadaCompletaAlumno) {
    const espacioBuscado = normalizarTextoFiltro(
      filtroEspacioDocumentacionAlumno?.value || "",
    );

    if (espacioBuscado) {
      documentosFiltrados = documentosFiltrados.filter((documento) =>
        normalizarTextoFiltro(documento.espacioCurricular).includes(
          espacioBuscado,
        ),
      );
    }
  } else {
    const tipoSeleccionado = String(
      filtroTipoDocumentacionAlumno?.value || "",
    ).trim();

    if (tipoSeleccionado) {
      documentosFiltrados = documentosFiltrados.filter(
        (documento) =>
          String(documento.tipoDocumento || "").trim() === tipoSeleccionado,
      );
    }
  }

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

    configurarVistaDocumentacionAlumno(resultado);

    documentosAlumno = Array.isArray(resultado.documentos)
      ? resultado.documentos
      : [];

    aplicarFiltrosDocumentacionAlumno();

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

filtroTipoDocumentacionAlumno?.addEventListener(
  "change",
  aplicarFiltrosDocumentacionAlumno,
);

filtroEspacioDocumentacionAlumno?.addEventListener(
  "input",
  aplicarFiltrosDocumentacionAlumno,
);

btnVerMiDocumentacion?.addEventListener("click", async () => {
  btnVerMiDocumentacion.disabled = true;

  btnVerMiDocumentacion.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

  try {
    await cargarDocumentosAlumno();
  } finally {
    btnVerMiDocumentacion.disabled = false;
    actualizarTextoBotonDocumentacion();
  }
});

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  documentosAlumno = [];
  esCursadaCompletaAlumno = false;

  if (contenedorFiltroTipoDocumentacionAlumno) {
    contenedorFiltroTipoDocumentacionAlumno.hidden = false;

    contenedorFiltroTipoDocumentacionAlumno.style.setProperty(
      "display",
      "flex",
      "important",
    );
  }

  if (contenedorFiltroEspacioDocumentacionAlumno) {
    contenedorFiltroEspacioDocumentacionAlumno.hidden = true;

    contenedorFiltroEspacioDocumentacionAlumno.style.setProperty(
      "display",
      "none",
      "important",
    );
  }

  if (encabezadoTipoCursoDocumentacionAlumno) {
    encabezadoTipoCursoDocumentacionAlumno.textContent = "Tipo";
  }

  if (cuerpoTablaDocumentacionAlumno) {
    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          Todavía no se consultó tu documentación. Presioná “Ver mi documentación”
          para cargarla.
        </td>
      </tr>
    `;
  }

  actualizarTextoBotonDocumentacion();
  mostrarMensajeDocumentacionAlumno("");
});
