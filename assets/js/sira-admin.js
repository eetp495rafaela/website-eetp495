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
  doc,
  deleteDoc,
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

const tipoSiraAdmin = document.getElementById("tipoSiraAdmin");
const cursoSiraAdmin = document.getElementById("cursoSiraAdmin");
const fechaInicioSiraAdmin = document.getElementById("fechaInicioSiraAdmin");
const btnVerSiraAdmin = document.getElementById("btnVerSiraAdmin");
const vistaSiraAdmin = document.getElementById("vistaSiraAdmin");
const mensajeSiraAdminPanel = document.getElementById("mensajeSiraAdminPanel");

let usuarioSiraAdminActual = null;
let cursosSiraAdmin = [];
let asistenciasSiraAdminActuales = [];
let fechasSiraAdminActuales = [];

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

function mostrarMensajeSiraAdmin(texto, tipo = "") {
  if (!mensajeSiraAdminPanel) return;

  mensajeSiraAdminPanel.innerHTML = texto
    ? `
      <span class="${tipo === "error" ? "mensaje-error" : ""}">
        ${texto}
      </span>
    `
    : "";
}

function formatearFechaSiraAdmin(fechaTexto) {
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

function obtenerDiaDesdeFechaSiraAdmin(fechaTexto) {
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

function obtenerEtiquetaTipoSiraAdmin(tipo) {
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

function renderizarListaEstadoSiraAdmin(titulo, registros, claseCss) {
  return `
    <div class="sira-admin-estado ${claseCss}">
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
          : `<p class="sira-admin-sin-datos">Sin registros</p>`
      }
    </div>
  `;
}

function renderizarBloqueAsistenciaSiraAdmin(asistencia) {
  const grupos = agruparRegistrosPorEstado(asistencia.registros || []);
  const tipo = String(asistencia.tipoHorario || "")
    .trim()
    .toUpperCase();

  return `
    <article class="sira-admin-bloque">
      <header>
        <div>
          <h4>
            ${
              asistencia.espacioCurricular || obtenerEtiquetaTipoSiraAdmin(tipo)
            }
          </h4>

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
        </div>

        <button
          class="btn-eliminar-asistencia-sira-admin"
          type="button"
          data-id="${asistencia.id}"
        >
          <i class="fa-solid fa-trash-can"></i>
          Eliminar
        </button>
      </header>

      ${renderizarListaEstadoSiraAdmin(
        "Presentes:",
        grupos.PRESENTE,
        "presentes",
      )}

      ${renderizarListaEstadoSiraAdmin("Ausentes:", grupos.AUSENTE, "ausentes")}

      ${renderizarListaEstadoSiraAdmin("Tardanzas:", grupos.TARDE, "tarde")}
    </article>
  `;
}

function activarBotonesEliminarSiraAdmin() {
  const botonesEliminar = document.querySelectorAll(
    ".btn-eliminar-asistencia-sira-admin",
  );

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const asistenciaId = boton.dataset.id;
      eliminarAsistenciaSiraAdmin(asistenciaId);
    });
  });
}

function renderizarParteSemanalSiraAdmin(fechas, asistencias) {
  if (!vistaSiraAdmin) return;

  const tipoSeleccionado = tipoSiraAdmin.value;
  const cursoSeleccionado = cursosSiraAdmin.find(
    (curso) => curso.id === cursoSiraAdmin.value,
  );

  vistaSiraAdmin.innerHTML = `
    <div class="sira-admin-encabezado">
      <h3>
        Parte semanal - ${cursoSeleccionado?.nombre || "Curso"}
      </h3>

      <p>
        ${obtenerEtiquetaTipoSiraAdmin(tipoSeleccionado)}
        · ${formatearFechaSiraAdmin(fechas[0])}
        al ${formatearFechaSiraAdmin(fechas[fechas.length - 1])}
      </p>
    </div>

    <div class="sira-admin-semana">
      ${fechas
        .map((fecha) => {
          const dia = obtenerDiaDesdeFechaSiraAdmin(fecha);

          const asistenciasDia = asistencias
            .filter((asistencia) => asistencia.fecha === fecha)
            .sort((a, b) =>
              String(a.horaInicio || "").localeCompare(
                String(b.horaInicio || ""),
              ),
            );

          return `
            <section class="sira-admin-dia">
              <h4>
                ${ETIQUETAS_DIAS_SIRA[dia] || dia}
                <span>${formatearFechaSiraAdmin(fecha)}</span>
              </h4>

              ${
                asistenciasDia.length
                  ? asistenciasDia
                      .map(renderizarBloqueAsistenciaSiraAdmin)
                      .join("")
                  : `
                    <div class="sira-admin-dia-vacio">
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

  activarBotonesEliminarSiraAdmin();
}

async function cargarCursosSiraAdmin() {
  if (!cursoSiraAdmin) return;

  cursoSiraAdmin.innerHTML = `
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

    cursosSiraAdmin = cursos;

    cursoSiraAdmin.innerHTML = `
      <option value="">Seleccionar curso</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${curso.id}">
              ${
                curso.nombre ||
                curso.cursoNombre ||
                `${curso.anio || curso.cursoAnio}º ${
                  curso.division || curso.cursoDivision
                }`
              }
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar cursos Si.R.A. Admin:", error);

    cursoSiraAdmin.innerHTML = `
      <option value="">No se pudieron cargar cursos</option>
    `;

    mostrarMensajeSiraAdmin(
      error.message || "No se pudieron cargar los cursos.",
      "error",
    );
  }
}

async function consultarParteSemanalSiraAdmin() {
  const tipo = tipoSiraAdmin?.value || "";
  const cursoId = cursoSiraAdmin?.value || "";
  const fechaInicio = fechaInicioSiraAdmin?.value || "";

  if (!tipo || !cursoId || !fechaInicio) {
    mostrarMensajeSiraAdmin(
      "Seleccioná tipo de asistencia, curso y fecha de inicio.",
      "error",
    );
    return;
  }

  const fechas = obtenerFechasHabilesDesdeInicio(fechaInicio);
  const fechaDesde = fechas[0];
  const fechaHasta = fechas[fechas.length - 1];

  fechasSiraAdminActuales = fechas;

  if (vistaSiraAdmin) {
    vistaSiraAdmin.innerHTML = `
      <p class="mensaje-formulario">Cargando parte semanal...</p>
    `;
  }

  mostrarMensajeSiraAdmin("");

  if (btnVerSiraAdmin) {
    btnVerSiraAdmin.disabled = true;
    btnVerSiraAdmin.innerHTML = `
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

    asistenciasSiraAdminActuales = asistencias;

    renderizarParteSemanalSiraAdmin(fechas, asistencias);
  } catch (error) {
    console.error("Error al consultar Si.R.A. Admin:", error);

    if (vistaSiraAdmin) {
      vistaSiraAdmin.innerHTML = `
        <p class="mensaje-formulario mensaje-error">
          No se pudo consultar el parte semanal.
        </p>
      `;
    }

    mostrarMensajeSiraAdmin(
      error.message || "No se pudo consultar el parte semanal.",
      "error",
    );
  } finally {
    if (btnVerSiraAdmin) {
      btnVerSiraAdmin.disabled = false;
      btnVerSiraAdmin.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver parte semanal
      `;
    }
  }
}

async function eliminarAsistenciaSiraAdmin(asistenciaId) {
  if (!asistenciaId) return;

  const asistencia = asistenciasSiraAdminActuales.find(
    (item) => item.id === asistenciaId,
  );

  const detalle = asistencia
    ? `${asistencia.espacioCurricular || "Asistencia"} - ${
        asistencia.cursoNombre || ""
      } - ${formatearFechaSiraAdmin(asistencia.fecha)}`
    : "esta asistencia";

  let confirmado = true;

  if (window.Swal) {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar asistencia?",
      html: `
        <p>Vas a eliminar la carga de asistencia:</p>
        <strong>${detalle}</strong>
        <p style="margin-top:10px;">Esta acción no se puede deshacer.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    confirmado = resultado.isConfirmed;
  } else {
    confirmado = window.confirm(`¿Eliminar ${detalle}?`);
  }

  if (!confirmado) return;

  try {
    mostrarMensajeSiraAdmin("Eliminando asistencia...");

    await deleteDoc(doc(db, "asistencias_clases", asistenciaId));

    mostrarMensajeSiraAdmin("Asistencia eliminada correctamente.");

    if (window.Swal) {
      await Swal.fire({
        icon: "success",
        title: "Asistencia eliminada",
        text: "La carga fue eliminada correctamente.",
        confirmButtonText: "Aceptar",
      });
    }

    consultarParteSemanalSiraAdmin();
  } catch (error) {
    console.error("Error al eliminar asistencia Si.R.A. Admin:", error);

    mostrarMensajeSiraAdmin(
      error.message || "No se pudo eliminar la asistencia.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message || "Ocurrió un error al eliminar la asistencia.",
        confirmButtonText: "Aceptar",
      });
    }
  }
}

function inicializarFechaSiraAdmin() {
  if (!fechaInicioSiraAdmin) return;

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaInicioSiraAdmin.value = `${yyyy}-${mm}-${dd}`;
}

if (btnVerSiraAdmin) {
  btnVerSiraAdmin.addEventListener("click", consultarParteSemanalSiraAdmin);
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioSiraAdminActual = usuario;

  inicializarFechaSiraAdmin();
  cargarCursosSiraAdmin();
});
