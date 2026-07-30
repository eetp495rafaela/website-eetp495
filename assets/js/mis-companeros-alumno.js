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
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =====================================================
   CONFIGURACIÓN FIREBASE
===================================================== */

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
   ELEMENTOS DEL PORTAL
===================================================== */

const tarjetaMisCompanerosAlumno = document.getElementById(
  "tarjetaMisCompanerosAlumno",
);

const vistaCompanerosAlumno = document.getElementById("vistaCompanerosAlumno");

/* =====================================================
   ESTADO DEL MÓDULO
===================================================== */

let usuarioCompanerosActual = null;
let companerosAlumnoCargados = false;

/* =====================================================
   UTILIDADES
===================================================== */

function normalizarCorreoCompaneros(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarMayusculasCompaneros(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase();
}

function escaparHtmlCompaneros(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensajeCompaneros(texto, tipo = "") {
  if (!vistaCompanerosAlumno) return;

  vistaCompanerosAlumno.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "error" : ""}">
      ${escaparHtmlCompaneros(texto)}
    </p>
  `;
}

function obtenerNombreCursoCompaneros(perfilAlumno) {
  const cursoNombre = String(perfilAlumno.cursoNombre || "").trim();

  if (cursoNombre) {
    return cursoNombre;
  }

  const cursoAnio = Number(perfilAlumno.cursoAnio || 0);

  const cursoDivision = String(perfilAlumno.cursoDivision || "").trim();

  if (cursoAnio && cursoDivision) {
    return `${cursoAnio}º ${cursoDivision}`;
  }

  return "Curso no identificado";
}

function obtenerNombreCompanero(companero) {
  const nombreCompleto = String(companero.nombreCompleto || "").trim();

  if (nombreCompleto) {
    return nombreCompleto;
  }

  const apellido = String(companero.apellido || "").trim();

  const nombre = String(companero.nombre || "").trim();

  return (
    `${apellido} ${nombre}`.trim() ||
    String(companero.correo || "").trim() ||
    "Estudiante sin nombre"
  );
}

function obtenerRolesPerfilCompaneros(perfilAlumno) {
  const roles = new Set();

  const rolPrincipal = normalizarMayusculasCompaneros(perfilAlumno.rol);

  if (rolPrincipal) {
    roles.add(rolPrincipal);
  }

  if (Array.isArray(perfilAlumno.roles)) {
    perfilAlumno.roles.forEach((rol) => {
      const rolNormalizado = normalizarMayusculasCompaneros(rol);

      if (rolNormalizado) {
        roles.add(rolNormalizado);
      }
    });
  }

  return roles;
}

/* =====================================================
   PERFIL DEL ALUMNO AUTENTICADO
===================================================== */

async function obtenerPerfilAlumnoCompaneros(usuario) {
  const correo = normalizarCorreoCompaneros(usuario?.email);

  if (!correo) {
    throw new Error("No se pudo identificar el correo de la sesión activa.");
  }

  const referenciaUsuario = doc(db, "usuarios", correo);

  const documentoUsuario = await getDoc(referenciaUsuario);

  if (!documentoUsuario.exists()) {
    throw new Error("No se encontró tu perfil de estudiante.");
  }

  const datosPerfil = documentoUsuario.data();

  const estado = normalizarMayusculasCompaneros(datosPerfil.estado);

  if (estado !== "ACTIVO") {
    throw new Error("Tu cuenta no se encuentra activa.");
  }

  const roles = obtenerRolesPerfilCompaneros(datosPerfil);

  if (!roles.has("ALUMNO")) {
    throw new Error("Tu cuenta no tiene habilitado el rol de estudiante.");
  }

  const cursoId = String(datosPerfil.cursoId || "").trim();

  const cursoAnio = Number(datosPerfil.cursoAnio || 0);

  /*
   * Se conserva exactamente como está guardada en
   * Firestore. No se transforma antes de consultar.
   */
  const cursoDivision = String(datosPerfil.cursoDivision || "").trim();

  if (!cursoId && (!cursoAnio || !cursoDivision)) {
    throw new Error(
      "Tu cuenta todavía no tiene un curso asignado. Consultá con Soporte o Preceptoría.",
    );
  }

  return {
    ...datosPerfil,
    correo,
    estado,
    cursoId,
    cursoAnio,
    cursoDivision,
  };
}

/* =====================================================
   CONSULTAS DE COMPAÑEROS
===================================================== */

function crearConsultasCompaneros(perfilAlumno) {
  const cursoId = String(perfilAlumno.cursoId || "").trim();

  if (!cursoId) {
    throw new Error(
      "Tu cuenta todavía no tiene un curso identificado. Consultá con Soporte o Preceptoría.",
    );
  }

  /*
   * Consulta única y segura:
   * solamente estudiantes activos del mismo cursoId.
   *
   * Coincide exactamente con las Firestore Rules
   * utilizadas por la sección “Mis compañeros”.
   */
  const consultaCompaneros = query(
    collection(db, "usuarios"),
    where("rol", "==", "ALUMNO"),
    where("estado", "==", "ACTIVO"),
    where("cursoId", "==", cursoId),
  );

  return [consultaCompaneros];
}

function perteneceAlCursoCompaneros(companero, perfilAlumno) {
  const cursoIdCompanero = String(companero.cursoId || "").trim();

  const mismoCursoId =
    Boolean(perfilAlumno.cursoId) && cursoIdCompanero === perfilAlumno.cursoId;

  const anioCompanero = Number(companero.cursoAnio || 0);

  const divisionCompanero = normalizarMayusculasCompaneros(
    companero.cursoDivision,
  );

  const divisionAlumno = normalizarMayusculasCompaneros(
    perfilAlumno.cursoDivision,
  );

  const mismoAnioDivision =
    Boolean(perfilAlumno.cursoAnio) &&
    Boolean(divisionAlumno) &&
    anioCompanero === perfilAlumno.cursoAnio &&
    divisionCompanero === divisionAlumno;

  return mismoCursoId || mismoAnioDivision;
}

async function obtenerCompanerosDelCurso(perfilAlumno) {
  const consultas = crearConsultasCompaneros(perfilAlumno);

  if (!consultas.length) {
    throw new Error("No se pudo determinar el curso que debe consultarse.");
  }

  /*
   * Las consultas se ejecutan de manera independiente.
   * Si una consulta antigua falla, las demás continúan.
   */
  const resultados = await Promise.allSettled(
    consultas.map((consulta) => getDocs(consulta)),
  );

  const resultadosCorrectos = resultados.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  const resultadosRechazados = resultados.filter(
    (resultado) => resultado.status === "rejected",
  );

  resultadosRechazados.forEach((resultado, indice) => {
    console.warn(
      `Consulta de compañeros rechazada ${indice + 1}:`,
      resultado.reason,
    );
  });

  if (!resultadosCorrectos.length) {
    const primerError = resultadosRechazados[0]?.reason;

    console.error(
      "Todas las consultas de compañeros fueron rechazadas:",
      primerError,
    );

    if (primerError?.code === "permission-denied") {
      throw new Error(
        "Firestore rechazó la consulta de compañeros por permisos.",
      );
    }

    if (primerError?.code === "failed-precondition") {
      throw new Error(
        "Firestore necesita crear un índice para consultar los compañeros.",
      );
    }

    throw new Error(
      primerError?.message || "No se pudo consultar la lista de compañeros.",
    );
  }

  const companerosPorClave = new Map();

  resultadosCorrectos.forEach((resultado) => {
    resultado.value.forEach((documento) => {
      const datos = documento.data();

      /*
       * Verificación adicional del curso antes de mostrar
       * el registro.
       */
      if (!perteneceAlCursoCompaneros(datos, perfilAlumno)) {
        return;
      }

      const correo = normalizarCorreoCompaneros(datos.correo || documento.id);

      const clave = correo || documento.id;

      if (!companerosPorClave.has(clave)) {
        companerosPorClave.set(clave, {
          id: documento.id,
          ...datos,
          correo: datos.correo || documento.id,
        });
      }
    });
  });

  return Array.from(companerosPorClave.values());
}

/* =====================================================
   RENDERIZADO
===================================================== */

function renderizarCompanerosAlumno(companeros, perfilAlumno) {
  if (!vistaCompanerosAlumno) return;

  const correoAlumnoActual = normalizarCorreoCompaneros(
    usuarioCompanerosActual?.email,
  );

  const companerosVisibles = companeros
    .filter((companero) => {
      const correoCompanero = normalizarCorreoCompaneros(
        companero.correo || companero.id,
      );

      return correoCompanero !== correoAlumnoActual;
    })
    .sort((a, b) =>
      obtenerNombreCompanero(a).localeCompare(obtenerNombreCompanero(b), "es", {
        sensitivity: "base",
      }),
    );

  const cursoVisible = obtenerNombreCursoCompaneros(perfilAlumno);

  if (!companerosVisibles.length) {
    vistaCompanerosAlumno.innerHTML = `
      <div class="encabezado-agenda-docentes-alumno">
        <strong>Curso:</strong>
        ${escaparHtmlCompaneros(cursoVisible)}
      </div>

      <p class="mensaje-formulario">
        No se encontraron otros estudiantes activos en tu curso.
      </p>
    `;

    return;
  }

  vistaCompanerosAlumno.innerHTML = `
    <div class="encabezado-agenda-docentes-alumno">
      <strong>Curso:</strong>
      ${escaparHtmlCompaneros(cursoVisible)}

      <span>
        · ${companerosVisibles.length}
        ${companerosVisibles.length === 1 ? "compañero/a" : "compañeros/as"}
      </span>
    </div>

    <div class="grilla-companeros-alumno">
      ${companerosVisibles
        .map((companero) => {
          const nombre = obtenerNombreCompanero(companero);

          const correo = normalizarCorreoCompaneros(
            companero.correo || companero.id,
          );

          return `
            <article class="tarjeta-companero-alumno">
              <strong class="nombre-companero-alumno">
                ${escaparHtmlCompaneros(nombre)}
              </strong>

              ${
                correo
                  ? `
                    <a
                      class="correo-companero-alumno"
                      href="mailto:${escaparHtmlCompaneros(correo)}"
                    >
                      ${escaparHtmlCompaneros(correo)}
                    </a>
                  `
                  : `
                    <span class="correo-companero-alumno sin-correo">
                      Correo no cargado
                    </span>
                  `
              }
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

/* =====================================================
   CARGA PRINCIPAL
===================================================== */

async function cargarMisCompanerosAlumno() {
  if (!usuarioCompanerosActual) {
    mostrarMensajeCompaneros(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  mostrarMensajeCompaneros("Cargando integrantes de tu curso...");

  try {
    const perfilAlumno = await obtenerPerfilAlumnoCompaneros(
      usuarioCompanerosActual,
    );

    console.log("Perfil utilizado para consultar compañeros:", {
      correo: perfilAlumno.correo,
      cursoId: perfilAlumno.cursoId,
      cursoAnio: perfilAlumno.cursoAnio,
      cursoDivision: perfilAlumno.cursoDivision,
    });

    const companeros = await obtenerCompanerosDelCurso(perfilAlumno);

    renderizarCompanerosAlumno(companeros, perfilAlumno);

    companerosAlumnoCargados = true;
  } catch (error) {
    console.error("Error al cargar compañeros del alumno:", error);

    mostrarMensajeCompaneros(
      error.message || "No se pudo cargar el listado de compañeros.",
      "error",
    );
  }
}

/* =====================================================
   EVENTOS
===================================================== */

tarjetaMisCompanerosAlumno?.addEventListener("click", () => {
  setTimeout(() => {
    if (!companerosAlumnoCargados) {
      cargarMisCompanerosAlumno();
    }
  }, 250);
});

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    usuarioCompanerosActual = null;
    companerosAlumnoCargados = false;
    return;
  }

  const correoAnterior = normalizarCorreoCompaneros(
    usuarioCompanerosActual?.email,
  );

  const correoNuevo = normalizarCorreoCompaneros(usuario.email);

  usuarioCompanerosActual = usuario;

  if (correoAnterior !== correoNuevo) {
    companerosAlumnoCargados = false;
  }

  mostrarMensajeCompaneros(
    "Seleccioná la tarjeta “Mis compañeros” para consultar los integrantes de tu curso.",
  );
});
