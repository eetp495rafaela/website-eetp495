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
