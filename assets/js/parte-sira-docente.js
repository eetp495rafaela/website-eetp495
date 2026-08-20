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

const tipoParteSiraDocente = document.getElementById("tipoParteSiraDocente");

const cursoParteSiraDocente = document.getElementById("cursoParteSiraDocente");

const fechaParteSiraDocente = document.getElementById("fechaParteSiraDocente");

const btnVerParteSiraDocente = document.getElementById(
  "btnVerParteSiraDocente",
);

const vistaParteSiraDocente = document.getElementById("vistaParteSiraDocente");

const mensajeParteSiraDocente = document.getElementById(
  "mensajeParteSiraDocente",
);

let usuarioParteSiraDocenteActual = null;
let asignacionesParteSiraDocente = [];

const DIAS_SEMANA_PARTE_SIRA = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const ETIQUETAS_DIAS_PARTE_SIRA = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
};

function normalizarTextoParteSira(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarCorreoParteSira(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function escaparHtmlParteSira(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inicializarFechaParteSiraDocente() {
  if (!fechaParteSiraDocente) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaParteSiraDocente.value = `${yyyy}-${mm}-${dd}`;
}

function mostrarMensajeParteSiraDocente(texto, tipo = "") {
  if (!mensajeParteSiraDocente) return;

  mensajeParteSiraDocente.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${escaparHtmlParteSira(texto)}
      </span>
    `
    : "";
}

function formatearFechaParteSira(fechaTexto) {
  if (!fechaTexto) return "";

  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obtenerDiaDesdeFechaParteSira(fechaTexto) {
  if (!fechaTexto) return "";

  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return DIAS_SEMANA_PARTE_SIRA[fecha.getDay()] || "";
}

function obtenerFechasHabilesParteSira(fechaInicioTexto) {
  if (!fechaInicioTexto) return [];

  const partes = fechaInicioTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  const fechas = [];

  while (fechas.length < 5) {
    const dia = fecha.getDay();

    if (dia !== 0 && dia !== 6) {
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, "0");
      const dd = String(fecha.getDate()).padStart(2, "0");

      fechas.push(`${yyyy}-${mm}-${dd}`);
    }

    fecha.setDate(fecha.getDate() + 1);
  }

  return fechas;
}

function obtenerEtiquetaTipoParteSira(tipo) {
  if (tipo === "TALLER") return "Taller";
  if (tipo === "EDUCACION_FISICA") return "Educación Física";

  return tipo || "";
}

function obtenerClaveCursoParteSira(asignacion) {
  const cursoId = String(asignacion.cursoId || "").trim();

  if (cursoId) {
    return `ID_${cursoId}`;
  }

  const cursoAnio = Number(asignacion.cursoAnio || 0);
  const cursoDivision = normalizarTextoParteSira(asignacion.cursoDivision);

  return `${cursoAnio}_${cursoDivision}`;
}

function obtenerNombreCursoParteSira(asignacion) {
  const cursoNombre = String(asignacion.cursoNombre || "").trim();

  if (cursoNombre) {
    return cursoNombre;
  }

  const cursoAnio = Number(asignacion.cursoAnio || 0);
  const cursoDivision = String(asignacion.cursoDivision || "").trim();

  return `${cursoAnio}º ${cursoDivision}`.trim();
}

function normalizarTipoParteSira(tipo) {
  const valor = normalizarTextoParteSira(tipo)
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (valor === "TALLER" || valor.includes("TALLER")) {
    return "TALLER";
  }

  if (
    valor === "EDUCACION_FISICA" ||
    valor === "EDUCACIONFISICA" ||
    valor.includes("FISICA")
  ) {
    return "EDUCACION_FISICA";
  }

  return valor;
}

function asignacionCoincideConTipo(asignacion, tipoSeleccionado) {
  const tipoAsignacion = normalizarTipoParteSira(
    asignacion.espacioTipo ||
      asignacion.tipoEspacio ||
      asignacion.tipoHorario ||
      asignacion.espacioNombre,
  );

  return tipoAsignacion === tipoSeleccionado;
}

function limpiarSelectorCursosParteSira(mensaje = "Seleccioná un curso") {
  if (!cursoParteSiraDocente) return;

  cursoParteSiraDocente.innerHTML = `
    <option value="">${escaparHtmlParteSira(mensaje)}</option>
  `;

  cursoParteSiraDocente.disabled = true;
}

function limpiarVistaParteSiraDocente() {
  if (!vistaParteSiraDocente) return;

  vistaParteSiraDocente.innerHTML = "";
}

function cargarCursosEnSelectorParteSira() {
  if (!tipoParteSiraDocente || !cursoParteSiraDocente) return;

  limpiarVistaParteSiraDocente();

  const tipoSeleccionado = normalizarTipoParteSira(tipoParteSiraDocente.value);

  if (!tipoSeleccionado) {
    limpiarSelectorCursosParteSira("Primero seleccioná un tipo");

    mostrarMensajeParteSiraDocente("");
    return;
  }

  const cursosPorClave = new Map();

  asignacionesParteSiraDocente
    .filter((asignacion) =>
      asignacionCoincideConTipo(asignacion, tipoSeleccionado),
    )
    .forEach((asignacion) => {
      const claveCurso = obtenerClaveCursoParteSira(asignacion);

      if (!claveCurso || claveCurso === "0_") return;

      if (!cursosPorClave.has(claveCurso)) {
        cursosPorClave.set(claveCurso, {
          cursoId: String(asignacion.cursoId || "").trim(),
          cursoAnio: Number(asignacion.cursoAnio || 0),
          cursoDivision: String(asignacion.cursoDivision || "").trim(),
          cursoNombre: obtenerNombreCursoParteSira(asignacion),
        });
      }
    });

  const cursos = Array.from(cursosPorClave.values()).sort((a, b) => {
    if (a.cursoAnio !== b.cursoAnio) {
      return a.cursoAnio - b.cursoAnio;
    }

    return a.cursoDivision.localeCompare(b.cursoDivision, "es", {
      sensitivity: "base",
    });
  });

  if (!cursos.length) {
    limpiarSelectorCursosParteSira("No tenés cursos asignados para este tipo");

    mostrarMensajeParteSiraDocente(
      "No se encontraron asignaciones activas para el tipo seleccionado.",
      "error",
    );

    return;
  }

  cursoParteSiraDocente.disabled = false;

  cursoParteSiraDocente.innerHTML = `
    <option value="">Seleccioná un curso</option>

    ${cursos
      .map(
        (curso) => `
          <option
            value="${escaparHtmlParteSira(curso.cursoId)}"
            data-curso-anio="${curso.cursoAnio}"
            data-curso-division="${escaparHtmlParteSira(curso.cursoDivision)}"
            data-curso-nombre="${escaparHtmlParteSira(curso.cursoNombre)}"
          >
            ${escaparHtmlParteSira(curso.cursoNombre)}
          </option>
        `,
      )
      .join("")}
  `;

  mostrarMensajeParteSiraDocente("");
}

async function obtenerAsignacionesParteSiraDocente(correoDocente) {
  const asignacionesPorId = new Map();

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
      if (asignacionesPorId.has(documento.id)) return;

      asignacionesPorId.set(documento.id, {
        id: documento.id,
        ...documento.data(),
      });
    });
  }

  /*
   * Reemplazos vigentes:
   * se comportan como asignaciones temporales
   * para Parte de Asistencia.
   */
  const consultaReemplazos = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const resultadoReemplazos = await getDocs(consultaReemplazos);

  const hoy = new Date();

  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");

  resultadoReemplazos.forEach((documento) => {
    const reemplazo = documento.data();

    const estado = String(reemplazo.estado || "")
      .trim()
      .toUpperCase();

    const tipoHorario = String(reemplazo.tipoHorario || "")
      .trim()
      .toUpperCase();

    const fechaDesde = String(reemplazo.fechaDesde || "").trim();

    const fechaHasta = String(reemplazo.fechaHasta || "").trim();

    const vigente =
      estado === "ACTIVO" &&
      (tipoHorario === "TALLER" || tipoHorario === "EDUCACION_FISICA") &&
      fechaDesde &&
      fechaHasta &&
      fechaHoy >= fechaDesde &&
      fechaHoy <= fechaHasta;

    if (!vigente) return;

    asignacionesPorId.set(`REEMPLAZO_${documento.id}`, {
      id: `REEMPLAZO_${documento.id}`,

      docenteCorreo: reemplazo.reemplazanteCorreo || "",

      docenteNombre: reemplazo.reemplazanteNombre || "",

      cursoId: reemplazo.cursoId || "",

      cursoNombre: reemplazo.cursoNombre || "",

      cursoAnio: reemplazo.cursoAnio || 0,

      cursoDivision: reemplazo.cursoDivision || "",

      espacioId: reemplazo.espacioId || "",

      espacioNombre: reemplazo.espacioNombre || "",

      espacioTipo: tipoHorario,

      tipoHorario,

      cicloLectivo: reemplazo.cicloLectivo || 0,

      estado: "ACTIVA",

      esReemplazoTemporal: true,
      reemplazoId: documento.id,
    });
  });

  return Array.from(asignacionesPorId.values());
}

async function cargarAsignacionesParteSiraDocente() {
  if (!usuarioParteSiraDocenteActual) return;

  limpiarSelectorCursosParteSira("Cargando cursos...");

  mostrarMensajeParteSiraDocente("Cargando tus cursos asignados...");

  try {
    const correoDocente = normalizarCorreoParteSira(
      usuarioParteSiraDocenteActual.email,
    );

    asignacionesParteSiraDocente =
      await obtenerAsignacionesParteSiraDocente(correoDocente);

    if (!asignacionesParteSiraDocente.length) {
      limpiarSelectorCursosParteSira("No tenés cursos asignados");

      mostrarMensajeParteSiraDocente(
        "No se encontraron asignaciones activas para tu usuario.",
        "error",
      );

      return;
    }

    cargarCursosEnSelectorParteSira();
  } catch (error) {
    console.error("Error al cargar asignaciones del Parte Si.R.A.:", error);

    limpiarSelectorCursosParteSira("No se pudieron cargar los cursos");

    mostrarMensajeParteSiraDocente(
      error.message || "No se pudieron cargar tus cursos asignados.",
      "error",
    );
  }
}

function agruparRegistrosPorEstadoParteSira(registros = []) {
  return {
    PRESENTE: registros.filter(
      (registro) => normalizarTextoParteSira(registro.estado) === "PRESENTE",
    ),
    AUSENTE: registros.filter(
      (registro) => normalizarTextoParteSira(registro.estado) === "AUSENTE",
    ),
    TARDE: registros.filter(
      (registro) => normalizarTextoParteSira(registro.estado) === "TARDE",
    ),
  };
}

function renderizarListaEstadoParteSira(titulo, registros, claseCss) {
  return `
    <div class="sira-gestion-estado ${claseCss}">
      <h5>
        ${escaparHtmlParteSira(titulo)}
        <span>${registros.length}</span>
      </h5>

      ${
        registros.length
          ? `
            <ul>
              ${registros
                .map(
                  (registro) => `
                    <li>
                      <strong>
                        ${escaparHtmlParteSira(registro.alumnoNombre || "-")}
                      </strong>

                      ${
                        registro.observacion
                          ? `
                            <small>
                              ${escaparHtmlParteSira(registro.observacion)}
                            </small>
                          `
                          : ""
                      }
                    </li>
                  `,
                )
                .join("")}
            </ul>
          `
          : `
            <p class="sira-gestion-sin-datos">
              Sin registros
            </p>
          `
      }
    </div>
  `;
}

function renderizarBloqueAsistenciaParteSira(asistencia) {
  const grupos = agruparRegistrosPorEstadoParteSira(asistencia.registros || []);

  const tipo = normalizarTipoParteSira(asistencia.tipoHorario);

  return `
    <article class="sira-gestion-bloque">
      <header>
        <h4>
          ${escaparHtmlParteSira(
            asistencia.espacioCurricular || obtenerEtiquetaTipoParteSira(tipo),
          )}
        </h4>

        <p>
          ${
            tipo === "TALLER"
              ? `Grupo ${escaparHtmlParteSira(asistencia.grupoTaller || "-")}`
              : "Curso completo"
          }
        </p>

        <p>
          <strong>Docente:</strong>
          ${escaparHtmlParteSira(asistencia.docenteNombre || "-")}
        </p>

        <p>
          <strong>Horario:</strong>
          ${escaparHtmlParteSira(asistencia.horarioTexto || "-")}
        </p>
      </header>

      ${renderizarListaEstadoParteSira(
        "Presentes:",
        grupos.PRESENTE,
        "presentes",
      )}

      ${renderizarListaEstadoParteSira("Ausentes:", grupos.AUSENTE, "ausentes")}

      ${renderizarListaEstadoParteSira("Tardanzas:", grupos.TARDE, "tarde")}
    </article>
  `;
}

function renderizarParteSemanalParteSira(
  fechas,
  asistencias,
  cursoNombre,
  tipoSeleccionado,
) {
  if (!vistaParteSiraDocente) return;

  vistaParteSiraDocente.innerHTML = `
    <div class="sira-gestion-encabezado">
      <h3>
        Parte semanal -
        ${escaparHtmlParteSira(cursoNombre || "Curso")}
      </h3>

      <p>
        ${escaparHtmlParteSira(obtenerEtiquetaTipoParteSira(tipoSeleccionado))}
        · ${formatearFechaParteSira(fechas[0])}
        al
        ${formatearFechaParteSira(fechas[fechas.length - 1])}
      </p>
    </div>

    <div class="sira-gestion-semana">
      ${fechas
        .map((fecha) => {
          const dia = obtenerDiaDesdeFechaParteSira(fecha);

          const asistenciasDia = asistencias
            .filter((asistencia) => asistencia.fecha === fecha)
            .sort((a, b) =>
              String(a.horaInicio || "").localeCompare(
                String(b.horaInicio || ""),
              ),
            );

          return `
            <section class="sira-gestion-dia">
              <h4>
                ${escaparHtmlParteSira(ETIQUETAS_DIAS_PARTE_SIRA[dia] || dia)}

                <span>
                  ${formatearFechaParteSira(fecha)}
                </span>
              </h4>

              ${
                asistenciasDia.length
                  ? asistenciasDia
                      .map(renderizarBloqueAsistenciaParteSira)
                      .join("")
                  : `
                    <div class="sira-gestion-dia-vacio">
                      Sin asistencia registrada
                    </div>
                  `
              }
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

async function consultarParteSemanalParteSiraDocente() {
  if (!usuarioParteSiraDocenteActual) {
    mostrarMensajeParteSiraDocente("No se detectó una sesión activa.", "error");

    return;
  }

  const tipoSeleccionado = normalizarTipoParteSira(tipoParteSiraDocente?.value);

  const cursoId = String(cursoParteSiraDocente?.value || "").trim();

  const fechaInicio = String(fechaParteSiraDocente?.value || "").trim();

  const opcionCurso =
    cursoParteSiraDocente?.options[cursoParteSiraDocente.selectedIndex];

  const cursoNombre = String(
    opcionCurso?.dataset.cursoNombre || opcionCurso?.textContent || "",
  ).trim();

  if (!tipoSeleccionado) {
    mostrarMensajeParteSiraDocente("Seleccioná el tipo de parte.", "error");

    return;
  }

  if (!cursoId) {
    mostrarMensajeParteSiraDocente("Seleccioná un curso.", "error");

    return;
  }

  if (!fechaInicio) {
    mostrarMensajeParteSiraDocente("Seleccioná una fecha.", "error");

    return;
  }

  const fechas = obtenerFechasHabilesParteSira(fechaInicio);

  const fechaDesde = fechas[0];
  const fechaHasta = fechas[fechas.length - 1];

  if (vistaParteSiraDocente) {
    vistaParteSiraDocente.innerHTML = `
      <p class="mensaje-gestion">
        Cargando parte semanal...
      </p>
    `;
  }

  mostrarMensajeParteSiraDocente("");

  if (btnVerParteSiraDocente) {
    btnVerParteSiraDocente.disabled = true;
    btnVerParteSiraDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;
  }

  try {
    const correoDocente = normalizarCorreoParteSira(
      usuarioParteSiraDocenteActual.email,
    );

    const consultasAsistencias = [
      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipoSeleccionado),
        where("docenteCorreo", "==", correoDocente),
      ),

      query(
        collection(db, "asistencias_clases"),
        where("estado", "==", "ACTIVA"),
        where("tipoHorario", "==", tipoSeleccionado),
        where("docenteTitularCorreo", "==", correoDocente),
      ),
    ];

    const resultadosAsistencias = await Promise.all(
      consultasAsistencias.map((consulta) => getDocs(consulta)),
    );

    const asistenciasPorId = new Map();

    resultadosAsistencias.forEach((resultado) => {
      resultado.forEach((documento) => {
        const datos = documento.data();

        if (String(datos.cursoId || "").trim() !== cursoId) {
          return;
        }

        if (datos.fecha < fechaDesde || datos.fecha > fechaHasta) {
          return;
        }

        asistenciasPorId.set(documento.id, {
          id: documento.id,
          ...datos,
        });
      });
    });

    const asistencias = Array.from(asistenciasPorId.values());

    renderizarParteSemanalParteSira(
      fechas,
      asistencias,
      cursoNombre,
      tipoSeleccionado,
    );
  } catch (error) {
    console.error("Error al consultar el Parte Si.R.A. Docente:", error);

    if (vistaParteSiraDocente) {
      vistaParteSiraDocente.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar el parte semanal.
        </p>
      `;
    }

    mostrarMensajeParteSiraDocente(
      error.message || "No se pudo consultar el parte semanal.",
      "error",
    );
  } finally {
    if (btnVerParteSiraDocente) {
      btnVerParteSiraDocente.disabled = false;
      btnVerParteSiraDocente.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver parte semanal
      `;
    }
  }
}

if (tipoParteSiraDocente) {
  tipoParteSiraDocente.addEventListener(
    "change",
    cargarCursosEnSelectorParteSira,
  );
}

if (cursoParteSiraDocente) {
  cursoParteSiraDocente.addEventListener(
    "change",
    limpiarVistaParteSiraDocente,
  );
}

if (fechaParteSiraDocente) {
  fechaParteSiraDocente.addEventListener(
    "change",
    limpiarVistaParteSiraDocente,
  );
}

if (btnVerParteSiraDocente) {
  btnVerParteSiraDocente.addEventListener(
    "click",
    consultarParteSemanalParteSiraDocente,
  );
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  usuarioParteSiraDocenteActual = usuario;

  inicializarFechaParteSiraDocente();
  await cargarAsignacionesParteSiraDocente();
});
