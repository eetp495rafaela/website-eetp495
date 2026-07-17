import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

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
const db = getFirestore(app);

// =========================
// MESAS DE EXAMEN - ALUMNO
// =========================

const btnActualizarMesasAlumno = document.getElementById(
  "btnActualizarMesasAlumno",
);

const filtroMesaAlumnoEspacio = document.getElementById(
  "filtroMesaAlumnoEspacio",
);

const filtroMesaAlumnoCurso = document.getElementById("filtroMesaAlumnoCurso");

const cuerpoTablaMesasAlumno = document.getElementById(
  "cuerpoTablaMesasAlumno",
);

const mensajeMesasAlumno = document.getElementById("mensajeMesasAlumno");

let mesasAlumnoCargadas = [];

function escaparHtmlAlumno(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensajeMesasAlumno(texto, tipo = "") {
  if (!mensajeMesasAlumno) return;

  mensajeMesasAlumno.textContent = texto || "";
  mensajeMesasAlumno.className = "mensaje-alumno-mesas";

  if (tipo) {
    mensajeMesasAlumno.classList.add(tipo);
  }
}

function formatearFechaMesaAlumno(fechaTexto) {
  const texto = String(fechaTexto || "").trim();

  if (!texto) return "-";

  const partes = texto.split("-");

  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  return texto;
}

function ordenarMesasAlumno(mesas) {
  return [...mesas].sort((a, b) => {
    const fechaA = String(a.fecha || "");
    const fechaB = String(b.fecha || "");

    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    return String(a.hora || "").localeCompare(String(b.hora || ""));
  });
}

function cargarFiltrosMesasAlumno() {
  if (filtroMesaAlumnoEspacio) {
    const valorActual = String(filtroMesaAlumnoEspacio.value || "").trim();

    const espacios = Array.from(
      new Set(
        mesasAlumnoCargadas
          .map((mesa) => String(mesa.espacioNombre || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    filtroMesaAlumnoEspacio.innerHTML = `
      <option value="">Todos los espacios</option>
      ${espacios
        .map(
          (espacio) => `
            <option value="${escaparHtmlAlumno(espacio)}">
              ${escaparHtmlAlumno(espacio)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && espacios.includes(valorActual)) {
      filtroMesaAlumnoEspacio.value = valorActual;
    }
  }

  if (filtroMesaAlumnoCurso) {
    const valorActual = String(filtroMesaAlumnoCurso.value || "").trim();

    const cursos = Array.from(
      new Set(
        mesasAlumnoCargadas
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

    filtroMesaAlumnoCurso.innerHTML = `
      <option value="">Todos los cursos</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${escaparHtmlAlumno(curso)}">
              ${escaparHtmlAlumno(curso)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && cursos.includes(valorActual)) {
      filtroMesaAlumnoCurso.value = valorActual;
    }
  }
}

function aplicarFiltrosMesasAlumno() {
  const espacioSeleccionado = String(
    filtroMesaAlumnoEspacio?.value || "",
  ).trim();

  const cursoSeleccionado = String(filtroMesaAlumnoCurso?.value || "").trim();

  const mesasFiltradas = mesasAlumnoCargadas.filter((mesa) => {
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

  renderizarMesasAlumno(mesasFiltradas);
}

function renderizarMesasAlumno(mesas) {
  if (!cuerpoTablaMesasAlumno) return;

  const ordenadas = ordenarMesasAlumno(mesas);

  if (!ordenadas.length) {
    cuerpoTablaMesasAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No hay mesas de examen publicadas para mostrar con esos filtros.
        </td>
      </tr>
    `;

    mostrarMensajeMesasAlumno("No se encontraron mesas con esos filtros.");
    return;
  }

  cuerpoTablaMesasAlumno.innerHTML = ordenadas
    .map((mesa) => {
      const cursos = Array.isArray(mesa.cursosNombres)
        ? mesa.cursosNombres.join(", ")
        : "-";

      return `
        <tr>
          <td>${escaparHtmlAlumno(formatearFechaMesaAlumno(mesa.fecha))}</td>
          <td>${escaparHtmlAlumno(mesa.hora || "-")}</td>
          <td>
            <strong>${escaparHtmlAlumno(mesa.espacioNombre || "-")}</strong>
          </td>
          <td>${escaparHtmlAlumno(cursos)}</td>
        </tr>
      `;
    })
    .join("");

  mostrarMensajeMesasAlumno(
    `${ordenadas.length} mesa(s) publicada(s) mostrada(s).`,
    "ok",
  );
}

async function cargarMesasAlumno() {
  if (!cuerpoTablaMesasAlumno) return;

  try {
    if (btnActualizarMesasAlumno) {
      btnActualizarMesasAlumno.disabled = true;
      btnActualizarMesasAlumno.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando mesas...
      `;
    }

    mostrarMensajeMesasAlumno("Cargando mesas de examen publicadas...");

    cuerpoTablaMesasAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          Consultando mesas de examen publicadas...
        </td>
      </tr>
    `;

    const consulta = await getDocs(
      query(collection(db, "mesas_examen"), where("estado", "==", "PUBLICADA")),
    );

    mesasAlumnoCargadas = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    if (!mesasAlumnoCargadas.length) {
      cuerpoTablaMesasAlumno.innerHTML = `
        <tr>
          <td colspan="4" class="tabla-vacia">
            No hay mesas de examen publicadas.
          </td>
        </tr>
      `;

      mostrarMensajeMesasAlumno("No hay mesas de examen publicadas.");
      return;
    }

    cargarFiltrosMesasAlumno();
    aplicarFiltrosMesasAlumno();
  } catch (error) {
    console.error("Error al cargar mesas de examen en Alumno:", error);

    cuerpoTablaMesasAlumno.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No se pudieron cargar las mesas de examen.
        </td>
      </tr>
    `;

    mostrarMensajeMesasAlumno(
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
    if (btnActualizarMesasAlumno) {
      btnActualizarMesasAlumno.disabled = false;
      btnActualizarMesasAlumno.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Actualizar mesas
      `;
    }
  }
}

// =========================
// EVENTOS
// =========================

if (btnActualizarMesasAlumno) {
  btnActualizarMesasAlumno.addEventListener("click", cargarMesasAlumno);
}

[filtroMesaAlumnoEspacio, filtroMesaAlumnoCurso]
  .filter(Boolean)
  .forEach((control) => {
    control.addEventListener("change", aplicarFiltrosMesasAlumno);
  });
