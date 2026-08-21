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
  updateDoc,
  addDoc,
  query,
  where,
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

const tarjetaReemplazosDocentesGestion = document.getElementById(
  "tarjetaReemplazosDocentesGestion",
);

const seccionReemplazosDocentesGestion = document.getElementById(
  "reemplazos-docentes-gestion",
);

const panelRegistroReemplazoGestion = document.getElementById(
  "panelRegistroReemplazoGestion",
);

const btnVerReemplazosGestion = document.getElementById(
  "btnVerReemplazosGestion",
);

const cuerpoTablaReemplazosGestion = document.getElementById(
  "cuerpoTablaReemplazosGestion",
);

const mensajeReemplazosGestion = document.getElementById(
  "mensajeReemplazosGestion",
);

const reemplazoTitularGestion = document.getElementById(
  "reemplazoTitularGestion",
);

const reemplazoAsignacionGestion = document.getElementById(
  "reemplazoAsignacionGestion",
);

const reemplazoDocenteGestion = document.getElementById(
  "reemplazoDocenteGestion",
);

const formReemplazoDocenteGestion = document.getElementById(
  "formReemplazoDocenteGestion",
);

const reemplazoFechaDesdeGestion = document.getElementById(
  "reemplazoFechaDesdeGestion",
);

const reemplazoFechaHastaGestion = document.getElementById(
  "reemplazoFechaHastaGestion",
);

const btnRegistrarReemplazoGestion = document.getElementById(
  "btnRegistrarReemplazoGestion",
);

const mensajeReemplazoDocenteGestion = document.getElementById(
  "mensajeReemplazoDocenteGestion",
);

let opcionesReemplazosGestionCargadas = false;

function normalizarCorreoGestion(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function limpiarSelectGestion(select, texto) {
  if (!select) return;

  select.innerHTML = "";

  const opcion = document.createElement("option");
  opcion.value = "";
  opcion.textContent = texto;

  select.appendChild(opcion);
}

function agregarOpcionGestion(select, valor, texto) {
  if (!select) return;

  const opcion = document.createElement("option");
  opcion.value = valor;
  opcion.textContent = texto;

  select.appendChild(opcion);
}

function puedeAdministrarReemplazosGestion() {
  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  return ["DIRECCION", "SECRETARIA", "ASISTENTE_ADMINISTRATIVO"].includes(rol);
}

async function cargarDocentesReemplazosGestion() {
  if (
    !reemplazoTitularGestion ||
    !reemplazoDocenteGestion ||
    !puedeAdministrarReemplazosGestion()
  ) {
    return;
  }

  if (opcionesReemplazosGestionCargadas) {
    return;
  }

  limpiarSelectGestion(reemplazoTitularGestion, "Cargando docentes...");

  limpiarSelectGestion(reemplazoDocenteGestion, "Cargando docentes...");

  if (reemplazoAsignacionGestion) {
    reemplazoAsignacionGestion.disabled = true;

    limpiarSelectGestion(
      reemplazoAsignacionGestion,
      "Seleccioná primero un docente titular",
    );
  }

  try {
    const consultaRolDocente = query(
      collection(db, "usuarios"),
      where("estado", "==", "ACTIVO"),
      where("rol", "==", "DOCENTE"),
    );

    const consultaRolAdicionalDocente = query(
      collection(db, "usuarios"),
      where("estado", "==", "ACTIVO"),
      where("roles", "array-contains", "DOCENTE"),
    );

    const [
      resultadoRolDocente,
      resultadoRolAdicionalDocente,
      consultaAsignaciones,
    ] = await Promise.all([
      getDocs(consultaRolDocente),
      getDocs(consultaRolAdicionalDocente),
      getDocs(collection(db, "asignaciones_docentes")),
    ]);

    /*
     * Un mismo usuario podría aparecer en las dos consultas
     * si tiene DOCENTE como rol principal y también dentro
     * del array de roles. Lo unificamos por correo.
     */
    const docentesPorCorreo = new Map();

    [...resultadoRolDocente.docs, ...resultadoRolAdicionalDocente.docs].forEach(
      (documento) => {
        const docente = documento.data();
        const correo = normalizarCorreoGestion(docente.correo);

        if (!correo) return;

        docentesPorCorreo.set(correo, docente);
      },
    );

    const docentes = Array.from(docentesPorCorreo.values()).sort((a, b) =>
      String(a.nombreCompleto || "").localeCompare(
        String(b.nombreCompleto || ""),
        "es",
      ),
    );

    /*
     * Para el selector de TITULAR solamente deben aparecer
     * docentes que tengan una asignación activa de Taller
     * o Educación Física.
     */
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
        const correo = normalizarCorreoGestion(asignacion.docenteCorreo);

        if (correo) {
          correosTitularesPermitidos.add(correo);
        }
      }
    });

    const docentesTitulares = docentes.filter((docente) =>
      correosTitularesPermitidos.has(normalizarCorreoGestion(docente.correo)),
    );

    if (!docentesTitulares.length) {
      limpiarSelectGestion(
        reemplazoTitularGestion,
        "No hay docentes con Taller o Educación Física",
      );
    } else {
      limpiarSelectGestion(
        reemplazoTitularGestion,
        "Seleccionar docente titular",
      );

      docentesTitulares.forEach((docente) => {
        const correo = normalizarCorreoGestion(docente.correo);

        agregarOpcionGestion(
          reemplazoTitularGestion,
          correo,
          `${docente.nombreCompleto || correo} — ${correo}`,
        );
      });
    }

    if (!docentes.length) {
      limpiarSelectGestion(
        reemplazoDocenteGestion,
        "No hay docentes activos registrados",
      );
    } else {
      limpiarSelectGestion(
        reemplazoDocenteGestion,
        "Seleccionar docente reemplazante",
      );

      docentes.forEach((docente) => {
        const correo = normalizarCorreoGestion(docente.correo);

        agregarOpcionGestion(
          reemplazoDocenteGestion,
          correo,
          `${docente.nombreCompleto || correo} — ${correo}`,
        );
      });
    }

    opcionesReemplazosGestionCargadas = true;
  } catch (error) {
    console.error(
      "Error al cargar docentes para reemplazos en Gestión:",
      error,
    );

    limpiarSelectGestion(
      reemplazoTitularGestion,
      "No se pudieron cargar los docentes",
    );

    limpiarSelectGestion(
      reemplazoDocenteGestion,
      "No se pudieron cargar los docentes",
    );
  }
}

async function cargarAsignacionesTitularGestion() {
  if (!reemplazoTitularGestion || !reemplazoAsignacionGestion) {
    return;
  }

  const titularCorreo = normalizarCorreoGestion(reemplazoTitularGestion.value);

  reemplazoAsignacionGestion.disabled = true;

  limpiarSelectGestion(
    reemplazoAsignacionGestion,
    "Seleccioná primero un docente titular",
  );

  if (!titularCorreo) {
    return;
  }

  limpiarSelectGestion(reemplazoAsignacionGestion, "Buscando asignaciones...");

  try {
    const consulta = await getDocs(collection(db, "asignaciones_docentes"));

    const asignaciones = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((asignacion) => {
        const correo = normalizarCorreoGestion(asignacion.docenteCorreo);

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
      limpiarSelectGestion(
        reemplazoAsignacionGestion,
        "El docente no tiene asignaciones de Taller o Educación Física",
      );

      return;
    }

    limpiarSelectGestion(reemplazoAsignacionGestion, "Seleccionar asignación");

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

      agregarOpcionGestion(reemplazoAsignacionGestion, asignacion.id, texto);
    });

    reemplazoAsignacionGestion.disabled = false;
  } catch (error) {
    console.error(
      "Error al cargar asignaciones del docente titular en Gestión:",
      error,
    );

    limpiarSelectGestion(
      reemplazoAsignacionGestion,
      "No se pudieron cargar las asignaciones",
    );
  }
}

function mostrarMensajeReemplazoGestion(texto = "", tipo = "") {
  if (!mensajeReemplazoDocenteGestion) return;

  mensajeReemplazoDocenteGestion.textContent = texto;

  mensajeReemplazoDocenteGestion.classList.remove(
    "mensaje-ok",
    "mensaje-error",
  );

  if (tipo === "ok") {
    mensajeReemplazoDocenteGestion.classList.add("mensaje-ok");
  }

  if (tipo === "error") {
    mensajeReemplazoDocenteGestion.classList.add("mensaje-error");
  }
}

async function registrarReemplazoDocenteGestion(evento) {
  evento.preventDefault();

  if (!puedeAdministrarReemplazosGestion()) {
    mostrarMensajeReemplazoGestion(
      "No tenés permisos para registrar reemplazos.",
      "error",
    );

    return;
  }

  if (
    !formReemplazoDocenteGestion ||
    !reemplazoTitularGestion ||
    !reemplazoAsignacionGestion ||
    !reemplazoDocenteGestion ||
    !reemplazoFechaDesdeGestion ||
    !reemplazoFechaHastaGestion
  ) {
    return;
  }

  const usuarioActual = auth.currentUser;

  if (!usuarioActual) {
    mostrarMensajeReemplazoGestion(
      "No se pudo validar la sesión actual.",
      "error",
    );

    return;
  }

  const titularCorreo = normalizarCorreoGestion(reemplazoTitularGestion.value);

  const asignacionTitularId = String(
    reemplazoAsignacionGestion.value || "",
  ).trim();

  const reemplazanteCorreo = normalizarCorreoGestion(
    reemplazoDocenteGestion.value,
  );

  const fechaDesde = String(reemplazoFechaDesdeGestion.value || "").trim();

  const fechaHasta = String(reemplazoFechaHastaGestion.value || "").trim();

  if (
    !titularCorreo ||
    !asignacionTitularId ||
    !reemplazanteCorreo ||
    !fechaDesde ||
    !fechaHasta
  ) {
    mostrarMensajeReemplazoGestion(
      "Completá todos los campos obligatorios.",
      "error",
    );

    return;
  }

  if (titularCorreo === reemplazanteCorreo) {
    mostrarMensajeReemplazoGestion(
      "El docente titular y el reemplazante no pueden ser la misma persona.",
      "error",
    );

    return;
  }

  if (fechaHasta < fechaDesde) {
    mostrarMensajeReemplazoGestion(
      "La fecha hasta no puede ser anterior a la fecha desde.",
      "error",
    );

    return;
  }

  if (btnRegistrarReemplazoGestion) {
    btnRegistrarReemplazoGestion.disabled = true;
  }

  mostrarMensajeReemplazoGestion("Validando reemplazo...");

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

    if (normalizarCorreoGestion(asignacion.docenteCorreo) !== titularCorreo) {
      throw new Error(
        "La asignación seleccionada no pertenece al docente titular.",
      );
    }

    /*
     * Evitamos dos reemplazos activos superpuestos
     * para la misma asignación.
     */
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
      creadoPor: normalizarCorreoGestion(usuarioActual.email),

      actualizadoEn: serverTimestamp(),
      actualizadoPor: normalizarCorreoGestion(usuarioActual.email),
    };

    await addDoc(collection(db, "reemplazos_docentes"), datosReemplazo);

    mostrarMensajeReemplazoGestion("Reemplazo registrado correctamente.", "ok");

    /*
     * Conservamos el titular seleccionado,
     * igual que en ADMIN, pero limpiamos los
     * datos específicos del reemplazo.
     */
    reemplazoAsignacionGestion.value = "";
    reemplazoDocenteGestion.value = "";
    reemplazoFechaDesdeGestion.value = "";
    reemplazoFechaHastaGestion.value = "";

    /*
     * Actualizamos inmediatamente la tabla.
     */
    await cargarReemplazosGestion();
  } catch (error) {
    console.error("Error al registrar reemplazo docente en Gestión:", error);

    mostrarMensajeReemplazoGestion(
      error.message || "No se pudo registrar el reemplazo.",
      "error",
    );
  } finally {
    if (btnRegistrarReemplazoGestion) {
      btnRegistrarReemplazoGestion.disabled = false;
    }
  }
}

if (formReemplazoDocenteGestion) {
  formReemplazoDocenteGestion.addEventListener(
    "submit",
    registrarReemplazoDocenteGestion,
  );
}

if (reemplazoTitularGestion) {
  reemplazoTitularGestion.addEventListener(
    "change",
    cargarAsignacionesTitularGestion,
  );
}

function configurarAccesoReemplazosDocentesGestion() {
  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  const rolesConsulta = new Set([
    "DIRECCION",
    "SECRETARIA",
    "ASISTENTE_ADMINISTRATIVO",
    "PRECEPTORIA",
  ]);

  const rolesAdministracion = new Set([
    "DIRECCION",
    "SECRETARIA",
    "ASISTENTE_ADMINISTRATIVO",
  ]);

  const puedeConsultar = rolesConsulta.has(rol);
  const puedeAdministrar = rolesAdministracion.has(rol);

  if (tarjetaReemplazosDocentesGestion) {
    tarjetaReemplazosDocentesGestion.hidden = !puedeConsultar;
  }

  if (seccionReemplazosDocentesGestion) {
    seccionReemplazosDocentesGestion.hidden = !puedeConsultar;
  }

  if (panelRegistroReemplazoGestion) {
    panelRegistroReemplazoGestion.style.display = puedeAdministrar
      ? ""
      : "none";
  }
}

function formatearFechaReemplazoGestion(fecha) {
  const valor = String(fecha || "").trim();

  if (!valor) return "-";

  const partes = valor.split("-");

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerEstadoVisualReemplazoGestion(reemplazo) {
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

async function finalizarReemplazoGestion(idReemplazo) {
  const id = String(idReemplazo || "").trim();

  if (!id) return;

  if (!puedeAdministrarReemplazosGestion()) {
    return;
  }

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
    await Swal.fire({
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
      actualizadoPor: normalizarCorreoGestion(usuarioActual.email),

      finalizadoEn: serverTimestamp(),
      finalizadoPor: normalizarCorreoGestion(usuarioActual.email),
    });

    await Swal.fire({
      icon: "success",
      title: "Reemplazo finalizado",
      text: "El reemplazo fue desactivado correctamente.",
      confirmButtonText: "Aceptar",
    });

    await cargarReemplazosGestion();
  } catch (error) {
    console.error("Error al finalizar reemplazo en Gestión:", error);

    await Swal.fire({
      icon: "error",
      title: "No se pudo finalizar",
      text: error.message || "No se pudo desactivar el reemplazo.",
    });
  }
}

async function cargarReemplazosGestion() {
  if (!cuerpoTablaReemplazosGestion) return;

  cuerpoTablaReemplazosGestion.innerHTML = `
    <tr>
      <td colspan="7" class="tabla-vacia">
        Cargando reemplazos...
      </td>
    </tr>
  `;

  if (mensajeReemplazosGestion) {
    mensajeReemplazosGestion.textContent = "";
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
      cuerpoTablaReemplazosGestion.innerHTML = `
        <tr>
          <td colspan="7" class="tabla-vacia">
            No hay reemplazos registrados.
          </td>
        </tr>
      `;

      return;
    }

    cuerpoTablaReemplazosGestion.innerHTML = "";

    reemplazos.forEach((reemplazo) => {
      const fila = document.createElement("tr");

      const estadoVisual = obtenerEstadoVisualReemplazoGestion(reemplazo);

      const cursoEspacio =
        `${reemplazo.cursoNombre || "-"} — ` +
        `${reemplazo.espacioNombre || "-"}`;

      fila.innerHTML = `
        <td>
          ${reemplazo.titularNombre || reemplazo.titularCorreo || "-"}
        </td>

        <td>
          ${reemplazo.reemplazanteNombre || reemplazo.reemplazanteCorreo || "-"}
        </td>

        <td>${cursoEspacio}</td>

        <td>
          ${formatearFechaReemplazoGestion(reemplazo.fechaDesde)}
        </td>

        <td>
          ${formatearFechaReemplazoGestion(reemplazo.fechaHasta)}
        </td>

        <td>${estadoVisual}</td>

<td>
  ${
    puedeAdministrarReemplazosGestion() &&
    (estadoVisual === "FUTURO" || estadoVisual === "VIGENTE")
      ? `
        <button
          type="button"
          class="btn-accion btn-finalizar-reemplazo-gestion"
          data-id="${reemplazo.id}"
        >
          Finalizar
        </button>
      `
      : "-"
  }
</td>
      `;

      cuerpoTablaReemplazosGestion.appendChild(fila);
    });

    cuerpoTablaReemplazosGestion
      .querySelectorAll(".btn-finalizar-reemplazo-gestion")
      .forEach((boton) => {
        boton.addEventListener("click", () => {
          finalizarReemplazoGestion(boton.dataset.id);
        });
      });

    if (mensajeReemplazosGestion) {
      mensajeReemplazosGestion.textContent = `${reemplazos.length} reemplazo(s) registrado(s).`;
    }
  } catch (error) {
    console.error("Error al cargar reemplazos en Gestión:", error);

    cuerpoTablaReemplazosGestion.innerHTML = `
      <tr>
        <td colspan="7" class="tabla-vacia">
          No se pudieron cargar los reemplazos.
        </td>
      </tr>
    `;

    if (mensajeReemplazosGestion) {
      mensajeReemplazosGestion.textContent =
        "No se pudieron cargar los reemplazos.";
    }
  }
}

if (btnVerReemplazosGestion) {
  btnVerReemplazosGestion.addEventListener("click", cargarReemplazosGestion);
}

async function inicializarReemplazosDocentesGestion() {
  configurarAccesoReemplazosDocentesGestion();

  if (puedeAdministrarReemplazosGestion()) {
    await cargarDocentesReemplazosGestion();
  }
}

window.addEventListener(
  "portalUsuarioListo",
  inicializarReemplazosDocentesGestion,
);

if (window.portalUsuario) {
  inicializarReemplazosDocentesGestion();
}
