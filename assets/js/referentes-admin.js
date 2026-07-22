import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
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

/* =====================================================
   ELEMENTOS DEL FORMULARIO
===================================================== */

const formReferenteInstitucional = document.getElementById(
  "formReferenteInstitucional",
);

const referenteInstitucionalId = document.getElementById(
  "referenteInstitucionalId",
);

const referenteCargo = document.getElementById("referenteCargo");

const referentePersona = document.getElementById("referentePersona");

const campoCursoReferenteInstitucional = document.getElementById(
  "campoCursoReferenteInstitucional",
);

const referenteCurso = document.getElementById("referenteCurso");

const referenteEstado = document.getElementById("referenteEstado");

const btnGuardarReferenteInstitucional = document.getElementById(
  "btnGuardarReferenteInstitucional",
);

const btnCancelarEdicionReferente = document.getElementById(
  "btnCancelarEdicionReferente",
);

const mensajeReferenteInstitucional = document.getElementById(
  "mensajeReferenteInstitucional",
);

/* =====================================================
   ELEMENTOS DEL LISTADO
===================================================== */

const btnVerReferentesInstitucionales = document.getElementById(
  "btnVerReferentesInstitucionales",
);

const filtroCargoReferente = document.getElementById("filtroCargoReferente");

const filtroCursoReferente = document.getElementById("filtroCursoReferente");

const filtroEstadoReferente = document.getElementById("filtroEstadoReferente");

const cuerpoTablaReferentesInstitucionales = document.getElementById(
  "cuerpoTablaReferentesInstitucionales",
);

const mensajeReferentesInstitucionales = document.getElementById(
  "mensajeReferentesInstitucionales",
);

/* =====================================================
   ESTADO DEL MÓDULO
===================================================== */

let usuarioAdministrador = null;
let usuariosReferentesCargados = [];
let cursosReferentesCargados = [];
let referentesInstitucionalesCargados = [];

/* =====================================================
   FUNCIONES GENERALES
===================================================== */

function normalizarCorreoReferente(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function textoCargoReferente(cargo) {
  const textos = {
    DIRECTORA: "Directora",
    VICE_DIRECTORA: "Vice Directora",
    PRO_SECRETARIO: "Pro Secretario",
    PRECEPTOR: "Preceptor/a",
  };

  return (
    textos[
      String(cargo || "")
        .trim()
        .toUpperCase()
    ] || cargo
  );
}

function obtenerRolParaCargo(cargo) {
  const roles = {
    DIRECTORA: "DIRECCION",
    VICE_DIRECTORA: "DIRECCION",
    PRO_SECRETARIO: "SECRETARIA",
    PRECEPTOR: "PRECEPTORIA",
  };

  return (
    roles[
      String(cargo || "")
        .trim()
        .toUpperCase()
    ] || ""
  );
}

function mostrarMensajeFormularioReferente(texto, tipo = "") {
  if (!mensajeReferenteInstitucional) return;

  mensajeReferenteInstitucional.textContent = texto;

  mensajeReferenteInstitucional.className = `mensaje-formulario ${tipo}`.trim();
}

function mostrarMensajeListadoReferentes(texto, tipo = "") {
  if (!mensajeReferentesInstitucionales) return;

  mensajeReferentesInstitucionales.textContent = texto;

  mensajeReferentesInstitucionales.className =
    `mensaje-formulario ${tipo}`.trim();
}

function crearCeldaReferente(texto) {
  const celda = document.createElement("td");

  celda.textContent = texto || "-";

  return celda;
}

function crearCeldaEstadoReferente(estado) {
  const celda = document.createElement("td");
  const etiqueta = document.createElement("span");

  const valor = String(estado || "")
    .trim()
    .toUpperCase();

  etiqueta.className =
    valor === "ACTIVO" ? "estado estado-activo" : "estado estado-inactivo";

  etiqueta.textContent = valor || "SIN ESTADO";

  celda.appendChild(etiqueta);

  return celda;
}

function crearBotonReferente(icono, texto, clase = "") {
  const boton = document.createElement("button");

  boton.type = "button";
  boton.className = `btn-tabla ${clase}`.trim();

  boton.innerHTML = `
    <i class="${icono}"></i>
    ${texto}
  `;

  return boton;
}

/* =====================================================
   CARGA DE USUARIOS Y CURSOS
===================================================== */

async function cargarUsuariosDisponiblesReferentes() {
  const consulta = await getDocs(collection(db, "usuarios"));

  usuariosReferentesCargados = consulta.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((usuario) => {
      const estado = String(usuario.estado || "")
        .trim()
        .toUpperCase();

      return estado === "ACTIVO";
    })
    .sort((a, b) =>
      String(a.nombreCompleto || "").localeCompare(
        String(b.nombreCompleto || ""),
        "es",
        {
          sensitivity: "base",
        },
      ),
    );
}

function completarSelectCursosReferentes(
  select,
  textoInicial,
  valorSeleccionado = "",
) {
  if (!select) return;

  select.innerHTML = "";

  const opcionInicial = document.createElement("option");

  opcionInicial.value = "";
  opcionInicial.textContent = textoInicial;

  select.appendChild(opcionInicial);

  cursosReferentesCargados.forEach((curso) => {
    const opcion = document.createElement("option");

    opcion.value = curso.id;
    opcion.textContent = curso.nombre;

    select.appendChild(opcion);
  });

  if (
    valorSeleccionado &&
    cursosReferentesCargados.some((curso) => curso.id === valorSeleccionado)
  ) {
    select.value = valorSeleccionado;
  }
}

async function cargarCursosDisponiblesReferentes() {
  const consulta = await getDocs(collection(db, "cursos"));

  cursosReferentesCargados = consulta.docs
    .map((documento) => {
      const datos = documento.data();

      return {
        id: documento.id,
        ...datos,

        nombre:
          String(datos.nombre || "").trim() ||
          `${datos.anio || ""}º ${datos.division || ""}`.trim(),
      };
    })
    .filter((curso) => {
      const estado = String(curso.estado || "")
        .trim()
        .toUpperCase();

      return estado === "ACTIVO";
    })
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  completarSelectCursosReferentes(referenteCurso, "Seleccionar curso");

  completarSelectCursosReferentes(filtroCursoReferente, "Todos los cursos");
}

function cargarPersonasParaCargo(cargo, personaSeleccionada = "") {
  if (!referentePersona) return;

  referentePersona.innerHTML = "";

  const opcionInicial = document.createElement("option");

  opcionInicial.value = "";

  if (!cargo) {
    opcionInicial.textContent = "Seleccionar primero un cargo";
    referentePersona.appendChild(opcionInicial);
    return;
  }

  const rolNecesario = obtenerRolParaCargo(cargo);

  const personas = usuariosReferentesCargados.filter((usuario) => {
    const rol = String(usuario.rol || "")
      .trim()
      .toUpperCase();

    return rol === rolNecesario;
  });

  opcionInicial.textContent = personas.length
    ? "Seleccionar persona"
    : "No hay personas activas para este cargo";

  referentePersona.appendChild(opcionInicial);

  personas.forEach((persona) => {
    const opcion = document.createElement("option");

    opcion.value = persona.id;

    const nombre =
      String(persona.nombreCompleto || "").trim() ||
      persona.correo ||
      persona.id;

    const correo = String(persona.correo || persona.id || "").trim();

    opcion.textContent = correo ? `${nombre} — ${correo}` : nombre;

    referentePersona.appendChild(opcion);
  });

  if (
    personaSeleccionada &&
    personas.some((persona) => persona.id === personaSeleccionada)
  ) {
    referentePersona.value = personaSeleccionada;
  }
}

/* =====================================================
   COMPORTAMIENTO DEL FORMULARIO
===================================================== */

function actualizarCampoCursoReferente() {
  if (!referenteCargo || !campoCursoReferenteInstitucional || !referenteCurso) {
    return;
  }

  const requiereCurso = cargoRequiereCursoReferente(referenteCargo.value);

  campoCursoReferenteInstitucional.hidden = !requiereCurso;

  referenteCurso.required = requiereCurso;
  referenteCurso.disabled = !requiereCurso;

  if (!requiereCurso) {
    referenteCurso.value = "";
  }
}

function restablecerFormularioReferente() {
  if (!formReferenteInstitucional) return;

  formReferenteInstitucional.reset();

  referenteInstitucionalId.value = "";

  campoCursoReferenteInstitucional.hidden = true;
  referenteCurso.required = false;
  referenteCurso.disabled = true;
  referenteCurso.value = "";

  referentePersona.innerHTML = `
    <option value="">
      Seleccionar primero un cargo
    </option>
  `;

  btnGuardarReferenteInstitucional.innerHTML = `
    <i class="fa-solid fa-floppy-disk"></i>
    Guardar referente
  `;

  btnCancelarEdicionReferente.hidden = true;

  mostrarMensajeFormularioReferente("");
}

async function obtenerReferentesInstitucionales() {
  const consulta = await getDocs(collection(db, "referentes_institucionales"));

  return consulta.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

function validarDuplicadoReferente(referentes, datos, idExcluir = "") {
  if (datos.estado !== "ACTIVO") {
    return "";
  }

  if (datos.cargo === "PRECEPTOR") {
    const duplicado = referentes.some((referente) => {
      const activo =
        String(referente.estado || "")
          .trim()
          .toUpperCase() === "ACTIVO";

      return (
        referente.id !== idExcluir &&
        activo &&
        referente.cargo === "PRECEPTOR" &&
        referente.cursoId === datos.cursoId
      );
    });

    return duplicado
      ? `El curso ${datos.cursoNombre} ya tiene una preceptoría activa.`
      : "";
  }

  const autoridadDuplicada = referentes.some((referente) => {
    const activo =
      String(referente.estado || "")
        .trim()
        .toUpperCase() === "ACTIVO";

    return (
      referente.id !== idExcluir && activo && referente.cargo === datos.cargo
    );
  });

  return autoridadDuplicada
    ? `Ya existe una autoridad activa para el cargo ${textoCargoReferente(
        datos.cargo,
      )}.`
    : "";
}

/* =====================================================
   ALTA Y EDICIÓN
===================================================== */

async function guardarReferenteInstitucional(event) {
  event.preventDefault();

  if (!usuarioAdministrador) {
    mostrarMensajeFormularioReferente(
      "Esperando validación de sesión.",
      "error",
    );

    return;
  }

  const idEdicion = String(referenteInstitucionalId.value || "").trim();

  const cargo = String(referenteCargo.value || "")
    .trim()
    .toUpperCase();

  const usuarioId = String(referentePersona.value || "").trim();

  const estado = String(referenteEstado.value || "ACTIVO")
    .trim()
    .toUpperCase();

  if (!cargo || !usuarioId) {
    mostrarMensajeFormularioReferente(
      "Seleccioná el cargo y la persona.",
      "error",
    );

    return;
  }

  const persona = usuariosReferentesCargados.find(
    (usuario) => usuario.id === usuarioId,
  );

  if (!persona) {
    mostrarMensajeFormularioReferente(
      "No se pudo identificar a la persona seleccionada.",
      "error",
    );

    return;
  }

  const esPreceptor = cargoRequiereCursoReferente(cargo);

  const cursoId = esPreceptor ? String(referenteCurso.value || "").trim() : "";

  const curso = esPreceptor
    ? cursosReferentesCargados.find((item) => item.id === cursoId)
    : null;

  if (esPreceptor && !curso) {
    mostrarMensajeFormularioReferente(
      "Seleccioná el curso correspondiente a la preceptoría.",
      "error",
    );

    return;
  }

  const datos = {
    cargo,
    cargoNombre: textoCargoReferente(cargo),

    usuarioId: persona.id,

    nombreCompleto:
      String(persona.nombreCompleto || "").trim() ||
      persona.correo ||
      persona.id,

    correo: normalizarCorreoReferente(persona.correo || persona.id),

    alcance: esPreceptor ? "CURSO" : "INSTITUCIONAL",

    cursoId: esPreceptor ? curso.id : null,
    cursoNombre: esPreceptor ? curso.nombre : null,
    cursoAnio: esPreceptor ? curso.anio || null : null,
    cursoDivision: esPreceptor ? curso.division || null : null,

    estado,

    actualizadoEn: serverTimestamp(),

    actualizadoPor: normalizarCorreoReferente(usuarioAdministrador.email),
  };

  btnGuardarReferenteInstitucional.disabled = true;

  mostrarMensajeFormularioReferente(
    idEdicion ? "Guardando cambios..." : "Registrando referente...",
  );

  try {
    const referentesActuales = await obtenerReferentesInstitucionales();

    const mensajeDuplicado = validarDuplicadoReferente(
      referentesActuales,
      datos,
      idEdicion,
    );

    if (mensajeDuplicado) {
      mostrarMensajeFormularioReferente(mensajeDuplicado, "error");

      return;
    }

    if (idEdicion) {
      await updateDoc(doc(db, "referentes_institucionales", idEdicion), datos);
    } else {
      await addDoc(collection(db, "referentes_institucionales"), {
        ...datos,

        creadoEn: serverTimestamp(),

        creadoPor: normalizarCorreoReferente(usuarioAdministrador.email),
      });
    }

    await Swal.fire({
      title: idEdicion ? "Referente actualizado" : "Referente registrado",

      text: idEdicion
        ? "Los cambios fueron guardados correctamente."
        : "El referente fue registrado correctamente.",

      icon: "success",
      confirmButtonText: "Aceptar",
    });

    restablecerFormularioReferente();

    await cargarReferentesInstitucionales();
  } catch (error) {
    console.error("Error al guardar referente institucional:", error);

    mostrarMensajeFormularioReferente(
      "No se pudo guardar el referente. Revisá la conexión o los permisos de Firebase.",
      "error",
    );
  } finally {
    btnGuardarReferenteInstitucional.disabled = false;
  }
}

/* =====================================================
   EDICIÓN DESDE LA TABLA
===================================================== */

function obtenerUsuarioIdReferente(referente) {
  if (referente.usuarioId) {
    return referente.usuarioId;
  }

  const correoReferente = normalizarCorreoReferente(referente.correo);

  const usuario = usuariosReferentesCargados.find(
    (item) =>
      normalizarCorreoReferente(item.correo || item.id) === correoReferente,
  );

  return usuario?.id || "";
}

function editarReferenteInstitucional(referente) {
  referenteInstitucionalId.value = referente.id;

  referenteCargo.value = referente.cargo || "";

  actualizarCampoCursoReferente();

  cargarPersonasParaCargo(
    referente.cargo,
    obtenerUsuarioIdReferente(referente),
  );

  referenteCurso.value = referente.cursoId || "";

  referenteEstado.value = referente.estado || "ACTIVO";

  btnGuardarReferenteInstitucional.innerHTML = `
    <i class="fa-solid fa-floppy-disk"></i>
    Guardar cambios
  `;

  btnCancelarEdicionReferente.hidden = false;

  mostrarMensajeFormularioReferente(`Editando: ${referente.nombreCompleto}`);

  formReferenteInstitucional.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/* =====================================================
   ACTIVAR O DAR DE BAJA
===================================================== */

async function cambiarEstadoReferente(referente) {
  const estadoActual = String(referente.estado || "")
    .trim()
    .toUpperCase();

  const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

  const accion = nuevoEstado === "ACTIVO" ? "activar" : "dar de baja";

  const confirmacion = await Swal.fire({
    title:
      nuevoEstado === "ACTIVO"
        ? "¿Activar referente?"
        : "¿Dar de baja al referente?",

    html: `
      <p><strong>${referente.nombreCompleto || ""}</strong></p>
      <p>${textoCargoReferente(referente.cargo)}</p>
      <p>${
        referente.cargo === "PRECEPTOR"
          ? referente.cursoNombre || "Curso sin cargar"
          : "Alcance institucional"
      }</p>
    `,

    icon: "warning",
    showCancelButton: true,

    confirmButtonText:
      nuevoEstado === "ACTIVO" ? "Sí, activar" : "Sí, dar de baja",

    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const referentesActuales = await obtenerReferentesInstitucionales();

    const datosValidacion = {
      cargo: referente.cargo,
      estado: nuevoEstado,
      cursoId: referente.cursoId || null,
      cursoNombre: referente.cursoNombre || "",
    };

    const mensajeDuplicado = validarDuplicadoReferente(
      referentesActuales,
      datosValidacion,
      referente.id,
    );

    if (mensajeDuplicado) {
      await Swal.fire({
        title: "No se puede activar",
        text: mensajeDuplicado,
        icon: "error",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    await updateDoc(doc(db, "referentes_institucionales", referente.id), {
      estado: nuevoEstado,

      actualizadoEn: serverTimestamp(),

      actualizadoPor: normalizarCorreoReferente(usuarioAdministrador?.email),
    });

    await Swal.fire({
      title:
        nuevoEstado === "ACTIVO"
          ? "Referente activado"
          : "Referente dado de baja",

      text: `Se pudo ${accion} correctamente.`,

      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarReferentesInstitucionales();
  } catch (error) {
    console.error("Error al modificar el estado del referente:", error);

    await Swal.fire({
      title: "No se pudo modificar",
      text: "Revisá la conexión o los permisos de Firebase.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

/* =====================================================
   TABLA
===================================================== */

function crearCeldaAccionesReferente(referente) {
  const celda = document.createElement("td");
  const contenedor = document.createElement("div");

  contenedor.className = "acciones-tabla";

  const btnEditar = crearBotonReferente(
    "fa-solid fa-pen-to-square",
    "Editar",
    "btn-editar",
  );

  btnEditar.addEventListener("click", () => {
    editarReferenteInstitucional(referente);
  });

  contenedor.appendChild(btnEditar);

  const estaActivo =
    String(referente.estado || "")
      .trim()
      .toUpperCase() === "ACTIVO";

  const btnEstado = crearBotonReferente(
    estaActivo ? "fa-solid fa-user-slash" : "fa-solid fa-user-check",

    estaActivo ? "Dar de baja" : "Activar",

    estaActivo ? "btn-desactivar" : "btn-activar",
  );

  btnEstado.addEventListener("click", () => {
    cambiarEstadoReferente(referente);
  });

  contenedor.appendChild(btnEstado);
  celda.appendChild(contenedor);

  return celda;
}

function renderizarReferentesInstitucionales(referentes) {
  if (!cuerpoTablaReferentesInstitucionales) return;

  cuerpoTablaReferentesInstitucionales.innerHTML = "";

  if (!referentes.length) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 6;
    celda.className = "tabla-vacia";
    celda.textContent = "No se encontraron referentes con esos filtros.";

    fila.appendChild(celda);

    cuerpoTablaReferentesInstitucionales.appendChild(fila);

    mostrarMensajeListadoReferentes(
      "No se encontraron referentes con esos filtros.",
    );

    return;
  }

  referentes.forEach((referente) => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCeldaReferente(textoCargoReferente(referente.cargo)));

    fila.appendChild(crearCeldaReferente(referente.nombreCompleto));

    fila.appendChild(crearCeldaReferente(referente.correo));

    fila.appendChild(
      crearCeldaReferente(
        referente.cargo === "PRECEPTOR"
          ? referente.cursoNombre
          : "Institucional",
      ),
    );

    fila.appendChild(crearCeldaEstadoReferente(referente.estado));

    fila.appendChild(crearCeldaAccionesReferente(referente));

    cuerpoTablaReferentesInstitucionales.appendChild(fila);
  });

  mostrarMensajeListadoReferentes(
    `${referentes.length} referente(s) mostrado(s).`,
    "ok",
  );
}

function aplicarFiltrosReferentesInstitucionales() {
  const cargoSeleccionado = String(filtroCargoReferente?.value || "")
    .trim()
    .toUpperCase();

  const cursoSeleccionado = String(filtroCursoReferente?.value || "").trim();

  const estadoSeleccionado = String(filtroEstadoReferente?.value || "")
    .trim()
    .toUpperCase();

  const referentesFiltrados = referentesInstitucionalesCargados.filter(
    (referente) => {
      const cargo = String(referente.cargo || "")
        .trim()
        .toUpperCase();

      const estado = String(referente.estado || "")
        .trim()
        .toUpperCase();

      const coincideCargo = !cargoSeleccionado || cargo === cargoSeleccionado;

      const coincideCurso =
        !cursoSeleccionado || referente.cursoId === cursoSeleccionado;

      const coincideEstado =
        !estadoSeleccionado || estado === estadoSeleccionado;

      return coincideCargo && coincideCurso && coincideEstado;
    },
  );

  renderizarReferentesInstitucionales(referentesFiltrados);
}

async function cargarReferentesInstitucionales() {
  if (!usuarioAdministrador) {
    mostrarMensajeListadoReferentes("Esperando validación de sesión.", "error");

    return;
  }

  btnVerReferentesInstitucionales.disabled = true;

  mostrarMensajeListadoReferentes("Cargando referentes...");

  cuerpoTablaReferentesInstitucionales.innerHTML = `
    <tr>
      <td colspan="6" class="tabla-vacia">
        Cargando referentes institucionales...
      </td>
    </tr>
  `;

  try {
    referentesInstitucionalesCargados =
      await obtenerReferentesInstitucionales();

    const ordenCargos = {
      DIRECTORA: 1,
      VICE_DIRECTORA: 2,
      PRO_SECRETARIO: 3,
      PRECEPTOR: 4,
    };

    referentesInstitucionalesCargados.sort((a, b) => {
      const ordenA = ordenCargos[a.cargo] || 99;
      const ordenB = ordenCargos[b.cargo] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return String(a.cursoNombre || a.nombreCompleto || "").localeCompare(
        String(b.cursoNombre || b.nombreCompleto || ""),
        "es",
        {
          numeric: true,
          sensitivity: "base",
        },
      );
    });

    aplicarFiltrosReferentesInstitucionales();
  } catch (error) {
    console.error("Error al cargar referentes institucionales:", error);

    cuerpoTablaReferentesInstitucionales.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-vacia">
          No se pudieron cargar los referentes.
        </td>
      </tr>
    `;

    mostrarMensajeListadoReferentes(
      "No se pudieron cargar los referentes. Revisá la conexión o los permisos de Firebase.",
      "error",
    );
  } finally {
    btnVerReferentesInstitucionales.disabled = false;
  }
}

/* =====================================================
   EVENTOS
===================================================== */

referenteCargo?.addEventListener("change", () => {
  actualizarCampoCursoReferente();

  cargarPersonasParaCargo(referenteCargo.value);
});

formReferenteInstitucional?.addEventListener(
  "submit",
  guardarReferenteInstitucional,
);

btnCancelarEdicionReferente?.addEventListener(
  "click",
  restablecerFormularioReferente,
);

btnVerReferentesInstitucionales?.addEventListener(
  "click",
  cargarReferentesInstitucionales,
);

filtroCargoReferente?.addEventListener(
  "change",
  aplicarFiltrosReferentesInstitucionales,
);

filtroCursoReferente?.addEventListener(
  "change",
  aplicarFiltrosReferentesInstitucionales,
);

filtroEstadoReferente?.addEventListener(
  "change",
  aplicarFiltrosReferentesInstitucionales,
);

/* =====================================================
   INICIO DEL MÓDULO
===================================================== */

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  usuarioAdministrador = usuario;

  try {
    await Promise.all([
      cargarUsuariosDisponiblesReferentes(),
      cargarCursosDisponiblesReferentes(),
    ]);
  } catch (error) {
    console.error("Error al preparar el módulo de referentes:", error);

    mostrarMensajeFormularioReferente(
      "No se pudieron cargar los usuarios o cursos disponibles.",
      "error",
    );
  }
});
