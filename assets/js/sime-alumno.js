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

const btnVerMisInscripcionesSime = document.getElementById(
  "btnVerMisInscripcionesSime",
);

let configuracionSimeAlumno = null;
let alumnoSime = null;
const rolUsuarioEncabezado = document.querySelector("[data-rol-usuario]");

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
function formatearFechaVisibleSime(fechaTexto) {
  const texto = String(fechaTexto || "").trim();

  if (!texto) return "";

  const partes = texto.split("-");

  if (partes.length !== 3) {
    return texto;
  }

  const [anio, mes, dia] = partes;

  return `${dia}/${mes}/${anio}`;
}

function limpiarFormularioInscripcionSime() {
  if (formInscripcionSime) {
    formInscripcionSime.reset();
  }

  if (listaMateriasSime) {
    listaMateriasSime.innerHTML = `
      <p class="mensaje-lista-sime">
        Seleccioná primero el curso de origen.
      </p>
    `;
  }

  cargarAniosCursadoSime(configuracionSimeAlumno?.aniosCursado || []);

  mostrarMensajeSime(mensajeInscripcionSime, "");
}

async function mostrarAvisoInscripcionesCerradasSime() {
  const fechaApertura = formatearFechaVisibleSime(
    configuracionSimeAlumno?.fechaApertura,
  );

  const mensaje = fechaApertura
    ? `Las inscripciones abren el ${fechaApertura}.`
    : "Las inscripciones todavía no se encuentran abiertas.";

  await Swal.fire({
    title: "Inscripciones no disponibles",
    html: `
      <p>${mensaje}</p>
      <p>A partir de la fecha indicada podrás registrar tu inscripción.</p>
    `,
    icon: "info",
    confirmButtonText: "Aceptar",
  });

  limpiarFormularioInscripcionSime();
}
function obtenerEtiquetaSituacionRevistaSime(tipoVinculo) {
  const valor = String(tipoVinculo || "")
    .trim()
    .toUpperCase();

  const etiquetas = {
    CURSANDO: "Cursando",
    CURSADA_COMPLETA: "Cursada completa",
    TITULAR: "Titular",
    INTERINO: "Interino/a",
    REEMPLAZANTE: "Reemplazante",
  };

  return etiquetas[valor] || valor || "";
}

function actualizarEncabezadoAlumnoSime(alumno) {
  if (!rolUsuarioEncabezado || !alumno) return;

  const situacion = obtenerEtiquetaSituacionRevistaSime(alumno.tipoVinculo);

  const curso = String(alumno.cursoNombre || "").trim();

  if (curso && situacion) {
    rolUsuarioEncabezado.textContent = `Estudiante · ${curso} · ${situacion}`;
    return;
  }

  if (situacion) {
    rolUsuarioEncabezado.textContent = `Estudiante · ${situacion}`;
    return;
  }

  rolUsuarioEncabezado.textContent = "Estudiante";
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

function formatearTurnoSime(turno) {
  const texto = String(turno || "").trim();

  if (!texto) {
    return "";
  }

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const fecha = new Date(texto);

  if (!Number.isNaN(fecha.getTime())) {
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  const coincidenciaFecha = texto.match(/^(\d{4})-(\d{2})-\d{2}/);

  if (coincidenciaFecha) {
    const anio = coincidenciaFecha[1];
    const mes = Number(coincidenciaFecha[2]);

    if (mes >= 1 && mes <= 12) {
      return `${meses[mes - 1]} ${anio}`;
    }
  }

  const coincidenciaMesAnio = texto.match(
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+(\d{4})/i,
  );

  if (coincidenciaMesAnio) {
    const mesTexto = coincidenciaMesAnio[1].toLowerCase();
    const anio = coincidenciaMesAnio[2];

    const mapaMeses = {
      enero: "Enero",
      febrero: "Febrero",
      marzo: "Marzo",
      abril: "Abril",
      mayo: "Mayo",
      junio: "Junio",
      julio: "Julio",
      agosto: "Agosto",
      septiembre: "Septiembre",
      setiembre: "Septiembre",
      octubre: "Octubre",
      noviembre: "Noviembre",
      diciembre: "Diciembre",
    };

    return `${mapaMeses[mesTexto]} ${anio}`;
  }

  return texto;
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
          <td>${formatearTurnoSime(inscripcion.turnoExamen)}</td>
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
  title="Ver permiso"
  aria-label="Ver permiso"
>
  <i class="fa-solid fa-eye"></i>
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

function convertirBase64ABlobSime(base64, tipoMime = "application/pdf") {
  const caracteres = atob(base64);
  const bytes = new Uint8Array(caracteres.length);

  for (let indice = 0; indice < caracteres.length; indice += 1) {
    bytes[indice] = caracteres.charCodeAt(indice);
  }

  return new Blob([bytes], {
    type: tipoMime,
  });
}

async function abrirPermisoSime(idInscripcion, boton) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa.");
  }

  const ventanaPermiso = window.open("", "_blank");

  if (!ventanaPermiso) {
    throw new Error(
      "El navegador bloqueó la apertura del permiso. Permití ventanas emergentes para este sitio.",
    );
  }

  ventanaPermiso.document.write(`
    <p style="font-family: Arial, sans-serif; padding: 20px;">
      Preparando permiso de examen...
    </p>
  `);

  boton.disabled = true;

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSime({
      accion: "obtener_permiso_inscripcion",
      idToken,
      idInscripcion,
    });

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudo abrir el permiso.");
    }

    const blobPdf = convertirBase64ABlobSime(
      resultado.permisoBase64,
      resultado.tipoMime || "application/pdf",
    );

    const urlPdf = URL.createObjectURL(blobPdf);

    ventanaPermiso.location.href = urlPdf;

    setTimeout(() => {
      URL.revokeObjectURL(urlPdf);
    }, 60000);
  } catch (error) {
    ventanaPermiso.close();
    throw error;
  } finally {
    boton.disabled = false;
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

if (cuerpoTablaInscripcionesSime) {
  cuerpoTablaInscripcionesSime.addEventListener("click", async (event) => {
    const botonVer = event.target.closest(".btn-ver-permiso-sime");

    if (!botonVer) return;

    const idInscripcion = String(botonVer.dataset.idInscripcion || "").trim();

    if (!idInscripcion) {
      mostrarMensajeSime(
        mensajeListadoSime,
        "No se pudo identificar la inscripción.",
        "error",
      );
      return;
    }

    try {
      await abrirPermisoSime(idInscripcion, botonVer);
    } catch (error) {
      console.error("Error al abrir permiso S.I.M.E.:", error);

      mostrarMensajeSime(
        mensajeListadoSime,
        error.message || "No se pudo abrir el permiso.",
        "error",
      );
    }
  });
}

if (formInscripcionSime) {
  formInscripcionSime.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = auth.currentUser;

    if (!usuario) {
      mostrarMensajeSime(
        mensajeInscripcionSime,
        "No se detectó una sesión activa.",
        "error",
      );
      return;
    }
    const estadoRealInscripciones =
      configuracionSimeAlumno?.estadoRealInscripciones;

    if (estadoRealInscripciones && estadoRealInscripciones.abierto === false) {
      await mostrarAvisoInscripcionesCerradasSime();
      return;
    }

    const anioCursado = Number(anioCursadoSime?.value || 0);
    const cursoOrigen = Number(cursoOrigenSime?.value || 0);

    const materiasSeleccionadas = Array.from(
      document.querySelectorAll('input[name="materiaSime"]:checked'),
    ).map((checkbox) => checkbox.value);

    if (!anioCursado) {
      mostrarMensajeSime(
        mensajeInscripcionSime,
        "Seleccioná el año en que cursaste la materia.",
        "error",
      );
      return;
    }

    if (!cursoOrigen) {
      mostrarMensajeSime(
        mensajeInscripcionSime,
        "Seleccioná el curso de origen.",
        "error",
      );
      return;
    }

    if (!materiasSeleccionadas.length) {
      mostrarMensajeSime(
        mensajeInscripcionSime,
        "Seleccioná al menos una materia para rendir.",
        "error",
      );
      return;
    }

    if (materiasSeleccionadas.length > 12) {
      mostrarMensajeSime(
        mensajeInscripcionSime,
        "No podés seleccionar más de 12 materias en una inscripción.",
        "error",
      );
      return;
    }

    btnRegistrarInscripcionSime.disabled = true;

    mostrarMensajeSime(
      mensajeInscripcionSime,
      "Registrando inscripción y generando permiso...",
    );

    try {
      const idToken = await usuario.getIdToken(true);

      const resultado = await enviarAlBackendSime({
        accion: "registrar_inscripcion",
        idToken,
        anioCursado,
        cursoOrigen,
        espaciosIds: materiasSeleccionadas,
      });

      if (!resultado.ok) {
        throw new Error(
          resultado.mensaje || "No se pudo registrar la inscripción.",
        );
      }

      await Swal.fire({
        title: "Inscripción registrada",
        html: `
          <p>Tu inscripción fue registrada correctamente.</p>
          <p>Ya podés ver el permiso desde <strong>Mis inscripciones</strong>.</p>
        `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      formInscripcionSime.reset();

      if (listaMateriasSime) {
        listaMateriasSime.innerHTML = `
          <p class="mensaje-lista-sime">
            Seleccioná primero el curso de origen.
          </p>
        `;
      }

      cargarAniosCursadoSime(configuracionSimeAlumno?.aniosCursado || []);

      await cargarMisInscripcionesSime();

      mostrarMensajeSime(
        mensajeInscripcionSime,
        "Inscripción registrada correctamente.",
        "ok",
      );
    } catch (error) {
      console.error("Error al registrar inscripción S.I.M.E.:", error);

      mostrarMensajeSime(
        mensajeInscripcionSime,
        error.message || "No se pudo registrar la inscripción.",
        "error",
      );
    } finally {
      btnRegistrarInscripcionSime.disabled = false;
    }
  });
}

if (btnVerMisInscripcionesSime) {
  btnVerMisInscripcionesSime.addEventListener("click", async () => {
    btnVerMisInscripcionesSime.disabled = true;

    const textoOriginal = btnVerMisInscripcionesSime.innerHTML;

    btnVerMisInscripcionesSime.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarMisInscripcionesSime();
    } finally {
      btnVerMisInscripcionesSime.disabled = false;
      btnVerMisInscripcionesSime.innerHTML = textoOriginal;
    }
  });
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  try {
    const resultadoSime = await cargarConfiguracionSimeAlumno(usuario);

    alumnoSime = resultadoSime.alumno;
    configuracionSimeAlumno = resultadoSime.configuracion;

    actualizarEncabezadoAlumnoSime(alumnoSime);

    cargarAniosCursadoSime(configuracionSimeAlumno.aniosCursado || []);
  } catch (error) {
    console.error("Error al cargar S.I.M.E.:", error);
  }
});
