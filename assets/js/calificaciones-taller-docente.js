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

const tarjetaCalificacionesTallerDocente = document.getElementById(
  "tarjetaCalificacionesTallerDocente",
);

const seccionCalificacionesTallerDocente = document.getElementById(
  "calificaciones-taller-docente",
);

const cicloCalificacionesTallerDocente = document.getElementById(
  "cicloCalificacionesTallerDocente",
);

const cursoCalificacionesTallerDocente = document.getElementById(
  "cursoCalificacionesTallerDocente",
);

const grupoCalificacionesTallerDocente = document.getElementById(
  "grupoCalificacionesTallerDocente",
);

const resumenCalificacionesTallerDocente = document.getElementById(
  "resumenCalificacionesTallerDocente",
);

const vistaCalificacionesTallerDocente = document.getElementById(
  "vistaCalificacionesTallerDocente",
);

const mensajeCalificacionesTallerDocente = document.getElementById(
  "mensajeCalificacionesTallerDocente",
);

let accesosCalificacionesTallerDocente = [];
let registroCalificacionesTallerDocente = null;

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensaje(texto = "", tipo = "") {
  if (!mensajeCalificacionesTallerDocente) return;

  mensajeCalificacionesTallerDocente.textContent = texto;
  mensajeCalificacionesTallerDocente.className = "mensaje-formulario";

  if (tipo) {
    mensajeCalificacionesTallerDocente.classList.add(tipo);
  }
}

function mostrarVistaInformativa(texto) {
  if (!vistaCalificacionesTallerDocente) return;

  vistaCalificacionesTallerDocente.innerHTML = `
    <p class="mensaje-formulario">
      ${escaparHtml(texto)}
    </p>
  `;
}

function esAsignacionTallerPrimerCiclo(asignacion) {
  const tipo = normalizarTexto(
    asignacion.espacioTipo ||
      asignacion.tipoEspacio ||
      asignacion.tipoHorario ||
      "",
  );

  const anio = Number(asignacion.cursoAnio || asignacion.anioCurso || 0);

  return tipo.includes("TALLER") && (anio === 1 || anio === 2);
}

function estaReemplazoVigente(reemplazo) {
  const estado = normalizarTexto(reemplazo.estado);
  const tipo = normalizarTexto(reemplazo.tipoHorario || reemplazo.espacioTipo);
  const fechaDesde = String(reemplazo.fechaDesde || "").trim();
  const fechaHasta = String(reemplazo.fechaHasta || "").trim();

  const hoy = new Date();
  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    estado === "ACTIVO" &&
    tipo.includes("TALLER") &&
    fechaDesde &&
    fechaHasta &&
    fechaHoy >= fechaDesde &&
    fechaHoy <= fechaHasta
  );
}

function crearAccesoDesdeAsignacion(asignacion, origen = "TITULAR") {
  return {
    origen,
    asignacionId: asignacion.id || "",
    reemplazoId: asignacion.reemplazoId || "",
    cicloLectivo: Number(asignacion.cicloLectivo || 0),
    cursoId: String(asignacion.cursoId || "").trim(),
    cursoNombre:
      String(asignacion.cursoNombre || "").trim() ||
      `${Number(asignacion.cursoAnio || 0)}º ${String(
        asignacion.cursoDivision || "",
      ).trim()}`.trim(),
    cursoAnio: Number(asignacion.cursoAnio || 0),
    cursoDivision: String(asignacion.cursoDivision || "").trim(),
    espacioId: String(asignacion.espacioId || "").trim(),
    espacioNombre: String(
      asignacion.espacioNombre || asignacion.espacioCurricular || "",
    ).trim(),
  };
}

async function obtenerAccesosTitular(correoDocente) {
  const porId = new Map();

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
      const datos = {
        id: documento.id,
        ...documento.data(),
      };

      if (!esAsignacionTallerPrimerCiclo(datos)) return;

      porId.set(documento.id, crearAccesoDesdeAsignacion(datos, "TITULAR"));
    });
  }

  return Array.from(porId.values());
}

async function obtenerAccesosReemplazo(correoDocente) {
  const consultaReemplazos = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const resultado = await getDocs(consultaReemplazos);
  const accesos = [];

  resultado.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    if (!estaReemplazoVigente(reemplazo)) return;

    const anio = Number(reemplazo.cursoAnio || 0);

    if (anio !== 1 && anio !== 2) return;

    accesos.push(
      crearAccesoDesdeAsignacion(
        {
          ...reemplazo,
          id: reemplazo.asignacionTitularId || "",
          reemplazoId: documento.id,
          espacioTipo: reemplazo.tipoHorario || "TALLER",
        },
        "REEMPLAZO",
      ),
    );
  });

  return accesos;
}

function deduplicarAccesos(accesos) {
  const porClave = new Map();

  accesos.forEach((acceso) => {
    if (
      !acceso.cicloLectivo ||
      !acceso.cursoId ||
      !acceso.espacioId ||
      (acceso.cursoAnio !== 1 && acceso.cursoAnio !== 2)
    ) {
      return;
    }

    const clave = [
      acceso.cicloLectivo,
      acceso.cursoId,
      acceso.espacioId,
      acceso.origen,
      acceso.reemplazoId || acceso.asignacionId,
    ].join("__");

    if (!porClave.has(clave)) {
      porClave.set(clave, acceso);
    }
  });

  return Array.from(porClave.values());
}

function ordenarCursos(a, b) {
  const anio = Number(a.cursoAnio || 0) - Number(b.cursoAnio || 0);

  if (anio !== 0) return anio;

  const division = String(a.cursoDivision || "").localeCompare(
    String(b.cursoDivision || ""),
    "es",
    { numeric: true, sensitivity: "base" },
  );

  if (division !== 0) return division;

  return String(a.cursoNombre || "").localeCompare(
    String(b.cursoNombre || ""),
    "es",
    { numeric: true, sensitivity: "base" },
  );
}

function cargarCiclosDisponibles() {
  if (!cicloCalificacionesTallerDocente) return;

  const ciclos = Array.from(
    new Set(
      accesosCalificacionesTallerDocente
        .map((acceso) => Number(acceso.cicloLectivo || 0))
        .filter(Boolean),
    ),
  ).sort((a, b) => b - a);

  cicloCalificacionesTallerDocente.innerHTML = `
    <option value="">Seleccionar ciclo</option>
    ${ciclos
      .map(
        (ciclo) => `
          <option value="${ciclo}">
            ${ciclo}
          </option>
        `,
      )
      .join("")}
  `;

  cicloCalificacionesTallerDocente.disabled = ciclos.length === 0;

  if (ciclos.length === 1) {
    cicloCalificacionesTallerDocente.value = String(ciclos[0]);
    cargarCursosDisponibles();
  }
}

function cargarCursosDisponibles() {
  if (
    !cicloCalificacionesTallerDocente ||
    !cursoCalificacionesTallerDocente ||
    !grupoCalificacionesTallerDocente
  ) {
    return;
  }

  registroCalificacionesTallerDocente = null;
  resumenCalificacionesTallerDocente.hidden = true;
  resumenCalificacionesTallerDocente.innerHTML = "";
  grupoCalificacionesTallerDocente.value = "TODOS";
  grupoCalificacionesTallerDocente.disabled = true;

  const ciclo = Number(cicloCalificacionesTallerDocente.value || 0);

  if (!ciclo) {
    cursoCalificacionesTallerDocente.innerHTML =
      '<option value="">Seleccioná primero un ciclo</option>';
    cursoCalificacionesTallerDocente.disabled = true;
    mostrarVistaInformativa(
      "Seleccioná un ciclo lectivo y un curso para consultar el registro.",
    );
    mostrarMensaje("");
    return;
  }

  const cursosPorId = new Map();

  accesosCalificacionesTallerDocente
    .filter((acceso) => acceso.cicloLectivo === ciclo)
    .forEach((acceso) => {
      if (!cursosPorId.has(acceso.cursoId)) {
        cursosPorId.set(acceso.cursoId, acceso);
      }
    });

  const cursos = Array.from(cursosPorId.values()).sort(ordenarCursos);

  cursoCalificacionesTallerDocente.innerHTML = `
    <option value="">Seleccionar curso</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${escaparHtml(curso.cursoId)}">
            ${escaparHtml(curso.cursoNombre)}
          </option>
        `,
      )
      .join("")}
  `;

  cursoCalificacionesTallerDocente.disabled = cursos.length === 0;

  mostrarVistaInformativa(
    cursos.length
      ? "Seleccioná un curso para consultar el Registro de Calificaciones."
      : "No tenés cursos de Taller de 1.º o 2.º año para el ciclo seleccionado.",
  );

  mostrarMensaje("");

  if (cursos.length === 1) {
    cursoCalificacionesTallerDocente.value = cursos[0].cursoId;
    cargarRegistroSeleccionado();
  }
}

function obtenerValorMapa(mapa, alumnoId) {
  if (!mapa || typeof mapa !== "object") return "";

  const dato = mapa[alumnoId];

  if (dato === undefined || dato === null || dato === "") return "";

  if (typeof dato === "object" && !Array.isArray(dato)) {
    if (dato.valor !== undefined && dato.valor !== null) {
      return dato.valor;
    }

    if (dato.nota !== undefined && dato.nota !== null) {
      return dato.nota;
    }

    return "";
  }

  return dato;
}

function formatearNota(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return '<span class="nota-sin-cargar">—</span>';
  }

  return escaparHtml(valor);
}

function ordenarAlumnos(a, b) {
  return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
    sensitivity: "base",
  });
}

function alumnosFiltrados(registro) {
  const alumnos = Object.entries(registro.alumnos || {}).map(([id, datos]) => ({
    id,
    ...datos,
  }));

  const grupo = String(grupoCalificacionesTallerDocente?.value || "TODOS")
    .trim()
    .toUpperCase();

  return alumnos
    .filter((alumno) => {
      if (grupo === "TODOS") return true;

      return (
        String(alumno.grupoTaller || "")
          .trim()
          .toUpperCase() === grupo
      );
    })
    .sort(ordenarAlumnos);
}

function renderizarResumen(registro, cantidadVisible) {
  if (!resumenCalificacionesTallerDocente) return;

  const totalAlumnos = Object.keys(registro.alumnos || {}).length;

  resumenCalificacionesTallerDocente.innerHTML = `
    <span class="chip-calificaciones-taller-docente">
      <strong>Curso:</strong>
      ${escaparHtml(registro.cursoNombre || "-")}
    </span>

    <span class="chip-calificaciones-taller-docente">
      <strong>Ciclo:</strong>
      ${escaparHtml(registro.cicloLectivo || "-")}
    </span>

    <span class="chip-calificaciones-taller-docente">
      <strong>Estudiantes:</strong>
      ${cantidadVisible} de ${totalAlumnos}
    </span>

    <span class="chip-calificaciones-taller-docente">
      <strong>Talleres:</strong>
      ${escaparHtml(registro.espacio1Nombre || "-")} ·
      ${escaparHtml(registro.espacio2Nombre || "-")} ·
      ${escaparHtml(registro.espacio3Nombre || "-")}
    </span>
  `;

  resumenCalificacionesTallerDocente.hidden = false;
}

function renderizarTabla(registro) {
  if (!vistaCalificacionesTallerDocente) return;

  const alumnos = alumnosFiltrados(registro);

  renderizarResumen(registro, alumnos.length);

  if (!alumnos.length) {
    mostrarVistaInformativa("No hay estudiantes para el grupo seleccionado.");
    return;
  }

  const e1 = escaparHtml(registro.espacio1Nombre || "Taller 1");
  const e2 = escaparHtml(registro.espacio2Nombre || "Taller 2");
  const e3 = escaparHtml(registro.espacio3Nombre || "Taller 3");

  const filas = alumnos
    .map((alumno, indice) => {
      const id = alumno.id;

      return `
        <tr>
          <td>${indice + 1}</td>
          <td class="col-dni">${escaparHtml(alumno.dni || "—")}</td>
          <td class="col-estudiante">${escaparHtml(
            alumno.nombre || alumno.correo || id,
          )}</td>
          <td class="col-grupo">${escaparHtml(alumno.grupoTaller || "—")}</td>

          <td>${formatearNota(obtenerValorMapa(registro.trim1Espacio1, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim1Espacio2, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim1Espacio3, id))}</td>
          <td class="nota-trim">${formatearNota(
            obtenerValorMapa(registro.trim1Resultado, id),
          )}</td>

          <td>${formatearNota(obtenerValorMapa(registro.trim2Espacio1, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim2Espacio2, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim2Espacio3, id))}</td>
          <td class="nota-trim">${formatearNota(
            obtenerValorMapa(registro.trim2Resultado, id),
          )}</td>

          <td>${formatearNota(obtenerValorMapa(registro.trim3Espacio1, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim3Espacio2, id))}</td>
          <td>${formatearNota(obtenerValorMapa(registro.trim3Espacio3, id))}</td>
          <td class="nota-trim">${formatearNota(
            obtenerValorMapa(registro.trim3Resultado, id),
          )}</td>

          <td class="nota-anual">${formatearNota(
            obtenerValorMapa(registro.calificacionFinal, id),
          )}</td>
          <td class="nota-anual">${formatearNota(
            obtenerValorMapa(registro.diciembre, id),
          )}</td>
          <td class="nota-anual">${formatearNota(
            obtenerValorMapa(registro.febrero, id),
          )}</td>
        </tr>
      `;
    })
    .join("");

  vistaCalificacionesTallerDocente.innerHTML = `
    <div class="tabla-calificaciones-taller-contenedor">
      <table class="tabla-calificaciones-taller-docente">
        <thead>
          <tr>
            <th rowspan="2">N°</th>
            <th rowspan="2">DNI</th>
            <th rowspan="2">Estudiante</th>
            <th rowspan="2">Grupo</th>
            <th colspan="4">1.er Trimestre</th>
            <th colspan="4">2.º Trimestre</th>
            <th colspan="4">3.er Trimestre</th>
            <th rowspan="2">Calif. Final</th>
            <th rowspan="2">Diciembre</th>
            <th rowspan="2">Febrero</th>
          </tr>
          <tr>
            <th class="encabezado-taller">${e1}</th>
            <th class="encabezado-taller">${e2}</th>
            <th class="encabezado-taller">${e3}</th>
            <th>TRIM</th>

            <th class="encabezado-taller">${e1}</th>
            <th class="encabezado-taller">${e2}</th>
            <th class="encabezado-taller">${e3}</th>
            <th>TRIM</th>

            <th class="encabezado-taller">${e1}</th>
            <th class="encabezado-taller">${e2}</th>
            <th class="encabezado-taller">${e3}</th>
            <th>TRIM</th>
          </tr>
        </thead>

        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>
  `;
}

async function cargarRegistroSeleccionado() {
  if (
    !cicloCalificacionesTallerDocente ||
    !cursoCalificacionesTallerDocente ||
    !grupoCalificacionesTallerDocente
  ) {
    return;
  }

  const ciclo = Number(cicloCalificacionesTallerDocente.value || 0);
  const cursoId = String(cursoCalificacionesTallerDocente.value || "").trim();

  registroCalificacionesTallerDocente = null;
  resumenCalificacionesTallerDocente.hidden = true;
  resumenCalificacionesTallerDocente.innerHTML = "";
  grupoCalificacionesTallerDocente.value = "TODOS";
  grupoCalificacionesTallerDocente.disabled = true;

  if (!ciclo || !cursoId) {
    mostrarVistaInformativa(
      "Seleccioná un ciclo lectivo y un curso para consultar el registro.",
    );
    mostrarMensaje("");
    return;
  }

  mostrarVistaInformativa("Cargando Registro de Calificaciones...");
  mostrarMensaje("");

  const registroId = `${ciclo}__${cursoId}`;

  try {
    const referencia = doc(db, "calificaciones_taller", registroId);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      mostrarVistaInformativa(
        "Este curso todavía no tiene inicializado su Registro de Calificaciones.",
      );
      mostrarMensaje(
        "El registro debe ser inicializado previamente desde el Portal de Soporte.",
      );
      return;
    }

    registroCalificacionesTallerDocente = {
      id: documento.id,
      ...documento.data(),
    };

    grupoCalificacionesTallerDocente.disabled = false;
    renderizarTabla(registroCalificacionesTallerDocente);

    mostrarMensaje(
      "Registro cargado correctamente. Esta etapa es únicamente de consulta.",
      "ok",
    );
  } catch (error) {
    console.error(
      "Error al cargar Registro de Calificaciones de Taller:",
      error,
    );

    mostrarVistaInformativa(
      "No se pudo consultar el Registro de Calificaciones.",
    );

    if (error?.code === "permission-denied") {
      mostrarMensaje(
        "Firebase rechazó la lectura del registro. Revisaremos la asignación o el reemplazo asociado antes de habilitar la carga de notas.",
        "error",
      );
      return;
    }

    mostrarMensaje(
      "No se pudo cargar el registro. Revisá conexión y volvé a intentar.",
      "error",
    );
  }
}

async function prepararModulo(correoDocente) {
  try {
    const [titulares, reemplazos] = await Promise.all([
      obtenerAccesosTitular(correoDocente),
      obtenerAccesosReemplazo(correoDocente),
    ]);

    accesosCalificacionesTallerDocente = deduplicarAccesos([
      ...titulares,
      ...reemplazos,
    ]);

    if (!accesosCalificacionesTallerDocente.length) {
      return;
    }

    if (tarjetaCalificacionesTallerDocente) {
      tarjetaCalificacionesTallerDocente.hidden = false;
    }

    if (seccionCalificacionesTallerDocente) {
      seccionCalificacionesTallerDocente.hidden = false;
    }

    cargarCiclosDisponibles();
  } catch (error) {
    console.error(
      "Error al preparar Registro de Calificaciones de Taller:",
      error,
    );
  }
}

if (cicloCalificacionesTallerDocente) {
  cicloCalificacionesTallerDocente.addEventListener(
    "change",
    cargarCursosDisponibles,
  );
}

if (cursoCalificacionesTallerDocente) {
  cursoCalificacionesTallerDocente.addEventListener(
    "change",
    cargarRegistroSeleccionado,
  );
}

if (grupoCalificacionesTallerDocente) {
  grupoCalificacionesTallerDocente.addEventListener("change", () => {
    if (!registroCalificacionesTallerDocente) return;

    renderizarTabla(registroCalificacionesTallerDocente);
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  prepararModulo(normalizarCorreo(user.email));
});
