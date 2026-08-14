"use strict";

/* =====================================================
   CALENDARIO ESCOLAR
===================================================== */

const URL_CALENDARIO_ESCOLAR =
  "https://script.google.com/macros/s/AKfycbzRqnjl70VJosj9WHL-JGBn0hQ5COZtYQKNiYrJFfyfrdMQ_xDSJxNt0B7RUUbgW2z4iw/exec";

const contenedorMesesCalendario = document.querySelector(".calendario-meses");

const btnCalendarioAnterior = document.getElementById("calendarioAnterior");

const btnCalendarioSiguiente = document.getElementById("calendarioSiguiente");

const anioCalendarioEscolar = document.getElementById("anioCalendarioEscolar");

const ANIO_CALENDARIO = new Date().getFullYear();

const nombresMeses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const mesesCalendario = nombresMeses.map((nombre) => ({
  nombre: nombre,
  eventos: [],
}));

let eventosCalendarioCargados = [];

if (anioCalendarioEscolar) {
  anioCalendarioEscolar.textContent = ANIO_CALENDARIO;
}

/* =====================================================
   MES INICIAL
===================================================== */

const mesActual = new Date().getMonth();

let indiceInicialCalendario =
  mesActual - Math.floor(obtenerCantidadMesesVisibles() / 2);

/* =====================================================
   RESPONSIVE
===================================================== */

function obtenerCantidadMesesVisibles() {
  if (window.innerWidth <= 680) {
    return 1;
  }

  if (window.innerWidth <= 1000) {
    return 2;
  }

  return 3;
}

/* =====================================================
   FECHAS
===================================================== */

function convertirFechaISO(fecha) {
  const partes = String(fecha || "").split("-");

  if (partes.length !== 3) {
    return null;
  }

  return {
    anio: Number(partes[0]),
    mes: Number(partes[1]) - 1,
    dia: Number(partes[2]),
  };
}

function obtenerDiasDelMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}

/* =====================================================
   DISTRIBUIR EVENTOS EN LOS MESES
===================================================== */

function distribuirEventosCalendario(eventos) {
  mesesCalendario.forEach((mes) => {
    mes.eventos = [];
  });

  eventos.forEach((evento) => {
    const inicio = convertirFechaISO(evento.fechaInicio);
    const fin = convertirFechaISO(evento.fechaFin);

    if (!inicio || !fin) {
      return;
    }

    /*
     * Ignoramos eventos que no corresponden
     * al año que estamos mostrando.
     */
    if (fin.anio < ANIO_CALENDARIO || inicio.anio > ANIO_CALENDARIO) {
      return;
    }

    const primerMes = inicio.anio < ANIO_CALENDARIO ? 0 : inicio.mes;

    const ultimoMes = fin.anio > ANIO_CALENDARIO ? 11 : fin.mes;

    for (let indiceMes = primerMes; indiceMes <= ultimoMes; indiceMes++) {
      const diaInicio =
        inicio.anio === ANIO_CALENDARIO && inicio.mes === indiceMes
          ? inicio.dia
          : 1;

      const diaFin =
        fin.anio === ANIO_CALENDARIO && fin.mes === indiceMes
          ? fin.dia
          : obtenerDiasDelMes(ANIO_CALENDARIO, indiceMes);

      const fechaVisual =
        diaInicio === diaFin ? String(diaInicio) : `${diaInicio} al ${diaFin}`;

      mesesCalendario[indiceMes].eventos.push({
        fecha: fechaVisual,
        etiqueta: evento.etiqueta,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        orden: diaInicio,
      });
    }
  });

  mesesCalendario.forEach((mes) => {
    mes.eventos.sort((eventoA, eventoB) => eventoA.orden - eventoB.orden);
  });
}

/* =====================================================
   SEGURIDAD DEL TEXTO
===================================================== */

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   CREAR EVENTOS
===================================================== */

function crearHtmlEventoCalendario(evento, nombreMes) {
  return `
    <article class="calendario-evento">
      <div class="calendario-evento-fecha">
        <strong>${escaparHtml(evento.fecha)}</strong>
        <span>${escaparHtml(nombreMes)}</span>
      </div>

      <div class="calendario-evento-contenido">
        <span class="calendario-evento-etiqueta">
          ${escaparHtml(evento.etiqueta)}
        </span>

        <h4>${escaparHtml(evento.titulo)}</h4>

        <p>
          ${escaparHtml(evento.descripcion)}
        </p>
      </div>
    </article>
  `;
}

/* =====================================================
   CREAR MES
===================================================== */

function crearHtmlMesCalendario(mes) {
  const eventosHtml = mes.eventos.length
    ? mes.eventos
        .map((evento) => crearHtmlEventoCalendario(evento, mes.nombre))
        .join("")
    : `
      <p class="calendario-sin-eventos">
        Sin eventos destacados cargados.
      </p>
    `;

  return `
    <article class="calendario-mes">
      <div class="calendario-mes-encabezado">
        <span>${ANIO_CALENDARIO}</span>
        <h3>${mes.nombre}</h3>
      </div>

      <div class="calendario-eventos">
        ${eventosHtml}
      </div>
    </article>
  `;
}

/* =====================================================
   MOSTRAR MESES
===================================================== */

function mostrarMesesCalendario() {
  if (!contenedorMesesCalendario) {
    return;
  }

  distribuirEventosCalendario(eventosCalendarioCargados);

  const cantidadVisible = obtenerCantidadMesesVisibles();

  const maximoIndiceInicial = mesesCalendario.length - cantidadVisible;

  if (indiceInicialCalendario > maximoIndiceInicial) {
    indiceInicialCalendario = maximoIndiceInicial;
  }

  if (indiceInicialCalendario < 0) {
    indiceInicialCalendario = 0;
  }

  const mesesVisibles = mesesCalendario.slice(
    indiceInicialCalendario,
    indiceInicialCalendario + cantidadVisible,
  );

  contenedorMesesCalendario.innerHTML = mesesVisibles
    .map(crearHtmlMesCalendario)
    .join("");

  actualizarBotonesCalendario();
}

/* =====================================================
   BOTONES
===================================================== */

function actualizarBotonesCalendario() {
  const cantidadVisible = obtenerCantidadMesesVisibles();

  const maximoIndiceInicial = mesesCalendario.length - cantidadVisible;

  if (btnCalendarioAnterior) {
    btnCalendarioAnterior.disabled = indiceInicialCalendario === 0;
  }

  if (btnCalendarioSiguiente) {
    btnCalendarioSiguiente.disabled =
      indiceInicialCalendario >= maximoIndiceInicial;
  }
}

if (btnCalendarioAnterior) {
  btnCalendarioAnterior.addEventListener("click", () => {
    indiceInicialCalendario--;

    mostrarMesesCalendario();
  });
}

if (btnCalendarioSiguiente) {
  btnCalendarioSiguiente.addEventListener("click", () => {
    indiceInicialCalendario++;

    mostrarMesesCalendario();
  });
}

/* =====================================================
   CARGAR EVENTOS DESDE APPS SCRIPT
===================================================== */

async function cargarCalendarioEscolar() {
  try {
    const respuesta = await fetch(URL_CALENDARIO_ESCOLAR, {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar el Calendario Escolar.");
    }

    const datos = await respuesta.json();

    if (!datos.ok || !Array.isArray(datos.eventos)) {
      throw new Error("La respuesta del Calendario Escolar no es válida.");
    }

    eventosCalendarioCargados = datos.eventos;
  } catch (error) {
    console.error("Error al cargar el Calendario Escolar:", error);
  }

  mostrarMesesCalendario();
}

/* =====================================================
   RESPONSIVE
===================================================== */

window.addEventListener("resize", mostrarMesesCalendario);

/* =====================================================
   INICIO
===================================================== */

cargarCalendarioEscolar();
