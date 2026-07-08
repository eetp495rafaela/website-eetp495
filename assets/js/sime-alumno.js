import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const BACKEND_SIME_URL =
  "https://script.google.com/macros/s/AKfycbwAoJxUZp7KRFneMwMUsfilojhYM7HdBl8_JVue1T9AukKD-EIacqT7UxhdokdSO6TRdQ/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const estadoSimeAlumno = document.getElementById("estadoSimeAlumno");

const formInscripcionSime = document.getElementById("formInscripcionSime");

const anioCursadoSime = document.getElementById("anioCursadoSime");

const cursoOrigenSime = document.getElementById("cursoOrigenSime");

const listaMateriasSime = document.getElementById("listaMateriasSime");

const btnRegistrarInscripcionSime = document.getElementById(
  "btnRegistrarInscripcionSime",
);

const mensajeInscripcionSime = document.getElementById(
  "mensajeInscripcionSime",
);

const cuerpoTablaInscripcionesSime = document.getElementById(
  "cuerpoTablaInscripcionesSime",
);

const mensajeListadoSime = document.getElementById("mensajeListadoSime");

let configuracionSimeAlumno = null;
let alumnoSime = null;

async function enviarAlBackendSime(datos) {
  const respuesta = await fetch(BACKEND_SIME_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo establecer comunicación con S.I.M.E.");
  }

  return respuesta.json();
}

function mostrarMensajeSime(elemento, texto, tipo = "") {
  if (!elemento) return;

  elemento.textContent = texto;
  elemento.className = `mensaje-formulario ${tipo}`.trim();
}

function mostrarEstadoSime(configuracion) {
  if (!estadoSimeAlumno) return;

  const estado = String(configuracion.estadoInscripciones || "CERRADO")
    .trim()
    .toUpperCase();

  const turno = String(configuracion.turnoExamen || "").trim();

  estadoSimeAlumno.classList.remove("abierto", "cerrado");

  if (estado === "ABIERTO") {
    estadoSimeAlumno.classList.add("abierto");
    estadoSimeAlumno.textContent = `Inscripciones abiertas para el turno ${turno}.`;
    return;
  }

  estadoSimeAlumno.classList.add("cerrado");
  estadoSimeAlumno.textContent = `Las inscripciones para el turno ${turno} no se encuentran abiertas.`;
}

function cargarAniosCursadoSime(anios) {
  if (!anioCursadoSime) return;

  anioCursadoSime.innerHTML = '<option value="">Seleccionar año</option>';

  (anios || []).forEach((anio) => {
    const opcion = document.createElement("option");

    opcion.value = String(anio);
    opcion.textContent = String(anio);

    anioCursadoSime.appendChild(opcion);
  });
}

function bloquearFormularioSime(bloquear) {
  if (!formInscripcionSime) return;

  const controles = formInscripcionSime.querySelectorAll(
    "input, select, button",
  );

  controles.forEach((control) => {
    control.disabled = bloquear;
  });
}

function mostrarMateriasSime(materias) {
  if (!listaMateriasSime) return;

  if (!Array.isArray(materias) || !materias.length) {
    listaMateriasSime.innerHTML = `
      <p class="mensaje-lista-sime">
        No hay materias disponibles para el curso seleccionado.
      </p>
    `;
    return;
  }

  listaMateriasSime.innerHTML = materias
    .map((materia) => {
      const espacioId = String(materia.espacioId || "").trim();
      const nombre = String(materia.nombre || "").trim();

      return `
        <label class="item-materia-sime">
          <input
            type="checkbox"
            name="materiaSime"
            value="${espacioId}"
          />
          <span>${nombre}</span>
        </label>
      `;
    })
    .join("");
}

async function cargarMateriasCursoSime() {
  const usuario = auth.currentUser;

  if (!usuario || !cursoOrigenSime || !listaMateriasSime) return;

  const cursoOrigen = Number(cursoOrigenSime.value || 0);

  if (!cursoOrigen) {
    listaMateriasSime.innerHTML = `
      <p class="mensaje-lista-sime">
        Seleccioná primero el curso de origen.
      </p>
    `;
    return;
  }

  listaMateriasSime.innerHTML = `
    <p class="mensaje-lista-sime">
      Cargando materias...
    </p>
  `;

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSime({
      accion: "obtener_materias_por_curso",
      idToken,
      cursoOrigen,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar las materias.",
      );
    }

    mostrarMateriasSime(resultado.materias || []);
  } catch (error) {
    console.error("Error al cargar materias S.I.M.E.:", error);

    listaMateriasSime.innerHTML = `
      <p class="mensaje-lista-sime">
        No se pudieron cargar las materias.
      </p>
    `;

    mostrarMensajeSime(
      mensajeInscripcionSime,
      error.message || "No se pudieron cargar las materias.",
      "error",
    );
  }
}

function obtenerEtiquetaEstadoSime(estado) {
  const estadoNormalizado = String(estado || "")
    .trim()
    .toUpperCase();

  if (estadoNormalizado === "ACTIVA") {
    return "Activa";
  }

  if (estadoNormalizado === "ANULADA") {
    return "Anulada";
  }

  return estadoNormalizado || "Sin estado";
}

function mostrarInscripcionesSime(inscripciones) {
  if (!cuerpoTablaInscripcionesSime) return;

  if (!Array.isArray(inscripciones) || !inscripciones.length) {
    cuerpoTablaInscripcionesSime.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          Todavía no tenés inscripciones registradas.
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTablaInscripcionesSime.innerHTML = inscripciones
    .map((inscripcion) => {
      const idInscripcion = String(inscripcion.idInscripcion || "").trim();

      return `
        <tr>
          <td>${inscripcion.fechaInscripcion || ""}</td>
          <td>${inscripcion.turnoExamen || ""}</td>
          <td>
            <span class="etiqueta-estado-sime">
              ${obtenerEtiquetaEstadoSime(inscripcion.estado)}
            </span>
          </td>
          <td>
            ${
              inscripcion.tienePermiso
                ? `
                  <button
                    class="btn-ver-permiso-sime"
                    type="button"
                    data-id-inscripcion="${idInscripcion}"
                  >
                    <i class="fa-solid fa-eye"></i>
                    Ver
                  </button>
                `
                : "Sin permiso"
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

async function cargarMisInscripcionesSime() {
  if (!cuerpoTablaInscripcionesSime) return;

  const usuario = auth.currentUser;

  if (!usuario) return;

  cuerpoTablaInscripcionesSime.innerHTML = `
    <tr>
      <td colspan="4" class="tabla-vacia">
        Cargando tus inscripciones...
      </td>
    </tr>
  `;

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSime({
      accion: "listar_mis_inscripciones",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar tus inscripciones.",
      );
    }

    mostrarInscripcionesSime(resultado.inscripciones || []);
    mostrarMensajeSime(mensajeListadoSime, "");
  } catch (error) {
    console.error("Error al cargar inscripciones S.I.M.E.:", error);

    cuerpoTablaInscripcionesSime.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No se pudieron cargar tus inscripciones.
        </td>
      </tr>
    `;

    mostrarMensajeSime(
      mensajeListadoSime,
      error.message || "No se pudieron cargar tus inscripciones.",
      "error",
    );
  }
}

async function cargarConfiguracionSimeAlumno(usuario) {
  const idToken = await usuario.getIdToken(true);

  const resultado = await enviarAlBackendSime({
    accion: "obtener_configuracion_alumno",
    idToken,
  });

  if (!resultado.ok) {
    throw new Error(
      resultado.mensaje || "No se pudo cargar la configuración de S.I.M.E.",
    );
  }

  console.log("Configuración S.I.M.E. Alumno:", resultado);

  return resultado;
}

if (cursoOrigenSime) {
  cursoOrigenSime.addEventListener("change", cargarMateriasCursoSime);
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  try {
    await cargarConfiguracionSimeAlumno(usuario);
    await cargarMisInscripcionesSime();
  } catch (error) {
    console.error("Error al cargar S.I.M.E.:", error);
  }
});
