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
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
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

const tarjetaMisDocentesAlumno = document.getElementById(
  "tarjetaMisDocentesAlumno",
);

const vistaDocentesAlumno = document.getElementById("vistaDocentesAlumno");

let usuarioDocentesAlumnoActual = null;
let docentesAlumnoCargados = false;

function normalizarCorreoDocentesAlumno(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarTextoDocentesAlumno(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase();
}

function escaparHtmlDocentesAlumno(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensajeDocentesAlumno(texto, tipo = "") {
  if (!vistaDocentesAlumno) return;

  vistaDocentesAlumno.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

function obtenerNombreCursoAlumno(perfilAlumno) {
  return (
    String(perfilAlumno.cursoNombre || "").trim() ||
    `${perfilAlumno.cursoAnio || ""}º ${perfilAlumno.cursoDivision || ""}`.trim()
  );
}

function obtenerNombreDocenteAsignacion(asignacion) {
  return (
    String(asignacion.docenteNombre || "").trim() ||
    String(asignacion.docente || "").trim() ||
    String(asignacion.docenteCorreo || "").trim() ||
    "Docente sin nombre"
  );
}

function obtenerNombreEspacioAsignacion(asignacion) {
  return (
    String(asignacion.espacioCurricular || "").trim() ||
    String(asignacion.espacioNombre || "").trim() ||
    String(asignacion.materia || "").trim() ||
    "Espacio curricular sin nombre"
  );
}

function renderizarDocentesAlumno(asignaciones, perfilAlumno) {
  if (!vistaDocentesAlumno) return;

  const cursoVisible = obtenerNombreCursoAlumno(perfilAlumno);

  if (!asignaciones.length) {
    mostrarMensajeDocentesAlumno(
      `Todavía no hay docentes cargados para ${cursoVisible || "tu curso"}.`,
    );
    return;
  }

  const asignacionesOrdenadas = [...asignaciones].sort((a, b) =>
    obtenerNombreEspacioAsignacion(a).localeCompare(
      obtenerNombreEspacioAsignacion(b),
      "es",
      { sensitivity: "base" },
    ),
  );

  vistaDocentesAlumno.innerHTML = `
    <div class="encabezado-agenda-docentes-alumno">
      <strong>Curso:</strong> ${escaparHtmlDocentesAlumno(cursoVisible)}
    </div>

    <div class="tabla-contenedor">
      <table class="tabla-usuarios tabla-docentes-alumno">
        <thead>
          <tr>
            <th>Espacio Curricular</th>
            <th>Docente</th>
            <th>Correo electrónico</th>
          </tr>
        </thead>

        <tbody>
          ${asignacionesOrdenadas
            .map((asignacion) => {
              const docenteCorreo = normalizarCorreoDocentesAlumno(
                asignacion.docenteCorreo,
              );

              return `
                <tr>
                  <td>${escaparHtmlDocentesAlumno(
                    obtenerNombreEspacioAsignacion(asignacion),
                  )}</td>
                  <td>${escaparHtmlDocentesAlumno(
                    obtenerNombreDocenteAsignacion(asignacion),
                  )}</td>
                  <td>
                    ${
                      docenteCorreo
                        ? `
                          <a
                            class="enlace-correo-docente-alumno"
                            href="mailto:${escaparHtmlDocentesAlumno(docenteCorreo)}"
                          >
                            ${escaparHtmlDocentesAlumno(docenteCorreo)}
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

async function obtenerPerfilAlumno(usuario) {
  const correo = normalizarCorreoDocentesAlumno(usuario.email);
  const referenciaUsuario = doc(db, "usuarios", correo);
  const documentoUsuario = await getDoc(referenciaUsuario);

  if (!documentoUsuario.exists()) {
    throw new Error("No se encontró tu perfil de estudiante.");
  }

  const perfilAlumno = documentoUsuario.data();

  const cursoAnio = Number(perfilAlumno.cursoAnio || 0);
  const cursoDivision = normalizarTextoDocentesAlumno(
    perfilAlumno.cursoDivision,
  );

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

async function cargarMisDocentesAlumno() {
  if (!usuarioDocentesAlumnoActual) {
    mostrarMensajeDocentesAlumno(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );
    return;
  }

  mostrarMensajeDocentesAlumno("Cargando agenda de docentes...");

  try {
    const perfilAlumno = await obtenerPerfilAlumno(usuarioDocentesAlumnoActual);

    const consultaAsignaciones = query(
      collection(db, "asignaciones_docentes"),
      where("cursoAnio", "==", perfilAlumno.cursoAnio),
      where("cursoDivision", "==", perfilAlumno.cursoDivision),
      where("estado", "==", "ACTIVA"),
    );

    const resultado = await getDocs(consultaAsignaciones);

    const asignacionesPorClave = new Map();

    resultado.forEach((documento) => {
      const datos = documento.data();

      const correoDocente = normalizarCorreoDocentesAlumno(datos.docenteCorreo);
      const espacio = obtenerNombreEspacioAsignacion(datos);
      const clave = `${espacio}_${correoDocente}`;

      if (!asignacionesPorClave.has(clave)) {
        asignacionesPorClave.set(clave, {
          id: documento.id,
          ...datos,
        });
      }
    });

    renderizarDocentesAlumno(
      Array.from(asignacionesPorClave.values()),
      perfilAlumno,
    );

    docentesAlumnoCargados = true;
  } catch (error) {
    console.error("Error al cargar docentes del alumno:", error);

    mostrarMensajeDocentesAlumno(
      error.message || "No se pudo cargar la agenda de docentes.",
      "error",
    );
  }
}

if (tarjetaMisDocentesAlumno) {
  tarjetaMisDocentesAlumno.addEventListener("click", () => {
    setTimeout(() => {
      if (!docentesAlumnoCargados) {
        cargarMisDocentesAlumno();
      }
    }, 250);
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioDocentesAlumnoActual = usuario;

  mostrarMensajeDocentesAlumno(
    "Seleccioná la tarjeta “Mis docentes” para consultar la agenda de contactos docentes.",
  );
});
