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

async function obtenerTokenAppCheckDocumentacion() {
  const obtenerToken = window.obtenerTokenAppCheckPortal;

  if (typeof obtenerToken !== "function") {
    throw new Error(
      "No se pudo inicializar la verificación de seguridad del portal. Recargá la página.",
    );
  }

  return obtenerToken();
}

async function enviarAlBackend(datos) {
  const appCheckToken = await obtenerTokenAppCheckDocumentacion();

  const respuesta = await fetch(BACKEND_DOCUMENTACION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    /*
     * Apps Script recibe el token en el cuerpo para evitar una petición
     * CORS preflight por encabezados personalizados. El backend lo reenvía
     * a Firebase Authentication como X-Firebase-AppCheck.
     */
    body: JSON.stringify({
      ...datos,
      appCheckToken,
    }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo establecer comunicación con el servidor.");
  }

  return respuesta.json();
}

function convertirBase64ABlobDocumentoPrivado(
  base64,
  tipoMime = "application/pdf",
) {
  const binario = atob(String(base64 || ""));
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }

  return new Blob([bytes], { type: tipoMime || "application/pdf" });
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
     SELECTOR DE ESPACIO CURRICULAR

     Se muestra para todos los estudiantes.
     Las opciones se cargan después de consultar la documentación.
  ===================================================== */

  if (contenedorFiltroEspacioDocumentacionAlumno) {
    contenedorFiltroEspacioDocumentacionAlumno.hidden = false;

    contenedorFiltroEspacioDocumentacionAlumno.style.setProperty(
      "display",
      "flex",
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

function cargarOpcionesFiltroEspacioDocumentacionAlumno() {
  if (!filtroEspacioDocumentacionAlumno) return;

  const espacios = Array.from(
    new Set(
      documentosAlumno
        .map((documento) => String(documento?.espacioCurricular || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, "es", {
      sensitivity: "base",
      numeric: true,
    }),
  );

  filtroEspacioDocumentacionAlumno.innerHTML = [
    '<option value="">Todos los espacios</option>',
    ...espacios.map(
      (espacio) =>
        `<option value="${escaparHtml(espacio)}">${escaparHtml(espacio)}</option>`,
    ),
  ].join("");

  filtroEspacioDocumentacionAlumno.value = "";
  filtroEspacioDocumentacionAlumno.disabled = !documentosAlumno.length;
}

function actualizarEstadoFiltrosDocumentacionAlumno() {
  if (filtroTipoDocumentacionAlumno) {
    filtroTipoDocumentacionAlumno.disabled =
      esCursadaCompletaAlumno || !documentosAlumno.length;
  }

  if (filtroEspacioDocumentacionAlumno) {
    filtroEspacioDocumentacionAlumno.disabled = !documentosAlumno.length;
  }
}

function obtenerMensajeSinDocumentos() {
  const tipoSeleccionado = String(
    filtroTipoDocumentacionAlumno?.value || "",
  ).trim();

  const espacioSeleccionado = String(
    filtroEspacioDocumentacionAlumno?.value || "",
  ).trim();

  if (tipoSeleccionado || espacioSeleccionado) {
    return esCursadaCompletaAlumno
      ? "No se encontraron programas de examen con el filtro seleccionado."
      : "No se encontró documentación con los filtros seleccionados.";
  }

  return esCursadaCompletaAlumno
    ? "No hay programas de examen disponibles."
    : "No hay documentación disponible para tu curso.";
}

function mostrarDocumentosEnTabla(documentos) {
  if (!cuerpoTablaDocumentacionAlumno) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          ${escaparHtml(obtenerMensajeSinDocumentos())}
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentacionAlumno.innerHTML = documentos
    .map((documento) => {
      const idDocumento = escaparHtml(documento.id);
      const tituloMaterial =
        documento.tipoDocumento === "MATERIAL_ESTUDIO"
          ? String(documento.tituloMaterial || "").trim()
          : "—";

      const primeraColumna = esCursadaCompletaAlumno
        ? obtenerCursoVisibleDocumento(documento)
        : obtenerEtiquetaTipoDocumento(documento.tipoDocumento);

      return `
        <tr>
          <td>${escaparHtml(primeraColumna)}</td>
          <td>${escaparHtml(documento.espacioCurricular)}</td>
          <td>${escaparHtml(tituloMaterial)}</td>
          <td>${escaparHtml(formatearFechaCarga(documento.fechaCarga))}</td>
          <td>
            <button
              class="btn-ver-documento-alumno"
              type="button"
              data-id-documento="${idDocumento}"
            >
              <i class="fa-solid fa-eye"></i>
              Ver PDF
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function aplicarFiltrosDocumentacionAlumno() {
  let documentosFiltrados = [...documentosAlumno];

  const tipoSeleccionado = String(
    filtroTipoDocumentacionAlumno?.value || "",
  ).trim();

  const espacioSeleccionado = normalizarTextoFiltro(
    filtroEspacioDocumentacionAlumno?.value || "",
  );

  if (!esCursadaCompletaAlumno && tipoSeleccionado) {
    documentosFiltrados = documentosFiltrados.filter(
      (documento) =>
        String(documento.tipoDocumento || "").trim() === tipoSeleccionado,
    );
  }

  if (espacioSeleccionado) {
    documentosFiltrados = documentosFiltrados.filter(
      (documento) =>
        normalizarTextoFiltro(documento.espacioCurricular) ===
        espacioSeleccionado,
    );
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
      <td colspan="5" class="tabla-vacia">
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

    cargarOpcionesFiltroEspacioDocumentacionAlumno();
    actualizarEstadoFiltrosDocumentacionAlumno();
    aplicarFiltrosDocumentacionAlumno();

    mostrarMensajeDocumentacionAlumno("");
  } catch (error) {
    console.error("Error al cargar documentación del alumno:", error);

    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
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

async function abrirDocumentoPrivadoAlumno(idDocumento, boton = null) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  const ventana = window.open("", "_blank");
  const textoOriginal = boton?.innerHTML || "";

  if (boton) {
    boton.disabled = true;
    boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abriendo...';
  }

  try {
    const idToken = await usuario.getIdToken(true);
    const resultado = await enviarAlBackend({
      accion: "obtener_archivo_documento_alumno",
      idToken,
      idDocumento,
    });

    if (!resultado.ok || !resultado.archivo?.archivoBase64) {
      throw new Error(resultado.mensaje || "No se pudo abrir el documento.");
    }

    const blob = convertirBase64ABlobDocumentoPrivado(
      resultado.archivo.archivoBase64,
      resultado.archivo.tipoMime,
    );
    const url = URL.createObjectURL(blob);

    if (ventana) ventana.location.href = url;
    else window.open(url, "_blank");

    setTimeout(() => URL.revokeObjectURL(url), 120000);
  } catch (error) {
    if (ventana && !ventana.closed) ventana.close();
    throw error;
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML = textoOriginal;
    }
  }
}

cuerpoTablaDocumentacionAlumno?.addEventListener("click", async (event) => {
  const boton = event.target.closest(".btn-ver-documento-alumno");
  if (!boton) return;

  const idDocumento = String(boton.dataset.idDocumento || "").trim();
  if (!idDocumento) return;

  try {
    await abrirDocumentoPrivadoAlumno(idDocumento, boton);
  } catch (error) {
    console.error("Error al abrir documento privado:", error);
    mostrarMensajeDocumentacionAlumno(
      error.message || "No se pudo abrir el documento.",
      "error",
    );
  }
});

filtroTipoDocumentacionAlumno?.addEventListener(
  "change",
  aplicarFiltrosDocumentacionAlumno,
);

filtroEspacioDocumentacionAlumno?.addEventListener(
  "change",
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
    contenedorFiltroEspacioDocumentacionAlumno.hidden = false;

    contenedorFiltroEspacioDocumentacionAlumno.style.setProperty(
      "display",
      "flex",
      "important",
    );
  }

  if (filtroTipoDocumentacionAlumno) {
    filtroTipoDocumentacionAlumno.value = "";
    filtroTipoDocumentacionAlumno.disabled = true;
  }

  if (filtroEspacioDocumentacionAlumno) {
    filtroEspacioDocumentacionAlumno.innerHTML =
      '<option value="">Todos los espacios</option>';
    filtroEspacioDocumentacionAlumno.value = "";
    filtroEspacioDocumentacionAlumno.disabled = true;
  }

  if (encabezadoTipoCursoDocumentacionAlumno) {
    encabezadoTipoCursoDocumentacionAlumno.textContent = "Tipo";
  }

  if (cuerpoTablaDocumentacionAlumno) {
    cuerpoTablaDocumentacionAlumno.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          Todavía no se consultó tu documentación. Presioná “Ver mi documentación”
          para cargarla.
        </td>
      </tr>
    `;
  }

  actualizarTextoBotonDocumentacion();
  mostrarMensajeDocumentacionAlumno("");
});
