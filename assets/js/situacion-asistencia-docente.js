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

let cursosSituacionAsistenciaDocente = [];

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

async function obtenerAsignacionesDocente(correoDocente) {
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

      asignacionesPorId.set(documento.id, {
        id: documento.id,
        ...documento.data(),
      });
    });
  }

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
  if (!cursoSituacionAsistenciaDocente) return;

  if (!cursos.length) {
    cursoSituacionAsistenciaDocente.innerHTML = `
      <option value="">No tenés cursos asignados</option>
    `;

    cursoSituacionAsistenciaDocente.disabled = true;

    mostrarMensaje(
      "No se encontraron cursos activos de Taller o Educación Física para tu usuario.",
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

    const asignaciones = await obtenerAsignacionesDocente(correoDocente);

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

    const consultaAsistencias = query(
      collection(db, "asistencias_clases"),
      where("estado", "==", "ACTIVA"),
      where("tipoHorario", "==", tipo),
      where("docenteCorreo", "==", correoDocente),
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
