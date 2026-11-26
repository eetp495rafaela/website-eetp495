export function prepararMigracion({
  origen,
  destino,
  asignaciones,
  horarios,
  asignacionesDestino = [],
  horariosDestino = [],
}) {
  if (
    !Number.isInteger(origen) ||
    origen < 2020 ||
    destino > 2100 ||
    destino !== origen + 1
  ) {
    throw new Error("Ciclos lectivos incorrectos.");
  }

  if (asignacionesDestino.length || horariosDestino.length) {
    throw new Error("El ciclo de destino ya contiene registros.");
  }

  const mapaAsignaciones = new Map();
  const idsDestino = new Set();
  const nuevasAsignaciones = [];
  const nuevosHorarios = [];

  const activas = asignaciones.filter(
    ({ datos }) =>
      datos.cicloLectivo === origen &&
      ["ACTIVA", "ACTIVO"].includes(datos.estado)
  );

  for (const { id, datos } of activas) {
    const { docenteCorreo, cursoId, espacioId } = datos;

    if (!id || !docenteCorreo || !cursoId || !espacioId) {
      throw new Error("Asignación de origen incompleta.");
    }

    const nuevoId = [
      encodeURIComponent(docenteCorreo),
      cursoId,
      espacioId,
      destino,
    ].join("__");

    if (idsDestino.has(nuevoId)) {
      throw new Error("Asignaciones duplicadas en el origen.");
    }

    idsDestino.add(nuevoId);
    mapaAsignaciones.set(id, nuevoId);

    nuevasAsignaciones.push({
      id: nuevoId,
      datos: {
        ...datos,
        cicloLectivo: destino,
      },
    });
  }

  const bloques = horarios.filter(
    ({ datos }) =>
      datos.cicloLectivo === origen &&
      datos.estado === "ACTIVO"
  );

  const idsHorarios = new Set();

  for (const { id, datos } of bloques) {
    if (!id || idsHorarios.has(id)) {
      throw new Error("Identificador de horario incorrecto.");
    }

    idsHorarios.add(id);

    if (!["AULA", "TALLER", "EDUCACION_FISICA"]
      .includes(datos.tipoHorario)) {
      throw new Error("Tipo de horario desconocido.");
    }

    const vinculada = activas.find(
      (a) =>
        a.datos.docenteCorreo === datos.docenteCorreo &&
        a.datos.cursoId === datos.cursoId &&
        a.datos.espacioId === datos.espacioId &&
        (!datos.asignacionId || a.id === datos.asignacionId)
    );

    if (!vinculada) {
      throw new Error(`Horario sin asignación activa: ${id}`);
    }

    const copia = {
      ...datos,
      cicloLectivo: destino,
    };

    if (
      datos.tipoHorario !== "AULA" ||
      datos.asignacionId
    ) {
      copia.asignacionId =
        mapaAsignaciones.get(vinculada.id);
    }

    nuevosHorarios.push({
      id: `migracion_${destino}_${id}`,
      datos: copia,
    });
  }

  if (!nuevasAsignaciones.length || !nuevosHorarios.length) {
    throw new Error("No hay suficientes registros para migrar.");
  }

  return {
    origen,
    destino,
    asignaciones: nuevasAsignaciones,
    horarios: nuevosHorarios,
    resumen: {
      asignaciones: nuevasAsignaciones.length,
      aula: nuevosHorarios.filter(
        h => h.datos.tipoHorario === "AULA"
      ).length,
      taller: nuevosHorarios.filter(
        h => h.datos.tipoHorario === "TALLER"
      ).length,
      educacionFisica: nuevosHorarios.filter(
        h => h.datos.tipoHorario === "EDUCACION_FISICA"
      ).length,
      totalHorarios: nuevosHorarios.length,
    },
  };
}
