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

const tipoSiraGestion = document.getElementById("tipoSiraGestion");
const cursoSiraGestion = document.getElementById("cursoSiraGestion");
const fechaInicioSiraGestion = document.getElementById(
  "fechaInicioSiraGestion",
);
const btnVerSiraGestion = document.getElementById("btnVerSiraGestion");
const vistaSiraGestion = document.getElementById("vistaSiraGestion");
const mensajeSiraGestion = document.getElementById("mensajeSiraGestion");

let usuarioSiraGestionActual = null;
let cursosSiraGestion = [];

const DIAS_SEMANA_SIRA = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

const ETIQUETAS_DIAS_SIRA = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
};

function mostrarMensajeSiraGestion(texto, tipo = "") {
  if (!mensajeSiraGestion) return;

  mensajeSiraGestion.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${texto}
      </span>
    `
    : "";
}

function formatearFechaSiraGestion(fechaTexto) {
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

function obtenerDiaDesdeFechaSiraGestion(fechaTexto) {
  const partes = fechaTexto.split("-");

  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2]),
  );

  return DIAS_SEMANA_SIRA[fecha.getDay()] || "";
}

function obtenerFechasHabilesDesdeInicio(fechaInicioTexto) {
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

function obtenerEtiquetaTipoSiraGestion(tipo) {
  if (tipo === "TALLER") return "Taller";
  if (tipo === "EDUCACION_FISICA") return "Educación Física";

  return tipo || "";
}

function agruparRegistrosPorEstado(registros = []) {
  return {
    PRESENTE: registros.filter((registro) => registro.estado === "PRESENTE"),
    AUSENTE: registros.filter((registro) => registro.estado === "AUSENTE"),
    TARDE: registros.filter((registro) => registro.estado === "TARDE"),
  };
}

function renderizarListaEstadoSiraGestion(titulo, registros, claseCss) {
  return `
    <div class="sira-gestion-estado ${claseCss}">
      <h5>${titulo} <span>${registros.length}</span></h5>

      ${
        registros.length
          ? `
            <ul>
              ${registros
                .map(
                  (registro) => `
                    <li>
                      <strong>${registro.alumnoNombre || "-"}</strong>
                      ${
                        registro.observacion
                          ? `<small>${registro.observacion}</small>`
                          : ""
                      }
                    </li>
                  `,
                )
                .join("")}
            </ul>
          `
          : `<p class="sira-gestion-sin-datos">Sin registros</p>`
      }
    </div>
  `;
}

function renderizarBloqueAsistenciaSiraGestion(asistencia) {
  const grupos = agruparRegistrosPorEstado(asistencia.registros || []);
  const tipo = String(asistencia.tipoHorario || "")
    .trim()
    .toUpperCase();

  return `
    <article class="sira-gestion-bloque">
      <header>
        <h4>${asistencia.espacioCurricular || obtenerEtiquetaTipoSiraGestion(tipo)}</h4>

        <p>
          ${
            tipo === "TALLER"
              ? `Grupo ${asistencia.grupoTaller || "-"}`
              : "Curso completo"
          }
        </p>

        <p>
          <strong>Docente:</strong> ${asistencia.docenteNombre || "-"}
        </p>

        <p>
          <strong>Horario:</strong> ${asistencia.horarioTexto || "-"}
        </p>
      </header>

      ${renderizarListaEstadoSiraGestion("Presentes:", grupos.PRESENTE, "presentes")}
${renderizarListaEstadoSiraGestion("Ausentes:", grupos.AUSENTE, "ausentes")}
${renderizarListaEstadoSiraGestion("Tardanzas:", grupos.TARDE, "tarde")}
    </article>
  `;
}

function renderizarParteSemanalSiraGestion(fechas, asistencias) {
  if (!vistaSiraGestion) return;

  const tipoSeleccionado = tipoSiraGestion.value;
  const cursoSeleccionado = cursosSiraGestion.find(
    (curso) => curso.id === cursoSiraGestion.value,
  );

  vistaSiraGestion.innerHTML = `
    <div class="sira-gestion-encabezado">
      <h3>
        Parte semanal - ${cursoSeleccionado?.nombre || "Curso"}
      </h3>

      <p>
        ${obtenerEtiquetaTipoSiraGestion(tipoSeleccionado)}
        · ${formatearFechaSiraGestion(fechas[0])}
        al ${formatearFechaSiraGestion(fechas[fechas.length - 1])}
      </p>
    </div>

    <div class="sira-gestion-semana">
      ${fechas
        .map((fecha) => {
          const dia = obtenerDiaDesdeFechaSiraGestion(fecha);
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
                ${ETIQUETAS_DIAS_SIRA[dia] || dia}
                <span>${formatearFechaSiraGestion(fecha)}</span>
              </h4>

              ${
                asistenciasDia.length
                  ? asistenciasDia
                      .map(renderizarBloqueAsistenciaSiraGestion)
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

async function cargarCursosSiraGestion() {
  if (!cursoSiraGestion) return;

  cursoSiraGestion.innerHTML = `
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

      if (anioA !== anioB) return anioA - anioB;

      return String(a.division || a.cursoDivision || "").localeCompare(
        String(b.division || b.cursoDivision || ""),
        "es",
      );
    });

    cursosSiraGestion = cursos;

    cursoSiraGestion.innerHTML = `
      <option value="">Seleccionar curso</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${curso.id}">
              ${curso.nombre || curso.cursoNombre || `${curso.anio || curso.cursoAnio}º ${curso.division || curso.cursoDivision}`}
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar cursos Si.R.A. Gestión:", error);

    cursoSiraGestion.innerHTML = `
      <option value="">No se pudieron cargar cursos</option>
    `;

    mostrarMensajeSiraGestion(
      error.message || "No se pudieron cargar los cursos.",
      "error",
    );
  }
}

async function consultarParteSemanalSiraGestion() {
  const tipo = tipoSiraGestion?.value || "";
  const cursoId = cursoSiraGestion?.value || "";
  const fechaInicio = fechaInicioSiraGestion?.value || "";

  if (!tipo || !cursoId || !fechaInicio) {
    mostrarMensajeSiraGestion(
      "Seleccioná tipo de asistencia, curso y fecha de inicio.",
      "error",
    );
    return;
  }

  const fechas = obtenerFechasHabilesDesdeInicio(fechaInicio);
  const fechaDesde = fechas[0];
  const fechaHasta = fechas[fechas.length - 1];

  if (vistaSiraGestion) {
    vistaSiraGestion.innerHTML = `
      <p class="mensaje-gestion">Cargando parte semanal...</p>
    `;
  }

  mostrarMensajeSiraGestion("");

  if (btnVerSiraGestion) {
    btnVerSiraGestion.disabled = true;
    btnVerSiraGestion.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
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
      if (datos.fecha < fechaDesde || datos.fecha > fechaHasta) return;

      asistencias.push({
        id: documento.id,
        ...datos,
      });
    });

    renderizarParteSemanalSiraGestion(fechas, asistencias);
  } catch (error) {
    console.error("Error al consultar Si.R.A. Gestión:", error);

    if (vistaSiraGestion) {
      vistaSiraGestion.innerHTML = `
        <p class="mensaje-gestion mensaje-error">
          No se pudo consultar el parte semanal.
        </p>
      `;
    }

    mostrarMensajeSiraGestion(
      error.message || "No se pudo consultar el parte semanal.",
      "error",
    );
  } finally {
    if (btnVerSiraGestion) {
      btnVerSiraGestion.disabled = false;
      btnVerSiraGestion.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver parte semanal
      `;
    }
  }
}

function inicializarFechaSiraGestion() {
  if (!fechaInicioSiraGestion) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaInicioSiraGestion.value = `${yyyy}-${mm}-${dd}`;
}

if (btnVerSiraGestion) {
  btnVerSiraGestion.addEventListener("click", consultarParteSemanalSiraGestion);
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioSiraGestionActual = usuario;

  inicializarFechaSiraGestion();
  cargarCursosSiraGestion();
});
