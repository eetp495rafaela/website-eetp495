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
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
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

const tipoSiraAdmin = document.getElementById("tipoSiraAdmin");
const cursoSiraAdmin = document.getElementById("cursoSiraAdmin");
const fechaInicioSiraAdmin = document.getElementById("fechaInicioSiraAdmin");
const btnVerSiraAdmin = document.getElementById("btnVerSiraAdmin");
const vistaSiraAdmin = document.getElementById("vistaSiraAdmin");
const mensajeSiraAdminPanel = document.getElementById("mensajeSiraAdminPanel");

const tipoSituacionAsistenciaAdmin = document.getElementById(
  "tipoSituacionAsistenciaAdmin",
);
const cursoSituacionAsistenciaAdmin = document.getElementById(
  "cursoSituacionAsistenciaAdmin",
);
const periodoSituacionAsistenciaAdmin = document.getElementById(
  "periodoSituacionAsistenciaAdmin",
);
const btnVerSituacionAsistenciaAdmin = document.getElementById(
  "btnVerSituacionAsistenciaAdmin",
);
const vistaSituacionAsistenciaAdmin = document.getElementById(
  "vistaSituacionAsistenciaAdmin",
);
const mensajeSituacionAsistenciaAdmin = document.getElementById(
  "mensajeSituacionAsistenciaAdmin",
);

const cursoDetalleAsistenciaAdmin = document.getElementById(
  "cursoDetalleAsistenciaAdmin",
);
const estudianteDetalleAsistenciaAdmin = document.getElementById(
  "estudianteDetalleAsistenciaAdmin",
);
const tipoDetalleAsistenciaAdmin = document.getElementById(
  "tipoDetalleAsistenciaAdmin",
);
const periodoDetalleAsistenciaAdmin = document.getElementById(
  "periodoDetalleAsistenciaAdmin",
);
const btnVerDetalleAsistenciaAdmin = document.getElementById(
  "btnVerDetalleAsistenciaAdmin",
);
const vistaDetalleAsistenciaAdmin = document.getElementById(
  "vistaDetalleAsistenciaAdmin",
);
const mensajeDetalleAsistenciaAdmin = document.getElementById(
  "mensajeDetalleAsistenciaAdmin",
);

let usuarioSiraAdminActual = null;
let cursosSiraAdmin = [];
let asistenciasSiraAdminActuales = [];
let fechasSiraAdminActuales = [];

let estudiantesDetalleAsistenciaAdmin = [];
let registrosDetalleAsistenciaAdmin = [];
let filtroEstadoDetalleAsistenciaAdmin = "TODOS";

const DIAS_SEMANA_SIRA = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const ETIQUETAS_DIAS_SIRA = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
};

function mostrarMensajeSiraAdmin(texto, tipo = "") {
  if (!mensajeSiraAdminPanel) return;

  mensajeSiraAdminPanel.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${texto}
      </span>
    `
    : "";
}

function formatearFechaSiraAdmin(fechaTexto) {
  if (!fechaTexto) return "";

  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerDiaDesdeFechaSiraAdmin(fechaTexto) {
  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return DIAS_SEMANA_SIRA[fecha.getDay()] || "";
}

function obtenerFechasHabilesDesdeInicio(fechaInicioTexto) {
  const partes = fechaInicioTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  const fechas = [];

  while (fechas.length < 5) {
    const dia = fecha.getDay();

    if (dia !== 0 && dia !== 6) {
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, "0");
      const dd = String(fecha.getDate()).padStart(2, "0");

      fechas.push(`${yyyy}-${mm}-${dd}`);
    }

    fecha.setDate(fecha.getDate() + 1);
  }

  return fechas;
}

function obtenerEtiquetaTipoSiraAdmin(tipo) {
  if (tipo === "TALLER") return "Taller";
  if (tipo === "EDUCACION_FISICA") return "Educación Física";

  return tipo || "";
}

function agruparRegistrosPorEstado(registros = []) {
  return {
    PRESENTE: registros.filter((registro) => registro.estado === "PRESENTE"),
    AUSENTE: registros.filter((registro) => registro.estado === "AUSENTE"),
    TARDE: registros.filter((registro) => registro.estado === "TARDE"),
  };
}

function renderizarListaEstadoSiraAdmin(titulo, registros, claseCss) {
  return `
    <div class="sira-admin-estado ${claseCss}">
      <h5>${titulo} <span>${registros.length}</span></h5>

      ${
        registros.length
          ? `
            <ul>
              ${registros
                .map(
                  (registro) => `
                    <li>
                      <strong>${registro.alumnoNombre || "-"}</strong>
                      ${
                        registro.observacion
                          ? `<small>${registro.observacion}</small>`
                          : ""
                      }
                    </li>
                  `,
                )
                .join("")}
            </ul>
          `
          : `<p class="sira-admin-sin-datos">Sin registros</p>`
      }
    </div>
  `;
}

function renderizarBloqueAsistenciaSiraAdmin(asistencia) {
  const grupos = agruparRegistrosPorEstado(asistencia.registros || []);
  const tipo = String(asistencia.tipoHorario || "")
    .trim()
    .toUpperCase();

  return `
    <article class="sira-admin-bloque">
      <header>
        <div>
          <h4>
            ${
              asistencia.espacioCurricular || obtenerEtiquetaTipoSiraAdmin(tipo)
            }
          </h4>

          <p>
            ${
              tipo === "TALLER"
                ? `Grupo ${asistencia.grupoTaller || "-"}`
                : "Curso completo"
            }
          </p>

          <p>
            <strong>Docente:</strong> ${asistencia.docenteNombre || "-"}
          </p>

          <p>
            <strong>Horario:</strong> ${asistencia.horarioTexto || "-"}
          </p>
        </div>

        <button
          class="btn-eliminar-asistencia-sira-admin"
          type="button"
          data-id="${asistencia.id}"
        >
          <i class="fa-solid fa-trash-can"></i>
          Eliminar
        </button>
      </header>

      ${renderizarListaEstadoSiraAdmin(
        "Presentes:",
        grupos.PRESENTE,
        "presentes",
      )}

      ${renderizarListaEstadoSiraAdmin("Ausentes:", grupos.AUSENTE, "ausentes")}

      ${renderizarListaEstadoSiraAdmin("Tardanzas:", grupos.TARDE, "tarde")}
    </article>
  `;
}

function activarBotonesEliminarSiraAdmin() {
  const botonesEliminar = document.querySelectorAll(
    ".btn-eliminar-asistencia-sira-admin",
  );

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const asistenciaId = boton.dataset.id;
      eliminarAsistenciaSiraAdmin(asistenciaId);
    });
  });
}

function renderizarParteSemanalSiraAdmin(fechas, asistencias) {
  if (!vistaSiraAdmin) return;

  const tipoSeleccionado = tipoSiraAdmin.value;
  const cursoSeleccionado = cursosSiraAdmin.find(
    (curso) => curso.id === cursoSiraAdmin.value,
  );

  vistaSiraAdmin.innerHTML = `
    <div class="sira-admin-encabezado">
      <h3>
        Parte semanal - ${cursoSeleccionado?.nombre || "Curso"}
      </h3>

      <p>
        ${obtenerEtiquetaTipoSiraAdmin(tipoSeleccionado)}
        · ${formatearFechaSiraAdmin(fechas[0])}
        al ${formatearFechaSiraAdmin(fechas[fechas.length - 1])}
      </p>
    </div>

    <div class="sira-admin-semana">
      ${fechas
        .map((fecha) => {
          const dia = obtenerDiaDesdeFechaSiraAdmin(fecha);

          const asistenciasDia = asistencias
            .filter((asistencia) => asistencia.fecha === fecha)
            .sort((a, b) =>
              String(a.horaInicio || "").localeCompare(
                String(b.horaInicio || ""),
              ),
            );

          return `
            <section class="sira-admin-dia">
              <h4>
                ${ETIQUETAS_DIAS_SIRA[dia] || dia}
                <span>${formatearFechaSiraAdmin(fecha)}</span>
              </h4>

              ${
                asistenciasDia.length
                  ? asistenciasDia
                      .map(renderizarBloqueAsistenciaSiraAdmin)
                      .join("")
                  : `
                    <div class="sira-admin-dia-vacio">
                      Sin asistencia registrada
                    </div>
                  `
              }
            </section>
          `;
        })
        .join("")}
    </div>
  `;

  activarBotonesEliminarSiraAdmin();
}

async function cargarCursosSiraAdmin() {
  if (!cursoSiraAdmin) return;

  cursoSiraAdmin.innerHTML = `
    <option value="">Cargando cursos...</option>
  `;

  try {
    const consultaCursos = query(
      collection(db, "cursos"),
      where("estado", "==", "ACTIVO"),
    );

    const resultado = await getDocs(consultaCursos);

    const cursos = [];

    resultado.forEach((documento) => {
      cursos.push({
        id: documento.id,
        ...documento.data(),
      });
    });

    cursos.sort((a, b) => {
      const anioA = Number(a.anio || a.cursoAnio || 0);
      const anioB = Number(b.anio || b.cursoAnio || 0);

      if (anioA !== anioB) return anioA - anioB;

      return String(a.division || a.cursoDivision || "").localeCompare(
        String(b.division || b.cursoDivision || ""),
        "es",
      );
    });

    cursosSiraAdmin = cursos;
    renderizarCursosSituacionAsistenciaAdmin(cursos);
    renderizarCursosDetalleAsistenciaAdmin(cursos);

    cursoSiraAdmin.innerHTML = `
      <option value="">Seleccionar curso</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${curso.id}">
              ${
                curso.nombre ||
                curso.cursoNombre ||
                `${curso.anio || curso.cursoAnio}º ${
                  curso.division || curso.cursoDivision
                }`
              }
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar cursos Si.R.A. Admin:", error);

    cursoSiraAdmin.innerHTML = `
      <option value="">No se pudieron cargar cursos</option>
    `;

    mostrarMensajeSiraAdmin(
      error.message || "No se pudieron cargar los cursos.",
      "error",
    );
  }
}

async function consultarParteSemanalSiraAdmin() {
  const tipo = tipoSiraAdmin?.value || "";
  const cursoId = cursoSiraAdmin?.value || "";
  const fechaInicio = fechaInicioSiraAdmin?.value || "";

  if (!tipo || !cursoId || !fechaInicio) {
    mostrarMensajeSiraAdmin(
      "Seleccioná tipo de asistencia, curso y fecha de inicio.",
      "error",
    );
    return;
  }

  const fechas = obtenerFechasHabilesDesdeInicio(fechaInicio);
  const fechaDesde = fechas[0];
  const fechaHasta = fechas[fechas.length - 1];

  fechasSiraAdminActuales = fechas;

  if (vistaSiraAdmin) {
    vistaSiraAdmin.innerHTML = `
      <p class="mensaje-formulario">Cargando parte semanal...</p>
    `;
  }

  mostrarMensajeSiraAdmin("");

  if (btnVerSiraAdmin) {
    btnVerSiraAdmin.disabled = true;
    btnVerSiraAdmin.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;
  }

  try {
    const consultaAsistencias = query(
      collection(db, "asistencias_clases"),
      where("estado", "==", "ACTIVA"),
      where("tipoHorario", "==", tipo),
    );

    const resultado = await getDocs(consultaAsistencias);

    const asistencias = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      if (datos.cursoId !== cursoId) return;
      if (datos.fecha < fechaDesde || datos.fecha > fechaHasta) return;

      asistencias.push({
        id: documento.id,
        ...datos,
      });
    });

    asistenciasSiraAdminActuales = asistencias;

    renderizarParteSemanalSiraAdmin(fechas, asistencias);
  } catch (error) {
    console.error("Error al consultar Si.R.A. Admin:", error);

    if (vistaSiraAdmin) {
      vistaSiraAdmin.innerHTML = `
        <p class="mensaje-formulario mensaje-error">
          No se pudo consultar el parte semanal.
        </p>
      `;
    }

    mostrarMensajeSiraAdmin(
      error.message || "No se pudo consultar el parte semanal.",
      "error",
    );
  } finally {
    if (btnVerSiraAdmin) {
      btnVerSiraAdmin.disabled = false;
      btnVerSiraAdmin.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver parte semanal
      `;
    }
  }
}

async function eliminarAsistenciaSiraAdmin(asistenciaId) {
  if (!asistenciaId) return;

  const asistencia = asistenciasSiraAdminActuales.find(
    (item) => item.id === asistenciaId,
  );

  const detalle = asistencia
    ? `${asistencia.espacioCurricular || "Asistencia"} - ${
        asistencia.cursoNombre || ""
      } - ${formatearFechaSiraAdmin(asistencia.fecha)}`
    : "esta asistencia";

  let confirmado = true;

  if (window.Swal) {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar asistencia?",
      html: `
        <p>Vas a eliminar la carga de asistencia:</p>
        <strong>${detalle}</strong>
        <p style="margin-top:10px;">Esta acción no se puede deshacer.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    confirmado = resultado.isConfirmed;
  } else {
    confirmado = window.confirm(`¿Eliminar ${detalle}?`);
  }

  if (!confirmado) return;

  try {
    mostrarMensajeSiraAdmin("Eliminando asistencia...");

    await deleteDoc(doc(db, "asistencias_clases", asistenciaId));

    mostrarMensajeSiraAdmin("Asistencia eliminada correctamente.");

    if (window.Swal) {
      await Swal.fire({
        icon: "success",
        title: "Asistencia eliminada",
        text: "La carga fue eliminada correctamente.",
        confirmButtonText: "Aceptar",
      });
    }

    consultarParteSemanalSiraAdmin();
  } catch (error) {
    console.error("Error al eliminar asistencia Si.R.A. Admin:", error);

    mostrarMensajeSiraAdmin(
      error.message || "No se pudo eliminar la asistencia.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message || "Ocurrió un error al eliminar la asistencia.",
        confirmButtonText: "Aceptar",
      });
    }
  }
}

function mostrarMensajeSituacionAsistenciaAdmin(texto, tipo = "") {
  if (!mensajeSituacionAsistenciaAdmin) return;

  mensajeSituacionAsistenciaAdmin.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtmlDetalleAsistenciaAdmin(texto)}
      </span>
    `
    : "";
}

function renderizarCursosSituacionAsistenciaAdmin(cursos = []) {
  if (!cursoSituacionAsistenciaAdmin) return;

  cursoSituacionAsistenciaAdmin.innerHTML = `
    <option value="">Seleccionar curso</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${escaparHtmlDetalleAsistenciaAdmin(curso.id)}">
            ${escaparHtmlDetalleAsistenciaAdmin(
              obtenerNombreCursoDetalleAsistenciaAdmin(curso),
            )}
          </option>
        `,
      )
      .join("")}
  `;
}

function calcularPorcentajeSituacionAsistenciaAdmin(
  presentes,
  ausentes,
  tardanzas,
) {
  const totalClases = presentes + ausentes + tardanzas;

  if (totalClases === 0) return 0;

  const faltasEquivalentes = ausentes + tardanzas / 4;
  const porcentaje = ((totalClases - faltasEquivalentes) / totalClases) * 100;

  return Math.max(0, Math.min(100, porcentaje));
}

function formatearNumeroSituacionAsistenciaAdmin(numero) {
  return Number(numero || 0).toLocaleString("es-AR", {
    minimumFractionDigits: Number(numero) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatearPorcentajeSituacionAsistenciaAdmin(numero) {
  return Number(numero || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function agruparSituacionAsistenciaAdmin(asistencias = []) {
  const estudiantes = new Map();

  asistencias.forEach((asistencia) => {
    const registros = Array.isArray(asistencia.registros)
      ? asistencia.registros
      : [];

    registros.forEach((registro) => {
      const nombre = obtenerNombreEstudianteDetalleAsistenciaAdmin(registro);

      if (!nombre) return;

      const id = obtenerIdEstudianteDetalleAsistenciaAdmin(registro);
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
      const estado = normalizarEstadoDetalleAsistenciaAdmin(registro.estado);

      if (estado === "PRESENTE") estudiante.presentes += 1;
      if (estado === "AUSENTE") estudiante.ausentes += 1;
      if (estado === "TARDE") estudiante.tardanzas += 1;
    });
  });

  return Array.from(estudiantes.values())
    .map((estudiante) => {
      const faltasEquivalentes = estudiante.ausentes + estudiante.tardanzas / 4;
      const porcentaje = calcularPorcentajeSituacionAsistenciaAdmin(
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

function obtenerEstadoSituacionAsistenciaAdmin(porcentaje) {
  if (porcentaje >= 95) {
    return {
      texto: "Excelente",
      clase: "estado-asistencia-admin-excelente",
    };
  }

  if (porcentaje >= 90) {
    return {
      texto: "Muy buena",
      clase: "estado-asistencia-admin-muy-buena",
    };
  }

  if (porcentaje >= 80) {
    return {
      texto: "Seguimiento",
      clase: "estado-asistencia-admin-seguimiento",
    };
  }

  return {
    texto: "Riesgo",
    clase: "estado-asistencia-admin-riesgo",
  };
}

function renderizarTablaSituacionAsistenciaAdmin(
  estudiantes,
  cursoNombre,
  tipoSeleccionado,
) {
  if (!vistaSituacionAsistenciaAdmin) return;

  if (!estudiantes.length) {
    vistaSituacionAsistenciaAdmin.innerHTML = `
      <p class="mensaje-formulario">
        No hay registros de asistencia para el curso, tipo y período seleccionados.
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

  vistaSituacionAsistenciaAdmin.innerHTML = `
    <div class="encabezado-situacion-asistencia-admin">
      <h3>
        Situación de asistencia -
        ${escaparHtmlDetalleAsistenciaAdmin(cursoNombre || "Curso")}
      </h3>
      <p>${escaparHtmlDetalleAsistenciaAdmin(
        obtenerEtiquetaTipoSiraAdmin(tipoSeleccionado),
      )}</p>
    </div>

    <div class="resumen-situacion-asistencia-admin">
      <div class="tarjeta-resumen-asistencia-admin">
        <span>Estudiantes</span>
        <strong>${estudiantes.length}</strong>
      </div>

      <div class="tarjeta-resumen-asistencia-admin">
        <span>Promedio del curso</span>
        <strong>${formatearPorcentajeSituacionAsistenciaAdmin(
          promedioCurso,
        )} %</strong>
      </div>

      <div class="tarjeta-resumen-asistencia-admin riesgo">
        <span>En riesgo</span>
        <strong>${cantidadRiesgo}</strong>
      </div>

      <div class="tarjeta-resumen-asistencia-admin excelente">
        <span>Asistencia destacada</span>
        <strong>${cantidadExcelente}</strong>
      </div>
    </div>

    <p class="criterio-asistencia-admin">
      4 tardanzas equivalen a 1 falta.
    </p>

    <div class="tabla-situacion-asistencia-admin-contenedor">
      <table class="tabla-situacion-asistencia-admin">
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
              const estado = obtenerEstadoSituacionAsistenciaAdmin(
                estudiante.porcentaje,
              );

              return `
                <tr>
                  <td>
                    <strong>${escaparHtmlDetalleAsistenciaAdmin(
                      estudiante.nombre,
                    )}</strong>
                  </td>
                  <td>${estudiante.presentes}</td>
                  <td>${estudiante.ausentes}</td>
                  <td>${estudiante.tardanzas}</td>
                  <td>
                    ${formatearNumeroSituacionAsistenciaAdmin(
                      estudiante.faltasEquivalentes,
                    )}
                  </td>
                  <td>
                    <strong>
                      ${formatearPorcentajeSituacionAsistenciaAdmin(
                        estudiante.porcentaje,
                      )} %
                    </strong>
                  </td>
                  <td>
                    <span class="estado-asistencia-admin ${estado.clase}">
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

async function consultarSituacionAsistenciaAdmin() {
  const tipo = String(tipoSituacionAsistenciaAdmin?.value || "").trim();
  const cursoId = String(cursoSituacionAsistenciaAdmin?.value || "").trim();
  const periodoSeleccionado = String(
    periodoSituacionAsistenciaAdmin?.value || "ANUAL",
  ).trim();

  if (!tipo || !cursoId) {
    mostrarMensajeSituacionAsistenciaAdmin(
      "Seleccioná el tipo de asistencia y el curso.",
      "error",
    );
    return;
  }

  const cursoSeleccionado = cursosSiraAdmin.find(
    (curso) => String(curso.id || "").trim() === cursoId,
  );

  if (!cursoSeleccionado) {
    mostrarMensajeSituacionAsistenciaAdmin(
      "No se pudo identificar el curso seleccionado.",
      "error",
    );
    return;
  }

  mostrarMensajeSituacionAsistenciaAdmin("");

  if (vistaSituacionAsistenciaAdmin) {
    vistaSituacionAsistenciaAdmin.innerHTML = `
      <p class="mensaje-formulario">Consultando situación de asistencia...</p>
    `;
  }

  if (btnVerSituacionAsistenciaAdmin) {
    btnVerSituacionAsistenciaAdmin.disabled = true;
    btnVerSituacionAsistenciaAdmin.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const cicloLectivo = new Date().getFullYear();
    const periodos = await obtenerPeriodosDetalleAsistenciaAdmin(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodoDetalleAsistenciaAdmin(
      periodoSeleccionado,
      periodos,
    );

    if (!rangoPeriodo?.desde || !rangoPeriodo?.hasta) {
      throw new Error(
        "El período seleccionado no tiene fechas configuradas correctamente.",
      );
    }

    const consultaAsistencias = query(
      collection(db, "asistencias_clases"),
      where("estado", "==", "ACTIVA"),
      where("tipoHorario", "==", tipo),
    );

    const resultado = await getDocs(consultaAsistencias);
    const asistencias = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      if (String(datos.cursoId || "").trim() !== cursoId) return;

      const fecha = String(datos.fecha || "").trim();
      if (fecha < rangoPeriodo.desde || fecha > rangoPeriodo.hasta) return;

      asistencias.push({
        id: documento.id,
        ...datos,
      });
    });

    const estudiantes = agruparSituacionAsistenciaAdmin(asistencias);

    renderizarTablaSituacionAsistenciaAdmin(
      estudiantes,
      obtenerNombreCursoDetalleAsistenciaAdmin(cursoSeleccionado) || "Curso",
      tipo,
    );
  } catch (error) {
    console.error("Error al consultar situación de asistencia Admin:", error);

    if (vistaSituacionAsistenciaAdmin) {
      vistaSituacionAsistenciaAdmin.innerHTML = `
        <p class="mensaje-formulario mensaje-error">
          No se pudo consultar la situación de asistencia.
        </p>
      `;
    }

    mostrarMensajeSituacionAsistenciaAdmin(
      error.message || "No se pudo consultar la situación de asistencia.",
      "error",
    );
  } finally {
    if (btnVerSituacionAsistenciaAdmin) {
      btnVerSituacionAsistenciaAdmin.disabled = false;
      btnVerSituacionAsistenciaAdmin.innerHTML = `
        <i class="fa-solid fa-magnifying-glass-chart"></i>
        Consultar situación
      `;
    }
  }
}

function escaparHtmlDetalleAsistenciaAdmin(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarEstadoDetalleAsistenciaAdmin(estado) {
  return String(estado || "")
    .trim()
    .toUpperCase();
}

function obtenerNombreEstudianteDetalleAsistenciaAdmin(registro) {
  return String(
    registro.alumnoNombre ||
      registro.estudianteNombre ||
      registro.nombreAlumno ||
      registro.nombre ||
      "",
  ).trim();
}

function obtenerIdEstudianteDetalleAsistenciaAdmin(registro) {
  return String(
    registro.alumnoId ||
      registro.estudianteId ||
      registro.idAlumno ||
      registro.dni ||
      obtenerNombreEstudianteDetalleAsistenciaAdmin(registro),
  ).trim();
}

function formatearFechaDetalleAsistenciaAdmin(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha || "-";
  }

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function etiquetaEstadoDetalleAsistenciaAdmin(estado) {
  const valor = normalizarEstadoDetalleAsistenciaAdmin(estado);

  if (valor === "PRESENTE") return "Presente";
  if (valor === "AUSENTE") return "Ausente";
  if (valor === "TARDE") return "Tarde";

  return valor || "-";
}

function mostrarMensajeDetalleAsistenciaAdmin(texto, tipo = "") {
  if (!mensajeDetalleAsistenciaAdmin) return;

  mensajeDetalleAsistenciaAdmin.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtmlDetalleAsistenciaAdmin(texto)}
      </span>
    `
    : "";
}

function obtenerNombreCursoDetalleAsistenciaAdmin(curso) {
  return String(
    curso?.nombre ||
      curso?.cursoNombre ||
      `${curso?.anio || curso?.cursoAnio || ""}º ${
        curso?.division || curso?.cursoDivision || ""
      }`,
  ).trim();
}

function renderizarCursosDetalleAsistenciaAdmin(cursos = []) {
  if (!cursoDetalleAsistenciaAdmin) return;

  cursoDetalleAsistenciaAdmin.innerHTML = `
    <option value="">Seleccionar curso</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${escaparHtmlDetalleAsistenciaAdmin(curso.id)}">
            ${escaparHtmlDetalleAsistenciaAdmin(
              obtenerNombreCursoDetalleAsistenciaAdmin(curso),
            )}
          </option>
        `,
      )
      .join("")}
  `;
}

async function obtenerPeriodosDetalleAsistenciaAdmin(cicloLectivo) {
  const referencia = doc(db, "configuracion_periodos", String(cicloLectivo));
  const documento = await getDoc(referencia);

  if (!documento.exists()) return null;
  return documento.data();
}

function obtenerRangoPeriodoDetalleAsistenciaAdmin(
  periodoSeleccionado,
  periodos,
) {
  if (!periodos) return null;

  switch (periodoSeleccionado) {
    case "TRIMESTRE_1":
      return {
        desde: periodos.trimestre1Inicio || "",
        hasta: periodos.trimestre1Fin || "",
      };

    case "TRIMESTRE_2":
      return {
        desde: periodos.trimestre2Inicio || "",
        hasta: periodos.trimestre2Fin || "",
      };

    case "TRIMESTRE_3":
      return {
        desde: periodos.trimestre3Inicio || "",
        hasta: periodos.trimestre3Fin || "",
      };

    case "ANUAL":
      return {
        desde: periodos.trimestre1Inicio || "",
        hasta: periodos.trimestre3Fin || "",
      };

    default:
      return null;
  }
}

async function cargarEstudiantesDetalleAsistenciaAdmin() {
  const cursoId = String(cursoDetalleAsistenciaAdmin?.value || "").trim();

  estudiantesDetalleAsistenciaAdmin = [];
  registrosDetalleAsistenciaAdmin = [];
  filtroEstadoDetalleAsistenciaAdmin = "TODOS";

  if (!estudianteDetalleAsistenciaAdmin) return;

  if (!cursoId) {
    estudianteDetalleAsistenciaAdmin.disabled = true;
    estudianteDetalleAsistenciaAdmin.innerHTML = `
      <option value="">Primero seleccioná un curso</option>
    `;

    if (vistaDetalleAsistenciaAdmin) {
      vistaDetalleAsistenciaAdmin.innerHTML = `
        <p class="mensaje-formulario">
          Seleccioná un curso, un estudiante y el tipo de asistencia para
          consultar el detalle.
        </p>
      `;
    }

    return;
  }

  estudianteDetalleAsistenciaAdmin.disabled = true;
  estudianteDetalleAsistenciaAdmin.innerHTML = `
    <option value="">Cargando estudiantes...</option>
  `;
  mostrarMensajeDetalleAsistenciaAdmin("");

  try {
    const consultaEstudiantes = query(
      collection(db, "usuarios"),
      where("rol", "==", "ALUMNO"),
      where("estado", "==", "ACTIVO"),
      where("tipoVinculo", "==", "CURSANDO"),
      where("cursoId", "==", cursoId),
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

    estudiantesDetalleAsistenciaAdmin = estudiantes;

    if (!estudiantes.length) {
      estudianteDetalleAsistenciaAdmin.innerHTML = `
        <option value="">No hay estudiantes activos</option>
      `;
      estudianteDetalleAsistenciaAdmin.disabled = true;
      return;
    }

    estudianteDetalleAsistenciaAdmin.innerHTML = `
      <option value="">Seleccionar estudiante</option>
      ${estudiantes
        .map(
          (estudiante) => `
            <option value="${escaparHtmlDetalleAsistenciaAdmin(estudiante.id)}">
              ${escaparHtmlDetalleAsistenciaAdmin(
                estudiante.nombreCompleto || "Estudiante sin nombre",
              )}
            </option>
          `,
        )
        .join("")}
    `;

    estudianteDetalleAsistenciaAdmin.disabled = false;
  } catch (error) {
    console.error("Error al cargar estudiantes para detalle Admin:", error);

    estudianteDetalleAsistenciaAdmin.innerHTML = `
      <option value="">No se pudieron cargar estudiantes</option>
    `;
    estudianteDetalleAsistenciaAdmin.disabled = true;

    mostrarMensajeDetalleAsistenciaAdmin(
      error.message || "No se pudieron cargar los estudiantes del curso.",
      "error",
    );
  }
}

function renderizarDetalleAsistenciaAdmin() {
  if (!vistaDetalleAsistenciaAdmin) return;

  const estudianteId = String(
    estudianteDetalleAsistenciaAdmin?.value || "",
  ).trim();

  const estudiante = estudiantesDetalleAsistenciaAdmin.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  const nombreEstudiante =
    String(estudiante?.nombreCompleto || "").trim() || "Estudiante";

  const presentes = registrosDetalleAsistenciaAdmin.filter(
    (item) => item.estado === "PRESENTE",
  ).length;
  const ausentes = registrosDetalleAsistenciaAdmin.filter(
    (item) => item.estado === "AUSENTE",
  ).length;
  const tardanzas = registrosDetalleAsistenciaAdmin.filter(
    (item) => item.estado === "TARDE",
  ).length;

  const registrosFiltrados =
    filtroEstadoDetalleAsistenciaAdmin === "TODOS"
      ? registrosDetalleAsistenciaAdmin
      : registrosDetalleAsistenciaAdmin.filter(
          (item) => item.estado === filtroEstadoDetalleAsistenciaAdmin,
        );

  const botonFiltro = (estado, texto) => `
    <button
      type="button"
      class="btn-filtro-detalle-asistencia-admin ${
        filtroEstadoDetalleAsistenciaAdmin === estado ? "activo" : ""
      }"
      data-estado-detalle-admin="${estado}"
    >
      ${texto}
    </button>
  `;

  vistaDetalleAsistenciaAdmin.innerHTML = `
    <div class="encabezado-detalle-asistencia-admin">
      <h3>${escaparHtmlDetalleAsistenciaAdmin(nombreEstudiante)}</h3>
    </div>

    <div
      class="filtros-estado-detalle-asistencia-admin"
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
          <div class="tabla-detalle-asistencia-admin-contenedor">
            <table class="tabla-detalle-asistencia-admin">
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
                        <td>${escaparHtmlDetalleAsistenciaAdmin(
                          formatearFechaDetalleAsistenciaAdmin(registro.fecha),
                        )}</td>
                        <td>${escaparHtmlDetalleAsistenciaAdmin(
                          etiquetaEstadoDetalleAsistenciaAdmin(registro.estado),
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
          <p class="mensaje-formulario mensaje-detalle-sin-registros-admin">
            No hay registros para el filtro seleccionado.
          </p>
        `
    }
  `;

  vistaDetalleAsistenciaAdmin
    .querySelectorAll("[data-estado-detalle-admin]")
    .forEach((boton) => {
      boton.addEventListener("click", () => {
        filtroEstadoDetalleAsistenciaAdmin =
          boton.dataset.estadoDetalleAdmin || "TODOS";
        renderizarDetalleAsistenciaAdmin();
      });
    });
}

async function consultarDetalleAsistenciaAdmin() {
  const cursoId = String(cursoDetalleAsistenciaAdmin?.value || "").trim();
  const estudianteId = String(
    estudianteDetalleAsistenciaAdmin?.value || "",
  ).trim();
  const tipo = String(tipoDetalleAsistenciaAdmin?.value || "").trim();
  const periodoSeleccionado = String(
    periodoDetalleAsistenciaAdmin?.value || "ANUAL",
  ).trim();

  if (!cursoId || !estudianteId || !tipo) {
    mostrarMensajeDetalleAsistenciaAdmin(
      "Seleccioná el curso, el estudiante y el tipo de asistencia.",
      "error",
    );
    return;
  }

  const estudiante = estudiantesDetalleAsistenciaAdmin.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  if (!estudiante) {
    mostrarMensajeDetalleAsistenciaAdmin(
      "No se pudo identificar al estudiante seleccionado.",
      "error",
    );
    return;
  }

  mostrarMensajeDetalleAsistenciaAdmin("");
  registrosDetalleAsistenciaAdmin = [];
  filtroEstadoDetalleAsistenciaAdmin = "TODOS";

  if (vistaDetalleAsistenciaAdmin) {
    vistaDetalleAsistenciaAdmin.innerHTML = `
      <p class="mensaje-formulario">Consultando detalle de asistencia...</p>
    `;
  }

  if (btnVerDetalleAsistenciaAdmin) {
    btnVerDetalleAsistenciaAdmin.disabled = true;
    btnVerDetalleAsistenciaAdmin.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const cicloLectivo = new Date().getFullYear();
    const periodos = await obtenerPeriodosDetalleAsistenciaAdmin(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodoDetalleAsistenciaAdmin(
      periodoSeleccionado,
      periodos,
    );

    if (!rangoPeriodo?.desde || !rangoPeriodo?.hasta) {
      throw new Error(
        "El período seleccionado no tiene fechas configuradas correctamente.",
      );
    }

    const consultaAsistencias = query(
      collection(db, "asistencias_clases"),
      where("estado", "==", "ACTIVA"),
      where("tipoHorario", "==", tipo),
    );

    const resultado = await getDocs(consultaAsistencias);
    const registros = [];
    const nombreEstudiante = String(estudiante.nombreCompleto || "")
      .trim()
      .toLocaleLowerCase("es");

    resultado.forEach((documento) => {
      const asistencia = documento.data();

      if (String(asistencia.cursoId || "").trim() !== cursoId) return;

      const fecha = String(asistencia.fecha || "").trim();
      if (fecha < rangoPeriodo.desde || fecha > rangoPeriodo.hasta) return;

      const registrosAsistencia = Array.isArray(asistencia.registros)
        ? asistencia.registros
        : [];

      const registroAlumno = registrosAsistencia.find((registro) => {
        const idRegistro = obtenerIdEstudianteDetalleAsistenciaAdmin(registro);
        if (idRegistro && idRegistro === estudianteId) return true;

        const nombreRegistro =
          obtenerNombreEstudianteDetalleAsistenciaAdmin(
            registro,
          ).toLocaleLowerCase("es");

        return Boolean(nombreEstudiante) && nombreRegistro === nombreEstudiante;
      });

      if (!registroAlumno) return;

      const estado = normalizarEstadoDetalleAsistenciaAdmin(
        registroAlumno.estado,
      );

      if (!["PRESENTE", "AUSENTE", "TARDE"].includes(estado)) return;

      registros.push({
        asistenciaId: documento.id,
        fecha,
        estado,
      });
    });

    registros.sort((a, b) => {
      const comparacionFecha = a.fecha.localeCompare(b.fecha);
      if (comparacionFecha !== 0) return comparacionFecha;
      return a.asistenciaId.localeCompare(b.asistenciaId);
    });

    registrosDetalleAsistenciaAdmin = registros;
    renderizarDetalleAsistenciaAdmin();
  } catch (error) {
    console.error("Error al consultar detalle de asistencia Admin:", error);

    if (vistaDetalleAsistenciaAdmin) {
      vistaDetalleAsistenciaAdmin.innerHTML = `
        <p class="mensaje-formulario mensaje-error">
          No se pudo consultar el detalle de asistencia.
        </p>
      `;
    }

    mostrarMensajeDetalleAsistenciaAdmin(
      error.message || "No se pudo consultar el detalle de asistencia.",
      "error",
    );
  } finally {
    if (btnVerDetalleAsistenciaAdmin) {
      btnVerDetalleAsistenciaAdmin.disabled = false;
      btnVerDetalleAsistenciaAdmin.innerHTML = `
        <i class="fa-solid fa-list-check"></i>
        Consultar detalle
      `;
    }
  }
}

if (btnVerSituacionAsistenciaAdmin) {
  btnVerSituacionAsistenciaAdmin.addEventListener(
    "click",
    consultarSituacionAsistenciaAdmin,
  );
}

if (cursoDetalleAsistenciaAdmin) {
  cursoDetalleAsistenciaAdmin.addEventListener(
    "change",
    cargarEstudiantesDetalleAsistenciaAdmin,
  );
}

if (btnVerDetalleAsistenciaAdmin) {
  btnVerDetalleAsistenciaAdmin.addEventListener(
    "click",
    consultarDetalleAsistenciaAdmin,
  );
}

function inicializarFechaSiraAdmin() {
  if (!fechaInicioSiraAdmin) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaInicioSiraAdmin.value = `${yyyy}-${mm}-${dd}`;
}

if (btnVerSiraAdmin) {
  btnVerSiraAdmin.addEventListener("click", consultarParteSemanalSiraAdmin);
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioSiraAdminActual = usuario;

  inicializarFechaSiraAdmin();
  cargarCursosSiraAdmin();
});
