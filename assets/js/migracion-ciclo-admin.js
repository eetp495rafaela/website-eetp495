import {
  activarCicloFirestore,
  consultarEstadoMigracion,
  ejecutarMigracionFirestore,
} from "./migracion-ciclo-firestore.js";

import { obtenerCicloVigente } from "./ciclo-lectivo.js";

import { obtenerCicloSiguiente } from "./ciclo-lectivo-core.mjs";

import {
  collection,
  getDocsFromServer,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  prepararMigracion,
} from "./migracion-ciclo-core.mjs";

async function consultarCiclo(db, nombre, ciclo) {
  const resultado = await getDocsFromServer(
    query(
      collection(db, nombre),
      where("cicloLectivo", "==", ciclo),
    ),
  );

  return resultado.docs.map(documento => ({
    id: documento.id,
    datos: documento.data(),
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById(
    "btnPrepararMigracionCiclo"
  );

  const mensaje = document.getElementById(
    "mensajeMigracionCiclo"
  );

  if (!boton || !mensaje) return;

  let procesando = false;

  function informar(texto, clase = "") {
    mensaje.textContent = texto;
    mensaje.className = "mensaje-formulario";
    if (clase) mensaje.classList.add(clase);
  }

  boton.addEventListener("click", async () => {
    if (procesando) return;

    const db = window.portalDb;
    const usuario = window.portalUsuario;

    if (!db || usuario?.rol !== "SOPORTE") {
      informar(
        "Conexión no disponible o usuario sin permiso.",
        "mensaje-error"
      );
      return;
    }



    procesando = true;
    boton.disabled = true;

    try {
      const origen = await obtenerCicloVigente(db);
      const destino = obtenerCicloSiguiente(origen);

      const estado = await consultarEstadoMigracion(db, destino);

      if (estado?.estado === "PREPARADO") {
        const confirmacion = await Swal.fire({
          icon: "warning",
          title: `Activar ciclo lectivo ${destino}`,
          html: `
            <p>El ciclo ${destino} está preparado.</p>
            <p>Antes de activarlo, verificá:</p>
            <ul style="text-align:left">
              <li>Asignaciones docentes.</li>
              <li>Horarios de Aula, Taller y Educación Física.</li>
              <li>Promoción y distribución de estudiantes.</li>
              <li>Períodos de asistencia.</li>
            </ul>
            <p>Los portales que utilizan el ciclo institucional
            pasarán a consultar el nuevo año.</p>
            <p>No se eliminarán registros del ciclo anterior.</p>
          `,
          input: "text",
          inputPlaceholder: `ACTIVAR ${destino}`,
          inputValidator: valor =>
            valor === `ACTIVAR ${destino}`
              ? undefined
              : `Escribí ACTIVAR ${destino} para confirmar.`,
          showCancelButton: true,
          confirmButtonText: "Activar ciclo",
          cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) {
          informar("Activación cancelada. Sin modificaciones.");
          return;
        }

        await activarCicloFirestore(db, origen, destino);

        await Swal.fire({
          icon: "success",
          title: `Ciclo ${destino} activado`,
          text: "El portal se actualizará.",
          confirmButtonText: "Aceptar",
        });

        window.location.reload();
        return;
      }


      informar(`Revisando la migración de ${origen} a ${destino}...`);
      const [
        asignaciones,
        horarios,
        asignacionesDestino,
        horariosDestino,
      ] = await Promise.all([
        consultarCiclo(db, "asignaciones_docentes", origen),
        consultarCiclo(db, "horarios", origen),
        consultarCiclo(db, "asignaciones_docentes", destino),
        consultarCiclo(db, "horarios", destino),
      ]);

      // Diagnóstico de vínculos sin modificar Firestore.
      const inconsistencias = horarios
        .filter(h => h.datos.estado === "ACTIVO")
        .filter(({ datos: h }) =>
          !asignaciones.some(a =>
            ["ACTIVA", "ACTIVO"].includes(a.datos.estado) &&
            a.datos.docenteCorreo === h.docenteCorreo &&
            a.datos.cursoId === h.cursoId &&
            a.datos.espacioId === h.espacioId &&
            (!h.asignacionId || a.id === h.asignacionId)
          )
        )
        .map(({ id, datos: h }) => ({
          id,
          tipo: h.tipoHorario,
          curso: h.cursoNombre,
          espacio: h.espacioCurricular,
          docente: h.docenteNombre,
          correo: h.docenteCorreo,
          dia: h.dia,
          inicio: h.horaInicio,
          asignacionId: h.asignacionId || "",
          coincidencias: asignaciones.filter(a =>
            a.datos.cursoId === h.cursoId &&
            a.datos.espacioId === h.espacioId
          ).map(a => ({
            id: a.id,
            docente: a.datos.docenteNombre,
            correo: a.datos.docenteCorreo,
            estado: a.datos.estado,
          })),
        }));

      console.info(
        "Total de asignaciones de origen:", asignaciones.length,
        "Total de horarios de origen:", horarios.length,
        "Horarios inconsistentes:", inconsistencias.length
      );

      if (inconsistencias.length) {
        console.table(inconsistencias);
        console.log(
          "DIAGNOSTICO MIGRACION:",
          JSON.stringify(inconsistencias, null, 2)
        );

        throw new Error(
          `Se encontraron ${inconsistencias.length} horarios ` +
          "sin asignación activa coincidente. " +
          "Consultá el diagnóstico en la consola."
        );
      }

      const plan = prepararMigracion({
        origen,
        destino,
        asignaciones,
        horarios,
        asignacionesDestino: estado ? [] : asignacionesDestino,
        horariosDestino: estado ? [] : horariosDestino,
      });

      const r = plan.resumen;

      informar(
        `Revisión correcta: ${r.asignaciones} asignaciones y ` +
        `${r.totalHorarios} horarios disponibles para migrar.`,
        "mensaje-exito"
      );

      const confirmacion = await Swal.fire({
        icon: "warning",
        title: `Migración ${origen} → ${destino}`,
        html: `
          <p>Asignaciones docentes: <strong>${r.asignaciones}</strong></p>
          <p>Horarios de Aula: <strong>${r.aula}</strong></p>
          <p>Horarios de Taller: <strong>${r.taller}</strong></p>
          <p>Educación Física: <strong>${r.educacionFisica}</strong></p>
          <p>Total de horarios: <strong>${r.totalHorarios}</strong></p>
          <hr>
          <p>El ciclo vigente no se modificará.</p>
          <p>No edites horarios ni asignaciones durante la copia.</p>
        `,
        input: "text",
        inputPlaceholder: `Escribí ${destino} para confirmar`,
        inputValidator: valor =>
          valor === String(destino)
            ? undefined
            : "Ingresá el año de destino.",
        showCancelButton: true,
        confirmButtonText: estado
          ? "Reanudar migración"
          : "Preparar nuevo ciclo",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#0b4edb",
      });

      if (!confirmacion.isConfirmed) {
        informar("Operación cancelada. Sin modificaciones.");
        return;
      }

      await ejecutarMigracionFirestore({
        db,
        plan,
        informar: (cantidad, total) => {
          informar(`Migración: ${cantidad} de ${total} documentos.`);
        },
      });

      informar(
        `Ciclo ${destino} preparado correctamente.`,
        "mensaje-exito"
      );

      await Swal.fire({
        icon: "success",
        title: "Migración completada",
        text: `El ciclo ${origen} continúa vigente.`,
        confirmButtonText: "Aceptar",
      });

    } catch (error) {
      console.error("Error al revisar la migración:", error);

      informar(
        error.message || "No se pudo revisar la migración.",
        "mensaje-error"
      );

      await Swal.fire({
        icon: "error",
        title: "Migración no disponible",
        text: error.message || "Error durante la revisión.",
        confirmButtonText: "Aceptar",
      });

    } finally {
      procesando = false;
      boton.disabled = false;
    }
  });
});
