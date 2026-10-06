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
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const BACKEND_GOOGLE_CONTACTS_URL =
  "https://script.google.com/macros/s/AKfycbzMp_Gbkr_mU9jqRWaS7SdOYVr9stUvdzfD57Y6iHOsKw2yGEhYf2MBmFZNaS8-Adg/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ROLES_PERMITIDOS = new Set([
  "SOPORTE",
  "DIRECCION",
  "SECRETARIA",
  "ASISTENTE_ADMINISTRATIVO",
]);

const tarjetaContactos = document.getElementById(
  "tarjetaContactosInstitucionales",
);
const seccionContactos = document.getElementById("contactos-institucionales");
const btnVerContactos = document.getElementById(
  "btnVerContactosInstitucionales",
);
const buscarContacto = document.getElementById("buscarContactoInstitucional");
const filtroEtiqueta = document.getElementById(
  "filtroEtiquetaContactoInstitucional",
);
const filtroEstado = document.getElementById(
  "filtroEstadoContactoInstitucional",
);
const cuerpoTabla = document.getElementById(
  "cuerpoTablaContactosInstitucionales",
);
const mensajeContactos = document.getElementById(
  "mensajeContactosInstitucionales",
);
const btnSincronizarGoogleContacts = document.getElementById(
  "btnSincronizarGoogleContacts",
);

let contactosCargados = [];
let accesoContactosHabilitado = false;

function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function normalizarCorreo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function obtenerRolesPerfil(perfil) {
  const roles = [perfil?.rol];

  if (Array.isArray(perfil?.roles)) {
    roles.push(...perfil.roles);
  }

  return Array.from(new Set(roles.map(normalizarTexto).filter(Boolean)));
}

function obtenerRolActivo() {
  try {
    return normalizarTexto(sessionStorage.getItem("rolActivoPortal"));
  } catch (error) {
    console.warn("No se pudo consultar el rol activo del portal:", error);
    return "";
  }
}

function mostrarAccesoContactos() {
  accesoContactosHabilitado = true;

  if (tarjetaContactos) {
    tarjetaContactos.hidden = false;
  }

  if (seccionContactos) {
    seccionContactos.hidden = false;
  }
}

function ocultarAccesoContactos() {
  accesoContactosHabilitado = false;

  if (tarjetaContactos) {
    tarjetaContactos.hidden = true;
  }

  if (seccionContactos) {
    seccionContactos.hidden = true;
  }
}

function mostrarMensaje(texto, tipo = "") {
  if (!mensajeContactos) return;

  mensajeContactos.textContent = texto;

  const esGestion = mensajeContactos.classList.contains("mensaje-gestion");
  const claseBase = esGestion ? "mensaje-gestion" : "mensaje-formulario";

  mensajeContactos.className = `${claseBase} ${tipo}`.trim();
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto || "-";
  return celda;
}

function crearCeldaAccionesContacto_(contacto) {
  const celda = document.createElement("td");
  const contenedor = document.createElement("div");
  contenedor.className = "acciones-tabla";

  const btnEditar = document.createElement("button");
  btnEditar.type = "button";
  btnEditar.className = "btn-tabla btn-editar btn-editar-etiquetas-contacto";
  btnEditar.dataset.contactoId = contacto.id;
  btnEditar.title = "Editar etiquetas";
  btnEditar.setAttribute(
    "aria-label",
    `Editar etiquetas de ${contacto.nombreCompleto || contacto.correo}`,
  );
  btnEditar.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';

  contenedor.appendChild(btnEditar);
  celda.appendChild(contenedor);

  return celda;
}

async function editarEtiquetasContacto_(contacto) {
  if (!contacto) return;

  const valorActual = contacto.etiquetasContacto.join(", ");
  let etiquetasNuevas = null;

  if (window.Swal) {
    const respuesta = await Swal.fire({
      title: "Editar etiquetas del contacto",
      html: [
        `<strong>${contacto.nombreCompleto || "Sin nombre"}</strong>`,
        `<br><span>${contacto.correo}</span>`,
        "<br><br><small>Separá las etiquetas con comas. Si dejás el campo vacío, el contacto quedará sin etiquetas.</small>",
      ].join(""),
      input: "textarea",
      inputValue: valorActual,
      inputPlaceholder: "Docentes, Tutores, PrimeroA...",
      showCancelButton: true,
      confirmButtonText: "Guardar etiquetas",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      preConfirm: (valor) => convertirEtiquetas(valor),
    });

    if (!respuesta.isConfirmed) return;
    etiquetasNuevas = Array.isArray(respuesta.value)
      ? respuesta.value
      : convertirEtiquetas(respuesta.value);
  } else {
    const valor = window.prompt(
      `Etiquetas de ${contacto.nombreCompleto || contacto.correo}, separadas por comas:`,
      valorActual,
    );

    if (valor === null) return;
    etiquetasNuevas = convertirEtiquetas(valor);
  }

  if (etiquetasIguales(contacto.etiquetasContacto, etiquetasNuevas)) {
    mostrarMensaje("No hubo cambios en las etiquetas del contacto.", "ok");
    return;
  }

  mostrarMensaje(`Guardando etiquetas de ${contacto.nombreCompleto || contacto.correo}...`);

  try {
    const referencia = doc(db, "usuarios", contacto.id);
    const batch = writeBatch(db);
    batch.update(referencia, {
      etiquetasContacto: [...etiquetasNuevas],
    });
    await batch.commit();

    /*
     * Confirmamos contra el servidor el valor realmente persistido.
     * Esto evita que una eliminación parezca correcta sólo por el estado
     * local del navegador y garantiza que [] también quede guardado.
     */
    const documentoServidor = await getDocFromServer(referencia);

    if (!documentoServidor.exists()) {
      throw new Error("El usuario ya no existe en el Portal.");
    }

    const etiquetasGuardadas = obtenerEtiquetas(documentoServidor.data());

    if (!etiquetasIguales(etiquetasGuardadas, etiquetasNuevas)) {
      throw new Error(
        "El servidor no confirmó el cambio de etiquetas. Volvé a intentarlo.",
      );
    }

    contacto.etiquetasContacto = [...etiquetasGuardadas];
    cargarOpcionesEtiquetas();
    aplicarFiltros();

    mostrarMensaje(
      `Etiquetas de ${contacto.nombreCompleto || contacto.correo} actualizadas correctamente.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al editar etiquetas del contacto:", error);
    mostrarMensaje(
      error?.message || "No se pudieron guardar las etiquetas del contacto.",
      "error",
    );
  }
}

function obtenerEtiquetas(usuario) {
  if (!Array.isArray(usuario.etiquetasContacto)) {
    return [];
  }

  return usuario.etiquetasContacto
    .map((etiqueta) => String(etiqueta || "").trim())
    .filter(Boolean);
}

function prepararContacto(documento) {
  const datos = documento.data();

  return {
    id: documento.id,
    ...datos,
    nombreCompleto: String(datos.nombreCompleto || "").trim(),
    correo: normalizarCorreo(datos.correo || documento.id),
    rol: normalizarTexto(datos.rol),
    estado: normalizarTexto(datos.estado),
    tipoVinculo: String(
      datos.tipoVinculo || datos.situacionRevista || "",
    ).trim(),
    etiquetasContacto: obtenerEtiquetas(datos),
  };
}


function cargarOpcionesEtiquetas() {
  if (!filtroEtiqueta) return;

  const seleccionActual = filtroEtiqueta.value;
  const etiquetas = Array.from(
    new Set(
      contactosCargados.flatMap((contacto) => contacto.etiquetasContacto),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

  filtroEtiqueta.innerHTML = "";

  const opcionTodas = document.createElement("option");
  opcionTodas.value = "";
  opcionTodas.textContent = "Todas";
  filtroEtiqueta.appendChild(opcionTodas);

  etiquetas.forEach((etiqueta) => {
    const opcion = document.createElement("option");
    opcion.value = etiqueta;
    opcion.textContent = etiqueta;
    filtroEtiqueta.appendChild(opcion);
  });

  if (etiquetas.includes(seleccionActual)) {
    filtroEtiqueta.value = seleccionActual;
  }
}

function renderizarContactos(contactos) {
  if (!cuerpoTabla) return;

  cuerpoTabla.innerHTML = "";

  if (!contactos.length) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 4;
    celda.className = "tabla-vacia";
    celda.textContent = "No se encontraron contactos con esos filtros.";
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    mostrarMensaje("No se encontraron contactos con esos filtros.");
    return;
  }

  contactos.forEach((contacto) => {
    const fila = document.createElement("tr");
    const etiquetas = contacto.etiquetasContacto.length
      ? contacto.etiquetasContacto.join(", ")
      : "Sin etiquetas";

    fila.appendChild(crearCelda(contacto.nombreCompleto || "Sin nombre"));
    fila.appendChild(crearCelda(contacto.correo));
    fila.appendChild(crearCelda(etiquetas));
    fila.appendChild(crearCeldaAccionesContacto_(contacto));

    cuerpoTabla.appendChild(fila);
  });

  mostrarMensaje(`${contactos.length} contacto(s) mostrado(s).`, "ok");
}

function aplicarFiltros() {
  const texto = String(buscarContacto?.value || "")
    .trim()
    .toLocaleLowerCase("es");
  const etiquetaSeleccionada = String(filtroEtiqueta?.value || "")
    .trim()
    .toLocaleLowerCase("es");
  const estado = normalizarTexto(filtroEstado?.value);

  const filtrados = contactosCargados.filter((contacto) => {
    if (estado && contacto.estado !== estado) {
      return false;
    }

    if (
      etiquetaSeleccionada &&
      !contacto.etiquetasContacto.some(
        (etiqueta) =>
          etiqueta.trim().toLocaleLowerCase("es") === etiquetaSeleccionada,
      )
    ) {
      return false;
    }

    if (!texto) {
      return true;
    }

    const contenido = [
      contacto.nombreCompleto,
      contacto.correo,
      ...contacto.etiquetasContacto,
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    return contenido.includes(texto);
  });

  renderizarContactos(filtrados);
}

async function consultarContactosInstitucionales_() {
  const consulta = query(
    collection(db, "usuarios"),
    where("rol", "!=", "ALUMNO"),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs
    .map(prepararContacto)
    .sort((a, b) =>
      a.nombreCompleto.localeCompare(b.nombreCompleto, "es", {
        sensitivity: "base",
      }),
    );
}

async function cargarContactos() {
  if (!accesoContactosHabilitado || !cuerpoTabla) {
    return;
  }

  mostrarMensaje("Cargando contactos...");

  try {
    contactosCargados = await consultarContactosInstitucionales_();

    cargarOpcionesEtiquetas();
    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar los contactos institucionales:", error);
    mostrarMensaje(
      "No se pudieron cargar los contactos. Revisá permisos o conexión.",
      "error",
    );
  }
}




function convertirEtiquetas(valor) {
  const vistas = Array.isArray(valor) ? valor : [valor];
  const resultado = [];
  const vistasNormalizadas = new Set();

  vistas.forEach((item) => {
    String(item || "")
      .split(/[,;]+/)
      .map((etiqueta) => etiqueta.trim())
      .filter(Boolean)
      .forEach((etiqueta) => {
        const clave = etiqueta.toLocaleLowerCase("es");
        if (!vistasNormalizadas.has(clave)) {
          vistasNormalizadas.add(clave);
          resultado.push(etiqueta);
        }
      });
  });

  return resultado;
}

function etiquetasIguales(actuales, nuevas) {
  const preparar = (lista) =>
    convertirEtiquetas(lista)
      .map((etiqueta) => etiqueta.toLocaleLowerCase("es"))
      .sort((a, b) => a.localeCompare(b, "es"));

  const a = preparar(actuales);
  const b = preparar(nuevas);

  return a.length === b.length && a.every((valor, indice) => valor === b[indice]);
}





async function obtenerTokenAppCheckContactos_() {
  const obtenerToken = window.obtenerTokenAppCheckPortal;

  if (typeof obtenerToken !== "function") {
    throw new Error(
      "No se pudo inicializar la verificación de seguridad del portal. Recargá la página.",
    );
  }

  return obtenerToken();
}





function prepararContactosParaGoogle_(contactosFuente) {
  return contactosFuente
    .filter((contacto) => contacto.estado === "ACTIVO")
    .map((contacto) => ({
      nombre: contacto.nombreCompleto,
      correo: contacto.correo,
      etiquetas: contacto.etiquetasContacto,
    }))
    .filter((contacto) => contacto.correo);
}

async function solicitarGoogleContacts_(accion) {
  if (!accesoContactosHabilitado) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(
      "No se encontró una sesión activa. Recargá la página e intentá nuevamente.",
    );
  }

  if (obtenerRolActivo() !== "SOPORTE") {
    throw new Error(
      "Solo Soporte Técnico puede sincronizar Google Contacts.",
    );
  }

  // La sincronización consulta los usuarios directamente en segundo plano.
  // No carga ni modifica la tabla visible de Contactos Institucionales.
  const contactosFuente = await consultarContactosInstitucionales_();
  const contactos = prepararContactosParaGoogle_(contactosFuente);

  if (!contactos.length) {
    throw new Error(
      "No hay contactos institucionales activos para sincronizar.",
    );
  }

  const [idToken, appCheckToken] = await Promise.all([
    usuario.getIdToken(true),
    obtenerTokenAppCheckContactos_(),
  ]);

  const respuesta = await fetch(BACKEND_GOOGLE_CONTACTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      accion,
      idToken,
      appCheckToken,
      contactos,
    }),
  });

  if (!respuesta.ok) {
    throw new Error(
      "No se pudo establecer comunicación con el backend de Google Contacts.",
    );
  }

  const resultado = await respuesta.json();

  if (!resultado?.ok) {
    throw new Error(
      resultado?.error ||
        "El backend rechazó la solicitud de Google Contacts.",
    );
  }

  return resultado;
}

async function previsualizarGoogleContacts_() {
  return solicitarGoogleContacts_("previsualizar");
}

async function sincronizarGoogleContacts_() {
  return solicitarGoogleContacts_("sincronizar");
}

function cantidadErroresGoogleContacts_(resultado) {
  return Array.isArray(resultado?.errores)
    ? resultado.errores.length
    : 0;
}

function detalleErroresGoogleContacts_(resultado) {
  const errores = Array.isArray(resultado?.errores)
    ? resultado.errores
    : [];

  if (!errores.length) {
    return "";
  }

  const primeros = errores.slice(0, 5).map((item) => {
    const correo = String(item?.correo || "").trim();
    const error = String(item?.error || "Error desconocido").trim();

    return correo ? `${correo}: ${error}` : error;
  });

  if (errores.length > primeros.length) {
    primeros.push(`... y ${errores.length - primeros.length} error(es) más.`);
  }

  return primeros.join("\n");
}

async function mostrarPrevisualizacionGoogleContacts_() {
  if (!btnSincronizarGoogleContacts) return;

  const textoOriginal = btnSincronizarGoogleContacts.innerHTML;
  btnSincronizarGoogleContacts.disabled = true;
  btnSincronizarGoogleContacts.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Analizando...';

  mostrarMensaje("Analizando Google Contacts...");

  try {
    const resultado = await previsualizarGoogleContacts_();
    const etiquetasNuevas = Array.isArray(resultado.etiquetasNuevas)
      ? resultado.etiquetasNuevas
      : [];

    const detalleEtiquetas = etiquetasNuevas.length
      ? etiquetasNuevas.map((etiqueta) => String(etiqueta)).join(", ")
      : "Ninguna";

    const cantidadErrores = cantidadErroresGoogleContacts_(resultado);
    let confirmarSincronizacion = false;

    if (window.Swal) {
      const decision = await Swal.fire({
        icon: cantidadErrores ? "warning" : "info",
        title: "Vista previa de Google Contacts",
        html: [
          `<strong>Contactos activos analizados:</strong> ${resultado.total || 0}`,
          `<strong>Nuevos:</strong> ${resultado.nuevos || 0}`,
          `<strong>Ya existentes:</strong> ${resultado.existentes || 0}`,
          `<strong>Contactos a eliminar:</strong> ${resultado.contactosAEliminar || 0}`,
          `<strong>Etiquetas nuevas:</strong> ${detalleEtiquetas}`,
          `<strong>Asignaciones de etiquetas:</strong> ${resultado.etiquetasAAgregar || 0}`,
          `<strong>Etiquetas a quitar:</strong> ${resultado.etiquetasAQuitar || 0}`,
          `<strong>Errores:</strong> ${cantidadErrores}`,
          "",
          "<em>Google Contacts quedará alineado con los contactos institucionales activos del Portal. Sólo se eliminan contactos previamente gestionados por esta sincronización.</em>",
        ].join("<br>"),
        showCancelButton: true,
        confirmButtonText: "Sincronizar ahora",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        focusCancel: true,
      });

      confirmarSincronizacion = Boolean(decision.isConfirmed);
    } else {
      confirmarSincronizacion = window.confirm(
        [
          `Contactos activos analizados: ${resultado.total || 0}`,
          `Nuevos: ${resultado.nuevos || 0}`,
          `Ya existentes: ${resultado.existentes || 0}`,
          `Contactos a eliminar: ${resultado.contactosAEliminar || 0}`,
          `Etiquetas nuevas: ${detalleEtiquetas}`,
          `Asignaciones de etiquetas: ${resultado.etiquetasAAgregar || 0}`,
          `Etiquetas a quitar: ${resultado.etiquetasAQuitar || 0}`,
          `Errores: ${cantidadErrores}`,
          "",
          "Google Contacts quedará alineado con los contactos institucionales activos del Portal.",
          "Sólo se eliminan contactos previamente gestionados por esta sincronización.",
          "",
          "¿Querés sincronizar ahora?",
        ].join("\n"),
      );
    }

    if (!confirmarSincronizacion) {
      mostrarMensaje(
        `Vista previa completada: ${resultado.total || 0} contacto(s) activo(s) analizado(s). Sincronización cancelada.`,
        "ok",
      );
      return;
    }

    btnSincronizarGoogleContacts.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando...';
    mostrarMensaje("Sincronizando Google Contacts...");

    const resultadoSincronizacion = await sincronizarGoogleContacts_();
    const erroresSincronizacion = cantidadErroresGoogleContacts_(
      resultadoSincronizacion,
    );
    const detalleErrores = detalleErroresGoogleContacts_(
      resultadoSincronizacion,
    );

    if (window.Swal) {
      await Swal.fire({
        icon: erroresSincronizacion ? "warning" : "success",
        title: erroresSincronizacion
          ? "Sincronización completada con observaciones"
          : "Google Contacts sincronizado",
        html: [
          `<strong>Contactos procesados:</strong> ${resultadoSincronizacion.total || 0}`,
          `<strong>Creados:</strong> ${resultadoSincronizacion.creados || 0}`,
          `<strong>Actualizados:</strong> ${resultadoSincronizacion.actualizados || 0}`,
          `<strong>Eliminados:</strong> ${resultadoSincronizacion.contactosEliminados || 0}`,
          `<strong>Etiquetas creadas:</strong> ${resultadoSincronizacion.etiquetasCreadas || 0}`,
          `<strong>Asignaciones de etiquetas:</strong> ${resultadoSincronizacion.etiquetasAsignadas || 0}`,
          `<strong>Etiquetas quitadas:</strong> ${resultadoSincronizacion.etiquetasQuitadas || 0}`,
          `<strong>Errores:</strong> ${erroresSincronizacion}`,
          detalleErrores
            ? `<br><small>${detalleErrores.replace(/\n/g, "<br>")}</small>`
            : "",
        ].join("<br>"),
        confirmButtonText: "Entendido",
      });
    } else {
      window.alert(
        [
          `Contactos procesados: ${resultadoSincronizacion.total || 0}`,
          `Creados: ${resultadoSincronizacion.creados || 0}`,
          `Actualizados: ${resultadoSincronizacion.actualizados || 0}`,
          `Eliminados: ${resultadoSincronizacion.contactosEliminados || 0}`,
          `Etiquetas creadas: ${resultadoSincronizacion.etiquetasCreadas || 0}`,
          `Asignaciones de etiquetas: ${resultadoSincronizacion.etiquetasAsignadas || 0}`,
          `Etiquetas quitadas: ${resultadoSincronizacion.etiquetasQuitadas || 0}`,
          `Errores: ${erroresSincronizacion}`,
          detalleErrores ? `\n${detalleErrores}` : "",
        ].join("\n"),
      );
    }

    mostrarMensaje(
      erroresSincronizacion
        ? `Sincronización completada con ${erroresSincronizacion} error(es).`
        : `Google Contacts sincronizado correctamente: ${resultadoSincronizacion.total || 0} contacto(s) procesado(s).`,
      erroresSincronizacion ? "error" : "ok",
    );
  } catch (error) {
    console.error("Error al sincronizar Google Contacts:", error);
    mostrarMensaje(
      error?.message || "No se pudo sincronizar Google Contacts.",
      "error",
    );

    if (window.Swal) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo sincronizar Google Contacts",
        text: error?.message || "Ocurrió un error inesperado.",
        confirmButtonText: "Entendido",
      });
    }
  } finally {
    btnSincronizarGoogleContacts.disabled = false;
    btnSincronizarGoogleContacts.innerHTML = textoOriginal;
  }
}

if (cuerpoTabla) {
  cuerpoTabla.addEventListener("click", (event) => {
    const botonEditar = event.target.closest(".btn-editar-etiquetas-contacto");
    if (!botonEditar) return;

    const contacto = contactosCargados.find(
      (item) => item.id === botonEditar.dataset.contactoId,
    );

    editarEtiquetasContacto_(contacto);
  });
}

if (btnSincronizarGoogleContacts) {
  btnSincronizarGoogleContacts.addEventListener(
    "click",
    mostrarPrevisualizacionGoogleContacts_,
  );
}

if (btnVerContactos) {
  btnVerContactos.addEventListener("click", cargarContactos);
}

if (buscarContacto) {
  buscarContacto.addEventListener("input", aplicarFiltros);
}

if (filtroEtiqueta) {
  filtroEtiqueta.addEventListener("change", aplicarFiltros);
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", aplicarFiltros);
}

onAuthStateChanged(auth, async (user) => {
  if (!user || !seccionContactos) {
    ocultarAccesoContactos();
    return;
  }

  try {
    const correo = normalizarCorreo(user.email);
    const referencia = doc(db, "usuarios", correo);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      ocultarAccesoContactos();
      return;
    }

    const perfil = documento.data();
    const rolesPerfil = obtenerRolesPerfil(perfil);
    let rolActivo = obtenerRolActivo();

    if (!rolActivo && rolesPerfil.length === 1) {
      rolActivo = rolesPerfil[0];
    }

    const accesoPermitido =
      normalizarTexto(perfil.estado) === "ACTIVO" &&
      rolesPerfil.includes(rolActivo) &&
      ROLES_PERMITIDOS.has(rolActivo);

    if (!accesoPermitido) {
      ocultarAccesoContactos();
      return;
    }

    mostrarAccesoContactos();
  } catch (error) {
    console.error(
      "No se pudo validar el acceso a Contactos Institucionales:",
      error,
    );
    ocultarAccesoContactos();
  }
});
