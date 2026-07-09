import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

const horarioAulaCicloLectivo = document.getElementById(
  "horarioAulaCicloLectivo",
);
const horarioAulaTurno = document.getElementById("horarioAulaTurno");
const bloquesHorarioAula = document.getElementById("bloquesHorarioAula");
const horarioAulaCurso = document.getElementById("horarioAulaCurso");
const horarioAulaEspacio = document.getElementById("horarioAulaEspacio");
const horarioAulaDocente = document.getElementById("horarioAulaDocente");
const mensajeHorarioAula = document.getElementById("mensajeHorarioAula");

let cursosHorarios = [];
let espaciosHorarios = [];

function mostrarMensajeHorarioAula(texto, tipo = "") {
  if (!mensajeHorarioAula) return;

  mensajeHorarioAula.textContent = texto || "";
  mensajeHorarioAula.classList.remove("mensaje-error", "mensaje-ok");

  if (tipo === "error") {
    mensajeHorarioAula.classList.add("mensaje-error");
  }

  if (tipo === "ok") {
    mensajeHorarioAula.classList.add("mensaje-ok");
  }
}

const BLOQUES_HORARIOS_AULA = {
  MANANA: [
    { tipo: "BLOQUE", numero: 1, inicio: "07:15", fin: "07:55" },
    { tipo: "BLOQUE", numero: 2, inicio: "07:55", fin: "08:35" },
    { tipo: "RECREO", inicio: "08:35", fin: "08:45" },
    { tipo: "BLOQUE", numero: 3, inicio: "08:45", fin: "09:25" },
    { tipo: "BLOQUE", numero: 4, inicio: "09:25", fin: "10:05" },
    { tipo: "RECREO", inicio: "10:05", fin: "10:15" },
    { tipo: "BLOQUE", numero: 5, inicio: "10:15", fin: "10:55" },
    { tipo: "BLOQUE", numero: 6, inicio: "10:55", fin: "11:35" },
    { tipo: "RECREO", inicio: "11:35", fin: "11:40" },
    { tipo: "BLOQUE", numero: 7, inicio: "11:40", fin: "12:20" },
  ],

  TARDE: [
    { tipo: "BLOQUE", numero: 1, inicio: "13:15", fin: "13:55" },
    { tipo: "BLOQUE", numero: 2, inicio: "13:55", fin: "14:35" },
    { tipo: "RECREO", inicio: "14:35", fin: "14:45" },
    { tipo: "BLOQUE", numero: 3, inicio: "14:45", fin: "15:25" },
    { tipo: "BLOQUE", numero: 4, inicio: "15:25", fin: "16:05" },
    { tipo: "RECREO", inicio: "16:05", fin: "16:15" },
    { tipo: "BLOQUE", numero: 5, inicio: "16:15", fin: "16:55" },
    { tipo: "BLOQUE", numero: 6, inicio: "16:55", fin: "17:35" },
    { tipo: "RECREO", inicio: "17:35", fin: "17:40" },
    { tipo: "BLOQUE", numero: 7, inicio: "17:40", fin: "18:20" },
  ],
};

function renderizarBloquesHorarioAula() {
  if (!bloquesHorarioAula || !horarioAulaTurno) return;

  const turno = String(horarioAulaTurno.value || "").trim();
  const bloques = BLOQUES_HORARIOS_AULA[turno] || [];

  if (!turno || !bloques.length) {
    bloquesHorarioAula.innerHTML = `
      <p class="mensaje-formulario">
        Seleccioná primero un turno.
      </p>
    `;
    return;
  }

  bloquesHorarioAula.innerHTML = bloques
    .map((bloque) => {
      if (bloque.tipo === "RECREO") {
        return `
          <div class="recreo-horario-admin">
            Recreo · ${bloque.inicio} a ${bloque.fin}
          </div>
        `;
      }

      return `
        <label class="bloque-horario-opcion">
          <input
            type="checkbox"
            name="bloqueHorarioAula"
            value="${bloque.numero}"
            data-inicio="${bloque.inicio}"
            data-fin="${bloque.fin}"
          />

          <span>
            Bloque ${bloque.numero} · ${bloque.inicio} a ${bloque.fin}
          </span>
        </label>
      `;
    })
    .join("");
}

function obtenerNombreCursoHorario(curso) {
  const nombre = String(curso.nombre || "").trim();

  if (nombre) return nombre;

  const anio = Number(curso.anio || 0);
  const division = String(curso.division || "")
    .trim()
    .toUpperCase();

  if (!anio || !division) return "Curso sin nombre";

  return `${anio}º ${division}`;
}

function ordenarCursosHorarios(cursos) {
  return cursos.sort((a, b) => {
    const anioA = Number(a.anio || 0);
    const anioB = Number(b.anio || 0);

    if (anioA !== anioB) return anioA - anioB;

    return String(a.division || "").localeCompare(
      String(b.division || ""),
      "es",
    );
  });
}

function limpiarEspaciosHorarioAula(mensaje = "Seleccioná primero un curso") {
  if (!horarioAulaEspacio) return;

  horarioAulaEspacio.innerHTML = `
    <option value="">${mensaje}</option>
  `;

  if (horarioAulaDocente) {
    horarioAulaDocente.value = "";
  }

  espaciosHorarios = [];
}

function ordenarEspaciosHorarios(espacios) {
  return espacios.sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"),
  );
}

async function cargarEspaciosHorarioAulaPorCurso() {
  if (!horarioAulaCurso || !horarioAulaEspacio) return;

  const opcionSeleccionada =
    horarioAulaCurso.options[horarioAulaCurso.selectedIndex];

  const anioCurso = Number(opcionSeleccionada?.dataset?.anio || 0);

  limpiarEspaciosHorarioAula("Cargando materias...");

  if (!anioCurso) {
    limpiarEspaciosHorarioAula("Seleccioná primero un curso");
    return;
  }

  try {
    const consulta = await getDocs(collection(db, "espacios_curriculares"));

    espaciosHorarios = [];

    consulta.forEach((documento) => {
      const datos = documento.data();

      const estado = String(datos.estado || "")
        .trim()
        .toUpperCase();

      const anio = Number(datos.anio || 0);

      if (estado && estado !== "ACTIVO") return;
      if (anio !== anioCurso) return;

      espaciosHorarios.push({
        id: documento.id,
        anio,
        nombre: datos.nombre,
        tipo: datos.tipo,
        estado: datos.estado,
      });
    });

    ordenarEspaciosHorarios(espaciosHorarios);

    if (!espaciosHorarios.length) {
      limpiarEspaciosHorarioAula("No hay materias activas para este curso");
      return;
    }

    horarioAulaEspacio.innerHTML = `
      <option value="">Seleccionar materia</option>
      ${espaciosHorarios
        .map(
          (espacio) => `
            <option
              value="${espacio.id}"
              data-nombre="${espacio.nombre || ""}"
              data-tipo="${espacio.tipo || ""}"
            >
              ${espacio.nombre || "Espacio sin nombre"}
            </option>
          `,
        )
        .join("")}
    `;

    mostrarMensajeHorarioAula(
      `Materias cargadas para ${anioCurso}º año: ${espaciosHorarios.length}.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar materias para horarios:", error);

    limpiarEspaciosHorarioAula("Error al cargar materias");

    mostrarMensajeHorarioAula(
      "No se pudieron cargar las materias del curso seleccionado.",
      "error",
    );
  }
}

async function cargarDocenteAsignadoHorarioAula() {
  if (!horarioAulaCurso || !horarioAulaEspacio || !horarioAulaDocente) return;

  const cursoId = String(horarioAulaCurso.value || "").trim();
  const espacioId = String(horarioAulaEspacio.value || "").trim();
  const cicloLectivo = Number(horarioAulaCicloLectivo?.value || 0);

  horarioAulaDocente.value = "";

  if (!cursoId || !espacioId || !cicloLectivo) {
    return;
  }

  horarioAulaDocente.value = "Buscando docente asignado...";

  try {
    const consulta = await getDocs(collection(db, "asignaciones_docentes"));

    let asignacionEncontrada = null;

    consulta.forEach((documento) => {
      if (asignacionEncontrada) return;

      const datos = documento.data();

      const estado = String(datos.estado || "")
        .trim()
        .toUpperCase();

      const mismoCurso = String(datos.cursoId || "").trim() === cursoId;

      const mismoEspacio = String(datos.espacioId || "").trim() === espacioId;

      const mismoCiclo = Number(datos.cicloLectivo || 0) === cicloLectivo;

      const estaActiva = !estado || estado === "ACTIVA" || estado === "ACTIVO";

      if (mismoCurso && mismoEspacio && mismoCiclo && estaActiva) {
        asignacionEncontrada = {
          docenteNombre: datos.docenteNombre || "",
          docenteCorreo: datos.docenteCorreo || "",
        };
      }
    });

    if (!asignacionEncontrada) {
      horarioAulaDocente.value = "Sin docente asignado";
      mostrarMensajeHorarioAula(
        "No se encontró una asignación docente activa para ese curso y materia.",
        "error",
      );
      return;
    }

    horarioAulaDocente.value =
      asignacionEncontrada.docenteNombre ||
      asignacionEncontrada.docenteCorreo ||
      "Docente asignado";

    mostrarMensajeHorarioAula("Docente asignado cargado correctamente.", "ok");
  } catch (error) {
    console.error("Error al buscar docente asignado:", error);

    horarioAulaDocente.value = "";

    mostrarMensajeHorarioAula(
      "No se pudo buscar el docente asignado.",
      "error",
    );
  }
}

async function cargarCursosHorarioAula() {
  if (!horarioAulaCurso) return;

  horarioAulaCurso.innerHTML = `
    <option value="">Cargando cursos...</option>
  `;

  try {
    const consulta = await getDocs(collection(db, "cursos"));

    cursosHorarios = [];

    consulta.forEach((documento) => {
      const datos = documento.data();

      const estado = String(datos.estado || "")
        .trim()
        .toUpperCase();

      if (estado && estado !== "ACTIVO") return;

      cursosHorarios.push({
        id: documento.id,
        anio: datos.anio,
        division: datos.division,
        nombre: datos.nombre,
        estado: datos.estado,
      });
    });

    ordenarCursosHorarios(cursosHorarios);

    if (!cursosHorarios.length) {
      horarioAulaCurso.innerHTML = `
        <option value="">No hay cursos activos</option>
      `;

      mostrarMensajeHorarioAula(
        "No se encontraron cursos activos para cargar horarios.",
        "error",
      );

      return;
    }

    horarioAulaCurso.innerHTML = `
      <option value="">Seleccionar curso</option>
      ${cursosHorarios
        .map((curso) => {
          const nombreCurso = obtenerNombreCursoHorario(curso);

          return `
            <option
              value="${curso.id}"
              data-anio="${curso.anio || ""}"
              data-division="${curso.division || ""}"
              data-nombre="${nombreCurso}"
            >
              ${nombreCurso}
            </option>
          `;
        })
        .join("")}
    `;

    mostrarMensajeHorarioAula(
      `Cursos cargados correctamente: ${cursosHorarios.length}.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar cursos para horarios:", error);

    horarioAulaCurso.innerHTML = `
      <option value="">Error al cargar cursos</option>
    `;

    mostrarMensajeHorarioAula(
      "No se pudieron cargar los cursos para Horario de Aula.",
      "error",
    );
  }
}

if (horarioAulaCurso) {
  horarioAulaCurso.addEventListener("change", async () => {
    await cargarEspaciosHorarioAulaPorCurso();
    await cargarDocenteAsignadoHorarioAula();
  });
}

if (horarioAulaEspacio) {
  horarioAulaEspacio.addEventListener(
    "change",
    cargarDocenteAsignadoHorarioAula,
  );
}

if (horarioAulaCicloLectivo) {
  horarioAulaCicloLectivo.addEventListener(
    "change",
    cargarDocenteAsignadoHorarioAula,
  );
}

if (horarioAulaTurno) {
  horarioAulaTurno.addEventListener("change", renderizarBloquesHorarioAula);
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  await cargarCursosHorarioAula();
});
