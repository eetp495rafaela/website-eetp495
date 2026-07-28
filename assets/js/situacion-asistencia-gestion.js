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
    minimumFractionDigits: 0,
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

if (btnVerSituacionAsistenciaGestion) {
  btnVerSituacionAsistenciaGestion.addEventListener(
    "click",
    consultarSituacionAsistencia,
  );
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  cargarCursosSituacionAsistencia();
});
