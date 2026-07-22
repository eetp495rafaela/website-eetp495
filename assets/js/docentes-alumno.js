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

const tarjetaMisDocentesAlumno = document.getElementById(
  "tarjetaMisDocentesAlumno",
);

const vistaDocentesAlumno = document.getElementById("vistaDocentesAlumno");
const vistaReferentesAlumno = document.getElementById("vistaReferentesAlumno");

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

function textoCargoReferenteAlumno(cargo) {
  const cargos = {
    DIRECTORA: "Director/a",
    VICE_DIRECTORA: "Vice Director/a",
    SECRETARIO: "Secretario/a",
    PRO_SECRETARIO: "Pro Secretario/a",
    PRECEPTOR: "Preceptor/a",
  };

  return cargos[normalizarTextoDocentesAlumno(cargo)] || cargo;
}

function iconoCargoReferenteAlumno(cargo) {
  const iconos = {
    DIRECTORA: "fa-solid fa-user-tie",
    VICE_DIRECTORA: "fa-solid fa-user-tie",
    SECRETARIO: "fa-solid fa-folder-open",
    PRO_SECRETARIO: "fa-solid fa-folder-tree",
    PRECEPTOR: "fa-solid fa-people-roof",
  };

  return iconos[normalizarTextoDocentesAlumno(cargo)] || "fa-solid fa-user";
}

function mostrarMensajeReferentesAlumno(texto, tipo = "") {
  if (!vistaReferentesAlumno) return;

  vistaReferentesAlumno.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "error" : ""}">
      ${escaparHtmlDocentesAlumno(texto)}
    </p>
  `;
}

function referenteCorrespondeCursoAlumno(referente, perfilAlumno) {
  const anioReferente = Number(referente.cursoAnio || 0);

  const divisionReferente = normalizarTextoDocentesAlumno(
    referente.cursoDivision,
  );

  return (
    anioReferente === Number(perfilAlumno.cursoAnio) &&
    divisionReferente ===
      normalizarTextoDocentesAlumno(perfilAlumno.cursoDivision)
  );
}

function renderizarReferentesAlumno(referentes, perfilAlumno) {
  if (!vistaReferentesAlumno) return;

  const cursoVisible = obtenerNombreCursoAlumno(perfilAlumno);

  const cargosInstitucionales = [
    "DIRECTORA",
    "VICE_DIRECTORA",
    "SECRETARIO",
    "PRO_SECRETARIO",
  ];

  const referentesVisibles = cargosInstitucionales.map((cargo) => ({
    cargo,
    referente: referentes.find(
      (item) => normalizarTextoDocentesAlumno(item.cargo) === cargo,
    ),
  }));

  const preceptorCurso = referentes.find(
    (item) =>
      normalizarTextoDocentesAlumno(item.cargo) === "PRECEPTOR" &&
      referenteCorrespondeCursoAlumno(item, perfilAlumno),
  );

  referentesVisibles.push({
    cargo: "PRECEPTOR",
    referente: preceptorCurso,
  });

  vistaReferentesAlumno.innerHTML = `
    <div class="cabecera-referentes-alumno">
      <div>
        <span class="etiqueta-referentes-alumno">
          Referentes institucionales
        </span>

        <strong>
          ${escaparHtmlDocentesAlumno(cursoVisible || "Curso del estudiante")}
        </strong>
      </div>
    </div>

    <div class="grilla-referentes-alumno">
      ${referentesVisibles
        .map(({ cargo, referente }) => {
          const nombre = String(referente?.nombreCompleto || "").trim();

          const correo = normalizarCorreoDocentesAlumno(referente?.correo);

          return `
            <article class="tarjeta-referente-alumno">
              <div class="icono-referente-alumno">
                <i class="${iconoCargoReferenteAlumno(cargo)}"></i>
              </div>

              <div class="datos-referente-alumno">
                <span class="cargo-referente-alumno">
                  ${escaparHtmlDocentesAlumno(textoCargoReferenteAlumno(cargo))}
                </span>

                <strong class="nombre-referente-alumno">
                  ${nombre ? escaparHtmlDocentesAlumno(nombre) : "Sin asignar"}
                </strong>

                ${
                  correo
                    ? `
                      <a
                        class="correo-referente-alumno"
                        href="mailto:${escaparHtmlDocentesAlumno(correo)}"
                      >
                        <i class="fa-solid fa-envelope"></i>
                        ${escaparHtmlDocentesAlumno(correo)}
                      </a>
                    `
                    : `
                      <span class="correo-referente-alumno sin-correo">
                        Información no disponible
                      </span>
                    `
                }
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

async function obtenerReferentesActivosAlumno() {
  const consultaReferentes = query(
    collection(db, "referentes_institucionales"),
    where("estado", "==", "ACTIVO"),
  );

  const resultadoReferentes = await getDocs(consultaReferentes);

  return resultadoReferentes.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
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

    try {
      const referentes = await obtenerReferentesActivosAlumno();

      renderizarReferentesAlumno(referentes, perfilAlumno);
    } catch (errorReferentes) {
      console.error("Error al cargar referentes del alumno:", errorReferentes);

      mostrarMensajeReferentesAlumno(
        "No se pudieron cargar los referentes institucionales.",
        "error",
      );
    }

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
  mostrarMensajeReferentesAlumno(
    "Los referentes institucionales se cargarán automáticamente junto con la agenda docente.",
  );

  mostrarMensajeDocentesAlumno(
    "Seleccioná la tarjeta “Mis docentes” para consultar la agenda de contactos docentes.",
  );
});
