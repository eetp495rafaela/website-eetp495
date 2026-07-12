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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
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

const formHorarioAula = document.getElementById("formHorarioAula");
const horarioAulaCicloLectivo = document.getElementById(
  "horarioAulaCicloLectivo",
);
const horarioAulaTurno = document.getElementById("horarioAulaTurno");
const bloquesHorarioAula = document.getElementById("bloquesHorarioAula");
const horarioAulaCurso = document.getElementById("horarioAulaCurso");
const horarioAulaDia = document.getElementById("horarioAulaDia");
const horarioAulaEspacio = document.getElementById("horarioAulaEspacio");
const horarioAulaDocente = document.getElementById("horarioAulaDocente");
const horarioAulaUbicacion = document.getElementById("horarioAulaUbicacion");
const btnRegistrarHorarioAula = document.getElementById(
  "btnRegistrarHorarioAula",
);
const btnCancelarEdicionHorarioAula = document.getElementById(
  "btnCancelarEdicionHorarioAula",
);
const btnActualizarHorarioAula = document.getElementById(
  "btnActualizarHorarioAula",
);
const vistaHorarioAula = document.getElementById("vistaHorarioAula");
const mensajeHorarioAula = document.getElementById("mensajeHorarioAula");
const formHorarioTaller = document.getElementById("formHorarioTaller");
const horarioTallerCicloLectivo = document.getElementById(
  "horarioTallerCicloLectivo",
);
const horarioTallerTurno = document.getElementById("horarioTallerTurno");
const horarioTallerCurso = document.getElementById("horarioTallerCurso");
const horarioTallerGrupo = document.getElementById("horarioTallerGrupo");
const horarioTallerDia = document.getElementById("horarioTallerDia");
const horarioTallerEspacio = document.getElementById("horarioTallerEspacio");
const horarioTallerDocente = document.getElementById("horarioTallerDocente");
const horarioTallerHorario = document.getElementById("horarioTallerHorario");
const horarioTallerUbicacion = document.getElementById(
  "horarioTallerUbicacion",
);
const btnRegistrarHorarioTaller = document.getElementById(
  "btnRegistrarHorarioTaller",
);
const btnActualizarHorarioTaller = document.getElementById(
  "btnActualizarHorarioTaller",
);
const vistaHorarioTaller = document.getElementById("vistaHorarioTaller");
const mensajeHorarioTaller = document.getElementById("mensajeHorarioTaller");
const formHorarioEf = document.getElementById("formHorarioEducacionFisica");

const horarioEfCicloLectivo = document.getElementById("horarioEfCicloLectivo");
const horarioEfTurno = document.getElementById("horarioEfTurno");
const horarioEfCurso = document.getElementById("horarioEfCurso");
const horarioEfDia = document.getElementById("horarioEfDia");
const horarioEfEspacio = document.getElementById("horarioEfEspacio");
const horarioEfDocente = document.getElementById("horarioEfDocente");
const horarioEfHoraInicio = document.getElementById("horarioEfHoraInicio");
const horarioEfHoraFin = document.getElementById("horarioEfHoraFin");
const horarioEfUbicacion = document.getElementById("horarioEfUbicacion");

const btnRegistrarHorarioEf = document.getElementById("btnRegistrarHorarioEf");

const btnCancelarEdicionHorarioEf = document.getElementById(
  "btnCancelarEdicionHorarioEf",
);

const btnActualizarHorarioEf = document.getElementById(
  "btnActualizarHorarioEf",
);

const vistaHorarioEf = document.getElementById("vistaHorarioEf");
const mensajeHorarioEf = document.getElementById("mensajeHorarioEf");

let cursosHorarios = [];
let espaciosHorarios = [];
let docenteAsignadoHorarioAula = null;
let idHorarioAulaEditando = null;
let horariosAulaCargados = [];
let materiasHorarioTaller = [];
let docenteAsignadoHorarioTaller = null;
let idHorarioTallerEditando = null;
let horariosTallerCargados = [];
let docenteAsignadoHorarioEf = null;
let idHorarioEfEditando = null;
let horariosEfCargados = [];

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

function mostrarMensajeHorarioTaller(texto, tipo = "") {
  if (!mensajeHorarioTaller) return;

  mensajeHorarioTaller.textContent = texto || "";
  mensajeHorarioTaller.classList.remove("mensaje-error", "mensaje-ok");

  if (tipo === "error") {
    mensajeHorarioTaller.classList.add("mensaje-error");
  }

  if (tipo === "ok") {
    mensajeHorarioTaller.classList.add("mensaje-ok");
  }
}

function mostrarMensajeHorarioEf(texto, tipo = "") {
  if (!mensajeHorarioEf) return;

  mensajeHorarioEf.textContent = texto || "";
  mensajeHorarioEf.classList.remove("mensaje-error", "mensaje-ok");

  if (tipo === "error") {
    mensajeHorarioEf.classList.add("mensaje-error");
  }

  if (tipo === "ok") {
    mensajeHorarioEf.classList.add("mensaje-ok");
  }
}

function obtenerHorarioFijoTaller(turno) {
  const valor = String(turno || "").trim();

  if (valor === "MANANA") {
    return {
      inicio: "07:15",
      fin: "10:55",
      texto: "07:15 a 10:55",
    };
  }

  if (valor === "TARDE") {
    return {
      inicio: "13:15",
      fin: "16:55",
      texto: "13:15 a 16:55",
    };
  }

  return {
    inicio: "",
    fin: "",
    texto: "",
  };
}

function actualizarHorarioFijoTaller() {
  if (!horarioTallerTurno || !horarioTallerHorario) return;

  const horario = obtenerHorarioFijoTaller(horarioTallerTurno.value);

  horarioTallerHorario.value = horario.texto;
}

function calcularHoraFinEducacionFisica(horaInicio) {
  const valor = String(horaInicio || "").trim();

  if (!valor) return "";

  const partes = valor.split(":");

  if (partes.length !== 2) return "";

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return "";

  const fecha = new Date();
  fecha.setHours(horas, minutos, 0, 0);
  fecha.setMinutes(fecha.getMinutes() + 60);

  const horaFin = String(fecha.getHours()).padStart(2, "0");
  const minutoFin = String(fecha.getMinutes()).padStart(2, "0");

  return `${horaFin}:${minutoFin}`;
}

function actualizarHoraFinEducacionFisica() {
  if (!horarioEfHoraInicio || !horarioEfHoraFin) return;

  horarioEfHoraFin.value = calcularHoraFinEducacionFisica(
    horarioEfHoraInicio.value,
  );
}

function cargarOpcionesHoraInicioEducacionFisica() {
  if (!horarioEfHoraInicio) return;

  const horas = [];

  for (let hora = 7; hora <= 21; hora++) {
    for (const minuto of [0, 15, 30, 45]) {
      const horaTexto = String(hora).padStart(2, "0");
      const minutoTexto = String(minuto).padStart(2, "0");

      horas.push(`${horaTexto}:${minutoTexto}`);
    }
  }

  horarioEfHoraInicio.innerHTML = `
    <option value="">Seleccionar hora</option>
    ${horas
      .map(
        (hora) => `
          <option value="${hora}">${hora}</option>
        `,
      )
      .join("")}
  `;
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

function normalizarTextoHorario(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function esEspacioEducacionFisica(datos) {
  const textosPosibles = [
    datos.espacioCurricular,
    datos.espacioNombre,
    datos.nombreEspacio,
    datos.nombre,
    datos.materia,
    datos.descripcion,
    datos.tipo,
  ];

  return textosPosibles.some((texto) =>
    normalizarTextoHorario(texto).includes("educacion fisica"),
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
  docenteAsignadoHorarioAula = null;

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
      docenteAsignadoHorarioAula = null;

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

    docenteAsignadoHorarioAula = asignacionEncontrada;

    mostrarMensajeHorarioAula("Docente asignado cargado correctamente.", "ok");
  } catch (error) {
    console.error("Error al buscar docente asignado:", error);

    horarioAulaDocente.value = "";
    docenteAsignadoHorarioAula = null;

    mostrarMensajeHorarioAula(
      "No se pudo buscar el docente asignado.",
      "error",
    );
  }
}

async function cargarDocenteAsignadoHorarioTaller() {
  if (!horarioTallerCurso || !horarioTallerEspacio || !horarioTallerDocente) {
    return;
  }

  const cursoId = String(horarioTallerCurso.value || "").trim();
  const espacioId = String(horarioTallerEspacio.value || "").trim();
  const cicloLectivo = Number(horarioTallerCicloLectivo?.value || 0);

  horarioTallerDocente.value = "";
  docenteAsignadoHorarioTaller = null;

  if (!cursoId || !espacioId || !cicloLectivo) {
    return;
  }

  horarioTallerDocente.value = "Buscando docente asignado...";

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
      horarioTallerDocente.value = "Sin docente asignado";
      docenteAsignadoHorarioTaller = null;

      mostrarMensajeHorarioTaller(
        "No se encontró una asignación docente activa para ese curso y taller.",
        "error",
      );

      return;
    }

    horarioTallerDocente.value =
      asignacionEncontrada.docenteNombre ||
      asignacionEncontrada.docenteCorreo ||
      "Docente asignado";

    docenteAsignadoHorarioTaller = asignacionEncontrada;

    mostrarMensajeHorarioTaller(
      "Docente asignado cargado correctamente.",
      "ok",
    );
  } catch (error) {
    console.error("Error al buscar docente asignado para taller:", error);

    horarioTallerDocente.value = "";
    docenteAsignadoHorarioTaller = null;

    mostrarMensajeHorarioTaller(
      "No se pudo buscar el docente asignado para taller.",
      "error",
    );
  }
}

async function cargarDocenteAsignadoHorarioEf() {
  if (!horarioEfCurso || !horarioEfDocente) return;

  const cursoId = String(horarioEfCurso.value || "").trim();
  const cicloLectivo = Number(horarioEfCicloLectivo?.value || 0);

  horarioEfDocente.value = "";
  docenteAsignadoHorarioEf = null;

  if (!cursoId || !cicloLectivo) {
    return;
  }

  horarioEfDocente.value = "Buscando docente asignado...";

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

      const mismoCiclo = Number(datos.cicloLectivo || 0) === cicloLectivo;

      const estaActiva = !estado || estado === "ACTIVA" || estado === "ACTIVO";

      const esEducacionFisica = esEspacioEducacionFisica(datos);

      if (mismoCurso && mismoCiclo && estaActiva && esEducacionFisica) {
        asignacionEncontrada = {
          espacioId: datos.espacioId || "",
          espacioCurricular:
            datos.espacioCurricular ||
            datos.espacioNombre ||
            datos.nombreEspacio ||
            "Educación Física",
          docenteNombre: datos.docenteNombre || "",
          docenteCorreo: datos.docenteCorreo || "",
        };
      }
    });

    if (!asignacionEncontrada) {
      horarioEfDocente.value = "Sin docente asignado";
      docenteAsignadoHorarioEf = null;

      mostrarMensajeHorarioEf(
        "No se encontró una asignación docente activa de Educación Física para ese curso.",
        "error",
      );

      return;
    }

    horarioEfDocente.value =
      asignacionEncontrada.docenteNombre ||
      asignacionEncontrada.docenteCorreo ||
      "Docente asignado";

    docenteAsignadoHorarioEf = asignacionEncontrada;

    mostrarMensajeHorarioEf(
      "Docente de Educación Física cargado correctamente.",
      "ok",
    );
  } catch (error) {
    console.error(
      "Error al buscar docente asignado para Educación Física:",
      error,
    );

    horarioEfDocente.value = "";
    docenteAsignadoHorarioEf = null;

    mostrarMensajeHorarioEf(
      "No se pudo buscar el docente asignado de Educación Física.",
      "error",
    );
  }
}

function cargarCursosHorarioTallerDesdeCache() {
  if (!horarioTallerCurso) return;

  if (!cursosHorarios.length) {
    horarioTallerCurso.innerHTML = `
      <option value="">No hay cursos activos</option>
    `;
    return;
  }

  horarioTallerCurso.innerHTML = `
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
}

function cargarCursosHorarioEfDesdeCache() {
  if (!horarioEfCurso) return;

  if (!cursosHorarios.length) {
    horarioEfCurso.innerHTML = `
      <option value="">No hay cursos activos</option>
    `;
    return;
  }

  horarioEfCurso.innerHTML = `
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
}

function limpiarMateriasHorarioTaller() {
  materiasHorarioTaller = [];
  docenteAsignadoHorarioTaller = null;

  if (horarioTallerEspacio) {
    horarioTallerEspacio.innerHTML = `
      <option value="">Seleccioná primero un curso</option>
    `;
  }

  if (horarioTallerDocente) {
    horarioTallerDocente.value = "";
  }
}

async function cargarMateriasHorarioTaller() {
  if (!horarioTallerCurso || !horarioTallerEspacio) return;

  const cursoId = horarioTallerCurso.value;
  const opcionCurso =
    horarioTallerCurso.options[horarioTallerCurso.selectedIndex];

  const cursoAnio = Number(opcionCurso?.dataset?.anio || 0);

  docenteAsignadoHorarioTaller = null;

  if (horarioTallerDocente) {
    horarioTallerDocente.value = "";
  }

  if (!cursoId || !cursoAnio) {
    limpiarMateriasHorarioTaller();
    return;
  }

  horarioTallerEspacio.innerHTML = `
    <option value="">Cargando espacios...</option>
  `;

  try {
    const resultado = await getDocs(collection(db, "espacios_curriculares"));

    materiasHorarioTaller = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      const estado = String(datos.estado || "ACTIVO")
        .trim()
        .toUpperCase();

      const anioEspacio = Number(
        datos.anio || datos.cursoAnio || datos.CURSO_ANIO || 0,
      );

      if (estado !== "ACTIVO") return;
      if (anioEspacio !== cursoAnio) return;

      const nombreEspacio =
        datos.nombre ||
        datos.espacioCurricular ||
        datos.ESPACIO_CURRICULAR ||
        datos.descripcion ||
        documento.id;

      materiasHorarioTaller.push({
        id: documento.id,
        nombre: nombreEspacio,
        ...datos,
      });
    });

    materiasHorarioTaller.sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"),
    );

    if (!materiasHorarioTaller.length) {
      horarioTallerEspacio.innerHTML = `
        <option value="">No hay espacios cargados para este curso</option>
      `;
      return;
    }

    horarioTallerEspacio.innerHTML = `
      <option value="">Seleccionar taller / espacio</option>
      ${materiasHorarioTaller
        .map(
          (espacio) => `
            <option
              value="${espacio.id}"
              data-nombre="${espacio.nombre}"
            >
              ${espacio.nombre}
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar espacios de taller:", error);

    horarioTallerEspacio.innerHTML = `
      <option value="">Error al cargar espacios</option>
    `;

    mostrarMensajeHorarioTaller(
      "No se pudieron cargar los espacios curriculares.",
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
    cargarCursosHorarioTallerDesdeCache();
    cargarCursosHorarioEfDesdeCache();

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

if (horarioEfHoraInicio) {
  cargarOpcionesHoraInicioEducacionFisica();

  horarioEfHoraInicio.addEventListener(
    "change",
    actualizarHoraFinEducacionFisica,
  );
}

function obtenerBloquesSeleccionadosHorarioAula() {
  return Array.from(
    document.querySelectorAll('input[name="bloqueHorarioAula"]:checked'),
  ).map((checkbox) => ({
    numero: Number(checkbox.value || 0),
    inicio: checkbox.dataset.inicio || "",
    fin: checkbox.dataset.fin || "",
  }));
}

async function existeBloqueHorarioAula(datosBloque, idIgnorar = "") {
  const consulta = await getDocs(collection(db, "horarios"));
  let existe = false;

  consulta.forEach((documento) => {
    if (existe) return;

    if (idIgnorar && documento.id === idIgnorar) {
      return;
    }

    const datos = documento.data();

    const mismoTipo = String(datos.tipoHorario || "") === "AULA";

    const mismoCiclo =
      Number(datos.cicloLectivo || 0) === Number(datosBloque.cicloLectivo);

    const mismoCurso =
      String(datos.cursoId || "") === String(datosBloque.cursoId);

    const mismoDia = String(datos.dia || "") === String(datosBloque.dia);

    const mismoBloque =
      Number(datos.bloqueNumero || 0) === Number(datosBloque.bloqueNumero);

    const activo = String(datos.estado || "ACTIVO").toUpperCase() === "ACTIVO";

    if (
      mismoTipo &&
      mismoCiclo &&
      mismoCurso &&
      mismoDia &&
      mismoBloque &&
      activo
    ) {
      existe = true;
    }
  });

  return existe;
}

async function existeBloqueHorarioTaller(datosBloque, idIgnorar = "") {
  const consulta = await getDocs(collection(db, "horarios"));
  let existe = false;

  consulta.forEach((documento) => {
    if (existe) return;

    if (idIgnorar && documento.id === idIgnorar) {
      return;
    }

    const datos = documento.data();

    const mismoTipo = String(datos.tipoHorario || "") === "TALLER";

    const mismoCiclo =
      Number(datos.cicloLectivo || 0) === Number(datosBloque.cicloLectivo);

    const mismoCurso =
      String(datos.cursoId || "") === String(datosBloque.cursoId);

    const mismoGrupo =
      String(datos.grupoTaller || "") === String(datosBloque.grupoTaller);

    const mismoDia = String(datos.dia || "") === String(datosBloque.dia);

    const activo = String(datos.estado || "ACTIVO").toUpperCase() === "ACTIVO";

    if (
      mismoTipo &&
      mismoCiclo &&
      mismoCurso &&
      mismoGrupo &&
      mismoDia &&
      activo
    ) {
      existe = true;
    }
  });

  return existe;
}

async function existeBloqueHorarioEf(datosBloque, idIgnorar = "") {
  const consulta = await getDocs(collection(db, "horarios"));
  let existe = false;

  consulta.forEach((documento) => {
    if (existe) return;

    if (idIgnorar && documento.id === idIgnorar) {
      return;
    }

    const datos = documento.data();

    const mismoTipo =
      String(datos.tipoHorario || "")
        .trim()
        .toUpperCase() === "EDUCACION_FISICA";

    const mismoCiclo =
      Number(datos.cicloLectivo || 0) === Number(datosBloque.cicloLectivo);

    const mismoCurso =
      String(datos.cursoId || "").trim() === String(datosBloque.cursoId);

    const mismoDia = String(datos.dia || "").trim() === String(datosBloque.dia);

    const mismaHoraInicio =
      String(datos.horaInicio || "").trim() ===
      String(datosBloque.horaInicio || "").trim();

    const activo = String(datos.estado || "ACTIVO").toUpperCase() === "ACTIVO";

    if (
      mismoTipo &&
      mismoCiclo &&
      mismoCurso &&
      mismoDia &&
      mismaHoraInicio &&
      activo
    ) {
      existe = true;
    }
  });

  return existe;
}

const DIAS_HORARIO_AULA = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const DIAS_HORARIO_TALLER = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const DIAS_HORARIO_EF = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

function renderizarHorarioAulaCargado(bloques) {
  if (!vistaHorarioAula) return;

  if (!bloques.length) {
    vistaHorarioAula.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no hay bloques horarios cargados para este curso.
      </p>
    `;
    return;
  }

  const htmlDias = DIAS_HORARIO_AULA.map((dia) => {
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
      .sort(
        (a, b) => Number(a.bloqueNumero || 0) - Number(b.bloqueNumero || 0),
      );

    return `
      <div class="dia-horario-admin">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-admin">
  <div class="encabezado-tarjeta-bloque-horario">
    <div class="bloque-horario-hora">
      Bloque ${bloque.bloqueNumero} · ${bloque.horaInicio} a ${bloque.horaFin}
    </div>

   <button
  class="btn-editar-bloque-horario"
  type="button"
  title="Editar bloque"
  aria-label="Editar bloque"
  data-id-horario="${bloque.id}"
>
  <i class="fa-solid fa-pen"></i>
</button>

<button
  class="btn-eliminar-bloque-horario"
  type="button"
  title="Eliminar bloque"
  aria-label="Eliminar bloque"
  data-id-horario="${bloque.id}"
>
  <i class="fa-solid fa-trash"></i>
</button>
  </div>

                      <div class="bloque-horario-materia">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      <div class="bloque-horario-docente">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques cargados.</p>`
        }
      </div>
    `;
  }).join("");

  vistaHorarioAula.innerHTML = `
    <div class="grilla-horario-aula-admin">
      ${htmlDias}
    </div>
  `;
}

function renderizarHorarioTallerCargado(bloques) {
  if (!vistaHorarioTaller) return;

  if (!bloques.length) {
    vistaHorarioTaller.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no hay bloques de taller cargados para este curso y grupo.
      </p>
    `;
    return;
  }

  const htmlDias = DIAS_HORARIO_TALLER.map((dia) => {
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-admin">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-admin">
                      <div class="encabezado-tarjeta-bloque-horario">
  <div class="bloque-horario-hora">
    ${bloque.horarioTexto || `${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}`}
  </div>

<div class="acciones-bloque-horario">
  <button
    class="btn-editar-bloque-horario btn-editar-bloque-horario-taller"
    type="button"
    title="Editar bloque de taller"
    aria-label="Editar bloque de taller"
    data-id-horario="${bloque.id}"
  >
    <i class="fa-solid fa-pen"></i>
  </button>

  <button
    class="btn-eliminar-bloque-horario btn-eliminar-bloque-horario-taller"
    type="button"
    title="Eliminar bloque de taller"
    aria-label="Eliminar bloque de taller"
    data-id-horario="${bloque.id}"
  >
    <i class="fa-solid fa-trash"></i>
  </button>
</div>
</div>

                      <div class="bloque-horario-materia">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      <div class="bloque-horario-docente">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      <div class="bloque-horario-ubicacion">
                        ${bloque.grupoTaller || "Grupo sin cargar"}
                      </div>

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques cargados.</p>`
        }
      </div>
    `;
  }).join("");

  vistaHorarioTaller.innerHTML = `
    <div class="grilla-horario-aula-admin">
      ${htmlDias}
    </div>
  `;
}

function renderizarHorarioEfCargado(bloques) {
  if (!vistaHorarioEf) return;

  if (!bloques.length) {
    vistaHorarioEf.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no hay bloques de Educación Física cargados para este curso.
      </p>
    `;
    return;
  }

  const htmlDias = DIAS_HORARIO_EF.map((dia) => {
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-admin">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-admin">
                      <div class="encabezado-tarjeta-bloque-horario">
                        <div class="bloque-horario-hora">
                          ${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}
                        </div>

                        <div class="acciones-bloque-horario">
  <button
    class="btn-editar-bloque-horario btn-editar-bloque-horario-ef"
    type="button"
    title="Editar bloque de Educación Física"
    aria-label="Editar bloque de Educación Física"
    data-id-horario="${bloque.id}"
  >
    <i class="fa-solid fa-pen"></i>
  </button>

  <button
    class="btn-eliminar-bloque-horario btn-eliminar-bloque-horario-ef"
    type="button"
    title="Eliminar bloque de Educación Física"
    aria-label="Eliminar bloque de Educación Física"
    data-id-horario="${bloque.id}"
  >
    <i class="fa-solid fa-trash"></i>
  </button>
</div>
                      </div>

                      <div class="bloque-horario-materia">
                        ${bloque.espacioCurricular || "Educación Física"}
                      </div>

                      <div class="bloque-horario-docente">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques cargados.</p>`
        }
      </div>
    `;
  }).join("");

  vistaHorarioEf.innerHTML = `
    <div class="grilla-horario-aula-admin">
      ${htmlDias}
    </div>
  `;
}

async function cargarHorarioAulaRegistrado() {
  if (!vistaHorarioAula) return;

  const cursoId = String(horarioAulaCurso?.value || "").trim();
  const cicloLectivo = Number(horarioAulaCicloLectivo?.value || 0);
  const turno = String(horarioAulaTurno?.value || "").trim();

  if (!cursoId) {
    vistaHorarioAula.innerHTML = `
      <p class="mensaje-formulario">
        Seleccioná un curso para ver el horario cargado.
      </p>
    `;
    return;
  }

  vistaHorarioAula.innerHTML = `
    <p class="mensaje-formulario">
      Cargando horario registrado...
    </p>
  `;

  try {
    const consulta = await getDocs(collection(db, "horarios"));
    const bloques = [];

    consulta.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();
      const estado = String(datos.estado || "ACTIVO")
        .trim()
        .toUpperCase();

      if (tipoHorario !== "AULA") return;
      if (estado !== "ACTIVO") return;
      if (String(datos.cursoId || "").trim() !== cursoId) return;

      if (cicloLectivo && Number(datos.cicloLectivo || 0) !== cicloLectivo) {
        return;
      }

      if (turno && String(datos.turno || "").trim() !== turno) {
        return;
      }

      bloques.push({
        id: documento.id,
        ...datos,
      });
    });

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_AULA.findIndex((dia) => dia.valor === a.dia);
      const diaB = DIAS_HORARIO_AULA.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) return diaA - diaB;

      return Number(a.bloqueNumero || 0) - Number(b.bloqueNumero || 0);
    });

    horariosAulaCargados = bloques;
    renderizarHorarioAulaCargado(bloques);
  } catch (error) {
    console.error("Error al cargar horario de aula registrado:", error);

    vistaHorarioAula.innerHTML = `
      <p class="mensaje-formulario mensaje-error">
        No se pudo cargar el horario registrado.
      </p>
    `;
  }
}

async function cargarHorarioTallerRegistrado() {
  if (!vistaHorarioTaller) return;

  const cursoId = String(horarioTallerCurso?.value || "").trim();
  const grupoTaller = String(horarioTallerGrupo?.value || "").trim();
  const cicloLectivo = Number(horarioTallerCicloLectivo?.value || 0);
  const turno = String(horarioTallerTurno?.value || "").trim();

  if (!cursoId) {
    vistaHorarioTaller.innerHTML = `
      <p class="mensaje-formulario">
        Seleccioná un curso para ver el horario de taller cargado.
      </p>
    `;
    return;
  }

  vistaHorarioTaller.innerHTML = `
    <p class="mensaje-formulario">
      Cargando horario de taller registrado...
    </p>
  `;

  try {
    const consulta = await getDocs(collection(db, "horarios"));
    const bloques = [];

    consulta.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      const estado = String(datos.estado || "ACTIVO")
        .trim()
        .toUpperCase();

      if (tipoHorario !== "TALLER") return;
      if (estado !== "ACTIVO") return;
      if (String(datos.cursoId || "").trim() !== cursoId) return;
      if (
        grupoTaller &&
        String(datos.grupoTaller || "").trim() !== grupoTaller
      ) {
        return;
      }

      if (cicloLectivo && Number(datos.cicloLectivo || 0) !== cicloLectivo) {
        return;
      }

      if (turno && String(datos.turno || "").trim() !== turno) {
        return;
      }

      bloques.push({
        id: documento.id,
        ...datos,
      });
    });

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_TALLER.findIndex((dia) => dia.valor === a.dia);
      const diaB = DIAS_HORARIO_TALLER.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) return diaA - diaB;

      return String(a.horaInicio || "").localeCompare(
        String(b.horaInicio || ""),
      );
    });

    horariosTallerCargados = bloques;
    renderizarHorarioTallerCargado(bloques);
  } catch (error) {
    console.error("Error al cargar horario de taller registrado:", error);

    vistaHorarioTaller.innerHTML = `
      <p class="mensaje-formulario mensaje-error">
        No se pudo cargar el horario de taller registrado.
      </p>
    `;
  }
}

async function cargarHorarioEfRegistrado() {
  if (!vistaHorarioEf) return;

  const cursoId = String(horarioEfCurso?.value || "").trim();
  const cicloLectivo = Number(horarioEfCicloLectivo?.value || 0);
  const turno = String(horarioEfTurno?.value || "").trim();

  if (!cursoId) {
    vistaHorarioEf.innerHTML = `
      <p class="mensaje-formulario">
        Seleccioná un curso para ver el horario de Educación Física cargado.
      </p>
    `;
    return;
  }

  vistaHorarioEf.innerHTML = `
    <p class="mensaje-formulario">
      Cargando horario de Educación Física registrado...
    </p>
  `;

  try {
    const consulta = await getDocs(collection(db, "horarios"));
    const bloques = [];

    consulta.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      const estado = String(datos.estado || "ACTIVO")
        .trim()
        .toUpperCase();

      if (tipoHorario !== "EDUCACION_FISICA") return;
      if (estado !== "ACTIVO") return;
      if (String(datos.cursoId || "").trim() !== cursoId) return;

      if (cicloLectivo && Number(datos.cicloLectivo || 0) !== cicloLectivo) {
        return;
      }

      if (turno && String(datos.turno || "").trim() !== turno) {
        return;
      }

      bloques.push({
        id: documento.id,
        ...datos,
      });
    });

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_EF.findIndex((dia) => dia.valor === a.dia);
      const diaB = DIAS_HORARIO_EF.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) return diaA - diaB;

      return String(a.horaInicio || "").localeCompare(
        String(b.horaInicio || ""),
      );
    });

    horariosEfCargados = bloques;
    renderizarHorarioEfCargado(bloques);
  } catch (error) {
    console.error("Error al cargar horario de Educación Física:", error);

    vistaHorarioEf.innerHTML = `
      <p class="mensaje-formulario mensaje-error">
        No se pudo cargar el horario de Educación Física registrado.
      </p>
    `;
  }
}

async function eliminarBloqueHorarioAula(idHorario) {
  if (!idHorario) return;

  const confirmacion = await Swal.fire({
    title: "Eliminar bloque horario",
    text: "Se eliminará este bloque del horario de aula.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    await deleteDoc(doc(db, "horarios", idHorario));

    await Swal.fire({
      title: "Bloque eliminado",
      text: "El bloque horario fue eliminado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarHorarioAulaRegistrado();

    mostrarMensajeHorarioAula("Bloque horario eliminado correctamente.", "ok");
  } catch (error) {
    console.error("Error al eliminar bloque horario:", error);

    Swal.fire({
      title: "No se pudo eliminar",
      text: "Ocurrió un error al eliminar el bloque horario.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    mostrarMensajeHorarioAula(
      "No se pudo eliminar el bloque horario.",
      "error",
    );
  }
}

async function eliminarBloqueHorarioTaller(idHorario) {
  if (!idHorario) return;

  const confirmacion = await Swal.fire({
    title: "Eliminar bloque de taller",
    text: "Se eliminará este bloque del horario de taller.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    await deleteDoc(doc(db, "horarios", idHorario));

    await Swal.fire({
      title: "Bloque eliminado",
      text: "El bloque de taller fue eliminado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarHorarioTallerRegistrado();

    mostrarMensajeHorarioTaller(
      "Bloque de taller eliminado correctamente.",
      "ok",
    );
  } catch (error) {
    console.error("Error al eliminar bloque de taller:", error);

    Swal.fire({
      title: "No se pudo eliminar",
      text: "Ocurrió un error al eliminar el bloque de taller.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    mostrarMensajeHorarioTaller(
      "No se pudo eliminar el bloque de taller.",
      "error",
    );
  }
}

async function eliminarBloqueHorarioEf(idHorario) {
  if (!idHorario) return;

  const confirmacion = await Swal.fire({
    title: "Eliminar bloque de Educación Física",
    text: "Se eliminará este bloque del horario de Educación Física.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    await deleteDoc(doc(db, "horarios", idHorario));

    await Swal.fire({
      title: "Bloque eliminado",
      text: "El bloque de Educación Física fue eliminado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarHorarioEfRegistrado();

    mostrarMensajeHorarioEf(
      "Bloque de Educación Física eliminado correctamente.",
      "ok",
    );
  } catch (error) {
    console.error("Error al eliminar bloque de Educación Física:", error);

    Swal.fire({
      title: "No se pudo eliminar",
      text: "Ocurrió un error al eliminar el bloque de Educación Física.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    mostrarMensajeHorarioEf(
      "No se pudo eliminar el bloque de Educación Física.",
      "error",
    );
  }
}

function activarModoEdicionHorarioAula(idHorario) {
  idHorarioAulaEditando = idHorario;

  if (btnRegistrarHorarioAula) {
    btnRegistrarHorarioAula.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar cambios
    `;
  }

  if (btnCancelarEdicionHorarioAula) {
    btnCancelarEdicionHorarioAula.hidden = false;
  }
}

function limpiarModoEdicionHorarioAula() {
  idHorarioAulaEditando = null;

  if (btnRegistrarHorarioAula) {
    btnRegistrarHorarioAula.innerHTML = `
      <i class="fa-solid fa-plus"></i>
      Registrar bloque horario
    `;
  }

  if (btnCancelarEdicionHorarioAula) {
    btnCancelarEdicionHorarioAula.hidden = true;
  }
}

function activarModoEdicionHorarioTaller(idHorario) {
  idHorarioTallerEditando = idHorario;

  if (btnRegistrarHorarioTaller) {
    btnRegistrarHorarioTaller.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar cambios
    `;
  }
}

function limpiarModoEdicionHorarioTaller() {
  idHorarioTallerEditando = null;

  if (btnRegistrarHorarioTaller) {
    btnRegistrarHorarioTaller.innerHTML = `
      <i class="fa-solid fa-plus"></i>
      Registrar bloque de taller
    `;
  }
}

function activarModoEdicionHorarioEf(idHorario) {
  idHorarioEfEditando = idHorario;

  if (btnRegistrarHorarioEf) {
    btnRegistrarHorarioEf.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar cambios
    `;
  }

  if (btnCancelarEdicionHorarioEf) {
    btnCancelarEdicionHorarioEf.hidden = false;
  }
}

function limpiarModoEdicionHorarioEf() {
  idHorarioEfEditando = null;

  if (btnRegistrarHorarioEf) {
    btnRegistrarHorarioEf.innerHTML = `
      <i class="fa-solid fa-plus"></i>
      Registrar bloque de Educación Física
    `;
  }

  if (btnCancelarEdicionHorarioEf) {
    btnCancelarEdicionHorarioEf.hidden = true;
  }
}

async function iniciarEdicionHorarioAula(idHorario) {
  const bloque = horariosAulaCargados.find((item) => item.id === idHorario);

  if (!bloque) {
    Swal.fire({
      title: "No se pudo editar",
      text: "No se encontró el bloque horario seleccionado.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  horarioAulaCicloLectivo.value = bloque.cicloLectivo || "";
  horarioAulaTurno.value = bloque.turno || "";

  renderizarBloquesHorarioAula();

  horarioAulaCurso.value = bloque.cursoId || "";

  await cargarEspaciosHorarioAulaPorCurso();

  horarioAulaDia.value = bloque.dia || "";
  horarioAulaEspacio.value = bloque.espacioId || "";
  horarioAulaUbicacion.value = bloque.ubicacion || "";

  await cargarDocenteAsignadoHorarioAula();

  if (!docenteAsignadoHorarioAula) {
    docenteAsignadoHorarioAula = {
      docenteNombre: bloque.docenteNombre || "",
      docenteCorreo: bloque.docenteCorreo || "",
    };

    horarioAulaDocente.value =
      docenteAsignadoHorarioAula.docenteNombre ||
      docenteAsignadoHorarioAula.docenteCorreo ||
      "Docente asignado";
  }

  document
    .querySelectorAll('input[name="bloqueHorarioAula"]')
    .forEach((checkbox) => {
      checkbox.checked =
        Number(checkbox.value || 0) === Number(bloque.bloqueNumero || 0);
    });

  activarModoEdicionHorarioAula(idHorario);

  mostrarMensajeHorarioAula(
    "Editando bloque horario. Modificá los datos y guardá los cambios.",
    "ok",
  );

  formHorarioAula.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function iniciarEdicionHorarioTaller(idHorario) {
  const bloque = horariosTallerCargados.find((item) => item.id === idHorario);

  if (!bloque) {
    Swal.fire({
      title: "No se pudo editar",
      text: "No se encontró el bloque de taller seleccionado.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  horarioTallerCicloLectivo.value = bloque.cicloLectivo || "";
  horarioTallerTurno.value = bloque.turno || "";
  horarioTallerCurso.value = bloque.cursoId || "";
  horarioTallerGrupo.value = bloque.grupoTaller || "";
  horarioTallerDia.value = bloque.dia || "";
  horarioTallerUbicacion.value = bloque.ubicacion || "";

  actualizarHorarioFijoTaller();

  await cargarMateriasHorarioTaller();

  horarioTallerEspacio.value = bloque.espacioId || "";

  await cargarDocenteAsignadoHorarioTaller();

  if (!docenteAsignadoHorarioTaller) {
    docenteAsignadoHorarioTaller = {
      docenteNombre: bloque.docenteNombre || "",
      docenteCorreo: bloque.docenteCorreo || "",
    };

    horarioTallerDocente.value =
      docenteAsignadoHorarioTaller.docenteNombre ||
      docenteAsignadoHorarioTaller.docenteCorreo ||
      "Docente asignado";
  }

  activarModoEdicionHorarioTaller(idHorario);

  mostrarMensajeHorarioTaller(
    "Editando bloque de taller. Modificá los datos y guardá los cambios.",
    "ok",
  );

  formHorarioTaller.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function iniciarEdicionHorarioEf(idHorario) {
  const bloque = horariosEfCargados.find((item) => item.id === idHorario);

  if (!bloque) {
    Swal.fire({
      title: "No se pudo editar",
      text: "No se encontró el bloque de Educación Física seleccionado.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  horarioEfCicloLectivo.value = bloque.cicloLectivo || "";
  horarioEfTurno.value = bloque.turno || "";
  horarioEfCurso.value = bloque.cursoId || "";
  horarioEfDia.value = bloque.dia || "";
  horarioEfHoraInicio.value = bloque.horaInicio || "";
  horarioEfHoraFin.value = bloque.horaFin || "";
  horarioEfUbicacion.value = bloque.ubicacion || "";

  await cargarDocenteAsignadoHorarioEf();

  if (!docenteAsignadoHorarioEf) {
    docenteAsignadoHorarioEf = {
      espacioId: bloque.espacioId || "",
      espacioCurricular: bloque.espacioCurricular || "Educación Física",
      docenteNombre: bloque.docenteNombre || "",
      docenteCorreo: bloque.docenteCorreo || "",
    };

    horarioEfDocente.value =
      docenteAsignadoHorarioEf.docenteNombre ||
      docenteAsignadoHorarioEf.docenteCorreo ||
      "Docente asignado";
  }

  activarModoEdicionHorarioEf(idHorario);

  mostrarMensajeHorarioEf(
    "Editando bloque de Educación Física. Modificá los datos y guardá los cambios.",
    "ok",
  );

  formHorarioEf.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function registrarHorarioAula(event) {
  event.preventDefault();

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeHorarioAula("No se detectó una sesión activa.", "error");
    return;
  }

  const cicloLectivo = Number(horarioAulaCicloLectivo?.value || 0);
  const turno = String(horarioAulaTurno?.value || "").trim();
  const dia = String(horarioAulaDia?.value || "").trim();
  const cursoId = String(horarioAulaCurso?.value || "").trim();
  const espacioId = String(horarioAulaEspacio?.value || "").trim();
  const ubicacion = String(horarioAulaUbicacion?.value || "").trim();

  const opcionCurso = horarioAulaCurso.options[horarioAulaCurso.selectedIndex];

  const opcionEspacio =
    horarioAulaEspacio.options[horarioAulaEspacio.selectedIndex];

  const cursoAnio = Number(opcionCurso?.dataset?.anio || 0);
  const cursoDivision = String(opcionCurso?.dataset?.division || "")
    .trim()
    .toUpperCase();
  const cursoNombre = String(opcionCurso?.dataset?.nombre || "").trim();

  const espacioCurricular = String(opcionEspacio?.dataset?.nombre || "").trim();

  const bloquesSeleccionados = obtenerBloquesSeleccionadosHorarioAula();

  if (!cicloLectivo) {
    mostrarMensajeHorarioAula("Ingresá el ciclo lectivo.", "error");
    return;
  }

  if (!turno) {
    mostrarMensajeHorarioAula("Seleccioná el turno.", "error");
    return;
  }

  if (!cursoId) {
    mostrarMensajeHorarioAula("Seleccioná el curso.", "error");
    return;
  }

  if (!dia) {
    mostrarMensajeHorarioAula("Seleccioná el día.", "error");
    return;
  }

  if (!espacioId) {
    mostrarMensajeHorarioAula("Seleccioná la materia.", "error");
    return;
  }

  if (!docenteAsignadoHorarioAula) {
    mostrarMensajeHorarioAula(
      "No hay docente asignado para ese curso y materia.",
      "error",
    );
    return;
  }

  if (!bloquesSeleccionados.length) {
    mostrarMensajeHorarioAula(
      "Seleccioná al menos un bloque horario.",
      "error",
    );
    return;
  }

  if (idHorarioAulaEditando && bloquesSeleccionados.length !== 1) {
    mostrarMensajeHorarioAula(
      "En modo edición solo podés seleccionar un bloque horario.",
      "error",
    );
    return;
  }

  btnRegistrarHorarioAula.disabled = true;

  mostrarMensajeHorarioAula(
    idHorarioAulaEditando
      ? "Guardando cambios del bloque horario..."
      : "Registrando horario de aula...",
  );

  try {
    if (idHorarioAulaEditando) {
      const bloque = bloquesSeleccionados[0];

      const datosBloque = {
        tipoHorario: "AULA",
        cicloLectivo,
        turno,
        cursoId,
        cursoAnio,
        cursoDivision,
        cursoNombre,
        dia,
        bloqueNumero: bloque.numero,
        horaInicio: bloque.inicio,
        horaFin: bloque.fin,
        espacioId,
        espacioCurricular,
        docenteNombre: docenteAsignadoHorarioAula.docenteNombre || "",
        docenteCorreo: docenteAsignadoHorarioAula.docenteCorreo || "",
        ubicacion,
        estado: "ACTIVO",
      };

      const yaExiste = await existeBloqueHorarioAula(
        datosBloque,
        idHorarioAulaEditando,
      );

      if (yaExiste) {
        throw new Error(
          `Ya existe un horario cargado para ${cursoNombre}, ${dia}, bloque ${bloque.numero}.`,
        );
      }

      await updateDoc(doc(db, "horarios", idHorarioAulaEditando), {
        ...datosBloque,
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.email || "",
      });

      await Swal.fire({
        title: "Horario actualizado",
        text: "El bloque horario fue actualizado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      limpiarModoEdicionHorarioAula();

      mostrarMensajeHorarioAula(
        "Bloque horario actualizado correctamente.",
        "ok",
      );

      await cargarHorarioAulaRegistrado();
      return;
    }

    let registrados = 0;

    for (const bloque of bloquesSeleccionados) {
      const datosBloque = {
        tipoHorario: "AULA",
        cicloLectivo,
        turno,
        cursoId,
        cursoAnio,
        cursoDivision,
        cursoNombre,
        dia,
        bloqueNumero: bloque.numero,
        horaInicio: bloque.inicio,
        horaFin: bloque.fin,
        espacioId,
        espacioCurricular,
        docenteNombre: docenteAsignadoHorarioAula.docenteNombre || "",
        docenteCorreo: docenteAsignadoHorarioAula.docenteCorreo || "",
        ubicacion,
        estado: "ACTIVO",
      };

      const yaExiste = await existeBloqueHorarioAula(datosBloque);

      if (yaExiste) {
        throw new Error(
          `Ya existe un horario cargado para ${cursoNombre}, ${dia}, bloque ${bloque.numero}.`,
        );
      }

      await addDoc(collection(db, "horarios"), {
        ...datosBloque,
        creadoEn: serverTimestamp(),
        creadoPor: usuario.email || "",
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.email || "",
      });

      registrados++;
    }

    await Swal.fire({
      title: "Horario registrado",
      text: `Se registraron ${registrados} bloque/s de horario de aula.`,
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    document
      .querySelectorAll('input[name="bloqueHorarioAula"]:checked')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    horarioAulaUbicacion.value = "";

    mostrarMensajeHorarioAula(
      `Horario registrado correctamente: ${registrados} bloque/s.`,
      "ok",
    );

    await cargarHorarioAulaRegistrado();
  } catch (error) {
    console.error("Error al registrar horario de aula:", error);

    mostrarMensajeHorarioAula(
      error.message || "No se pudo registrar el horario de aula.",
      "error",
    );

    Swal.fire({
      title: "No se pudo guardar",
      text: error.message || "Ocurrió un error al guardar el horario.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    btnRegistrarHorarioAula.disabled = false;
  }
}

async function registrarHorarioTaller(event) {
  event.preventDefault();

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeHorarioTaller("No se detectó una sesión activa.", "error");
    return;
  }

  const cicloLectivo = Number(horarioTallerCicloLectivo?.value || 0);
  const turno = String(horarioTallerTurno?.value || "").trim();
  const cursoId = String(horarioTallerCurso?.value || "").trim();
  const grupoTaller = String(horarioTallerGrupo?.value || "").trim();
  const dia = String(horarioTallerDia?.value || "").trim();
  const espacioId = String(horarioTallerEspacio?.value || "").trim();
  const ubicacion = String(horarioTallerUbicacion?.value || "").trim();

  const horarioFijo = obtenerHorarioFijoTaller(turno);

  const opcionCurso =
    horarioTallerCurso.options[horarioTallerCurso.selectedIndex];

  const opcionEspacio =
    horarioTallerEspacio.options[horarioTallerEspacio.selectedIndex];

  const cursoAnio = Number(opcionCurso?.dataset?.anio || 0);

  const cursoDivision = String(opcionCurso?.dataset?.division || "")
    .trim()
    .toUpperCase();

  const cursoNombre = String(opcionCurso?.dataset?.nombre || "").trim();

  const espacioCurricular = String(opcionEspacio?.dataset?.nombre || "").trim();

  if (!cicloLectivo) {
    mostrarMensajeHorarioTaller("Ingresá el ciclo lectivo.", "error");
    return;
  }

  if (!turno) {
    mostrarMensajeHorarioTaller("Seleccioná el turno.", "error");
    return;
  }

  if (!cursoId) {
    mostrarMensajeHorarioTaller("Seleccioná el curso.", "error");
    return;
  }

  if (!grupoTaller) {
    mostrarMensajeHorarioTaller("Seleccioná el grupo de taller.", "error");
    return;
  }

  if (!dia) {
    mostrarMensajeHorarioTaller("Seleccioná el día.", "error");
    return;
  }

  if (!espacioId) {
    mostrarMensajeHorarioTaller(
      "Seleccioná el taller / espacio curricular.",
      "error",
    );
    return;
  }

  if (!horarioFijo.inicio || !horarioFijo.fin) {
    mostrarMensajeHorarioTaller(
      "No se pudo determinar el horario del turno.",
      "error",
    );
    return;
  }

  if (!docenteAsignadoHorarioTaller) {
    mostrarMensajeHorarioTaller(
      "No hay docente asignado para ese curso y taller.",
      "error",
    );
    return;
  }

  const datosHorarioTaller = {
    tipoHorario: "TALLER",
    cicloLectivo,
    turno,
    cursoId,
    cursoAnio,
    cursoDivision,
    cursoNombre,
    grupoTaller,
    dia,
    horaInicio: horarioFijo.inicio,
    horaFin: horarioFijo.fin,
    horarioTexto: horarioFijo.texto,
    espacioId,
    espacioCurricular,
    docenteNombre: docenteAsignadoHorarioTaller.docenteNombre || "",
    docenteCorreo: docenteAsignadoHorarioTaller.docenteCorreo || "",
    ubicacion,
    estado: "ACTIVO",
  };

  btnRegistrarHorarioTaller.disabled = true;

  mostrarMensajeHorarioTaller(
    idHorarioTallerEditando
      ? "Guardando cambios del horario de taller..."
      : "Registrando horario de taller...",
  );

  try {
    const yaExiste = await existeBloqueHorarioTaller(
      datosHorarioTaller,
      idHorarioTallerEditando,
    );

    if (yaExiste) {
      throw new Error(
        `Ya existe un horario de taller cargado para ${cursoNombre}, ${grupoTaller}, ${dia}.`,
      );
    }

    if (idHorarioTallerEditando) {
      await updateDoc(doc(db, "horarios", idHorarioTallerEditando), {
        ...datosHorarioTaller,
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.email || "",
      });

      await Swal.fire({
        title: "Horario de taller actualizado",
        text: "El bloque de taller fue actualizado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      limpiarModoEdicionHorarioTaller();

      mostrarMensajeHorarioTaller(
        "Bloque de taller actualizado correctamente.",
        "ok",
      );

      await cargarHorarioTallerRegistrado();

      return;
    }

    await addDoc(collection(db, "horarios"), {
      ...datosHorarioTaller,
      creadoEn: serverTimestamp(),
      creadoPor: usuario.email || "",
      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario.email || "",
    });

    await Swal.fire({
      title: "Horario de taller registrado",
      text: "El bloque de taller fue registrado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    horarioTallerUbicacion.value = "";

    mostrarMensajeHorarioTaller(
      "Horario de taller registrado correctamente.",
      "ok",
    );

    await cargarHorarioTallerRegistrado();
  } catch (error) {
    console.error("Error al registrar horario de taller:", error);

    mostrarMensajeHorarioTaller(
      error.message || "No se pudo registrar el horario de taller.",
      "error",
    );

    Swal.fire({
      title: "No se pudo guardar",
      text:
        error.message || "Ocurrió un error al guardar el horario de taller.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    btnRegistrarHorarioTaller.disabled = false;
  }
}

async function registrarHorarioEf(event) {
  event.preventDefault();

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeHorarioEf("No se detectó una sesión activa.", "error");
    return;
  }

  const cicloLectivo = Number(horarioEfCicloLectivo?.value || 0);
  const turno = String(horarioEfTurno?.value || "").trim();
  const cursoId = String(horarioEfCurso?.value || "").trim();
  const dia = String(horarioEfDia?.value || "").trim();
  const horaInicio = String(horarioEfHoraInicio?.value || "").trim();
  const horaFin = String(horarioEfHoraFin?.value || "").trim();
  const ubicacion = String(horarioEfUbicacion?.value || "").trim();

  const opcionCurso = horarioEfCurso.options[horarioEfCurso.selectedIndex];

  const cursoAnio = Number(opcionCurso?.dataset?.anio || 0);

  const cursoDivision = String(opcionCurso?.dataset?.division || "")
    .trim()
    .toUpperCase();

  const cursoNombre = String(opcionCurso?.dataset?.nombre || "").trim();

  if (!cicloLectivo) {
    mostrarMensajeHorarioEf("Ingresá el ciclo lectivo.", "error");
    return;
  }

  if (!turno) {
    mostrarMensajeHorarioEf("Seleccioná el turno.", "error");
    return;
  }

  if (!cursoId) {
    mostrarMensajeHorarioEf("Seleccioná el curso.", "error");
    return;
  }

  if (!dia) {
    mostrarMensajeHorarioEf("Seleccioná el día.", "error");
    return;
  }

  if (!horaInicio) {
    mostrarMensajeHorarioEf("Seleccioná la hora de inicio.", "error");
    return;
  }

  if (!horaFin) {
    mostrarMensajeHorarioEf(
      "No se pudo calcular la hora de finalización.",
      "error",
    );
    return;
  }

  if (!docenteAsignadoHorarioEf) {
    mostrarMensajeHorarioEf(
      "No hay docente asignado para Educación Física en ese curso.",
      "error",
    );
    return;
  }

  const datosHorarioEf = {
    tipoHorario: "EDUCACION_FISICA",
    cicloLectivo,
    turno,
    cursoId,
    cursoAnio,
    cursoDivision,
    cursoNombre,
    dia,
    horaInicio,
    horaFin,
    duracionMinutos: 60,
    espacioId: docenteAsignadoHorarioEf.espacioId || "",
    espacioCurricular:
      docenteAsignadoHorarioEf.espacioCurricular || "Educación Física",
    docenteNombre: docenteAsignadoHorarioEf.docenteNombre || "",
    docenteCorreo: docenteAsignadoHorarioEf.docenteCorreo || "",
    ubicacion,
    estado: "ACTIVO",
  };

  btnRegistrarHorarioEf.disabled = true;

  mostrarMensajeHorarioEf(
    idHorarioEfEditando
      ? "Guardando cambios del bloque de Educación Física..."
      : "Registrando horario de Educación Física...",
  );

  try {
    const yaExiste = await existeBloqueHorarioEf(
      datosHorarioEf,
      idHorarioEfEditando,
    );

    if (yaExiste) {
      throw new Error(
        `Ya existe un bloque de Educación Física cargado para ${cursoNombre}, ${dia}, ${horaInicio}.`,
      );
    }

    if (idHorarioEfEditando) {
      await updateDoc(doc(db, "horarios", idHorarioEfEditando), {
        ...datosHorarioEf,
        actualizadoEn: serverTimestamp(),
        actualizadoPor: usuario.email || "",
      });

      await Swal.fire({
        title: "Horario actualizado",
        text: "El bloque de Educación Física fue actualizado correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      limpiarModoEdicionHorarioEf();

      mostrarMensajeHorarioEf(
        "Bloque de Educación Física actualizado correctamente.",
        "ok",
      );

      await cargarHorarioEfRegistrado();

      return;
    }

    await addDoc(collection(db, "horarios"), {
      ...datosHorarioEf,
      creadoEn: serverTimestamp(),
      creadoPor: usuario.email || "",
      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario.email || "",
    });

    await Swal.fire({
      title: "Horario registrado",
      text: "El bloque de Educación Física fue registrado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    horarioEfHoraInicio.value = "";
    horarioEfHoraFin.value = "";
    horarioEfUbicacion.value = "";

    mostrarMensajeHorarioEf(
      "Bloque de Educación Física registrado correctamente.",
      "ok",
    );

    await cargarHorarioEfRegistrado();
  } catch (error) {
    console.error("Error al registrar horario de Educación Física:", error);

    mostrarMensajeHorarioEf(
      error.message || "No se pudo registrar el horario de Educación Física.",
      "error",
    );

    Swal.fire({
      title: "No se pudo guardar",
      text:
        error.message ||
        "Ocurrió un error al guardar el horario de Educación Física.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    btnRegistrarHorarioEf.disabled = false;
  }
}

if (formHorarioAula) {
  formHorarioAula.addEventListener("submit", registrarHorarioAula);
}

if (formHorarioTaller) {
  formHorarioTaller.addEventListener("submit", registrarHorarioTaller);
}

if (formHorarioEf) {
  formHorarioEf.addEventListener("submit", registrarHorarioEf);
}

if (btnActualizarHorarioAula) {
  btnActualizarHorarioAula.addEventListener("click", async () => {
    if (!cursosHorarios.length) {
      await cargarCursosHorarioAula();
      return;
    }

    await cargarHorarioAulaRegistrado();
  });
}

if (btnActualizarHorarioTaller) {
  btnActualizarHorarioTaller.addEventListener("click", async () => {
    if (!cursosHorarios.length) {
      await cargarCursosHorarioAula();

      if (vistaHorarioTaller) {
        vistaHorarioTaller.innerHTML = `
          <p class="mensaje-formulario">
            Cursos cargados. Seleccioná curso, grupo y turno para cargar el horario de taller.
          </p>
        `;
      }

      return;
    }

    await cargarHorarioTallerRegistrado();
  });
}

if (btnActualizarHorarioEf) {
  btnActualizarHorarioEf.addEventListener("click", async () => {
    if (!cursosHorarios.length) {
      await cargarCursosHorarioAula();

      if (vistaHorarioEf) {
        vistaHorarioEf.innerHTML = `
          <p class="mensaje-formulario">
            Cursos cargados. Seleccioná curso y turno para cargar el horario de Educación Física.
          </p>
        `;
      }

      return;
    }

    await cargarHorarioEfRegistrado();
  });
}

if (horarioAulaCurso) {
  horarioAulaCurso.addEventListener("change", cargarHorarioAulaRegistrado);
}

if (horarioAulaTurno) {
  horarioAulaTurno.addEventListener("change", cargarHorarioAulaRegistrado);
}

if (horarioAulaCicloLectivo) {
  horarioAulaCicloLectivo.addEventListener(
    "change",
    cargarHorarioAulaRegistrado,
  );
}

if (vistaHorarioAula) {
  vistaHorarioAula.addEventListener("click", async (event) => {
    const botonEditar = event.target.closest(".btn-editar-bloque-horario");

    if (botonEditar) {
      await iniciarEdicionHorarioAula(botonEditar.dataset.idHorario);
      return;
    }

    const botonEliminar = event.target.closest(".btn-eliminar-bloque-horario");

    if (!botonEliminar) return;

    await eliminarBloqueHorarioAula(botonEliminar.dataset.idHorario);
  });
}

if (vistaHorarioTaller) {
  vistaHorarioTaller.addEventListener("click", async (event) => {
    const botonEditar = event.target.closest(
      ".btn-editar-bloque-horario-taller",
    );

    if (botonEditar) {
      await iniciarEdicionHorarioTaller(botonEditar.dataset.idHorario);
      return;
    }

    const botonEliminar = event.target.closest(
      ".btn-eliminar-bloque-horario-taller",
    );

    if (!botonEliminar) return;

    await eliminarBloqueHorarioTaller(botonEliminar.dataset.idHorario);
  });
}

if (vistaHorarioEf) {
  vistaHorarioEf.addEventListener("click", async (event) => {
    const botonEditar = event.target.closest(".btn-editar-bloque-horario-ef");

    if (botonEditar) {
      await iniciarEdicionHorarioEf(botonEditar.dataset.idHorario);
      return;
    }

    const botonEliminar = event.target.closest(
      ".btn-eliminar-bloque-horario-ef",
    );

    if (!botonEliminar) return;

    await eliminarBloqueHorarioEf(botonEliminar.dataset.idHorario);
  });
}

if (btnCancelarEdicionHorarioAula) {
  btnCancelarEdicionHorarioAula.addEventListener("click", () => {
    limpiarModoEdicionHorarioAula();

    document
      .querySelectorAll('input[name="bloqueHorarioAula"]:checked')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    mostrarMensajeHorarioAula("Edición cancelada.");
  });
}

if (btnCancelarEdicionHorarioEf) {
  btnCancelarEdicionHorarioEf.addEventListener("click", () => {
    limpiarModoEdicionHorarioEf();

    horarioEfHoraInicio.value = "";
    horarioEfHoraFin.value = "";
    horarioEfUbicacion.value = "";

    mostrarMensajeHorarioEf("Edición cancelada.");
  });
}

if (horarioTallerTurno) {
  horarioTallerTurno.addEventListener("change", async () => {
    actualizarHorarioFijoTaller();
    await cargarHorarioTallerRegistrado();
  });
}

if (horarioTallerCurso) {
  horarioTallerCurso.addEventListener("change", async () => {
    await cargarMateriasHorarioTaller();
    await cargarDocenteAsignadoHorarioTaller();
  });
}

if (horarioTallerGrupo) {
  horarioTallerGrupo.addEventListener("change", cargarHorarioTallerRegistrado);
}

if (horarioTallerEspacio) {
  horarioTallerEspacio.addEventListener(
    "change",
    cargarDocenteAsignadoHorarioTaller,
  );
}

if (horarioTallerCicloLectivo) {
  horarioTallerCicloLectivo.addEventListener("change", async () => {
    await cargarDocenteAsignadoHorarioTaller();
    await cargarHorarioTallerRegistrado();
  });
}

if (horarioEfCurso) {
  horarioEfCurso.addEventListener("change", async () => {
    await cargarDocenteAsignadoHorarioEf();
    await cargarHorarioEfRegistrado();
  });
}

if (horarioEfTurno) {
  horarioEfTurno.addEventListener("change", cargarHorarioEfRegistrado);
}

if (horarioEfCicloLectivo) {
  horarioEfCicloLectivo.addEventListener("change", async () => {
    await cargarDocenteAsignadoHorarioEf();
    await cargarHorarioEfRegistrado();
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  if (horarioAulaCurso) {
    horarioAulaCurso.innerHTML = `
      <option value="">Presioná “Actualizar horario” para cargar cursos</option>
    `;
  }

  if (horarioEfCurso) {
    horarioEfCurso.innerHTML = `
      <option value="">Presioná “Actualizar horario” para cargar cursos</option>
    `;
  }

  if (horarioTallerCurso) {
    horarioTallerCurso.innerHTML = `
      <option value="">Presioná “Actualizar horario” para cargar cursos</option>
    `;
  }

  if (vistaHorarioAula) {
    vistaHorarioAula.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no se consultó el horario. Presioná “Actualizar horario” para comenzar.
      </p>
    `;
  }

  if (vistaHorarioTaller) {
    vistaHorarioTaller.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no se consultó el horario de taller. Presioná “Actualizar horario” para comenzar.
      </p>
    `;
  }

  if (vistaHorarioEf) {
    vistaHorarioEf.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no se consultó el horario de Educación Física. Presioná “Actualizar horario” para comenzar.
      </p>
    `;
  }
});
