export function validarCicloLectivo(ciclo) {
  if (
    !Number.isInteger(ciclo) ||
    ciclo < 2020 ||
    ciclo > 2100
  ) {
    throw new Error("Ciclo lectivo institucional incorrecto.");
  }

  return ciclo;
}

export function obtenerCicloSiguiente(ciclo) {
  return validarCicloLectivo(
    validarCicloLectivo(ciclo) + 1
  );
}

export function interpretarConfiguracion(datos) {
  if (!datos) {
    throw new Error(
      "El ciclo lectivo institucional no está configurado."
    );
  }

  return validarCicloLectivo(datos.cicloVigente);
}
