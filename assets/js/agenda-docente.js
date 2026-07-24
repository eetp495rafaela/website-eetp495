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

/* =====================================================
   ELEMENTOS DEL MÓDULO
===================================================== */

const tarjetaAgendaInstitucionalDocente = document.getElementById(
  "tarjetaAgendaInstitucionalDocente",
);

const categoriaAgendaDocente = document.getElementById(
  "categoriaAgendaDocente",
);

const vistaAgendaInstitucionalDocente = document.getElementById(
  "vistaAgendaInstitucionalDocente",
);

/* =====================================================
   ESTADO
===================================================== */

let usuarioAgendaDocenteActual = null;

const cacheAgendaDocente = new Map();

/* =====================================================
   FUNCIONES GENERALES
===================================================== */

function normalizarCorreoAgendaDocente(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarTextoAgendaDocente(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase();
}

function escaparHtmlAgendaDocente(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerNombreAgendaDocente(datos) {
  const nombreCompleto = String(datos.nombreCompleto || "").trim();

  if (nombreCompleto) {
    return nombreCompleto;
  }

  const apellido = String(datos.apellido || "").trim();
  const nombre = String(datos.nombre || "").trim();

  return (
    `${apellido} ${nombre}`.trim() ||
    String(datos.correo || datos.id || "").trim() ||
    "Persona sin nombre"
  );
}

function obtenerCorreoAgendaDocente(datos) {
  return normalizarCorreoAgendaDocente(
    datos.correo || datos.docenteCorreo || datos.usuarioId || datos.id,
  );
}

function mostrarMensajeAgendaDocente(texto, tipo = "") {
  if (!vistaAgendaInstitucionalDocente) return;

  vistaAgendaInstitucionalDocente.innerHTML = `
    <p
      class="mensaje-formulario ${tipo === "error" ? "error" : ""}"
    >
      ${escaparHtmlAgendaDocente(texto)}
    </p>
  `;
}

function textoCargoAgendaDocente(cargo) {
  const cargos = {
    DIRECTORA: "Director/a",
    VICE_DIRECTORA: "Vice Director/a",
    SECRETARIO: "Secretario/a",
    PRO_SECRETARIO: "Pro Secretario/a",
    PRECEPTOR: "Preceptor/a",
  };

  return (
    cargos[normalizarTextoAgendaDocente(cargo)] ||
    String(cargo || "").trim() ||
    "Administración institucional"
  );
}

function obtenerNombreCursoAgendaDocente(datos) {
  return (
    String(datos.cursoNombre || "").trim() ||
    `${datos.cursoAnio || ""}º ${datos.cursoDivision || ""}`.trim()
  );
}

function obtenerTituloCategoriaAgenda(categoria) {
  const titulos = {
    COLEGAS: "Mis colegas docentes",
    ADMINISTRACION: "Administración institucional",
    ALUMNOS: "Mis alumnos",
  };

  return titulos[categoria] || "Agenda institucional";
}

/* =====================================================
   RENDERIZADO
===================================================== */

function renderizarAgendaDocente(contactos, categoria) {
  if (!vistaAgendaInstitucionalDocente) return;

  const titulo = obtenerTituloCategoriaAgenda(categoria);

  if (!contactos.length) {
    vistaAgendaInstitucionalDocente.innerHTML = `
      <div class="encabezado-agenda-docente">
        <strong>
          ${escaparHtmlAgendaDocente(titulo)}
        </strong>
      </div>

      <p class="mensaje-formulario">
        No se encontraron contactos disponibles para esta
        categoría.
      </p>
    `;

    return;
  }

  vistaAgendaInstitucionalDocente.innerHTML = `
    <div class="encabezado-agenda-docente">
      <strong>
        ${escaparHtmlAgendaDocente(titulo)}
      </strong>

      <span>
        · ${contactos.length}
        ${contactos.length === 1 ? "contacto" : "contactos"}
      </span>
    </div>

    <div class="tabla-documentos-contenedor">
      <table class="tabla-documentos tabla-agenda-docente">
        <thead>
          <tr>
            <th>Apellido y nombre</th>
            <th>Cargo / Curso</th>
            <th>Correo electrónico</th>
          </tr>
        </thead>

        <tbody>
          ${contactos
            .map((contacto) => {
              const nombre = String(contacto.nombre || "").trim();

              const detalle = String(contacto.detalle || "").trim();

              const correo = normalizarCorreoAgendaDocente(contacto.correo);

              return `
                <tr>
                  <td data-label="Apellido y nombre">
                    <strong>
                      ${escaparHtmlAgendaDocente(nombre || "Sin nombre")}
                    </strong>
                  </td>

                  <td data-label="Cargo / Curso">
                    ${escaparHtmlAgendaDocente(detalle || "-")}
                  </td>

                  <td data-label="Correo electrónico">
                    ${
                      correo
                        ? `
                          <a
                            class="enlace-correo-agenda-docente"
                            href="mailto:${escaparHtmlAgendaDocente(correo)}"
                          >
                            ${escaparHtmlAgendaDocente(correo)}
                          </a>
                        `
                        : "Correo no cargado"
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* =====================================================
   MIS COLEGAS
===================================================== */

async function obtenerColegasAgendaDocente() {
  const consulta = query(
    collection(db, "usuarios"),
    where("rol", "==", "DOCENTE"),
    where("estado", "==", "ACTIVO"),
  );

  const resultado = await getDocs(consulta);

  const correoActual = normalizarCorreoAgendaDocente(
    usuarioAgendaDocenteActual?.email,
  );

  return resultado.docs
    .map((documento) => {
      const datos = {
        id: documento.id,
        ...documento.data(),
      };

      return {
        nombre: obtenerNombreAgendaDocente(datos),
        correo: obtenerCorreoAgendaDocente(datos),
        detalle: "Docente",
      };
    })
    .filter((contacto) => contacto.correo !== correoActual)
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      }),
    );
}

/* =====================================================
   ADMINISTRACIÓN INSTITUCIONAL
===================================================== */

async function obtenerAdministracionAgendaDocente() {
  const consulta = query(
    collection(db, "referentes_institucionales"),
    where("estado", "==", "ACTIVO"),
  );

  const resultado = await getDocs(consulta);

  const correoActual = normalizarCorreoAgendaDocente(
    usuarioAgendaDocenteActual?.email,
  );

  const ordenCargos = {
    DIRECTORA: 1,
    VICE_DIRECTORA: 2,
    SECRETARIO: 3,
    PRO_SECRETARIO: 4,
    PRECEPTOR: 5,
  };

  const contactosAgrupados = new Map();

  resultado.docs.forEach((documento) => {
    const datos = {
      id: documento.id,
      ...documento.data(),
    };

    const cargo = normalizarTextoAgendaDocente(datos.cargo);

    const nombre = obtenerNombreAgendaDocente(datos);

    const correo = obtenerCorreoAgendaDocente(datos);

    if (correo === correoActual) {
      return;
    }

    const identificadorPersona =
      correo ||
      String(datos.usuarioId || "").trim() ||
      normalizarTextoAgendaDocente(nombre);

    const clave = `${cargo}__${identificadorPersona}`;

    if (!contactosAgrupados.has(clave)) {
      contactosAgrupados.set(clave, {
        cargo,
        nombre,
        correo,
        cursos: [],
      });
    }

    if (cargo === "PRECEPTOR") {
      const curso =
        obtenerNombreCursoAgendaDocente(datos) || "Curso sin cargar";

      const contacto = contactosAgrupados.get(clave);

      if (!contacto.cursos.includes(curso)) {
        contacto.cursos.push(curso);
      }
    }
  });

  return Array.from(contactosAgrupados.values())
    .map((contacto) => {
      const cursosOrdenados = [...contacto.cursos].sort((a, b) =>
        a.localeCompare(b, "es", {
          numeric: true,
          sensitivity: "base",
        }),
      );

      return {
        cargo: contacto.cargo,
        nombre: contacto.nombre,
        correo: contacto.correo,

        detalle:
          contacto.cargo === "PRECEPTOR"
            ? `${textoCargoAgendaDocente(
                contacto.cargo,
              )} · ${cursosOrdenados.join(", ")}`
            : textoCargoAgendaDocente(contacto.cargo),
      };
    })
    .sort((a, b) => {
      const ordenA = ordenCargos[a.cargo] || 99;

      const ordenB = ordenCargos[b.cargo] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return a.nombre.localeCompare(b.nombre, "es", {
        sensitivity: "base",
      });
    });
}

/* =====================================================
   CURSOS ASIGNADOS AL DOCENTE
===================================================== */

async function obtenerCursosAsignadosAgendaDocente() {
  const correoDocente = normalizarCorreoAgendaDocente(
    usuarioAgendaDocenteActual?.email,
  );

  const estadosAsignacion = ["ACTIVA", "ACTIVO"];

  const consultas = estadosAsignacion.map((estado) =>
    getDocs(
      query(
        collection(db, "asignaciones_docentes"),
        where("docenteCorreo", "==", correoDocente),
        where("estado", "==", estado),
      ),
    ),
  );

  const resultados = await Promise.allSettled(consultas);

  const resultadosCorrectos = resultados.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  if (!resultadosCorrectos.length) {
    throw new Error("No se pudieron consultar tus cursos asignados.");
  }

  const cursosPorClave = new Map();

  resultadosCorrectos.forEach((resultado) => {
    resultado.value.forEach((documento) => {
      const datos = documento.data();

      const cursoAnio = Number(datos.cursoAnio || 0);

      const cursoDivision = String(datos.cursoDivision || "").trim();

      if (!cursoAnio || !cursoDivision) {
        return;
      }

      const clave = `${cursoAnio}|${normalizarTextoAgendaDocente(
        cursoDivision,
      )}`;

      if (!cursosPorClave.has(clave)) {
        cursosPorClave.set(clave, {
          cursoAnio,
          cursoDivision,

          cursoNombre:
            String(datos.cursoNombre || "").trim() ||
            `${cursoAnio}º ${cursoDivision}`,
        });
      }
    });
  });

  return Array.from(cursosPorClave.values());
}

/* =====================================================
   ESTUDIANTES POR CURSO
===================================================== */

async function obtenerAlumnosCursoAgendaDocente(curso) {
  const condicionesComunes = [
    where("rol", "==", "ALUMNO"),
    where("estado", "==", "ACTIVO"),
    where("cursoAnio", "==", curso.cursoAnio),
    where("cursoDivision", "==", curso.cursoDivision),
  ];

  const consultaTipoVinculo = query(
    collection(db, "usuarios"),
    ...condicionesComunes,
    where("tipoVinculo", "==", "CURSANDO"),
  );

  const consultaSituacionRevista = query(
    collection(db, "usuarios"),
    ...condicionesComunes,
    where("situacionRevista", "==", "CURSANDO"),
  );

  const resultados = await Promise.allSettled([
    getDocs(consultaTipoVinculo),
    getDocs(consultaSituacionRevista),
  ]);

  const resultadosCorrectos = resultados.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  if (!resultadosCorrectos.length) {
    throw new Error(
      `No se pudieron consultar los estudiantes de ${curso.cursoNombre}.`,
    );
  }

  const estudiantesPorClave = new Map();

  resultadosCorrectos.forEach((resultado) => {
    resultado.value.forEach((documento) => {
      const datos = {
        id: documento.id,
        ...documento.data(),
      };

      const correo = obtenerCorreoAgendaDocente(datos);

      const clave = correo || documento.id;

      if (!estudiantesPorClave.has(clave)) {
        estudiantesPorClave.set(clave, {
          nombre: obtenerNombreAgendaDocente(datos),

          correo,

          detalle: obtenerNombreCursoAgendaDocente(datos) || curso.cursoNombre,
        });
      }
    });
  });

  return Array.from(estudiantesPorClave.values());
}

async function obtenerMisAlumnosAgendaDocente() {
  const cursos = await obtenerCursosAsignadosAgendaDocente();

  if (!cursos.length) {
    return [];
  }

  const resultadosCursos = await Promise.allSettled(
    cursos.map((curso) => obtenerAlumnosCursoAgendaDocente(curso)),
  );

  const resultadosCorrectos = resultadosCursos.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  if (!resultadosCorrectos.length) {
    throw new Error("No se pudieron consultar los estudiantes de tus cursos.");
  }

  const alumnosPorClave = new Map();

  resultadosCorrectos.forEach((resultado) => {
    resultado.value.forEach((alumno) => {
      const clave =
        alumno.correo || normalizarTextoAgendaDocente(alumno.nombre);

      if (!alumnosPorClave.has(clave)) {
        alumnosPorClave.set(clave, alumno);
      }
    });
  });

  const correoActual = normalizarCorreoAgendaDocente(
    usuarioAgendaDocenteActual?.email,
  );

  return Array.from(alumnosPorClave.values())
    .filter((alumno) => alumno.correo !== correoActual)
    .sort((a, b) => {
      const comparacionCurso = String(a.detalle || "").localeCompare(
        String(b.detalle || ""),
        "es",
        {
          numeric: true,
          sensitivity: "base",
        },
      );

      if (comparacionCurso !== 0) {
        return comparacionCurso;
      }

      return String(a.nombre || "").localeCompare(
        String(b.nombre || ""),
        "es",
        {
          sensitivity: "base",
        },
      );
    });
}

/* =====================================================
   CARGA DE CATEGORÍAS
===================================================== */

async function cargarCategoriaAgendaDocente(categoria) {
  if (!usuarioAgendaDocenteActual) {
    mostrarMensajeAgendaDocente(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  if (!categoria) {
    mostrarMensajeAgendaDocente(
      "Seleccioná una categoría para consultar la agenda.",
    );

    return;
  }

  mostrarMensajeAgendaDocente("Cargando contactos...");

  try {
    if (cacheAgendaDocente.has(categoria)) {
      renderizarAgendaDocente(cacheAgendaDocente.get(categoria), categoria);

      return;
    }

    let contactos = [];

    if (categoria === "COLEGAS") {
      contactos = await obtenerColegasAgendaDocente();
    }

    if (categoria === "ADMINISTRACION") {
      contactos = await obtenerAdministracionAgendaDocente();
    }

    if (categoria === "ALUMNOS") {
      contactos = await obtenerMisAlumnosAgendaDocente();
    }

    cacheAgendaDocente.set(categoria, contactos);

    renderizarAgendaDocente(contactos, categoria);
  } catch (error) {
    console.error("Error al cargar la agenda institucional:", error);

    mostrarMensajeAgendaDocente(
      error.message || "No se pudo cargar la agenda institucional.",
      "error",
    );
  }
}

/* =====================================================
   EVENTOS
===================================================== */

categoriaAgendaDocente?.addEventListener("change", () => {
  cargarCategoriaAgendaDocente(categoriaAgendaDocente.value);
});

tarjetaAgendaInstitucionalDocente?.addEventListener("click", () => {
  setTimeout(() => {
    const categoria = categoriaAgendaDocente?.value || "";

    if (categoria) {
      cargarCategoriaAgendaDocente(categoria);
    }
  }, 250);
});

/* =====================================================
   INICIO
===================================================== */

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    usuarioAgendaDocenteActual = null;
    cacheAgendaDocente.clear();

    return;
  }

  usuarioAgendaDocenteActual = usuario;

  cacheAgendaDocente.clear();

  mostrarMensajeAgendaDocente(
    "Seleccioná una categoría para consultar la agenda.",
  );
});
