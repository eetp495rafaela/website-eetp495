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
    celda.colSpan = 6;
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
    fila.appendChild(crearCelda(contacto.rol));
    fila.appendChild(crearCelda(contacto.tipoVinculo));
    fila.appendChild(crearCelda(etiquetas));
    fila.appendChild(crearCelda(contacto.estado));

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
      contacto.rol,
      contacto.tipoVinculo,
      contacto.estado,
      ...contacto.etiquetasContacto,
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    return contenido.includes(texto);
  });

  renderizarContactos(filtrados);
}

async function cargarContactos() {
  if (!accesoContactosHabilitado || !cuerpoTabla) {
    return;
  }

  mostrarMensaje("Cargando contactos...");

  try {
    const consulta = query(
      collection(db, "usuarios"),
      where("rol", "!=", "ALUMNO"),
    );

    const resultado = await getDocs(consulta);

    contactosCargados = resultado.docs
      .map(prepararContacto)
      .sort((a, b) =>
        a.nombreCompleto.localeCompare(b.nombreCompleto, "es", {
          sensitivity: "base",
        }),
      );

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

if (btnImportarEtiquetas && archivoEtiquetas) {
  btnImportarEtiquetas.addEventListener("click", () => {
    archivoEtiquetas.click();
  });

  archivoEtiquetas.addEventListener("change", () => {
    const archivo = archivoEtiquetas.files?.[0];
    if (archivo) importarEtiquetasDesdeArchivo(archivo);
  });
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
