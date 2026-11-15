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
  getDocsFromServer,
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
  "PRECEPTORIA",
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
const btnGenerarAgendaContactos = document.getElementById(
  "btnGenerarAgendaContactosInstitucionales",
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





/* Agenda institucional alfabética: consulta en tiempo real, sin guardar PDF. */
function escaparHtmlAgenda_(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function letraAgenda_(texto) {
  const letra = String(texto || "").trim().charAt(0).toLocaleUpperCase("es");
  if (letra === "Ñ") return "Ñ";
  const base = letra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^[A-Z]$/.test(base) ? base : "#";
}

function obtenerDniAgenda_(contacto) {
  const dni = String(contacto.dni ?? "").replace(/\D/g, "");
  return /^[0-9]{7,8}$/.test(dni) ? dni : "";
}


// Etiquetas disponibles solo entre los contactos autorizados para esta planilla.
const CORREOS_TECNICOS_AGENDA_ = new Set([
  "soportetecnico.tec495@gmail.com",
  "enviotrabajos495@gmail.com",
]);

function contactosImprimiblesAgenda_(contactos) {
  return contactos.filter((contacto) =>
    !CORREOS_TECNICOS_AGENDA_.has(normalizarCorreo(contacto.correo))
  );
}

function etiquetasImprimiblesAgenda_(contactos) {
  const etiquetas = new Map();
  contactosImprimiblesAgenda_(contactos).forEach((contacto) => {
    contacto.etiquetasContacto.forEach((etiqueta) => {
      const nombre = String(etiqueta).trim();
      const clave = nombre.toLocaleLowerCase("es");
      if (nombre && !etiquetas.has(clave)) etiquetas.set(clave, nombre);
    });
  });
  return [...etiquetas.values()].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );
}

function solicitarDatosReunionAgenda_(etiquetasDisponibles) {
  return new Promise((resolver) => {
    const dialogo = document.createElement("dialog");
    const estilo = document.createElement("style");
    estilo.textContent = ".agenda-modal{position:fixed!important;top:50%!important;left:50%!important;right:auto!important;bottom:auto!important;inset-block-start:50%!important;inset-inline-start:50%!important;transform:translate(-50%,-50%)!important;margin:0!important;box-sizing:border-box;border:0!important;border-radius:14px;max-width:min(95vw,520px);width:100%;max-height:calc(100dvh - 32px);overflow-y:auto;padding:24px;color:#193954!important;background:#fff!important;box-shadow:0 12px 40px #0004}.agenda-modal::backdrop{background:rgba(10,28,48,.65)}.agenda-modal label{display:block;margin:12px 0 5px;font-weight:650}.agenda-modal input:not([type=radio]){box-sizing:border-box;width:100%;padding:10px;border:1px solid #9aaebe;border-radius:7px;font:inherit;color:#193954;background:white}.agenda-modal .agenda-opciones{display:flex;gap:20px;align-items:center;margin:14px 0}.agenda-modal .agenda-opciones label{margin:0;display:flex;gap:7px;align-items:center}.agenda-modal .agenda-botones{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.agenda-modal button{padding:10px 15px;border-radius:7px;border:1px solid #a8b8c9;cursor:pointer;font-weight:700}.agenda-modal button[type=submit]{color:white;background:#073683;border-color:#073683}.agenda-modal select{box-sizing:border-box;width:100%;padding:10px;border:1px solid #9aaebe;border-radius:7px;font:inherit;color:#193954;background:white}.agenda-modal [hidden]{display:none!important}";
    dialogo.className = "agenda-modal";
    dialogo.setAttribute("aria-label", "Opciones de la planilla de asistencia");
    dialogo.innerHTML = '<form><h2 style="margin:0;font-size:21px">Generar planilla de asistencia</h2>' +
      '<p>¿La planilla corresponde a una reunión?</p>' +
      '<div class="agenda-opciones"><label><input type="radio" name="reunion" value="si" required> Sí</label>' +
      '<label><input type="radio" name="reunion" value="no"> No</label></div>' +
      '<div class="agenda-campos" hidden>' +
      '<label for="agenda-fecha">Fecha de reunión</label><input id="agenda-fecha" name="fecha" type="date">' +
      '<label for="agenda-hora">Horario (24 horas, HH:mm)</label><input id="agenda-hora" name="hora" type="text" inputmode="numeric" placeholder="14:30" pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]" maxlength="5" title="Ingresá la hora en formato de 24 horas, por ejemplo 14:30">' +
      '<label for="agenda-lugar">Lugar</label><input id="agenda-lugar" name="lugar" type="text" maxlength="120">' +
      '<label for="agenda-motivo">Motivo</label><input id="agenda-motivo" name="motivo" type="text" maxlength="180">' +
      '</div><div class="agenda-alcance"><label for="agenda-alcance">Contactos que se incluirán</label>' +
      '<select id="agenda-alcance" name="alcance"><option value="">Todos los contactos activos</option>' +
      '<option value="etiqueta">Elegir Departamento/Curso</option></select>' +
      '<div class="agenda-elegir-etiqueta" hidden><label for="agenda-etiqueta">Departamento/Curso</label>' +
      '<select id="agenda-etiqueta" name="etiqueta"><option value="">Seleccionar Departamento/Curso</option></select></div></div>' +
      '<div class="agenda-botones"><button type="button" class="agenda-cancelar">Cancelar</button>' +
      '<button type="submit">Generar planilla</button></div></form>';
    document.head.appendChild(estilo);
    document.body.appendChild(dialogo);
    const formulario = dialogo.querySelector("form");
    const campos = dialogo.querySelector(".agenda-campos");
    const entradas = [...campos.querySelectorAll("input")];
    const alcance = formulario.elements.alcance;
    const selectorEtiqueta = formulario.elements.etiqueta;
    const cajaEtiqueta = dialogo.querySelector(".agenda-elegir-etiqueta");
    etiquetasDisponibles.forEach((etiqueta) => {
      const opcion = document.createElement("option");
      opcion.value = etiqueta;
      opcion.textContent = etiqueta;
      selectorEtiqueta.appendChild(opcion);
    });
    alcance.addEventListener("change", () => {
      const elegir = alcance.value === "etiqueta";
      cajaEtiqueta.hidden = !elegir;
      selectorEtiqueta.required = elegir;
      if (elegir) selectorEtiqueta.focus();
    });
    let terminado = false;
    const finalizar = (resultado) => {
      if (terminado) return;
      terminado = true;
      dialogo.close();
      dialogo.remove();
      estilo.remove();
      resolver(resultado);
    };
    formulario.querySelectorAll('[name="reunion"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const esReunion = formulario.elements.reunion.value === "si";
        campos.hidden = !esReunion;
        entradas.forEach((entrada) => { entrada.required = esReunion; });
        if (esReunion) entradas[0].focus();
      });
    });
    formulario.querySelector(".agenda-cancelar").addEventListener("click", () => finalizar(null));
    dialogo.addEventListener("cancel", (evento) => { evento.preventDefault(); finalizar(null); });
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const etiquetaSeleccionada = alcance.value === "etiqueta" ? selectorEtiqueta.value : "";
      if (alcance.value === "etiqueta" && !etiquetaSeleccionada) {
        selectorEtiqueta.reportValidity();
        return;
      }
      if (formulario.elements.reunion.value === "no") {
        finalizar({ esReunion: false, etiqueta: etiquetaSeleccionada });
        return;
      }
      const hora = formulario.elements.hora.value.trim();
      if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(hora)) {
        formulario.elements.hora.setCustomValidity("Usá HH:mm en formato de 24 horas (por ejemplo, 14:30).");
        formulario.elements.hora.reportValidity();
        return;
      }
      finalizar({
        esReunion: true,
        etiqueta: etiquetaSeleccionada,
        fecha: formulario.elements.fecha.value,
        horario: hora,
        lugar: formulario.elements.lugar.value.trim(),
        motivo: formulario.elements.motivo.value.trim(),
      });
    });
    formulario.elements.hora.addEventListener("input", () => formulario.elements.hora.setCustomValidity(""));
    dialogo.showModal();
  });
}

function construirHtmlAgenda_(contactos, datosReunion = { esReunion: false }) {
  const comparar = new Intl.Collator("es", { sensitivity: "base", numeric: true });
  // Excluir exclusivamente las dos cuentas técnicas de esta planilla.
  // Los docentes con rol Soporte deben seguir apareciendo.
  const ordenados = contactosImprimiblesAgenda_(contactos).sort((a, b) =>
    comparar.compare(a.nombreCompleto, b.nombreCompleto) ||
    comparar.compare(a.correo, b.correo),
  );
  const grupos = new Map();
  ordenados.forEach((contacto) => {
    const letra = letraAgenda_(contacto.nombreCompleto);
    if (!grupos.has(letra)) grupos.set(letra, []);
    grupos.get(letra).push(contacto);
  });

  const filas = [...grupos.entries()]
    .sort(([a], [b]) => comparar.compare(a, b))
    .map(([letra, items]) =>
      '<tbody class="grupo">' +
      '<tr class="fila-letra"><th scope="rowgroup" colspan="6">' +
      escaparHtmlAgenda_(letra) + '</th></tr>' +
      items.map((contacto) =>
        '<tr class="fila-persona">' +
        '<td class="col-nombre">' + escaparHtmlAgenda_(contacto.nombreCompleto) + '</td>' +
        '<td class="col-dni">' + escaparHtmlAgenda_(obtenerDniAgenda_(contacto)) + '</td>' +
        '<td class="col-correo">' + escaparHtmlAgenda_(contacto.correo) + '</td>' +
        '<td class="col-firma"></td>' +
        '<td class="col-constancia"><span class="casilla-constancia"></span></td>' +
        '<td class="col-escuela"></td>' +
        '</tr>'
      ).join("") + '</tbody>'
    ).join("");

  const faltantesDni = ordenados.filter((contacto) => !obtenerDniAgenda_(contacto)).length;
  const logo = new URL("../assets/img/logo.png", window.location.href).href;
  const fechaGeneracion = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date());

  const estilos = [
    ":root{color-scheme:light}*{box-sizing:border-box}",
    "body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#193954;background:#edf2f8}",
    ".barra{background:#073683;color:white;padding:13px 20px;display:flex;justify-content:space-between;align-items:center;gap:15px}",
    ".barra button{background:white;color:#073683;border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}",
    "main{background:white;max-width:297mm;margin:20px auto;padding:12mm;box-shadow:0 4px 24px #0002}",
    "header{display:flex;align-items:center;gap:12px;padding-bottom:10px;border-bottom:2px solid #0b4c95;margin-bottom:10px}",
    "header img{width:47px;height:47px;object-fit:contain}",
    "h1{font-size:17px;color:#073683;margin:0 0 4px}",
    ".subtitulo{font-size:10px;color:#506779;line-height:1.5;margin:0}",
    ".datos-reunion{display:grid;grid-template-columns:1.1fr .65fr 1.2fr 1.65fr;gap:8px 13px;margin:13px 0 12px;font-size:11px;color:#193954}",
    ".datos-reunion span{min-width:0;overflow-wrap:anywhere}",
    ".tabla-scroll{overflow-x:auto}",
    ".planilla{width:100%;min-width:840px;border-collapse:collapse;table-layout:fixed}",
    ".planilla col.nombre{width:23%}.planilla col.dni{width:11%}.planilla col.correo{width:27%}.planilla col.firma{width:17%}.planilla col.constancia{width:11%}.planilla col.escuela{width:11%}",
    ".planilla thead th{border:1px solid #8ea9be;background:#dfeefa;color:#073683;padding:9px 7px;font-size:12px;text-align:left;text-transform:uppercase}",
    ".planilla tbody .fila-letra th{border:1px solid #8ea9be;background:#eef5fb;color:#105c9d;font-size:14px;text-align:left;padding:7px 9px}",
    ".planilla tbody td{border:1px solid #aebdca;height:15mm;min-height:15mm;padding:7px 8px;vertical-align:middle;font-size:14.5px;line-height:1.35}",
    ".planilla .col-nombre{font-weight:700;overflow-wrap:anywhere}",
    ".planilla .col-dni{font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".planilla .col-correo{font-size:14px;overflow-wrap:anywhere}",
    ".planilla .col-firma{background:#fff}",
    ".planilla .col-constancia{text-align:center}.casilla-constancia{display:inline-block;width:6mm;height:6mm;border:1.5px solid #193954;vertical-align:middle;background:#fff}",
    ".planilla .col-escuela{background:#fff}",
    ".observacion{font-size:10px;color:#4c6275;margin:10px 0 0}",
    "footer{margin-top:12px;color:#657d91;font-size:9px;line-height:1.4}",
    "@page{size:A4 landscape;margin:11mm 10mm}",
    "@media print{body{background:#fff}main{max-width:none;margin:0;padding:0;box-shadow:none}.barra{display:none}.tabla-scroll{overflow:visible}.planilla{min-width:0;width:100%}.planilla thead{display:table-header-group}.planilla tbody{display:table-row-group}.planilla tr{break-inside:avoid;page-break-inside:avoid}.planilla .fila-letra{break-after:avoid;page-break-after:avoid}header{break-after:avoid}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}",
    "@media screen and (max-width:700px){.barra{flex-direction:column;align-items:stretch}main{margin:10px;padding:16px}.datos-reunion{gap:8px}}",
  ].join("");

  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Planilla de asistencia - Reunión plenaria | E.E.T.P. N.º 495</title><style>' + estilos + '</style></head><body>',
    '<div class="barra"><strong>Planilla de asistencia - Vista imprimible</strong>',
    '<button type="button" onclick="window.print()">Imprimir / Guardar PDF</button></div>',
    '<main><header><img src="' + escaparHtmlAgenda_(logo) + '" alt="Escudo E.E.T.P. N.º 495">',
    '<div><h1>E.E.T.P. N.º 495 “Malvinas Argentinas”</h1>',
    '<p class="subtitulo">Planilla de asistencia · ' +
      (datosReunion.esReunion ? 'Reunión' : 'Listado institucional') + ' · ' +
      ordenados.length + ' usuarios activos (sin alumnado)' +
      (datosReunion.etiqueta ? ' · Departamento/Curso: ' + escaparHtmlAgenda_(datosReunion.etiqueta) : '') +
      '<br>Generada el ' + escaparHtmlAgenda_(fechaGeneracion) + '</p></div></header>',
    datosReunion.esReunion
      ? '<div class="datos-reunion"><span><strong>Fecha de reunión:</strong> ' +
        escaparHtmlAgenda_(datosReunion.fecha.split("-").reverse().join("/")) + '</span>' +
        '<span><strong>Horario:</strong> ' + escaparHtmlAgenda_(datosReunion.horario) + '</span>' +
        '<span><strong>Lugar:</strong> ' + escaparHtmlAgenda_(datosReunion.lugar) + '</span>' +
        '<span><strong>Motivo:</strong> ' + escaparHtmlAgenda_(datosReunion.motivo) + '</span></div>'
      : '',
    '<div class="tabla-scroll"><table class="planilla">',
    '<colgroup><col class="nombre"><col class="dni"><col class="correo"><col class="firma"><col class="constancia"><col class="escuela"></colgroup>',
    '<thead><tr><th scope="col">APELLIDO Y NOMBRE</th><th scope="col">DNI</th>',
    '<th scope="col">CORREO</th><th scope="col">FIRMA</th>',
    '<th scope="col">CONSTANCIA</th><th scope="col">ESCUELA</th></tr></thead>',
    filas, '</table></div>',
    faltantesDni
      ? '<p class="observacion">DNI pendientes de completar: ' + faltantesDni +
        '. Las celdas vacías pueden completarse a mano.</p>'
      : '',
    '<footer>Uso institucional · Fuente: Portal Institucional · No incluye alumnado ni usuarios inactivos. ' +
      'Documento con datos personales: conservar y distribuir únicamente entre personal autorizado.</footer>',
    '</main></body></html>',
  ].join("\n");
}

async function generarAgendaContactosImprimible_() {
  if (!btnGenerarAgendaContactos || !accesoContactosHabilitado || !auth.currentUser) {
    return;
  }
  const original = btnGenerarAgendaContactos.innerHTML;
  btnGenerarAgendaContactos.disabled = true;
  btnGenerarAgendaContactos.textContent = "Preparando opciones...";
  try {
    // Siempre se consulta al servidor: las opciones son etiquetas vigentes, no filtros de pantalla.
    const resultado = await getDocsFromServer(query(
      collection(db, "usuarios"),
      where("rol", "!=", "ALUMNO"),
    ));
    const contactos = contactosImprimiblesAgenda_(resultado.docs.map(prepararContacto).filter(
      (contacto) => contacto.estado === "ACTIVO" && contacto.nombreCompleto && contacto.correo,
    ));
    if (!contactos.length) throw new Error("No hay contactos institucionales activos.");
    btnGenerarAgendaContactos.disabled = false;
    btnGenerarAgendaContactos.innerHTML = original;
    const datosReunion = await solicitarDatosReunionAgenda_(etiquetasImprimiblesAgenda_(contactos));
    if (!datosReunion) return;

    const etiqueta = String(datosReunion.etiqueta || "").trim().toLocaleLowerCase("es");
    const seleccionados = etiqueta
      ? contactos.filter((contacto) => contacto.etiquetasContacto.some(
          (valor) => String(valor).trim().toLocaleLowerCase("es") === etiqueta
        ))
      : contactos;
    if (!seleccionados.length) {
      mostrarMensaje("No hay contactos activos para el Departamento/Curso elegido.", "error");
      return;
    }
    // Se abre inmediatamente después de confirmar el modal, antes de operaciones adicionales.
    const ventana = window.open("", "_blank");
    if (!ventana) {
      mostrarMensaje("Permití las ventanas emergentes para generar la agenda.", "error");
      return;
    }
    ventana.document.open();
    ventana.document.write(construirHtmlAgenda_(seleccionados, datosReunion));
    ventana.document.close();
    ventana.focus();
    mostrarMensaje("Agenda preparada con " + seleccionados.length + " contactos.", "ok");
  } catch (error) {
    console.error("Error al generar la agenda institucional:", error);
    mostrarMensaje(error?.message || "No se pudo generar la agenda.", "error");
  } finally {
    btnGenerarAgendaContactos.disabled = false;
    btnGenerarAgendaContactos.innerHTML = original;
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

if (btnGenerarAgendaContactos) {
  btnGenerarAgendaContactos.addEventListener("click", generarAgendaContactosImprimible_);
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
