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
  updateDoc,
  serverTimestamp,
  FieldPath,
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
let usuarioCalificacionesTallerDocente = null;
let configuracionPeriodosCalificacionesTallerDocente = null;
let trimestreEditableCalificacionesTallerDocente = 0;
let accesoEditableCalificacionesTallerDocente = null;
let espacioEditableNumeroCalificacionesTallerDocente = 0;
let cambiosPendientesCalificacionesTallerDocente = new Map();
let guardandoCalificacionesTallerDocente = false;

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
  configuracionPeriodosCalificacionesTallerDocente = null;
  trimestreEditableCalificacionesTallerDocente = 0;
  accesoEditableCalificacionesTallerDocente = null;
  espacioEditableNumeroCalificacionesTallerDocente = 0;
  cambiosPendientesCalificacionesTallerDocente.clear();
  resumenCalificacionesTallerDocente.hidden = true;
  resumenCalificacionesTallerDocente.innerHTML = "";
  grupoCalificacionesTallerDocente.value = "TODOS";
  grupoCalificacionesTallerDocente.disabled = true;
  actualizarEstadoVisualEdicion();

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

function fechaArgentinaISO() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Cordoba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, parte.value]),
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

function determinarTrimestreEditable(configuracion) {
  if (!configuracion) return 0;

  const hoy = fechaArgentinaISO();

  const periodos = [
    {
      trimestre: 1,
      inicio: String(configuracion.trimestre1Inicio || ""),
      fin: String(configuracion.trimestre1Fin || ""),
    },
    {
      trimestre: 2,
      inicio: String(configuracion.trimestre2Inicio || ""),
      fin: String(configuracion.trimestre2Fin || ""),
    },
    {
      trimestre: 3,
      inicio: String(configuracion.trimestre3Inicio || ""),
      fin: String(configuracion.trimestre3Fin || ""),
    },
  ];

  const vigente = periodos.find(
    (periodo) =>
      /^\d{4}-\d{2}-\d{2}$/.test(periodo.inicio) &&
      /^\d{4}-\d{2}-\d{2}$/.test(periodo.fin) &&
      hoy >= periodo.inicio &&
      hoy <= periodo.fin,
  );

  return vigente?.trimestre || 0;
}

function obtenerNumeroEspacioRegistro(registro, espacioId) {
  const id = String(espacioId || "").trim();

  if (!id) return 0;
  if (String(registro.espacio1Id || "").trim() === id) return 1;
  if (String(registro.espacio2Id || "").trim() === id) return 2;
  if (String(registro.espacio3Id || "").trim() === id) return 3;

  return 0;
}

function obtenerAccesoEditableRegistro(registro) {
  const ciclo = Number(registro.cicloLectivo || 0);
  const cursoId = String(registro.cursoId || "").trim();

  const candidatos = accesosCalificacionesTallerDocente
    .filter(
      (acceso) =>
        acceso.cicloLectivo === ciclo &&
        acceso.cursoId === cursoId &&
        obtenerNumeroEspacioRegistro(registro, acceso.espacioId) > 0,
    )
    .map((acceso) => ({
      ...acceso,
      espacioNumero: obtenerNumeroEspacioRegistro(registro, acceso.espacioId),
    }))
    .filter((acceso) => {
      const asignacionRegistro = String(
        registro[`espacio${acceso.espacioNumero}AsignacionId`] || "",
      ).trim();

      return !asignacionRegistro || asignacionRegistro === acceso.asignacionId;
    })
    .sort((a, b) => {
      if (a.origen === b.origen) return 0;
      return a.origen === "TITULAR" ? -1 : 1;
    });

  return candidatos[0] || null;
}

function nombreTrimestre(trimestre) {
  if (trimestre === 1) return "1ER TRIMESTRE";
  if (trimestre === 2) return "2DO TRIMESTRE";
  if (trimestre === 3) return "3ER TRIMESTRE";
  return "";
}

function campoNotaTrimestre(trimestre, espacioNumero) {
  if (![1, 2, 3].includes(trimestre)) return "";
  if (![1, 2, 3].includes(espacioNumero)) return "";

  return `trim${trimestre}Espacio${espacioNumero}`;
}

function campoResultadoTrimestre(trimestre) {
  if (![1, 2, 3].includes(trimestre)) return "";
  return `trim${trimestre}Resultado`;
}

function actualizarEstadoVisualEdicion() {
  if (!seccionCalificacionesTallerDocente) return;

  const estado = seccionCalificacionesTallerDocente.querySelector(
    ".estado-calificaciones-solo-lectura",
  );

  const descripcion = seccionCalificacionesTallerDocente.querySelector(
    ".encabezado-listado p",
  );

  const puedeEditar =
    trimestreEditableCalificacionesTallerDocente > 0 &&
    accesoEditableCalificacionesTallerDocente &&
    espacioEditableNumeroCalificacionesTallerDocente > 0;

  if (estado) {
    estado.classList.toggle("edicion-habilitada", Boolean(puedeEditar));
    estado.innerHTML = puedeEditar
      ? '<i class="fa-solid fa-pen-to-square"></i> Carga habilitada'
      : '<i class="fa-solid fa-eye"></i> Sólo lectura';
  }

  if (descripcion) {
    descripcion.textContent = puedeEditar
      ? `Podés consultar el registro completo y cargar las notas de tu Taller durante el ${nombreTrimestre(
          trimestreEditableCalificacionesTallerDocente,
        )}. Las demás columnas permanecen en modo lectura.`
      : "Consultá las calificaciones de los cursos de Taller que tenés asignados. Fuera del período habilitado, la información se muestra sólo en modo lectura.";
  }
}

async function prepararEdicionRegistro(registro) {
  configuracionPeriodosCalificacionesTallerDocente = null;
  trimestreEditableCalificacionesTallerDocente = 0;
  accesoEditableCalificacionesTallerDocente = null;
  espacioEditableNumeroCalificacionesTallerDocente = 0;
  cambiosPendientesCalificacionesTallerDocente.clear();

  const cicloId = String(
    registro.cicloLectivoDocId || registro.cicloLectivo || "",
  ).trim();

  if (!cicloId) {
    actualizarEstadoVisualEdicion();
    return;
  }

  try {
    const documentoPeriodos = await getDoc(
      doc(db, "configuracion_periodos", cicloId),
    );

    if (documentoPeriodos.exists()) {
      configuracionPeriodosCalificacionesTallerDocente =
        documentoPeriodos.data();

      trimestreEditableCalificacionesTallerDocente =
        determinarTrimestreEditable(
          configuracionPeriodosCalificacionesTallerDocente,
        );
    }
  } catch (error) {
    console.error(
      "No se pudo consultar la configuración de períodos para calificaciones:",
      error,
    );
  }

  accesoEditableCalificacionesTallerDocente =
    obtenerAccesoEditableRegistro(registro);

  espacioEditableNumeroCalificacionesTallerDocente =
    accesoEditableCalificacionesTallerDocente?.espacioNumero || 0;

  actualizarEstadoVisualEdicion();
}

function renderizarResumen(registro, cantidadVisible) {
  if (!resumenCalificacionesTallerDocente) return;

  const totalAlumnos = Object.keys(registro.alumnos || {}).length;
  const puedeEditar =
    trimestreEditableCalificacionesTallerDocente > 0 &&
    accesoEditableCalificacionesTallerDocente &&
    espacioEditableNumeroCalificacionesTallerDocente > 0;

  const nombreEspacioEditable = puedeEditar
    ? registro[
        `espacio${espacioEditableNumeroCalificacionesTallerDocente}Nombre`
      ] || "Taller"
    : "";

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

    ${
      puedeEditar
        ? `
          <span class="chip-calificaciones-taller-docente chip-edicion-calificaciones-taller">
            <strong>Carga:</strong>
            ${escaparHtml(nombreTrimestre(trimestreEditableCalificacionesTallerDocente))} ·
            ${escaparHtml(abreviarNombreTaller(nombreEspacioEditable))}
          </span>
        `
        : ""
    }
  `;

  resumenCalificacionesTallerDocente.hidden = false;
}

function abreviarNombreTaller(nombre) {
  const original = String(nombre || "").trim();

  if (!original) return "—";

  const normalizado = original
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizado.includes("DOCUMENTOS COMERCIALES")) return "DOC";
  if (normalizado.includes("ORGANIZACION DE LA EMPRESA")) return "ORG";
  if (normalizado.includes("ELECTRONICA")) return "ELK";
  if (normalizado.includes("ELECTRICIDAD")) return "ELE";
  if (normalizado.includes("INFORMATICA")) return "INF";

  return original.toUpperCase();
}

function valorPendienteAlumno(alumnoId, valorOriginal) {
  if (!cambiosPendientesCalificacionesTallerDocente.has(alumnoId)) {
    return valorOriginal;
  }

  return cambiosPendientesCalificacionesTallerDocente.get(alumnoId);
}

function opcionesNota(valorSeleccionado) {
  const valor = String(valorSeleccionado ?? "");

  return ["", ...Array.from({ length: 10 }, (_, indice) => String(indice + 1))]
    .map(
      (opcion) => `
        <option value="${opcion}" ${opcion === valor ? "selected" : ""}>
          ${opcion || "—"}
        </option>
      `,
    )
    .join("");
}

function celdaNota(registro, trimestre, espacioNumero, alumnoId) {
  const campo = campoNotaTrimestre(trimestre, espacioNumero);
  const valorOriginal = obtenerValorMapa(registro[campo], alumnoId);

  const editable =
    trimestre === trimestreEditableCalificacionesTallerDocente &&
    espacioNumero === espacioEditableNumeroCalificacionesTallerDocente &&
    accesoEditableCalificacionesTallerDocente;

  if (!editable) {
    return `<td>${formatearNota(valorOriginal)}</td>`;
  }

  const valorVisible = valorPendienteAlumno(alumnoId, valorOriginal);

  return `
    <td class="celda-nota-editable-taller">
      <select
        class="select-nota-taller-docente"
        data-alumno-id="${escaparHtml(alumnoId)}"
        aria-label="Calificación de Taller"
      >
        ${opcionesNota(valorVisible)}
      </select>
    </td>
  `;
}

function claseEncabezadoTaller(trimestre, espacioNumero) {
  const editable =
    trimestre === trimestreEditableCalificacionesTallerDocente &&
    espacioNumero === espacioEditableNumeroCalificacionesTallerDocente &&
    accesoEditableCalificacionesTallerDocente;

  return editable
    ? "encabezado-taller encabezado-taller-editable"
    : "encabezado-taller";
}

function actualizarBotonGuardar() {
  const boton = document.getElementById(
    "btnGuardarCalificacionesTallerDocente",
  );

  if (!boton) return;

  const cantidad = cambiosPendientesCalificacionesTallerDocente.size;

  boton.disabled = guardandoCalificacionesTallerDocente || cantidad === 0;
  boton.innerHTML = guardandoCalificacionesTallerDocente
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...'
    : `<i class="fa-solid fa-floppy-disk"></i> Guardar cambios${
        cantidad ? ` (${cantidad})` : ""
      }`;
}

function registrarCambioNota(evento) {
  const select = evento.currentTarget;
  const alumnoId = String(select.dataset.alumnoId || "");

  if (!alumnoId || !registroCalificacionesTallerDocente) return;

  const campo = campoNotaTrimestre(
    trimestreEditableCalificacionesTallerDocente,
    espacioEditableNumeroCalificacionesTallerDocente,
  );

  const original = obtenerValorMapa(
    registroCalificacionesTallerDocente[campo],
    alumnoId,
  );

  const nuevo = String(select.value || "");
  const originalNormalizado = String(original ?? "");

  if (nuevo === originalNormalizado) {
    cambiosPendientesCalificacionesTallerDocente.delete(alumnoId);
  } else {
    cambiosPendientesCalificacionesTallerDocente.set(
      alumnoId,
      nuevo === "" ? "" : Number(nuevo),
    );
  }

  select.classList.toggle(
    "nota-modificada",
    cambiosPendientesCalificacionesTallerDocente.has(alumnoId),
  );

  actualizarBotonGuardar();
}

function conectarControlesEdicion() {
  document.querySelectorAll(".select-nota-taller-docente").forEach((select) => {
    select.addEventListener("change", registrarCambioNota);

    const alumnoId = String(select.dataset.alumnoId || "");
    select.classList.toggle(
      "nota-modificada",
      cambiosPendientesCalificacionesTallerDocente.has(alumnoId),
    );
  });

  const boton = document.getElementById(
    "btnGuardarCalificacionesTallerDocente",
  );

  if (boton) {
    boton.addEventListener("click", guardarCambiosPendientes);
  }

  actualizarBotonGuardar();
}

function notaNumericaDesdeRegistro(
  registro,
  trimestre,
  espacioNumero,
  alumnoId,
) {
  const campo = campoNotaTrimestre(trimestre, espacioNumero);
  const valor = obtenerValorMapa(registro[campo], alumnoId);
  const numero = Number(valor);

  return Number.isInteger(numero) && numero >= 1 && numero <= 10
    ? numero
    : null;
}

function calcularResultadoAutomatico(valores) {
  if (valores.some((valor) => valor === null)) return null;

  if (valores.some((valor) => valor < 6)) {
    return Math.min(...valores.filter((valor) => valor < 6));
  }

  const promedio = valores.reduce((suma, valor) => suma + valor, 0) / 3;
  const parteDecimal = promedio - Math.floor(promedio);

  return parteDecimal > 0.5 ? Math.ceil(promedio) : Math.floor(promedio);
}

function entradaResultadoExistente(registro, trimestre, alumnoId) {
  const campo = campoResultadoTrimestre(trimestre);
  const mapa = registro[campo] || {};
  return mapa[alumnoId] ?? null;
}

function actualizarRegistroLocalDespuesDeGuardar(
  registro,
  alumnoId,
  valor,
  resultado,
  conservarManual,
  correo,
) {
  const trimestre = trimestreEditableCalificacionesTallerDocente;
  const campoNota = campoNotaTrimestre(
    trimestre,
    espacioEditableNumeroCalificacionesTallerDocente,
  );
  const campoResultado = campoResultadoTrimestre(trimestre);

  registro[campoNota] ||= {};
  registro[campoResultado] ||= {};

  registro[campoNota][alumnoId] =
    valor === ""
      ? null
      : {
          valor: Number(valor),
          por: correo,
          en: new Date(),
        };

  if (!conservarManual) {
    registro[campoResultado][alumnoId] =
      resultado === null
        ? null
        : {
            valor: resultado,
            modo: "AUTO",
            por: correo,
            en: new Date(),
          };
  }
}

async function guardarCambiosPendientes() {
  if (
    guardandoCalificacionesTallerDocente ||
    !registroCalificacionesTallerDocente ||
    !usuarioCalificacionesTallerDocente ||
    !accesoEditableCalificacionesTallerDocente ||
    !trimestreEditableCalificacionesTallerDocente ||
    !espacioEditableNumeroCalificacionesTallerDocente ||
    cambiosPendientesCalificacionesTallerDocente.size === 0
  ) {
    return;
  }

  guardandoCalificacionesTallerDocente = true;
  actualizarBotonGuardar();
  mostrarMensaje("Guardando calificaciones...");

  const correo = normalizarCorreo(usuarioCalificacionesTallerDocente.email);
  const referencia = doc(
    db,
    "calificaciones_taller",
    registroCalificacionesTallerDocente.id,
  );

  let guardadas = 0;

  try {
    const documentoActual = await getDoc(referencia);

    if (!documentoActual.exists()) {
      throw new Error("El registro ya no existe.");
    }

    registroCalificacionesTallerDocente = {
      id: documentoActual.id,
      ...documentoActual.data(),
    };

    const pendientes = Array.from(
      cambiosPendientesCalificacionesTallerDocente.entries(),
    );

    for (const [alumnoId, valorPendiente] of pendientes) {
      const trimestre = trimestreEditableCalificacionesTallerDocente;
      const espacioNumero = espacioEditableNumeroCalificacionesTallerDocente;
      const campoNota = campoNotaTrimestre(trimestre, espacioNumero);
      const campoResultado = campoResultadoTrimestre(trimestre);
      const espacioId = String(
        registroCalificacionesTallerDocente[`espacio${espacioNumero}Id`] || "",
      ).trim();

      const valor = valorPendiente === "" ? "" : Number(valorPendiente);

      if (
        valor !== "" &&
        (!Number.isInteger(valor) || valor < 1 || valor > 10)
      ) {
        throw new Error("Se encontró una calificación fuera del rango 1 a 10.");
      }

      const valores = [1, 2, 3].map((numeroEspacio) => {
        if (numeroEspacio === espacioNumero) {
          return valor === "" ? null : valor;
        }

        return notaNumericaDesdeRegistro(
          registroCalificacionesTallerDocente,
          trimestre,
          numeroEspacio,
          alumnoId,
        );
      });

      const resultadoAutomatico = calcularResultadoAutomatico(valores);
      const resultadoExistente = entradaResultadoExistente(
        registroCalificacionesTallerDocente,
        trimestre,
        alumnoId,
      );

      const conservarManual =
        resultadoAutomatico !== null &&
        resultadoExistente &&
        typeof resultadoExistente === "object" &&
        resultadoExistente.modo === "MANUAL";

      const marcaTiempoNota = serverTimestamp();
      const marcaTiempoOperacion = serverTimestamp();
      const marcaTiempoActualizacion = serverTimestamp();

      const entradaNota =
        valor === ""
          ? null
          : {
              valor,
              por: correo,
              en: marcaTiempoNota,
            };

      const operacion = {
        tipo: "NOTA_ESPACIO",
        alumnoId,
        trimestre,
        espacioId,
        reemplazoId:
          accesoEditableCalificacionesTallerDocente.origen === "REEMPLAZO"
            ? String(
                accesoEditableCalificacionesTallerDocente.reemplazoId || "",
              )
            : "",
        por: correo,
        en: marcaTiempoOperacion,
      };

      const argumentos = [
        referencia,
        new FieldPath(campoNota, alumnoId),
        entradaNota,
      ];

      if (!conservarManual) {
        const entradaResultado =
          resultadoAutomatico === null
            ? null
            : {
                valor: resultadoAutomatico,
                modo: "AUTO",
                por: correo,
                en: serverTimestamp(),
              };

        argumentos.push(
          new FieldPath(campoResultado, alumnoId),
          entradaResultado,
        );
      }

      argumentos.push(
        "ultimaOperacion",
        operacion,
        "actualizadoEn",
        marcaTiempoActualizacion,
        "actualizadoPor",
        correo,
      );

      await updateDoc(...argumentos);

      actualizarRegistroLocalDespuesDeGuardar(
        registroCalificacionesTallerDocente,
        alumnoId,
        valor,
        resultadoAutomatico,
        conservarManual,
        correo,
      );

      cambiosPendientesCalificacionesTallerDocente.delete(alumnoId);
      guardadas += 1;
    }

    renderizarTabla(registroCalificacionesTallerDocente);

    mostrarMensaje(
      `${guardadas} calificación${guardadas === 1 ? "" : "es"} guardada${
        guardadas === 1 ? "" : "s"
      } correctamente.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al guardar calificaciones de Taller:", error);

    renderizarTabla(registroCalificacionesTallerDocente);

    if (error?.code === "permission-denied") {
      mostrarMensaje(
        guardadas
          ? `Se guardaron ${guardadas} calificaciones antes de que Firebase rechazara la siguiente operación. Revisá el período o la autorización del docente.`
          : "Firebase rechazó la escritura. Revisá que el período esté vigente y que el docente tenga asignado ese Taller.",
        "error",
      );
    } else {
      mostrarMensaje(
        guardadas
          ? `Se guardaron ${guardadas} calificaciones antes de producirse un error. Las restantes quedaron pendientes.`
          : error?.message || "No se pudieron guardar las calificaciones.",
        "error",
      );
    }
  } finally {
    guardandoCalificacionesTallerDocente = false;
    actualizarBotonGuardar();
  }
}

function renderizarTabla(registro) {
  if (!vistaCalificacionesTallerDocente) return;

  const alumnos = alumnosFiltrados(registro);

  renderizarResumen(registro, alumnos.length);

  if (!alumnos.length) {
    mostrarVistaInformativa("No hay estudiantes para el grupo seleccionado.");
    return;
  }

  const e1Completo = registro.espacio1Nombre || "Taller 1";
  const e2Completo = registro.espacio2Nombre || "Taller 2";
  const e3Completo = registro.espacio3Nombre || "Taller 3";

  const e1 = escaparHtml(abreviarNombreTaller(e1Completo));
  const e2 = escaparHtml(abreviarNombreTaller(e2Completo));
  const e3 = escaparHtml(abreviarNombreTaller(e3Completo));

  const e1Titulo = escaparHtml(e1Completo);
  const e2Titulo = escaparHtml(e2Completo);
  const e3Titulo = escaparHtml(e3Completo);

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

          ${celdaNota(registro, 1, 1, id)}
          ${celdaNota(registro, 1, 2, id)}
          ${celdaNota(registro, 1, 3, id)}
          <td class="nota-trim">${formatearNota(
            obtenerValorMapa(registro.trim1Resultado, id),
          )}</td>

          ${celdaNota(registro, 2, 1, id)}
          ${celdaNota(registro, 2, 2, id)}
          ${celdaNota(registro, 2, 3, id)}
          <td class="nota-trim">${formatearNota(
            obtenerValorMapa(registro.trim2Resultado, id),
          )}</td>

          ${celdaNota(registro, 3, 1, id)}
          ${celdaNota(registro, 3, 2, id)}
          ${celdaNota(registro, 3, 3, id)}
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

  const puedeEditar =
    trimestreEditableCalificacionesTallerDocente > 0 &&
    accesoEditableCalificacionesTallerDocente &&
    espacioEditableNumeroCalificacionesTallerDocente > 0;

  vistaCalificacionesTallerDocente.innerHTML = `
    <div class="tabla-calificaciones-taller-contenedor">
      <table class="tabla-calificaciones-taller-docente">
        <thead>
          <tr>
            <th rowspan="2">N°</th>
            <th rowspan="2">DNI</th>
            <th rowspan="2">Estudiante</th>
            <th rowspan="2">Grupo</th>
            <th colspan="4">1ER TRIMESTRE</th>
            <th colspan="4">2DO TRIMESTRE</th>
            <th colspan="4">3ER TRIMESTRE</th>
            <th rowspan="2">Calif. Final</th>
            <th rowspan="2">Diciembre</th>
            <th rowspan="2">Febrero</th>
          </tr>
          <tr>
            <th class="${claseEncabezadoTaller(1, 1)}" title="${e1Titulo}">${e1}</th>
            <th class="${claseEncabezadoTaller(1, 2)}" title="${e2Titulo}">${e2}</th>
            <th class="${claseEncabezadoTaller(1, 3)}" title="${e3Titulo}">${e3}</th>
            <th>TRIM</th>

            <th class="${claseEncabezadoTaller(2, 1)}" title="${e1Titulo}">${e1}</th>
            <th class="${claseEncabezadoTaller(2, 2)}" title="${e2Titulo}">${e2}</th>
            <th class="${claseEncabezadoTaller(2, 3)}" title="${e3Titulo}">${e3}</th>
            <th>TRIM</th>

            <th class="${claseEncabezadoTaller(3, 1)}" title="${e1Titulo}">${e1}</th>
            <th class="${claseEncabezadoTaller(3, 2)}" title="${e2Titulo}">${e2}</th>
            <th class="${claseEncabezadoTaller(3, 3)}" title="${e3Titulo}">${e3}</th>
            <th>TRIM</th>
          </tr>
        </thead>

        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>

    ${
      puedeEditar
        ? `
          <div class="acciones-calificaciones-taller-docente">
            <div class="ayuda-edicion-calificaciones-taller">
              <i class="fa-solid fa-circle-info"></i>
              Sólo se guarda la columna de tu Taller en el trimestre vigente.
            </div>

            <button
              id="btnGuardarCalificacionesTallerDocente"
              class="btn-guardar-calificaciones-taller-docente"
              type="button"
              disabled
            >
              <i class="fa-solid fa-floppy-disk"></i>
              Guardar cambios
            </button>
          </div>
        `
        : ""
    }
  `;

  conectarControlesEdicion();
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
  configuracionPeriodosCalificacionesTallerDocente = null;
  trimestreEditableCalificacionesTallerDocente = 0;
  accesoEditableCalificacionesTallerDocente = null;
  espacioEditableNumeroCalificacionesTallerDocente = 0;
  cambiosPendientesCalificacionesTallerDocente.clear();
  resumenCalificacionesTallerDocente.hidden = true;
  resumenCalificacionesTallerDocente.innerHTML = "";
  grupoCalificacionesTallerDocente.value = "TODOS";
  grupoCalificacionesTallerDocente.disabled = true;
  actualizarEstadoVisualEdicion();

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

    await prepararEdicionRegistro(registroCalificacionesTallerDocente);

    grupoCalificacionesTallerDocente.disabled = false;
    renderizarTabla(registroCalificacionesTallerDocente);

    if (
      trimestreEditableCalificacionesTallerDocente > 0 &&
      accesoEditableCalificacionesTallerDocente &&
      espacioEditableNumeroCalificacionesTallerDocente > 0
    ) {
      const nombreEspacio =
        registroCalificacionesTallerDocente[
          `espacio${espacioEditableNumeroCalificacionesTallerDocente}Nombre`
        ] || "tu Taller";

      mostrarMensaje(
        `Registro cargado correctamente. Podés cargar ${abreviarNombreTaller(
          nombreEspacio,
        )} durante el ${nombreTrimestre(
          trimestreEditableCalificacionesTallerDocente,
        )}.`,
        "ok",
      );
    } else {
      mostrarMensaje(
        "Registro cargado correctamente. Actualmente se encuentra en modo consulta.",
        "ok",
      );
    }
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
        "Firebase rechazó la lectura del registro. Revisá la asignación o el reemplazo asociado al curso.",
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

actualizarEstadoVisualEdicion();

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

  usuarioCalificacionesTallerDocente = user;
  prepararModulo(normalizarCorreo(user.email));
});
