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
  query,
  where,
  doc,
  getDoc,
  setDoc,
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

const fechaSiraDocente = document.getElementById("fechaSiraDocente");
const claseSiraDocente = document.getElementById("claseSiraDocente");
const btnCargarAsistenciaSira = document.getElementById(
  "btnCargarAsistenciaSira",
);
const infoClaseSiraDocente = document.getElementById("infoClaseSiraDocente");
const vistaAsistenciaSiraDocente = document.getElementById(
  "vistaAsistenciaSiraDocente",
);
const btnRegistrarAsistenciaSira = document.getElementById(
  "btnRegistrarAsistenciaSira",
);
const mensajeSiraDocente = document.getElementById("mensajeSiraDocente");

let usuarioSiraActual = null;
let clasesSiraDisponibles = [];
let claseSiraSeleccionada = null;
let estudiantesSiraActuales = [];
let asistenciaSiraActual = null;

const DIAS_SIRA = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

function normalizarCorreoSira(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function obtenerDiaSiraDesdeFecha(fechaTexto) {
  if (!fechaTexto) return "";

  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return DIAS_SIRA[fecha.getDay()] || "";
}

function mostrarMensajeSira(texto, tipo = "") {
  if (!mensajeSiraDocente) return;

  mensajeSiraDocente.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${texto}
      </span>
    `
    : "";
}

function limpiarVistaSira() {
  if (claseSiraDocente) {
    claseSiraDocente.innerHTML = `
      <option value="">Primero seleccioná una fecha</option>
    `;
    claseSiraDocente.disabled = true;
  }

  if (vistaAsistenciaSiraDocente) {
    vistaAsistenciaSiraDocente.innerHTML = `
      <p class="mensaje-formulario">
        Todavía no se cargó ninguna clase para registrar asistencia.
      </p>
    `;
  }

  if (btnRegistrarAsistenciaSira) {
    btnRegistrarAsistenciaSira.hidden = true;
  }

  clasesSiraDisponibles = [];
  claseSiraSeleccionada = null;
  estudiantesSiraActuales = [];
}

function obtenerEtiquetaTipoSira(tipoHorario) {
  const tipo = String(tipoHorario || "")
    .trim()
    .toUpperCase();

  if (tipo === "TALLER") return "Taller";
  if (tipo === "EDUCACION_FISICA") return "Educación Física";

  return tipo || "";
}

function armarTextoClaseSira(clase) {
  const tipo = String(clase.tipoHorario || "")
    .trim()
    .toUpperCase();

  const partes = [
    clase.cursoNombre ||
      `${clase.cursoAnio || ""}º ${clase.cursoDivision || ""}`,
  ];

  if (tipo === "TALLER") {
    partes.push(clase.grupoTaller || "Grupo sin definir");
  }

  partes.push(clase.espacioCurricular || obtenerEtiquetaTipoSira(tipo));

  if (clase.horaInicio || clase.horaFin) {
    partes.push(`${clase.horaInicio || "-"} a ${clase.horaFin || "-"}`);
  }

  return partes.filter(Boolean).join(" · ");
}

function renderizarClasesSira(clases) {
  if (!claseSiraDocente) return;

  if (!clases.length) {
    claseSiraDocente.innerHTML = `
      <option value="">Sin clases disponibles</option>
    `;
    claseSiraDocente.disabled = true;

    if (infoClaseSiraDocente) {
      infoClaseSiraDocente.innerHTML = `
        No tenés clases de Taller o Educación Física asignadas para la fecha seleccionada.
      `;
    }

    return;
  }

  claseSiraDocente.innerHTML = `
    <option value="">Seleccionar clase</option>
    ${clases
      .map(
        (clase, index) => `
          <option value="${index}">
            ${armarTextoClaseSira(clase)}
          </option>
        `,
      )
      .join("")}
  `;

  claseSiraDocente.disabled = false;

  if (infoClaseSiraDocente) {
    infoClaseSiraDocente.innerHTML = `
      Se encontraron ${clases.length} clase(s) disponible(s) para registrar asistencia.
    `;
  }
}

async function cargarClasesSiraPorFecha() {
  limpiarVistaSira();

  if (!usuarioSiraActual) {
    mostrarMensajeSira(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );
    return;
  }

  const fechaSeleccionada = fechaSiraDocente?.value || "";

  if (!fechaSeleccionada) {
    if (infoClaseSiraDocente) {
      infoClaseSiraDocente.innerHTML =
        "Seleccioná una fecha para consultar tus clases disponibles.";
    }

    return;
  }

  const diaSeleccionado = obtenerDiaSiraDesdeFecha(fechaSeleccionada);
  const correoDocente = normalizarCorreoSira(usuarioSiraActual.email);

  if (infoClaseSiraDocente) {
    infoClaseSiraDocente.innerHTML = "Consultando clases disponibles...";
  }

  mostrarMensajeSira("");

  try {
    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("docenteCorreo", "==", correoDocente),
    );

    const resultado = await getDocs(consultaHorarios);

    const clases = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      const diaHorario = String(datos.dia || "")
        .trim()
        .toUpperCase();

      const esSira =
        tipoHorario === "TALLER" || tipoHorario === "EDUCACION_FISICA";

      if (!esSira) return;
      if (diaHorario !== diaSeleccionado) return;

      clases.push({
        id: documento.id,
        ...datos,
      });
    });

    clases.sort((a, b) => {
      const horaA = String(a.horaInicio || "");
      const horaB = String(b.horaInicio || "");

      if (horaA !== horaB) {
        return horaA.localeCompare(horaB);
      }

      return String(a.cursoNombre || "").localeCompare(
        String(b.cursoNombre || ""),
        "es",
      );
    });

    clasesSiraDisponibles = clases;

    renderizarClasesSira(clases);
  } catch (error) {
    console.error("Error al cargar clases Si.R.A.:", error);

    if (infoClaseSiraDocente) {
      infoClaseSiraDocente.innerHTML = `
        No se pudieron consultar las clases disponibles.
      `;
    }

    mostrarMensajeSira(
      error.message || "No se pudieron cargar tus clases disponibles.",
      "error",
    );
  }
}

function obtenerClaseSeleccionadaSira() {
  const indice = claseSiraDocente?.value;

  if (indice === "") return null;

  return clasesSiraDisponibles[Number(indice)] || null;
}

function renderizarEncabezadoClaseSira(clase) {
  const tipo = String(clase.tipoHorario || "")
    .trim()
    .toUpperCase();

  return `
    <div class="sira-clase-seleccionada">
      <h3>${armarTextoClaseSira(clase)}</h3>

      <p>
        <strong>Docente:</strong>
        ${clase.docenteNombre || usuarioSiraActual?.displayName || "-"}
      </p>

      <p>
        <strong>Tipo:</strong>
        ${obtenerEtiquetaTipoSira(clase.tipoHorario)}
        ${
          tipo === "TALLER"
            ? ` · <strong>Grupo:</strong> ${clase.grupoTaller || "-"}`
            : " · <strong>Curso completo</strong>"
        }
      </p>
    </div>
  `;
}

function renderizarListaEstudiantesSira(clase, estudiantes) {
  if (!vistaAsistenciaSiraDocente) return;

  const tipo = String(clase.tipoHorario || "")
    .trim()
    .toUpperCase();

  if (!estudiantes.length) {
    vistaAsistenciaSiraDocente.innerHTML = `
      ${renderizarEncabezadoClaseSira(clase)}

      <p class="mensaje-formulario mensaje-error">
        No se encontraron estudiantes para esta clase.
      </p>
    `;

    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.hidden = true;
    }

    return;
  }

  const htmlModoLluvia =
    tipo === "EDUCACION_FISICA"
      ? `
        <div class="sira-modo-lluvia">
          <label>
            <input type="checkbox" id="modoLluviaSiraDocente" />
            🌧️ <strong>Activar Modo Lluvia</strong>
            <span>
              Autocompleta “Día de lluvia” en estudiantes ausentes sin observación.
            </span>
          </label>
        </div>
      `
      : "";

  const htmlEstudiantes = estudiantes
    .map((estudiante, index) => {
      const registroGuardado = obtenerEstadoGuardadoAlumnoSira(
        asistenciaSiraActual,
        estudiante,
      );

      const estadoGuardado = registroGuardado?.estado || "PRESENTE";
      const observacionGuardada = registroGuardado?.observacion || "";

      return `
      <div class="sira-estudiante" data-indice="${index}">
        <div class="sira-estudiante-nombre">
          <strong>${estudiante.nombreCompleto || "-"}</strong>
          ${
            estudiante.grupoTaller
              ? `<small>${estudiante.grupoTaller}</small>`
              : ""
          }
        </div>

        <div class="sira-estudiante-controles">
          <select id="estadoSira-${index}">
            <option value="PRESENTE" ${
              estadoGuardado === "PRESENTE" ? "selected" : ""
            }>P</option>

            <option value="AUSENTE" ${
              estadoGuardado === "AUSENTE" ? "selected" : ""
            }>A</option>

            <option value="TARDE" ${
              estadoGuardado === "TARDE" ? "selected" : ""
            }>T</option>
          </select>

          <input
            id="observacionSira-${index}"
            type="text"
            placeholder="Observación"
            value="${observacionGuardada}"
          />
        </div>
      </div>
    `;
    })
    .join("");

  vistaAsistenciaSiraDocente.innerHTML = `
  ${renderizarEncabezadoClaseSira(clase)}

  ${
    asistenciaSiraActual
      ? `
        <div class="mensaje-formulario">
          ⚠️ Esta asistencia ya estaba registrada. Podés editarla y volver a guardar.
        </div>
      `
      : ""
  }

  ${htmlModoLluvia}

  <div class="sira-lista-estudiantes">
    ${htmlEstudiantes}
  </div>
`;

  if (btnRegistrarAsistenciaSira) {
    btnRegistrarAsistenciaSira.hidden = false;
  }
}

async function cargarEstudiantesParaClaseSira() {
  const clase = obtenerClaseSeleccionadaSira();

  if (!clase) {
    if (vistaAsistenciaSiraDocente) {
      vistaAsistenciaSiraDocente.innerHTML = `
        <p class="mensaje-formulario">
          Seleccioná una clase disponible para continuar.
        </p>
      `;
    }

    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.hidden = true;
    }

    return;
  }

  claseSiraSeleccionada = clase;
  estudiantesSiraActuales = [];
  asistenciaSiraActual = null;

  const tipo = String(clase.tipoHorario || "")
    .trim()
    .toUpperCase();

  if (vistaAsistenciaSiraDocente) {
    vistaAsistenciaSiraDocente.innerHTML = `
      ${renderizarEncabezadoClaseSira(clase)}

      <p class="mensaje-formulario">
        Cargando estudiantes...
      </p>
    `;
  }

  mostrarMensajeSira("");

  try {
    asistenciaSiraActual = await obtenerAsistenciaExistenteSira(clase);
    let consultaEstudiantes = null;

    if (tipo === "TALLER") {
      consultaEstudiantes = query(
        collection(db, "usuarios"),
        where("rol", "==", "ALUMNO"),
        where("estado", "==", "ACTIVO"),
        where("tipoVinculo", "==", "CURSANDO"),
        where("cursoId", "==", clase.cursoId),
        where("grupoTaller", "==", clase.grupoTaller),
      );
    }

    if (tipo === "EDUCACION_FISICA") {
      consultaEstudiantes = query(
        collection(db, "usuarios"),
        where("rol", "==", "ALUMNO"),
        where("estado", "==", "ACTIVO"),
        where("tipoVinculo", "==", "CURSANDO"),
        where("cursoId", "==", clase.cursoId),
      );
    }

    if (!consultaEstudiantes) {
      throw new Error(
        "El tipo de clase seleccionado no es válido para Si.R.A.",
      );
    }

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
      ),
    );

    estudiantesSiraActuales = estudiantes;

    renderizarListaEstudiantesSira(clase, estudiantes);

    mostrarMensajeSira(
      "Estudiantes cargados correctamente. En el próximo paso activamos el guardado.",
    );
  } catch (error) {
    console.error("Error al cargar estudiantes Si.R.A.:", error);

    if (vistaAsistenciaSiraDocente) {
      vistaAsistenciaSiraDocente.innerHTML = `
        ${renderizarEncabezadoClaseSira(clase)}

        <p class="mensaje-formulario mensaje-error">
          No se pudieron cargar los estudiantes.
        </p>
      `;
    }

    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.hidden = true;
    }

    mostrarMensajeSira(
      error.message || "No se pudieron cargar los estudiantes.",
      "error",
    );
  }
}

function limpiarTextoIdSira(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obtenerIdAsistenciaSira(clase) {
  const fecha = fechaSiraDocente?.value || "";

  const partes = [
    fecha,
    clase.tipoHorario,
    clase.cursoId,
    clase.grupoTaller || "curso-completo",
    clase.id,
    usuarioSiraActual?.email || "",
  ];

  return partes.map(limpiarTextoIdSira).filter(Boolean).join("_");
}

async function obtenerAsistenciaExistenteSira(clase) {
  const idAsistencia = obtenerIdAsistenciaSira(clase);
  const referencia = doc(db, "asistencias_clases", idAsistencia);
  const documento = await getDoc(referencia);

  if (!documento.exists()) {
    return null;
  }

  return {
    id: documento.id,
    ...documento.data(),
  };
}

function obtenerEstadoGuardadoAlumnoSira(asistencia, estudiante) {
  if (!asistencia || !Array.isArray(asistencia.registros)) {
    return null;
  }

  return asistencia.registros.find((registro) => {
    return (
      String(registro.alumnoCorreo || "").toLowerCase() ===
      String(estudiante.correo || "").toLowerCase()
    );
  });
}

async function guardarAsistenciaSira() {
  if (!claseSiraSeleccionada) {
    mostrarMensajeSira("Primero seleccioná y cargá una clase.", "error");
    return;
  }

  if (!estudiantesSiraActuales.length) {
    mostrarMensajeSira("No hay estudiantes cargados para guardar.", "error");
    return;
  }

  const fecha = fechaSiraDocente?.value || "";

  if (!fecha) {
    mostrarMensajeSira("Seleccioná una fecha válida.", "error");
    return;
  }

  const tipo = String(claseSiraSeleccionada.tipoHorario || "")
    .trim()
    .toUpperCase();

  const modoLluvia =
    tipo === "EDUCACION_FISICA" &&
    document.getElementById("modoLluviaSiraDocente")?.checked === true;

  const registros = estudiantesSiraActuales.map((estudiante, index) => {
    const estado =
      document.getElementById(`estadoSira-${index}`)?.value || "PRESENTE";

    let observacion =
      document.getElementById(`observacionSira-${index}`)?.value || "";

    observacion = observacion.trim();

    if (modoLluvia && estado === "AUSENTE" && !observacion) {
      observacion = "Día de lluvia";
    }

    return {
      alumnoCorreo: estudiante.correo || "",
      alumnoNombre: estudiante.nombreCompleto || "",
      alumnoId: estudiante.id || "",
      alumnoDni: estudiante.dni || "",
      grupoTaller: estudiante.grupoTaller || "",
      estado,
      observacion,
    };
  });

  const idAsistencia = obtenerIdAsistenciaSira(claseSiraSeleccionada);
  const referencia = doc(db, "asistencias_clases", idAsistencia);

  const datosAsistencia = {
    fecha,
    dia: obtenerDiaSiraDesdeFecha(fecha),

    tipoHorario: tipo,
    espacioCurricular: claseSiraSeleccionada.espacioCurricular || "",
    espacioId: claseSiraSeleccionada.espacioId || "",

    cursoId: claseSiraSeleccionada.cursoId || "",
    cursoAnio: claseSiraSeleccionada.cursoAnio || "",
    cursoDivision: claseSiraSeleccionada.cursoDivision || "",
    cursoNombre: claseSiraSeleccionada.cursoNombre || "",

    grupoTaller: claseSiraSeleccionada.grupoTaller || "",
    horarioId: claseSiraSeleccionada.id || "",
    horarioTexto:
      claseSiraSeleccionada.horarioTexto ||
      `${claseSiraSeleccionada.horaInicio || "-"} a ${
        claseSiraSeleccionada.horaFin || "-"
      }`,
    horaInicio: claseSiraSeleccionada.horaInicio || "",
    horaFin: claseSiraSeleccionada.horaFin || "",

    docenteCorreo: normalizarCorreoSira(usuarioSiraActual.email),
    docenteNombre:
      claseSiraSeleccionada.docenteNombre ||
      usuarioSiraActual.displayName ||
      "",

    modoLluvia,
    estado: "ACTIVA",
    registros,

    actualizadoEn: serverTimestamp(),
  };

  if (!asistenciaSiraActual) {
    datosAsistencia.creadoEn = serverTimestamp();
  }

  if (btnRegistrarAsistenciaSira) {
    btnRegistrarAsistenciaSira.disabled = true;
    btnRegistrarAsistenciaSira.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Guardando...
    `;
  }

  try {
    await setDoc(referencia, datosAsistencia, { merge: true });

    asistenciaSiraActual = {
      id: idAsistencia,
      ...datosAsistencia,
    };

    mostrarMensajeSira("Asistencia registrada correctamente.");

    if (window.Swal) {
      await Swal.fire({
        icon: "success",
        title: "Asistencia registrada",
        text: "El registro de asistencia se guardó correctamente.",
        confirmButtonText: "Aceptar",
      });
    }

    claseSiraSeleccionada = null;
    estudiantesSiraActuales = [];
    asistenciaSiraActual = null;

    if (claseSiraDocente) {
      claseSiraDocente.value = "";
    }

    if (vistaAsistenciaSiraDocente) {
      vistaAsistenciaSiraDocente.innerHTML = `
        <p class="mensaje-formulario">
          Asistencia registrada correctamente. Seleccioná otra clase disponible
          para continuar.
        </p>
      `;
    }

    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.hidden = true;
    }
  } catch (error) {
    console.error("Error al guardar asistencia Si.R.A.:", error);

    mostrarMensajeSira(
      error.message || "No se pudo guardar la asistencia.",
      "error",
    );
  } finally {
    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.disabled = false;
      btnRegistrarAsistenciaSira.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Registrar asistencia
      `;
    }
  }
}

if (fechaSiraDocente) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaSiraDocente.value = `${yyyy}-${mm}-${dd}`;

  fechaSiraDocente.addEventListener("change", cargarClasesSiraPorFecha);
}

if (claseSiraDocente) {
  claseSiraDocente.addEventListener("change", () => {
    claseSiraSeleccionada = null;
    estudiantesSiraActuales = [];
    asistenciaSiraActual = null;

    if (vistaAsistenciaSiraDocente) {
      vistaAsistenciaSiraDocente.innerHTML = `
        <p class="mensaje-formulario">
          Seleccioná “Cargar estudiantes” para continuar.
        </p>
      `;
    }

    if (btnRegistrarAsistenciaSira) {
      btnRegistrarAsistenciaSira.hidden = true;
    }

    mostrarMensajeSira("");
  });
}

if (btnCargarAsistenciaSira) {
  btnCargarAsistenciaSira.addEventListener(
    "click",
    cargarEstudiantesParaClaseSira,
  );
}

if (btnRegistrarAsistenciaSira) {
  btnRegistrarAsistenciaSira.addEventListener("click", guardarAsistenciaSira);
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioSiraActual = usuario;

  if (infoClaseSiraDocente) {
    infoClaseSiraDocente.innerHTML =
      "Seleccioná una fecha para consultar tus clases disponibles.";
  }

  cargarClasesSiraPorFecha();
});
