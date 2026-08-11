import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =====================================================
   SOLICITUDES DE ALTA DE ESTUDIANTES
   PANEL DE SOPORTE

   ESTADOS:
   - PENDIENTE
   - APROBADA
   - RECHAZADA
===================================================== */

/* =====================================================
   ELEMENTOS
===================================================== */

const btnVerSolicitudesAlta = document.getElementById("btnVerSolicitudesAlta");

const cuerpoTablaSolicitudesAlta = document.getElementById(
  "cuerpoTablaSolicitudesAlta",
);

const mensajeSolicitudesAlta = document.getElementById(
  "mensajeSolicitudesAlta",
);

/* =====================================================
   MODAL DE CONFIRMACIÓN
===================================================== */

const modalConfirmacionSolicitud = document.getElementById(
  "modalConfirmacionSolicitud",
);

const tituloModalConfirmacion = document.getElementById(
  "tituloModalConfirmacion",
);

const textoModalConfirmacion = document.getElementById(
  "textoModalConfirmacion",
);

const iconoModalConfirmacion = document.getElementById(
  "iconoModalConfirmacion",
);

const btnCancelarModalConfirmacion = document.getElementById(
  "btnCancelarModalConfirmacion",
);

const btnAceptarModalConfirmacion = document.getElementById(
  "btnAceptarModalConfirmacion",
);

/* =====================================================
   UTILIDADES
===================================================== */

function normalizarCorreo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function normalizarEstado(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function normalizarDni(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .trim();
}

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensaje(texto = "", tipo = "") {
  if (!mensajeSolicitudesAlta) {
    return;
  }

  mensajeSolicitudesAlta.textContent = texto;
  mensajeSolicitudesAlta.className = "mensaje-formulario";

  if (tipo) {
    mensajeSolicitudesAlta.classList.add(tipo);
  }
}

/* =====================================================
   FILA INFORMATIVA
===================================================== */

function mostrarFilaInformativa(texto) {
  if (!cuerpoTablaSolicitudesAlta) {
    return;
  }

  cuerpoTablaSolicitudesAlta.replaceChildren();

  const fila = document.createElement("tr");
  const celda = document.createElement("td");

  celda.colSpan = 6;
  celda.className = "tabla-vacia";
  celda.textContent = texto;

  fila.appendChild(celda);

  cuerpoTablaSolicitudesAlta.appendChild(fila);
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

/* =====================================================
   USUARIO SOPORTE
===================================================== */

function obtenerCorreoSoporte() {
  return normalizarCorreo(window.portalUsuario?.correo);
}

/* =====================================================
   FECHA
===================================================== */

function formatearFecha(fechaFirestore) {
  if (!fechaFirestore) {
    return "Sin fecha";
  }

  let fecha;

  try {
    if (typeof fechaFirestore.toDate === "function") {
      fecha = fechaFirestore.toDate();
    } else {
      fecha = new Date(fechaFirestore);
    }
  } catch (error) {
    return "Sin fecha";
  }

  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =====================================================
   CELDAS
===================================================== */

function crearCelda(texto = "") {
  const celda = document.createElement("td");

  celda.textContent = texto;

  return celda;
}

function crearCeldaEstado(estado) {
  const celda = document.createElement("td");

  const etiqueta = document.createElement("span");

  etiqueta.classList.add("estado");

  if (estado === "APROBADA") {
    etiqueta.classList.add("estado-activo");
  } else if (estado === "RECHAZADA") {
    etiqueta.classList.add("estado-inactivo");
  } else {
    etiqueta.classList.add("estado-pendiente");
  }

  etiqueta.textContent = estado;

  celda.appendChild(etiqueta);

  return celda;
}

/* =====================================================
   ACCIONES
===================================================== */

function crearBotonAccion({ texto, icono, clase, accion }) {
  const boton = document.createElement("button");

  boton.type = "button";

  boton.className = `btn-tabla ${clase}`;

  const elementoIcono = document.createElement("i");

  elementoIcono.className = `fa-solid ${icono}`;

  const elementoTexto = document.createElement("span");

  elementoTexto.textContent = texto;

  boton.append(elementoIcono, elementoTexto);

  boton.addEventListener("click", accion);

  return boton;
}

/* =====================================================
   CELDA DE ACCIONES
===================================================== */

function crearCeldaAcciones(solicitud) {
  const celda = document.createElement("td");

  const contenedor = document.createElement("div");

  contenedor.className = "acciones-tabla";

  const estado = normalizarEstado(solicitud.estado || "PENDIENTE");

  /* ================================================
     PENDIENTE
  ================================================= */

  if (estado === "PENDIENTE") {
    const btnAprobar = crearBotonAccion({
      texto: "Aprobar",
      icono: "fa-check",
      clase: "btn-activar",

      accion: async () => {
        await aprobarSolicitud(solicitud, btnAprobar, btnRechazar);
      },
    });

    const btnRechazar = crearBotonAccion({
      texto: "Rechazar",
      icono: "fa-xmark",
      clase: "btn-desactivar",

      accion: async () => {
        await rechazarSolicitud(solicitud, btnAprobar, btnRechazar);
      },
    });

    contenedor.append(btnAprobar, btnRechazar);
  }

  /* ================================================
     APROBADA / RECHAZADA
  ================================================= */

  if (estado === "APROBADA" || estado === "RECHAZADA") {
    const btnEliminar = crearBotonAccion({
      texto: "Eliminar",
      icono: "fa-trash-can",
      clase: "btn-desactivar",

      accion: async () => {
        await eliminarSolicitud(solicitud, btnEliminar);
      },
    });

    contenedor.appendChild(btnEliminar);
  }

  celda.appendChild(contenedor);

  return celda;
}

/* =====================================================
   CONSULTAR TODAS LAS SOLICITUDES
===================================================== */

async function consultarSolicitudes() {
  const db = await obtenerBaseDeDatos();

  const referenciaSolicitudes = collection(db, "solicitudes_alta_alumnos");

  const resultado = await getDocs(referenciaSolicitudes);

  const solicitudes = [];

  resultado.forEach((documento) => {
    solicitudes.push({
      id: documento.id,
      ...documento.data(),
    });
  });

  /*
   * Pendientes primero.
   *
   * Entre pendientes:
   * más antiguas primero.
   *
   * Procesadas:
   * más recientes primero.
   */
  solicitudes.sort((a, b) => {
    const estadoA = normalizarEstado(a.estado || "PENDIENTE");

    const estadoB = normalizarEstado(b.estado || "PENDIENTE");

    const pendienteA = estadoA === "PENDIENTE";

    const pendienteB = estadoB === "PENDIENTE";

    if (pendienteA && !pendienteB) {
      return -1;
    }

    if (!pendienteA && pendienteB) {
      return 1;
    }

    const fechaA =
      a.fechaSolicitud && typeof a.fechaSolicitud.toMillis === "function"
        ? a.fechaSolicitud.toMillis()
        : 0;

    const fechaB =
      b.fechaSolicitud && typeof b.fechaSolicitud.toMillis === "function"
        ? b.fechaSolicitud.toMillis()
        : 0;

    if (pendienteA && pendienteB) {
      return fechaA - fechaB;
    }

    return fechaB - fechaA;
  });

  return solicitudes;
}

/* =====================================================
   MOSTRAR SOLICITUDES
===================================================== */

function mostrarSolicitudes(solicitudes) {
  if (!cuerpoTablaSolicitudesAlta) {
    return;
  }

  cuerpoTablaSolicitudesAlta.replaceChildren();

  if (!solicitudes.length) {
    mostrarFilaInformativa("No hay solicitudes registradas.");

    return;
  }

  solicitudes.forEach((solicitud) => {
    const fila = document.createElement("tr");

    const nombre =
      String(solicitud.nombreCompleto || "").trim() || "Sin nombre";

    const correo = normalizarCorreo(solicitud.correo) || "Sin correo";

    const dni = normalizarDni(solicitud.dni) || "Sin DNI";

    const estado = normalizarEstado(solicitud.estado || "PENDIENTE");

    fila.appendChild(crearCelda(nombre));

    fila.appendChild(crearCelda(correo));

    fila.appendChild(crearCelda(dni));

    fila.appendChild(crearCelda(formatearFecha(solicitud.fechaSolicitud)));

    fila.appendChild(crearCeldaEstado(estado));

    fila.appendChild(crearCeldaAcciones(solicitud));

    cuerpoTablaSolicitudesAlta.appendChild(fila);
  });
}

/* =====================================================
   COMPROBAR DNI EN USUARIOS
===================================================== */

async function existeUsuarioConDni(db, dni) {
  const consulta = query(collection(db, "usuarios"), where("dni", "==", dni));

  const resultado = await getDocs(consulta);

  return !resultado.empty;
}

/* =====================================================
   COMPROBAR OTRA SOLICITUD CON EL MISMO DNI
===================================================== */

async function existeOtraSolicitudConDni(db, dni, solicitudIdActual) {
  const consulta = query(
    collection(db, "solicitudes_alta_alumnos"),
    where("dni", "==", dni),
  );

  const resultado = await getDocs(consulta);

  let existeOtra = false;

  resultado.forEach((documento) => {
    if (documento.id === solicitudIdActual) {
      return;
    }

    const datos = documento.data();

    const estado = normalizarEstado(datos.estado || "PENDIENTE");

    /*
     * Una rechazada no bloquea
     * otra solicitud válida.
     */
    if (estado !== "RECHAZADA") {
      existeOtra = true;
    }
  });

  return existeOtra;
}

/* =====================================================
   APROBAR
===================================================== */
/* =====================================================
   MOSTRAR MODAL DE CONFIRMACIÓN
===================================================== */

function confirmarAccion({
  titulo,
  texto,
  tipo = "rechazar",
  textoConfirmar = "Confirmar",
  icono = "fa-circle-question",
}) {
  return new Promise((resolve) => {
    if (
      !modalConfirmacionSolicitud ||
      !tituloModalConfirmacion ||
      !textoModalConfirmacion ||
      !iconoModalConfirmacion ||
      !btnCancelarModalConfirmacion ||
      !btnAceptarModalConfirmacion
    ) {
      resolve(false);
      return;
    }

    modalConfirmacionSolicitud.className = `modal-confirmacion ${tipo}`;

    tituloModalConfirmacion.textContent = titulo;

    textoModalConfirmacion.textContent = texto;

    iconoModalConfirmacion.innerHTML = "";

    const elementoIcono = document.createElement("i");

    elementoIcono.className = `fa-solid ${icono}`;

    iconoModalConfirmacion.appendChild(elementoIcono);

    btnAceptarModalConfirmacion.textContent = textoConfirmar;

    modalConfirmacionSolicitud.hidden = false;

    const cerrar = (resultado) => {
      modalConfirmacionSolicitud.hidden = true;

      btnCancelarModalConfirmacion.removeEventListener("click", cancelar);

      btnAceptarModalConfirmacion.removeEventListener("click", aceptar);

      resolve(resultado);
    };

    const cancelar = () => {
      cerrar(false);
    };

    const aceptar = () => {
      cerrar(true);
    };

    btnCancelarModalConfirmacion.addEventListener("click", cancelar);

    btnAceptarModalConfirmacion.addEventListener("click", aceptar);
  });
}
async function aprobarSolicitud(solicitud, btnAprobar, btnRechazar) {
  const confirmado = await confirmarAccion({
    titulo: "Aprobar solicitud",

    texto:
      `¿Confirmás que querés aprobar la solicitud de ` +
      `${solicitud.nombreCompleto}? ` +
      `Se creará un usuario Alumno con situación Cursada Completa.`,

    tipo: "aprobar",

    textoConfirmar: "Aprobar",

    icono: "fa-user-check",
  });

  if (!confirmado) {
    return;
  }

  btnAprobar.disabled = true;
  btnRechazar.disabled = true;

  mostrarMensaje("Verificando solicitud...");

  try {
    const db = await obtenerBaseDeDatos();

    const correoSoporte = obtenerCorreoSoporte();

    if (!correoSoporte) {
      throw new Error("No se pudo identificar al usuario de Soporte.");
    }

    /*
     * Leemos nuevamente la solicitud.
     * No confiamos solamente en lo
     * mostrado actualmente en pantalla.
     */
    const referenciaSolicitud = doc(
      db,
      "solicitudes_alta_alumnos",
      solicitud.id,
    );

    const documentoSolicitud = await getDoc(referenciaSolicitud);

    if (!documentoSolicitud.exists()) {
      throw new Error("La solicitud ya no existe.");
    }

    const datos = documentoSolicitud.data();

    const estadoActual = normalizarEstado(datos.estado || "PENDIENTE");

    if (estadoActual !== "PENDIENTE") {
      throw new Error(
        `La solicitud ya fue procesada. Estado actual: ${estadoActual}.`,
      );
    }

    const correo = normalizarCorreo(datos.correo);

    const nombreCompleto = String(datos.nombreCompleto || "")
      .trim()
      .replace(/\s+/g, " ");

    const dni = normalizarDni(datos.dni);

    if (!correo || !nombreCompleto || !/^[0-9]{7,8}$/.test(dni)) {
      throw new Error("La solicitud contiene datos incompletos o inválidos.");
    }

    /* ==============================================
       CORREO YA REGISTRADO
    ============================================== */

    const referenciaUsuario = doc(db, "usuarios", correo);

    const usuarioExistente = await getDoc(referenciaUsuario);

    if (usuarioExistente.exists()) {
      throw new Error("Ya existe un usuario registrado con este correo.");
    }

    /* ==============================================
       DNI YA REGISTRADO
    ============================================== */

    const dniYaRegistrado = await existeUsuarioConDni(db, dni);

    if (dniYaRegistrado) {
      throw new Error("Ya existe un usuario registrado con este DNI.");
    }

    /* ==============================================
       OTRA SOLICITUD CON MISMO DNI
    ============================================== */

    const otraSolicitud = await existeOtraSolicitudConDni(
      db,
      dni,
      solicitud.id,
    );

    if (otraSolicitud) {
      throw new Error(
        "Existe otra solicitud asociada a este mismo DNI. Revisala antes de aprobar.",
      );
    }

    /* ==============================================
       APROBACIÓN ATÓMICA
    ============================================== */

    const lote = writeBatch(db);

    /*
     * Usuario real del Portal.
     *
     * Estos valores no vienen elegidos
     * por el solicitante.
     */
    lote.set(referenciaUsuario, {
      correo,

      nombreCompleto,

      rol: "ALUMNO",

      roles: ["ALUMNO"],

      estado: "ACTIVO",

      tipoVinculo: "CURSADA_COMPLETA",

      dni,

      fechaFinAcceso: null,

      fechaAlta: serverTimestamp(),

      actualizadoEn: serverTimestamp(),

      creadoPor: correoSoporte,
    });

    /*
     * Conservamos la solicitud
     * como historial.
     */
    lote.update(referenciaSolicitud, {
      estado: "APROBADA",

      fechaResolucion: serverTimestamp(),

      resueltoPor: correoSoporte,
    });

    await lote.commit();

    mostrarMensaje(
      "Solicitud aprobada. El estudiante ya puede ingresar al Portal.",
      "ok",
    );

    await cargarSolicitudes();
  } catch (error) {
    console.error("Error al aprobar solicitud:", error);

    mostrarMensaje(
      error?.message || "No se pudo aprobar la solicitud.",
      "error",
    );

    btnAprobar.disabled = false;
    btnRechazar.disabled = false;
  }
}

/* =====================================================
   RECHAZAR
===================================================== */

async function rechazarSolicitud(solicitud, btnAprobar, btnRechazar) {
  const confirmado = await confirmarAccion({
    titulo: "Rechazar solicitud",

    texto:
      `¿Confirmás que querés rechazar la solicitud de ` +
      `${solicitud.nombreCompleto}? ` +
      `No se creará ningún usuario.`,

    tipo: "rechazar",

    textoConfirmar: "Rechazar",

    icono: "fa-user-xmark",
  });

  if (!confirmado) {
    return;
  }

  btnAprobar.disabled = true;
  btnRechazar.disabled = true;

  mostrarMensaje("Procesando rechazo...");

  try {
    const db = await obtenerBaseDeDatos();

    const correoSoporte = obtenerCorreoSoporte();

    if (!correoSoporte) {
      throw new Error("No se pudo identificar al usuario de Soporte.");
    }

    const referenciaSolicitud = doc(
      db,
      "solicitudes_alta_alumnos",
      solicitud.id,
    );

    const documentoSolicitud = await getDoc(referenciaSolicitud);

    if (!documentoSolicitud.exists()) {
      throw new Error("La solicitud ya no existe.");
    }

    const estadoActual = normalizarEstado(
      documentoSolicitud.data().estado || "PENDIENTE",
    );

    if (estadoActual !== "PENDIENTE") {
      throw new Error(
        `La solicitud ya fue procesada. Estado actual: ${estadoActual}.`,
      );
    }

    const lote = writeBatch(db);

    lote.update(referenciaSolicitud, {
      estado: "RECHAZADA",

      fechaResolucion: serverTimestamp(),

      resueltoPor: correoSoporte,
    });

    await lote.commit();

    mostrarMensaje("Solicitud rechazada.", "ok");

    await cargarSolicitudes();
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);

    mostrarMensaje(
      error?.message || "No se pudo rechazar la solicitud.",
      "error",
    );

    btnAprobar.disabled = false;
    btnRechazar.disabled = false;
  }
}

/* =====================================================
   ELIMINAR SOLICITUD PROCESADA
===================================================== */

async function eliminarSolicitud(solicitud, btnEliminar) {
  const estado = normalizarEstado(solicitud.estado);

  if (estado !== "APROBADA" && estado !== "RECHAZADA") {
    mostrarMensaje("Las solicitudes pendientes no pueden eliminarse.", "error");

    return;
  }

  const confirmado = await confirmarAccion({
    titulo: "Eliminar solicitud",

    texto:
      `¿Confirmás que querés eliminar definitivamente la solicitud de ` +
      `${solicitud.nombreCompleto}? ` +
      `Se eliminará solamente el registro de la solicitud.`,

    tipo: "eliminar",

    textoConfirmar: "Eliminar",

    icono: "fa-trash-can",
  });

  if (!confirmado) {
    return;
  }

  btnEliminar.disabled = true;

  mostrarMensaje("Eliminando solicitud...");

  try {
    const db = await obtenerBaseDeDatos();

    const referenciaSolicitud = doc(
      db,
      "solicitudes_alta_alumnos",
      solicitud.id,
    );

    /*
     * Comprobamos nuevamente el estado real
     * antes de eliminar.
     */
    const documentoSolicitud = await getDoc(referenciaSolicitud);

    if (!documentoSolicitud.exists()) {
      throw new Error("La solicitud ya no existe.");
    }

    const estadoActual = normalizarEstado(documentoSolicitud.data().estado);

    if (estadoActual !== "APROBADA" && estadoActual !== "RECHAZADA") {
      throw new Error("Una solicitud pendiente no puede eliminarse.");
    }

    await deleteDoc(referenciaSolicitud);

    mostrarMensaje("Solicitud eliminada.", "ok");

    await cargarSolicitudes();
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);

    mostrarMensaje(
      error?.message || "No se pudo eliminar la solicitud.",
      "error",
    );

    btnEliminar.disabled = false;
  }
}

/* =====================================================
   CARGAR SOLICITUDES
===================================================== */

async function cargarSolicitudes() {
  if (!btnVerSolicitudesAlta) {
    return;
  }

  const contenidoOriginal = btnVerSolicitudesAlta.innerHTML;

  btnVerSolicitudesAlta.disabled = true;

  btnVerSolicitudesAlta.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Consultando...
  `;

  mostrarMensaje("");

  mostrarFilaInformativa("Consultando solicitudes...");

  try {
    const solicitudes = await consultarSolicitudes();

    mostrarSolicitudes(solicitudes);

    if (!solicitudes.length) {
      mostrarMensaje("No hay solicitudes registradas.", "ok");

      return;
    }

    const pendientes = solicitudes.filter(
      (solicitud) => normalizarEstado(solicitud.estado) === "PENDIENTE",
    ).length;

    if (pendientes > 0) {
      mostrarMensaje(
        `${pendientes} ${
          pendientes === 1 ? "solicitud pendiente" : "solicitudes pendientes"
        } de revisión.`,
        "ok",
      );
    } else {
      mostrarMensaje("No hay solicitudes pendientes de revisión.", "ok");
    }
  } catch (error) {
    console.error("Error al consultar solicitudes de alta:", error);

    mostrarFilaInformativa("No se pudieron consultar las solicitudes.");

    mostrarMensaje(
      error?.code === "permission-denied"
        ? "Firestore rechazó la consulta por permisos."
        : "Ocurrió un error al consultar las solicitudes.",
      "error",
    );
  } finally {
    btnVerSolicitudesAlta.disabled = false;

    btnVerSolicitudesAlta.innerHTML = contenidoOriginal;
  }
}

/* =====================================================
   EVENTOS
===================================================== */

if (btnVerSolicitudesAlta) {
  btnVerSolicitudesAlta.addEventListener("click", cargarSolicitudes);
}
