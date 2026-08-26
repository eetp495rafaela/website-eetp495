import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnAbrir = document.getElementById("btnAbrirLimpiezaHorarios");
  const modal = document.getElementById("modalLimpiezaHorarios");
  const btnCerrar = document.getElementById("btnCerrarModalLimpiezaHorarios");
  const btnCancelar = document.getElementById("btnCancelarLimpiezaHorarios");
  const btnContinuar = document.getElementById("btnContinuarLimpiezaHorarios");
  const cicloInput = document.getElementById("cicloLimpiezaHorarios");
  const mensajeModal = document.getElementById("mensajeModalLimpiezaHorarios");
  const mensajePanel = document.getElementById("mensajeLimpiezaHorarios");

  const modalConfirmacion = document.getElementById(
    "modalConfirmacionLimpiezaHorarios",
  );
  const tituloConfirmacion = document.getElementById(
    "tituloConfirmacionLimpiezaHorarios",
  );
  const textoConfirmacion = document.getElementById(
    "textoConfirmacionLimpiezaHorarios",
  );
  const btnCancelarConfirmacion = document.getElementById(
    "btnCancelarConfirmacionLimpiezaHorarios",
  );
  const btnAceptarConfirmacion = document.getElementById(
    "btnAceptarConfirmacionLimpiezaHorarios",
  );

  let cicloPendiente = 0;
  let resumenPendiente = null;
  let etapaConfirmacion = 1;
  let eliminandoHorarios = false;

  function limpiarMensajeModal() {
    if (!mensajeModal) return;

    mensajeModal.textContent = "";
    mensajeModal.className = "mensaje-formulario";
  }

  function mostrarMensajeModal(texto, clase = "") {
    if (!mensajeModal) return;

    mensajeModal.textContent = texto;
    mensajeModal.className = "mensaje-formulario";

    if (clase) {
      mensajeModal.classList.add(clase);
    }
  }

  function mostrarMensajePanel(texto, clase = "") {
    if (!mensajePanel) return;

    mensajePanel.textContent = texto;
    mensajePanel.className = "mensaje-formulario";

    if (clase) {
      mensajePanel.classList.add(clase);
    }
  }

  function obtenerCicloIngresado() {
    const ciclo = Number(cicloInput?.value || 0);

    if (!Number.isInteger(ciclo) || ciclo < 2000 || ciclo > 2100) {
      return 0;
    }

    return ciclo;
  }

  function obtenerConsultaHorarios(db, ciclo) {
    return query(
      collection(db, "horarios"),
      where("cicloLectivo", "==", ciclo),
    );
  }

  function resumirHorarios(documentos) {
    const resumen = {
      total: documentos.length,
      aula: 0,
      taller: 0,
      educacionFisica: 0,
      otros: 0,
    };

    documentos.forEach((documento) => {
      const tipo = String(documento.data()?.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (tipo === "AULA") {
        resumen.aula++;
        return;
      }

      if (tipo === "TALLER") {
        resumen.taller++;
        return;
      }

      if (tipo === "EDUCACION_FISICA") {
        resumen.educacionFisica++;
        return;
      }

      resumen.otros++;
    });

    return resumen;
  }

  function construirDetalleResumen(resumen) {
    const partes = [
      `${resumen.aula} de Aula`,
      `${resumen.taller} de Taller`,
      `${resumen.educacionFisica} de Educación Física`,
    ];

    if (resumen.otros) {
      partes.push(`${resumen.otros} de otro tipo`);
    }

    return partes.join(", ");
  }

  function abrirModal() {
    if (!modal || eliminandoHorarios) return;

    modal.removeAttribute("hidden");
    modal.style.display = "flex";

    cicloPendiente = 0;
    resumenPendiente = null;
    etapaConfirmacion = 1;

    if (cicloInput) {
      cicloInput.value = "";
      setTimeout(() => cicloInput.focus(), 0);
    }

    limpiarMensajeModal();
  }

  function cerrarModal() {
    if (!modal || eliminandoHorarios) return;

    modal.setAttribute("hidden", "");
    modal.style.display = "none";

    if (cicloInput) {
      cicloInput.value = "";
    }

    cicloPendiente = 0;
    resumenPendiente = null;
    etapaConfirmacion = 1;

    limpiarMensajeModal();
    restaurarPrimeraConfirmacion();
  }

  function restaurarPrimeraConfirmacion() {
    etapaConfirmacion = 1;

    if (tituloConfirmacion) {
      tituloConfirmacion.textContent = "Confirmar limpieza de horarios";
    }

    if (textoConfirmacion) {
      textoConfirmacion.textContent = "";
    }

    if (btnAceptarConfirmacion) {
      btnAceptarConfirmacion.disabled = false;
      btnAceptarConfirmacion.innerHTML = `
        <i class="fa-solid fa-trash-can"></i>
        Sí, continuar
      `;
    }

    if (btnCancelarConfirmacion) {
      btnCancelarConfirmacion.disabled = false;
    }
  }

  function abrirModalConfirmacion(ciclo, resumen) {
    if (!modalConfirmacion || !textoConfirmacion) return;

    cicloPendiente = ciclo;
    resumenPendiente = resumen;
    restaurarPrimeraConfirmacion();

    textoConfirmacion.textContent =
      `Se encontraron ${resumen.total} bloques del ciclo lectivo ${ciclo}: ` +
      `${construirDetalleResumen(resumen)}. ` +
      "Se eliminarán únicamente esos bloques horarios.";

    modalConfirmacion.removeAttribute("hidden");
    modalConfirmacion.style.display = "flex";
  }

  function cerrarModalConfirmacion() {
    if (!modalConfirmacion || eliminandoHorarios) return;

    modalConfirmacion.setAttribute("hidden", "");
    modalConfirmacion.style.display = "none";

    cicloPendiente = 0;
    resumenPendiente = null;
    restaurarPrimeraConfirmacion();
  }

  async function revisarBloques() {
    if (eliminandoHorarios) return;

    limpiarMensajeModal();

    const ciclo = obtenerCicloIngresado();

    if (!ciclo) {
      mostrarMensajeModal(
        "Ingresá un ciclo lectivo válido entre 2000 y 2100.",
        "mensaje-error",
      );
      cicloInput?.focus();
      return;
    }

    const db = window.portalDb;
    const usuario = window.portalUsuario;

    if (!db) {
      mostrarMensajeModal(
        "Firestore todavía no está disponible. Intentá nuevamente.",
        "mensaje-error",
      );
      return;
    }

    if (!usuario || usuario.rol !== "SOPORTE") {
      mostrarMensajeModal(
        "Tu usuario no tiene permiso para realizar esta operación.",
        "mensaje-error",
      );
      return;
    }

    if (btnContinuar) {
      btnContinuar.disabled = true;
      btnContinuar.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Revisando...
      `;
    }

    try {
      const resultado = await getDocs(obtenerConsultaHorarios(db, ciclo));
      const resumen = resumirHorarios(resultado.docs);

      if (!resumen.total) {
        mostrarMensajeModal(
          `No hay bloques horarios cargados para el ciclo lectivo ${ciclo}.`,
          "mensaje-error",
        );
        return;
      }

      abrirModalConfirmacion(ciclo, resumen);
    } catch (error) {
      console.error("Error al revisar bloques horarios:", error);

      mostrarMensajeModal(
        error.message || "No se pudieron revisar los bloques horarios.",
        "mensaje-error",
      );
    } finally {
      if (btnContinuar) {
        btnContinuar.disabled = false;
        btnContinuar.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          Revisar bloques
        `;
      }
    }
  }

  function mostrarSegundaConfirmacion() {
    if (
      !cicloPendiente ||
      !resumenPendiente ||
      !tituloConfirmacion ||
      !textoConfirmacion ||
      !btnAceptarConfirmacion
    ) {
      return;
    }

    etapaConfirmacion = 2;
    tituloConfirmacion.textContent = "Segunda confirmación";
    textoConfirmacion.textContent =
      `Confirmá nuevamente que querés eliminar los ${resumenPendiente.total} ` +
      `bloques horarios del ciclo lectivo ${cicloPendiente}. ` +
      "Las asignaciones docentes y los registros históricos de asistencia no serán eliminados.";

    btnAceptarConfirmacion.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      Continuar
    `;
  }

  function mostrarTerceraConfirmacion() {
    if (
      !cicloPendiente ||
      !resumenPendiente ||
      !tituloConfirmacion ||
      !textoConfirmacion ||
      !btnAceptarConfirmacion
    ) {
      return;
    }

    etapaConfirmacion = 3;
    tituloConfirmacion.textContent = "Confirmación definitiva";
    textoConfirmacion.textContent =
      `Esta es la última confirmación. Se eliminarán definitivamente todos los ` +
      `bloques horarios del ciclo lectivo ${cicloPendiente}. Esta acción no se puede deshacer.`;

    btnAceptarConfirmacion.innerHTML = `
      <i class="fa-solid fa-trash-can"></i>
      Eliminar definitivamente
    `;
  }

  async function eliminarDocumentosEnLotes(documentos) {
    const db = window.portalDb;

    if (!db) {
      throw new Error("No se encontró la conexión con Firestore.");
    }

    const TAMANO_LOTE = 450;

    for (let inicio = 0; inicio < documentos.length; inicio += TAMANO_LOTE) {
      const lote = writeBatch(db);
      const bloque = documentos.slice(inicio, inicio + TAMANO_LOTE);

      bloque.forEach((documento) => {
        lote.delete(documento.ref);
      });

      await lote.commit();
    }
  }

  function actualizarVistasHorariosEliminados(ciclo) {
    const vistas = [
      ["horarioAulaCicloLectivo", "vistaHorarioAula", "Aula"],
      ["horarioTallerCicloLectivo", "vistaHorarioTaller", "Taller"],
      ["horarioEfCicloLectivo", "vistaHorarioEf", "Educación Física"],
    ];

    vistas.forEach(([idCiclo, idVista, etiqueta]) => {
      const inputCiclo = document.getElementById(idCiclo);
      const vista = document.getElementById(idVista);

      if (!inputCiclo || !vista || Number(inputCiclo.value || 0) !== ciclo) {
        return;
      }

      vista.innerHTML = `
        <p class="mensaje-formulario">
          Los bloques de ${etiqueta} del ciclo ${ciclo} fueron eliminados.
          Presioná “Actualizar horario” para volver a consultar.
        </p>
      `;
    });
  }

  async function ejecutarLimpiezaDefinitiva() {
    if (!cicloPendiente || eliminandoHorarios) return;

    const db = window.portalDb;
    const usuario = window.portalUsuario;

    if (!db) {
      throw new Error("Firestore todavía no está disponible.");
    }

    if (!usuario || usuario.rol !== "SOPORTE") {
      throw new Error("Tu usuario no tiene permiso para realizar esta operación.");
    }

    const cicloAEliminar = cicloPendiente;
    eliminandoHorarios = true;

    if (btnAceptarConfirmacion) {
      btnAceptarConfirmacion.disabled = true;
      btnAceptarConfirmacion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Eliminando...
      `;
    }

    if (btnCancelarConfirmacion) {
      btnCancelarConfirmacion.disabled = true;
    }

    if (btnContinuar) {
      btnContinuar.disabled = true;
    }

    mostrarMensajePanel(
      `Eliminando los bloques horarios del ciclo ${cicloAEliminar}. No cierres esta ventana...`,
    );

    try {
      // Se consulta nuevamente para asegurar que se eliminen todos los bloques
      // que existan para ese ciclo en el momento exacto de confirmar.
      const resultado = await getDocs(
        obtenerConsultaHorarios(db, cicloAEliminar),
      );

      const totalEliminar = resultado.docs.length;

      if (!totalEliminar) {
        throw new Error(
          `Ya no hay bloques horarios cargados para el ciclo ${cicloAEliminar}.`,
        );
      }

      await eliminarDocumentosEnLotes(resultado.docs);

      modalConfirmacion?.setAttribute("hidden", "");
      if (modalConfirmacion) modalConfirmacion.style.display = "none";

      modal?.setAttribute("hidden", "");
      if (modal) modal.style.display = "none";

      actualizarVistasHorariosEliminados(cicloAEliminar);

      mostrarMensajePanel(
        `Se eliminaron correctamente ${totalEliminar} bloques horarios del ciclo lectivo ${cicloAEliminar}.`,
        "mensaje-exito",
      );

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "success",
          title: "Bloques horarios eliminados",
          text: `Se eliminaron ${totalEliminar} bloques del ciclo lectivo ${cicloAEliminar}.`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0b4edb",
        });
      }

      if (cicloInput) {
        cicloInput.value = "";
      }
    } catch (error) {
      console.error("Error al eliminar bloques horarios:", error);

      mostrarMensajePanel(
        error.message || "No se pudieron eliminar los bloques horarios.",
        "mensaje-error",
      );

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "error",
          title: "No se pudo completar la limpieza",
          text: error.message || "Ocurrió un error al eliminar los horarios.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0b4edb",
        });
      }
    } finally {
      eliminandoHorarios = false;
      cicloPendiente = 0;
      resumenPendiente = null;
      restaurarPrimeraConfirmacion();

      if (btnContinuar) {
        btnContinuar.disabled = false;
        btnContinuar.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          Revisar bloques
        `;
      }
    }
  }

  async function procesarConfirmacion() {
    if (etapaConfirmacion === 1) {
      mostrarSegundaConfirmacion();
      return;
    }

    if (etapaConfirmacion === 2) {
      mostrarTerceraConfirmacion();
      return;
    }

    if (etapaConfirmacion === 3) {
      await ejecutarLimpiezaDefinitiva();
    }
  }

  btnAbrir?.addEventListener("click", abrirModal);
  btnCerrar?.addEventListener("click", cerrarModal);
  btnCancelar?.addEventListener("click", cerrarModal);
  btnContinuar?.addEventListener("click", revisarBloques);
  btnCancelarConfirmacion?.addEventListener("click", cerrarModalConfirmacion);
  btnAceptarConfirmacion?.addEventListener("click", procesarConfirmacion);

  cicloInput?.addEventListener("input", limpiarMensajeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal && !eliminandoHorarios) {
      cerrarModal();
    }
  });

  modalConfirmacion?.addEventListener("click", (event) => {
    if (event.target === modalConfirmacion && !eliminandoHorarios) {
      cerrarModalConfirmacion();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || eliminandoHorarios) return;

    if (
      modalConfirmacion &&
      !modalConfirmacion.hasAttribute("hidden")
    ) {
      cerrarModalConfirmacion();
      return;
    }

    if (modal && !modal.hasAttribute("hidden")) {
      cerrarModal();
    }
  });
});
