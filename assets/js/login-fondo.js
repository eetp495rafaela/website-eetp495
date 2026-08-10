"use strict";

/* =====================================================
   FONDOS ALEATORIOS DEL LOGIN
   E.E.T.P. N° 495

   FUNCIONAMIENTO:
   - Detecta automáticamente fondo-01.jpg, fondo-02.jpg...
   - No necesita fondos.json
   - Elige 4 imágenes distintas en cada carga
   - Evita repetir las imágenes de la carga anterior
     siempre que haya suficientes fotografías
   - Da prioridad a las imágenes que hace más tiempo
     que no aparecen
   - Si se agregan nuevas imágenes consecutivas,
     las detecta automáticamente
===================================================== */

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const RUTA_FONDOS = "assets/img/login-fondos/";
const RUTA_FONDOS_CSS = "../img/login-fondos/";

const CANTIDAD_FONDOS = 4;

/*
  Límite de seguridad.

  No significa que debas tener 999 imágenes.
  Simplemente evita una búsqueda infinita por error.
*/
const MAXIMO_FONDOS = 999;

/*
  Datos guardados localmente para recordar:
  - cuántos fondos fueron detectados
  - cuáles aparecieron recientemente
*/
const CLAVE_CANTIDAD_FONDOS = "eetp495_login_cantidad_fondos_v1";
const CLAVE_ESTADO_FONDOS = "eetp495_login_estado_fondos_v1";

/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  iniciarFondosLogin();
});

/* =====================================================
   INICIAR FONDOS
===================================================== */

async function iniciarFondosLogin() {
  try {
    const fondosDisponibles = await obtenerFondosDisponibles();

    if (!fondosDisponibles.length) {
      console.warn("No se encontraron fondos para el login.");
      return;
    }

    if (fondosDisponibles.length < CANTIDAD_FONDOS) {
      console.warn(
        `Se encontraron solamente ${fondosDisponibles.length} fondos. ` +
          `Se necesitan al menos ${CANTIDAD_FONDOS} para completar el collage.`,
      );
    }

    const fondosSeleccionados = seleccionarFondosConRotacion(
      fondosDisponibles,
      CANTIDAD_FONDOS,
    );

    aplicarFondosLogin(fondosSeleccionados);
  } catch (error) {
    console.error("No se pudieron cargar los fondos del login:", error);
  }
}

/* =====================================================
   OBTENER FONDOS DISPONIBLES
===================================================== */

async function obtenerFondosDisponibles() {
  let cantidadConocida = obtenerCantidadGuardada();

  /*
    Primera visita desde este navegador.

    Si todavía no conocemos cuántas fotografías existen,
    buscamos desde fondo-01.jpg en adelante.
  */
  if (cantidadConocida <= 0) {
    cantidadConocida = await detectarCantidadDesdeCero();
  } else {
    /*
      Verificamos que el último fondo conocido siga
      existiendo.

      Si desapareció, volvemos a realizar el conteo.
    */
    const ultimoConocido = obtenerNombreFondo(cantidadConocida);

    const ultimoExiste = await comprobarArchivo(ultimoConocido);

    if (!ultimoExiste) {
      cantidadConocida = await detectarCantidadDesdeCero();
    } else {
      /*
        Comprobamos si se agregaron nuevas fotografías.

        Por ejemplo:

        Ya conocíamos:
        fondo-01.jpg ... fondo-16.jpg

        Ahora existe:
        fondo-17.jpg

        Se incorpora automáticamente.
      */
      let siguienteNumero = cantidadConocida + 1;

      while (siguienteNumero <= MAXIMO_FONDOS) {
        const siguienteArchivo = obtenerNombreFondo(siguienteNumero);

        const existe = await comprobarArchivo(siguienteArchivo);

        if (!existe) {
          break;
        }

        cantidadConocida = siguienteNumero;
        siguienteNumero += 1;
      }
    }
  }

  guardarCantidadFondos(cantidadConocida);

  return crearListaFondos(cantidadConocida);
}

/* =====================================================
   DETECCIÓN INICIAL
===================================================== */

async function detectarCantidadDesdeCero() {
  let cantidad = 0;

  for (let numero = 1; numero <= MAXIMO_FONDOS; numero += 1) {
    const nombreArchivo = obtenerNombreFondo(numero);

    const existe = await comprobarArchivo(nombreArchivo);

    if (!existe) {
      break;
    }

    cantidad = numero;
  }

  return cantidad;
}

/* =====================================================
   CREAR NOMBRE DEL ARCHIVO
===================================================== */

function obtenerNombreFondo(numero) {
  return `fondo-${String(numero).padStart(2, "0")}.jpg`;
}

/* =====================================================
   CREAR LISTA DE FONDOS
===================================================== */

function crearListaFondos(cantidad) {
  const fondos = [];

  for (let numero = 1; numero <= cantidad; numero += 1) {
    fondos.push(obtenerNombreFondo(numero));
  }

  return fondos;
}

/* =====================================================
   COMPROBAR SI UN ARCHIVO EXISTE
===================================================== */

async function comprobarArchivo(nombreArchivo) {
  const url = `${RUTA_FONDOS}${nombreArchivo}`;

  try {
    /*
      HEAD permite comprobar la existencia del archivo
      sin descargar toda la fotografía.
    */
    let respuesta = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
    });

    /*
      Algunos servidores pueden no aceptar HEAD.
      Si eso ocurre, hacemos una comprobación alternativa.
    */
    if (respuesta.status === 405) {
      respuesta = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });
    }

    return respuesta.ok;
  } catch (error) {
    console.warn(`No se pudo comprobar ${nombreArchivo}.`, error);

    return false;
  }
}

/* =====================================================
   SELECCIONAR 4 FONDOS

   La selección no es solamente aleatoria.

   También recuerda qué imágenes fueron utilizadas
   recientemente para reducir las repeticiones.
===================================================== */

function seleccionarFondosConRotacion(fondos, cantidad) {
  if (!fondos.length) {
    return [];
  }

  const estado = obtenerEstadoFondos();

  estado.carga += 1;

  const ultimaSeleccion = Array.isArray(estado.ultimaSeleccion)
    ? estado.ultimaSeleccion
    : [];

  const ultimaSeleccionSet = new Set(ultimaSeleccion);

  /*
    Primero intentamos eliminar completamente las
    fotografías utilizadas en la carga inmediatamente
    anterior.

    Esto funciona siempre que queden al menos
    4 imágenes disponibles.
  */
  let candidatos = fondos.filter(
    (nombreArchivo) => !ultimaSeleccionSet.has(nombreArchivo),
  );

  /*
    Si hay pocas fotografías y excluir las últimas
    nos deja menos de cuatro, usamos nuevamente
    toda la colección.
  */
  if (candidatos.length < cantidad) {
    candidatos = [...fondos];
  }

  /*
    Asignamos a cada fotografía:
    - cuándo apareció por última vez
    - un valor aleatorio para desempatar
  */
  const candidatosOrdenados = candidatos
    .map((nombreArchivo) => {
      return {
        nombre: nombreArchivo,

        ultimoUso: Number(estado.ultimoUso?.[nombreArchivo] || 0),

        azar: Math.random(),
      };
    })

    /*
      Primero aparecen las fotografías que hace
      más tiempo que no fueron utilizadas.

      Si varias tienen la misma antigüedad,
      el orden entre ellas es aleatorio.
    */
    .sort((a, b) => {
      if (a.ultimoUso !== b.ultimoUso) {
        return a.ultimoUso - b.ultimoUso;
      }

      return a.azar - b.azar;
    });

  /*
    Creamos un grupo de candidatos suficientemente
    amplio para mantener variedad.

    Con cuatro imágenes por pantalla intentamos
    trabajar sobre las 8 menos utilizadas recientemente.
  */
  const tamanioGrupo = Math.min(
    candidatosOrdenados.length,
    Math.max(cantidad, cantidad * 2),
  );

  const grupoPreferido = candidatosOrdenados
    .slice(0, tamanioGrupo)
    .map((elemento) => elemento.nombre);

  mezclarArray(grupoPreferido);

  const seleccion = grupoPreferido.slice(
    0,
    Math.min(cantidad, grupoPreferido.length),
  );

  /*
    Registramos cuándo fue utilizada cada fotografía.
  */
  seleccion.forEach((nombreArchivo) => {
    estado.ultimoUso[nombreArchivo] = estado.carga;
  });

  estado.ultimaSeleccion = [...seleccion];

  /*
    Eliminamos del historial posibles archivos que
    ya no formen parte de la colección actual.
  */
  Object.keys(estado.ultimoUso).forEach((nombreArchivo) => {
    if (!fondos.includes(nombreArchivo)) {
      delete estado.ultimoUso[nombreArchivo];
    }
  });

  guardarEstadoFondos(estado);

  return seleccion;
}

/* =====================================================
   MEZCLAR ARRAY ALEATORIAMENTE
===================================================== */

function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/* =====================================================
   APLICAR FONDOS AL CSS
===================================================== */

function aplicarFondosLogin(fondosSeleccionados) {
  for (let indice = 0; indice < CANTIDAD_FONDOS; indice += 1) {
    const nombreArchivo = fondosSeleccionados[indice];

    const propiedad = `--login-fondo-${indice + 1}`;

    if (!nombreArchivo) {
      document.body.style.removeProperty(propiedad);
      continue;
    }

    document.body.style.setProperty(
      propiedad,
      `url("${RUTA_FONDOS_CSS}${nombreArchivo}")`,
    );
  }
}

/* =====================================================
   ESTADO DE ROTACIÓN
===================================================== */

function obtenerEstadoFondos() {
  const estadoInicial = {
    carga: 0,
    ultimoUso: {},
    ultimaSeleccion: [],
  };

  try {
    const guardado = localStorage.getItem(CLAVE_ESTADO_FONDOS);

    if (!guardado) {
      return estadoInicial;
    }

    const estado = JSON.parse(guardado);

    return {
      carga: Number(estado.carga) || 0,

      ultimoUso:
        estado.ultimoUso && typeof estado.ultimoUso === "object"
          ? estado.ultimoUso
          : {},

      ultimaSeleccion: Array.isArray(estado.ultimaSeleccion)
        ? estado.ultimaSeleccion
        : [],
    };
  } catch (error) {
    console.warn("No se pudo recuperar el historial de fondos.", error);

    return estadoInicial;
  }
}

/* =====================================================
   GUARDAR ESTADO
===================================================== */

function guardarEstadoFondos(estado) {
  try {
    localStorage.setItem(CLAVE_ESTADO_FONDOS, JSON.stringify(estado));
  } catch (error) {
    console.warn("No se pudo guardar el historial de fondos.", error);
  }
}

/* =====================================================
   CANTIDAD DE FONDOS DETECTADA
===================================================== */

function obtenerCantidadGuardada() {
  try {
    const cantidad = Number(localStorage.getItem(CLAVE_CANTIDAD_FONDOS));

    return Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 0;
  } catch (error) {
    return 0;
  }
}

function guardarCantidadFondos(cantidad) {
  try {
    localStorage.setItem(CLAVE_CANTIDAD_FONDOS, String(cantidad));
  } catch (error) {
    console.warn("No se pudo guardar la cantidad de fondos.", error);
  }
}
