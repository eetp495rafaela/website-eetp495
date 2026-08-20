import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
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

const formReemplazoDocente = document.getElementById("formReemplazoDocente");

const reemplazoTitular = document.getElementById("reemplazoTitular");

const reemplazoAsignacion = document.getElementById("reemplazoAsignacion");

const reemplazoDocente = document.getElementById("reemplazoDocente");

const reemplazoFechaDesde = document.getElementById("reemplazoFechaDesde");

const reemplazoFechaHasta = document.getElementById("reemplazoFechaHasta");

const btnRegistrarReemplazo = document.getElementById("btnRegistrarReemplazo");

const mensajeReemplazoDocente = document.getElementById(
  "mensajeReemplazoDocente",
);

const btnVerReemplazos = document.getElementById("btnVerReemplazos");

const cuerpoTablaReemplazos = document.getElementById("cuerpoTablaReemplazos");

const mensajeReemplazos = document.getElementById("mensajeReemplazos");

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function mostrarMensajeReemplazo(texto = "", tipo = "") {
  if (!mensajeReemplazoDocente) return;

  mensajeReemplazoDocente.textContent = texto;

  mensajeReemplazoDocente.classList.remove("mensaje-ok", "mensaje-error");

  if (tipo === "ok") {
    mensajeReemplazoDocente.classList.add("mensaje-ok");
  }

  if (tipo === "error") {
    mensajeReemplazoDocente.classList.add("mensaje-error");
  }
}

function obtenerRolesUsuario(usuario) {
  const rolPrincipal = String(usuario?.rol || "")
    .trim()
    .toUpperCase();

  const rolesGuardados = Array.isArray(usuario?.roles)
    ? usuario.roles.map((rol) =>
        String(rol || "")
          .trim()
          .toUpperCase(),
      )
    : [];

  return Array.from(new Set([rolPrincipal, ...rolesGuardados])).filter(Boolean);
}

function limpiarSelect(select, texto) {
  if (!select) return;

  select.innerHTML = "";

  const opcion = document.createElement("option");
  opcion.value = "";
  opcion.textContent = texto;

  select.appendChild(opcion);
}

function agregarOpcion(select, valor, texto) {
  if (!select) return;

  const opcion = document.createElement("option");
  opcion.value = valor;
  opcion.textContent = texto;

  select.appendChild(opcion);
}

async function cargarDocentesReemplazos() {
  if (!reemplazoTitular || !reemplazoDocente) return;

  limpiarSelect(reemplazoTitular, "Cargando docentes...");
  limpiarSelect(reemplazoDocente, "Cargando docentes...");

  try {
    const [consultaUsuarios, consultaAsignaciones] = await Promise.all([
      getDocs(collection(db, "usuarios")),
      getDocs(collection(db, "asignaciones_docentes")),
    ]);

    const correosTitularesPermitidos = new Set();

    consultaAsignaciones.forEach((documento) => {
      const asignacion = documento.data();

      const estado = String(asignacion.estado || "")
        .trim()
        .toUpperCase();

      const tipo = String(asignacion.espacioTipo || "")
        .trim()
        .toUpperCase();

      const estaActiva = !estado || estado === "ACTIVA" || estado === "ACTIVO";

      const esTallerOEF = tipo === "TALLER" || tipo === "EDUCACION_FISICA";

      if (estaActiva && esTallerOEF) {
        const correo = normalizarCorreo(asignacion.docenteCorreo);

        if (correo) {
          correosTitularesPermitidos.add(correo);
        }
      }
    });

    const docentes = consultaUsuarios.docs
      .map((documento) => documento.data())
      .filter((usuario) => {
        const roles = obtenerRolesUsuario(usuario);

        const estado = String(usuario.estado || "")
          .trim()
          .toUpperCase();

        return roles.includes("DOCENTE") && estado === "ACTIVO";
      })
      .sort((a, b) =>
        String(a.nombreCompleto || "").localeCompare(
          String(b.nombreCompleto || ""),
          "es",
        ),
      );

    const docentesTitulares = docentes.filter((docente) =>
      correosTitularesPermitidos.has(normalizarCorreo(docente.correo)),
    );

    if (!docentesTitulares.length) {
      limpiarSelect(
        reemplazoTitular,
        "No hay docentes con Taller o Educación Física",
      );
    } else {
      limpiarSelect(reemplazoTitular, "Seleccionar docente titular");

      docentesTitulares.forEach((docente) => {
        const correo = normalizarCorreo(docente.correo);

        agregarOpcion(
          reemplazoTitular,
          correo,
          `${docente.nombreCompleto || correo} — ${correo}`,
        );
      });
    }

    if (!docentes.length) {
      limpiarSelect(reemplazoDocente, "No hay docentes activos registrados");
    } else {
      limpiarSelect(reemplazoDocente, "Seleccionar docente reemplazante");

      docentes.forEach((docente) => {
        const correo = normalizarCorreo(docente.correo);

        agregarOpcion(
          reemplazoDocente,
          correo,
          `${docente.nombreCompleto || correo} — ${correo}`,
        );
      });
    }
  } catch (error) {
    console.error("Error al cargar docentes para reemplazos:", error);

    limpiarSelect(reemplazoTitular, "No se pudieron cargar los docentes");

    limpiarSelect(reemplazoDocente, "No se pudieron cargar los docentes");
  }
}

async function cargarAsignacionesTitular() {
  if (!reemplazoTitular || !reemplazoAsignacion) return;

  const titularCorreo = normalizarCorreo(reemplazoTitular.value);

  limpiarSelect(reemplazoAsignacion, "Seleccioná primero un docente titular");

  if (!titularCorreo) {
    return;
  }

  limpiarSelect(reemplazoAsignacion, "Buscando asignaciones...");

  try {
    const consulta = await getDocs(collection(db, "asignaciones_docentes"));

    const asignaciones = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((asignacion) => {
        const correo = normalizarCorreo(asignacion.docenteCorreo);

        const estado = String(asignacion.estado || "")
          .trim()
          .toUpperCase();

        const tipo = String(asignacion.espacioTipo || "")
          .trim()
          .toUpperCase();

        const estaActiva =
          !estado || estado === "ACTIVA" || estado === "ACTIVO";

        const tipoPermitido = tipo === "TALLER" || tipo === "EDUCACION_FISICA";

        return correo === titularCorreo && estaActiva && tipoPermitido;
      })
      .sort((a, b) => {
        const cursoA = String(a.cursoNombre || "");
        const cursoB = String(b.cursoNombre || "");

        const comparacionCurso = cursoA.localeCompare(cursoB, "es");

        if (comparacionCurso !== 0) {
          return comparacionCurso;
        }

        return String(a.espacioNombre || "").localeCompare(
          String(b.espacioNombre || ""),
          "es",
        );
      });

    if (!asignaciones.length) {
      limpiarSelect(
        reemplazoAsignacion,
        "El docente no tiene asignaciones de Taller o Educación Física",
      );

      return;
    }

    limpiarSelect(reemplazoAsignacion, "Seleccionar asignación");

    asignaciones.forEach((asignacion) => {
      const tipoTexto =
        String(asignacion.espacioTipo || "")
          .trim()
          .toUpperCase() === "EDUCACION_FISICA"
          ? "Educación Física"
          : "Taller";

      const texto =
        `${asignacion.cursoNombre || "Curso"} — ` +
        `${asignacion.espacioNombre || "Espacio"} — ` +
        `${tipoTexto} — ` +
        `${asignacion.cicloLectivo || ""}`;

      agregarOpcion(reemplazoAsignacion, asignacion.id, texto);
    });
  } catch (error) {
    console.error("Error al cargar asignaciones del docente titular:", error);

    limpiarSelect(
      reemplazoAsignacion,
      "No se pudieron cargar las asignaciones",
    );
  }
}

if (reemplazoTitular) {
  reemplazoTitular.addEventListener("change", cargarAsignacionesTitular);
}

async function registrarReemplazoDocente(evento) {
  evento.preventDefault();

  if (
    !formReemplazoDocente ||
    !reemplazoTitular ||
    !reemplazoAsignacion ||
    !reemplazoDocente ||
    !reemplazoFechaDesde ||
    !reemplazoFechaHasta
  ) {
    return;
  }

  const usuarioActual = auth.currentUser;

  if (!usuarioActual) {
    mostrarMensajeReemplazo("No se pudo validar la sesión actual.", "error");
    return;
  }

  const titularCorreo = normalizarCorreo(reemplazoTitular.value);

  const asignacionTitularId = String(reemplazoAsignacion.value || "").trim();

  const reemplazanteCorreo = normalizarCorreo(reemplazoDocente.value);

  const fechaDesde = String(reemplazoFechaDesde.value || "").trim();

  const fechaHasta = String(reemplazoFechaHasta.value || "").trim();

  if (
    !titularCorreo ||
    !asignacionTitularId ||
    !reemplazanteCorreo ||
    !fechaDesde ||
    !fechaHasta
  ) {
    mostrarMensajeReemplazo("Completá todos los campos obligatorios.", "error");
    return;
  }

  if (titularCorreo === reemplazanteCorreo) {
    mostrarMensajeReemplazo(
      "El docente titular y el reemplazante no pueden ser la misma persona.",
      "error",
    );
    return;
  }

  if (fechaHasta < fechaDesde) {
    mostrarMensajeReemplazo(
      "La fecha hasta no puede ser anterior a la fecha desde.",
      "error",
    );
    return;
  }

  if (btnRegistrarReemplazo) {
    btnRegistrarReemplazo.disabled = true;
  }

  mostrarMensajeReemplazo("Validando reemplazo...");

  try {
    const [documentoAsignacion, documentoReemplazante, consultaReemplazos] =
      await Promise.all([
        getDoc(doc(db, "asignaciones_docentes", asignacionTitularId)),

        getDoc(doc(db, "usuarios", reemplazanteCorreo)),

        getDocs(collection(db, "reemplazos_docentes")),
      ]);

    if (!documentoAsignacion.exists()) {
      throw new Error("La asignación seleccionada ya no existe.");
    }

    if (!documentoReemplazante.exists()) {
      throw new Error("El docente reemplazante no existe.");
    }

    const asignacion = documentoAsignacion.data();
    const reemplazante = documentoReemplazante.data();

    const estadoAsignacion = String(asignacion.estado || "")
      .trim()
      .toUpperCase();

    const tipoHorario = String(asignacion.espacioTipo || "")
      .trim()
      .toUpperCase();

    const asignacionActiva =
      !estadoAsignacion ||
      estadoAsignacion === "ACTIVA" ||
      estadoAsignacion === "ACTIVO";

    if (!asignacionActiva) {
      throw new Error("La asignación seleccionada no está activa.");
    }

    if (tipoHorario !== "TALLER" && tipoHorario !== "EDUCACION_FISICA") {
      throw new Error(
        "Solo se pueden registrar reemplazos de Taller o Educación Física.",
      );
    }

    if (normalizarCorreo(asignacion.docenteCorreo) !== titularCorreo) {
      throw new Error(
        "La asignación seleccionada no pertenece al docente titular.",
      );
    }

    const haySuperposicion = consultaReemplazos.docs.some((documento) => {
      const reemplazo = documento.data();

      const mismoEstado =
        String(reemplazo.estado || "")
          .trim()
          .toUpperCase() === "ACTIVO";

      const mismaAsignacion =
        String(reemplazo.asignacionTitularId || "").trim() ===
        asignacionTitularId;

      if (!mismoEstado || !mismaAsignacion) {
        return false;
      }

      const desdeExistente = String(reemplazo.fechaDesde || "").trim();

      const hastaExistente = String(reemplazo.fechaHasta || "").trim();

      if (!desdeExistente || !hastaExistente) {
        return false;
      }

      return fechaDesde <= hastaExistente && fechaHasta >= desdeExistente;
    });

    if (haySuperposicion) {
      throw new Error(
        "Ya existe un reemplazo activo que se superpone con esas fechas para la misma asignación.",
      );
    }

    const datosReemplazo = {
      asignacionTitularId,

      titularCorreo,
      titularNombre: asignacion.docenteNombre || titularCorreo,

      reemplazanteCorreo,
      reemplazanteNombre: reemplazante.nombreCompleto || reemplazanteCorreo,

      cursoId: asignacion.cursoId || "",

      cursoNombre: asignacion.cursoNombre || "",

      cursoAnio: Number(asignacion.cursoAnio || 0),

      cursoDivision: asignacion.cursoDivision || "",

      espacioId: asignacion.espacioId || "",

      espacioNombre: asignacion.espacioNombre || "",

      tipoHorario,

      cicloLectivo: Number(asignacion.cicloLectivo || 0),

      fechaDesde,
      fechaHasta,

      estado: "ACTIVO",

      creadoEn: serverTimestamp(),
      creadoPor: normalizarCorreo(usuarioActual.email),

      actualizadoEn: serverTimestamp(),
      actualizadoPor: normalizarCorreo(usuarioActual.email),
    };

    await addDoc(collection(db, "reemplazos_docentes"), datosReemplazo);

    mostrarMensajeReemplazo("Reemplazo registrado correctamente.", "ok");

    reemplazoAsignacion.value = "";
    reemplazoDocente.value = "";
    reemplazoFechaDesde.value = "";
    reemplazoFechaHasta.value = "";
  } catch (error) {
    console.error("Error al registrar reemplazo docente:", error);

    mostrarMensajeReemplazo(
      error.message || "No se pudo registrar el reemplazo.",
      "error",
    );
  } finally {
    if (btnRegistrarReemplazo) {
      btnRegistrarReemplazo.disabled = false;
    }
  }
}

if (formReemplazoDocente) {
  formReemplazoDocente.addEventListener("submit", registrarReemplazoDocente);
}

function formatearFechaReemplazo(fecha) {
  const valor = String(fecha || "").trim();

  if (!valor) return "-";

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerEstadoVisualReemplazo(reemplazo) {
  const estado = String(reemplazo.estado || "")
    .trim()
    .toUpperCase();

  if (estado !== "ACTIVO") {
    return "INACTIVO";
  }

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  const fechaHoy = `${anio}-${mes}-${dia}`;

  if (fechaHoy < reemplazo.fechaDesde) {
    return "FUTURO";
  }

  if (fechaHoy > reemplazo.fechaHasta) {
    return "FINALIZADO";
  }

  return "VIGENTE";
}

async function desactivarReemplazo(idReemplazo) {
  const id = String(idReemplazo || "").trim();

  if (!id) return;

  const resultado = await Swal.fire({
    icon: "warning",
    title: "¿Finalizar reemplazo?",
    text: "El reemplazo quedará inactivo desde este momento.",
    showCancelButton: true,
    confirmButtonText: "Sí, finalizar",
    cancelButtonText: "Cancelar",
  });

  if (!resultado.isConfirmed) {
    return;
  }

  const usuarioActual = auth.currentUser;

  if (!usuarioActual) {
    Swal.fire({
      icon: "error",
      title: "Sesión no válida",
      text: "No se pudo validar la sesión actual.",
    });

    return;
  }

  try {
    await updateDoc(doc(db, "reemplazos_docentes", id), {
      estado: "INACTIVO",
      actualizadoEn: serverTimestamp(),
      actualizadoPor: normalizarCorreo(usuarioActual.email),
      finalizadoEn: serverTimestamp(),
      finalizadoPor: normalizarCorreo(usuarioActual.email),
    });

    await Swal.fire({
      icon: "success",
      title: "Reemplazo finalizado",
      text: "El reemplazo fue desactivado correctamente.",
      confirmButtonText: "Aceptar",
    });

    await cargarReemplazosRegistrados();
  } catch (error) {
    console.error("Error al finalizar reemplazo:", error);

    Swal.fire({
      icon: "error",
      title: "No se pudo finalizar",
      text: error.message || "No se pudo desactivar el reemplazo.",
    });
  }
}

async function cargarReemplazosRegistrados() {
  if (!cuerpoTablaReemplazos) return;

  cuerpoTablaReemplazos.innerHTML = `
    <tr>
      <td colspan="8" class="tabla-vacia">
        Cargando reemplazos...
      </td>
    </tr>
  `;

  if (mensajeReemplazos) {
    mensajeReemplazos.textContent = "";
  }

  try {
    const consulta = await getDocs(collection(db, "reemplazos_docentes"));

    const reemplazos = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) =>
        String(b.fechaDesde || "").localeCompare(String(a.fechaDesde || "")),
      );

    if (!reemplazos.length) {
      cuerpoTablaReemplazos.innerHTML = `
        <tr>
          <td colspan="8" class="tabla-vacia">
            No hay reemplazos registrados.
          </td>
        </tr>
      `;

      return;
    }

    cuerpoTablaReemplazos.innerHTML = "";

    reemplazos.forEach((reemplazo) => {
      const fila = document.createElement("tr");

      const estadoVisual = obtenerEstadoVisualReemplazo(reemplazo);

      fila.innerHTML = `
        <td>${reemplazo.titularNombre || reemplazo.titularCorreo || "-"}</td>

        <td>${
          reemplazo.reemplazanteNombre || reemplazo.reemplazanteCorreo || "-"
        }</td>

        <td>${reemplazo.cursoNombre || "-"}</td>

        <td>${reemplazo.espacioNombre || "-"}</td>

        <td>${formatearFechaReemplazo(reemplazo.fechaDesde)}</td>

        <td>${formatearFechaReemplazo(reemplazo.fechaHasta)}</td>

        <td>${estadoVisual}</td>

<td>
  ${
    String(reemplazo.estado || "")
      .trim()
      .toUpperCase() === "ACTIVO"
      ? `
        <button
          type="button"
          class="btn-accion btn-finalizar-reemplazo"
          data-id="${reemplazo.id}"
        >
          Finalizar
        </button>
      `
      : "-"
  }
</td>
      `;

      cuerpoTablaReemplazos.appendChild(fila);
    });

    cuerpoTablaReemplazos
      .querySelectorAll(".btn-finalizar-reemplazo")
      .forEach((boton) => {
        boton.addEventListener("click", () => {
          desactivarReemplazo(boton.dataset.id);
        });
      });

    if (mensajeReemplazos) {
      mensajeReemplazos.textContent = `${reemplazos.length} reemplazo(s) registrado(s).`;
    }
  } catch (error) {
    console.error("Error al cargar reemplazos registrados:", error);

    cuerpoTablaReemplazos.innerHTML = `
      <tr>
        <td colspan="8" class="tabla-vacia">
          No se pudieron cargar los reemplazos.
        </td>
      </tr>
    `;

    if (mensajeReemplazos) {
      mensajeReemplazos.textContent = "No se pudieron cargar los reemplazos.";
    }
  }
}

if (btnVerReemplazos) {
  btnVerReemplazos.addEventListener("click", cargarReemplazosRegistrados);
}

cargarDocentesReemplazos();
