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
const filtroEstado = document.getElementById(
  "filtroEstadoContactoInstitucional",
);
const cuerpoTabla = document.getElementById(
  "cuerpoTablaContactosInstitucionales",
);
const mensajeContactos = document.getElementById(
  "mensajeContactosInstitucionales",
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
  const estado = normalizarTexto(filtroEstado?.value);

  const filtrados = contactosCargados.filter((contacto) => {
    if (estado && contacto.estado !== estado) {
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
    const resultado = await getDocs(collection(db, "usuarios"));

    contactosCargados = resultado.docs
      .map(prepararContacto)
      .filter((contacto) => contacto.rol !== "ALUMNO")
      .sort((a, b) =>
        a.nombreCompleto.localeCompare(b.nombreCompleto, "es", {
          sensitivity: "base",
        }),
      );

    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar los contactos institucionales:", error);
    mostrarMensaje(
      "No se pudieron cargar los contactos. Revisá permisos o conexión.",
      "error",
    );
  }
}

if (btnVerContactos) {
  btnVerContactos.addEventListener("click", cargarContactos);
}

if (buscarContacto) {
  buscarContacto.addEventListener("input", aplicarFiltros);
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
