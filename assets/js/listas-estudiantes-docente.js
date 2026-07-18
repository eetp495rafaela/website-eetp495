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

const btnVerListasEstudiantesDocente = document.getElementById(
  "btnVerListasEstudiantesDocente",
);

const vistaListasEstudiantesDocente = document.getElementById(
  "vistaListasEstudiantesDocente",
);

let usuarioListasDocenteActual = null;
let listasEstudiantesDocenteActuales = new Map();

function normalizarTextoListas(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase();
}

function normalizarCorreoListas(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function escaparHtmlListas(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerNombreAlumno(alumno) {
  return (
    String(alumno.nombreCompleto || "").trim() ||
    String(alumno.apellidoNombre || "").trim() ||
    String(alumno.nombre || "").trim() ||
    String(alumno.email || "").trim() ||
    "Estudiante sin nombre"
  );
}

function obtenerClaveCurso(curso) {
  const cursoId = String(curso.cursoId || "").trim();

  if (cursoId) {
    return `ID_${cursoId}`;
  }

  const anio = Number(curso.cursoAnio || 0);
  const division = normalizarTextoListas(curso.cursoDivision);

  return `${anio}_${division}`;
}

function obtenerClaveCursoAlumno(alumno) {
  const cursoId = String(alumno.cursoId || "").trim();

  if (cursoId) {
    return `ID_${cursoId}`;
  }

  const anio = Number(alumno.cursoAnio || 0);
  const division = normalizarTextoListas(alumno.cursoDivision);

  return `${anio}_${division}`;
}

function obtenerNombreCurso(curso) {
  return (
    String(curso.cursoNombre || "").trim() ||
    String(curso.curso || "").trim() ||
    `${curso.cursoAnio || ""}º ${curso.cursoDivision || ""}`.trim()
  );
}

function mostrarMensajeListasEstudiantes(texto, tipo = "") {
  if (!vistaListasEstudiantesDocente) return;

  vistaListasEstudiantesDocente.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

async function obtenerCursosAsignadosDocente(correoDocente) {
  const cursosPorClave = new Map();

  const consultasAsignaciones = [
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

  for (const consultaAsignaciones of consultasAsignaciones) {
    const resultado = await getDocs(consultaAsignaciones);

    resultado.forEach((documento) => {
      const datos = documento.data();

      const curso = {
        cursoId: String(datos.cursoId || "").trim(),
        cursoAnio: Number(datos.cursoAnio || 0),
        cursoDivision: normalizarTextoListas(datos.cursoDivision),
        cursoNombre: String(datos.cursoNombre || "").trim(),
        curso: String(datos.curso || "").trim(),
      };

      const claveCurso = obtenerClaveCurso(curso);

      if (!claveCurso || claveCurso === "0_") return;

      if (!cursosPorClave.has(claveCurso)) {
        cursosPorClave.set(claveCurso, curso);
      }
    });
  }

  return Array.from(cursosPorClave.values()).sort((a, b) => {
    if (Number(a.cursoAnio || 0) !== Number(b.cursoAnio || 0)) {
      return Number(a.cursoAnio || 0) - Number(b.cursoAnio || 0);
    }

    return String(a.cursoDivision || "").localeCompare(
      String(b.cursoDivision || ""),
      "es",
    );
  });
}

async function obtenerAlumnosCursando() {
  const alumnosPorId = new Map();

  const consultasAlumnos = [
    query(
      collection(db, "usuarios"),
      where("rol", "==", "ALUMNO"),
      where("tipoVinculo", "==", "CURSANDO"),
    ),
    query(
      collection(db, "usuarios"),
      where("rol", "==", "ALUMNO"),
      where("situacionRevista", "==", "CURSANDO"),
    ),
  ];

  for (const consultaAlumnos of consultasAlumnos) {
    const resultado = await getDocs(consultaAlumnos);

    resultado.forEach((documento) => {
      if (alumnosPorId.has(documento.id)) return;

      alumnosPorId.set(documento.id, {
        id: documento.id,
        ...documento.data(),
      });
    });
  }

  return Array.from(alumnosPorId.values());
}

function renderizarListasEstudiantes(cursosAsignados, alumnos) {
  if (!vistaListasEstudiantesDocente) return;

  if (!cursosAsignados.length) {
    mostrarMensajeListasEstudiantes(
      "No tenés cursos asignados para consultar listas de estudiantes.",
      "error",
    );
    return;
  }

  const alumnosPorCurso = new Map();

  cursosAsignados.forEach((curso) => {
    const claveCurso = obtenerClaveCurso(curso);

    alumnosPorCurso.set(claveCurso, {
      curso,
      alumnos: [],
    });
  });

  alumnos.forEach((alumno) => {
    const claveCursoAlumno = obtenerClaveCursoAlumno(alumno);

    if (!alumnosPorCurso.has(claveCursoAlumno)) return;

    alumnosPorCurso.get(claveCursoAlumno).alumnos.push(alumno);
  });

  listasEstudiantesDocenteActuales = alumnosPorCurso;

  const columnas = Array.from(alumnosPorCurso.entries());

  const htmlColumnas = columnas
    .map(([claveCurso, { curso, alumnos: alumnosCurso }]) => {
      const alumnosOrdenados = alumnosCurso.sort((a, b) =>
        obtenerNombreAlumno(a).localeCompare(obtenerNombreAlumno(b), "es", {
          sensitivity: "base",
        }),
      );

      return `
        <article class="tarjeta-lista-estudiantes-docente">
          <div class="encabezado-lista-estudiantes-docente">
            <div>
              <h3>${escaparHtmlListas(obtenerNombreCurso(curso))}</h3>
              <span>${alumnosOrdenados.length} estudiante${alumnosOrdenados.length === 1 ? "" : "s"}</span>
            </div>

            <button
              class="btn-copiar-lista-estudiantes"
              type="button"
              data-clave-curso="${escaparHtmlListas(claveCurso)}"
              title="Copiar listado"
              aria-label="Copiar listado"
            >
              <i class="fa-solid fa-copy"></i>
              Copiar
            </button>
          </div>

          ${
            alumnosOrdenados.length
              ? `
                <ol>
                  ${alumnosOrdenados
                    .map(
                      (alumno) => `
                        <li>${escaparHtmlListas(obtenerNombreAlumno(alumno))}</li>
                      `,
                    )
                    .join("")}
                </ol>
              `
              : `
                <p class="mensaje-formulario">
                  No hay estudiantes cursando registrados para este curso.
                </p>
              `
          }
        </article>
      `;
    })
    .join("");

  vistaListasEstudiantesDocente.innerHTML = `
    <div class="grilla-listas-estudiantes-docente">
      ${htmlColumnas}
    </div>
  `;
}

async function copiarListaEstudiantesDocente(claveCurso) {
  const datosCurso = listasEstudiantesDocenteActuales.get(claveCurso);

  if (!datosCurso) {
    throw new Error("No se pudo encontrar el listado seleccionado.");
  }

  const nombreCurso = obtenerNombreCurso(datosCurso.curso);

  const alumnosOrdenados = [...datosCurso.alumnos].sort((a, b) =>
    obtenerNombreAlumno(a).localeCompare(obtenerNombreAlumno(b), "es", {
      sensitivity: "base",
    }),
  );

  const textoListado = [
    nombreCurso,
    "",
    ...alumnosOrdenados.map((alumno) => obtenerNombreAlumno(alumno)),
  ].join("\n");

  await navigator.clipboard.writeText(textoListado);

  return nombreCurso;
}

async function cargarListasEstudiantesDocente() {
  if (!usuarioListasDocenteActual) {
    mostrarMensajeListasEstudiantes(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );
    return;
  }

  mostrarMensajeListasEstudiantes("Cargando listas de estudiantes...");

  try {
    const correoDocente = normalizarCorreoListas(
      usuarioListasDocenteActual.email,
    );

    const cursosAsignados = await obtenerCursosAsignadosDocente(correoDocente);
    const alumnosCursando = await obtenerAlumnosCursando();

    renderizarListasEstudiantes(cursosAsignados, alumnosCursando);
  } catch (error) {
    console.error("Error al cargar listas de estudiantes:", error);

    mostrarMensajeListasEstudiantes(
      error.message || "No se pudieron cargar las listas de estudiantes.",
      "error",
    );
  }
}

if (vistaListasEstudiantesDocente) {
  vistaListasEstudiantesDocente.addEventListener("click", async (event) => {
    const botonCopiar = event.target.closest(".btn-copiar-lista-estudiantes");

    if (!botonCopiar) return;

    const claveCurso = String(botonCopiar.dataset.claveCurso || "").trim();

    if (!claveCurso) {
      mostrarMensajeListasEstudiantes(
        "No se pudo identificar el curso seleccionado.",
        "error",
      );
      return;
    }

    botonCopiar.disabled = true;

    const textoOriginal = botonCopiar.innerHTML;

    botonCopiar.innerHTML = `
      <i class="fa-solid fa-check"></i>
      Copiado
    `;

    try {
      await copiarListaEstudiantesDocente(claveCurso);
    } catch (error) {
      console.error("Error al copiar listado:", error);

      botonCopiar.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        Error
      `;
    } finally {
      setTimeout(() => {
        botonCopiar.disabled = false;
        botonCopiar.innerHTML = textoOriginal;
      }, 1200);
    }
  });
}

if (btnVerListasEstudiantesDocente) {
  btnVerListasEstudiantesDocente.addEventListener("click", async () => {
    btnVerListasEstudiantesDocente.disabled = true;

    const textoOriginal = btnVerListasEstudiantesDocente.innerHTML;

    btnVerListasEstudiantesDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarListasEstudiantesDocente();
    } finally {
      btnVerListasEstudiantesDocente.disabled = false;
      btnVerListasEstudiantesDocente.innerHTML = textoOriginal;
    }
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioListasDocenteActual = usuario;

  mostrarMensajeListasEstudiantes(
    "Todavía no se consultaron las listas de estudiantes. Presioná “Ver listas de estudiantes” para cargarlas.",
  );
});
