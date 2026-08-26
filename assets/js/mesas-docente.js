import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "COPIAR_DESDE_PROTEGER_PORTAL",
  authDomain: "COPIAR_DESDE_PROTEGER_PORTAL",
  projectId: "COPIAR_DESDE_PROTEGER_PORTAL",
  storageBucket: "COPIAR_DESDE_PROTEGER_PORTAL",
  messagingSenderId: "COPIAR_DESDE_PROTEGER_PORTAL",
  appId: "COPIAR_DESDE_PROTEGER_PORTAL",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================
// MESAS DE EXAMEN - DOCENTE
// =========================

const btnActualizarMesasDocente = document.getElementById(
  "btnActualizarMesasDocente",
);

const filtroMesaDocenteEspacio = document.getElementById(
  "filtroMesaDocenteEspacio",
);

const filtroMesaDocenteCurso = document.getElementById(
  "filtroMesaDocenteCurso",
);

const cuerpoTablaMesasDocente = document.getElementById(
  "cuerpoTablaMesasDocente",
);

const mensajeMesasDocente = document.getElementById("mensajeMesasDocente");

let mesasDocenteCargadas = [];

function obtenerDbDocente() {
  return db;
}

function escaparHtmlDocente(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensajeMesasDocente(texto, tipo = "") {
  if (!mensajeMesasDocente) return;

  mensajeMesasDocente.textContent = texto || "";
  mensajeMesasDocente.className = "mensaje-docente-mesas";

  if (tipo) {
    mensajeMesasDocente.classList.add(tipo);
  }
}

function formatearFechaMesaDocente(fechaTexto) {
  const texto = String(fechaTexto || "").trim();

  if (!texto) return "-";

  const partes = texto.split("-");

  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  return texto;
}

function ordenarMesasDocente(mesas) {
  return [...mesas].sort((a, b) => {
    const fechaA = String(a.fecha || "");
    const fechaB = String(b.fecha || "");

    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    return String(a.hora || "").localeCompare(String(b.hora || ""));
  });
}

function cargarFiltrosMesasDocente() {
  if (filtroMesaDocenteEspacio) {
    const valorActual = String(filtroMesaDocenteEspacio.value || "").trim();

    const espacios = Array.from(
      new Set(
        mesasDocenteCargadas
          .map((mesa) => String(mesa.espacioNombre || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    filtroMesaDocenteEspacio.innerHTML = `
      <option value="">Todos los espacios</option>
      ${espacios
        .map(
          (espacio) => `
            <option value="${escaparHtmlDocente(espacio)}">
              ${escaparHtmlDocente(espacio)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && espacios.includes(valorActual)) {
      filtroMesaDocenteEspacio.value = valorActual;
    }
  }

  if (filtroMesaDocenteCurso) {
    const valorActual = String(filtroMesaDocenteCurso.value || "").trim();

    const cursos = Array.from(
      new Set(
        mesasDocenteCargadas
          .flatMap((mesa) =>
            Array.isArray(mesa.cursosNombres) ? mesa.cursosNombres : [],
          )
          .map((curso) => String(curso || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    filtroMesaDocenteCurso.innerHTML = `
      <option value="">Todos los cursos</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${escaparHtmlDocente(curso)}">
              ${escaparHtmlDocente(curso)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && cursos.includes(valorActual)) {
      filtroMesaDocenteCurso.value = valorActual;
    }
  }
}

function aplicarFiltrosMesasDocente() {
  const espacioSeleccionado = String(
    filtroMesaDocenteEspacio?.value || "",
  ).trim();

  const cursoSeleccionado = String(filtroMesaDocenteCurso?.value || "").trim();

  const mesasFiltradas = mesasDocenteCargadas.filter((mesa) => {
    const espacioMesa = String(mesa.espacioNombre || "").trim();

    const cursosMesa = Array.isArray(mesa.cursosNombres)
      ? mesa.cursosNombres
      : [];

    const coincideEspacio =
      !espacioSeleccionado || espacioMesa === espacioSeleccionado;

    const coincideCurso =
      !cursoSeleccionado || cursosMesa.includes(cursoSeleccionado);

    return coincideEspacio && coincideCurso;
  });

  renderizarMesasDocente(mesasFiltradas);
}

function renderizarMesasDocente(mesas) {
  if (!cuerpoTablaMesasDocente) return;

  const ordenadas = ordenarMesasDocente(mesas);

  if (!ordenadas.length) {
    cuerpoTablaMesasDocente.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No hay mesas de examen publicadas para mostrar con esos filtros.
        </td>
      </tr>
    `;

    mostrarMensajeMesasDocente("No se encontraron mesas con esos filtros.");
    return;
  }

  cuerpoTablaMesasDocente.innerHTML = ordenadas
    .map((mesa) => {
      const cursos = Array.isArray(mesa.cursosNombres)
        ? mesa.cursosNombres.join(", ")
        : "-";

      return `
        <tr>
          <td>${escaparHtmlDocente(formatearFechaMesaDocente(mesa.fecha))}</td>
          <td>${escaparHtmlDocente(mesa.hora || "-")}</td>
          <td>
            <strong>${escaparHtmlDocente(mesa.espacioNombre || "-")}</strong>
          </td>
          <td>${escaparHtmlDocente(cursos)}</td>
        </tr>
      `;
    })
    .join("");

  mostrarMensajeMesasDocente(
    `${ordenadas.length} mesa(s) publicada(s) mostrada(s).`,
    "ok",
  );
}

function normalizarCorreoMesaDocente(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function obtenerFechaActualMesaDocente() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function reemplazoMesaDocenteEstaVigente(reemplazo) {
  const estado = String(reemplazo.estado || "")
    .trim()
    .toUpperCase();

  const tipoHorario = String(reemplazo.tipoHorario || "")
    .trim()
    .toUpperCase();

  const fechaDesde = String(reemplazo.fechaDesde || "").trim();
  const fechaHasta = String(reemplazo.fechaHasta || "").trim();

  const hoy = obtenerFechaActualMesaDocente();

  return (
    estado === "ACTIVO" &&
    (tipoHorario === "TALLER" || tipoHorario === "EDUCACION_FISICA") &&
    fechaDesde &&
    fechaHasta &&
    hoy >= fechaDesde &&
    hoy <= fechaHasta
  );
}

function agregarEspacioAutorizadoMesaDocente(espaciosIds, datos) {
  const espacioId = String(datos.espacioId || "").trim();

  if (espacioId) {
    espaciosIds.add(espacioId);
  }

  const cursoAnio = Number(datos.cursoAnio || 0);

  const tipoEspacio = String(datos.espacioTipo || datos.tipoHorario || "")
    .trim()
    .toUpperCase();

  /*
   * Para Mesas de Examen, los tres talleres reales
   * de 1º y 2º representan una única materia "Taller".
   */
  if (tipoEspacio === "TALLER" && (cursoAnio === 1 || cursoAnio === 2)) {
    espaciosIds.add(`TALLER_EXAMEN_${cursoAnio}`);
  }
}

async function obtenerEspaciosIdsAutorizadosMesaDocente() {
  const usuario = auth.currentUser;

  if (!usuario || !usuario.email) {
    throw new Error("No se detectó una sesión docente activa.");
  }

  const correoDocente = normalizarCorreoMesaDocente(usuario.email);

  const consultaAsignacionesActivas = query(
    collection(db, "asignaciones_docentes"),
    where("docenteCorreo", "==", correoDocente),
    where("estado", "==", "ACTIVA"),
  );

  const consultaAsignacionesActivo = query(
    collection(db, "asignaciones_docentes"),
    where("docenteCorreo", "==", correoDocente),
    where("estado", "==", "ACTIVO"),
  );

  const consultaReemplazos = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const [
    resultadoAsignacionesActivas,
    resultadoAsignacionesActivo,
    resultadoReemplazos,
  ] = await Promise.all([
    getDocs(consultaAsignacionesActivas),
    getDocs(consultaAsignacionesActivo),
    getDocs(consultaReemplazos),
  ]);

  const espaciosIds = new Set();

  resultadoAsignacionesActivas.forEach((documento) => {
    agregarEspacioAutorizadoMesaDocente(espaciosIds, documento.data());
  });

  resultadoAsignacionesActivo.forEach((documento) => {
    agregarEspacioAutorizadoMesaDocente(espaciosIds, documento.data());
  });

  resultadoReemplazos.forEach((documento) => {
    const reemplazo = documento.data();

    if (!reemplazoMesaDocenteEstaVigente(reemplazo)) {
      return;
    }

    agregarEspacioAutorizadoMesaDocente(espaciosIds, reemplazo);
  });

  return espaciosIds;
}

async function cargarMesasDocente() {
  if (!cuerpoTablaMesasDocente) return;

  try {
    const db = obtenerDbDocente();

    if (btnActualizarMesasDocente) {
      btnActualizarMesasDocente.disabled = true;
      btnActualizarMesasDocente.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando mesas...
      `;
    }

    mostrarMensajeMesasDocente("Cargando mesas de examen publicadas...");

    cuerpoTablaMesasDocente.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          Consultando mesas de examen publicadas...
        </td>
      </tr>
    `;

    const espaciosIdsAutorizados =
      await obtenerEspaciosIdsAutorizadosMesaDocente();

    const consulta = await getDocs(
      query(collection(db, "mesas_examen"), where("estado", "==", "PUBLICADA")),
    );

    mesasDocenteCargadas = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((mesa) => {
        const estado = String(mesa.estado || "")
          .trim()
          .toUpperCase();

        const espacioId = String(mesa.espacioId || "").trim();

        return estado === "PUBLICADA" && espaciosIdsAutorizados.has(espacioId);
      });

    console.log(
      "Mesas publicadas encontradas en Docente:",
      mesasDocenteCargadas,
    );

    if (!mesasDocenteCargadas.length) {
      cuerpoTablaMesasDocente.innerHTML = `
        <tr>
          <td colspan="4" class="tabla-vacia">
            No hay mesas de examen publicadas.
          </td>
        </tr>
      `;

      mostrarMensajeMesasDocente("No hay mesas de examen publicadas.");
      return;
    }

    cargarFiltrosMesasDocente();
    aplicarFiltrosMesasDocente();
  } catch (error) {
    console.error("Error al cargar mesas de examen en Docente:", error);

    cuerpoTablaMesasDocente.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No se pudieron cargar las mesas de examen.
        </td>
      </tr>
    `;

    mostrarMensajeMesasDocente(
      error.message || "No se pudieron cargar las mesas de examen.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar las mesas",
        text: error.message || "Revisá conexión o permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnActualizarMesasDocente) {
      btnActualizarMesasDocente.disabled = false;
      btnActualizarMesasDocente.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Actualizar mesas
      `;
    }
  }
}

// =========================
// EVENTOS
// =========================

if (btnActualizarMesasDocente) {
  btnActualizarMesasDocente.addEventListener("click", cargarMesasDocente);
}

[filtroMesaDocenteEspacio, filtroMesaDocenteCurso]
  .filter(Boolean)
  .forEach((control) => {
    control.addEventListener("change", aplicarFiltrosMesasDocente);
  });
