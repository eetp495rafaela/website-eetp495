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
  doc,
  getDoc,
  getDocs,
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

const tipoSituacionAsistenciaGestion = document.getElementById(
  "tipoSituacionAsistenciaGestion",
);

const cursoSituacionAsistenciaGestion = document.getElementById(
  "cursoSituacionAsistenciaGestion",
);

const btnVerSituacionAsistenciaGestion = document.getElementById(
  "btnVerSituacionAsistenciaGestion",
);

const vistaSituacionAsistenciaGestion = document.getElementById(
  "vistaSituacionAsistenciaGestion",
);

const mensajeSituacionAsistenciaGestion = document.getElementById(
  "mensajeSituacionAsistenciaGestion",
);

let cursosSituacionAsistencia = [];

const cursoDetalleAsistenciaGestion = document.getElementById(
  "cursoDetalleAsistenciaGestion",
);

const estudianteDetalleAsistenciaGestion = document.getElementById(
  "estudianteDetalleAsistenciaGestion",
);

const tipoDetalleAsistenciaGestion = document.getElementById(
  "tipoDetalleAsistenciaGestion",
);

const periodoDetalleAsistenciaGestion = document.getElementById(
  "periodoDetalleAsistenciaGestion",
);

const btnVerDetalleAsistenciaGestion = document.getElementById(
  "btnVerDetalleAsistenciaGestion",
);

const vistaDetalleAsistenciaGestion = document.getElementById(
  "vistaDetalleAsistenciaGestion",
);

const mensajeDetalleAsistenciaGestion = document.getElementById(
  "mensajeDetalleAsistenciaGestion",
);

let cursosDetalleAsistenciaGestion = [];
let estudiantesDetalleAsistenciaGestion = [];
let registrosDetalleAsistenciaGestion = [];
let filtroEstadoDetalleAsistenciaGestion = "TODOS";

async function obtenerPeriodosAsistenciaGestion(cicloLectivo) {
  const referencia = doc(db, "configuracion_periodos", String(cicloLectivo));

  const documento = await getDoc(referencia);

  if (!documento.exists()) {
    return null;
  }

  return documento.data();
}

function obtenerRangoPeriodoGestion(periodoSeleccionado, periodos) {
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

function mostrarMensajeSituacionAsistencia(texto, tipo = "") {
  if (!mensajeSituacionAsistenciaGestion) return;

  mensajeSituacionAsistenciaGestion.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${texto}
      </span>
    `
    : "";
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
  if (!vistaSituacionAsistenciaGestion) return;

  if (!estudiantes.length) {
    vistaSituacionAsistenciaGestion.innerHTML = `
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

  vistaSituacionAsistenciaGestion.innerHTML = `
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

async function cargarCursosSituacionAsistencia() {
  if (!cursoSituacionAsistenciaGestion) return;

  cursoSituacionAsistenciaGestion.innerHTML = `
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

      if (anioA !== anioB) {
        return anioA - anioB;
      }

      return String(a.division || a.cursoDivision || "").localeCompare(
        String(b.division || b.cursoDivision || ""),
        "es",
        {
          sensitivity: "base",
        },
      );
    });

    cursosSituacionAsistencia = cursos;

    cursoSituacionAsistenciaGestion.innerHTML = `
      <option value="">Seleccionar curso</option>

      ${cursos
        .map((curso) => {
          const nombre =
            curso.nombre ||
            curso.cursoNombre ||
            `${curso.anio || curso.cursoAnio}º ${
              curso.division || curso.cursoDivision
            }`;

          return `
            <option value="${curso.id}">
              ${nombre}
            </option>
          `;
        })
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar cursos de situación de asistencia:", error);

    cursoSituacionAsistenciaGestion.innerHTML = `
      <option value="">No se pudieron cargar cursos</option>
    `;

    mostrarMensajeSituacionAsistencia(
      error.message || "No se pudieron cargar los cursos.",
      "error",
    );
  }
}

async function consultarSituacionAsistencia() {
  const tipo = tipoSituacionAsistenciaGestion?.value || "";
  const cursoId = cursoSituacionAsistenciaGestion?.value || "";

  const periodoSeleccionado =
    periodoSituacionAsistenciaGestion?.value || "ANUAL";

  const cicloLectivo = new Date().getFullYear();

  if (!tipo || !cursoId) {
    mostrarMensajeSituacionAsistencia(
      "Seleccioná el tipo de asistencia y el curso.",
      "error",
    );

    return;
  }

  const cursoSeleccionado = cursosSituacionAsistencia.find(
    (curso) => curso.id === cursoId,
  );

  const cursoNombre =
    cursoSeleccionado?.nombre ||
    cursoSeleccionado?.cursoNombre ||
    `${cursoSeleccionado?.anio || cursoSeleccionado?.cursoAnio || ""}º ${
      cursoSeleccionado?.division || cursoSeleccionado?.cursoDivision || ""
    }`;

  mostrarMensajeSituacionAsistencia("");

  if (vistaSituacionAsistenciaGestion) {
    vistaSituacionAsistenciaGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando situación de asistencia...
      </p>
    `;
  }

  if (btnVerSituacionAsistenciaGestion) {
    btnVerSituacionAsistenciaGestion.disabled = true;

    btnVerSituacionAsistenciaGestion.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const periodos = await obtenerPeriodosAsistenciaGestion(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodoGestion(
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

      if (datos.cursoId !== cursoId) return;

      if (
        datos.fecha < rangoPeriodo.desde ||
        datos.fecha > rangoPeriodo.hasta
      ) {
        return;
      }

      asistencias.push({
        id: documento.id,
        ...datos,
      });
    });

    const estudiantes = agruparSituacionPorEstudiante(asistencias);

    renderizarTablaSituacion(estudiantes, cursoNombre || "Curso", tipo);
  } catch (error) {
    console.error("Error al consultar la situación de asistencia:", error);

    if (vistaSituacionAsistenciaGestion) {
      vistaSituacionAsistenciaGestion.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar la situación de asistencia.
        </p>
      `;
    }

    mostrarMensajeSituacionAsistencia(
      error.message || "No se pudo consultar la situación de asistencia.",
      "error",
    );
  } finally {
    if (btnVerSituacionAsistenciaGestion) {
      btnVerSituacionAsistenciaGestion.disabled = false;

      btnVerSituacionAsistenciaGestion.innerHTML = `
        <i class="fa-solid fa-magnifying-glass-chart"></i>
        Consultar situación
      `;
    }
  }
}

function escaparHtmlDetalleAsistenciaGestion(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatearFechaDetalleAsistenciaGestion(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha || "-";
  }

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function etiquetaEstadoDetalleAsistenciaGestion(estado) {
  const valor = normalizarEstado(estado);

  if (valor === "PRESENTE") return "Presente";
  if (valor === "AUSENTE") return "Ausente";
  if (valor === "TARDE") return "Tarde";

  return valor || "-";
}

function mostrarMensajeDetalleAsistenciaGestion(texto, tipo = "") {
  if (!mensajeDetalleAsistenciaGestion) return;

  mensajeDetalleAsistenciaGestion.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtmlDetalleAsistenciaGestion(texto)}
      </span>
    `
    : "";
}

function obtenerNombreCursoDetalleAsistenciaGestion(curso) {
  return String(
    curso?.nombre ||
      curso?.cursoNombre ||
      `${curso?.anio || curso?.cursoAnio || ""}º ${
        curso?.division || curso?.cursoDivision || ""
      }`,
  ).trim();
}

async function cargarCursosDetalleAsistenciaGestion() {
  if (!cursoDetalleAsistenciaGestion) return;

  cursoDetalleAsistenciaGestion.innerHTML = `
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
        { sensitivity: "base" },
      );
    });

    cursosDetalleAsistenciaGestion = cursos;

    cursoDetalleAsistenciaGestion.innerHTML = `
      <option value="">Seleccionar curso</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${escaparHtmlDetalleAsistenciaGestion(curso.id)}">
              ${escaparHtmlDetalleAsistenciaGestion(
                obtenerNombreCursoDetalleAsistenciaGestion(curso),
              )}
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar cursos para detalle de asistencia:", error);

    cursoDetalleAsistenciaGestion.innerHTML = `
      <option value="">No se pudieron cargar cursos</option>
    `;

    mostrarMensajeDetalleAsistenciaGestion(
      error.message || "No se pudieron cargar los cursos.",
      "error",
    );
  }
}

async function cargarEstudiantesDetalleAsistenciaGestion() {
  const cursoId = String(cursoDetalleAsistenciaGestion?.value || "").trim();

  estudiantesDetalleAsistenciaGestion = [];
  registrosDetalleAsistenciaGestion = [];
  filtroEstadoDetalleAsistenciaGestion = "TODOS";

  if (!estudianteDetalleAsistenciaGestion) return;

  if (!cursoId) {
    estudianteDetalleAsistenciaGestion.disabled = true;
    estudianteDetalleAsistenciaGestion.innerHTML = `
      <option value="">Primero seleccioná un curso</option>
    `;

    if (vistaDetalleAsistenciaGestion) {
      vistaDetalleAsistenciaGestion.innerHTML = `
        <p class="mensaje-gestion">
          Seleccioná un curso, un estudiante y el tipo de asistencia para
          consultar el detalle.
        </p>
      `;
    }

    return;
  }

  estudianteDetalleAsistenciaGestion.disabled = true;
  estudianteDetalleAsistenciaGestion.innerHTML = `
    <option value="">Cargando estudiantes...</option>
  `;

  mostrarMensajeDetalleAsistenciaGestion("");

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

    estudiantesDetalleAsistenciaGestion = estudiantes;

    if (!estudiantes.length) {
      estudianteDetalleAsistenciaGestion.innerHTML = `
        <option value="">No hay estudiantes activos</option>
      `;
      estudianteDetalleAsistenciaGestion.disabled = true;
      return;
    }

    estudianteDetalleAsistenciaGestion.innerHTML = `
      <option value="">Seleccionar estudiante</option>
      ${estudiantes
        .map(
          (estudiante) => `
            <option value="${escaparHtmlDetalleAsistenciaGestion(
              estudiante.id,
            )}">
              ${escaparHtmlDetalleAsistenciaGestion(
                estudiante.nombreCompleto || "Estudiante sin nombre",
              )}
            </option>
          `,
        )
        .join("")}
    `;

    estudianteDetalleAsistenciaGestion.disabled = false;
  } catch (error) {
    console.error("Error al cargar estudiantes para detalle:", error);

    estudianteDetalleAsistenciaGestion.innerHTML = `
      <option value="">No se pudieron cargar estudiantes</option>
    `;
    estudianteDetalleAsistenciaGestion.disabled = true;

    mostrarMensajeDetalleAsistenciaGestion(
      error.message || "No se pudieron cargar los estudiantes del curso.",
      "error",
    );
  }
}

function renderizarDetalleAsistenciaGestion() {
  if (!vistaDetalleAsistenciaGestion) return;

  const estudianteId = String(
    estudianteDetalleAsistenciaGestion?.value || "",
  ).trim();

  const estudiante = estudiantesDetalleAsistenciaGestion.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  const nombreEstudiante =
    String(estudiante?.nombreCompleto || "").trim() || "Estudiante";

  const presentes = registrosDetalleAsistenciaGestion.filter(
    (item) => item.estado === "PRESENTE",
  ).length;

  const ausentes = registrosDetalleAsistenciaGestion.filter(
    (item) => item.estado === "AUSENTE",
  ).length;

  const tardanzas = registrosDetalleAsistenciaGestion.filter(
    (item) => item.estado === "TARDE",
  ).length;

  const registrosFiltrados =
    filtroEstadoDetalleAsistenciaGestion === "TODOS"
      ? registrosDetalleAsistenciaGestion
      : registrosDetalleAsistenciaGestion.filter(
          (item) => item.estado === filtroEstadoDetalleAsistenciaGestion,
        );

  const botonFiltro = (estado, texto) => `
    <button
      type="button"
      class="btn-filtro-detalle-asistencia ${
        filtroEstadoDetalleAsistenciaGestion === estado ? "activo" : ""
      }"
      data-estado-detalle="${estado}"
    >
      ${texto}
    </button>
  `;

  vistaDetalleAsistenciaGestion.innerHTML = `
    <div class="encabezado-detalle-asistencia-gestion">
      <h3>${escaparHtmlDetalleAsistenciaGestion(nombreEstudiante)}</h3>
    </div>

    <div class="filtros-estado-detalle-asistencia" role="group" aria-label="Filtrar detalle por estado">
      ${botonFiltro("TODOS", "Todos")}
      ${botonFiltro("PRESENTE", `Presentes ${presentes}`)}
      ${botonFiltro("AUSENTE", `Ausentes ${ausentes}`)}
      ${botonFiltro("TARDE", `Tardanzas ${tardanzas}`)}
    </div>

    ${
      registrosFiltrados.length
        ? `
          <div class="tabla-responsive tabla-detalle-asistencia-contenedor">
            <table class="tabla-gestion tabla-detalle-asistencia">
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
                        <td>${escaparHtmlDetalleAsistenciaGestion(
                          formatearFechaDetalleAsistenciaGestion(
                            registro.fecha,
                          ),
                        )}</td>
                        <td>${escaparHtmlDetalleAsistenciaGestion(
                          etiquetaEstadoDetalleAsistenciaGestion(
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
          <p class="mensaje-gestion mensaje-detalle-sin-registros">
            No hay registros para el filtro seleccionado.
          </p>
        `
    }
  `;

  vistaDetalleAsistenciaGestion
    .querySelectorAll("[data-estado-detalle]")
    .forEach((boton) => {
      boton.addEventListener("click", () => {
        filtroEstadoDetalleAsistenciaGestion =
          boton.dataset.estadoDetalle || "TODOS";
        renderizarDetalleAsistenciaGestion();
      });
    });
}

async function consultarDetalleAsistenciaGestion() {
  const cursoId = String(cursoDetalleAsistenciaGestion?.value || "").trim();
  const estudianteId = String(
    estudianteDetalleAsistenciaGestion?.value || "",
  ).trim();
  const tipo = String(tipoDetalleAsistenciaGestion?.value || "").trim();
  const periodoSeleccionado = String(
    periodoDetalleAsistenciaGestion?.value || "ANUAL",
  ).trim();

  if (!cursoId || !estudianteId || !tipo) {
    mostrarMensajeDetalleAsistenciaGestion(
      "Seleccioná el curso, el estudiante y el tipo de asistencia.",
      "error",
    );
    return;
  }

  const estudiante = estudiantesDetalleAsistenciaGestion.find(
    (item) => String(item.id || "").trim() === estudianteId,
  );

  if (!estudiante) {
    mostrarMensajeDetalleAsistenciaGestion(
      "No se pudo identificar al estudiante seleccionado.",
      "error",
    );
    return;
  }

  mostrarMensajeDetalleAsistenciaGestion("");
  registrosDetalleAsistenciaGestion = [];
  filtroEstadoDetalleAsistenciaGestion = "TODOS";

  if (vistaDetalleAsistenciaGestion) {
    vistaDetalleAsistenciaGestion.innerHTML = `
      <p class="mensaje-gestion">Consultando detalle de asistencia...</p>
    `;
  }

  if (btnVerDetalleAsistenciaGestion) {
    btnVerDetalleAsistenciaGestion.disabled = true;
    btnVerDetalleAsistenciaGestion.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  try {
    const cicloLectivo = new Date().getFullYear();
    const periodos = await obtenerPeriodosAsistenciaGestion(cicloLectivo);

    if (!periodos) {
      throw new Error(
        `No hay períodos de asistencia configurados para el ciclo lectivo ${cicloLectivo}.`,
      );
    }

    const rangoPeriodo = obtenerRangoPeriodoGestion(
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

    registrosDetalleAsistenciaGestion = registros;
    renderizarDetalleAsistenciaGestion();
  } catch (error) {
    console.error("Error al consultar detalle de asistencia:", error);

    if (vistaDetalleAsistenciaGestion) {
      vistaDetalleAsistenciaGestion.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar el detalle de asistencia.
        </p>
      `;
    }

    mostrarMensajeDetalleAsistenciaGestion(
      error.message || "No se pudo consultar el detalle de asistencia.",
      "error",
    );
  } finally {
    if (btnVerDetalleAsistenciaGestion) {
      btnVerDetalleAsistenciaGestion.disabled = false;
      btnVerDetalleAsistenciaGestion.innerHTML = `
        <i class="fa-solid fa-list-check"></i>
        Consultar detalle
      `;
    }
  }
}

if (cursoDetalleAsistenciaGestion) {
  cursoDetalleAsistenciaGestion.addEventListener(
    "change",
    cargarEstudiantesDetalleAsistenciaGestion,
  );
}

if (btnVerDetalleAsistenciaGestion) {
  btnVerDetalleAsistenciaGestion.addEventListener(
    "click",
    consultarDetalleAsistenciaGestion,
  );
}

if (btnVerSituacionAsistenciaGestion) {
  btnVerSituacionAsistenciaGestion.addEventListener(
    "click",
    consultarSituacionAsistencia,
  );
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  cargarCursosSituacionAsistencia();
  cargarCursosDetalleAsistenciaGestion();
});
