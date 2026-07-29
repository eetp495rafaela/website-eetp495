import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnAbrir = document.getElementById("btnAbrirLimpiezaAsistencias");

  const modal = document.getElementById("modalLimpiezaAsistencias");

  const btnCerrar = document.getElementById(
    "btnCerrarModalLimpiezaAsistencias",
  );

  const btnCancelar = document.getElementById("btnCancelarLimpiezaAsistencias");

  const btnContinuar = document.getElementById(
    "btnContinuarLimpiezaAsistencias",
  );

  const selector = document.getElementById("tipoLimpiezaAsistencias");

  const mensajeModal = document.getElementById(
    "mensajeModalLimpiezaAsistencias",
  );

  const mensajePanel = document.getElementById("mensajeLimpiezaAsistencias");

  const modalConfirmacion = document.getElementById(
    "modalConfirmacionLimpiezaAsistencias",
  );

  const tituloConfirmacion = document.getElementById(
    "tituloConfirmacionLimpiezaAsistencias",
  );

  const textoConfirmacion = document.getElementById(
    "textoConfirmacionLimpiezaAsistencias",
  );

  const btnCancelarConfirmacion = document.getElementById(
    "btnCancelarConfirmacionLimpieza",
  );

  const btnAceptarConfirmacion = document.getElementById(
    "btnAceptarConfirmacionLimpieza",
  );

  let tipoSeleccionadoPendiente = "";
  let etapaConfirmacion = 1;
  let eliminandoRegistros = false;

  function limpiarMensajeModal() {
    if (!mensajeModal) return;

    mensajeModal.textContent = "";
    mensajeModal.classList.remove(
      "mensaje-error",
      "mensaje-confirmacion",
      "mensaje-exito",
    );
  }

  function mostrarMensajePanel(texto, clase = "") {
    if (!mensajePanel) return;

    mensajePanel.textContent = texto;
    mensajePanel.className = "mensaje-formulario";

    if (clase) {
      mensajePanel.classList.add(clase);
    }
  }

  function obtenerEtiquetaSeleccionada(valor) {
    const etiquetas = {
      TALLER: "las asistencias de Taller",
      EDUCACION_FISICA: "las asistencias de Educación Física",
      TODAS: "todas las asistencias registradas",
    };

    return etiquetas[valor] || "";
  }

  function abrirModal() {
    if (!modal || eliminandoRegistros) return;

    modal.removeAttribute("hidden");
    modal.style.display = "flex";

    if (selector) {
      selector.value = "";
    }

    limpiarMensajeModal();
  }

  function cerrarModal() {
    if (!modal || eliminandoRegistros) return;

    modal.setAttribute("hidden", "");
    modal.style.display = "none";

    if (selector) {
      selector.value = "";
    }

    tipoSeleccionadoPendiente = "";
    etapaConfirmacion = 1;

    limpiarMensajeModal();
    restaurarPrimeraConfirmacion();
  }

  function restaurarPrimeraConfirmacion() {
    if (tituloConfirmacion) {
      tituloConfirmacion.textContent = "Confirmar eliminación";
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

    etapaConfirmacion = 1;
  }

  function abrirModalConfirmacion(tipoSeleccionado) {
    if (!modalConfirmacion || !textoConfirmacion) {
      return;
    }

    tipoSeleccionadoPendiente = tipoSeleccionado;
    etapaConfirmacion = 1;

    restaurarPrimeraConfirmacion();

    const etiqueta = obtenerEtiquetaSeleccionada(tipoSeleccionado);

    textoConfirmacion.textContent = `Estás por eliminar ${etiqueta}.`;

    modalConfirmacion.removeAttribute("hidden");
    modalConfirmacion.style.display = "flex";
  }

  function cerrarModalConfirmacion() {
    if (!modalConfirmacion || eliminandoRegistros) return;

    modalConfirmacion.setAttribute("hidden", "");
    modalConfirmacion.style.display = "none";

    tipoSeleccionadoPendiente = "";
    etapaConfirmacion = 1;

    restaurarPrimeraConfirmacion();
  }

  function continuarLimpieza() {
    if (!selector || !mensajeModal) return;

    limpiarMensajeModal();

    const tipoSeleccionado = selector.value;

    if (!tipoSeleccionado) {
      mensajeModal.textContent =
        "Seleccioná qué registros de asistencia querés eliminar.";

      mensajeModal.classList.add("mensaje-error");
      selector.focus();
      return;
    }

    abrirModalConfirmacion(tipoSeleccionado);
  }

  function mostrarSegundaConfirmacion() {
    if (
      !tipoSeleccionadoPendiente ||
      !tituloConfirmacion ||
      !textoConfirmacion ||
      !btnAceptarConfirmacion
    ) {
      return;
    }

    const etiqueta = obtenerEtiquetaSeleccionada(tipoSeleccionadoPendiente);

    etapaConfirmacion = 2;

    tituloConfirmacion.textContent = "Segunda confirmación";

    textoConfirmacion.textContent = `Confirmá nuevamente que querés eliminar ${etiqueta}.`;

    btnAceptarConfirmacion.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      Continuar
    `;
  }

  function mostrarTerceraConfirmacion() {
    if (
      !tipoSeleccionadoPendiente ||
      !tituloConfirmacion ||
      !textoConfirmacion ||
      !btnAceptarConfirmacion
    ) {
      return;
    }

    const etiqueta = obtenerEtiquetaSeleccionada(tipoSeleccionadoPendiente);

    etapaConfirmacion = 3;

    tituloConfirmacion.textContent = "Confirmación definitiva";

    textoConfirmacion.textContent = `Esta es la última confirmación. Se eliminarán definitivamente ${etiqueta}.`;

    btnAceptarConfirmacion.innerHTML = `
      <i class="fa-solid fa-trash-can"></i>
      Eliminar definitivamente
    `;
  }

  function obtenerConsultaAsistencias(db, tipo) {
    const referencia = collection(db, "asistencias_clases");

    if (tipo === "TODAS") {
      return referencia;
    }

    return query(referencia, where("tipoHorario", "==", tipo));
  }

  async function eliminarDocumentosEnLotes(documentos) {
    const db = window.portalDb;

    if (!db) {
      throw new Error("No se encontró la conexión con Firestore.");
    }

    /*
     * Firestore admite un máximo de 500 operaciones
     * por lote. Usamos 450 para mantener margen.
     */
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

  async function ejecutarLimpiezaDefinitiva() {
    if (!tipoSeleccionadoPendiente || eliminandoRegistros) {
      return;
    }

    const db = window.portalDb;
    const usuario = window.portalUsuario;

    if (!db) {
      throw new Error("Firestore todavía no está disponible.");
    }

    if (!usuario || usuario.rol !== "SOPORTE") {
      throw new Error(
        "Tu usuario no tiene permiso para realizar esta operación.",
      );
    }

    const tipoAEliminar = tipoSeleccionadoPendiente;
    const etiqueta = obtenerEtiquetaSeleccionada(tipoAEliminar);

    eliminandoRegistros = true;

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

    mostrarMensajePanel(`Eliminando ${etiqueta}. No cierres esta ventana...`);

    try {
      const consulta = obtenerConsultaAsistencias(db, tipoAEliminar);

      const resultado = await getDocs(consulta);

      await eliminarDocumentosEnLotes(resultado.docs);

      modalConfirmacion.setAttribute("hidden", "");
      modalConfirmacion.style.display = "none";

      modal.setAttribute("hidden", "");
      modal.style.display = "none";

      mostrarMensajePanel(
        `Se eliminaron correctamente ${etiqueta}.`,
        "mensaje-exito",
      );

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "success",
          title: "Asistencias eliminadas",
          text: `Se eliminaron correctamente ${etiqueta}.`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0b4edb",
        });
      }

      if (selector) {
        selector.value = "";
      }
    } catch (error) {
      console.error("Error al eliminar asistencias:", error);

      mostrarMensajePanel(
        error.message || "No se pudieron eliminar los registros de asistencia.",
        "mensaje-error",
      );

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "error",
          title: "No se pudo completar la limpieza",
          text: error.message || "Ocurrió un error al eliminar los registros.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#0b4edb",
        });
      }
    } finally {
      eliminandoRegistros = false;
      tipoSeleccionadoPendiente = "";
      etapaConfirmacion = 1;

      if (btnContinuar) {
        btnContinuar.disabled = false;
      }

      restaurarPrimeraConfirmacion();
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

  btnContinuar?.addEventListener("click", continuarLimpieza);

  btnCancelarConfirmacion?.addEventListener("click", cerrarModalConfirmacion);

  btnAceptarConfirmacion?.addEventListener("click", procesarConfirmacion);

  selector?.addEventListener("change", limpiarMensajeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal && !eliminandoRegistros) {
      cerrarModal();
    }
  });

  modalConfirmacion?.addEventListener("click", (event) => {
    if (event.target === modalConfirmacion && !eliminandoRegistros) {
      cerrarModalConfirmacion();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || eliminandoRegistros) {
      return;
    }

    if (modalConfirmacion && !modalConfirmacion.hasAttribute("hidden")) {
      cerrarModalConfirmacion();
      return;
    }

    if (modal && !modal.hasAttribute("hidden")) {
      cerrarModal();
    }
  });
});
