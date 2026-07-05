import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  writeBatch,
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

const formulario = document.getElementById("formRegistroUsuario");
const mensajeRegistro = document.getElementById("mensajeRegistroUsuario");
const btnRegistrar = document.getElementById("btnRegistrarUsuario");
const btnVerUsuarios = document.getElementById("btnVerUsuarios");
const cuerpoTabla = document.getElementById("cuerpoTablaUsuarios");
const mensajeUsuarios = document.getElementById("mensajeUsuarios");
const buscarUsuario = document.getElementById("buscarUsuario");
const filtroRol = document.getElementById("filtroRol");
const filtroEstado = document.getElementById("filtroEstado");
const formRegistroCurso = document.getElementById("formRegistroCurso");
const cursoAnio = document.getElementById("cursoAnio");
const cursoDivision = document.getElementById("cursoDivision");
const cursoNombre = document.getElementById("cursoNombre");
const cursoEstado = document.getElementById("cursoEstado");
const btnRegistrarCurso = document.getElementById("btnRegistrarCurso");
const btnVerCursos = document.getElementById("btnVerCursos");
const cuerpoTablaCursos = document.getElementById("cuerpoTablaCursos");
const mensajeRegistroCurso = document.getElementById("mensajeRegistroCurso");
const mensajeCursos = document.getElementById("mensajeCursos");
const btnImportarPlanEstudios = document.getElementById(
  "btnImportarPlanEstudios",
);
const btnVerEspaciosCurriculares = document.getElementById(
  "btnVerEspaciosCurriculares",
);
const cuerpoTablaEspaciosCurriculares = document.getElementById(
  "cuerpoTablaEspaciosCurriculares",
);
const mensajeImportacionPlan = document.getElementById(
  "mensajeImportacionPlan",
);
const mensajeEspaciosCurriculares = document.getElementById(
  "mensajeEspaciosCurriculares",
);
const formRegistroAsignacion = document.getElementById(
  "formRegistroAsignacion",
);

const asignacionDocente = document.getElementById("asignacionDocente");

const asignacionCurso = document.getElementById("asignacionCurso");

const asignacionEspacio = document.getElementById("asignacionEspacio");

const asignacionCicloLectivo = document.getElementById(
  "asignacionCicloLectivo",
);

const asignacionEstado = document.getElementById("asignacionEstado");

const btnRegistrarAsignacion = document.getElementById(
  "btnRegistrarAsignacion",
);

const btnVerAsignaciones = document.getElementById("btnVerAsignaciones");

const cuerpoTablaAsignaciones = document.getElementById(
  "cuerpoTablaAsignaciones",
);

const mensajeRegistroAsignacion = document.getElementById(
  "mensajeRegistroAsignacion",
);

const mensajeAsignaciones = document.getElementById("mensajeAsignaciones");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const modalEditar = document.getElementById("modalEditarUsuario");
const formEditar = document.getElementById("formEditarUsuario");
const editarCorreo = document.getElementById("editarCorreo");
const editarCorreoVisible = document.getElementById("editarCorreoVisible");
const editarNombreCompleto = document.getElementById("editarNombreCompleto");
const editarRol = document.getElementById("editarRol");
const editarTipoVinculo = document.getElementById("editarTipoVinculo");
const editarFechaFinAcceso = document.getElementById("editarFechaFinAcceso");
const mensajeEditarUsuario = document.getElementById("mensajeEditarUsuario");
const btnCerrarEdicion = document.getElementById("btnCerrarEdicion");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");

let usuarioSoporte = null;
let usuariosCargados = [];
let usuarioEnEdicion = null;

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function mostrarMensajeRegistro(texto, tipo = "") {
  if (!mensajeRegistro) return;

  mensajeRegistro.textContent = texto;
  mensajeRegistro.className = `mensaje-formulario ${tipo}`.trim();
}

function mostrarMensajeUsuarios(texto, tipo = "") {
  if (!mensajeUsuarios) return;

  mensajeUsuarios.textContent = texto;
  mensajeUsuarios.className = `mensaje-formulario ${tipo}`.trim();
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto || "-";
  return celda;
}

function crearCeldaEstado(estado) {
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

function crearBoton(icono, texto, clase = "") {
  const boton = document.createElement("button");

  boton.type = "button";
  boton.className = `btn-tabla ${clase}`.trim();
  boton.innerHTML = `<i class="${icono}"></i> ${texto}`;

  return boton;
}

function crearCeldaAcciones(usuario) {
  const celda = document.createElement("td");
  const contenedor = document.createElement("div");

  contenedor.className = "acciones-tabla";

  const btnEditar = crearBoton(
    "fa-solid fa-pen-to-square",
    "Editar",
    "btn-editar",
  );

  btnEditar.addEventListener("click", () => {
    editarUsuario(usuario);
  });

  contenedor.appendChild(btnEditar);

  const correoActual = normalizarCorreo(usuarioSoporte?.email);
  const esMiCuenta = normalizarCorreo(usuario.correo) === correoActual;

  if (!esMiCuenta) {
    const estadoActual = String(usuario.estado || "")
      .trim()
      .toUpperCase();

    const estaActivo = estadoActual === "ACTIVO";

    const btnEstado = crearBoton(
      estaActivo ? "fa-solid fa-user-slash" : "fa-solid fa-user-check",
      estaActivo ? "Desactivar" : "Activar",
      estaActivo ? "btn-desactivar" : "btn-activar",
    );

    btnEstado.addEventListener("click", () => {
      cambiarEstadoUsuario(usuario);
    });

    contenedor.appendChild(btnEstado);
  }

  celda.appendChild(contenedor);

  return celda;
}

function renderizarUsuarios(usuarios) {
  cuerpoTabla.innerHTML = "";

  if (!usuarios.length) {
    mostrarMensajeUsuarios("No se encontraron usuarios con esos filtros.");
    return;
  }

  usuarios.forEach((usuario) => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCelda(usuario.nombreCompleto));
    fila.appendChild(crearCelda(usuario.correo));
    fila.appendChild(crearCelda(usuario.rol));
    fila.appendChild(crearCeldaEstado(usuario.estado));
    fila.appendChild(crearCelda(usuario.tipoVinculo));
    fila.appendChild(crearCeldaAcciones(usuario));

    cuerpoTabla.appendChild(fila);
  });

  mostrarMensajeUsuarios(`${usuarios.length} usuario(s) mostrado(s).`, "ok");
}

function aplicarFiltrosUsuarios() {
  const textoBusqueda = String(buscarUsuario?.value || "")
    .trim()
    .toLowerCase();

  const rolSeleccionado = String(filtroRol?.value || "")
    .trim()
    .toUpperCase();

  const estadoSeleccionado = String(filtroEstado?.value || "")
    .trim()
    .toUpperCase();

  const usuariosFiltrados = usuariosCargados.filter((usuario) => {
    const nombre = String(usuario.nombreCompleto || "").toLowerCase();
    const correo = String(usuario.correo || "").toLowerCase();

    const rol = String(usuario.rol || "")
      .trim()
      .toUpperCase();
    const estado = String(usuario.estado || "")
      .trim()
      .toUpperCase();

    const coincideBusqueda =
      !textoBusqueda ||
      nombre.includes(textoBusqueda) ||
      correo.includes(textoBusqueda);

    const coincideRol = !rolSeleccionado || rol === rolSeleccionado;

    const coincideEstado = !estadoSeleccionado || estado === estadoSeleccionado;

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  renderizarUsuarios(usuariosFiltrados);
}

function mostrarMensajeCurso(texto, tipo = "") {
  if (!mensajeRegistroCurso) return;

  mensajeRegistroCurso.textContent = texto;
  mensajeRegistroCurso.className = `mensaje-formulario ${tipo}`.trim();
}

function mostrarMensajeListadoCursos(texto, tipo = "") {
  if (!mensajeCursos) return;

  mensajeCursos.textContent = texto;
  mensajeCursos.className = `mensaje-formulario ${tipo}`.trim();
}

function actualizarNombreCurso() {
  if (!cursoAnio || !cursoDivision || !cursoNombre) return;

  const anio = String(cursoAnio.value || "").trim();
  const division = String(cursoDivision.value || "")
    .trim()
    .toUpperCase();

  cursoDivision.value = division;

  cursoNombre.value = anio && division ? `${anio}º ${division}` : "";
}

function crearCeldaCurso(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto || "-";
  return celda;
}

function crearCeldaEstadoCurso(estado) {
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

async function cargarCursos() {
  if (!usuarioSoporte) {
    mostrarMensajeListadoCursos("Esperando validación de sesión...", "error");
    return;
  }

  if (!cuerpoTablaCursos) return;

  mostrarMensajeListadoCursos("Cargando cursos...");
  cuerpoTablaCursos.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "cursos"));

    const cursos = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const anioA = Number(a.anio || 0);
        const anioB = Number(b.anio || 0);

        if (anioA !== anioB) {
          return anioA - anioB;
        }

        return String(a.division || "").localeCompare(
          String(b.division || ""),
          "es",
        );
      });

    if (!cursos.length) {
      mostrarMensajeListadoCursos("Todavía no hay cursos registrados.");
      return;
    }

    cursos.forEach((curso) => {
      const fila = document.createElement("tr");

      fila.appendChild(crearCeldaCurso(curso.nombre));
      fila.appendChild(crearCeldaCurso(curso.anio));
      fila.appendChild(crearCeldaCurso(curso.division));
      fila.appendChild(crearCeldaEstadoCurso(curso.estado));

      cuerpoTablaCursos.appendChild(fila);
    });

    mostrarMensajeListadoCursos(`${cursos.length} curso(s) cargado(s).`, "ok");
  } catch (error) {
    console.error("Error al cargar cursos:", error);

    mostrarMensajeListadoCursos(
      "No se pudieron cargar los cursos. Revisá permisos o conexión.",
      "error",
    );
  }
}

async function registrarCurso(event) {
  event.preventDefault();

  if (!usuarioSoporte) {
    mostrarMensajeCurso("Esperando validación de sesión.", "error");
    return;
  }

  const anio = Number(cursoAnio?.value || 0);
  const division = String(cursoDivision?.value || "")
    .trim()
    .toUpperCase();
  const nombre = `${anio}º ${division}`;
  const estado = String(cursoEstado?.value || "ACTIVO")
    .trim()
    .toUpperCase();

  if (!anio || !division) {
    mostrarMensajeCurso("Completá año y división antes de registrar.", "error");
    return;
  }

  if (anio < 1 || anio > 7) {
    mostrarMensajeCurso("El año debe estar entre 1 y 7.", "error");
    return;
  }

  btnRegistrarCurso.disabled = true;
  mostrarMensajeCurso("Verificando curso...");

  try {
    const consulta = await getDocs(collection(db, "cursos"));

    const existe = consulta.docs.some((documento) => {
      const datos = documento.data();

      return (
        Number(datos.anio) === anio &&
        String(datos.division || "")
          .trim()
          .toUpperCase() === division
      );
    });

    if (existe) {
      mostrarMensajeCurso(`El curso ${nombre} ya está registrado.`, "error");
      return;
    }

    await addDoc(collection(db, "cursos"), {
      anio,
      division,
      nombre,
      estado,
      fechaAlta: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: normalizarCorreo(usuarioSoporte.email),
    });

    formRegistroCurso.reset();
    actualizarNombreCurso();

    mostrarMensajeCurso(`Curso ${nombre} registrado correctamente.`, "ok");

    await cargarCursos();
  } catch (error) {
    console.error("Error al registrar curso:", error);

    mostrarMensajeCurso(
      "No se pudo registrar el curso. Revisá permisos o conexión.",
      "error",
    );
  } finally {
    btnRegistrarCurso.disabled = false;
  }
}

const PLAN_ESTUDIOS_INICIAL = [
  // PRIMER AÑO
  { anio: 1, nombre: "Biología", tipo: "AULA" },
  { anio: 1, nombre: "Educación Artística: Música", tipo: "AULA" },
  { anio: 1, nombre: "Educación Física", tipo: "EDUCACION_FISICA" },
  { anio: 1, nombre: "Educación Tecnológica", tipo: "AULA" },
  { anio: 1, nombre: "Formación Ética y Ciudadana", tipo: "AULA" },
  { anio: 1, nombre: "Geografía", tipo: "AULA" },
  { anio: 1, nombre: "Lengua Extranjera: Inglés", tipo: "AULA" },
  { anio: 1, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 1, nombre: "Matemática", tipo: "AULA" },
  { anio: 1, nombre: "Ruedas de Convivencia", tipo: "AULA" },
  { anio: 1, nombre: "Taller Electricidad", tipo: "TALLER" },
  { anio: 1, nombre: "Taller Informática", tipo: "TALLER" },
  {
    anio: 1,
    nombre: "Taller Organización de la Empresa",
    tipo: "TALLER",
  },

  // SEGUNDO AÑO
  {
    anio: 2,
    nombre: "Educación Artística: Artes Visuales",
    tipo: "AULA",
  },
  { anio: 2, nombre: "Educación Física", tipo: "EDUCACION_FISICA" },
  { anio: 2, nombre: "Educación Tecnológica", tipo: "AULA" },
  { anio: 2, nombre: "Físico-Química", tipo: "AULA" },
  { anio: 2, nombre: "Formación Ética y Ciudadana", tipo: "AULA" },
  { anio: 2, nombre: "Historia", tipo: "AULA" },
  { anio: 2, nombre: "Lengua Extranjera: Inglés", tipo: "AULA" },
  { anio: 2, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 2, nombre: "Matemática", tipo: "AULA" },
  { anio: 2, nombre: "Ruedas de Convivencia", tipo: "AULA" },
  { anio: 2, nombre: "Taller Electrónica", tipo: "TALLER" },
  { anio: 2, nombre: "Taller Informática", tipo: "TALLER" },
  {
    anio: 2,
    nombre: "Taller Documentos Comerciales",
    tipo: "TALLER",
  },

  // TERCER AÑO
  { anio: 3, nombre: "Educación Física", tipo: "EDUCACION_FISICA" },
  { anio: 3, nombre: "Física", tipo: "AULA" },
  { anio: 3, nombre: "Formación Ética y Ciudadana", tipo: "AULA" },
  { anio: 3, nombre: "Hardware I", tipo: "AULA" },
  { anio: 3, nombre: "Historia", tipo: "AULA" },
  { anio: 3, nombre: "Lengua Extranjera: Inglés", tipo: "AULA" },
  { anio: 3, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 3, nombre: "Matemática", tipo: "AULA" },
  { anio: 3, nombre: "Materiales y Procesos", tipo: "AULA" },
  { anio: 3, nombre: "Software I", tipo: "AULA" },
  { anio: 3, nombre: "T.I.C.", tipo: "AULA" },
  { anio: 3, nombre: "Taller", tipo: "TALLER" },

  // CUARTO AÑO
  { anio: 4, nombre: "Automatización y Control", tipo: "AULA" },
  { anio: 4, nombre: "Economía", tipo: "AULA" },
  { anio: 4, nombre: "Formación Ética y Ciudadana", tipo: "AULA" },
  { anio: 4, nombre: "Fundamentos de Gestión", tipo: "AULA" },
  { anio: 4, nombre: "Geografía", tipo: "AULA" },
  { anio: 4, nombre: "Hardware II", tipo: "AULA" },
  { anio: 4, nombre: "Lengua Extranjera: Inglés", tipo: "AULA" },
  { anio: 4, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 4, nombre: "Matemática", tipo: "AULA" },
  { anio: 4, nombre: "Software II", tipo: "AULA" },
  { anio: 4, nombre: "Taller", tipo: "TALLER" },

  // QUINTO AÑO
  { anio: 5, nombre: "Formación Ética y Ciudadana", tipo: "AULA" },
  { anio: 5, nombre: "Hardware III", tipo: "AULA" },
  { anio: 5, nombre: "Lengua Extranjera: Inglés", tipo: "AULA" },
  { anio: 5, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 5, nombre: "Marco Jurídico", tipo: "AULA" },
  { anio: 5, nombre: "Matemática", tipo: "AULA" },
  { anio: 5, nombre: "Organización y Gestión", tipo: "AULA" },
  { anio: 5, nombre: "Procesos Productivos", tipo: "AULA" },
  { anio: 5, nombre: "Programación I", tipo: "AULA" },
  { anio: 5, nombre: "Software III", tipo: "AULA" },
  { anio: 5, nombre: "Taller", tipo: "TALLER" },

  // SEXTO AÑO
  { anio: 6, nombre: "Formación Ética Profesional", tipo: "AULA" },
  { anio: 6, nombre: "Hardware IV", tipo: "AULA" },
  { anio: 6, nombre: "Inglés Técnico", tipo: "AULA" },
  { anio: 6, nombre: "Lengua y Literatura", tipo: "AULA" },
  { anio: 6, nombre: "Matemática Aplicada", tipo: "AULA" },
  { anio: 6, nombre: "Organización y Gestión Comercial", tipo: "AULA" },
  { anio: 6, nombre: "Prácticas Profesionalizantes", tipo: "AULA" },
  { anio: 6, nombre: "Programación II", tipo: "AULA" },
  { anio: 6, nombre: "Proyecto Tecnológico", tipo: "AULA" },
  { anio: 6, nombre: "Redes", tipo: "AULA" },
  { anio: 6, nombre: "Software IV", tipo: "AULA" },
];

function mostrarMensajeImportacionPlan(texto, tipo = "") {
  if (!mensajeImportacionPlan) return;

  mensajeImportacionPlan.textContent = texto;
  mensajeImportacionPlan.className = `mensaje-formulario ${tipo}`.trim();
}

function mostrarMensajeEspaciosCurriculares(texto, tipo = "") {
  if (!mensajeEspaciosCurriculares) return;

  mensajeEspaciosCurriculares.textContent = texto;
  mensajeEspaciosCurriculares.className = `mensaje-formulario ${tipo}`.trim();
}

function crearIdEspacioCurricular(anio, nombre) {
  const textoLimpio = String(nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${anio}-${textoLimpio}`;
}

function textoTipoEspacio(tipo) {
  const tipos = {
    AULA: "Aula",
    TALLER: "Taller",
    EDUCACION_FISICA: "Educación Física",
  };

  return tipos[tipo] || tipo || "-";
}

async function importarPlanEstudios() {
  if (!usuarioSoporte) {
    mostrarMensajeImportacionPlan("Esperando validación de sesión.", "error");
    return;
  }

  const resultado = await Swal.fire({
    icon: "question",
    title: "¿Importar Plan de Estudios?",
    text: "Se cargarán los espacios curriculares de 1º a 6º año.",
    showCancelButton: true,
    confirmButtonText: "Sí, importar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!resultado.isConfirmed) return;

  btnImportarPlanEstudios.disabled = true;
  mostrarMensajeImportacionPlan("Importando Plan de Estudios...");

  try {
    const lote = writeBatch(db);
    const correoSoporte = normalizarCorreo(usuarioSoporte.email);

    PLAN_ESTUDIOS_INICIAL.forEach((espacio) => {
      const espacioId = crearIdEspacioCurricular(espacio.anio, espacio.nombre);

      const referencia = doc(db, "espacios_curriculares", espacioId);

      lote.set(
        referencia,
        {
          anio: espacio.anio,
          nombre: espacio.nombre,
          tipo: espacio.tipo,
          estado: "ACTIVO",
          actualizadoEn: serverTimestamp(),
          actualizadoPor: correoSoporte,
        },
        { merge: true },
      );
    });

    await lote.commit();

    mostrarMensajeImportacionPlan(
      `Plan importado correctamente: ${PLAN_ESTUDIOS_INICIAL.length} espacios curriculares.`,
      "ok",
    );

    await Swal.fire({
      icon: "success",
      title: "Plan importado",
      text: `Se registraron ${PLAN_ESTUDIOS_INICIAL.length} espacios curriculares.`,
      confirmButtonText: "Entendido",
    });

    await cargarEspaciosCurriculares();
  } catch (error) {
    console.error("Error al importar el Plan de Estudios:", error);

    mostrarMensajeImportacionPlan(
      "No se pudo importar el Plan de Estudios.",
      "error",
    );
  } finally {
    btnImportarPlanEstudios.disabled = false;
  }
}

async function cargarEspaciosCurriculares() {
  if (!usuarioSoporte) {
    mostrarMensajeEspaciosCurriculares(
      "Esperando validación de sesión...",
      "error",
    );
    return;
  }

  if (!cuerpoTablaEspaciosCurriculares) return;

  mostrarMensajeEspaciosCurriculares("Cargando espacios...");
  cuerpoTablaEspaciosCurriculares.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "espacios_curriculares"));

    const espacios = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const diferenciaAnio = Number(a.anio) - Number(b.anio);

        if (diferenciaAnio !== 0) {
          return diferenciaAnio;
        }

        return String(a.nombre || "").localeCompare(
          String(b.nombre || ""),
          "es",
        );
      });

    if (!espacios.length) {
      mostrarMensajeEspaciosCurriculares(
        "Todavía no hay espacios curriculares registrados.",
      );
      return;
    }

    espacios.forEach((espacio) => {
      const fila = document.createElement("tr");

      fila.appendChild(crearCelda(espacio.anio));
      fila.appendChild(crearCelda(espacio.nombre));
      fila.appendChild(crearCelda(textoTipoEspacio(espacio.tipo)));
      fila.appendChild(crearCeldaEstado(espacio.estado));

      cuerpoTablaEspaciosCurriculares.appendChild(fila);
    });

    mostrarMensajeEspaciosCurriculares(
      `${espacios.length} espacio(s) cargado(s).`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar espacios curriculares:", error);

    mostrarMensajeEspaciosCurriculares(
      "No se pudieron cargar los espacios curriculares.",
      "error",
    );
  }
}
function mostrarMensajeRegistroAsignacion(texto, tipo = "") {
  if (!mensajeRegistroAsignacion) return;

  mensajeRegistroAsignacion.textContent = texto;
  mensajeRegistroAsignacion.className = `mensaje-formulario ${tipo}`.trim();
}

function limpiarSelect(select, textoInicial) {
  if (!select) return;

  select.innerHTML = "";

  const opcionInicial = document.createElement("option");
  opcionInicial.value = "";
  opcionInicial.textContent = textoInicial;

  select.appendChild(opcionInicial);
}

function agregarOpcion(select, valor, texto) {
  const opcion = document.createElement("option");

  opcion.value = valor;
  opcion.textContent = texto;

  select.appendChild(opcion);
}

async function cargarDocentesAsignacion() {
  if (!asignacionDocente || !usuarioSoporte) return;

  limpiarSelect(asignacionDocente, "Seleccionar docente");

  try {
    const consulta = await getDocs(collection(db, "usuarios"));

    const docentes = consulta.docs
      .map((documento) => documento.data())
      .filter((usuario) => {
        const rol = String(usuario.rol || "")
          .trim()
          .toUpperCase();
        const estado = String(usuario.estado || "")
          .trim()
          .toUpperCase();

        return rol === "DOCENTE" && estado === "ACTIVO";
      })
      .sort((a, b) =>
        String(a.nombreCompleto || "").localeCompare(
          String(b.nombreCompleto || ""),
          "es",
        ),
      );

    if (!docentes.length) {
      limpiarSelect(asignacionDocente, "No hay docentes activos registrados");
      return;
    }

    docentes.forEach((docente) => {
      agregarOpcion(
        asignacionDocente,
        normalizarCorreo(docente.correo),
        `${docente.nombreCompleto} — ${docente.correo}`,
      );
    });
  } catch (error) {
    console.error("Error al cargar docentes:", error);

    limpiarSelect(asignacionDocente, "No se pudieron cargar docentes");
  }
}

async function cargarCursosAsignacion() {
  if (!asignacionCurso || !usuarioSoporte) return;

  limpiarSelect(asignacionCurso, "Seleccionar curso");

  try {
    const consulta = await getDocs(collection(db, "cursos"));

    const cursos = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter(
        (curso) =>
          String(curso.estado || "")
            .trim()
            .toUpperCase() === "ACTIVO",
      )
      .sort((a, b) => {
        const diferenciaAnio = Number(a.anio || 0) - Number(b.anio || 0);

        if (diferenciaAnio !== 0) {
          return diferenciaAnio;
        }

        return String(a.division || "").localeCompare(
          String(b.division || ""),
          "es",
        );
      });

    if (!cursos.length) {
      limpiarSelect(asignacionCurso, "No hay cursos activos registrados");
      return;
    }

    cursos.forEach((curso) => {
      agregarOpcion(
        asignacionCurso,
        curso.id,
        curso.nombre || `${curso.anio}º ${curso.division}`,
      );
    });
  } catch (error) {
    console.error("Error al cargar cursos para asignación:", error);

    limpiarSelect(asignacionCurso, "No se pudieron cargar cursos");
  }
}

async function cargarEspaciosAsignacion() {
  if (!asignacionEspacio) return;

  limpiarSelect(asignacionEspacio, "Seleccioná primero un curso");

  const cursoId = String(asignacionCurso?.value || "").trim();

  if (!cursoId) {
    return;
  }

  try {
    const cursoDocumento = await getDoc(doc(db, "cursos", cursoId));

    if (!cursoDocumento.exists()) {
      limpiarSelect(asignacionEspacio, "Curso no encontrado");
      return;
    }

    const curso = cursoDocumento.data();
    const anioCurso = Number(curso.anio || 0);

    if (!anioCurso) {
      limpiarSelect(asignacionEspacio, "Curso sin año válido");
      return;
    }

    const consulta = await getDocs(collection(db, "espacios_curriculares"));

    const espacios = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((espacio) => {
        const estado = String(espacio.estado || "")
          .trim()
          .toUpperCase();

        return Number(espacio.anio) === anioCurso && estado === "ACTIVO";
      })
      .sort((a, b) =>
        String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"),
      );

    if (!espacios.length) {
      limpiarSelect(asignacionEspacio, "No hay espacios activos para este año");
      return;
    }

    limpiarSelect(asignacionEspacio, "Seleccionar espacio curricular");

    espacios.forEach((espacio) => {
      agregarOpcion(
        asignacionEspacio,
        espacio.id,
        `${espacio.nombre} (${textoTipoEspacio(espacio.tipo)})`,
      );
    });
  } catch (error) {
    console.error("Error al cargar espacios para asignación:", error);

    limpiarSelect(asignacionEspacio, "No se pudieron cargar los espacios");
  }
}

async function prepararFormularioAsignaciones() {
  await Promise.all([cargarDocentesAsignacion(), cargarCursosAsignacion()]);

  limpiarSelect(asignacionEspacio, "Seleccioná primero un curso");
}
async function cargarUsuarios() {
  if (!usuarioSoporte) {
    mostrarMensajeUsuarios("Esperando validación de sesión...", "error");
    return;
  }

  mostrarMensajeUsuarios("Cargando usuarios...");
  cuerpoTabla.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "usuarios"));

    usuariosCargados = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) =>
        String(a.nombreCompleto || "").localeCompare(
          String(b.nombreCompleto || ""),
          "es",
        ),
      );

    if (!usuariosCargados.length) {
      mostrarMensajeUsuarios("Todavía no hay usuarios registrados.");
      return;
    }

    aplicarFiltrosUsuarios();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);

    mostrarMensajeUsuarios(
      "No se pudieron cargar los usuarios. Revisá permisos o conexión.",
      "error",
    );
  }
}

async function registrarUsuario(event) {
  event.preventDefault();

  if (!usuarioSoporte) {
    mostrarMensajeRegistro("Esperando validación de sesión.", "error");
    return;
  }

  const datos = new FormData(formulario);

  const nombreCompleto = String(datos.get("nombreCompleto") || "").trim();
  const correo = normalizarCorreo(datos.get("correo"));
  const rol = String(datos.get("rol") || "")
    .trim()
    .toUpperCase();
  const tipoVinculo = String(datos.get("tipoVinculo") || "").trim();
  const fechaFinAcceso = String(datos.get("fechaFinAcceso") || "").trim();

  if (!nombreCompleto || !correo || !rol) {
    mostrarMensajeRegistro(
      "Completá nombre, correo y rol antes de registrar.",
      "error",
    );
    return;
  }

  if (!["ALUMNO", "DOCENTE", "SOPORTE"].includes(rol)) {
    mostrarMensajeRegistro("El rol seleccionado no es válido.", "error");
    return;
  }

  btnRegistrar.disabled = true;
  mostrarMensajeRegistro("Verificando usuario...");

  try {
    const referencia = doc(db, "usuarios", correo);
    const existente = await getDoc(referencia);

    if (existente.exists()) {
      mostrarMensajeRegistro(
        "Ya existe un usuario registrado con ese correo. No se modificó nada.",
        "error",
      );
      return;
    }

    await setDoc(referencia, {
      correo,
      nombreCompleto,
      rol,
      estado: "ACTIVO",
      tipoVinculo: tipoVinculo || rol,
      fechaFinAcceso: fechaFinAcceso || null,
      fechaAlta: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: normalizarCorreo(usuarioSoporte.email),
    });

    formulario.reset();

    mostrarMensajeRegistro(
      "Usuario registrado correctamente. Ya puede iniciar sesión con Google.",
      "ok",
    );

    await cargarUsuarios();
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    mostrarMensajeRegistro(
      "No se pudo registrar el usuario. Revisá permisos o conexión.",
      "error",
    );
  } finally {
    btnRegistrar.disabled = false;
  }
}

async function cambiarEstadoUsuario(usuario) {
  const correo = normalizarCorreo(usuario.correo);
  const correoActual = normalizarCorreo(usuarioSoporte?.email);

  if (!correo || correo === correoActual) {
    mostrarMensajeUsuarios(
      "No podés modificar el estado de tu propia cuenta desde aquí.",
      "error",
    );
    return;
  }

  const estadoActual = String(usuario.estado || "")
    .trim()
    .toUpperCase();

  const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

  const accion = nuevoEstado === "ACTIVO" ? "activar" : "desactivar";

  const resultado = await Swal.fire({
    icon: nuevoEstado === "ACTIVO" ? "question" : "warning",
    title:
      nuevoEstado === "ACTIVO" ? "¿Activar cuenta?" : "¿Desactivar cuenta?",
    html: `
    <p>Vas a ${accion} la cuenta de:</p>
    <strong>${usuario.nombreCompleto || correo}</strong>
    <p style="margin-top: 8px;">${correo}</p>
  `,
    showCancelButton: true,
    confirmButtonText:
      nuevoEstado === "ACTIVO" ? "Sí, activar" : "Sí, desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!resultado.isConfirmed) return;

  try {
    await updateDoc(doc(db, "usuarios", correo), {
      estado: nuevoEstado,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: correoActual,
    });

    mostrarMensajeUsuarios(
      `Cuenta ${accion === "activar" ? "activada" : "desactivada"} correctamente.`,
      "ok",
    );

    await cargarUsuarios();
  } catch (error) {
    console.error("Error al cambiar estado:", error);

    mostrarMensajeUsuarios(
      "No se pudo actualizar el estado del usuario.",
      "error",
    );
  }
}

function mostrarMensajeEdicion(texto, tipo = "") {
  if (!mensajeEditarUsuario) return;

  mensajeEditarUsuario.textContent = texto;
  mensajeEditarUsuario.className = `mensaje-formulario ${tipo}`.trim();
}

function abrirModalEdicion(usuario) {
  const correo = normalizarCorreo(usuario.correo);
  const correoActual = normalizarCorreo(usuarioSoporte?.email);
  const esMiCuenta = correo === correoActual;

  usuarioEnEdicion = usuario;

  editarCorreo.value = correo;
  editarCorreoVisible.value = correo;
  editarNombreCompleto.value = usuario.nombreCompleto || "";
  editarRol.value = String(usuario.rol || "").toUpperCase();
  editarTipoVinculo.value = usuario.tipoVinculo || "";
  editarFechaFinAcceso.value = usuario.fechaFinAcceso || "";

  editarRol.disabled = esMiCuenta;

  mostrarMensajeEdicion(
    esMiCuenta ? "Por seguridad, no podés cambiar tu propio rol." : "",
  );

  modalEditar.classList.add("abierta");
  modalEditar.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-abierto");

  setTimeout(() => editarNombreCompleto.focus(), 100);
}

function cerrarModalEdicion() {
  modalEditar.classList.remove("abierta");
  modalEditar.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-abierto");

  usuarioEnEdicion = null;
  formEditar.reset();
  mostrarMensajeEdicion("");
}

function editarUsuario(usuario) {
  abrirModalEdicion(usuario);
}

async function guardarEdicionUsuario(event) {
  event.preventDefault();

  if (!usuarioEnEdicion || !usuarioSoporte) {
    return;
  }

  const correo = normalizarCorreo(editarCorreo.value);
  const correoActual = normalizarCorreo(usuarioSoporte.email);
  const esMiCuenta = correo === correoActual;

  const nombreCompleto = editarNombreCompleto.value.trim();
  const rol = String(editarRol.value || "")
    .trim()
    .toUpperCase();
  const tipoVinculo = editarTipoVinculo.value.trim();
  const fechaFinAcceso = editarFechaFinAcceso.value.trim();

  if (!nombreCompleto || !rol) {
    mostrarMensajeEdicion("Completá nombre y rol antes de guardar.", "error");
    return;
  }

  if (!["ALUMNO", "DOCENTE", "SOPORTE"].includes(rol)) {
    mostrarMensajeEdicion("El rol seleccionado no es válido.", "error");
    return;
  }

  if (esMiCuenta && rol !== "SOPORTE") {
    mostrarMensajeEdicion(
      "No podés cambiar tu propio rol desde este panel.",
      "error",
    );
    return;
  }

  btnGuardarEdicion.disabled = true;
  mostrarMensajeEdicion("Guardando cambios...");

  try {
    await updateDoc(doc(db, "usuarios", correo), {
      nombreCompleto,
      rol,
      tipoVinculo: tipoVinculo || rol,
      fechaFinAcceso: fechaFinAcceso || null,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: correoActual,
    });

    cerrarModalEdicion();

    mostrarMensajeUsuarios("Usuario actualizado correctamente.", "ok");

    await cargarUsuarios();
  } catch (error) {
    console.error("Error al editar usuario:", error);

    mostrarMensajeEdicion("No se pudieron guardar los cambios.", "error");
  } finally {
    btnGuardarEdicion.disabled = false;
  }
}

if (formulario) {
  formulario.addEventListener("submit", registrarUsuario);
}
if (btnImportarPlanEstudios) {
  btnImportarPlanEstudios.addEventListener("click", importarPlanEstudios);
}

if (btnVerEspaciosCurriculares) {
  btnVerEspaciosCurriculares.addEventListener(
    "click",
    cargarEspaciosCurriculares,
  );
}
if (asignacionCurso) {
  asignacionCurso.addEventListener("change", cargarEspaciosAsignacion);
}

if (btnRegistrarAsignacion) {
  prepararFormularioAsignaciones();
}
if (cursoAnio) {
  cursoAnio.addEventListener("input", actualizarNombreCurso);
}

if (cursoDivision) {
  cursoDivision.addEventListener("input", actualizarNombreCurso);
  cursoDivision.addEventListener("blur", actualizarNombreCurso);
}

if (formRegistroCurso) {
  formRegistroCurso.addEventListener("submit", registrarCurso);
}

if (btnVerCursos) {
  btnVerCursos.addEventListener("click", cargarCursos);
}
if (buscarUsuario) {
  buscarUsuario.addEventListener("input", aplicarFiltrosUsuarios);
}

if (filtroRol) {
  filtroRol.addEventListener("change", aplicarFiltrosUsuarios);
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", aplicarFiltrosUsuarios);
}
if (btnVerUsuarios) {
  btnVerUsuarios.addEventListener("click", cargarUsuarios);
}

if (formEditar) {
  formEditar.addEventListener("submit", guardarEdicionUsuario);
}

if (btnCerrarEdicion) {
  btnCerrarEdicion.addEventListener("click", cerrarModalEdicion);
}

if (btnCancelarEdicion) {
  btnCancelarEdicion.addEventListener("click", cerrarModalEdicion);
}

if (modalEditar) {
  modalEditar.addEventListener("click", (event) => {
    if (event.target === modalEditar) {
      cerrarModalEdicion();
    }
  });
}

if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", async () => {
    const resultado = await Swal.fire({
      icon: "question",
      title: "¿Cerrar sesión?",
      text: "Vas a salir del Portal Institucional.",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await signOut(auth);

      window.location.replace("../login.html");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo cerrar sesión",
        text: "Intentá nuevamente.",
        confirmButtonText: "Entendido",
      });
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  usuarioSoporte = user;
});
