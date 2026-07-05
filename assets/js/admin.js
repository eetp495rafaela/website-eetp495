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

let usuarioSoporte = null;

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

async function cargarUsuarios() {
  if (!usuarioSoporte) {
    mostrarMensajeUsuarios("Esperando validación de sesión...", "error");
    return;
  }

  mostrarMensajeUsuarios("Cargando usuarios...");
  cuerpoTabla.innerHTML = "";

  try {
    const consulta = await getDocs(collection(db, "usuarios"));

    const usuarios = consulta.docs
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

    if (!usuarios.length) {
      mostrarMensajeUsuarios("Todavía no hay usuarios registrados.");
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

    mostrarMensajeUsuarios(`${usuarios.length} usuario(s) cargado(s).`, "ok");
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

  const confirmar = window.confirm(
    `¿Confirmás ${accion} la cuenta de ${usuario.nombreCompleto}?`,
  );

  if (!confirmar) return;

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

async function editarUsuario(usuario) {
  const correo = normalizarCorreo(usuario.correo);
  const correoActual = normalizarCorreo(usuarioSoporte?.email);
  const esMiCuenta = correo === correoActual;

  const nuevoNombre = window.prompt(
    "Nombre completo:",
    usuario.nombreCompleto || "",
  );

  if (nuevoNombre === null) return;

  const nuevoRol = window.prompt(
    "Rol: ALUMNO, DOCENTE o SOPORTE",
    String(usuario.rol || "").toUpperCase(),
  );

  if (nuevoRol === null) return;

  const rolNormalizado = nuevoRol.trim().toUpperCase();

  if (!["ALUMNO", "DOCENTE", "SOPORTE"].includes(rolNormalizado)) {
    mostrarMensajeUsuarios(
      "El rol debe ser ALUMNO, DOCENTE o SOPORTE.",
      "error",
    );
    return;
  }

  if (esMiCuenta && rolNormalizado !== "SOPORTE") {
    mostrarMensajeUsuarios(
      "No podés cambiar tu propio rol desde este panel.",
      "error",
    );
    return;
  }

  const nuevoVinculo = window.prompt(
    "Tipo de vínculo:",
    usuario.tipoVinculo || "",
  );

  if (nuevoVinculo === null) return;

  const nuevaFechaFin = window.prompt(
    "Fecha de finalización (AAAA-MM-DD) o dejar vacío:",
    usuario.fechaFinAcceso || "",
  );

  if (nuevaFechaFin === null) return;

  try {
    await updateDoc(doc(db, "usuarios", correo), {
      nombreCompleto: nuevoNombre.trim(),
      rol: rolNormalizado,
      tipoVinculo: nuevoVinculo.trim() || rolNormalizado,
      fechaFinAcceso: nuevaFechaFin.trim() || null,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: correoActual,
    });

    mostrarMensajeUsuarios("Usuario actualizado correctamente.", "ok");

    await cargarUsuarios();
  } catch (error) {
    console.error("Error al editar usuario:", error);

    mostrarMensajeUsuarios("No se pudo actualizar el usuario.", "error");
  }
}

if (formulario) {
  formulario.addEventListener("submit", registrarUsuario);
}

if (btnVerUsuarios) {
  btnVerUsuarios.addEventListener("click", cargarUsuarios);
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  usuarioSoporte = user;
});
