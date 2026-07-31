import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =====================================================
   ELEMENTOS DEL MÓDULO
===================================================== */

const btnVerUsuariosInactivos = document.getElementById(
  "btnVerUsuariosInactivos",
);

const cuerpoTablaUsuariosInactivos = document.getElementById(
  "cuerpoTablaUsuariosInactivos",
);

const mensajeUsuariosInactivos = document.getElementById(
  "mensajeUsuariosInactivos",
);

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const rolesLegibles = {
  ALUMNO: "Estudiante",
  DOCENTE: "Docente",
  SOPORTE: "Soporte Institucional",
  PRECEPTORIA: "Preceptoría",
  SECRETARIA: "Secretaría",
  ASISTENTE_ADMINISTRATIVO: "Asistente Administrativo",
  DIRECCION: "Dirección",
};

/* =====================================================
   UTILIDADES
===================================================== */

function normalizarMayusculas(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function escaparHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensaje(texto = "", tipo = "") {
  if (!mensajeUsuariosInactivos) {
    return;
  }

  mensajeUsuariosInactivos.textContent = texto;
  mensajeUsuariosInactivos.className = "mensaje-formulario";

  if (tipo) {
    mensajeUsuariosInactivos.classList.add(tipo);
  }
}

function mostrarFilaInformativa(texto) {
  if (!cuerpoTablaUsuariosInactivos) {
    return;
  }

  cuerpoTablaUsuariosInactivos.replaceChildren();

  const fila = document.createElement("tr");
  const celda = document.createElement("td");

  celda.colSpan = 4;
  celda.className = "tabla-vacia";
  celda.textContent = texto;

  fila.appendChild(celda);
  cuerpoTablaUsuariosInactivos.appendChild(fila);
}

function crearCelda(texto = "") {
  const celda = document.createElement("td");

  celda.textContent = texto;

  return celda;
}

function obtenerRolesUsuario(usuario) {
  const roles = new Set();

  const rolPrincipal = normalizarMayusculas(usuario.rol);

  if (rolPrincipal) {
    roles.add(rolPrincipal);
  }

  if (Array.isArray(usuario.roles)) {
    usuario.roles.forEach((rol) => {
      const rolNormalizado = normalizarMayusculas(rol);

      if (rolNormalizado) {
        roles.add(rolNormalizado);
      }
    });
  }

  if (!roles.size) {
    return "Sin rol";
  }

  return Array.from(roles)
    .map((rol) => rolesLegibles[rol] || rol)
    .join(" / ");
}

function crearCeldaUsuario(usuario, documentoId) {
  const celda = document.createElement("td");

  const nombre = document.createElement("strong");

  nombre.textContent =
    String(usuario.nombreCompleto || "").trim() || "Sin nombre registrado";

  const salto = document.createElement("br");

  const correo = document.createElement("small");

  correo.textContent =
    String(usuario.correo || documentoId || "").trim() ||
    "Sin correo registrado";

  celda.append(nombre, salto, correo);

  return celda;
}

function crearCeldaAccion(usuario) {
  const celda = document.createElement("td");

  const botonEliminar = document.createElement("button");

  botonEliminar.type = "button";
  botonEliminar.className = "btn-tabla btn-desactivar";
  botonEliminar.dataset.usuarioId = usuario.id;

  botonEliminar.innerHTML = `
  <i class="fa-solid fa-trash-can"></i>
  Eliminar
`;

  botonEliminar.addEventListener("click", async () => {
    await mostrarPrimeraConfirmacionEliminacion(usuario);
  });

  celda.appendChild(botonEliminar);

  return celda;
}

function obtenerCondicionUsuario(usuario) {
  const tipoVinculo = normalizarMayusculas(usuario.tipoVinculo);

  if (tipoVinculo === "BAJA") {
    return "BAJA";
  }

  return "INACTIVO";
}

async function mostrarPrimeraConfirmacionEliminacion(usuario) {
  const nombre =
    String(usuario.nombreCompleto || "").trim() || "Usuario sin nombre";

  const correo =
    String(usuario.correo || usuario.id || "").trim() ||
    "Sin correo registrado";

  const rol = obtenerRolesUsuario(usuario);
  const condicion = obtenerCondicionUsuario(usuario);

  if (!window.Swal) {
    console.error(
      "SweetAlert2 no está disponible para confirmar la eliminación.",
    );

    mostrarMensaje("No se pudo abrir la confirmación de eliminación.", "error");

    return;
  }

  const resultado = await Swal.fire({
    title: "¿Eliminar este usuario?",
    html: `
      <p>
        Estás por iniciar la eliminación del siguiente usuario:
      </p>

      <p>
        <strong>${escaparHtml(nombre)}</strong><br>
        ${escaparHtml(correo)}
      </p>

      <p>
        <strong>Rol:</strong> ${escaparHtml(rol)}<br>
        <strong>Condición:</strong> ${escaparHtml(condicion)}
      </p>

      <p>
        Esta acción eliminará su documento de la colección
        <strong>usuarios</strong>.
      </p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Continuar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b42318",
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
  });

  if (!resultado.isConfirmed) {
    return;
  }

  await mostrarSegundaConfirmacionEliminacion(usuario);
}

async function eliminarUsuarioDeFirestore(usuario) {
  const usuarioId = String(usuario.id || "").trim();

  const nombre =
    String(usuario.nombreCompleto || "").trim() || "Usuario sin nombre";

  if (!usuarioId) {
    mostrarMensaje("No se pudo identificar el documento del usuario.", "error");

    return;
  }

  try {
    const db = await obtenerBaseDeDatos();

    /*
     * Se elimina únicamente el documento correspondiente
     * dentro de la colección usuarios.
     */
    const referenciaUsuario = doc(db, "usuarios", usuarioId);

    await deleteDoc(referenciaUsuario);

    await Swal.fire({
      title: "Usuario eliminado",
      text: `${nombre} fue eliminado correctamente de la base de datos.`,
      icon: "success",
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
    });

    /*
     * Se vuelve a consultar la tabla para que el usuario
     * eliminado desaparezca inmediatamente del listado.
     */
    await cargarUsuariosInactivos();
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);

    const mensajeError =
      error?.code === "permission-denied"
        ? "Firestore rechazó la eliminación. Verificá que el usuario esté inactivo o dado de baja."
        : "Ocurrió un error al eliminar el usuario de la base de datos.";

    mostrarMensaje(mensajeError, "error");

    await Swal.fire({
      title: "No se pudo eliminar",
      text: mensajeError,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

async function mostrarSegundaConfirmacionEliminacion(usuario) {
  const nombre =
    String(usuario.nombreCompleto || "").trim() || "Usuario sin nombre";

  const correoEsperado = String(usuario.correo || usuario.id || "")
    .trim()
    .toLowerCase();

  if (!correoEsperado) {
    mostrarMensaje(
      "El usuario no tiene un correo válido para confirmar la eliminación.",
      "error",
    );

    return;
  }

  const resultado = await Swal.fire({
    title: "Confirmación definitiva",
    html: `
      <p>
        Para confirmar la eliminación de
        <strong>${escaparHtml(nombre)}</strong>, escribí exactamente
        su correo institucional:
      </p>

      <p>
        <strong>${escaparHtml(correoEsperado)}</strong>
      </p>
    `,
    input: "email",
    inputPlaceholder: "Escribí el correo del usuario",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirmar eliminación",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b42318",
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    inputAttributes: {
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
    },
    inputValidator: (valor) => {
      const correoIngresado = String(valor || "")
        .trim()
        .toLowerCase();

      if (!correoIngresado) {
        return "Debés escribir el correo institucional.";
      }

      if (correoIngresado !== correoEsperado) {
        return "El correo ingresado no coincide con el usuario seleccionado.";
      }

      return undefined;
    },
  });

  if (!resultado.isConfirmed) {
    return;
  }

  await eliminarUsuarioDeFirestore(usuario);
}

/* =====================================================
   FIRESTORE
===================================================== */

async function obtenerBaseDeDatos() {
  if (window.portalDb) {
    return window.portalDb;
  }

  return new Promise((resolve, reject) => {
    const tiempoMaximo = 5000;
    const intervalo = 100;
    let tiempoTranscurrido = 0;

    const comprobacion = window.setInterval(() => {
      tiempoTranscurrido += intervalo;

      if (window.portalDb) {
        window.clearInterval(comprobacion);
        resolve(window.portalDb);
        return;
      }

      if (tiempoTranscurrido >= tiempoMaximo) {
        window.clearInterval(comprobacion);

        reject(new Error("No se pudo acceder a la base de datos."));
      }
    }, intervalo);
  });
}

async function consultarUsuariosInactivos() {
  const db = await obtenerBaseDeDatos();

  const referenciaUsuarios = collection(db, "usuarios");

  /*
   * Se realizan dos consultas independientes:
   *
   * 1. Usuarios cuyo estado sea INACTIVO.
   * 2. Usuarios cuyo tipoVinculo sea BAJA.
   *
   * Luego se combinan sin repetir documentos.
   */
  const consultaInactivos = query(
    referenciaUsuarios,
    where("estado", "==", "INACTIVO"),
  );

  const consultaBajas = query(
    referenciaUsuarios,
    where("tipoVinculo", "==", "BAJA"),
  );

  const [resultadoInactivos, resultadoBajas] = await Promise.all([
    getDocs(consultaInactivos),
    getDocs(consultaBajas),
  ]);

  const usuariosPorId = new Map();

  resultadoInactivos.forEach((documento) => {
    usuariosPorId.set(documento.id, {
      id: documento.id,
      ...documento.data(),
    });
  });

  resultadoBajas.forEach((documento) => {
    usuariosPorId.set(documento.id, {
      id: documento.id,
      ...documento.data(),
    });
  });

  return Array.from(usuariosPorId.values()).sort((usuarioA, usuarioB) => {
    const nombreA = String(usuarioA.nombreCompleto || usuarioA.correo || "");

    const nombreB = String(usuarioB.nombreCompleto || usuarioB.correo || "");

    return nombreA.localeCompare(nombreB, "es", {
      sensitivity: "base",
    });
  });
}

/* =====================================================
   RENDERIZADO
===================================================== */

function mostrarUsuariosInactivos(usuarios) {
  if (!cuerpoTablaUsuariosInactivos) {
    return;
  }

  cuerpoTablaUsuariosInactivos.replaceChildren();

  if (!usuarios.length) {
    mostrarFilaInformativa(
      "No se encontraron usuarios inactivos ni dados de baja.",
    );

    return;
  }

  usuarios.forEach((usuario) => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCeldaUsuario(usuario, usuario.id));

    fila.appendChild(crearCelda(obtenerRolesUsuario(usuario)));

    fila.appendChild(crearCelda(obtenerCondicionUsuario(usuario)));

    /*
     * La eliminación se agregará en el próximo paso.
     */
    fila.appendChild(crearCeldaAccion(usuario));

    cuerpoTablaUsuariosInactivos.appendChild(fila);
  });
}

/* =====================================================
   CARGA PRINCIPAL
===================================================== */

async function cargarUsuariosInactivos() {
  if (!btnVerUsuariosInactivos) {
    return;
  }

  const contenidoOriginal = btnVerUsuariosInactivos.innerHTML;

  btnVerUsuariosInactivos.disabled = true;

  btnVerUsuariosInactivos.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Consultando usuarios...
  `;

  mostrarMensaje("");

  mostrarFilaInformativa("Consultando usuarios inactivos y dados de baja...");

  try {
    const usuarios = await consultarUsuariosInactivos();

    mostrarUsuariosInactivos(usuarios);

    mostrarMensaje(
      usuarios.length
        ? `Se encontraron ${usuarios.length} ${
            usuarios.length === 1
              ? "usuario disponible"
              : "usuarios disponibles"
          } para revisar.`
        : "No hay usuarios disponibles para revisar.",
      "ok",
    );
  } catch (error) {
    console.error("Error al consultar usuarios inactivos:", error);

    mostrarFilaInformativa("No se pudieron consultar los usuarios.");

    mostrarMensaje(
      error?.code === "permission-denied"
        ? "Firestore rechazó la consulta por permisos."
        : "Ocurrió un error al consultar los usuarios inactivos.",
      "error",
    );
  } finally {
    btnVerUsuariosInactivos.disabled = false;
    btnVerUsuariosInactivos.innerHTML = contenidoOriginal;
  }
}

/* =====================================================
   EVENTOS
===================================================== */

if (btnVerUsuariosInactivos) {
  btnVerUsuariosInactivos.addEventListener("click", cargarUsuariosInactivos);
}
