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
const filtroSimeAnioCursado = document.getElementById("filtroSimeAnioCursado");
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
function cargarFiltroAniosCursadoSimeAdmin() {
  if (!filtroSimeAnioCursado) return;

  const anios = [
    ...new Set(
      inscripcionesSimeAdmin
        .map((inscripcion) => Number(inscripcion.anioCursado || 0))
        .filter(Boolean),
    ),
  ].sort((a, b) => b - a);

  filtroSimeAnioCursado.innerHTML = `
    <option value="">Todos los años</option>
    ${anios.map((anio) => `<option value="${anio}">${anio}</option>`).join("")}
  `;
}
function obtenerInscripcionesFiltradasSimeAdmin() {
  const curso = String(filtroSimeCurso?.value || "").trim();
  const anioCursado = String(filtroSimeAnioCursado?.value || "").trim();
  const busqueda = normalizarTextoSimeAdmin(buscarSimeAlumno?.value || "");

  return inscripcionesSimeAdmin.filter((inscripcion) => {
    const coincideCurso =
      !curso || String(inscripcion.cursoOrigen || "") === curso;

    const coincideAnioCursado =
      !anioCursado || String(inscripcion.anioCursado || "") === anioCursado;

    const textoAlumno = normalizarTextoSimeAdmin(
      [
        inscripcion.alumnoNombre,
        inscripcion.alumnoCorreo,
        inscripcion.alumnoDni,
      ].join(" "),
    );

    const coincideBusqueda = !busqueda || textoAlumno.includes(busqueda);

    return coincideCurso && coincideAnioCursado && coincideBusqueda;
  });
}

function mostrarInscripcionesSimeAdmin() {
  if (!inscripciones.length) {
    cuerpoTablaSimeAdmin.innerHTML = `
    <tr>
      <td colspan="6" class="tabla-vacia">
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
          <td>${String(inscripcion.fechaInscripcion || "-").split(" ")[0]}</td>

        <td>
  <strong>${inscripcion.alumnoNombre || "-"}</strong>
</td>
<td>${inscripcion.anioCursado || "-"}</td>
<td>${inscripcion.cursoOrigen ? `${inscripcion.cursoOrigen}º` : "-"}</td>
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
function convertirBase64ABlobSimeAdmin(base64, tipoMime) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: tipoMime || "application/pdf",
  });
}

async function abrirPermisoAdminSime(idInscripcion, boton) {
  const usuario = auth.currentUser;

  if (!usuario) return;

  const ventanaPermiso = window.open("", "_blank");

  if (boton) {
    boton.disabled = true;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeAdmin({
      accion: "obtener_permiso_inscripcion_admin",
      idToken,
      idInscripcion,
    });

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudo obtener el permiso.");
    }

    const blob = convertirBase64ABlobSimeAdmin(
      resultado.permisoBase64,
      resultado.tipoMime,
    );

    const url = URL.createObjectURL(blob);

    if (ventanaPermiso) {
      ventanaPermiso.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  } catch (error) {
    console.error("Error al abrir permiso S.I.M.E.:", error);

    if (ventanaPermiso) {
      ventanaPermiso.close();
    }

    Swal.fire({
      title: "No se pudo abrir el permiso",
      text: error.message || "Ocurrió un error al obtener el PDF.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton) {
      boton.disabled = false;
    }
  }
}

async function eliminarInscripcionAdminSime(idInscripcion, boton) {
  const usuario = auth.currentUser;

  if (!usuario) return;

  const confirmacion = await Swal.fire({
    title: "Eliminar inscripción",
    text: "Se eliminará la inscripción y también el PDF generado en Drive. Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmacion.isConfirmed) return;

  if (boton) {
    boton.disabled = true;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeAdmin({
      accion: "eliminar_inscripcion_admin",
      idToken,
      idInscripcion,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo eliminar la inscripción.",
      );
    }

    await Swal.fire({
      title: "Inscripción eliminada",
      text: resultado.mensaje || "La inscripción fue eliminada correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarInscripcionesSimeAdmin();
  } catch (error) {
    console.error("Error al eliminar inscripción S.I.M.E.:", error);

    Swal.fire({
      title: "No se pudo eliminar",
      text: error.message || "Ocurrió un error al eliminar la inscripción.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton) {
      boton.disabled = false;
    }
  }
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

    cargarFiltroAniosCursadoSimeAdmin();
    mostrarInscripcionesSimeAdmin();

    mostrarMensajeSimeAdmin(
      mensajeSimeAdmin,
      `Inscripciones cargadas: ${inscripcionesSimeAdmin.length}`,
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

if (cuerpoTablaSimeAdmin) {
  cuerpoTablaSimeAdmin.addEventListener("click", async (event) => {
    const botonVer = event.target.closest(".btn-ver-permiso-admin-sime");

    if (botonVer) {
      const idInscripcion = botonVer.dataset.idInscripcion;
      await abrirPermisoAdminSime(idInscripcion, botonVer);
      return;
    }

    const botonEliminar = event.target.closest(
      ".btn-eliminar-inscripcion-admin-sime",
    );

    if (botonEliminar) {
      const idInscripcion = botonEliminar.dataset.idInscripcion;
      await eliminarInscripcionAdminSime(idInscripcion, botonEliminar);
    }
  });
}

[filtroSimeCurso, filtroSimeAnioCursado, buscarSimeAlumno].forEach(
  (control) => {
    if (!control) return;

    control.addEventListener("input", mostrarInscripcionesSimeAdmin);
    control.addEventListener("change", mostrarInscripcionesSimeAdmin);
  },
);
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
