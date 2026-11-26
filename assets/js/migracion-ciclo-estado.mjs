import {
  validarCicloLectivo,
  obtenerCicloSiguiente,
} from "./ciclo-lectivo-core.mjs";

export function crearEstadoMigracion({
  origen,
  destino,
  huella,
  total,
}) {
  validarCicloLectivo(origen);

  if (destino !== obtenerCicloSiguiente(origen)) {
    throw new Error("Destino no consecutivo.");
  }

  if (
    typeof huella !== "string" ||
    !/^[a-f0-9]{64}$/.test(huella)
  ) {
    throw new Error("Huella de migración incorrecta.");
  }

  if (!Number.isSafeInteger(total) || total < 1) {
    throw new Error("Total de documentos incorrecto.");
  }

  return {
    migracionId: `${origen}_${destino}_${huella}`,
    origen,
    destino,
    huella,
    total,
    estado: "EN_PROCESO",
  };
}

export function validarRecuperacion(guardado, esperado) {
  if (!guardado || !esperado) {
    throw new Error("Registro de migración inexistente.");
  }

  for (const campo of [
    "migracionId",
    "origen",
    "destino",
    "huella",
    "total",
  ]) {
    if (guardado[campo] !== esperado[campo]) {
      throw new Error(
        `La migración no coincide: ${campo}.`
      );
    }
  }

  if (guardado.estado !== "EN_PROCESO") {
    throw new Error("La migración no admite recuperación.");
  }

  return true;
}

export function completarMigracion(estado, verificados) {
  if (estado.estado !== "EN_PROCESO") {
    throw new Error("Estado de migración incorrecto.");
  }

  if (verificados !== estado.total) {
    throw new Error("Existen documentos sin verificar.");
  }

  return {
    ...estado,
    estado: "PREPARADO",
  };
}
