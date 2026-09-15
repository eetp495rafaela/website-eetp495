import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
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

const btnPrepararCambioCicloAdmin = document.getElementById(
  "btnPrepararCambioCicloAdmin",
);
const cursoOrigenCambioCicloAdmin = document.getElementById(
  "cursoOrigenCambioCicloAdmin",
);
const btnCargarEstudiantesCambioCicloAdmin = document.getElementById(
  "btnCargarEstudiantesCambioCicloAdmin",
);
const herramientasCambioCicloAdmin = document.getElementById(
  "herramientasCambioCicloAdmin",
);
const destinoMasivoCambioCicloAdmin = document.getElementById(
  "destinoMasivoCambioCicloAdmin",
);
const btnAsignarDestinoCambioCicloAdmin = document.getElementById(
  "btnAsignarDestinoCambioCicloAdmin",
);
const btnConfirmarCambioCicloAdmin = document.getElementById(
  "btnConfirmarCambioCicloAdmin",
);
const seleccionarTodosCambioCicloAdmin = document.getElementById(
  "seleccionarTodosCambioCicloAdmin",
);
const cuerpoCambioCicloAdmin = document.getElementById(
  "cuerpoCambioCicloAdmin",
);
const mensajeCambioCicloAdmin = document.getElementById(
  "mensajeCambioCicloAdmin",
);

const btnVerCursadaCompletaAdmin = document.getElementById(
  "btnVerCursadaCompletaAdmin",
);
const seleccionarTodosCursadaCompletaAdmin = document.getElementById(
  "seleccionarTodosCursadaCompletaAdmin",
);
const cuerpoCursadaCompletaAdmin = document.getElementById(
  "cuerpoCursadaCompletaAdmin",
);
const btnMarcarEgresadosAdmin = document.getElementById(
  "btnMarcarEgresadosAdmin",
);
const mensajeCursadaCompletaAdmin = document.getElementById(
  "mensajeCursadaCompletaAdmin",
);

let usuarioActual = null;
let cursosActivos = [];
let estudiantesCursoActual = [];
let estudiantesCursadaCompleta = [];

function normalizarCorreo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensaje(elemento, texto = "", tipo = "") {
  if (!elemento) return;

  elemento.textContent = texto;
  elemento.className = "mensaje-formulario";

  if (tipo) {
    elemento.classList.add(tipo);
  }
}

function nombreCurso(curso) {
  if (!curso) return "Sin curso";

  return (
    String(curso.nombre || "").trim() ||
    `${Number(curso.anio || 0)}º ${String(curso.division || "").trim()}`.trim()
  );
}

function ordenarCursos(a, b) {
  const diferenciaAnio = Number(a.anio || 0) - Number(b.anio || 0);

  if (diferenciaAnio !== 0) {
    return diferenciaAnio;
  }

  return String(a.division || "").localeCompare(
    String(b.division || ""),
    "es",
    { sensitivity: "base" },
  );
}

function obtenerCursoPorId(cursoId) {
  return cursosActivos.find((curso) => curso.id === cursoId) || null;
}

function opcionesDestinoHtml(cursoOrigen) {
  if (!cursoOrigen) {
    return '<option value="">Seleccionar destino</option>';
  }

  const anioOrigen = Number(cursoOrigen.anio || 0);

  if (anioOrigen === 6) {
    return `
      <option value="">Seleccionar destino</option>
      <option value="__CURSADA_COMPLETA__">Cursada Completa</option>
    `;
  }

  const cursosPermitidos = cursosActivos.filter((curso) => {
    const anioDestino = Number(curso.anio || 0);

    return anioDestino === anioOrigen || anioDestino === anioOrigen + 1;
  });

  return `
    <option value="">Seleccionar destino</option>
    ${cursosPermitidos
      .map(
        (curso) => `
          <option value="${escaparHtml(curso.id)}">
            ${escaparHtml(nombreCurso(curso))}
          </option>
        `,
      )
      .join("")}
  `;
}

function obtenerMovimiento(cursoOrigen, valorDestino) {
  if (!cursoOrigen || !valorDestino) {
    return {
      texto: "Sin definir",
      clase: "",
    };
  }

  const anioOrigen = Number(cursoOrigen.anio || 0);

  if (anioOrigen === 6 && valorDestino === "__CURSADA_COMPLETA__") {
    return {
      texto: "CURSADA COMPLETA",
      clase: "cursada-completa",
    };
  }

  const cursoDestino = obtenerCursoPorId(valorDestino);

  if (!cursoDestino) {
    return {
      texto: "Destino inválido",
      clase: "",
    };
  }

  const anioDestino = Number(cursoDestino.anio || 0);

  if (anioDestino === anioOrigen) {
    return {
      texto: "REPITENCIA",
      clase: "repitencia",
    };
  }

  if (anioDestino === anioOrigen + 1) {
    return {
      texto: "PROMOCIÓN",
      clase: "promocion",
    };
  }

  return {
    texto: "Destino inválido",
    clase: "",
  };
}

function esDestinoValido(cursoOrigen, valorDestino) {
  if (!cursoOrigen || !valorDestino) return false;

  const anioOrigen = Number(cursoOrigen.anio || 0);

  if (anioOrigen === 6) {
    return valorDestino === "__CURSADA_COMPLETA__";
  }

  const cursoDestino = obtenerCursoPorId(valorDestino);

  if (!cursoDestino) return false;

  const anioDestino = Number(cursoDestino.anio || 0);

  return anioDestino === anioOrigen || anioDestino === anioOrigen + 1;
}

function actualizarBotonConfirmarCambioCiclo() {
  if (!btnConfirmarCambioCicloAdmin || !cuerpoCambioCicloAdmin) return;

  const hayMovimientos = Array.from(
    cuerpoCambioCicloAdmin.querySelectorAll("[data-destino-estudiante]"),
  ).some((selector) => {
    const cursoOrigen = obtenerCursoPorId(cursoOrigenCambioCicloAdmin?.value);
    return esDestinoValido(cursoOrigen, selector.value);
  });

  btnConfirmarCambioCicloAdmin.disabled = !hayMovimientos;
}

function actualizarMovimientoFila(fila) {
  if (!fila) return;

  const selectorDestino = fila.querySelector("[data-destino-estudiante]");
  const celdaMovimiento = fila.querySelector("[data-movimiento-estudiante]");

  if (!selectorDestino || !celdaMovimiento) return;

  const cursoOrigen = obtenerCursoPorId(cursoOrigenCambioCicloAdmin?.value);
  const movimiento = obtenerMovimiento(cursoOrigen, selectorDestino.value);

  if (!selectorDestino.value) {
    celdaMovimiento.innerHTML =
      '<span class="texto-secundario">Sin definir</span>';
  } else {
    celdaMovimiento.innerHTML = `
      <span class="movimiento-cambio-ciclo ${escaparHtml(movimiento.clase)}">
        ${escaparHtml(movimiento.texto)}
      </span>
    `;
  }

  actualizarBotonConfirmarCambioCiclo();
}

async function cargarCursosCambioCiclo() {
  if (!btnPrepararCambioCicloAdmin || !cursoOrigenCambioCicloAdmin) return;

  btnPrepararCambioCicloAdmin.disabled = true;
  btnPrepararCambioCicloAdmin.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Cargando cursos...
  `;

  mostrarMensaje(mensajeCambioCicloAdmin, "");

  try {
    const resultado = await getDocs(
      query(collection(db, "cursos"), where("estado", "==", "ACTIVO")),
    );

    cursosActivos = resultado.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort(ordenarCursos);

    if (!cursosActivos.length) {
      throw new Error("No hay cursos activos registrados.");
    }

    cursoOrigenCambioCicloAdmin.innerHTML = `
      <option value="">Seleccionar curso actual</option>
      ${cursosActivos
        .map(
          (curso) => `
            <option value="${escaparHtml(curso.id)}">
              ${escaparHtml(nombreCurso(curso))}
            </option>
          `,
        )
        .join("")}
    `;

    cursoOrigenCambioCicloAdmin.disabled = false;
    btnCargarEstudiantesCambioCicloAdmin.disabled = false;

    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "Cursos cargados. Seleccioná el curso actual y luego cargá sus estudiantes.",
      "ok",
    );
  } catch (error) {
    console.error("Error al preparar el cambio de ciclo:", error);

    cursoOrigenCambioCicloAdmin.innerHTML = `
      <option value="">No se pudieron cargar los cursos</option>
    `;
    cursoOrigenCambioCicloAdmin.disabled = true;
    btnCargarEstudiantesCambioCicloAdmin.disabled = true;

    mostrarMensaje(
      mensajeCambioCicloAdmin,
      error?.message || "No se pudieron cargar los cursos.",
      "error",
    );
  } finally {
    btnPrepararCambioCicloAdmin.disabled = false;
    btnPrepararCambioCicloAdmin.innerHTML = `
      <i class="fa-solid fa-arrows-rotate"></i>
      Preparar cambio de ciclo
    `;
  }
}

function renderizarEstudiantesCambioCiclo() {
  if (!cuerpoCambioCicloAdmin) return;

  const cursoOrigen = obtenerCursoPorId(cursoOrigenCambioCicloAdmin?.value);

  if (!cursoOrigen) {
    cuerpoCambioCicloAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          Seleccioná un curso actual.
        </td>
      </tr>
    `;
    return;
  }

  if (!estudiantesCursoActual.length) {
    cuerpoCambioCicloAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          No hay estudiantes activos cursando en ${escaparHtml(nombreCurso(cursoOrigen))}.
        </td>
      </tr>
    `;

    if (herramientasCambioCicloAdmin) {
      herramientasCambioCicloAdmin.hidden = true;
    }

    if (seleccionarTodosCambioCicloAdmin) {
      seleccionarTodosCambioCicloAdmin.checked = false;
      seleccionarTodosCambioCicloAdmin.disabled = true;
    }

    if (btnConfirmarCambioCicloAdmin) {
      btnConfirmarCambioCicloAdmin.disabled = true;
    }

    return;
  }

  const opciones = opcionesDestinoHtml(cursoOrigen);

  cuerpoCambioCicloAdmin.innerHTML = estudiantesCursoActual
    .map(
      (estudiante) => `
        <tr data-estudiante-id="${escaparHtml(estudiante.id)}">
          <td>
            <input
              type="checkbox"
              data-check-estudiante-ciclo
              aria-label="Seleccionar ${escaparHtml(
                estudiante.nombreCompleto || estudiante.correo || estudiante.id,
              )}"
            />
          </td>
          <td>
            <strong>${escaparHtml(
              estudiante.nombreCompleto || "Estudiante sin nombre",
            )}</strong>
            <br />
            <small>${escaparHtml(estudiante.correo || estudiante.id)}</small>
          </td>
          <td>${escaparHtml(nombreCurso(cursoOrigen))}</td>
          <td>
            <select data-destino-estudiante>
              ${opciones}
            </select>
          </td>
          <td data-movimiento-estudiante>
            <span class="texto-secundario">Sin definir</span>
          </td>
        </tr>
      `,
    )
    .join("");

  cuerpoCambioCicloAdmin
    .querySelectorAll("[data-destino-estudiante]")
    .forEach((selector) => {
      selector.addEventListener("change", () => {
        actualizarMovimientoFila(selector.closest("tr"));
      });
    });

  cuerpoCambioCicloAdmin
    .querySelectorAll("[data-check-estudiante-ciclo]")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const checks = Array.from(
          cuerpoCambioCicloAdmin.querySelectorAll(
            "[data-check-estudiante-ciclo]",
          ),
        );

        if (seleccionarTodosCambioCicloAdmin) {
          seleccionarTodosCambioCicloAdmin.checked =
            checks.length > 0 && checks.every((item) => item.checked);
          seleccionarTodosCambioCicloAdmin.indeterminate =
            checks.some((item) => item.checked) &&
            !checks.every((item) => item.checked);
        }
      });
    });

  if (destinoMasivoCambioCicloAdmin) {
    destinoMasivoCambioCicloAdmin.innerHTML = opciones;
  }

  if (herramientasCambioCicloAdmin) {
    herramientasCambioCicloAdmin.hidden = false;
  }

  if (seleccionarTodosCambioCicloAdmin) {
    seleccionarTodosCambioCicloAdmin.checked = false;
    seleccionarTodosCambioCicloAdmin.indeterminate = false;
    seleccionarTodosCambioCicloAdmin.disabled = false;
  }

  actualizarBotonConfirmarCambioCiclo();
}

async function cargarEstudiantesCambioCiclo() {
  const cursoId = String(cursoOrigenCambioCicloAdmin?.value || "").trim();

  if (!cursoId) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "Seleccioná el curso actual.",
      "error",
    );
    return;
  }

  const cursoOrigen = obtenerCursoPorId(cursoId);

  if (!cursoOrigen) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "No se pudo identificar el curso seleccionado.",
      "error",
    );
    return;
  }

  btnCargarEstudiantesCambioCicloAdmin.disabled = true;
  btnCargarEstudiantesCambioCicloAdmin.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Cargando...
  `;

  mostrarMensaje(mensajeCambioCicloAdmin, "");

  if (herramientasCambioCicloAdmin) {
    herramientasCambioCicloAdmin.hidden = true;
  }

  if (seleccionarTodosCambioCicloAdmin) {
    seleccionarTodosCambioCicloAdmin.checked = false;
    seleccionarTodosCambioCicloAdmin.disabled = true;
  }

  if (cuerpoCambioCicloAdmin) {
    cuerpoCambioCicloAdmin.innerHTML = `
      <tr>
        <td colspan="5" class="tabla-vacia">
          Cargando estudiantes...
        </td>
      </tr>
    `;
  }

  try {
    const resultado = await getDocs(
      query(
        collection(db, "usuarios"),
        where("rol", "==", "ALUMNO"),
        where("cursoId", "==", cursoId),
      ),
    );

    estudiantesCursoActual = resultado.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter(
        (estudiante) =>
          String(estudiante.estado || "").toUpperCase() === "ACTIVO" &&
          String(estudiante.tipoVinculo || "").toUpperCase() === "CURSANDO",
      )
      .sort((a, b) =>
        String(a.nombreCompleto || a.correo || a.id).localeCompare(
          String(b.nombreCompleto || b.correo || b.id),
          "es",
          { sensitivity: "base" },
        ),
      );

    renderizarEstudiantesCambioCiclo();

    mostrarMensaje(
      mensajeCambioCicloAdmin,
      estudiantesCursoActual.length
        ? `Se cargaron ${estudiantesCursoActual.length} estudiantes de ${nombreCurso(
            cursoOrigen,
          )}.`
        : `No hay estudiantes activos cursando en ${nombreCurso(cursoOrigen)}.`,
      estudiantesCursoActual.length ? "ok" : "",
    );
  } catch (error) {
    console.error("Error al cargar estudiantes para cambio de ciclo:", error);

    estudiantesCursoActual = [];

    if (cuerpoCambioCicloAdmin) {
      cuerpoCambioCicloAdmin.innerHTML = `
        <tr>
          <td colspan="5" class="tabla-vacia">
            No se pudieron cargar los estudiantes.
          </td>
        </tr>
      `;
    }

    mostrarMensaje(
      mensajeCambioCicloAdmin,
      error?.message || "No se pudieron cargar los estudiantes.",
      "error",
    );
  } finally {
    btnCargarEstudiantesCambioCicloAdmin.disabled = false;
    btnCargarEstudiantesCambioCicloAdmin.innerHTML = `
      <i class="fa-solid fa-users"></i>
      Cargar estudiantes
    `;
  }
}

function asignarDestinoASeleccionados() {
  const valorDestino = String(
    destinoMasivoCambioCicloAdmin?.value || "",
  ).trim();
  const cursoOrigen = obtenerCursoPorId(cursoOrigenCambioCicloAdmin?.value);

  if (!cursoOrigen || !esDestinoValido(cursoOrigen, valorDestino)) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "Seleccioná un destino válido.",
      "error",
    );
    return;
  }

  const filasSeleccionadas = Array.from(
    cuerpoCambioCicloAdmin?.querySelectorAll("tr[data-estudiante-id]") || [],
  ).filter(
    (fila) => fila.querySelector("[data-check-estudiante-ciclo]")?.checked,
  );

  if (!filasSeleccionadas.length) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "Seleccioná al menos un estudiante.",
      "error",
    );
    return;
  }

  filasSeleccionadas.forEach((fila) => {
    const selector = fila.querySelector("[data-destino-estudiante]");

    if (!selector) return;

    selector.value = valorDestino;
    actualizarMovimientoFila(fila);
  });

  mostrarMensaje(
    mensajeCambioCicloAdmin,
    `Destino asignado a ${filasSeleccionadas.length} ${
      filasSeleccionadas.length === 1 ? "estudiante" : "estudiantes"
    }.`,
    "ok",
  );
}

function obtenerMovimientosPreparados() {
  const cursoOrigen = obtenerCursoPorId(cursoOrigenCambioCicloAdmin?.value);

  if (!cursoOrigen || !cuerpoCambioCicloAdmin) return [];

  return Array.from(
    cuerpoCambioCicloAdmin.querySelectorAll("tr[data-estudiante-id]"),
  )
    .map((fila) => {
      const estudianteId = fila.dataset.estudianteId || "";
      const selector = fila.querySelector("[data-destino-estudiante]");
      const valorDestino = String(selector?.value || "").trim();

      if (!esDestinoValido(cursoOrigen, valorDestino)) {
        return null;
      }

      const estudiante = estudiantesCursoActual.find(
        (item) => item.id === estudianteId,
      );

      if (!estudiante) return null;

      const movimiento = obtenerMovimiento(cursoOrigen, valorDestino);
      const cursoDestino =
        valorDestino === "__CURSADA_COMPLETA__"
          ? null
          : obtenerCursoPorId(valorDestino);

      return {
        estudiante,
        cursoOrigen,
        cursoDestino,
        valorDestino,
        movimiento,
      };
    })
    .filter(Boolean);
}

async function confirmarConSweetAlert(configuracion) {
  if (window.Swal?.fire) {
    const resultado = await window.Swal.fire(configuracion);
    return Boolean(resultado.isConfirmed);
  }

  return window.confirm(
    String(configuracion?.text || configuracion?.title || "¿Confirmar?"),
  );
}

function resumenMovimientosHtml(movimientos) {
  const conteos = new Map();

  movimientos.forEach((item) => {
    const destino =
      item.valorDestino === "__CURSADA_COMPLETA__"
        ? "Cursada Completa"
        : nombreCurso(item.cursoDestino);

    const clave = `${item.movimiento.texto} → ${destino}`;
    conteos.set(clave, (conteos.get(clave) || 0) + 1);
  });

  return `
    <div style="text-align:left">
      <p>Se aplicarán <strong>${movimientos.length}</strong> cambios:</p>
      <ul>
        ${Array.from(conteos.entries())
          .map(
            ([etiqueta, cantidad]) =>
              `<li><strong>${escaparHtml(etiqueta)}:</strong> ${cantidad}</li>`,
          )
          .join("")}
      </ul>
      <p style="margin-top:12px">
        Esta operación actualizará la situación actual de los estudiantes.
      </p>
    </div>
  `;
}

async function confirmarCambioCiclo() {
  if (!usuarioActual) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "Esperando validación de la sesión.",
      "error",
    );
    return;
  }

  const movimientos = obtenerMovimientosPreparados();

  if (!movimientos.length) {
    mostrarMensaje(
      mensajeCambioCicloAdmin,
      "No hay cambios preparados para confirmar.",
      "error",
    );
    return;
  }

  const confirmado = await confirmarConSweetAlert({
    icon: "warning",
    title: "Confirmar cambio de ciclo",
    html: resumenMovimientosHtml(movimientos),
    showCancelButton: true,
    confirmButtonText: "Sí, confirmar cambios",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!confirmado) return;

  btnConfirmarCambioCicloAdmin.disabled = true;
  btnConfirmarCambioCicloAdmin.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Guardando...
  `;

  mostrarMensaje(mensajeCambioCicloAdmin, "Aplicando cambios...");

  try {
    if (movimientos.length > 450) {
      throw new Error(
        "La cantidad de estudiantes supera el máximo previsto para una operación.",
      );
    }

    const lote = writeBatch(db);
    const correoSoporte = normalizarCorreo(usuarioActual.email);

    movimientos.forEach((item) => {
      const referencia = doc(db, "usuarios", item.estudiante.id);

      if (item.valorDestino === "__CURSADA_COMPLETA__") {
        lote.update(referencia, {
          estado: "ACTIVO",
          tipoVinculo: "CURSADA_COMPLETA",
          actualizadoEn: serverTimestamp(),
          actualizadoPor: correoSoporte,
        });

        return;
      }

      lote.update(referencia, {
        estado: "ACTIVO",
        tipoVinculo: "CURSANDO",
        cursoId: item.cursoDestino.id,
        cursoAnio: Number(item.cursoDestino.anio),
        cursoDivision: String(item.cursoDestino.division || ""),
        cursoNombre: nombreCurso(item.cursoDestino),
        actualizadoEn: serverTimestamp(),
        actualizadoPor: correoSoporte,
      });
    });

    await lote.commit();

    await confirmarConSweetAlert({
      icon: "success",
      title: "Cambio de ciclo aplicado",
      text: `Se actualizaron ${movimientos.length} estudiantes correctamente.`,
      confirmButtonText: "Aceptar",
    });

    await cargarEstudiantesCambioCiclo();
  } catch (error) {
    console.error("Error al confirmar el cambio de ciclo:", error);

    mostrarMensaje(
      mensajeCambioCicloAdmin,
      error?.message || "No se pudieron aplicar los cambios.",
      "error",
    );
  } finally {
    btnConfirmarCambioCicloAdmin.innerHTML = `
      <i class="fa-solid fa-circle-check"></i>
      Confirmar cambios
    `;

    actualizarBotonConfirmarCambioCiclo();
  }
}

function renderizarCursadaCompleta() {
  if (!cuerpoCursadaCompletaAdmin) return;

  if (!estudiantesCursadaCompleta.length) {
    cuerpoCursadaCompletaAdmin.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          No hay estudiantes activos con Cursada Completa.
        </td>
      </tr>
    `;

    if (seleccionarTodosCursadaCompletaAdmin) {
      seleccionarTodosCursadaCompletaAdmin.checked = false;
      seleccionarTodosCursadaCompletaAdmin.disabled = true;
    }

    if (btnMarcarEgresadosAdmin) {
      btnMarcarEgresadosAdmin.disabled = true;
    }

    return;
  }

  cuerpoCursadaCompletaAdmin.innerHTML = estudiantesCursadaCompleta
    .map(
      (estudiante) => `
        <tr data-cursada-completa-id="${escaparHtml(estudiante.id)}">
          <td>
            <input
              type="checkbox"
              data-check-cursada-completa
              aria-label="Seleccionar ${escaparHtml(
                estudiante.nombreCompleto || estudiante.correo || estudiante.id,
              )}"
            />
          </td>
          <td>
            <strong>${escaparHtml(
              estudiante.nombreCompleto || "Estudiante sin nombre",
            )}</strong>
            <br />
            <small>${escaparHtml(estudiante.correo || estudiante.id)}</small>
          </td>
          <td>${escaparHtml(
            estudiante.cursoNombre ||
              `${estudiante.cursoAnio || ""}º ${estudiante.cursoDivision || ""}`.trim() ||
              "Sin curso",
          )}</td>
          <td>
            <span class="movimiento-cambio-ciclo cursada-completa">
              CURSADA COMPLETA
            </span>
          </td>
        </tr>
      `,
    )
    .join("");

  if (seleccionarTodosCursadaCompletaAdmin) {
    seleccionarTodosCursadaCompletaAdmin.checked = false;
    seleccionarTodosCursadaCompletaAdmin.indeterminate = false;
    seleccionarTodosCursadaCompletaAdmin.disabled = false;
  }

  cuerpoCursadaCompletaAdmin
    .querySelectorAll("[data-check-cursada-completa]")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const checks = Array.from(
          cuerpoCursadaCompletaAdmin.querySelectorAll(
            "[data-check-cursada-completa]",
          ),
        );

        if (seleccionarTodosCursadaCompletaAdmin) {
          seleccionarTodosCursadaCompletaAdmin.checked =
            checks.length > 0 && checks.every((item) => item.checked);
          seleccionarTodosCursadaCompletaAdmin.indeterminate =
            checks.some((item) => item.checked) &&
            !checks.every((item) => item.checked);
        }

        btnMarcarEgresadosAdmin.disabled = !checks.some((item) => item.checked);
      });
    });

  btnMarcarEgresadosAdmin.disabled = true;
}

async function cargarCursadaCompleta() {
  if (!btnVerCursadaCompletaAdmin) return;

  btnVerCursadaCompletaAdmin.disabled = true;
  btnVerCursadaCompletaAdmin.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Consultando...
  `;

  mostrarMensaje(mensajeCursadaCompletaAdmin, "");

  if (cuerpoCursadaCompletaAdmin) {
    cuerpoCursadaCompletaAdmin.innerHTML = `
      <tr>
        <td colspan="4" class="tabla-vacia">
          Consultando estudiantes...
        </td>
      </tr>
    `;
  }

  try {
    const resultado = await getDocs(
      query(
        collection(db, "usuarios"),
        where("rol", "==", "ALUMNO"),
        where("tipoVinculo", "==", "CURSADA_COMPLETA"),
      ),
    );

    estudiantesCursadaCompleta = resultado.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter(
        (estudiante) =>
          String(estudiante.estado || "").toUpperCase() === "ACTIVO",
      )
      .sort((a, b) =>
        String(a.nombreCompleto || a.correo || a.id).localeCompare(
          String(b.nombreCompleto || b.correo || b.id),
          "es",
          { sensitivity: "base" },
        ),
      );

    renderizarCursadaCompleta();

    mostrarMensaje(
      mensajeCursadaCompletaAdmin,
      estudiantesCursadaCompleta.length
        ? `Se encontraron ${estudiantesCursadaCompleta.length} estudiantes con Cursada Completa.`
        : "No hay estudiantes activos con Cursada Completa.",
      estudiantesCursadaCompleta.length ? "ok" : "",
    );
  } catch (error) {
    console.error("Error al consultar Cursada Completa:", error);

    estudiantesCursadaCompleta = [];

    if (cuerpoCursadaCompletaAdmin) {
      cuerpoCursadaCompletaAdmin.innerHTML = `
        <tr>
          <td colspan="4" class="tabla-vacia">
            No se pudieron consultar los estudiantes.
          </td>
        </tr>
      `;
    }

    mostrarMensaje(
      mensajeCursadaCompletaAdmin,
      error?.message || "No se pudieron consultar los estudiantes.",
      "error",
    );
  } finally {
    btnVerCursadaCompletaAdmin.disabled = false;
    btnVerCursadaCompletaAdmin.innerHTML = `
      <i class="fa-solid fa-graduation-cap"></i>
      Ver Cursada Completa
    `;
  }
}

async function marcarSeleccionadosComoEgresados() {
  if (!usuarioActual) {
    mostrarMensaje(
      mensajeCursadaCompletaAdmin,
      "Esperando validación de la sesión.",
      "error",
    );
    return;
  }

  const idsSeleccionados = Array.from(
    cuerpoCursadaCompletaAdmin?.querySelectorAll(
      "[data-check-cursada-completa]:checked",
    ) || [],
  )
    .map((checkbox) => checkbox.closest("tr")?.dataset.cursadaCompletaId || "")
    .filter(Boolean);

  if (!idsSeleccionados.length) {
    mostrarMensaje(
      mensajeCursadaCompletaAdmin,
      "Seleccioná al menos un estudiante.",
      "error",
    );
    return;
  }

  const confirmado = await confirmarConSweetAlert({
    icon: "warning",
    title: "Marcar estudiantes como EGRESADOS",
    html: `
      <div style="text-align:left">
        <p>
          Se marcarán <strong>${idsSeleccionados.length}</strong>
          ${idsSeleccionados.length === 1 ? "estudiante" : "estudiantes"}
          como EGRESADOS.
        </p>
        <p style="margin-top:12px">
          Perderán el acceso al Portal Alumno y quedarán disponibles para una
          futura Baja Global.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Sí, marcar como EGRESADOS",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!confirmado) return;

  btnMarcarEgresadosAdmin.disabled = true;
  btnMarcarEgresadosAdmin.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Actualizando...
  `;

  try {
    const lote = writeBatch(db);
    const correoSoporte = normalizarCorreo(usuarioActual.email);

    idsSeleccionados.forEach((estudianteId) => {
      lote.update(doc(db, "usuarios", estudianteId), {
        estado: "INACTIVO",
        tipoVinculo: "EGRESADO",
        cursoId: null,
        cursoAnio: null,
        cursoDivision: null,
        cursoNombre: null,
        grupoTaller: null,
        fechaEgreso: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
        actualizadoPor: correoSoporte,
      });
    });

    await lote.commit();

    await confirmarConSweetAlert({
      icon: "success",
      title: "Egreso registrado",
      text: `Se actualizaron ${idsSeleccionados.length} estudiantes correctamente.`,
      confirmButtonText: "Aceptar",
    });

    await cargarCursadaCompleta();
  } catch (error) {
    console.error("Error al marcar estudiantes como egresados:", error);

    mostrarMensaje(
      mensajeCursadaCompletaAdmin,
      error?.message || "No se pudieron actualizar los estudiantes.",
      "error",
    );
  } finally {
    btnMarcarEgresadosAdmin.innerHTML = `
      <i class="fa-solid fa-user-graduate"></i>
      Marcar seleccionados como EGRESADOS
    `;
  }
}

if (btnPrepararCambioCicloAdmin) {
  btnPrepararCambioCicloAdmin.addEventListener(
    "click",
    cargarCursosCambioCiclo,
  );
}

if (cursoOrigenCambioCicloAdmin) {
  cursoOrigenCambioCicloAdmin.addEventListener("change", () => {
    estudiantesCursoActual = [];

    if (herramientasCambioCicloAdmin) {
      herramientasCambioCicloAdmin.hidden = true;
    }

    if (seleccionarTodosCambioCicloAdmin) {
      seleccionarTodosCambioCicloAdmin.checked = false;
      seleccionarTodosCambioCicloAdmin.disabled = true;
    }

    if (btnConfirmarCambioCicloAdmin) {
      btnConfirmarCambioCicloAdmin.disabled = true;
    }

    if (cuerpoCambioCicloAdmin) {
      cuerpoCambioCicloAdmin.innerHTML = `
        <tr>
          <td colspan="5" class="tabla-vacia">
            Presioná “Cargar estudiantes” para consultar el curso seleccionado.
          </td>
        </tr>
      `;
    }

    mostrarMensaje(mensajeCambioCicloAdmin, "");
  });
}

if (btnCargarEstudiantesCambioCicloAdmin) {
  btnCargarEstudiantesCambioCicloAdmin.addEventListener(
    "click",
    cargarEstudiantesCambioCiclo,
  );
}

if (seleccionarTodosCambioCicloAdmin) {
  seleccionarTodosCambioCicloAdmin.addEventListener("change", () => {
    cuerpoCambioCicloAdmin
      ?.querySelectorAll("[data-check-estudiante-ciclo]")
      .forEach((checkbox) => {
        checkbox.checked = seleccionarTodosCambioCicloAdmin.checked;
      });

    seleccionarTodosCambioCicloAdmin.indeterminate = false;
  });
}

if (btnAsignarDestinoCambioCicloAdmin) {
  btnAsignarDestinoCambioCicloAdmin.addEventListener(
    "click",
    asignarDestinoASeleccionados,
  );
}

if (btnConfirmarCambioCicloAdmin) {
  btnConfirmarCambioCicloAdmin.addEventListener("click", confirmarCambioCiclo);
}

if (btnVerCursadaCompletaAdmin) {
  btnVerCursadaCompletaAdmin.addEventListener("click", cargarCursadaCompleta);
}

if (seleccionarTodosCursadaCompletaAdmin) {
  seleccionarTodosCursadaCompletaAdmin.addEventListener("change", () => {
    cuerpoCursadaCompletaAdmin
      ?.querySelectorAll("[data-check-cursada-completa]")
      .forEach((checkbox) => {
        checkbox.checked = seleccionarTodosCursadaCompletaAdmin.checked;
      });

    seleccionarTodosCursadaCompletaAdmin.indeterminate = false;

    if (btnMarcarEgresadosAdmin) {
      btnMarcarEgresadosAdmin.disabled =
        !seleccionarTodosCursadaCompletaAdmin.checked;
    }
  });
}

if (btnMarcarEgresadosAdmin) {
  btnMarcarEgresadosAdmin.addEventListener(
    "click",
    marcarSeleccionadosComoEgresados,
  );
}

onAuthStateChanged(auth, (usuario) => {
  usuarioActual = usuario || null;
});
