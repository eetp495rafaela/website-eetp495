"use strict";

/* =====================================================
   FONDOS ALEATORIOS DEL LOGIN
   - Lee assets/img/login-fondos/fondos.json
   - Elige 4 imágenes
   - Cambia automáticamente cada 1 hora
===================================================== */

const RUTA_FONDOS = "assets/img/login-fondos/";
const RUTA_FONDOS_CSS = "../img/login-fondos/";
const ARCHIVO_INDICE = `${RUTA_FONDOS}fondos.json`;
const CANTIDAD_FONDOS = 4;
const HORAS_POR_BLOQUE = 1;

document.addEventListener("DOMContentLoaded", () => {
  iniciarFondosLogin();
});

async function iniciarFondosLogin() {
  try {
    const nombresFondos = await cargarFondosDisponibles();

    if (!Array.isArray(nombresFondos) || !nombresFondos.length) {
      console.warn("No se encontraron fondos para el login.");
      return;
    }

    aplicarFondosLogin(nombresFondos);
  } catch (error) {
    console.error("No se pudieron cargar los fondos del login:", error);
  }
}

async function cargarFondosDisponibles() {
  const respuesta = await fetch(`${ARCHIVO_INDICE}?_=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`No se pudo leer fondos.json (HTTP ${respuesta.status}).`);
  }

  const datos = await respuesta.json();

  if (!Array.isArray(datos)) {
    throw new Error("El archivo fondos.json no contiene un arreglo válido.");
  }

  return datos.map((nombre) => String(nombre || "").trim()).filter(Boolean);
}

function aplicarFondosLogin(fondosDisponibles) {
  const fondosSeleccionados = seleccionarFondosPorBloqueHorario(
    fondosDisponibles,
    CANTIDAD_FONDOS,
  );

  for (let i = 0; i < CANTIDAD_FONDOS; i += 1) {
    const nombreArchivo = fondosSeleccionados[i];

    if (!nombreArchivo) {
      document.body.style.removeProperty(`--login-fondo-${i + 1}`);
      continue;
    }

    document.body.style.setProperty(
      `--login-fondo-${i + 1}`,
      `url("${RUTA_FONDOS_CSS}${nombreArchivo}")`,
    );
  }
}

function seleccionarFondosPorBloqueHorario(fondos, cantidad) {
  const copia = [...fondos];
  const semilla = obtenerSemillaBloqueHorarioActual();
  mezclarDeterministicamente(copia, semilla);

  const seleccion = copia.slice(0, cantidad);

  if (seleccion.length === cantidad) {
    return seleccion;
  }

  let indice = 0;

  while (seleccion.length < cantidad && copia.length > 0) {
    seleccion.push(copia[indice % copia.length]);
    indice += 1;
  }

  return seleccion;
}

function obtenerSemillaBloqueHorarioActual() {
  const ahora = new Date();

  const anio = ahora.getFullYear();
  const mes = ahora.getMonth() + 1;
  const dia = ahora.getDate();
  const bloqueHora = Math.floor(ahora.getHours() / HORAS_POR_BLOQUE);

  return Number(`${anio}${mes}${dia}${bloqueHora}`);
}

function mezclarDeterministicamente(array, semillaInicial) {
  let semilla = semillaInicial;

  for (let i = array.length - 1; i > 0; i -= 1) {
    semilla = generarSiguienteSemilla(semilla);

    const j = semilla % (i + 1);

    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generarSiguienteSemilla(semilla) {
  return (semilla * 1664525 + 1013904223) % 4294967296;
}
