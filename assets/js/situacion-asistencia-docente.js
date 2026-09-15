import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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
const db = getFirestore(app);

const cursoSituacionAsistenciaDocente = document.getElementById(
  "cursoSituacionAsistenciaDocente",
);

const periodoSituacionAsistenciaDocente = document.getElementById(
  "periodoSituacionAsistenciaDocente",
);

const btnVerSituacionAsistenciaDocente = document.getElementById(
  "btnVerSituacionAsistenciaDocente",
);

const vistaSituacionAsistenciaDocente = document.getElementById(
  "vistaSituacionAsistenciaDocente",
);

const mensajeSituacionAsistenciaDocente = document.getElementById(
  "mensajeSituacionAsistenciaDocente",
);

const cursoDetalleAsistenciaDocente = document.getElementById(
  "cursoDetalleAsistenciaDocente",
);
const estudianteDetalleAsistenciaDocente = document.getElementById(
  "estudianteDetalleAsistenciaDocente",
);
const tipoDetalleAsistenciaDocente = document.getElementById(
  "tipoDetalleAsistenciaDocente",
);
const periodoDetalleAsistenciaDocente = document.getElementById(
  "periodoDetalleAsistenciaDocente",
);
const btnVerDetalleAsistenciaDocente = document.getElementById(
  "btnVerDetalleAsistenciaDocente",
);
const vistaDetalleAsistenciaDocente = document.getElementById(
  "vistaDetalleAsistenciaDocente",
);
const mensajeDetalleAsistenciaDocente = document.getElementById(
  "mensajeDetalleAsistenciaDocente",
);

let cursosSituacionAsistenciaDocente = [];
let estudiantesDetalleAsistenciaDocente = [];
let registrosDetalleAsistenciaDocente = [];
let filtroEstadoDetalleAsistenciaDocente = "TODOS";

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarTipo(tipo) {
  const valor = String(tipo || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (valor.includes("TALLER")) {
    return "TALLER";
  }

  if (valor.includes("FISICA")) {
    return "EDUCACION_FISICA";
  }

  return valor;
}

function obtenerTipoAsignacion(asignacion) {
  return normalizarTipo(
    asignacion.espacioTipo ||
      asignacion.tipoEspacio ||
      asignacion.tipoHorario ||
      asignacion.espacioNombre,
  );
}

function obtenerNombreCurso(asignacion) {
  const cursoNombre = String(asignacion.cursoNombre || "").trim();

  if (cursoNombre) {
    return cursoNombre;
  }

  const cursoAnio = Number(asignacion.cursoAnio || 0);
  const cursoDivision = String(asignacion.cursoDivision || "").trim();

  return `${cursoAnio}° ${cursoDivision}`.trim();
}

function mostrarMensaje(texto, tipo = "") {
  if (!mensajeSituacionAsistenciaDocente) return;

  mensajeSituacionAsistenciaDocente.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtml(texto)}
      </span>
    `
    : "";
}

async function obtenerAsignacionesDocente(correoDocente, cicloLectivo) {
  const asignacionesPorId = new Map();

  const consultas = [
    query(
      collection(db, "asignaciones_docentes"),
      where("docenteCorreo", "==", correoDocente),
      where("estado", "==", "ACTIVA"),
    ),
    query(
      collection(db, "asignaciones_docentes"),
      where("docenteCorreo", "==", correoDocente),
      where("estado", "==", "ACTIVO"),
    ),
  ];

  for (const consultaAsignaciones of consultas) {
    const resultado = await getDocs(consultaAsignaciones);

    resultado.forEach((documento) => {
      if (asignacionesPorId.has(documento.id)) return;

      const datos = documento.data();

      if (Number(datos.cicloLectivo || 0) !== Number(cicloLectivo || 0)) {
        return;
      }

      asignacionesPorId.set(documento.id, {
        id: documento.id,
        ...datos,
      });
    });
  }

  const consultaReemplazos = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const resultadoReemplazos = await getDocs(consultaReemplazos);

  const hoy = new Date();

  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  resultadoReemplazos.forEach((documento) => {
    const reemplazo = documento.data();

    const estado = String(reemplazo.estado || "")
      .trim()
      .toUpperCase();

    const tipoHorario = String(reemplazo.tipoHorario || "")
      .trim()
      .toUpperCase();

    const fechaDesde = String(reemplazo.fechaDesde || "").trim();

    const fechaHasta = String(reemplazo.fechaHasta || "").trim();

    const vigente =
      estado === "ACTIVO" &&
      (tipoHorario === "TALLER" || tipoHorario === "EDUCACION_FISICA") &&
      Number(reemplazo.cicloLectivo || 0) === Number(cicloLectivo || 0) &&
      fechaDesde &&
      fechaHasta &&
      fechaHoy >= fechaDesde &&
      fechaHoy <= fechaHasta;

    if (!vigente) return;

    asignacionesPorId.set(`REEMPLAZO_${documento.id}`, {
      id: `REEMPLAZO_${documento.id}`,

      docenteCorreo: reemplazo.reemplazanteCorreo || "",

      docenteNombre: reemplazo.reemplazanteNombre || "",

      cursoId: reemplazo.cursoId || "",

      cursoNombre: reemplazo.cursoNombre || "",

      cursoAnio: reemplazo.cursoAnio || 0,

      cursoDivision: reemplazo.cursoDivision || "",

      espacioId: reemplazo.espacioId || "",

      espacioNombre: reemplazo.espacioNombre || "",

      espacioTipo: tipoHorario,

      tipoHorario,

      cicloLectivo: reemplazo.cicloLectivo || 0,

      estado: "ACTIVA",

      esReemplazoTemporal: true,
      reemplazoId: documento.id,
    });
  });

  return Array.from(asignacionesPorId.values());
}

function prepararCursos(asignaciones) {
  const cursosPorClave = new Map();

  asignaciones.forEach((asignacion) => {
    const tipo = obtenerTipoAsignacion(asignacion);

    if (tipo !== "TALLER" && tipo !== "EDUCACION_FISICA") {
      return;
    }

    const cursoId = String(asignacion.cursoId || "").trim();
    const cursoAnio = Number(asignacion.cursoAnio || 0);
    const cursoDivision = String(asignacion.cursoDivision || "").trim();
    const cursoNombre = obtenerNombreCurso(asignacion);

    const claveCurso = cursoId || `${cursoAnio}_${cursoDivision.toUpperCase()}`;

    if (!claveCurso || claveCurso === "0_") return;

    if (!cursosPorClave.has(claveCurso)) {
      cursosPorClave.set(claveCurso, {
        cursoId,
        cursoAnio,
        cursoDivision,
        cursoNombre,
        tipos: [],
      });
    }

    const curso = cursosPorClave.get(claveCurso);

    if (!curso.tipos.includes(tipo)) {
      curso.tipos.push(tipo);
    }
  });

  return Array.from(cursosPorClave.values()).sort((a, b) => {
    if (a.cursoAnio !== b.cursoAnio) {
      return a.cursoAnio - b.cursoAnio;
    }

    return a.cursoDivision.localeCompare(b.cursoDivision, "es", {
      sensitivity: "base",
    });
  });
}

function renderizarCursos(cursos) {
  renderizarCursosDetalleAsistenciaDocente(cursos);

  if (!cursoSituacionAsistenciaDocente) return;

  if (!cursos.length) {
    cursoSituacionAsistenciaDocente.innerHTML = `
      <option value="">No tenés cursos asignados</option>
    `;

    cursoSituacionAsistenciaDocente.disabled = true;

    mostrarMensaje(
      `No se encontraron cursos activos de Taller o Educación Física para el ciclo lectivo ${new Date().getFullYear()}.`,
      "error",
    );

    return;
  }

  cursoSituacionAsistenciaDocente.innerHTML = `
    <option value="">Seleccionar curso</option>

    ${cursos
      .map(
        (curso, index) => `
          <option value="${index}">
            ${escaparHtml(curso.cursoNombre)}
          </option>
        `,
      )
      .join("")}
  `;

  cursoSituacionAsistenciaDocente.disabled = false;
  mostrarMensaje("");
}

async function cargarCursosAsignados(usuario) {
  if (!cursoSituacionAsistenciaDocente) return;

  cursoSituacionAsistenciaDocente.disabled = true;
  cursoSituacionAsistenciaDocente.innerHTML = `
    <option value="">Cargando cursos asignados...</option>
  `;

  mostrarMensaje("Cargando tus cursos asignados...");

  try {
    const correoDocente = normalizarCorreo(usuario.email);
    const cicloLectivo = new Date().getFullYear();

    const asignaciones = await obtenerAsignacionesDocente(
      correoDocente,
      cicloLectivo,
    );

    cursosSituacionAsistenciaDocente = prepararCursos(asignaciones);

    renderizarCursos(cursosSituacionAsistenciaDocente);
  } catch (error) {
    console.error("Error al cargar cursos de Situación de Asistencia:", error);

    cursoSituacionAsistenciaDocente.innerHTML = `
      <option value="">No se pudieron cargar los cursos</option>
    `;

    cursoSituacionAsistenciaDocente.disabled = true;

    mostrarMensaje(
      error.message || "No se pudieron cargar tus cursos asignados.",
      "error",
    );
  }
}

let usuarioDocenteActual = null;
let cursosCargados = false;
let cargaCursosEnProceso = false;

async function cargarCursosAlAbrirSeccion() {
  if (
    window.location.hash !== "#situacion-asistencia-docente" ||
    !usuarioDocenteActual ||
    cursosCargados ||
    cargaCursosEnProceso
  ) {
    return;
  }

  cargaCursosEnProceso = true;

  try {
    await cargarCursosAsignados(usuarioDocenteActual);
    cursosCargados = true;
  } finally {
    cargaCursosEnProceso = false;
  }
}

function obtenerCursoSeleccionado() {
  const indiceSeleccionado = Number(cursoSituacionAsistenciaDocente?.value);

  if (
    cursoSituacionAsistenciaDocente?.value === "" ||
    !Number.isInteger(indiceSeleccionado)
  ) {
    return null;
  }

  return cursosSituacionAsistenciaDocente[indiceSeleccionado] || null;
}

async function obtenerPeriodosAsistencia(cicloLectivo) {
  const referencia = doc(db, "configuracion_periodos", String(cicloLectivo));

  const documento = await getDoc(referencia);

  if (!documento.exists()) {
    return null;
  }

  return documento.data();
}

function obtenerRangoPeriodo(periodoSeleccionado, periodos) {
  if (!periodos) {
    return null;
  }

  switch (periodoSeleccionado) {
    case "TRIMESTRE_1":
      return {
        desde: periodos.trimestre1Inicio || "",
        hasta: periodos.trimestre1Fin || "",
        nombre: "1° Trimestre",
      };

    case "TRIMESTRE_2":
      return {
        desde: periodos.trimestre2Inicio || "",
        hasta: periodos.trimestre2Fin || "",
        nombre: "2° Trimestre",
      };

    case "TRIMESTRE_3":
      return {
        desde: periodos.trimestre3Inicio || "",
        hasta: periodos.trimestre3Fin || "",
        nombre: "3° Trimestre",
      };

    case "ANUAL":
      return {
        desde: periodos.trimestre1Inicio || "",
        hasta: periodos.trimestre3Fin || "",
        nombre: "Anual",
      };

    default:
      return null;
  }
}

function validarSeleccionSituacionAsistencia() {
  const cursoSeleccionado = obtenerCursoSeleccionado();

  if (!cursoSeleccionado) {
    mostrarMensaje(
      "Seleccioná un curso para consultar su situación de asistencia.",
      "error",
    );

    return;
  }

  mostrarMensaje("");

  console.log("Curso seleccionado:", cursoSeleccionado);
  console.log("Tipo asociado:", cursoSeleccionado.tipos);
}

function mostrarMensajeDetalleAsistenciaDocente(texto, tipo = "") {
  if (!mensajeDetalleAsistenciaDocente) return;

  mensajeDetalleAsistenciaDocente.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtml(texto)}
      </span>
    `
    : "";
}

function renderizarCursosDetalleAsistenciaDocente(cursos = []) {
  if (!cursoDetalleAsistenciaDocente) return;

  estudiantesDetalleAsistenciaDocente = [];
  registrosDetalleAsistenciaDocente = [];
  filtroEstadoDetalleAsistenciaDocente = "TODOS";

  if (!cursos.length) {
    cursoDetalleAsistenciaDocente.innerHTML = `
      <option value="">No tenés cursos asignados</option>
    `;
    cursoDetalleAsistenciaDocente.disabled = true;
    return;
  }

  cursoDetalleAsistenciaDocente.innerHTML = `
    <option value="">Seleccionar curso</option>
    ${cursos
      .map(
        (curso, index) => `
          <option value="${index}">
            ${escaparHtml(curso.cursoNombre)}
          </option>
        `,
      )
      .join("")}
  `;

  cursoDetalleAsistenciaDocente.disabled = false;
}

function obtenerCursoDetalleAsistenciaDocenteSeleccionado() {
  const valor = String(cursoDetalleAsistenciaDocente?.value || "").trim();
  const indice = Number(valor);

  if (!valor || !Number.isInteger(indice)) return null;
  return cursosSituacionAsistenciaDocente[indice] || null;
}

function renderizarTiposDetalleAsistenciaDocente(curso) {
  if (!tipoDetalleAsistenciaDocente) return;

  const tipos = Array.isArray(curso?.tipos) ? curso.tipos : [];

  if (!tipos.length) {
    tipoDetalleAsistenciaDocente.innerHTML = `
      <option value="">Sin tipos de asistencia disponibles</option>
    `;
    tipoDetalleAsistenciaDocente.disabled = true;
    return;
  }

  const opciones = tipos
    .map(
      (tipo) => `
        <option value="${escaparHtml(tipo)}">
          ${escaparHtml(obtenerEtiquetaTipo(tipo))}
        </option>
      `,
    )
    .join("");

  tipoDetalleAsistenciaDocente.innerHTML =
    tipos.length > 1
      ? `<option value="">Seleccionar tipo</option>${opciones}`
      : opciones;

  tipoDetalleAsistenciaDocente.disabled = false;
}

async function cargarEstudiantesDetalleAsistenciaDocente() {
  const curso = obtenerCursoDetalleAsistenciaDocenteSeleccionado();

  estudiantesDetalleAsistenciaDocente = [];
  registrosDetalleAsistenciaDocente = [];
  filtroEstadoDetalleAsistenciaDocente = "TODOS";

  if (!estudianteDetalleAsistenciaDocente || !tipoDetalleAsistenciaDocente) {
    return;
  }

  if (!curso?.cursoId) {
    estudianteDetalleAsistenciaDocente.disabled = true;
    estudianteDetalleAsistenciaDocente.innerHTML = `
      <option value="">Primero seleccioná un curso</option>
    `;

    tipoDetalleAsistenciaDocente.disabled = true;
    tipoDetalleAsistenciaDocente.innerHTML = `
      <option value="">Primero seleccioná un curso</option>
    `;

    if (vistaDetalleAsistenciaDocente) {
      vistaDetalleAsistenciaDocente.innerHTML = `
        <p class="mensaje-formulario">
          Seleccioná un curso, un estudiante y el tipo de asistencia para
          consultar el detalle.
        </p>
      `;
    }

    return;
  }

  renderizarTiposDetalleAsistenciaDocente(curso);

  estudianteDetalleAsistenciaDocente.disabled = true;
  estudianteDetalleAsistenciaDocente.innerHTML = `
    <option value="">Cargando estudiantes...</option>
  `;
  mostrarMensajeDetalleAsistenciaDocente("");

  try {
    const consultaEstudiantes = query(
      collection(db, "usuarios"),
      where("rol", "==", "ALUMNO"),
      where("estado", "==", "ACTIVO"),
      where("tipoVinculo", "==", "CURSANDO"),
      where("cursoId", "==", curso.cursoId),
    );

    const resultado = await getDocs(consultaEstudiantes);
    const estudiantes = [];

    resultado.forEach((documento) => {
      estudiantes.push({
        id: documento.id,
        ...documento.data(),
      });
    });

    estudiantes.sort((a, b) =>
      String(a.nombreCompleto || "").localeCompare(
        String(b.nombreCompleto || ""),
        "es",
        { sensitivity: "base" },
      ),
    );

    estudiantesDetalleAsistenciaDocente = estudiantes;

    if (!estudiantes.length) {
      estudianteDetalleAsistenciaDocente.innerHTML = `
        <option value="">No hay estudiantes activos</option>
      `;
      estudianteDetalleAsistenciaDocente.disabled = true;
      return;
    }

    estudianteDetalleAsistenciaDocente.innerHTML = `
      <option value="">Seleccionar estudiante</option>
      ${estudiantes
        .map(
          (estudiante) => `
            <option value="${escaparHtml(estudiante.id)}">
              ${escaparHtml(
                estudiante.nombreCompleto || "Estudiante sin nombre",
              )}
            </option>
          `,
        )
        .join("")}
    `;

    estudianteDetalleAsistenciaDocente.disabled = false;
  } catch (error) {
    console.error("Error al cargar estudiantes para detalle Docente:", error);

    estudianteDetalleAsistenciaDocente.innerHTML = `
      <option value="">No se pudieron cargar estudiantes</option>
    `;
    estudianteDetalleAsistenciaDocente.disabled = true;

    mostrarMensajeDetalleAsistenciaDocente(
      error.message || "No se pudieron cargar los estudiantes del curso.",
      "error",
    );
  }
}

function formatearFechaDetalleAsistenciaDocente(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha || "-";
  }

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function etiquetaEstadoDetalleAsistenciaDocente(estado) {
  const valor = normalizarEstado(estado);

  if (valor === "PRESENTE") return "Presente";
  if (valor === "AUSENTE") return "Ausente";
  if (valor === "TARDE") return "Tarde";

  return valor || "-";
}

function renderizarDetalleAsistenciaDocente() {
  if (!vistaDetalleAsistenciaDocente) return;

  const estudianteId = String(
    estudianteDetalleAsistenciaDocente?.value || "",
  ).trim();

  const estudiante = estudiantesDetalleAsistenciaDocente.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  const nombreEstudiante =
    String(estudiante?.nombreCompleto || "").trim() || "Estudiante";

  const presentes = registrosDetalleAsistenciaDocente.filter(
    (item) => item.estado === "PRESENTE",
  ).length;
  const ausentes = registrosDetalleAsistenciaDocente.filter(
    (item) => item.estado === "AUSENTE",
  ).length;
  const tardanzas = registrosDetalleAsistenciaDocente.filter(
    (item) => item.estado === "TARDE",
  ).length;

  const registrosFiltrados =
    filtroEstadoDetalleAsistenciaDocente === "TODOS"
      ? registrosDetalleAsistenciaDocente
      : registrosDetalleAsistenciaDocente.filter(
          (item) => item.estado === filtroEstadoDetalleAsistenciaDocente,
        );

  const botonFiltro = (estado, texto) => `
    <button
      type="button"
      class="btn-filtro-detalle-asistencia-docente ${
        filtroEstadoDetalleAsistenciaDocente === estado ? "activo" : ""
      }"
      data-estado-detalle-docente="${estado}"
    >
      ${texto}
    </button>
  `;

  vistaDetalleAsistenciaDocente.innerHTML = `
    <div class="encabezado-detalle-asistencia-docente">
      <h3>${escaparHtml(nombreEstudiante)}</h3>
    </div>

    <div
      class="filtros-estado-detalle-asistencia-docente"
      role="group"
      aria-label="Filtrar detalle por estado"
    >
      ${botonFiltro("TODOS", "Todos")}
      ${botonFiltro("PRESENTE", `Presentes ${presentes}`)}
      ${botonFiltro("AUSENTE", `Ausentes ${ausentes}`)}
      ${botonFiltro("TARDE", `Tardanzas ${tardanzas}`)}
    </div>

    ${
      registrosFiltrados.length
        ? `
          <div class="tabla-responsive tabla-detalle-asistencia-docente-contenedor">
            <table class="tabla-detalle-asistencia-docente">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${registrosFiltrados
                  .map(
                    (registro) => `
                      <tr>
                        <td>${escaparHtml(
                          formatearFechaDetalleAsistenciaDocente(
                            registro.fecha,
                          ),
                        )}</td>
                        <td>${escaparHtml(
                          etiquetaEstadoDetalleAsistenciaDocente(
                            registro.estado,
                          ),
                        )}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        : `
          <p class="mensaje-gestion mensaje-detalle-sin-registros-docente">
            No hay registros para el filtro seleccionado.
          </p>
        `
    }
  `;

  vistaDetalleAsistenciaDocente
    .querySelectorAll("[data-estado-detalle-docente]")
    .forEach((boton) => {
      boton.addEventListener("click", () => {
        filtroEstadoDetalleAsistenciaDocente =
          boton.dataset.estadoDetalleDocente || "TODOS";
        renderizarDetalleAsistenciaDocente();
      });
    });
}

async function consultarDetalleAsistenciaDocente() {
  const curso = obtenerCursoDetalleAsistenciaDocenteSeleccionado();
  const estudianteId = String(
    estudianteDetalleAsistenciaDocente?.value || "",
  ).trim();
  const tipo = String(tipoDetalleAsistenciaDocente?.value || "").trim();
  const periodoSeleccionado = String(
    periodoDetalleAsistenciaDocente?.value || "ANUAL",
  ).trim();

  if (!curso?.cursoId || !estudianteId || !tipo) {
    mostrarMensajeDetalleAsistenciaDocente(
      "Seleccioná el curso, el estudiante y el tipo de asistencia.",
      "error",
    );
    return;
  }

  const estudiante = estudiantesDetalleAsistenciaDocente.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  if (!estudiante) {
    mostrarMensajeDetalleAsistenciaDocente(
      "No se pudo identificar al estudiante seleccionado.",
      "error",
    );
    return;
  }

  mostrarMensajeDetalleAsistenciaDocente("");
  registrosDetalleAsistenciaDocente = [];
  filtroEstadoDetalleAsistenciaDocente = "TODOS";

  if (vistaDetalleAsistenciaDocente) {
    vistaDetalleAsistenciaDocente.innerHTML = `
      <p class="mensaje-gestion">Consultando detalle de asistencia...</p>
    `;
  }

  if (btnVerDetalleAsistenciaDocente) {
    btnVerDetalleAsistenciaDocente.disabled = true;
    btnVerDetalleAsistenciaDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const cicloLectivo = new Date().getFullYear();
    const periodos = await obtenerPeriodosAsistencia(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodo(periodoSeleccionado, periodos);

    if (!rangoPeriodo?.desde || !rangoPeriodo?.hasta) {
      throw new Error(
        "El período seleccionado no tiene fechas configuradas correctamente.",
      );
    }

    const correoDocente = normalizarCorreo(usuarioDocenteActual?.email);

    const consultasAsistencias = [
      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipo),
        where("docenteCorreo", "==", correoDocente),
      ),
      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipo),
        where("docenteTitularCorreo", "==", correoDocente),
      ),
    ];

    const resultados = await Promise.all(
      consultasAsistencias.map((consulta) => getDocs(consulta)),
    );

    const asistenciasPorId = new Map();

    resultados.forEach((resultado) => {
      resultado.forEach((documento) => {
        const asistencia = documento.data();

        if (String(asistencia.cursoId || "").trim() !== curso.cursoId) return;

        const fecha = String(asistencia.fecha || "").trim();
        if (fecha < rangoPeriodo.desde || fecha > rangoPeriodo.hasta) return;

        asistenciasPorId.set(documento.id, {
          id: documento.id,
          ...asistencia,
        });
      });
    });

    const registros = [];
    const nombreEstudiante = String(estudiante.nombreCompleto || "")
      .trim()
      .toLocaleLowerCase("es");

    asistenciasPorId.forEach((asistencia, asistenciaId) => {
      const registrosAsistencia = Array.isArray(asistencia.registros)
        ? asistencia.registros
        : [];

      const registroAlumno = registrosAsistencia.find((registro) => {
        const idRegistro = obtenerIdEstudiante(registro);
        if (idRegistro && idRegistro === estudianteId) return true;

        const nombreRegistro =
          obtenerNombreEstudiante(registro).toLocaleLowerCase("es");

        return Boolean(nombreEstudiante) && nombreRegistro === nombreEstudiante;
      });

      if (!registroAlumno) return;

      const estado = normalizarEstado(registroAlumno.estado);
      if (!["PRESENTE", "AUSENTE", "TARDE"].includes(estado)) return;

      registros.push({
        asistenciaId,
        fecha: String(asistencia.fecha || "").trim(),
        estado,
      });
    });

    registros.sort((a, b) => {
      const comparacionFecha = a.fecha.localeCompare(b.fecha);
      if (comparacionFecha !== 0) return comparacionFecha;
      return a.asistenciaId.localeCompare(b.asistenciaId);
    });

    registrosDetalleAsistenciaDocente = registros;
    renderizarDetalleAsistenciaDocente();
  } catch (error) {
    console.error("Error al consultar detalle de asistencia Docente:", error);

    if (vistaDetalleAsistenciaDocente) {
      vistaDetalleAsistenciaDocente.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar el detalle de asistencia.
        </p>
      `;
    }

    mostrarMensajeDetalleAsistenciaDocente(
      error.message || "No se pudo consultar el detalle de asistencia.",
      "error",
    );
  } finally {
    if (btnVerDetalleAsistenciaDocente) {
      btnVerDetalleAsistenciaDocente.disabled = false;
      btnVerDetalleAsistenciaDocente.innerHTML = `
        <i class="fa-solid fa-list-check"></i>
        Consultar detalle
      `;
    }
  }
}

if (cursoDetalleAsistenciaDocente) {
  cursoDetalleAsistenciaDocente.addEventListener(
    "change",
    cargarEstudiantesDetalleAsistenciaDocente,
  );
}

if (btnVerDetalleAsistenciaDocente) {
  btnVerDetalleAsistenciaDocente.addEventListener(
    "click",
    consultarDetalleAsistenciaDocente,
  );
}

if (btnVerSituacionAsistenciaDocente) {
  btnVerSituacionAsistenciaDocente.addEventListener(
    "click",
    consultarSituacionAsistencia,
  );
}

function obtenerEtiquetaTipo(tipo) {
  if (tipo === "TALLER") return "Taller";

  if (tipo === "EDUCACION_FISICA") {
    return "Educación Física";
  }

  return tipo || "";
}

function obtenerNombreEstudiante(registro) {
  return String(
    registro.alumnoNombre ||
      registro.estudianteNombre ||
      registro.nombreAlumno ||
      registro.nombre ||
      "",
  ).trim();
}

function obtenerIdEstudiante(registro) {
  return String(
    registro.alumnoId ||
      registro.estudianteId ||
      registro.idAlumno ||
      registro.dni ||
      obtenerNombreEstudiante(registro),
  ).trim();
}

function normalizarEstado(estado) {
  return String(estado || "")
    .trim()
    .toUpperCase();
}

function calcularPorcentajeAsistencia(presentes, ausentes, tardanzas) {
  const totalClases = presentes + ausentes + tardanzas;

  if (totalClases === 0) return 0;

  const faltasEquivalentes = ausentes + tardanzas / 4;

  const porcentaje = ((totalClases - faltasEquivalentes) / totalClases) * 100;

  return Math.max(0, Math.min(100, porcentaje));
}

function formatearNumero(numero) {
  return Number(numero || 0).toLocaleString("es-AR", {
    minimumFractionDigits: Number(numero) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatearPorcentaje(numero) {
  return Number(numero || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function agruparSituacionPorEstudiante(asistencias) {
  const estudiantes = new Map();

  asistencias.forEach((asistencia) => {
    const registros = Array.isArray(asistencia.registros)
      ? asistencia.registros
      : [];

    registros.forEach((registro) => {
      const nombre = obtenerNombreEstudiante(registro);

      if (!nombre) return;

      const id = obtenerIdEstudiante(registro);
      const clave = id || nombre.toLocaleLowerCase("es");

      if (!estudiantes.has(clave)) {
        estudiantes.set(clave, {
          id,
          nombre,
          presentes: 0,
          ausentes: 0,
          tardanzas: 0,
        });
      }

      const estudiante = estudiantes.get(clave);
      const estado = normalizarEstado(registro.estado);

      if (estado === "PRESENTE") {
        estudiante.presentes += 1;
      }

      if (estado === "AUSENTE") {
        estudiante.ausentes += 1;
      }

      if (estado === "TARDE") {
        estudiante.tardanzas += 1;
      }
    });
  });

  return Array.from(estudiantes.values())
    .map((estudiante) => {
      const faltasEquivalentes = estudiante.ausentes + estudiante.tardanzas / 4;

      const porcentaje = calcularPorcentajeAsistencia(
        estudiante.presentes,
        estudiante.ausentes,
        estudiante.tardanzas,
      );

      return {
        ...estudiante,
        faltasEquivalentes,
        porcentaje,
      };
    })
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      }),
    );
}

function obtenerEstadoAsistencia(porcentaje) {
  if (porcentaje >= 95) {
    return {
      texto: "Excelente",
      clase: "estado-asistencia-excelente",
    };
  }

  if (porcentaje >= 90) {
    return {
      texto: "Muy buena",
      clase: "estado-asistencia-muy-buena",
    };
  }

  if (porcentaje >= 80) {
    return {
      texto: "Seguimiento",
      clase: "estado-asistencia-seguimiento",
    };
  }

  return {
    texto: "Riesgo",
    clase: "estado-asistencia-riesgo",
  };
}

function renderizarTablaSituacion(estudiantes, cursoNombre, tipoSeleccionado) {
  if (!vistaSituacionAsistenciaDocente) return;

  if (!estudiantes.length) {
    vistaSituacionAsistenciaDocente.innerHTML = `
      <p class="mensaje-gestion">
        No hay registros de asistencia para el curso y tipo seleccionados.
      </p>
    `;

    return;
  }

  const promedioCurso =
    estudiantes.reduce((suma, estudiante) => suma + estudiante.porcentaje, 0) /
    estudiantes.length;

  const cantidadRiesgo = estudiantes.filter(
    (estudiante) => estudiante.porcentaje < 80,
  ).length;

  const cantidadExcelente = estudiantes.filter(
    (estudiante) => estudiante.porcentaje >= 95,
  ).length;

  vistaSituacionAsistenciaDocente.innerHTML = `
    <div class="sira-gestion-encabezado">
      <h3>Situación de asistencia - ${cursoNombre}</h3>

      <p>${obtenerEtiquetaTipo(tipoSeleccionado)}</p>
    </div>

    <div class="resumen-situacion-asistencia">
      <div class="tarjeta-resumen-asistencia">
        <span>Estudiantes</span>
        <strong>${estudiantes.length}</strong>
      </div>

      <div class="tarjeta-resumen-asistencia">
        <span>Promedio del curso</span>
        <strong>${formatearPorcentaje(promedioCurso)} %</strong>
      </div>

      <div class="tarjeta-resumen-asistencia riesgo">
        <span>En riesgo</span>
        <strong>${cantidadRiesgo}</strong>
      </div>

      <div class="tarjeta-resumen-asistencia excelente">
        <span>Asistencia destacada</span>
        <strong>${cantidadExcelente}</strong>
      </div>
    </div>

    <p class="criterio-asistencia">
      4 tardanzas equivalen a 1 falta.
    </p>

    <div class="tabla-responsive">
      <table class="tabla-gestion tabla-situacion-asistencia">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>P</th>
            <th>A</th>
            <th>T</th>
            <th>Faltas equivalentes</th>
            <th>% Asistencia</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          ${estudiantes
            .map((estudiante) => {
              const estado = obtenerEstadoAsistencia(estudiante.porcentaje);

              return `
                <tr>
                  <td>
                    <strong>${estudiante.nombre}</strong>
                  </td>

                  <td>${estudiante.presentes}</td>
                  <td>${estudiante.ausentes}</td>
                  <td>${estudiante.tardanzas}</td>

                  <td>
                    ${formatearNumero(estudiante.faltasEquivalentes)}
                  </td>

                  <td>
                    <strong>
                      ${formatearPorcentaje(estudiante.porcentaje)} %
                    </strong>
                  </td>

                  <td>
                    <span class="estado-asistencia ${estado.clase}">
                      ${estado.texto}
                    </span>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function consultarSituacionAsistencia() {
  const cursoSeleccionado = obtenerCursoSeleccionado();

  if (!cursoSeleccionado) {
    mostrarMensaje(
      "Seleccioná un curso para consultar la situación de asistencia.",
      "error",
    );
    return;
  }

  const cursoId = cursoSeleccionado.cursoId;
  const tipo = cursoSeleccionado.tipos[0];
  const cursoNombre = cursoSeleccionado.cursoNombre;

  const periodoSeleccionado =
    periodoSituacionAsistenciaDocente?.value || "ANUAL";

  const cicloLectivo = new Date().getFullYear();

  if (!tipo || !cursoId) {
    mostrarMensajeSituacionAsistencia(
      "Seleccioná el tipo de asistencia y el curso.",
      "error",
    );

    return;
  }

  mostrarMensaje("");

  if (vistaSituacionAsistenciaDocente) {
    vistaSituacionAsistenciaDocente.innerHTML = `
      <p class="mensaje-gestion">
        Consultando situación de asistencia...
      </p>
    `;
  }

  if (btnVerSituacionAsistenciaDocente) {
    btnVerSituacionAsistenciaDocente.disabled = true;

    btnVerSituacionAsistenciaDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const periodos = await obtenerPeriodosAsistencia(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodo(periodoSeleccionado, periodos);

    if (!rangoPeriodo?.desde || !rangoPeriodo?.hasta) {
      throw new Error(
        "El período seleccionado no tiene fechas configuradas correctamente.",
      );
    }

    const correoDocente = normalizarCorreo(usuarioDocenteActual?.email);

    const consultasAsistencias = [
      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipo),
        where("docenteCorreo", "==", correoDocente),
      ),

      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipo),
        where("docenteTitularCorreo", "==", correoDocente),
      ),
    ];

    const resultadosAsistencias = await Promise.all(
      consultasAsistencias.map((consulta) => getDocs(consulta)),
    );

    const asistenciasPorId = new Map();

    resultadosAsistencias.forEach((resultado) => {
      resultado.forEach((documento) => {
        const datos = documento.data();

        if (datos.cursoId !== cursoId) return;

        if (
          datos.fecha < rangoPeriodo.desde ||
          datos.fecha > rangoPeriodo.hasta
        ) {
          return;
        }

        asistenciasPorId.set(documento.id, {
          id: documento.id,
          ...datos,
        });
      });
    });

    const asistencias = Array.from(asistenciasPorId.values());

    const estudiantes = agruparSituacionPorEstudiante(asistencias);

    renderizarTablaSituacion(estudiantes, cursoNombre || "Curso", tipo);
  } catch (error) {
    console.error("Error al consultar la situación de asistencia:", error);

    if (vistaSituacionAsistenciaDocente) {
      vistaSituacionAsistenciaDocente.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar la situación de asistencia.
        </p>
      `;
    }

    mostrarMensaje(
      error.message || "No se pudo consultar la situación de asistencia.",
      "error",
    );
  } finally {
    if (btnVerSituacionAsistenciaDocente) {
      btnVerSituacionAsistenciaDocente.disabled = false;

      btnVerSituacionAsistenciaDocente.innerHTML = `
        <i class="fa-solid fa-magnifying-glass-chart"></i>
        Consultar situación
      `;
    }
  }
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    usuarioDocenteActual = null;
    return;
  }

  usuarioDocenteActual = usuario;

  cargarCursosAlAbrirSeccion();
});

window.addEventListener("hashchange", cargarCursosAlAbrirSeccion);
