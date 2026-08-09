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
const btnCargarDocumentacionAdmin = document.getElementById(
  "btnCargarDocumentacionAdmin",
);
const filtroCursoDocumentacion = document.getElementById(
  "filtroCursoDocumentacion",
);

const filtroTipoDocumentacion = document.getElementById(
  "filtroTipoDocumentacion",
);

const filtroEspacioDocumentacion = document.getElementById(
  "filtroEspacioDocumentacion",
);

let documentosAdministracion = [];

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
    INFORME_PEDAGOGICO: "Informe Pedagógico",
  };

  return etiquetas[tipoDocumento] || "Sin tipo";
}

function formatearFechaCarga(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!fecha) {
    return "Sin fecha";
  }

  const coincidencia = fecha.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );

  if (!coincidencia) {
    return fecha.replace(" ", " · ");
  }

  const [, anio, mes, dia, hora, minuto, segundo] = coincidencia;
  const fechaFormateada = `${dia}-${mes}-${anio}`;

  if (!hora || !minuto) {
    return fechaFormateada;
  }

  const horaFormateada = segundo
    ? `${hora}:${minuto}:${segundo}`
    : `${hora}:${minuto}`;

  return `${fechaFormateada} · ${horaFormateada}`;
}

function cargarOpcionesFiltroCurso(documentos) {
  if (!filtroCursoDocumentacion) return;

  const cursoSeleccionado = filtroCursoDocumentacion.value;

  const cursos = [
    ...new Set(
      documentos
        .map((documento) => String(documento.curso || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => {
    const anioA = Number(a.match(/\d+/)?.[0] || 999);
    const anioB = Number(b.match(/\d+/)?.[0] || 999);

    return anioA - anioB;
  });

  filtroCursoDocumentacion.innerHTML =
    '<option value="">Todos los cursos</option>';

  cursos.forEach((curso) => {
    const opcion = document.createElement("option");

    opcion.value = curso;
    opcion.textContent = curso;

    filtroCursoDocumentacion.appendChild(opcion);
  });

  filtroCursoDocumentacion.value = cursos.includes(cursoSeleccionado)
    ? cursoSeleccionado
    : "";
}

function aplicarFiltrosDocumentacion() {
  const cursoSeleccionado = String(
    filtroCursoDocumentacion?.value || "",
  ).trim();

  const tipoSeleccionado = String(filtroTipoDocumentacion?.value || "").trim();

  const textoEspacio = String(filtroEspacioDocumentacion?.value || "")
    .trim()
    .toLowerCase();

  const documentosFiltrados = documentosAdministracion.filter((documento) => {
    const coincideCurso =
      !cursoSeleccionado ||
      String(documento.curso || "").trim() === cursoSeleccionado;

    const coincideTipo =
      !tipoSeleccionado ||
      String(documento.tipoDocumento || "").trim() === tipoSeleccionado;

    const coincideEspacio =
      !textoEspacio ||
      String(documento.espacioCurricular || "")
        .toLowerCase()
        .includes(textoEspacio);

    return coincideCurso && coincideTipo && coincideEspacio;
  });

  mostrarDocumentosEnTabla(documentosFiltrados);
}

function mostrarDocumentosEnTabla(documentos) {
  if (!cuerpoTablaDocumentacionAdmin) return;
  const documentosOrdenados = [...documentos].sort((a, b) => {
    const obtenerAnio = (documento) => {
      const anioGuardado = Number(documento.cursoAnio || 0);

      if (anioGuardado > 0) {
        return anioGuardado;
      }

      const coincidencia = String(documento.curso || "").match(/\d+/);

      return coincidencia ? Number(coincidencia[0]) : 999;
    };

    const anioA = obtenerAnio(a);
    const anioB = obtenerAnio(b);

    if (anioA !== anioB) {
      return anioA - anioB;
    }

    const tipoA = obtenerEtiquetaTipoDocumento(a.tipoDocumento);
    const tipoB = obtenerEtiquetaTipoDocumento(b.tipoDocumento);

    const comparacionTipo = tipoA.localeCompare(tipoB, "es");

    if (comparacionTipo !== 0) {
      return comparacionTipo;
    }

    return String(a.espacioCurricular || "").localeCompare(
      String(b.espacioCurricular || ""),
      "es",
    );
  });
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

  cuerpoTablaDocumentacionAdmin.innerHTML = documentosOrdenados
    .map((documento) => {
      const idDocumento = escaparHtml(documento.id);
      const driveUrl = escaparHtml(documento.driveUrl);
      const origenDocumento = escaparHtml(
        documento.origen || "DOCUMENTACION_ACADEMICA",
      );
      const estadoInforme = String(documento.estadoInforme || "")
        .trim()
        .toUpperCase();
      const esInformePedagogico =
        String(documento.tipoDocumento || "").trim() === "INFORME_PEDAGOGICO";

      const etiquetaTipo = obtenerEtiquetaTipoDocumento(
        documento.tipoDocumento,
      );

      const tipoVisible = esInformePedagogico
        ? `${escaparHtml(etiquetaTipo)}<br><small>${
            estadoInforme === "ARCHIVADO_BAJA_ALUMNO" ? "ARCHIVADO" : "ACTIVO"
          }</small>`
        : escaparHtml(etiquetaTipo);

      return `
        <tr>
          <td>${escaparHtml(documento.curso)}</td>
          <td>${tipoVisible}</td>
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
                data-origen-documento="${origenDocumento}"
                data-estado-informe="${escaparHtml(estadoInforme)}"
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
    mostrarMensajeDocumentacionAdmin(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );
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
      accion: "obtener_documentos_soporte",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo cargar la documentación académica.",
      );
    }

    documentosAdministracion = resultado.documentos || [];

    cargarOpcionesFiltroCurso(documentosAdministracion);

    aplicarFiltrosDocumentacion();

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

async function eliminarDocumentoAcademico(documento) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  const idDocumento = String(documento?.id || "").trim();
  const origenDocumento = String(documento?.origen || "DOCUMENTACION_ACADEMICA")
    .trim()
    .toUpperCase();

  const esInformePedagogico = origenDocumento === "INFORME_PEDAGOGICO";

  const estadoInforme = String(documento?.estadoInforme || "")
    .trim()
    .toUpperCase();

  const esArchivado = estadoInforme === "ARCHIVADO_BAJA_ALUMNO";

  const detalle = esInformePedagogico
    ? String(documento?.espacioCurricular || "Informe Pedagógico").trim()
    : String(documento?.espacioCurricular || "Documento académico").trim();

  const confirmacion = await Swal.fire({
    title: esInformePedagogico
      ? "¿Eliminar Informe Pedagógico?"
      : "¿Eliminar documento?",
    html: esInformePedagogico
      ? `
        <p>
          Se eliminará definitivamente el Informe Pedagógico de
          <strong>${escaparHtml(detalle)}</strong>.
        </p>
        ${
          esArchivado
            ? `<p><strong>Este informe está ARCHIVADO como antecedente institucional.</strong></p>`
            : ""
        }
        <p>El archivo de Google Drive será enviado a la papelera.</p>
        <p>También se eliminará su registro de Firestore.</p>
        <p><strong>Esta acción no se puede deshacer desde el portal.</strong></p>
      `
      : `
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

  const accion = esInformePedagogico
    ? "eliminar_informe_pedagogico_admin"
    : "eliminar_documento_admin";

  const resultado = await enviarAlBackend({
    accion,
    idToken,
    idDocumento,
  });

  if (!resultado.ok) {
    throw new Error(
      resultado.mensaje ||
        (esInformePedagogico
          ? "No se pudo eliminar el Informe Pedagógico."
          : "No se pudo eliminar el documento."),
    );
  }

  await Swal.fire({
    title: esInformePedagogico
      ? "Informe Pedagógico eliminado"
      : "Documento eliminado",
    text:
      resultado.mensaje ||
      (esInformePedagogico
        ? "El Informe Pedagógico fue eliminado correctamente."
        : "El documento fue eliminado correctamente."),
    icon: "success",
    confirmButtonText: "Aceptar",
  });

  await cargarDocumentosAdministracion();
}

if (filtroCursoDocumentacion) {
  filtroCursoDocumentacion.addEventListener(
    "change",
    aplicarFiltrosDocumentacion,
  );
}

if (filtroTipoDocumentacion) {
  filtroTipoDocumentacion.addEventListener(
    "change",
    aplicarFiltrosDocumentacion,
  );
}

if (filtroEspacioDocumentacion) {
  filtroEspacioDocumentacion.addEventListener(
    "input",
    aplicarFiltrosDocumentacion,
  );
}

if (cuerpoTablaDocumentacionAdmin) {
  cuerpoTablaDocumentacionAdmin.addEventListener("click", async (event) => {
    const botonEliminar = event.target.closest(".btn-eliminar-documento-admin");

    if (!botonEliminar) return;

    const idDocumento = String(botonEliminar.dataset.idDocumento || "").trim();
    const origenDocumento = String(
      botonEliminar.dataset.origenDocumento || "DOCUMENTACION_ACADEMICA",
    )
      .trim()
      .toUpperCase();

    if (!idDocumento) {
      mostrarMensajeDocumentacionAdmin(
        "No se pudo identificar el documento a eliminar.",
        "error",
      );
      return;
    }

    botonEliminar.disabled = true;

    try {
      const documento = documentosAdministracion.find((item) => {
        return (
          String(item.id || "").trim() === idDocumento &&
          String(item.origen || "DOCUMENTACION_ACADEMICA")
            .trim()
            .toUpperCase() === origenDocumento
        );
      });

      if (!documento) {
        throw new Error(
          "No se encontró el documento seleccionado en el listado actual.",
        );
      }

      await eliminarDocumentoAcademico(documento);
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

if (btnCargarDocumentacionAdmin) {
  btnCargarDocumentacionAdmin.addEventListener("click", async () => {
    btnCargarDocumentacionAdmin.disabled = true;

    const textoOriginal = btnCargarDocumentacionAdmin.innerHTML;

    btnCargarDocumentacionAdmin.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarDocumentosAdministracion();
    } finally {
      btnCargarDocumentacionAdmin.disabled = false;
      btnCargarDocumentacionAdmin.innerHTML = textoOriginal;
    }
  });
}

onAuthStateChanged(auth, () => {
  mostrarMensajeDocumentacionAdmin("");
});
