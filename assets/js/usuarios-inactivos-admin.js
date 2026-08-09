import { getApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =====================================================
   ELEMENTOS DEL MÓDULO
===================================================== */

const btnVerUsuariosInactivos = document.getElementById(
  "btnVerUsuariosInactivos",
);

const cuerpoTablaUsuariosInactivos = document.getElementById(
  "cuerpoTablaUsuariosInactivos",
);

const mensajeUsuariosInactivos = document.getElementById(
  "mensajeUsuariosInactivos",
);

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const rolesLegibles = {
  ALUMNO: "Estudiante",
  DOCENTE: "Docente",
  SOPORTE: "Soporte Institucional",
  PRECEPTORIA: "Preceptoría",
  SECRETARIA: "Secretaría",
  ASISTENTE_ADMINISTRATIVO: "Asistente Administrativo",
  DIRECCION: "Dirección",
};

const BAJA_GLOBAL_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbyuzJxYe0Hiauj3wTKlcA-3yom9NVjZFzEsEj7LGG6bef_YYjkPQtInIXviIsSluXXSVg/exec";

const CUENTAS_PROTEGIDAS_BAJA_GLOBAL = new Set([
  "soportetecnico.tec495@gmail.com",
  "enviotrabajos495@gmail.com",
]);

/* =====================================================
   UTILIDADES
===================================================== */

function normalizarMayusculas(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function escaparHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensaje(texto = "", tipo = "") {
  if (!mensajeUsuariosInactivos) {
    return;
  }

  mensajeUsuariosInactivos.textContent = texto;
  mensajeUsuariosInactivos.className = "mensaje-formulario";

  if (tipo) {
    mensajeUsuariosInactivos.classList.add(tipo);
  }
}

function mostrarFilaInformativa(texto) {
  if (!cuerpoTablaUsuariosInactivos) {
    return;
  }

  cuerpoTablaUsuariosInactivos.replaceChildren();

  const fila = document.createElement("tr");
  const celda = document.createElement("td");

  celda.colSpan = 4;
  celda.className = "tabla-vacia";
  celda.textContent = texto;

  fila.appendChild(celda);
  cuerpoTablaUsuariosInactivos.appendChild(fila);
}

function crearCelda(texto = "") {
  const celda = document.createElement("td");

  celda.textContent = texto;

  return celda;
}

function obtenerRolesUsuario(usuario) {
  const roles = new Set();

  const rolPrincipal = normalizarMayusculas(usuario.rol);

  if (rolPrincipal) {
    roles.add(rolPrincipal);
  }

  if (Array.isArray(usuario.roles)) {
    usuario.roles.forEach((rol) => {
      const rolNormalizado = normalizarMayusculas(rol);

      if (rolNormalizado) {
        roles.add(rolNormalizado);
      }
    });
  }

  if (!roles.size) {
    return "Sin rol";
  }

  return Array.from(roles)
    .map((rol) => rolesLegibles[rol] || rol)
    .join(" / ");
}

function crearCeldaUsuario(usuario, documentoId) {
  const celda = document.createElement("td");

  const nombre = document.createElement("strong");

  nombre.textContent =
    String(usuario.nombreCompleto || "").trim() || "Sin nombre registrado";

  const salto = document.createElement("br");

  const correo = document.createElement("small");

  correo.textContent =
    String(usuario.correo || documentoId || "").trim() ||
    "Sin correo registrado";

  celda.append(nombre, salto, correo);

  return celda;
}

function crearCeldaAccion(usuario) {
  const celda = document.createElement("td");

  if (esCuentaProtegidaBajaGlobal(usuario)) {
    const etiqueta = document.createElement("span");

    etiqueta.textContent = "Cuenta protegida";
    etiqueta.className = "texto-secundario";
    etiqueta.title = "Esta cuenta institucional no puede eliminarse.";

    celda.appendChild(etiqueta);

    return celda;
  }

  const botonEliminar = document.createElement("button");

  botonEliminar.type = "button";
  botonEliminar.className = "btn-tabla btn-desactivar";
  botonEliminar.dataset.usuarioId = usuario.id;

  botonEliminar.innerHTML = `
    <i class="fa-solid fa-trash-can"></i>
    Eliminar
  `;

  botonEliminar.addEventListener("click", async () => {
    await mostrarPrimeraConfirmacionEliminacion(usuario, botonEliminar);
  });

  celda.appendChild(botonEliminar);

  return celda;
}

function obtenerCondicionUsuario(usuario) {
  const tipoVinculo = normalizarMayusculas(usuario.tipoVinculo);

  if (tipoVinculo === "BAJA") {
    return "BAJA";
  }

  return "INACTIVO";
}

async function obtenerUsuarioFirebaseActual() {
  const tiempoMaximo = 5000;
  const intervalo = 100;
  let tiempoTranscurrido = 0;

  return new Promise((resolve, reject) => {
    const comprobar = () => {
      try {
        const app = getApp();
        const auth = getAuth(app);
        const usuario = auth.currentUser;

        if (usuario) {
          resolve(usuario);
          return;
        }
      } catch (error) {
        /*
         * El módulo principal del Portal puede estar terminando
         * de inicializar Firebase. Se vuelve a intentar hasta
         * alcanzar el tiempo máximo.
         */
      }

      tiempoTranscurrido += intervalo;

      if (tiempoTranscurrido >= tiempoMaximo) {
        reject(
          new Error(
            "No se detectó una sesión activa de Firebase para realizar la baja global.",
          ),
        );
        return;
      }

      window.setTimeout(comprobar, intervalo);
    };

    comprobar();
  });
}

function crearIdSolicitudBajaGlobal() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join("-");
}

function decodificarBase64Utf8BajaGlobal(valorBase64) {
  const binario = window.atob(String(valorBase64 || ""));

  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));

  return new TextDecoder("utf-8").decode(bytes);
}

async function llamarBackendBajaGlobal(datos) {
  /*
   * No usamos fetch() directamente contra Apps Script.
   *
   * ContentService redirige la respuesta a googleusercontent.com
   * y un navegador servido desde GitHub Pages puede bloquear la
   * lectura de esa respuesta por política de origen.
   *
   * Se envía un POST de formulario a un iframe oculto y el
   * backend responde con HtmlService + postMessage().
   *
   * El Firebase ID Token sigue viajando en el CUERPO del POST;
   * no se coloca en la URL.
   */
  const requestId = crearIdSolicitudBajaGlobal();

  const nombreIframe = `baja-global-${requestId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const iframe = document.createElement("iframe");

  iframe.name = nombreIframe;
  iframe.hidden = true;
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.display = "none";

  const formulario = document.createElement("form");

  formulario.method = "POST";
  formulario.action = BAJA_GLOBAL_BACKEND_URL;
  formulario.target = nombreIframe;
  formulario.style.display = "none";

  const campos = {
    transport: "iframe",
    requestId,
    targetOrigin: window.location.origin,
    payload: JSON.stringify(datos),
  };

  Object.entries(campos).forEach(([nombre, valor]) => {
    const input = document.createElement("input");

    input.type = "hidden";
    input.name = nombre;
    input.value = String(valor ?? "");

    formulario.appendChild(input);
  });

  document.body.appendChild(iframe);
  document.body.appendChild(formulario);

  return new Promise((resolve, reject) => {
    let finalizada = false;

    const limpiar = () => {
      if (finalizada) {
        return;
      }

      finalizada = true;

      window.removeEventListener("message", recibirMensaje);

      window.clearTimeout(temporizador);

      formulario.remove();

      /*
       * Se demora apenas la eliminación del iframe para permitir
       * que termine por completo el envío del postMessage().
       */
      window.setTimeout(() => {
        iframe.remove();
      }, 0);
    };

    const recibirMensaje = (event) => {
      const mensaje = event?.data;

      if (
        !mensaje ||
        mensaje.canal !== "EETP495_BAJA_GLOBAL" ||
        mensaje.requestId !== requestId
      ) {
        return;
      }

      try {
        const json = decodificarBase64Utf8BajaGlobal(mensaje.payloadBase64);

        const resultado = JSON.parse(json);

        limpiar();

        if (!resultado || resultado.ok !== true) {
          reject(
            new Error(
              String(
                resultado?.mensaje ||
                  "El backend rechazó la operación de baja global.",
              ),
            ),
          );

          return;
        }

        resolve(resultado);
      } catch (error) {
        limpiar();

        reject(
          new Error(
            error?.message ||
              "No se pudo interpretar la respuesta del backend de baja global.",
          ),
        );
      }
    };

    const temporizador = window.setTimeout(() => {
      limpiar();

      reject(
        new Error(
          "El backend de baja global no respondió dentro del tiempo esperado.",
        ),
      );
    }, 120000);

    window.addEventListener("message", recibirMensaje);

    /*
     * El submit de formulario entre orígenes está permitido por
     * el navegador; no depende de CORS como fetch().
     */
    formulario.submit();
  });
}

function obtenerCorreoUsuario(usuario) {
  return String(usuario?.correo || usuario?.id || "")
    .trim()
    .toLowerCase();
}

function esCuentaProtegidaBajaGlobal(usuario) {
  return CUENTAS_PROTEGIDAS_BAJA_GLOBAL.has(obtenerCorreoUsuario(usuario));
}

function crearLineaResumenBaja(etiqueta, valor) {
  const cantidad = Number(valor || 0);

  if (!cantidad) {
    return "";
  }

  return `
    <li>
      <strong>${escaparHtml(etiqueta)}:</strong>
      ${escaparHtml(String(cantidad))}
    </li>
  `;
}

function crearResumenPlanBajaGlobal(plan) {
  const acciones = plan?.accionesPrevistas || {};
  const cuenta = acciones.cuenta || {};
  const alumno = acciones.alumno || null;
  const docente = acciones.docente || null;
  const institucional = acciones.institucional || null;

  const roles = Array.isArray(plan?.roles)
    ? plan.roles.map((rol) => rolesLegibles[rol] || rol).join(" / ")
    : "Sin rol";

  const lineasElimina = [];
  const lineasConserva = [];

  if (cuenta.eliminarFirebaseAuthentication) {
    lineasElimina.push(
      "<li>Cuenta de acceso en <strong>Firebase Authentication</strong></li>",
    );
  }

  if (cuenta.eliminarPerfilUsuariosFirestore) {
    lineasElimina.push(
      "<li>Perfil operativo de la colección <strong>usuarios</strong></li>",
    );
  }

  const accesos = crearLineaResumenBaja(
    "Accesos recientes a eliminar",
    cuenta.eliminarAccesosRecientes,
  );

  if (accesos) {
    lineasElimina.push(accesos);
  }

  if (alumno) {
    const asistencias = alumno.asistencias || {};
    const sime = alumno.sime || {};
    const informes = alumno.informesPedagogicos || {};

    const registrosAsistencia = crearLineaResumenBaja(
      "Registros del estudiante a quitar de asistencias compartidas",
      asistencias.registrosAlumnoAEliminar,
    );

    if (registrosAsistencia) {
      lineasElimina.push(registrosAsistencia);
    }

    const inscripcionesSime = crearLineaResumenBaja(
      "Inscripciones SIME a eliminar",
      sime.inscripcionesAEliminar,
    );

    if (inscripcionesSime) {
      lineasElimina.push(inscripcionesSime);
    }

    const permisosSime = crearLineaResumenBaja(
      "Permisos/PDF SIME a eliminar",
      sime.permisosPdfAEliminar,
    );

    if (permisosSime) {
      lineasElimina.push(permisosSime);
    }

    const informesArchivar = crearLineaResumenBaja(
      "Informes pedagógicos a archivar",
      informes.registrosFirestoreAArchivar,
    );

    if (informesArchivar) {
      lineasConserva.push(informesArchivar);
    }

    const archivosInformes = crearLineaResumenBaja(
      "Archivos de Informes Pedagógicos a conservar",
      informes.archivosDriveAConservar,
    );

    if (archivosInformes) {
      lineasConserva.push(archivosInformes);
    }
  }

  if (docente) {
    const asignaciones = crearLineaResumenBaja(
      "Asignaciones docentes a eliminar",
      docente.asignacionesDocentesAEliminar,
    );

    if (asignaciones) {
      lineasElimina.push(asignaciones);
    }

    const asistencias = crearLineaResumenBaja(
      "Asistencias históricas del docente a conservar",
      docente.asistenciasDocenteAConservar,
    );

    if (asistencias) {
      lineasConserva.push(asistencias);
    }

    const horarios = crearLineaResumenBaja(
      "Horarios a conservar y liberar del docente",
      docente.horariosAConservarYLiberarDocente,
    );

    if (horarios) {
      lineasConserva.push(horarios);
    }

    const informes = docente.informesPedagogicos || {};

    const referencias = crearLineaResumenBaja(
      "Autorizaciones docentes en informes a retirar",
      informes.referenciasComoDocenteAEliminar,
    );

    if (referencias) {
      lineasElimina.push(referencias);
    }

    const permisosDrive = crearLineaResumenBaja(
      "Permisos personales de Drive a retirar",
      informes.permisosDriveDirectosAEliminar,
    );

    if (permisosDrive) {
      lineasElimina.push(permisosDrive);
    }

    const archivos = crearLineaResumenBaja(
      "Archivos de informes relacionados a conservar",
      informes.archivosDriveRelacionados,
    );

    if (archivos) {
      lineasConserva.push(archivos);
    }
  }

  if (institucional) {
    const referentes = crearLineaResumenBaja(
      "Vínculos de referentes institucionales a eliminar",
      institucional.referentesInstitucionalesAEliminar,
    );

    if (referentes) {
      lineasElimina.push(referentes);
    }

    const auditoria = crearLineaResumenBaja(
      "Referencias técnicas institucionales a anonimizar",
      institucional.referenciasAuditoriaTecnicaAAnonimizar,
    );

    if (auditoria) {
      lineasConserva.push(auditoria);
    }

    const informes = institucional.informesPedagogicos || {};
    const drive = institucional.driveMultirrol || {};

    const informesCreados = crearLineaResumenBaja(
      "Informes creados cuya autoría histórica se conserva",
      informes.informesCreadosAConservar,
    );

    if (informesCreados) {
      lineasConserva.push(informesCreados);
    }

    const ultimaEdicion = crearLineaResumenBaja(
      "Informes con última edición histórica a conservar",
      informes.informesUltimaEdicionAConservar,
    );

    if (ultimaEdicion) {
      lineasConserva.push(ultimaEdicion);
    }

    const archivosInstitucionales = crearLineaResumenBaja(
      "Archivos institucionales de informes a conservar",
      drive.archivosRelacionadosTotales,
    );

    if (archivosInstitucionales) {
      lineasConserva.push(archivosInstitucionales);
    }

    const permisosTotales = crearLineaResumenBaja(
      "Permisos personales de Drive a retirar",
      drive.permisosDirectosPersonalesTotalesAEliminar,
    );

    if (permisosTotales) {
      lineasElimina.push(permisosTotales);
    }
  }

  const bloqueElimina = lineasElimina.length
    ? `
      <p><strong>Se eliminará o desvinculará:</strong></p>
      <ul>${lineasElimina.join("")}</ul>
    `
    : "";

  const bloqueConserva = lineasConserva.length
    ? `
      <p><strong>Se conservará como información institucional:</strong></p>
      <ul>${lineasConserva.join("")}</ul>
    `
    : "";

  return `
    <div style="text-align:left">
      <p>
        <strong>Roles detectados:</strong>
        ${escaparHtml(roles)}
      </p>

      ${bloqueElimina}
      ${bloqueConserva}

      <p>
        La cuenta será eliminada de forma definitiva y
        <strong>esta operación no puede deshacerse</strong>.
      </p>
    </div>
  `;
}

async function prevalidarBajaGlobalUsuario(usuario) {
  const correoObjetivo = obtenerCorreoUsuario(usuario);

  if (!correoObjetivo) {
    throw new Error(
      "No se pudo determinar el correo institucional del usuario.",
    );
  }

  if (esCuentaProtegidaBajaGlobal(usuario)) {
    throw new Error("Esta cuenta está protegida y no puede eliminarse.");
  }

  const usuarioFirebase = await obtenerUsuarioFirebaseActual();
  const correoSolicitante = String(usuarioFirebase.email || "")
    .trim()
    .toLowerCase();

  if (correoSolicitante === correoObjetivo) {
    throw new Error(
      "Por seguridad no podés ejecutar una baja global sobre tu propia cuenta.",
    );
  }

  const idToken = await usuarioFirebase.getIdToken(true);

  const respuesta = await llamarBackendBajaGlobal({
    accion: "prevalidar_baja_global",
    idToken,
    correoObjetivo,
  });

  const plan = respuesta.plan;

  if (!plan) {
    throw new Error("El backend no devolvió el plan de baja global.");
  }

  return plan;
}

async function mostrarPrimeraConfirmacionEliminacion(usuario, boton = null) {
  const nombre =
    String(usuario.nombreCompleto || "").trim() || "Usuario sin nombre";

  const correo = obtenerCorreoUsuario(usuario) || "Sin correo registrado";

  if (!window.Swal) {
    console.error(
      "SweetAlert2 no está disponible para confirmar la eliminación.",
    );

    mostrarMensaje("No se pudo abrir la confirmación de eliminación.", "error");

    return;
  }

  if (esCuentaProtegidaBajaGlobal(usuario)) {
    await Swal.fire({
      title: "Cuenta protegida",
      text: "Esta cuenta institucional está protegida y no puede eliminarse.",
      icon: "info",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  const contenidoOriginal = boton ? boton.innerHTML : "";

  try {
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Verificando...
      `;
    }

    mostrarMensaje(`Prevalidando la baja global de ${nombre}...`);

    const plan = await prevalidarBajaGlobalUsuario(usuario);

    if (!plan.ejecutable) {
      const motivos = Array.isArray(plan.motivosBloqueo)
        ? plan.motivosBloqueo
        : [];

      mostrarMensaje(
        motivos.length ? motivos.join(" ") : "La baja global está bloqueada.",
        "error",
      );

      await Swal.fire({
        title: "Baja global bloqueada",
        html: `
          <p>
            No se puede eliminar a
            <strong>${escaparHtml(nombre)}</strong>.
          </p>
          <p>
            ${escaparHtml(
              motivos.join(" ") || "El backend rechazó la prevalidación.",
            )}
          </p>
        `,
        icon: "error",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    mostrarMensaje("");

    const resultado = await Swal.fire({
      title: "¿Eliminar definitivamente este usuario?",
      html: `
        <p>
          Se prevalidó correctamente la baja global de:
        </p>

        <p>
          <strong>${escaparHtml(nombre)}</strong><br>
          ${escaparHtml(correo)}
        </p>

        ${crearResumenPlanBajaGlobal(plan)}
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b42318",
      reverseButtons: true,
      focusCancel: true,
      allowOutsideClick: false,
      width: 680,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    await mostrarSegundaConfirmacionEliminacion(usuario, plan);
  } catch (error) {
    console.error("Error al prevalidar la baja global:", error);

    const mensajeError = String(
      error?.message || "No se pudo prevalidar la baja global.",
    );

    const esLimiteCuota =
      mensajeError.includes("429") ||
      mensajeError.includes("RESOURCE_EXHAUSTED") ||
      mensajeError.toLowerCase().includes("quota exceeded");

    const tituloModal = esLimiteCuota
      ? "Límite diario alcanzado"
      : "No se pudo continuar";

    const mensajeModal = esLimiteCuota
      ? "Se alcanzó temporalmente el límite diario de consultas de la base de datos. No se realizó ninguna eliminación. Intentá nuevamente más tarde."
      : mensajeError;

    mostrarMensaje(mensajeModal, "error");

    await Swal.fire({
      title: tituloModal,
      text: mensajeModal,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML = contenidoOriginal;
    }
  }
}

async function ejecutarBajaGlobalUsuario(usuario, correoConfirmado) {
  const correoObjetivo = obtenerCorreoUsuario(usuario);

  if (!correoObjetivo) {
    throw new Error("No se pudo identificar el correo del usuario a eliminar.");
  }

  const usuarioFirebase = await obtenerUsuarioFirebaseActual();

  const idToken = await usuarioFirebase.getIdToken(true);

  return llamarBackendBajaGlobal({
    accion: "ejecutar_baja_global",
    idToken,
    correoObjetivo,
    confirmacionCorreo: String(correoConfirmado || "")
      .trim()
      .toLowerCase(),
  });
}

async function mostrarSegundaConfirmacionEliminacion(usuario, plan) {
  const nombre =
    String(usuario.nombreCompleto || "").trim() || "Usuario sin nombre";

  const correoEsperado = obtenerCorreoUsuario(usuario);

  if (!correoEsperado) {
    mostrarMensaje(
      "El usuario no tiene un correo válido para confirmar la eliminación.",
      "error",
    );

    return;
  }

  const resultado = await Swal.fire({
    title: "Confirmación definitiva",
    html: `
      <p>
        La prevalidación fue satisfactoria.
      </p>

      <p>
        Para ejecutar la <strong>baja global definitiva</strong> de
        <strong>${escaparHtml(nombre)}</strong>, escribí exactamente
        su correo institucional:
      </p>

      <p>
        <strong>${escaparHtml(correoEsperado)}</strong>
      </p>

      <p>
        Se conservarán los datos históricos e institucionales
        indicados en el plan anterior.
      </p>
    `,
    input: "email",
    inputPlaceholder: "Escribí el correo del usuario",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Eliminar definitivamente",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b42318",
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    inputAttributes: {
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
    },
    inputValidator: (valor) => {
      const correoIngresado = String(valor || "")
        .trim()
        .toLowerCase();

      if (!correoIngresado) {
        return "Debés escribir el correo institucional.";
      }

      if (correoIngresado !== correoEsperado) {
        return "El correo ingresado no coincide con el usuario seleccionado.";
      }

      return undefined;
    },
  });

  if (!resultado.isConfirmed) {
    return;
  }

  const correoConfirmado = String(resultado.value || "")
    .trim()
    .toLowerCase();

  mostrarMensaje(
    `Ejecutando la baja global de ${nombre}. No cierres esta página...`,
  );

  Swal.fire({
    title: "Eliminando usuario...",
    html: `
      <p>
        Se está ejecutando la baja global de
        <strong>${escaparHtml(nombre)}</strong>.
      </p>
      <p>
        No cierres ni recargues esta página hasta que finalice.
      </p>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const respuesta = await ejecutarBajaGlobalUsuario(
      usuario,
      correoConfirmado,
    );

    const resultadoBaja = respuesta.resultado || {};

    if (resultadoBaja.completada !== true && resultadoBaja.ok !== true) {
      throw new Error(
        "El backend respondió, pero no confirmó la finalización de la baja global.",
      );
    }

    mostrarMensaje(
      `${nombre} fue eliminado correctamente mediante baja global.`,
      "ok",
    );

    await Swal.fire({
      title: "Baja global completada",
      html: `
        <p>
          <strong>${escaparHtml(nombre)}</strong>
          fue eliminado correctamente.
        </p>
        <p>
          La cuenta de acceso y el perfil operativo fueron eliminados.
          Los datos históricos e institucionales definidos por las reglas
          de conservación permanecen resguardados.
        </p>
      `,
      icon: "success",
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
    });

    await cargarUsuariosInactivos();
  } catch (error) {
    console.error("Error al ejecutar la baja global:", error);

    const mensajeError = String(
      error?.message || "No se pudo completar la baja global.",
    );

    mostrarMensaje(mensajeError, "error");

    await Swal.fire({
      title: "La baja global no se completó",
      html: `
        <p>${escaparHtml(mensajeError)}</p>
        <p>
          No elimines manualmente el documento de <strong>usuarios</strong>.
          Si el problema persiste, revisá el registro de ejecución del
          backend antes de volver a intentar.
        </p>
      `,
      icon: "error",
      confirmButtonText: "Aceptar",
      allowOutsideClick: false,
    });
  }
}

/* =====================================================
   FIRESTORE
===================================================== */

async function obtenerBaseDeDatos() {
  if (window.portalDb) {
    return window.portalDb;
  }

  return new Promise((resolve, reject) => {
    const tiempoMaximo = 5000;
    const intervalo = 100;
    let tiempoTranscurrido = 0;

    const comprobacion = window.setInterval(() => {
      tiempoTranscurrido += intervalo;

      if (window.portalDb) {
        window.clearInterval(comprobacion);
        resolve(window.portalDb);
        return;
      }

      if (tiempoTranscurrido >= tiempoMaximo) {
        window.clearInterval(comprobacion);

        reject(new Error("No se pudo acceder a la base de datos."));
      }
    }, intervalo);
  });
}

async function consultarUsuariosInactivos() {
  const db = await obtenerBaseDeDatos();

  const referenciaUsuarios = collection(db, "usuarios");

  /*
   * Se realizan dos consultas independientes:
   *
   * 1. Usuarios cuyo estado sea INACTIVO.
   * 2. Usuarios cuyo tipoVinculo sea BAJA.
   *
   * Luego se combinan sin repetir documentos.
   */
  const consultaInactivos = query(
    referenciaUsuarios,
    where("estado", "==", "INACTIVO"),
  );

  const consultaBajas = query(
    referenciaUsuarios,
    where("tipoVinculo", "==", "BAJA"),
  );

  const [resultadoInactivos, resultadoBajas] = await Promise.all([
    getDocs(consultaInactivos),
    getDocs(consultaBajas),
  ]);

  const usuariosPorId = new Map();

  resultadoInactivos.forEach((documento) => {
    usuariosPorId.set(documento.id, {
      id: documento.id,
      ...documento.data(),
    });
  });

  resultadoBajas.forEach((documento) => {
    usuariosPorId.set(documento.id, {
      id: documento.id,
      ...documento.data(),
    });
  });

  return Array.from(usuariosPorId.values()).sort((usuarioA, usuarioB) => {
    const nombreA = String(usuarioA.nombreCompleto || usuarioA.correo || "");

    const nombreB = String(usuarioB.nombreCompleto || usuarioB.correo || "");

    return nombreA.localeCompare(nombreB, "es", {
      sensitivity: "base",
    });
  });
}

/* =====================================================
   RENDERIZADO
===================================================== */

function mostrarUsuariosInactivos(usuarios) {
  if (!cuerpoTablaUsuariosInactivos) {
    return;
  }

  cuerpoTablaUsuariosInactivos.replaceChildren();

  if (!usuarios.length) {
    mostrarFilaInformativa(
      "No se encontraron usuarios inactivos ni dados de baja.",
    );

    return;
  }

  usuarios.forEach((usuario) => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCeldaUsuario(usuario, usuario.id));

    fila.appendChild(crearCelda(obtenerRolesUsuario(usuario)));

    fila.appendChild(crearCelda(obtenerCondicionUsuario(usuario)));

    fila.appendChild(crearCeldaAccion(usuario));

    cuerpoTablaUsuariosInactivos.appendChild(fila);
  });
}

/* =====================================================
   CARGA PRINCIPAL
===================================================== */

async function cargarUsuariosInactivos() {
  if (!btnVerUsuariosInactivos) {
    return;
  }

  const contenidoOriginal = btnVerUsuariosInactivos.innerHTML;

  btnVerUsuariosInactivos.disabled = true;

  btnVerUsuariosInactivos.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Consultando usuarios...
  `;

  mostrarMensaje("");

  mostrarFilaInformativa("Consultando usuarios inactivos y dados de baja...");

  try {
    const usuarios = await consultarUsuariosInactivos();

    mostrarUsuariosInactivos(usuarios);

    mostrarMensaje(
      usuarios.length
        ? `Se encontraron ${usuarios.length} ${
            usuarios.length === 1
              ? "usuario disponible"
              : "usuarios disponibles"
          } para revisar.`
        : "No hay usuarios disponibles para revisar.",
      "ok",
    );
  } catch (error) {
    console.error("Error al consultar usuarios inactivos:", error);

    mostrarFilaInformativa("No se pudieron consultar los usuarios.");

    mostrarMensaje(
      error?.code === "permission-denied"
        ? "Firestore rechazó la consulta por permisos."
        : "Ocurrió un error al consultar los usuarios inactivos.",
      "error",
    );
  } finally {
    btnVerUsuariosInactivos.disabled = false;
    btnVerUsuariosInactivos.innerHTML = contenidoOriginal;
  }
}

/* =====================================================
   EVENTOS
===================================================== */

if (btnVerUsuariosInactivos) {
  btnVerUsuariosInactivos.addEventListener("click", cargarUsuariosInactivos);
}
