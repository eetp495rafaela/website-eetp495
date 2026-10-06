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
const btnImportarEtiquetas = document.getElementById(
  "btnImportarEtiquetasContactos",
);
const btnSincronizarGoogleContacts = document.getElementById(
  "btnSincronizarGoogleContacts",
);
const archivoEtiquetas = document.getElementById(
  "archivoEtiquetasContactos",
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
  btnEditar.setAttribute("aria-label", `Editar etiquetas de ${contacto.nombreCompleto || contacto.correo}`);
  btnEditar.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';

  contenedor.appendChild(btnEditar);

  if (obtenerRolActivo() === "SOPORTE") {
    const excluidoGoogle = contacto.sincronizarGoogleContacts === false;
    const btnGoogle = document.createElement("button");

    btnGoogle.type = "button";
    btnGoogle.dataset.contactoId = contacto.id;

    if (excluidoGoogle) {
      btnGoogle.className =
        "btn-tabla btn-editar btn-reincorporar-google-contacto";
      btnGoogle.title = "Volver a incluir en Google Contacts";
      btnGoogle.setAttribute(
        "aria-label",
        `Volver a incluir ${contacto.nombreCompleto || contacto.correo} en Google Contacts`,
      );
      btnGoogle.innerHTML =
        '<i class="fa-solid fa-rotate-left"></i> Reincorporar';
    } else {
      btnGoogle.className =
        "btn-tabla btn-eliminar btn-eliminar-google-contacto";
      btnGoogle.title = "Eliminar de Google Contacts";
      btnGoogle.setAttribute(
        "aria-label",
        `Eliminar ${contacto.nombreCompleto || contacto.correo} de Google Contacts`,
      );
      btnGoogle.innerHTML =
        '<i class="fa-solid fa-trash"></i> Eliminar';
    }

    contenedor.appendChild(btnGoogle);
  }

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


function normalizarEncabezado(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

function buscarIndiceEncabezado(encabezados, candidatos) {
  const normalizados = encabezados.map(normalizarEncabezado);

  for (const candidato of candidatos) {
    const indice = normalizados.indexOf(normalizarEncabezado(candidato));
    if (indice >= 0) return indice;
  }

  return -1;
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

function extraerContactosDesdeLibro(libro) {
  const candidatosCorreo = [
    "CORREO ELECTRÓNICO",
    "CORREO ELECTRONICO",
    "CORREO_DE_ACCESO",
    "CORREO",
    "EMAIL",
  ];
  const candidatosEtiquetas = [
    "ÁREA/ESPACIO CURRICULAR",
    "AREA/ESPACIO CURRICULAR",
    "AREA_ESPACIO_CURRICULAR",
    "ETIQUETAS",
    "ETIQUETAS_CONTACTO",
  ];

  for (const nombreHoja of libro.SheetNames) {
    const hoja = libro.Sheets[nombreHoja];
    const filas = XLSX.utils.sheet_to_json(hoja, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (!filas.length) continue;

    let filaEncabezado = -1;
    let indiceCorreo = -1;
    let indiceEtiquetas = -1;

    for (let i = 0; i < Math.min(filas.length, 15); i += 1) {
      const fila = Array.isArray(filas[i]) ? filas[i] : [];
      const correo = buscarIndiceEncabezado(fila, candidatosCorreo);
      const etiquetas = buscarIndiceEncabezado(fila, candidatosEtiquetas);

      if (correo >= 0 && etiquetas >= 0) {
        filaEncabezado = i;
        indiceCorreo = correo;
        indiceEtiquetas = etiquetas;
        break;
      }
    }

    if (filaEncabezado < 0) continue;

    const contactos = [];

    for (let i = filaEncabezado + 1; i < filas.length; i += 1) {
      const fila = Array.isArray(filas[i]) ? filas[i] : [];
      const correo = normalizarCorreo(fila[indiceCorreo]);
      const etiquetas = convertirEtiquetas(fila[indiceEtiquetas]);

      if (!correo) continue;

      contactos.push({ correo, etiquetas });
    }

    return contactos;
  }

  throw new Error(
    "No se encontraron las columnas de correo y Área/Espacio Curricular (o Etiquetas).",
  );
}

async function leerArchivoEtiquetas(archivo) {
  if (!window.XLSX) {
    throw new Error("No se pudo cargar el lector de archivos XLSX/CSV.");
  }

  const buffer = await archivo.arrayBuffer();
  const libro = XLSX.read(buffer, { type: "array" });
  return extraerContactosDesdeLibro(libro);
}

async function confirmarImportacion(resumen) {
  const detalle = [
    `Coincidencias: ${resumen.coincidencias}`,
    `A actualizar: ${resumen.actualizaciones.length}`,
    `Sin cambios: ${resumen.sinCambios}`,
    `Sin usuario en el Portal: ${resumen.sinCoincidencia.length}`,
  ].join("<br>");

  if (window.Swal) {
    const respuesta = await Swal.fire({
      title: "Importar etiquetas de contactos",
      html: detalle,
      icon: resumen.sinCoincidencia.length ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: "Importar etiquetas",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    return respuesta.isConfirmed;
  }

  return window.confirm(
    detalle.replaceAll("<br>", "\n") + "\n\n¿Continuar con la importación?",
  );
}

async function importarEtiquetasDesdeArchivo(archivo) {
  if (!archivo || !accesoContactosHabilitado) return;

  mostrarMensaje("Analizando archivo de etiquetas...");

  try {
    if (!contactosCargados.length) {
      await cargarContactos();
    }

    const filasImportadas = await leerArchivoEtiquetas(archivo);
    const contactosPorCorreo = new Map(
      contactosCargados.map((contacto) => [contacto.correo, contacto]),
    );

    const porCorreo = new Map();
    filasImportadas.forEach((fila) => {
      if (!porCorreo.has(fila.correo)) {
        porCorreo.set(fila.correo, fila);
      } else {
        const existente = porCorreo.get(fila.correo);
        existente.etiquetas = convertirEtiquetas([
          ...existente.etiquetas,
          ...fila.etiquetas,
        ]);
      }
    });

    const resumen = {
      coincidencias: 0,
      sinCambios: 0,
      actualizaciones: [],
      sinCoincidencia: [],
    };

    porCorreo.forEach((fila, correo) => {
      const contacto = contactosPorCorreo.get(correo);

      if (!contacto) {
        resumen.sinCoincidencia.push(correo);
        return;
      }

      resumen.coincidencias += 1;

      if (etiquetasIguales(contacto.etiquetasContacto, fila.etiquetas)) {
        resumen.sinCambios += 1;
        return;
      }

      resumen.actualizaciones.push({ contacto, etiquetas: fila.etiquetas });
    });

    const confirmado = await confirmarImportacion(resumen);
    if (!confirmado) {
      mostrarMensaje("Importación cancelada. No se modificó ningún usuario.");
      return;
    }

    if (!resumen.actualizaciones.length) {
      mostrarMensaje("No había etiquetas para actualizar.", "ok");
      return;
    }

    const batch = writeBatch(db);

    resumen.actualizaciones.forEach(({ contacto, etiquetas }) => {
      batch.update(doc(db, "usuarios", contacto.id), {
        etiquetasContacto: etiquetas,
      });
    });

    await batch.commit();
    await cargarContactos();

    let mensaje = `${resumen.actualizaciones.length} usuario(s) actualizado(s) correctamente.`;

    if (resumen.sinCoincidencia.length) {
      mensaje += ` ${resumen.sinCoincidencia.length} correo(s) del archivo no existen como usuario del Portal y fueron omitidos.`;
    }

    mostrarMensaje(mensaje, "ok");
  } catch (error) {
    console.error("Error al importar etiquetas de contactos:", error);
    mostrarMensaje(
      error?.message || "No se pudieron importar las etiquetas.",
      "error",
    );
  } finally {
    if (archivoEtiquetas) archivoEtiquetas.value = "";
  }
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

async function marcarSincronizacionGoogleContacts_(contacto, habilitado) {
  const referencia = doc(db, "usuarios", contacto.id);
  const batch = writeBatch(db);

  batch.update(referencia, {
    sincronizarGoogleContacts: Boolean(habilitado),
  });

  await batch.commit();

  const documentoServidor = await getDocFromServer(referencia);

  if (!documentoServidor.exists()) {
    throw new Error("El usuario ya no existe en el Portal.");
  }

  const valorServidor =
    documentoServidor.data()?.sincronizarGoogleContacts !== false;

  if (valorServidor !== Boolean(habilitado)) {
    throw new Error(
      "El servidor no confirmó el cambio de sincronización con Google Contacts.",
    );
  }

  contacto.sincronizarGoogleContacts = Boolean(habilitado);
}

async function solicitarEliminacionGoogleContact_(correo) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(
      "No se encontró una sesión activa. Recargá la página e intentá nuevamente.",
    );
  }

  if (obtenerRolActivo() !== "SOPORTE") {
    throw new Error(
      "Solo Soporte Técnico puede eliminar contactos de Google Contacts.",
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
      accion: "eliminar",
      idToken,
      appCheckToken,
      correo,
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
        "El backend rechazó la eliminación de Google Contacts.",
    );
  }

  return resultado;
}

async function eliminarContactoGoogle_(contacto) {
  if (!contacto || obtenerRolActivo() !== "SOPORTE") return;

  let confirmado = false;

  if (window.Swal) {
    const respuesta = await Swal.fire({
      icon: "warning",
      title: "Eliminar de Google Contacts",
      html: [
        `<strong>${contacto.nombreCompleto || "Sin nombre"}</strong>`,
        `<br><span>${contacto.correo}</span>`,
        "<br><br>El usuario seguirá existiendo en el Portal.",
        "<br>Solo se eliminará de Google Contacts de la cuenta Soporte y quedará excluido de futuras sincronizaciones.",
      ].join(""),
      showCancelButton: true,
      confirmButtonText: "Eliminar de Google Contacts",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    confirmado = Boolean(respuesta.isConfirmed);
  } else {
    confirmado = window.confirm(
      [
        `Eliminar ${contacto.nombreCompleto || contacto.correo} de Google Contacts.`,
        "",
        "El usuario seguirá existiendo en el Portal y quedará excluido de futuras sincronizaciones.",
        "",
        "¿Continuar?",
      ].join("\n"),
    );
  }

  if (!confirmado) return;

  mostrarMensaje(
    `Eliminando ${contacto.nombreCompleto || contacto.correo} de Google Contacts...`,
  );

  try {
    await marcarSincronizacionGoogleContacts_(contacto, false);

    try {
      await solicitarEliminacionGoogleContact_(contacto.correo);
    } catch (errorGoogle) {
      try {
        await marcarSincronizacionGoogleContacts_(contacto, true);
      } catch (errorRestauracion) {
        console.error(
          "No se pudo restaurar la inclusión en Google Contacts:",
          errorRestauracion,
        );
      }

      throw errorGoogle;
    }

    aplicarFiltros();

    mostrarMensaje(
      `${contacto.nombreCompleto || contacto.correo} fue eliminado de Google Contacts y excluido de futuras sincronizaciones.`,
      "ok",
    );

    if (window.Swal) {
      await Swal.fire({
        icon: "success",
        title: "Contacto eliminado",
        html: [
          "Se eliminó de Google Contacts.",
          "<br>El usuario permanece intacto en el Portal.",
          "<br>Podés reincorporarlo cuando quieras desde esta misma tabla.",
        ].join(""),
        confirmButtonText: "Entendido",
      });
    }
  } catch (error) {
    console.error("Error al eliminar contacto de Google Contacts:", error);
    aplicarFiltros();
    mostrarMensaje(
      error?.message || "No se pudo eliminar el contacto de Google Contacts.",
      "error",
    );

    if (window.Swal) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error?.message || "Ocurrió un error inesperado.",
        confirmButtonText: "Entendido",
      });
    }
  }
}

async function reincorporarContactoGoogle_(contacto) {
  if (!contacto || obtenerRolActivo() !== "SOPORTE") return;

  try {
    await marcarSincronizacionGoogleContacts_(contacto, true);
    aplicarFiltros();

    mostrarMensaje(
      `${contacto.nombreCompleto || contacto.correo} volverá a incluirse en la próxima sincronización con Google Contacts.`,
      "ok",
    );

    if (window.Swal) {
      await Swal.fire({
        icon: "success",
        title: "Contacto reincorporado",
        text: "Volverá a crearse o actualizarse en Google Contacts en la próxima sincronización.",
        confirmButtonText: "Entendido",
      });
    }
  } catch (error) {
    console.error("Error al reincorporar contacto a Google Contacts:", error);
    mostrarMensaje(
      error?.message || "No se pudo reincorporar el contacto.",
      "error",
    );
  }
}

function prepararContactosParaGoogle_(contactosFuente) {
  return contactosFuente
    .filter(
      (contacto) =>
        contacto.estado === "ACTIVO" &&
        contacto.sincronizarGoogleContacts !== false,
    )
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
          `<strong>Etiquetas nuevas:</strong> ${detalleEtiquetas}`,
          `<strong>Asignaciones de etiquetas:</strong> ${resultado.etiquetasAAgregar || 0}`,
          `<strong>Etiquetas a quitar:</strong> ${resultado.etiquetasAQuitar || 0}`,
          `<strong>Errores:</strong> ${cantidadErrores}`,
          "",
          "<em>La sincronización no elimina contactos. Agrega y quita etiquetas institucionales para que Google Contacts coincida con el Portal.</em>",
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
          `Etiquetas nuevas: ${detalleEtiquetas}`,
          `Asignaciones de etiquetas: ${resultado.etiquetasAAgregar || 0}`,
          `Etiquetas a quitar: ${resultado.etiquetasAQuitar || 0}`,
          `Errores: ${cantidadErrores}`,
          "",
          "La sincronización no elimina contactos.",
          "Agrega y quita etiquetas institucionales para que Google Contacts coincida con el Portal.",
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
    const botonEliminar = event.target.closest(".btn-eliminar-google-contacto");
    const botonReincorporar = event.target.closest(
      ".btn-reincorporar-google-contacto",
    );

    const boton = botonEditar || botonEliminar || botonReincorporar;
    if (!boton) return;

    const contacto = contactosCargados.find(
      (item) => item.id === boton.dataset.contactoId,
    );

    if (botonEditar) {
      editarEtiquetasContacto_(contacto);
      return;
    }

    if (botonEliminar) {
      eliminarContactoGoogle_(contacto);
      return;
    }

    if (botonReincorporar) {
      reincorporarContactoGoogle_(contacto);
    }
  });
}

if (btnImportarEtiquetas && archivoEtiquetas) {
  btnImportarEtiquetas.addEventListener("click", () => {
    archivoEtiquetas.click();
  });

  archivoEtiquetas.addEventListener("change", () => {
    const archivo = archivoEtiquetas.files?.[0];
    if (archivo) importarEtiquetasDesdeArchivo(archivo);
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
