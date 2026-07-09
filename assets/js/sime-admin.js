import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SIME_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwAoJxUZp7KRFneMwMUsfilojhYM7HdBl8_JVue1T9AukKD-EIacqT7UxhdokdSO6TRdQ/exec";

const formConfiguracionSime = document.getElementById("formConfiguracionSime");
const simeCicloLectivo = document.getElementById("simeCicloLectivo");
const simeTurnoExamen = document.getElementById("simeTurnoExamen");
const simeFechaApertura = document.getElementById("simeFechaApertura");
const simeFechaCierre = document.getElementById("simeFechaCierre");
const simeEstadoInscripciones = document.getElementById(
  "simeEstadoInscripciones",
);
const simeEmailContacto = document.getElementById("simeEmailContacto");
const btnGuardarConfiguracionSime = document.getElementById(
  "btnGuardarConfiguracionSime",
);
const mensajeConfiguracionSime = document.getElementById(
  "mensajeConfiguracionSime",
);

const btnActualizarInscripcionesSime = document.getElementById(
  "btnActualizarInscripcionesSime",
);
const cuerpoTablaSimeAdmin = document.getElementById("cuerpoTablaSimeAdmin");
const mensajeSimeAdmin = document.getElementById("mensajeSimeAdmin");
const filtroSimeCurso = document.getElementById("filtroSimeCurso");
const buscarSimeAlumno = document.getElementById("buscarSimeAlumno");

let inscripcionesSimeAdmin = [];

function mostrarMensajeSimeAdmin(elemento, texto, tipo = "") {
  if (!elemento) return;

  elemento.textContent = texto || "";
  elemento.classList.remove("mensaje-error", "mensaje-ok");

  if (tipo === "error") {
    elemento.classList.add("mensaje-error");
  }

  if (tipo === "ok") {
    elemento.classList.add("mensaje-ok");
  }
}

async function enviarAlBackendSimeAdmin(datos) {
  const respuesta = await fetch(SIME_BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo conectar con el backend S.I.M.E.");
  }

  return respuesta.json();
}
function normalizarTextoSimeAdmin(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerEtiquetaEstadoInscripcionSimeAdmin(estado) {
  const valor = String(estado || "")
    .trim()
    .toUpperCase();

  if (valor === "ACTIVA") return "ACTIVA";
  if (valor === "ANULADA") return "ANULADA";

  return valor || "-";
}

function renderizarMateriasSimeAdmin(materias) {
  const lista = String(materias || "")
    .split(",")
    .map((materia) => materia.trim())
    .filter(Boolean);

  if (!lista.length) return "-";

  return `
    <div class="materias-sime-admin">
      ${lista.map((materia) => `<span>${materia}</span>`).join("")}
    </div>
  `;
}

function obtenerInscripcionesFiltradasSimeAdmin() {
  const curso = String(filtroSimeCurso?.value || "").trim();
  const busqueda = normalizarTextoSimeAdmin(buscarSimeAlumno?.value || "");

  return inscripcionesSimeAdmin.filter((inscripcion) => {
    const coincideCurso =
      !curso || String(inscripcion.cursoOrigen || "") === curso;

    const textoAlumno = normalizarTextoSimeAdmin(
      [
        inscripcion.alumnoNombre,
        inscripcion.alumnoCorreo,
        inscripcion.alumnoDni,
      ].join(" "),
    );

    const coincideBusqueda = !busqueda || textoAlumno.includes(busqueda);

    return coincideCurso && coincideBusqueda;
  });
}

function mostrarInscripcionesSimeAdmin() {
  if (!cuerpoTablaSimeAdmin) return;

  const inscripciones = obtenerInscripcionesFiltradasSimeAdmin();

  if (!inscripciones.length) {
    cuerpoTablaSimeAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          No hay inscripciones para mostrar.
        </td>
      </tr>
    `;
    return;
  }

  cuerpoTablaSimeAdmin.innerHTML = inscripciones
    .map((inscripcion) => {
      return `
        <tr>
          <td>${inscripcion.fechaInscripcion || "-"}</td>

          <td>
            <strong>${inscripcion.alumnoNombre || "-"}</strong><br>
            <small>${inscripcion.alumnoCorreo || ""}</small>
          </td>

          <td>${inscripcion.anioCursado || "-"}</td>

          <td>${renderizarMateriasSimeAdmin(inscripcion.materias)}</td>

          <td>
            <div class="acciones-sime-admin">
              <button
                class="btn-sime-icono btn-ver-permiso-admin-sime"
                type="button"
                title="Ver permiso"
                aria-label="Ver permiso"
                data-id-inscripcion="${inscripcion.idInscripcion}"
                ${inscripcion.tienePermiso ? "" : "disabled"}
              >
                <i class="fa-solid fa-eye"></i>
              </button>

              <button
                class="btn-sime-icono btn-eliminar-inscripcion-admin-sime"
                type="button"
                title="Eliminar inscripción"
                aria-label="Eliminar inscripción"
                data-id-inscripcion="${inscripcion.idInscripcion}"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function cargarInscripcionesSimeAdmin() {
  const usuario = auth.currentUser;

  if (!usuario) return;

  mostrarMensajeSimeAdmin(mensajeSimeAdmin, "Cargando inscripciones...");

  if (btnActualizarInscripcionesSime) {
    btnActualizarInscripcionesSime.disabled = true;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeAdmin({
      accion: "listar_inscripciones_admin",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar las inscripciones.",
      );
    }

    inscripcionesSimeAdmin = resultado.inscripciones || [];

    mostrarInscripcionesSimeAdmin();

    mostrarMensajeSimeAdmin(
      mensajeSimeAdmin,
      `Inscripciones cargadas: ${inscripcionesSimeAdmin.length}.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar inscripciones S.I.M.E.:", error);

    mostrarMensajeSimeAdmin(
      mensajeSimeAdmin,
      error.message || "No se pudieron cargar las inscripciones.",
      "error",
    );
  } finally {
    if (btnActualizarInscripcionesSime) {
      btnActualizarInscripcionesSime.disabled = false;
    }
  }
}
function cargarFormularioConfiguracionSime(configuracion) {
  if (!configuracion) return;

  simeCicloLectivo.value = configuracion.cicloLectivo || "";
  simeTurnoExamen.value = configuracion.turnoExamen || "";
  simeFechaApertura.value = configuracion.fechaApertura || "";
  simeFechaCierre.value = configuracion.fechaCierre || "";
  simeEstadoInscripciones.value =
    configuracion.estadoInscripciones || "CERRADO";
  simeEmailContacto.value = configuracion.emailContacto || "";
}

async function cargarConfiguracionSimeAdmin() {
  const usuario = auth.currentUser;

  if (!usuario) return;

  mostrarMensajeSimeAdmin(
    mensajeConfiguracionSime,
    "Cargando configuración S.I.M.E...",
  );

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeAdmin({
      accion: "obtener_configuracion_admin",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo obtener la configuración.",
      );
    }

    cargarFormularioConfiguracionSime(resultado.configuracion);

    mostrarMensajeSimeAdmin(
      mensajeConfiguracionSime,
      "Configuración cargada correctamente.",
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar configuración S.I.M.E.:", error);

    mostrarMensajeSimeAdmin(
      mensajeConfiguracionSime,
      error.message || "No se pudo cargar la configuración.",
      "error",
    );
  }
}
if (btnActualizarInscripcionesSime) {
  btnActualizarInscripcionesSime.addEventListener(
    "click",
    cargarInscripcionesSimeAdmin,
  );
}

[filtroSimeCurso, buscarSimeAlumno].forEach((control) => {
  if (!control) return;

  control.addEventListener("input", mostrarInscripcionesSimeAdmin);
  control.addEventListener("change", mostrarInscripcionesSimeAdmin);
});
if (formConfiguracionSime) {
  formConfiguracionSime.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = auth.currentUser;

    if (!usuario) {
      mostrarMensajeSimeAdmin(
        mensajeConfiguracionSime,
        "No se detectó una sesión activa.",
        "error",
      );
      return;
    }

    const configuracion = {
      cicloLectivo: Number(simeCicloLectivo.value || 0),
      turnoExamen: simeTurnoExamen.value.trim(),
      fechaApertura: simeFechaApertura.value.trim(),
      fechaCierre: simeFechaCierre.value.trim(),
      estadoInscripciones: simeEstadoInscripciones.value.trim(),
      emailContacto: simeEmailContacto.value.trim(),
    };

    if (!configuracion.cicloLectivo) {
      mostrarMensajeSimeAdmin(
        mensajeConfiguracionSime,
        "Ingresá el ciclo lectivo.",
        "error",
      );
      return;
    }

    if (!configuracion.turnoExamen) {
      mostrarMensajeSimeAdmin(
        mensajeConfiguracionSime,
        "Ingresá el turno de examen.",
        "error",
      );
      return;
    }

    const confirmacion = await Swal.fire({
      title: "Guardar configuración",
      text: "¿Confirmás guardar la configuración de S.I.M.E.?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    btnGuardarConfiguracionSime.disabled = true;

    mostrarMensajeSimeAdmin(
      mensajeConfiguracionSime,
      "Guardando configuración...",
    );

    try {
      const idToken = await usuario.getIdToken(true);

      const resultado = await enviarAlBackendSimeAdmin({
        accion: "guardar_configuracion_admin",
        idToken,
        configuracion,
      });

      if (!resultado.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo guardar la configuración.",
        );
      }

      cargarFormularioConfiguracionSime(resultado.configuracion);

      mostrarMensajeSimeAdmin(
        mensajeConfiguracionSime,
        resultado.mensaje || "Configuración guardada correctamente.",
        "ok",
      );

      await Swal.fire({
        title: "Configuración guardada",
        text: "Los cambios fueron aplicados correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error al guardar configuración S.I.M.E.:", error);

      mostrarMensajeSimeAdmin(
        mensajeConfiguracionSime,
        error.message || "No se pudo guardar la configuración.",
        "error",
      );
    } finally {
      btnGuardarConfiguracionSime.disabled = false;
    }
  });
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  await cargarConfiguracionSimeAdmin();
  await cargarInscripcionesSimeAdmin();
});
