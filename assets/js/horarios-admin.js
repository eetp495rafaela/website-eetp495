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

const horarioAulaCurso = document.getElementById("horarioAulaCurso");
const mensajeHorarioAula = document.getElementById("mensajeHorarioAula");

let cursosHorarios = [];

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

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  await cargarCursosHorarioAula();
});
