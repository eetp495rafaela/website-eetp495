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

const campoCursoDocumentoAcademico = document.getElementById(
  "campoCursoDocumentoAcademico",
);

const espacioDocumentoAcademico = document.getElementById(
  "espacioDocumentoAcademico",
);

const campoCursosMaterialEstudio = document.getElementById(
  "campoCursosMaterialEstudio",
);

const listaCursosMaterialEstudio = document.getElementById(
  "listaCursosMaterialEstudio",
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

const btnVerDocumentosDocente = document.getElementById(
  "btnVerDocumentosDocente",
);

const filtroCursoDocumentosDocente = document.getElementById(
  "filtroCursoDocumentosDocente",
);

const filtroTipoDocumentosDocente = document.getElementById(
  "filtroTipoDocumentosDocente",
);

const campoTituloMaterialEstudio = document.getElementById(
  "campoTituloMaterialEstudio",
);

const tituloMaterialEstudio = document.getElementById("tituloMaterialEstudio");

let opcionesDocumentacion = [];
let asignacionesExactasDocumentacion = [];
let documentosDisponiblesDocente = [];

function mostrarMensajeDocumentacion(texto, tipo = "") {
  if (!mensajeDocumentacionAcademica) return;

  mensajeDocumentacionAcademica.textContent = texto;
  mensajeDocumentacionAcademica.className = `mensaje-formulario ${tipo}`.trim();
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

function esMaterialEstudioSeleccionado() {
  return (
    String(tipoDocumentoAcademico?.value || "")
      .trim()
      .toUpperCase() === "MATERIAL_ESTUDIO"
  );
}

function obtenerNombreCursoExacto(asignacion) {
  return (
    String(asignacion?.cursoNombre || "").trim() ||
    `${asignacion?.cursoAnio || ""}º ${String(
      asignacion?.cursoDivision || "",
    ).trim()}`.trim()
  );
}

function limpiarCursosMaterialEstudio(
  mensaje = "Primero seleccioná un espacio curricular.",
) {
  if (!listaCursosMaterialEstudio) return;

  listaCursosMaterialEstudio.innerHTML = `
    <span class="ayuda-cursos-material-estudio">${mensaje}</span>
  `;
}

function cargarEspaciosMaterialEstudio() {
  if (!espacioDocumentoAcademico) return;

  espacioDocumentoAcademico.innerHTML =
    '<option value="">Seleccionar espacio curricular</option>';

  const espacios = [
    ...new Map(
      asignacionesExactasDocumentacion
        .map((asignacion) => {
          const espacioId = String(asignacion.espacioId || "").trim();
          const espacioNombre = String(asignacion.espacioNombre || "").trim();

          if (!espacioId || !espacioNombre) return null;

          return [
            espacioId,
            {
              espacioId,
              espacioNombre,
              espacioTipo: String(asignacion.espacioTipo || "").trim(),
            },
          ];
        })
        .filter(Boolean),
    ).values(),
  ].sort((a, b) =>
    a.espacioNombre.localeCompare(b.espacioNombre, "es", {
      sensitivity: "base",
    }),
  );

  espacios.forEach((espacio) => {
    const opcion = document.createElement("option");
    opcion.value = espacio.espacioId;
    opcion.textContent = espacio.espacioNombre;
    opcion.dataset.nombre = espacio.espacioNombre;
    opcion.dataset.tipo = espacio.espacioTipo;
    espacioDocumentoAcademico.appendChild(opcion);
  });

  espacioDocumentoAcademico.disabled = !espacios.length;
  limpiarCursosMaterialEstudio();
}

function cargarCursosMaterialEstudio() {
  if (!listaCursosMaterialEstudio || !espacioDocumentoAcademico) return;

  const espacioId = String(espacioDocumentoAcademico.value || "").trim();

  if (!espacioId) {
    limpiarCursosMaterialEstudio();
    return;
  }

  const asignaciones = asignacionesExactasDocumentacion
    .filter(
      (asignacion) => String(asignacion.espacioId || "").trim() === espacioId,
    )
    .sort((a, b) =>
      obtenerNombreCursoExacto(a).localeCompare(
        obtenerNombreCursoExacto(b),
        "es",
        { numeric: true, sensitivity: "base" },
      ),
    );

  if (!asignaciones.length) {
    limpiarCursosMaterialEstudio(
      "No se encontraron cursos asignados para este espacio curricular.",
    );
    return;
  }

  listaCursosMaterialEstudio.innerHTML = "";

  asignaciones.forEach((asignacion) => {
    const asignacionId = String(asignacion.asignacionId || "").trim();
    const cursoNombre = obtenerNombreCursoExacto(asignacion);

    if (!asignacionId || !cursoNombre) return;

    const etiqueta = document.createElement("label");
    etiqueta.className = "opcion-curso-material-estudio";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "asignacionesMaterialEstudio";
    checkbox.value = asignacionId;
    checkbox.dataset.cursoAnio = String(asignacion.cursoAnio || "").trim();
    checkbox.dataset.cursoId = String(asignacion.cursoId || "").trim();
    checkbox.dataset.cursoDivision = String(
      asignacion.cursoDivision || "",
    ).trim();
    checkbox.dataset.cursoNombre = cursoNombre;

    const texto = document.createElement("span");
    texto.textContent = cursoNombre;

    etiqueta.appendChild(checkbox);
    etiqueta.appendChild(texto);
    listaCursosMaterialEstudio.appendChild(etiqueta);
  });
}

function obtenerAsignacionesMaterialEstudioSeleccionadas() {
  if (!listaCursosMaterialEstudio) return [];

  return Array.from(
    listaCursosMaterialEstudio.querySelectorAll(
      'input[name="asignacionesMaterialEstudio"]:checked',
    ),
  );
}

function cargarCursosDisponibles() {
  if (!cursoDocumentoAcademico || !espacioDocumentoAcademico) return;

  const esMaterialEstudio = esMaterialEstudioSeleccionado();

  if (campoCursoDocumentoAcademico) {
    campoCursoDocumentoAcademico.hidden = esMaterialEstudio;
  }

  if (campoCursosMaterialEstudio) {
    campoCursosMaterialEstudio.hidden = !esMaterialEstudio;
  }

  cursoDocumentoAcademico.required = !esMaterialEstudio;

  if (esMaterialEstudio) {
    cursoDocumentoAcademico.innerHTML =
      '<option value="">No aplica en modo multicurso</option>';
    cursoDocumentoAcademico.disabled = true;
    cargarEspaciosMaterialEstudio();
    return;
  }

  limpiarCursosMaterialEstudio();

  cursoDocumentoAcademico.innerHTML =
    '<option value="">Seleccionar curso</option>';

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

  cursos.forEach((curso) => {
    const opcion = document.createElement("option");
    opcion.value = String(curso.anio);
    opcion.textContent = curso.nombre;
    cursoDocumentoAcademico.appendChild(opcion);
  });

  cursoDocumentoAcademico.disabled = !cursos.length;

  espacioDocumentoAcademico.innerHTML =
    '<option value="">Primero seleccioná un curso</option>';
  espacioDocumentoAcademico.disabled = true;
}

function cargarEspaciosDisponibles() {
  if (!cursoDocumentoAcademico || !espacioDocumentoAcademico) return;

  if (esMaterialEstudioSeleccionado()) {
    cargarCursosMaterialEstudio();
    return;
  }

  espacioDocumentoAcademico.innerHTML =
    '<option value="">Seleccionar espacio curricular</option>';

  const anioSeleccionado = Number(cursoDocumentoAcademico.value || 0);

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

  asignacionesExactasDocumentacion = Array.isArray(
    resultado.asignacionesExactas,
  )
    ? resultado.asignacionesExactas
    : [];

  if (
    !opcionesDocumentacion.length &&
    !asignacionesExactasDocumentacion.length
  ) {
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

function normalizarCursoFiltro(texto) {
  return String(texto || "")
    .trim()
    .replace(/°/g, "º")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function obtenerAnioCursoFiltro(texto) {
  const coincidencia = String(texto || "").match(/(\d+)/);
  return coincidencia ? Number(coincidencia[1]) : 0;
}

function obtenerCursosIndividualesDocumento(documento) {
  const curso = String(documento?.curso || "").trim();

  if (!curso) return [];

  if (
    String(documento?.tipoDocumento || "")
      .trim()
      .toUpperCase() !== "MATERIAL_ESTUDIO"
  ) {
    return [curso];
  }

  return curso
    .split(/\s+-\s+/)
    .map((valor) => valor.trim())
    .filter(Boolean);
}

function cargarOpcionesFiltroCursoDocumentos(documentos) {
  if (!filtroCursoDocumentosDocente) return;

  const valorAnterior = filtroCursoDocumentosDocente.value;
  const cursosPorClave = new Map();

  asignacionesExactasDocumentacion.forEach((asignacion) => {
    const nombreCurso = obtenerNombreCursoExacto(asignacion);
    const clave = normalizarCursoFiltro(nombreCurso);

    if (clave && nombreCurso) {
      cursosPorClave.set(clave, nombreCurso);
    }
  });

  if (!cursosPorClave.size) {
    (Array.isArray(documentos) ? documentos : []).forEach((documento) => {
      obtenerCursosIndividualesDocumento(documento).forEach((nombreCurso) => {
        const clave = normalizarCursoFiltro(nombreCurso);
        if (clave) cursosPorClave.set(clave, nombreCurso);
      });
    });
  }

  const cursos = [...cursosPorClave.values()].sort((a, b) =>
    a.localeCompare(b, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );

  filtroCursoDocumentosDocente.innerHTML =
    '<option value="">Todos los cursos</option>';

  cursos.forEach((curso) => {
    const opcion = document.createElement("option");
    opcion.value = curso;
    opcion.textContent = curso;
    filtroCursoDocumentosDocente.appendChild(opcion);
  });

  if (
    valorAnterior &&
    Array.from(filtroCursoDocumentosDocente.options).some(
      (opcion) => opcion.value === valorAnterior,
    )
  ) {
    filtroCursoDocumentosDocente.value = valorAnterior;
  }

  filtroCursoDocumentosDocente.disabled = !documentos.length;
}

function documentoCoincideConCurso(documento, cursoSeleccionado) {
  if (!cursoSeleccionado) return true;

  const anioSeleccionado = obtenerAnioCursoFiltro(cursoSeleccionado);
  const anioDocumento = Number(documento?.cursoAnio || 0);
  const tipoDocumento = String(documento?.tipoDocumento || "")
    .trim()
    .toUpperCase();

  /*
   * Plan Anual y Programa de Examen se comparten por año y espacio
   * curricular. Por eso un Plan de 4º también debe aparecer cuando
   * el docente filtra, por ejemplo, por 4º C.
   */
  if (tipoDocumento !== "MATERIAL_ESTUDIO") {
    return Boolean(anioSeleccionado) && anioDocumento === anioSeleccionado;
  }

  const cursoBuscado = normalizarCursoFiltro(cursoSeleccionado);
  const cursosDocumento = obtenerCursosIndividualesDocumento(documento).map(
    normalizarCursoFiltro,
  );

  if (cursosDocumento.includes(cursoBuscado)) {
    return true;
  }

  /* Compatibilidad con materiales antiguos guardados sólo por año. */
  const tieneDivisionExacta = cursosDocumento.some((curso) =>
    /\d+\s*º\s+\S+/.test(curso),
  );

  return (
    !tieneDivisionExacta &&
    Boolean(anioSeleccionado) &&
    anioDocumento === anioSeleccionado
  );
}

function aplicarFiltrosDocumentosDocente() {
  const cursoSeleccionado = String(
    filtroCursoDocumentosDocente?.value || "",
  ).trim();

  const tipoSeleccionado = String(filtroTipoDocumentosDocente?.value || "")
    .trim()
    .toUpperCase();

  const filtrados = documentosDisponiblesDocente.filter((documento) => {
    const coincideCurso = documentoCoincideConCurso(
      documento,
      cursoSeleccionado,
    );

    const coincideTipo =
      !tipoSeleccionado ||
      String(documento.tipoDocumento || "")
        .trim()
        .toUpperCase() === tipoSeleccionado;

    return coincideCurso && coincideTipo;
  });

  mostrarDocumentosEnTabla(
    filtrados,
    "No hay documentos que coincidan con los filtros seleccionados.",
  );
}

function configurarFiltrosDocumentosDocente(documentos) {
  const hayDocumentos = Array.isArray(documentos) && documentos.length > 0;

  cargarOpcionesFiltroCursoDocumentos(documentos || []);

  if (filtroTipoDocumentosDocente) {
    filtroTipoDocumentosDocente.disabled = !hayDocumentos;
  }
}

function mostrarDocumentosEnTabla(
  documentos,
  mensajeVacio = "No hay documentación cargada para tus cursos y espacios curriculares asignados.",
) {
  if (!cuerpoTablaDocumentosDocente) return;

  if (!Array.isArray(documentos) || !documentos.length) {
    cuerpoTablaDocumentosDocente.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-documentos-vacia">
          ${escaparHtml(mensajeVacio)}
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaDocumentosDocente.innerHTML = documentos
    .map((documento) => {
      const url = escaparHtml(documento.driveUrl);
      const tituloMaterial =
        documento.tipoDocumento === "MATERIAL_ESTUDIO"
          ? String(documento.tituloMaterial || "").trim()
          : "—";

      return `
        <tr>
          <td>${escaparHtml(documento.curso)}</td>
          <td>${escaparHtml(
            obtenerEtiquetaTipoDocumento(documento.tipoDocumento),
          )}</td>
          <td>${escaparHtml(documento.espacioCurricular)}</td>
          <td>${escaparHtml(tituloMaterial)}</td>
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
      <td colspan="6" class="tabla-documentos-vacia">
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

  documentosDisponiblesDocente = Array.isArray(resultado.documentos)
    ? resultado.documentos
    : [];

  configurarFiltrosDocumentosDocente(documentosDisponiblesDocente);
  aplicarFiltrosDocumentosDocente();
}

function actualizarCampoTituloMaterialEstudio() {
  if (
    !tipoDocumentoAcademico ||
    !campoTituloMaterialEstudio ||
    !tituloMaterialEstudio
  ) {
    return;
  }

  const esMaterialEstudio =
    String(tipoDocumentoAcademico.value || "")
      .trim()
      .toUpperCase() === "MATERIAL_ESTUDIO";

  campoTituloMaterialEstudio.hidden = !esMaterialEstudio;

  tituloMaterialEstudio.required = esMaterialEstudio;

  if (!esMaterialEstudio) {
    tituloMaterialEstudio.value = "";
  }
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

      if (cuerpoTablaDocumentosDocente) {
        cuerpoTablaDocumentosDocente.innerHTML = `
          <tr>
            <td colspan="6" class="tabla-documentos-vacia">
              Todavía no se consultó la documentación cargada. Presioná
              “Ver documentación cargada” para mostrarla.
            </td>
          </tr>
        `;
      }

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

if (btnVerDocumentosDocente) {
  btnVerDocumentosDocente.addEventListener("click", async () => {
    btnVerDocumentosDocente.disabled = true;

    const textoOriginal = btnVerDocumentosDocente.innerHTML;

    btnVerDocumentosDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarDocumentosDisponibles();

      mostrarMensajeDocumentacion("Documentación cargada correctamente.", "ok");
    } catch (error) {
      console.error("Error al cargar documentación docente:", error);

      if (cuerpoTablaDocumentosDocente) {
        cuerpoTablaDocumentosDocente.innerHTML = `
          <tr>
            <td colspan="6" class="tabla-documentos-vacia">
              No se pudo cargar la documentación disponible.
            </td>
          </tr>
        `;
      }

      mostrarMensajeDocumentacion(
        error.message || "No se pudo cargar la documentación disponible.",
        "error",
      );
    } finally {
      btnVerDocumentosDocente.disabled = false;
      btnVerDocumentosDocente.innerHTML = textoOriginal;
    }
  });
}

if (filtroCursoDocumentosDocente) {
  filtroCursoDocumentosDocente.addEventListener(
    "change",
    aplicarFiltrosDocumentosDocente,
  );
}

if (filtroTipoDocumentosDocente) {
  filtroTipoDocumentosDocente.addEventListener(
    "change",
    aplicarFiltrosDocumentosDocente,
  );
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

if (tipoDocumentoAcademico) {
  tipoDocumentoAcademico.addEventListener("change", () => {
    actualizarCampoTituloMaterialEstudio();
    cargarCursosDisponibles();
  });

  actualizarCampoTituloMaterialEstudio();
}

if (cursoDocumentoAcademico) {
  cursoDocumentoAcademico.addEventListener("change", cargarEspaciosDisponibles);
}

if (espacioDocumentoAcademico) {
  espacioDocumentoAcademico.addEventListener("change", () => {
    if (esMaterialEstudioSeleccionado()) {
      cargarCursosMaterialEstudio();
    }
  });
}

if (formDocumentacionAcademica) {
  formDocumentacionAcademica.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = auth.currentUser;

    const tipoDocumento = String(tipoDocumentoAcademico.value || "")
      .trim()
      .toUpperCase();

    const tituloMaterial = String(tituloMaterialEstudio?.value || "").trim();

    const espacioId = String(espacioDocumentoAcademico.value || "").trim();

    const opcionEspacio =
      espacioDocumentoAcademico.options[
        espacioDocumentoAcademico.selectedIndex
      ];

    const esMaterialEstudio = tipoDocumento === "MATERIAL_ESTUDIO";

    const asignacionesSeleccionadas = esMaterialEstudio
      ? obtenerAsignacionesMaterialEstudioSeleccionadas()
      : [];

    const asignacionIds = asignacionesSeleccionadas.map((checkbox) =>
      String(checkbox.value || "").trim(),
    );

    const asignacionId = asignacionIds[0] || "";

    const cursoAnio = esMaterialEstudio
      ? String(asignacionesSeleccionadas[0]?.dataset.cursoAnio || "").trim()
      : String(cursoDocumentoAcademico.value || "").trim();

    const archivo = archivoDocumentoAcademico.files[0];

    if (!usuario) {
      mostrarMensajeDocumentacion(
        "No se detectó una sesión activa. Volvé a iniciar sesión.",
        "error",
      );
      return;
    }

    if (!tipoDocumento || !espacioId || (!esMaterialEstudio && !cursoAnio)) {
      mostrarMensajeDocumentacion(
        esMaterialEstudio
          ? "Seleccioná el tipo de documento y el espacio curricular."
          : "Seleccioná tipo de documento, curso y espacio curricular.",
        "error",
      );
      return;
    }

    if (esMaterialEstudio && !asignacionIds.length) {
      mostrarMensajeDocumentacion(
        "Seleccioná al menos un curso destinatario para el material de estudio.",
        "error",
      );
      return;
    }

    if (tipoDocumento === "MATERIAL_ESTUDIO" && !tituloMaterial) {
      mostrarMensajeDocumentacion(
        "Ingresá un Título / Tema para el material de estudio.",
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

    const LIMITE_ARCHIVO_MB = 25;

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
        asignacionId,
        asignacionIds,
        espacioNombre: opcionEspacio?.dataset.nombre || "",
        tituloMaterial,
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
            ${
              esMaterialEstudio
                ? `<p>Destinado a <strong>${asignacionIds.length}</strong> curso${
                    asignacionIds.length === 1 ? "" : "s"
                  }.</p>`
                : ""
            }
          `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      archivoDocumentoAcademico.value = "";
      if (tituloMaterialEstudio) {
        tituloMaterialEstudio.value = "";
      }

      if (esMaterialEstudio) {
        cargarCursosMaterialEstudio();
      }

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
