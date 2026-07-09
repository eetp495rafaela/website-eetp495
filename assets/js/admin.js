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
const btnVerEstudiantes = document.getElementById("btnVerEstudiantes");

const btnImportarCursosAlumnos = document.getElementById(
  "btnImportarCursosAlumnos",
);

const archivoImportacionCursosAlumnos = document.getElementById(
  "archivoImportacionCursosAlumnos",
);

const buscarEstudiante = document.getElementById("buscarEstudiante");

const filtroCursoEstudiante = document.getElementById("filtroCursoEstudiante");

const filtroEstadoEstudiante = document.getElementById(
  "filtroEstadoEstudiante",
);

const cuerpoTablaEstudiantes = document.getElementById(
  "cuerpoTablaEstudiantes",
);

const mensajeEstudiantes = document.getElementById("mensajeEstudiantes");
const modalAsignarCursoEstudiante = document.getElementById(
  "modalAsignarCursoEstudiante",
);

const formAsignarCursoEstudiante = document.getElementById(
  "formAsignarCursoEstudiante",
);

const asignarCursoEstudianteCorreo = document.getElementById(
  "asignarCursoEstudianteCorreo",
);

const asignarCursoEstudianteAnio = document.getElementById(
  "asignarCursoEstudianteAnio",
);

const asignarCursoEstudianteDivision = document.getElementById(
  "asignarCursoEstudianteDivision",
);

const asignarCursoEstudianteGrupo = document.getElementById(
  "asignarCursoEstudianteGrupo",
);

const subtituloAsignarCursoEstudiante = document.getElementById(
  "subtituloAsignarCursoEstudiante",
);

const mensajeAsignarCursoEstudiante = document.getElementById(
  "mensajeAsignarCursoEstudiante",
);

const btnCerrarAsignacionCursoEstudiante = document.getElementById(
  "btnCerrarAsignacionCursoEstudiante",
);

const btnCancelarAsignacionCursoEstudiante = document.getElementById(
  "btnCancelarAsignacionCursoEstudiante",
);
const btnImportarUsuarios = document.getElementById("btnImportarUsuarios");

const archivoImportacionUsuarios = document.getElementById(
  "archivoImportacionUsuarios",
);
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
const modalEditarCurso = document.getElementById("modalEditarCurso");

const formEditarCurso = document.getElementById("formEditarCurso");

const editarCursoId = document.getElementById("editarCursoId");

const editarCursoAnio = document.getElementById("editarCursoAnio");

const editarCursoDivision = document.getElementById("editarCursoDivision");

const editarCursoNombre = document.getElementById("editarCursoNombre");

const editarCursoEstado = document.getElementById("editarCursoEstado");

const mensajeEditarCurso = document.getElementById("mensajeEditarCurso");

const btnCerrarEdicionCurso = document.getElementById("btnCerrarEdicionCurso");

const btnCancelarEdicionCurso = document.getElementById(
  "btnCancelarEdicionCurso",
);

const btnGuardarEdicionCurso = document.getElementById(
  "btnGuardarEdicionCurso",
);
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
const modalEditarAsignacion = document.getElementById("modalEditarAsignacion");

const formEditarAsignacion = document.getElementById("formEditarAsignacion");

const editarAsignacionIdOriginal = document.getElementById(
  "editarAsignacionIdOriginal",
);

const editarAsignacionDocente = document.getElementById(
  "editarAsignacionDocente",
);

const editarAsignacionCurso = document.getElementById("editarAsignacionCurso");

const editarAsignacionEspacio = document.getElementById(
  "editarAsignacionEspacio",
);

const editarAsignacionCicloLectivo = document.getElementById(
  "editarAsignacionCicloLectivo",
);

const editarAsignacionEstado = document.getElementById(
  "editarAsignacionEstado",
);

const mensajeEditarAsignacion = document.getElementById(
  "mensajeEditarAsignacion",
);

const btnCerrarEdicionAsignacion = document.getElementById(
  "btnCerrarEdicionAsignacion",
);

const btnCancelarEdicionAsignacion = document.getElementById(
  "btnCancelarEdicionAsignacion",
);

const btnGuardarEdicionAsignacion = document.getElementById(
  "btnGuardarEdicionAsignacion",
);
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const modalEditar = document.getElementById("modalEditarUsuario");
const formEditar = document.getElementById("formEditarUsuario");
const editarCorreo = document.getElementById("editarCorreo");
const editarCorreoVisible = document.getElementById("editarCorreoVisible");
const editarNombreCompleto = document.getElementById("editarNombreCompleto");
const editarDni = document.getElementById("editarDni");
const editarRol = document.getElementById("editarRol");
const editarTipoVinculo = document.getElementById("editarTipoVinculo");
const editarFechaFinAcceso = document.getElementById("editarFechaFinAcceso");
const mensajeEditarUsuario = document.getElementById("mensajeEditarUsuario");
const btnCerrarEdicion = document.getElementById("btnCerrarEdicion");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");

let usuarioSoporte = null;
let usuariosCargados = [];
let estudiantesCargados = [];
let estudianteEnAsignacion = null;
let cursoEnEdicion = null;
let asignacionEnEdicion = null;
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

function mostrarMensajeEstudiantes(texto, tipo = "") {
  if (!mensajeEstudiantes) return;

  mensajeEstudiantes.textContent = texto;
  mensajeEstudiantes.className = `mensaje-formulario ${tipo}`.trim();
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

  etiqueta.className = ["ACTIVO", "ACTIVA"].includes(valor)
    ? "estado estado-activo"
    : "estado estado-inactivo";

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

function renderizarEstudiantes(estudiantes) {
  cuerpoTablaEstudiantes.innerHTML = "";

  if (!estudiantes.length) {
    mostrarMensajeEstudiantes(
      "No se encontraron estudiantes con esos filtros.",
    );
    return;
  }

  estudiantes.forEach((estudiante) => {
    const fila = document.createElement("tr");

    const cursoActual = estudiante.cursoNombre || "Sin curso asignado";

    const grupoTaller = estudiante.grupoTaller || "Sin grupo";

    fila.appendChild(crearCelda(estudiante.nombreCompleto));

    fila.appendChild(crearCelda(estudiante.correo));

    fila.appendChild(crearCelda(cursoActual));

    fila.appendChild(crearCelda(grupoTaller));

    fila.appendChild(crearCeldaEstado(estudiante.estado));

    const celdaAcciones = document.createElement("td");
    celdaAcciones.className = "celda-acciones";

    const contenedorAcciones = document.createElement("div");
    contenedorAcciones.className = "acciones-tabla";

    const btnAsignarCurso = document.createElement("button");
    btnAsignarCurso.type = "button";
    btnAsignarCurso.className = "btn-tabla btn-editar";

    btnAsignarCurso.innerHTML = estudiante.cursoNombre
      ? '<i class="fa-solid fa-pen-to-square"></i> Editar'
      : '<i class="fa-solid fa-school"></i> Asignar curso';

    btnAsignarCurso.addEventListener("click", () => {
      abrirModalAsignarCursoEstudiante(estudiante);
    });

    contenedorAcciones.appendChild(btnAsignarCurso);
    celdaAcciones.appendChild(contenedorAcciones);

    fila.appendChild(celdaAcciones);

    cuerpoTablaEstudiantes.appendChild(fila);
  });

  mostrarMensajeEstudiantes(
    `${estudiantes.length} estudiante(s) mostrado(s).`,
    "ok",
  );
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

function aplicarFiltrosEstudiantes() {
  const textoBusqueda = String(buscarEstudiante?.value || "")
    .trim()
    .toLowerCase();

  const cursoSeleccionado = String(filtroCursoEstudiante?.value || "").trim();

  const estadoSeleccionado = String(filtroEstadoEstudiante?.value || "")
    .trim()
    .toUpperCase();

  const estudiantesFiltrados = estudiantesCargados.filter((estudiante) => {
    const nombre = String(estudiante.nombreCompleto || "").toLowerCase();

    const correo = String(estudiante.correo || "").toLowerCase();

    const cursoNombre = String(estudiante.cursoNombre || "").trim();

    const estado = String(estudiante.estado || "")
      .trim()
      .toUpperCase();

    const coincideBusqueda =
      !textoBusqueda ||
      nombre.includes(textoBusqueda) ||
      correo.includes(textoBusqueda);

    const coincideCurso =
      !cursoSeleccionado || cursoNombre === cursoSeleccionado;

    const coincideEstado = !estadoSeleccionado || estado === estadoSeleccionado;

    return coincideBusqueda && coincideCurso && coincideEstado;
  });

  renderizarEstudiantes(estudiantesFiltrados);
}

function mostrarMensajeCurso(texto, tipo = "") {
  if (!mensajeRegistroCurso) return;

  mensajeRegistroCurso.textContent = texto;
  mensajeRegistroCurso.className = `mensaje-formulario ${tipo}`.trim();
}

function abrirModalEditarCurso(curso) {
  cursoEnEdicion = curso;

  editarCursoId.value = curso.id;
  editarCursoAnio.value = curso.anio || "";
  editarCursoDivision.value = curso.division || "";
  editarCursoNombre.value = curso.nombre || `${curso.anio}º ${curso.division}`;

  editarCursoEstado.value = curso.estado || "ACTIVO";
  mensajeEditarCurso.textContent = "";

  modalEditarCurso.classList.add("mostrar");
  modalEditarCurso.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function cerrarModalEditarCurso() {
  cursoEnEdicion = null;

  formEditarCurso.reset();
  mensajeEditarCurso.textContent = "";

  modalEditarCurso.classList.remove("mostrar");
  modalEditarCurso.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function abrirModalAsignarCursoEstudiante(estudiante) {
  estudianteEnAsignacion = estudiante;

  asignarCursoEstudianteCorreo.value = estudiante.correo || "";

  subtituloAsignarCursoEstudiante.textContent = `${estudiante.nombreCompleto || "Estudiante"} — ${estudiante.correo || ""}`;

  asignarCursoEstudianteAnio.value = estudiante.cursoAnio || "";

  asignarCursoEstudianteDivision.value = estudiante.cursoDivision || "";

  asignarCursoEstudianteGrupo.value = estudiante.grupoTaller || "";

  mensajeAsignarCursoEstudiante.textContent = "";

  modalAsignarCursoEstudiante.classList.add("mostrar");
  modalAsignarCursoEstudiante.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function cerrarModalAsignarCursoEstudiante() {
  estudianteEnAsignacion = null;

  formAsignarCursoEstudiante.reset();
  mensajeAsignarCursoEstudiante.textContent = "";

  modalAsignarCursoEstudiante.classList.remove("mostrar");
  modalAsignarCursoEstudiante.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

btnCerrarAsignacionCursoEstudiante.addEventListener(
  "click",
  cerrarModalAsignarCursoEstudiante,
);

btnCancelarAsignacionCursoEstudiante.addEventListener(
  "click",
  cerrarModalAsignarCursoEstudiante,
);

modalAsignarCursoEstudiante.addEventListener("click", (event) => {
  if (event.target === modalAsignarCursoEstudiante) {
    cerrarModalAsignarCursoEstudiante();
  }
});

formAsignarCursoEstudiante.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!estudianteEnAsignacion) {
    return;
  }

  const anio = Number(asignarCursoEstudianteAnio.value);
  const division = String(asignarCursoEstudianteDivision.value || "")
    .trim()
    .toUpperCase();

  const grupoTaller = String(asignarCursoEstudianteGrupo.value || "")
    .trim()
    .toUpperCase();

  if (!anio || !division) {
    mensajeAsignarCursoEstudiante.textContent = "Completá año y división.";
    mensajeAsignarCursoEstudiante.className = "mensaje-formulario error";
    return;
  }

  if (grupoTaller && !["G1", "G2"].includes(grupoTaller)) {
    mensajeAsignarCursoEstudiante.textContent =
      "El grupo de Taller debe ser G1 o G2.";
    mensajeAsignarCursoEstudiante.className = "mensaje-formulario error";
    return;
  }

  try {
    mensajeAsignarCursoEstudiante.textContent = "Verificando curso...";
    mensajeAsignarCursoEstudiante.className = "mensaje-formulario";

    const consultaCursos = await getDocs(collection(db, "cursos"));

    const curso = consultaCursos.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .find(
        (item) =>
          Number(item.anio) === anio &&
          String(item.division || "")
            .trim()
            .toUpperCase() === division &&
          String(item.estado || "ACTIVO")
            .trim()
            .toUpperCase() === "ACTIVO",
      );

    if (!curso) {
      mensajeAsignarCursoEstudiante.textContent = `No existe un curso activo para ${anio}º ${division}.`;
      mensajeAsignarCursoEstudiante.className = "mensaje-formulario error";
      return;
    }

    await updateDoc(doc(db, "usuarios", estudianteEnAsignacion.correo), {
      cursoId: curso.id,
      cursoAnio: anio,
      cursoDivision: division,
      cursoNombre: curso.nombre || `${anio}º ${division}`,
      grupoTaller: grupoTaller || null,
      actualizadoEn: serverTimestamp(),
    });

    const nombreEstudiante = estudianteEnAsignacion.nombreCompleto;

    cerrarModalAsignarCursoEstudiante();

    await Swal.fire({
      title: "Curso asignado",
      html: `
    <p><strong>${nombreEstudiante}</strong></p>
    <p>${curso.nombre || `${anio}º ${division}`} · ${grupoTaller}</p>
  `,
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarEstudiantes();
  } catch (error) {
    console.error("Error al asignar curso al estudiante:", error);

    mensajeAsignarCursoEstudiante.textContent =
      "No se pudo guardar la asignación. Revisá conexión o permisos.";
    mensajeAsignarCursoEstudiante.className = "mensaje-formulario error";
  }
});

async function cambiarEstadoCurso(curso) {
  const estaActivo = curso.estado !== "INACTIVO";

  const nuevoEstado = estaActivo ? "INACTIVO" : "ACTIVO";

  const accion = estaActivo ? "desactivar" : "activar";

  const confirmacion = await Swal.fire({
    title: `¿${estaActivo ? "Desactivar" : "Activar"} curso?`,
    text: estaActivo
      ? `El curso ${curso.nombre} dejará de estar disponible para nuevas asignaciones.`
      : `El curso ${curso.nombre} volverá a estar disponible.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: `Sí, ${accion}`,
    cancelButtonText: "Cancelar",
    confirmButtonColor: estaActivo ? "#dc3545" : "#198754",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    await updateDoc(doc(db, "cursos", curso.id), {
      estado: nuevoEstado,
      actualizadoEn: serverTimestamp(),
    });

    await Swal.fire({
      title: "Cambio realizado",
      text: `El curso fue ${estaActivo ? "desactivado" : "activado"} correctamente.`,
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarCursos();
  } catch (error) {
    console.error("Error al cambiar el estado del curso:", error);

    await Swal.fire({
      title: "No se pudo realizar el cambio",
      text: "Revisá la conexión o los permisos de Firebase.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

btnCerrarEdicionCurso.addEventListener("click", cerrarModalEditarCurso);

btnCancelarEdicionCurso.addEventListener("click", cerrarModalEditarCurso);

modalEditarCurso.addEventListener("click", function (event) {
  if (event.target === modalEditarCurso) {
    cerrarModalEditarCurso();
  }
});

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

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "celda-acciones";

      const contenedorAcciones = document.createElement("div");
      contenedorAcciones.className = "acciones-tabla";

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.className = "btn-tabla btn-editar";
      btnEditar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar';

      btnEditar.addEventListener("click", () => {
        abrirModalEditarCurso(curso);
      });

      const estaActivo = curso.estado !== "INACTIVO";

      const btnEstado = document.createElement("button");
      btnEstado.type = "button";
      btnEstado.className = estaActivo
        ? "btn-tabla btn-desactivar"
        : "btn-tabla btn-activar";

      btnEstado.innerHTML = estaActivo
        ? '<i class="fa-solid fa-ban"></i> Desactivar'
        : '<i class="fa-solid fa-circle-check"></i> Activar';

      btnEstado.addEventListener("click", () => {
        cambiarEstadoCurso(curso);
      });

      contenedorAcciones.appendChild(btnEditar);
      contenedorAcciones.appendChild(btnEstado);
      celdaAcciones.appendChild(contenedorAcciones);

      fila.appendChild(celdaAcciones);

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
  { anio: 1, nombre: "Dibujo Técnico", tipo: "AULA" },
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
  { anio: 2, nombre: "Dibujo Técnico", tipo: "AULA" },
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

  if (!cursoId) return;

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

function crearIdAsignacion(docenteCorreo, cursoId, espacioId, cicloLectivo) {
  return [
    encodeURIComponent(docenteCorreo),
    cursoId,
    espacioId,
    cicloLectivo,
  ].join("__");
}

function mostrarMensajeAsignaciones(texto, tipo = "") {
  if (!mensajeAsignaciones) return;

  mensajeAsignaciones.textContent = texto;
  mensajeAsignaciones.className = `mensaje-formulario ${tipo}`.trim();
}

async function registrarAsignacion(event) {
  event.preventDefault();

  if (!usuarioSoporte) {
    mostrarMensajeRegistroAsignacion(
      "Esperando validación de sesión.",
      "error",
    );
    return;
  }

  const docenteCorreo = normalizarCorreo(asignacionDocente.value);
  const cursoId = String(asignacionCurso.value || "").trim();
  const espacioId = String(asignacionEspacio.value || "").trim();
  const cicloLectivo = Number(asignacionCicloLectivo.value || 0);
  const estado = String(asignacionEstado.value || "ACTIVA")
    .trim()
    .toUpperCase();

  if (!docenteCorreo || !cursoId || !espacioId || !cicloLectivo) {
    mostrarMensajeRegistroAsignacion(
      "Completá docente, curso, espacio curricular y ciclo lectivo.",
      "error",
    );
    return;
  }

  if (cicloLectivo < 2020 || cicloLectivo > 2100) {
    mostrarMensajeRegistroAsignacion(
      "Ingresá un ciclo lectivo válido.",
      "error",
    );
    return;
  }

  btnRegistrarAsignacion.disabled = true;
  mostrarMensajeRegistroAsignacion("Verificando asignación...");

  try {
    const [docenteDocumento, cursoDocumento, espacioDocumento] =
      await Promise.all([
        getDoc(doc(db, "usuarios", docenteCorreo)),
        getDoc(doc(db, "cursos", cursoId)),
        getDoc(doc(db, "espacios_curriculares", espacioId)),
      ]);

    if (!docenteDocumento.exists()) {
      throw new Error("El docente seleccionado no existe.");
    }

    if (!cursoDocumento.exists()) {
      throw new Error("El curso seleccionado no existe.");
    }

    if (!espacioDocumento.exists()) {
      throw new Error("El espacio curricular seleccionado no existe.");
    }

    const docente = docenteDocumento.data();
    const curso = cursoDocumento.data();
    const espacio = espacioDocumento.data();

    const rolDocente = String(docente.rol || "")
      .trim()
      .toUpperCase();

    const estadoDocente = String(docente.estado || "")
      .trim()
      .toUpperCase();

    if (rolDocente !== "DOCENTE" || estadoDocente !== "ACTIVO") {
      throw new Error("El usuario seleccionado no es un docente activo.");
    }

    const estadoCurso = String(curso.estado || "")
      .trim()
      .toUpperCase();

    if (estadoCurso !== "ACTIVO") {
      throw new Error("El curso seleccionado no está activo.");
    }

    const estadoEspacio = String(espacio.estado || "")
      .trim()
      .toUpperCase();

    if (estadoEspacio !== "ACTIVO") {
      throw new Error("El espacio curricular seleccionado no está activo.");
    }

    if (Number(espacio.anio) !== Number(curso.anio)) {
      throw new Error("El espacio curricular no corresponde al año del curso.");
    }

    const asignacionId = crearIdAsignacion(
      docenteCorreo,
      cursoId,
      espacioId,
      cicloLectivo,
    );

    const referenciaAsignacion = doc(db, "asignaciones_docentes", asignacionId);

    const asignacionExistente = await getDoc(referenciaAsignacion);

    if (asignacionExistente.exists()) {
      mostrarMensajeRegistroAsignacion(
        "Esta asignación ya está registrada para ese ciclo lectivo.",
        "error",
      );
      return;
    }

    await setDoc(referenciaAsignacion, {
      docenteCorreo,
      docenteNombre: docente.nombreCompleto || docenteCorreo,

      cursoId,
      cursoNombre: curso.nombre || `${curso.anio}º ${curso.division}`,
      cursoAnio: Number(curso.anio),
      cursoDivision: curso.division || "",

      espacioId,
      espacioNombre: espacio.nombre || "",
      espacioTipo: espacio.tipo || "",

      cicloLectivo,
      estado,

      fechaAlta: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      creadoPor: normalizarCorreo(usuarioSoporte.email),
    });

    formRegistroAsignacion.reset();
    limpiarSelect(asignacionEspacio, "Seleccioná primero un curso");

    mostrarMensajeRegistroAsignacion(
      "Asignación docente registrada correctamente.",
      "ok",
    );

    await cargarAsignaciones();
  } catch (error) {
    console.error("Error al registrar asignación:", error);

    mostrarMensajeRegistroAsignacion(
      error.message || "No se pudo registrar la asignación.",
      "error",
    );
  } finally {
    btnRegistrarAsignacion.disabled = false;
  }
}
function mostrarMensajeEdicionAsignacion(texto, tipo = "") {
  if (!mensajeEditarAsignacion) return;

  mensajeEditarAsignacion.textContent = texto;
  mensajeEditarAsignacion.className = `mensaje-formulario ${tipo}`.trim();
}

function cerrarModalEditarAsignacion() {
  if (!modalEditarAsignacion) return;

  modalEditarAsignacion.classList.remove("abierta");
  modalEditarAsignacion.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-abierto");

  asignacionEnEdicion = null;

  if (formEditarAsignacion) {
    formEditarAsignacion.reset();
  }

  mostrarMensajeEdicionAsignacion("");
}

async function cargarDocentesEnSelect(select, correoSeleccionado = "") {
  limpiarSelect(select, "Seleccionar docente");

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

  docentes.forEach((docente) => {
    const correo = normalizarCorreo(docente.correo);

    agregarOpcion(select, correo, `${docente.nombreCompleto} — ${correo}`);
  });

  select.value = correoSeleccionado;
}

async function cargarCursosEnSelect(select, cursoSeleccionado = "") {
  limpiarSelect(select, "Seleccionar curso");

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

  cursos.forEach((curso) => {
    agregarOpcion(
      select,
      curso.id,
      curso.nombre || `${curso.anio}º ${curso.division}`,
    );
  });

  select.value = cursoSeleccionado;
}

async function cargarEspaciosEnSelect(
  select,
  cursoId,
  espacioSeleccionado = "",
) {
  limpiarSelect(select, "Seleccionar espacio curricular");

  if (!cursoId) {
    limpiarSelect(select, "Seleccioná primero un curso");
    return;
  }

  const cursoDocumento = await getDoc(doc(db, "cursos", cursoId));

  if (!cursoDocumento.exists()) {
    limpiarSelect(select, "Curso no encontrado");
    return;
  }

  const curso = cursoDocumento.data();
  const anioCurso = Number(curso.anio || 0);

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

  espacios.forEach((espacio) => {
    agregarOpcion(
      select,
      espacio.id,
      `${espacio.nombre} (${textoTipoEspacio(espacio.tipo)})`,
    );
  });

  select.value = espacioSeleccionado;
}

async function abrirModalEditarAsignacion(asignacion) {
  if (!modalEditarAsignacion) return;

  asignacionEnEdicion = asignacion;

  editarAsignacionIdOriginal.value = asignacion.id;
  editarAsignacionCicloLectivo.value = asignacion.cicloLectivo || "";
  editarAsignacionEstado.value = String(
    asignacion.estado || "ACTIVA",
  ).toUpperCase();

  mostrarMensajeEdicionAsignacion("Cargando datos...");

  modalEditarAsignacion.classList.add("abierta");
  modalEditarAsignacion.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-abierto");

  try {
    await Promise.all([
      cargarDocentesEnSelect(editarAsignacionDocente, asignacion.docenteCorreo),
      cargarCursosEnSelect(editarAsignacionCurso, asignacion.cursoId),
    ]);

    await cargarEspaciosEnSelect(
      editarAsignacionEspacio,
      asignacion.cursoId,
      asignacion.espacioId,
    );

    mostrarMensajeEdicionAsignacion("");
  } catch (error) {
    console.error("Error al cargar edición de asignación:", error);

    mostrarMensajeEdicionAsignacion(
      "No se pudieron cargar los datos de la asignación.",
      "error",
    );
  }
}

function crearCeldaAccionesAsignacion(asignacion) {
  const celda = document.createElement("td");
  const contenedor = document.createElement("div");

  contenedor.className = "acciones-tabla";

  const btnEditar = crearBoton(
    "fa-solid fa-pen-to-square",
    "Editar",
    "btn-editar",
  );

  btnEditar.addEventListener("click", () => {
    abrirModalEditarAsignacion(asignacion);
  });

  const estado = String(asignacion.estado || "")
    .trim()
    .toUpperCase();

  const activa = estado === "ACTIVA";

  const btnEstado = crearBoton(
    activa ? "fa-solid fa-ban" : "fa-solid fa-circle-check",
    activa ? "Desactivar" : "Activar",
    activa ? "btn-desactivar" : "btn-activar",
  );

  btnEstado.addEventListener("click", () => {
    cambiarEstadoAsignacion(asignacion);
  });

  contenedor.appendChild(btnEditar);
  contenedor.appendChild(btnEstado);

  celda.appendChild(contenedor);

  return celda;
}

async function cambiarEstadoAsignacion(asignacion) {
  const estadoActual = String(asignacion.estado || "")
    .trim()
    .toUpperCase();

  const nuevoEstado = estadoActual === "ACTIVA" ? "INACTIVA" : "ACTIVA";

  const accion = nuevoEstado === "ACTIVA" ? "activar" : "desactivar";

  const resultado = await Swal.fire({
    icon: nuevoEstado === "ACTIVA" ? "question" : "warning",
    title:
      nuevoEstado === "ACTIVA"
        ? "¿Activar asignación?"
        : "¿Desactivar asignación?",
    html: `
      <p>Vas a ${accion} la siguiente asignación:</p>
      <strong>${asignacion.docenteNombre}</strong>
      <p style="margin-top: 8px;">
        ${asignacion.cursoNombre} — ${asignacion.espacioNombre}
      </p>
    `,
    showCancelButton: true,
    confirmButtonText:
      nuevoEstado === "ACTIVA" ? "Sí, activar" : "Sí, desactivar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!resultado.isConfirmed) return;

  try {
    await updateDoc(doc(db, "asignaciones_docentes", asignacion.id), {
      estado: nuevoEstado,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: normalizarCorreo(usuarioSoporte.email),
    });

    mostrarMensajeAsignaciones(
      `Asignación ${accion === "activar" ? "activada" : "desactivada"} correctamente.`,
      "ok",
    );

    await cargarAsignaciones();
  } catch (error) {
    console.error("Error al cambiar estado de asignación:", error);

    mostrarMensajeAsignaciones("No se pudo actualizar la asignación.", "error");
  }
}

async function guardarEdicionAsignacion(event) {
  event.preventDefault();

  if (!asignacionEnEdicion || !usuarioSoporte) return;

  const docenteCorreo = normalizarCorreo(editarAsignacionDocente.value);

  const cursoId = String(editarAsignacionCurso.value || "").trim();
  const espacioId = String(editarAsignacionEspacio.value || "").trim();

  const cicloLectivo = Number(editarAsignacionCicloLectivo.value || 0);

  const estado = String(editarAsignacionEstado.value || "ACTIVA")
    .trim()
    .toUpperCase();

  if (!docenteCorreo || !cursoId || !espacioId || !cicloLectivo) {
    mostrarMensajeEdicionAsignacion(
      "Completá todos los campos obligatorios.",
      "error",
    );
    return;
  }

  btnGuardarEdicionAsignacion.disabled = true;
  mostrarMensajeEdicionAsignacion("Guardando cambios...");

  try {
    const [docenteDocumento, cursoDocumento, espacioDocumento] =
      await Promise.all([
        getDoc(doc(db, "usuarios", docenteCorreo)),
        getDoc(doc(db, "cursos", cursoId)),
        getDoc(doc(db, "espacios_curriculares", espacioId)),
      ]);

    if (
      !docenteDocumento.exists() ||
      !cursoDocumento.exists() ||
      !espacioDocumento.exists()
    ) {
      throw new Error("No se pudieron validar los datos seleccionados.");
    }

    const docente = docenteDocumento.data();
    const curso = cursoDocumento.data();
    const espacio = espacioDocumento.data();

    if (Number(espacio.anio) !== Number(curso.anio)) {
      throw new Error("El espacio curricular no corresponde al año del curso.");
    }

    const nuevoId = crearIdAsignacion(
      docenteCorreo,
      cursoId,
      espacioId,
      cicloLectivo,
    );

    const idOriginal = asignacionEnEdicion.id;

    if (nuevoId !== idOriginal) {
      const duplicada = await getDoc(doc(db, "asignaciones_docentes", nuevoId));

      if (duplicada.exists()) {
        throw new Error(
          "Ya existe una asignación igual para ese ciclo lectivo.",
        );
      }
    }

    const datosActualizados = {
      docenteCorreo,
      docenteNombre: docente.nombreCompleto || docenteCorreo,

      cursoId,
      cursoNombre: curso.nombre || `${curso.anio}º ${curso.division}`,
      cursoAnio: Number(curso.anio),
      cursoDivision: curso.division || "",

      espacioId,
      espacioNombre: espacio.nombre || "",
      espacioTipo: espacio.tipo || "",

      cicloLectivo,
      estado,

      actualizadoEn: serverTimestamp(),
      actualizadoPor: normalizarCorreo(usuarioSoporte.email),
    };

    const lote = writeBatch(db);

    lote.set(doc(db, "asignaciones_docentes", nuevoId), datosActualizados, {
      merge: true,
    });

    if (nuevoId !== idOriginal) {
      lote.delete(doc(db, "asignaciones_docentes", idOriginal));
    }

    await lote.commit();

    cerrarModalEditarAsignacion();

    mostrarMensajeAsignaciones("Asignación actualizada correctamente.", "ok");

    await cargarAsignaciones();
  } catch (error) {
    console.error("Error al guardar edición de asignación:", error);

    mostrarMensajeEdicionAsignacion(
      error.message || "No se pudo actualizar la asignación.",
      "error",
    );
  } finally {
    btnGuardarEdicionAsignacion.disabled = false;
  }
}
async function cargarAsignaciones() {
  if (!usuarioSoporte || !cuerpoTablaAsignaciones) {
    return;
  }

  mostrarMensajeAsignaciones("Cargando asignaciones...");
  cuerpoTablaAsignaciones.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "asignaciones_docentes"));

    const asignaciones = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const cicloA = Number(a.cicloLectivo || 0);
        const cicloB = Number(b.cicloLectivo || 0);

        if (cicloA !== cicloB) {
          return cicloB - cicloA;
        }

        return String(a.docenteNombre || "").localeCompare(
          String(b.docenteNombre || ""),
          "es",
        );
      });

    if (!asignaciones.length) {
      mostrarMensajeAsignaciones("Todavía no hay asignaciones registradas.");
      return;
    }

    asignaciones.forEach((asignacion) => {
      const fila = document.createElement("tr");
      fila.appendChild(crearCelda(asignacion.docenteNombre));
      fila.appendChild(crearCelda(asignacion.cursoNombre));
      fila.appendChild(crearCelda(asignacion.espacioNombre));
      fila.appendChild(crearCelda(textoTipoEspacio(asignacion.espacioTipo)));
      fila.appendChild(crearCelda(asignacion.cicloLectivo));
      fila.appendChild(crearCeldaEstado(asignacion.estado));
      fila.appendChild(crearCeldaAccionesAsignacion(asignacion));
      cuerpoTablaAsignaciones.appendChild(fila);
    });

    mostrarMensajeAsignaciones(
      `${asignaciones.length} asignación(es) cargada(s).`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar asignaciones:", error);

    mostrarMensajeAsignaciones(
      "No se pudieron cargar las asignaciones.",
      "error",
    );
  }
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

async function cargarEstudiantes() {
  if (!usuarioSoporte) {
    mostrarMensajeEstudiantes("Esperando validación de sesión...", "error");
    return;
  }

  mostrarMensajeEstudiantes("Cargando estudiantes...");
  cuerpoTablaEstudiantes.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "usuarios"));

    estudiantesCargados = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter(
        (usuario) =>
          String(usuario.rol || "")
            .trim()
            .toUpperCase() === "ALUMNO",
      )
      .sort((a, b) =>
        String(a.nombreCompleto || "").localeCompare(
          String(b.nombreCompleto || ""),
          "es",
        ),
      );

    if (!estudiantesCargados.length) {
      mostrarMensajeEstudiantes("Todavía no hay estudiantes registrados.");
      return;
    }

    cargarOpcionesFiltroCursosEstudiantes();
    aplicarFiltrosEstudiantes();
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);

    mostrarMensajeEstudiantes(
      "No se pudieron cargar los estudiantes. Revisá permisos o conexión.",
      "error",
    );
  }
}

function cargarOpcionesFiltroCursosEstudiantes() {
  if (!filtroCursoEstudiante) return;

  const cursoSeleccionadoActual = filtroCursoEstudiante.value;

  const cursosDisponibles = [
    ...new Set(
      estudiantesCargados
        .map((estudiante) => String(estudiante.cursoNombre || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b, "es", {
      numeric: true,
    }),
  );

  filtroCursoEstudiante.innerHTML =
    '<option value="">Todos los cursos</option>';

  cursosDisponibles.forEach((cursoNombre) => {
    const opcion = document.createElement("option");

    opcion.value = cursoNombre;
    opcion.textContent = cursoNombre;

    filtroCursoEstudiante.appendChild(opcion);
  });

  if (cursosDisponibles.includes(cursoSeleccionadoActual)) {
    filtroCursoEstudiante.value = cursoSeleccionadoActual;
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
  const dni = String(datos.get("dni") || "")
    .replace(/\D/g, "")
    .trim();
  if (!nombreCompleto || !correo || !rol) {
    mostrarMensajeRegistro(
      "Completá nombre, correo y rol antes de registrar.",
      "error",
    );
    return;
  }
  if (dni && (dni.length < 7 || dni.length > 8)) {
    mostrarMensajeRegistro(
      "El DNI debe tener entre 7 y 8 números, sin puntos.",
      "error",
    );
    return;
  }
  const situacionesRevistaValidas = [
    "TITULAR",
    "INTERINO",
    "REEMPLAZANTE",
    "CURSANDO",
    "CURSADA_COMPLETA",
  ];

  if (!situacionesRevistaValidas.includes(tipoVinculo)) {
    mostrarMensajeRegistro(
      "Seleccioná una Situación de Revista válida.",
      "error",
    );
    return;
  }
  if (
    ![
      "ALUMNO",
      "DOCENTE",
      "SOPORTE",
      "PRECEPTORIA",
      "SECRETARIA",
      "DIRECCION",
    ].includes(rol)
  ) {
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
      tipoVinculo,
      dni: dni || null,
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
  editarDni.value = String(usuario.dni || "")
    .replace(/\D/g, "")
    .trim();
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
  const situacionesRevistaValidas = [
    "TITULAR",
    "INTERINO",
    "REEMPLAZANTE",
    "CURSANDO",
    "CURSADA_COMPLETA",
  ];

  if (!situacionesRevistaValidas.includes(tipoVinculo)) {
    mostrarMensajeEdicion(
      "Seleccioná una Situación de Revista válida.",
      "error",
    );
    return;
  }
  const fechaFinAcceso = editarFechaFinAcceso.value.trim();
  const dni = String(editarDni.value || "")
    .replace(/\D/g, "")
    .trim();

  if (!nombreCompleto || !rol) {
    mostrarMensajeEdicion("Completá nombre y rol antes de guardar.", "error");
    return;
  }
  if (dni && (dni.length < 7 || dni.length > 8)) {
    mostrarMensajeEdicion(
      "El DNI debe tener entre 7 y 8 números, sin puntos.",
      "error",
    );
    return;
  }

  if (
    ![
      "ALUMNO",
      "DOCENTE",
      "SOPORTE",
      "PRECEPTORIA",
      "SECRETARIA",
      "DIRECCION",
    ].includes(rol)
  ) {
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
      tipoVinculo,
      dni: dni || null,
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
if (editarAsignacionCurso) {
  editarAsignacionCurso.addEventListener("change", async () => {
    await cargarEspaciosEnSelect(
      editarAsignacionEspacio,
      editarAsignacionCurso.value,
    );
  });
}

if (formEditarAsignacion) {
  formEditarAsignacion.addEventListener("submit", guardarEdicionAsignacion);
}

if (btnCerrarEdicionAsignacion) {
  btnCerrarEdicionAsignacion.addEventListener(
    "click",
    cerrarModalEditarAsignacion,
  );
}

if (btnCancelarEdicionAsignacion) {
  btnCancelarEdicionAsignacion.addEventListener(
    "click",
    cerrarModalEditarAsignacion,
  );
}

if (modalEditarAsignacion) {
  modalEditarAsignacion.addEventListener("click", (event) => {
    if (event.target === modalEditarAsignacion) {
      cerrarModalEditarAsignacion();
    }
  });
}
if (formRegistroAsignacion) {
  formRegistroAsignacion.addEventListener("submit", registrarAsignacion);
}

if (btnVerAsignaciones) {
  btnVerAsignaciones.addEventListener("click", cargarAsignaciones);
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

if (buscarEstudiante) {
  buscarEstudiante.addEventListener("input", aplicarFiltrosEstudiantes);
}

if (filtroCursoEstudiante) {
  filtroCursoEstudiante.addEventListener("change", aplicarFiltrosEstudiantes);
}

if (filtroEstadoEstudiante) {
  filtroEstadoEstudiante.addEventListener("change", aplicarFiltrosEstudiantes);
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", aplicarFiltrosUsuarios);
}
if (btnVerUsuarios) {
  btnVerUsuarios.addEventListener("click", cargarUsuarios);
}

if (btnVerEstudiantes) {
  btnVerEstudiantes.addEventListener("click", cargarEstudiantes);
}

if (btnImportarCursosAlumnos) {
  btnImportarCursosAlumnos.addEventListener("click", () => {
    archivoImportacionCursosAlumnos.click();
  });
}

function validarFilasImportacionCursosAlumnos(filas) {
  const encabezadosObligatorios = [
    "CORREO_DE_ACCESO",
    "ANIO",
    "DIVISION",
    "GRUPO",
  ];

  const encabezadosArchivo = Object.keys(filas[0] || {});

  const encabezadosFaltantes = encabezadosObligatorios.filter(
    (encabezado) => !encabezadosArchivo.includes(encabezado),
  );

  if (encabezadosFaltantes.length) {
    return {
      correcto: false,
      tipo: "ENCABEZADOS",
      errores: encabezadosFaltantes,
      asignacionesValidas: [],
    };
  }

  const errores = [];
  const asignacionesValidas = [];

  filas.forEach((fila, indice) => {
    const numeroFilaExcel = indice + 2;

    const correo = String(fila.CORREO_DE_ACCESO || "")
      .trim()
      .toLowerCase();

    const anio = Number(fila.ANIO || 0);

    const division = String(fila.DIVISION || "")
      .trim()
      .toUpperCase();

    const grupoTaller = String(fila.GRUPO || "")
      .trim()
      .toUpperCase();

    const erroresFila = [];

    if (!correo) {
      erroresFila.push("falta el correo de acceso");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      erroresFila.push("el correo no tiene un formato válido");
    }

    if (!Number.isInteger(anio) || anio < 1 || anio > 6) {
      erroresFila.push("el año debe ser un número entre 1 y 6");
    }

    if (!division) {
      erroresFila.push("falta la división");
    }

    if (grupoTaller && !["G1", "G2"].includes(grupoTaller)) {
      erroresFila.push("el grupo debe ser G1, G2 o quedar vacío");
    }

    if (erroresFila.length) {
      errores.push({
        fila: numeroFilaExcel,
        detalle: erroresFila.join(", "),
      });

      return;
    }

    asignacionesValidas.push({
      correo,
      anio,
      division,
      grupoTaller: grupoTaller || null,
    });
  });

  return {
    correcto: errores.length === 0,
    tipo: "DATOS",
    errores,
    asignacionesValidas,
  };
}

async function revisarAsignacionesCursosAlumnos(asignaciones) {
  const correosRepetidos = [];
  const correosVistos = new Set();

  asignaciones.forEach((asignacion) => {
    if (correosVistos.has(asignacion.correo)) {
      correosRepetidos.push(asignacion.correo);
    }

    correosVistos.add(asignacion.correo);
  });

  const asignacionesSinDuplicados = asignaciones.filter(
    (asignacion, indice) =>
      asignaciones.findIndex((item) => item.correo === asignacion.correo) ===
      indice,
  );

  const consultaCursos = await getDocs(collection(db, "cursos"));

  const cursosActivos = consultaCursos.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter(
      (curso) =>
        String(curso.estado || "ACTIVO")
          .trim()
          .toUpperCase() === "ACTIVO",
    );

  const resultados = await Promise.all(
    asignacionesSinDuplicados.map(async (asignacion) => {
      const referenciaUsuario = doc(db, "usuarios", asignacion.correo);

      const documentoUsuario = await getDoc(referenciaUsuario);

      if (!documentoUsuario.exists()) {
        return {
          ...asignacion,
          estadoRevision: "NO_EXISTE",
        };
      }

      const usuario = documentoUsuario.data();

      if (
        String(usuario.rol || "")
          .trim()
          .toUpperCase() !== "ALUMNO"
      ) {
        return {
          ...asignacion,
          nombreCompleto: usuario.nombreCompleto || "",
          estadoRevision: "NO_ES_ALUMNO",
        };
      }

      const curso = cursosActivos.find(
        (item) =>
          Number(item.anio) === asignacion.anio &&
          String(item.division || "")
            .trim()
            .toUpperCase() === asignacion.division,
      );

      if (!curso) {
        return {
          ...asignacion,
          nombreCompleto: usuario.nombreCompleto || "",
          estadoRevision: "CURSO_INEXISTENTE",
        };
      }

      return {
        ...asignacion,
        nombreCompleto: usuario.nombreCompleto || "",
        cursoId: curso.id,
        cursoNombre:
          curso.nombre || `${asignacion.anio}º ${asignacion.division}`,
        yaTeniaCurso: Boolean(usuario.cursoId),
        estadoRevision: "CORRECTO",
      };
    }),
  );

  return {
    correctas: resultados.filter((item) => item.estadoRevision === "CORRECTO"),
    correosInexistentes: resultados.filter(
      (item) => item.estadoRevision === "NO_EXISTE",
    ),
    noSonAlumnos: resultados.filter(
      (item) => item.estadoRevision === "NO_ES_ALUMNO",
    ),
    cursosInexistentes: resultados.filter(
      (item) => item.estadoRevision === "CURSO_INEXISTENTE",
    ),
    correosRepetidos: [...new Set(correosRepetidos)],
  };
}

async function importarAsignacionesCursosAlumnos(asignaciones) {
  if (!asignaciones.length) {
    return 0;
  }

  const TAMANIO_LOTE = 450;
  let cantidadActualizada = 0;

  for (let inicio = 0; inicio < asignaciones.length; inicio += TAMANIO_LOTE) {
    const grupoAsignaciones = asignaciones.slice(inicio, inicio + TAMANIO_LOTE);

    const lote = writeBatch(db);

    grupoAsignaciones.forEach((asignacion) => {
      const referenciaUsuario = doc(db, "usuarios", asignacion.correo);

      lote.update(referenciaUsuario, {
        cursoId: asignacion.cursoId,
        cursoAnio: asignacion.anio,
        cursoDivision: asignacion.division,
        cursoNombre: asignacion.cursoNombre,
        grupoTaller: asignacion.grupoTaller || null,
        actualizadoEn: serverTimestamp(),
      });
    });

    await lote.commit();

    cantidadActualizada += grupoAsignaciones.length;
  }

  return cantidadActualizada;
}

if (archivoImportacionCursosAlumnos) {
  archivoImportacionCursosAlumnos.addEventListener("change", async () => {
    const archivo = archivoImportacionCursosAlumnos.files[0];

    if (!archivo) return;

    if (!window.XLSX) {
      await Swal.fire({
        title: "Lector de Excel no disponible",
        text: "Recargá la página e intentá nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });

      archivoImportacionCursosAlumnos.value = "";
      return;
    }

    try {
      const datosArchivo = await archivo.arrayBuffer();

      const libro = XLSX.read(datosArchivo, {
        type: "array",
      });

      const nombrePrimeraHoja = libro.SheetNames[0];
      const hoja = libro.Sheets[nombrePrimeraHoja];

      const filas = XLSX.utils.sheet_to_json(hoja, {
        defval: "",
      });

      if (!filas.length) {
        await Swal.fire({
          title: "Archivo sin datos",
          text: "No se encontraron filas con estudiantes en la primera hoja.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });

        return;
      }

      console.log("Filas de cursos de alumnos:", filas);

      const validacionCursos = validarFilasImportacionCursosAlumnos(filas);

      if (!validacionCursos.correcto) {
        if (validacionCursos.tipo === "ENCABEZADOS") {
          await Swal.fire({
            title: "Columnas faltantes",
            html: `
        <p>El archivo no tiene todas las columnas necesarias.</p>
        <p><strong>Faltan:</strong></p>
        <p>${validacionCursos.errores.join("<br>")}</p>
      `,
            icon: "error",
            confirmButtonText: "Aceptar",
          });

          return;
        }

        const detalleErrores = validacionCursos.errores
          .slice(0, 8)
          .map(
            (errorFila) =>
              `<li><strong>Fila ${errorFila.fila}:</strong> ${errorFila.detalle}</li>`,
          )
          .join("");

        const textoExtra =
          validacionCursos.errores.length > 8
            ? `<p>Y ${validacionCursos.errores.length - 8} error(es) más.</p>`
            : "";

        await Swal.fire({
          title: "Hay datos para corregir",
          html: `
      <p>No se modificó ningún estudiante.</p>
      <ul style="text-align:left; margin-top:12px;">
        ${detalleErrores}
      </ul>
      ${textoExtra}
    `,
          icon: "warning",
          confirmButtonText: "Aceptar",
        });

        return;
      }

      const revisionCursos = await revisarAsignacionesCursosAlumnos(
        validacionCursos.asignacionesValidas,
      );

      if (!revisionCursos.correctas.length) {
        await Swal.fire({
          title: "No hay asignaciones válidas para importar",
          text: "Revisá los errores informados antes de continuar.",
          icon: "info",
          confirmButtonText: "Aceptar",
        });

        return;
      }

      const asignacionesNuevas = revisionCursos.correctas.filter(
        (item) => !item.yaTeniaCurso,
      );

      const asignacionesActualizar = revisionCursos.correctas.filter(
        (item) => item.yaTeniaCurso,
      );

      const confirmacionAsignaciones = await Swal.fire({
        title: "¿Asignar cursos a estudiantes?",
        html: `
    <p>Se actualizarán <strong>${revisionCursos.correctas.length}</strong> estudiante(s).</p>

    <p><strong>Sin curso previo:</strong> ${asignacionesNuevas.length}</p>
    <p><strong>Con curso a actualizar:</strong> ${asignacionesActualizar.length}</p>

    ${
      revisionCursos.correosInexistentes.length ||
      revisionCursos.noSonAlumnos.length ||
      revisionCursos.cursosInexistentes.length ||
      revisionCursos.correosRepetidos.length
        ? `
          <hr style="margin:16px 0;">
          <p><strong>Se omitirán los registros con problemas:</strong></p>
          <p>Correos inexistentes: ${revisionCursos.correosInexistentes.length}</p>
          <p>No son alumnos: ${revisionCursos.noSonAlumnos.length}</p>
          <p>Cursos inexistentes o inactivos: ${revisionCursos.cursosInexistentes.length}</p>
          <p>Correos repetidos: ${revisionCursos.correosRepetidos.length}</p>
        `
        : ""
    }

    <p style="margin-top:16px;">
      Los datos del Excel reemplazarán cualquier curso o grupo cargado previamente.
    </p>
  `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Sí, asignar ${revisionCursos.correctas.length}`,
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#198754",
      });

      if (!confirmacionAsignaciones.isConfirmed) {
        return;
      }

      try {
        Swal.fire({
          title: "Asignando cursos...",
          text: "Por favor, esperá un momento.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const cantidadActualizada = await importarAsignacionesCursosAlumnos(
          revisionCursos.correctas,
        );

        await Swal.fire({
          title: "Asignación completada",
          html: `
      <p>Se actualizaron correctamente <strong>${cantidadActualizada}</strong> estudiante(s).</p>
      <p>El curso y el grupo de Taller ya quedaron registrados.</p>
    `,
          icon: "success",
          confirmButtonText: "Aceptar",
        });

        await cargarEstudiantes();
      } catch (error) {
        console.error("Error al importar asignaciones de cursos:", error);

        await Swal.fire({
          title: "No se pudo completar la asignación",
          text: "No se pudieron actualizar los estudiantes. Revisá conexión, permisos y volvé a intentarlo.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al leer archivo de cursos de alumnos:", error);

      await Swal.fire({
        title: "No se pudo leer el archivo",
        text: "Verificá que sea un Excel o CSV válido e intentá nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      archivoImportacionCursosAlumnos.value = "";
    }
  });
}

btnImportarUsuarios.addEventListener("click", () => {
  archivoImportacionUsuarios.click();
});
function validarFilasImportacionUsuarios(filas) {
  const encabezadosObligatorios = [
    "NOMBRE_COMPLETO",
    "CORREO_DE_ACCESO",
    "ROL",
    "SITUACION_DE_REVISTA",
    "FECHA_FINALIZACION",
  ];

  const rolesValidos = [
    "ALUMNO",
    "DOCENTE",
    "SOPORTE",
    "PRECEPTORIA",
    "SECRETARIA",
    "DIRECCION",
  ];

  const situacionesValidas = [
    "TITULAR",
    "INTERINO",
    "REEMPLAZANTE",
    "CURSANDO",
    "CURSADA_COMPLETA",
  ];

  const encabezadosArchivo = Object.keys(filas[0] || {});

  const encabezadosFaltantes = encabezadosObligatorios.filter(
    (encabezado) => !encabezadosArchivo.includes(encabezado),
  );

  if (encabezadosFaltantes.length) {
    return {
      correcto: false,
      tipo: "ENCABEZADOS",
      errores: encabezadosFaltantes,
      usuariosValidos: [],
    };
  }

  const errores = [];
  const usuariosValidos = [];

  filas.forEach((fila, indice) => {
    const numeroFilaExcel = indice + 2;

    const nombreCompleto = String(fila.NOMBRE_COMPLETO || "").trim();

    const correo = String(fila.CORREO_DE_ACCESO || "")
      .trim()
      .toLowerCase();

    const rol = String(fila.ROL || "")
      .trim()
      .toUpperCase();

    const situacionRevista = String(fila.SITUACION_DE_REVISTA || "")
      .trim()
      .toUpperCase();

    let fechaFinalizacion = fila.FECHA_FINALIZACION || "";

    if (fechaFinalizacion instanceof Date) {
      fechaFinalizacion = fechaFinalizacion.toISOString().slice(0, 10);
    } else if (typeof fechaFinalizacion === "number") {
      const fechaExcel = XLSX.SSF.parse_date_code(fechaFinalizacion);

      fechaFinalizacion = fechaExcel
        ? `${fechaExcel.y}-${String(fechaExcel.m).padStart(2, "0")}-${String(
            fechaExcel.d,
          ).padStart(2, "0")}`
        : "";
    } else {
      fechaFinalizacion = String(fechaFinalizacion).trim();
    }

    const erroresFila = [];

    if (!nombreCompleto) {
      erroresFila.push("falta el nombre completo");
    }

    if (!correo) {
      erroresFila.push("falta el correo de acceso");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      erroresFila.push("el correo no tiene un formato válido");
    }

    if (!rolesValidos.includes(rol)) {
      erroresFila.push("el rol no es válido");
    }

    if (!situacionesValidas.includes(situacionRevista)) {
      erroresFila.push("la situación de revista no es válida");
    }

    if (fechaFinalizacion && !/^\d{4}-\d{2}-\d{2}$/.test(fechaFinalizacion)) {
      erroresFila.push("la fecha debe tener formato AAAA-MM-DD");
    }

    if (erroresFila.length) {
      errores.push({
        fila: numeroFilaExcel,
        detalle: erroresFila.join(", "),
      });

      return;
    }

    usuariosValidos.push({
      nombreCompleto,
      correo,
      rol,
      tipoVinculo: situacionRevista,
      fechaFinAcceso: fechaFinalizacion || null,
    });
  });

  return {
    correcto: errores.length === 0,
    tipo: "DATOS",
    errores,
    usuariosValidos,
  };
}

async function revisarUsuariosExistentes(usuarios) {
  const correosRepetidos = [];
  const correosVistos = new Set();

  usuarios.forEach((usuario) => {
    if (correosVistos.has(usuario.correo)) {
      correosRepetidos.push(usuario.correo);
    }

    correosVistos.add(usuario.correo);
  });

  const usuariosSinDuplicados = usuarios.filter(
    (usuario, indice) =>
      usuarios.findIndex((item) => item.correo === usuario.correo) === indice,
  );

  const resultados = await Promise.all(
    usuariosSinDuplicados.map(async (usuario) => {
      const referenciaUsuario = doc(db, "usuarios", usuario.correo);

      const documentoUsuario = await getDoc(referenciaUsuario);

      return {
        ...usuario,
        existe: documentoUsuario.exists(),
      };
    }),
  );

  return {
    nuevos: resultados.filter((usuario) => !usuario.existe),
    existentes: resultados.filter((usuario) => usuario.existe),
    correosRepetidos: [...new Set(correosRepetidos)],
  };
}

async function importarUsuariosNuevos(usuarios) {
  if (!usuarios.length) {
    return 0;
  }

  const TAMANIO_LOTE = 450;
  let cantidadImportada = 0;

  for (let inicio = 0; inicio < usuarios.length; inicio += TAMANIO_LOTE) {
    const grupoUsuarios = usuarios.slice(inicio, inicio + TAMANIO_LOTE);

    const lote = writeBatch(db);

    grupoUsuarios.forEach((usuario) => {
      const referencia = doc(db, "usuarios", usuario.correo);

      lote.set(referencia, {
        correo: usuario.correo,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol,
        estado: "ACTIVO",
        tipoVinculo: usuario.tipoVinculo,
        fechaFinAcceso: usuario.fechaFinAcceso || null,
        fechaAlta: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
        creadoPor: normalizarCorreo(usuarioSoporte.email),
      });
    });

    await lote.commit();

    cantidadImportada += grupoUsuarios.length;
  }

  return cantidadImportada;
}

archivoImportacionUsuarios.addEventListener("change", async () => {
  const archivo = archivoImportacionUsuarios.files[0];

  if (!archivo) return;

  if (!window.XLSX) {
    await Swal.fire({
      title: "Lector de Excel no disponible",
      text: "No se pudo cargar la herramienta para leer archivos. Recargá la página e intentá nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    archivoImportacionUsuarios.value = "";
    return;
  }

  try {
    const datosArchivo = await archivo.arrayBuffer();

    const libro = XLSX.read(datosArchivo, {
      type: "array",
    });

    const nombrePrimeraHoja = libro.SheetNames[0];
    const hoja = libro.Sheets[nombrePrimeraHoja];

    const filas = XLSX.utils.sheet_to_json(hoja, {
      defval: "",
    });

    if (!filas.length) {
      await Swal.fire({
        title: "Archivo sin usuarios",
        text: "No se encontraron filas con datos en la primera hoja.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });

      archivoImportacionUsuarios.value = "";
      return;
    }

    console.log("Filas importadas desde Excel:", filas);
    const validacion = validarFilasImportacionUsuarios(filas);

    if (!validacion.correcto) {
      if (validacion.tipo === "ENCABEZADOS") {
        await Swal.fire({
          title: "Columnas faltantes",
          html: `
        <p>El archivo no tiene todas las columnas necesarias.</p>
        <p><strong>Faltan:</strong></p>
        <p>${validacion.errores.join("<br>")}</p>
      `,
          icon: "error",
          confirmButtonText: "Aceptar",
        });

        return;
      }

      const detalleErrores = validacion.errores
        .slice(0, 8)
        .map(
          (errorFila) =>
            `<li><strong>Fila ${errorFila.fila}:</strong> ${errorFila.detalle}</li>`,
        )
        .join("");

      const textoExtra =
        validacion.errores.length > 8
          ? `<p>Y ${validacion.errores.length - 8} error(es) más.</p>`
          : "";

      await Swal.fire({
        title: "Hay datos para corregir",
        html: `
      <p>No se creó ningún usuario.</p>
      <ul style="text-align:left; margin-top:12px;">
        ${detalleErrores}
      </ul>
      ${textoExtra}
    `,
        icon: "warning",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    console.log(
      "Usuarios validados correctamente:",
      validacion.usuariosValidos,
    );

    const confirmacionImportacion = await Swal.fire({
      title: "Usuarios listos para importar",
      html: `
    <p><strong>Archivo:</strong> ${archivo.name}</p>
    <p><strong>Usuarios encontrados:</strong> ${filas.length}</p>
    <p><strong>Usuarios válidos:</strong> ${validacion.usuariosValidos.length}</p>
    <p style="margin-top:14px;">
      En el próximo paso el sistema comprobará cuáles ya existen
      antes de crear registros nuevos.
    </p>
  `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Continuar con la importación",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0d6efd",
    });

    if (!confirmacionImportacion.isConfirmed) {
      return;
    }

    const revision = await revisarUsuariosExistentes(
      validacion.usuariosValidos,
    );

    const listaExistentes = revision.existentes
      .slice(0, 8)
      .map(
        (usuario) => `<li>${usuario.nombreCompleto} — ${usuario.correo}</li>`,
      )
      .join("");

    const listaRepetidos = revision.correosRepetidos
      .slice(0, 8)
      .map((correo) => `<li>${correo}</li>`)
      .join("");

    const masExistentes =
      revision.existentes.length > 8
        ? `<p>Y ${revision.existentes.length - 8} usuario(s) existente(s) más.</p>`
        : "";

    const masRepetidos =
      revision.correosRepetidos.length > 8
        ? `<p>Y ${revision.correosRepetidos.length - 8} correo(s) repetido(s) más.</p>`
        : "";

    if (!revision.nuevos.length) {
      await Swal.fire({
        title: "No hay usuarios nuevos para importar",
        text: "Todos los correos del archivo ya están registrados o hay correos repetidos que revisar.",
        icon: "info",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    const confirmacionFinal = await Swal.fire({
      title: "¿Importar usuarios?",
      html: `
    <p>Se crearán <strong>${revision.nuevos.length}</strong> usuario(s) nuevo(s).</p>
    <p>Los usuarios ya existentes no se modificarán.</p>
    ${
      revision.correosRepetidos.length
        ? `
          <p style="margin-top:14px;">
            <strong>Atención:</strong> se detectaron
            ${revision.correosRepetidos.length} correo(s) repetido(s) en el archivo.
            Solo se tomará una vez cada correo.
          </p>
        `
        : ""
    }
  `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Sí, importar ${revision.nuevos.length}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
    });

    if (!confirmacionFinal.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: "Importando usuarios...",
        text: "Por favor, esperá un momento.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const cantidadImportada = await importarUsuariosNuevos(revision.nuevos);

      await Swal.fire({
        title: "Importación completada",
        html: `
      <p>Se registraron correctamente <strong>${cantidadImportada}</strong> usuario(s).</p>
      <p>Los usuarios ya pueden iniciar sesión con su cuenta de Google autorizada.</p>
    `,
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      await cargarUsuarios();
    } catch (error) {
      console.error("Error al importar usuarios:", error);

      await Swal.fire({
        title: "No se pudo completar la importación",
        text: "No se registraron los usuarios. Revisá la conexión, los permisos y volvé a intentarlo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } catch (error) {
    console.error("Error al leer archivo de importación:", error);

    await Swal.fire({
      title: "No se pudo leer el archivo",
      text: "Verificá que sea un Excel o CSV válido e intentá nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    archivoImportacionUsuarios.value = "";
  }
});

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

  prepararFormularioAsignaciones();
});
