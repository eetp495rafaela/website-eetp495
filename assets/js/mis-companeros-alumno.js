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

const tarjetaMisCompanerosAlumno = document.getElementById(
  "tarjetaMisCompanerosAlumno",
);

const vistaCompanerosAlumno = document.getElementById("vistaCompanerosAlumno");

let usuarioCompanerosActual = null;
let companerosAlumnoCargados = false;

function normalizarCorreoCompaneros(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarTextoCompaneros(texto) {
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
  return (
    String(perfilAlumno.cursoNombre || "").trim() ||
    `${perfilAlumno.cursoAnio || ""}º ${
      perfilAlumno.cursoDivision || ""
    }`.trim()
  );
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

async function obtenerPerfilAlumnoCompaneros(usuario) {
  const correo = normalizarCorreoCompaneros(usuario.email);

  const referenciaUsuario = doc(db, "usuarios", correo);
  const documentoUsuario = await getDoc(referenciaUsuario);

  if (!documentoUsuario.exists()) {
    throw new Error("No se encontró tu perfil de estudiante.");
  }

  const perfilAlumno = documentoUsuario.data();

  const cursoAnio = Number(perfilAlumno.cursoAnio || 0);

  const cursoDivision = normalizarTextoCompaneros(perfilAlumno.cursoDivision);

  if (!cursoAnio || !cursoDivision) {
    throw new Error(
      "Tu cuenta todavía no tiene un curso asignado. Consultá con Soporte o Preceptoría.",
    );
  }

  return {
    ...perfilAlumno,
    cursoAnio,
    cursoDivision,
  };
}

async function obtenerCompanerosDelCurso(perfilAlumno) {
  const condicionesComunes = [
    where("rol", "==", "ALUMNO"),
    where("estado", "==", "ACTIVO"),
    where("cursoAnio", "==", perfilAlumno.cursoAnio),
    where("cursoDivision", "==", perfilAlumno.cursoDivision),
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

  const consultasCorrectas = resultados.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  if (!consultasCorrectas.length) {
    throw new Error("No se pudo consultar el listado de estudiantes.");
  }

  const companerosPorClave = new Map();

  consultasCorrectas.forEach((resultado) => {
    resultado.value.forEach((documento) => {
      const datos = documento.data();

      const correo = normalizarCorreoCompaneros(datos.correo || documento.id);

      const clave = correo || documento.id;

      if (!companerosPorClave.has(clave)) {
        companerosPorClave.set(clave, {
          id: documento.id,
          ...datos,
        });
      }
    });
  });

  return Array.from(companerosPorClave.values());
}

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

tarjetaMisCompanerosAlumno?.addEventListener("click", () => {
  setTimeout(() => {
    if (!companerosAlumnoCargados) {
      cargarMisCompanerosAlumno();
    }
  }, 250);
});

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioCompanerosActual = usuario;

  mostrarMensajeCompaneros(
    "Seleccioná la tarjeta “Mis compañeros” para consultar los integrantes de tu curso.",
  );
});
