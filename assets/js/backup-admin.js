const BACKEND_BACKUP_URL =
  "https://script.google.com/macros/s/AKfycbwgqaaYJLlGZl7CcxcYRwy-qqPrlqKoL2L1qDxk0nqsPCbVZqmmbTS5KaCsdDNxVpq-/exec";

const btnGenerarBackupSistema = document.getElementById(
  "btnGenerarBackupSistema",
);

const mensajeBackupSistema = document.getElementById("mensajeBackupSistema");

function mostrarMensajeBackup(mensaje, tipo = "") {
  if (!mensajeBackupSistema) return;

  mensajeBackupSistema.textContent = mensaje;
  mensajeBackupSistema.className = "mensaje-formulario";

  if (tipo) {
    mensajeBackupSistema.classList.add(tipo);
  }
}

async function generarBackupSistema() {
  if (!btnGenerarBackupSistema) return;

  const confirmar = await Swal.fire({
    title: "¿Generar backup ahora?",
    text: "Se creará una copia de seguridad de Firestore y se guardará en Drive.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, generar backup",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#0b4edb",
    cancelButtonColor: "#6c757d",
  });

  if (!confirmar.isConfirmed) return;

  try {
    btnGenerarBackupSistema.disabled = true;
    btnGenerarBackupSistema.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Generando backup...
    `;

    mostrarMensajeBackup(
      "Generando copia de seguridad. Esto puede tardar unos segundos...",
    );

    const respuesta = await fetch(BACKEND_BACKUP_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "generar_backup_firestore",
      }),
    });

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error(datos.mensaje || "No se pudo generar el backup.");
    }

    mostrarMensajeBackup(
      `Backup generado correctamente: ${datos.archivo?.nombre || "archivo creado en Drive"}`,
      "mensaje-exito",
    );

    await Swal.fire({
      title: "Backup generado",
      text: "La copia de seguridad se guardó correctamente en la carpeta System_BackUp.",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0b4edb",
    });
  } catch (error) {
    console.error(error);

    mostrarMensajeBackup(
      error.message || "Ocurrió un error al generar el backup.",
      "mensaje-error",
    );

    await Swal.fire({
      title: "Error",
      text: error.message || "Ocurrió un error al generar el backup.",
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0b4edb",
    });
  } finally {
    btnGenerarBackupSistema.disabled = false;
    btnGenerarBackupSistema.innerHTML = `
      <i class="fa-solid fa-cloud-arrow-down"></i>
      Generar backup ahora
    `;
  }
}

if (btnGenerarBackupSistema) {
  btnGenerarBackupSistema.addEventListener("click", generarBackupSistema);
}
