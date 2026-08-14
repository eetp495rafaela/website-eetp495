"use strict";

/* =====================================================
   CALENDARIO ESCOLAR
   Navegación mensual local
===================================================== */

const contenedorMesesCalendario = document.querySelector(".calendario-meses");

const btnCalendarioAnterior = document.getElementById("calendarioAnterior");

const btnCalendarioSiguiente = document.getElementById("calendarioSiguiente");

const mesesCalendario = [
  {
    nombre: "Enero",
    eventos: [],
  },
  {
    nombre: "Febrero",
    eventos: [],
  },
  {
    nombre: "Marzo",
    eventos: [],
  },
  {
    nombre: "Abril",
    eventos: [],
  },
  {
    nombre: "Mayo",
    eventos: [],
  },
  {
    nombre: "Junio",
    eventos: [],
  },
  {
    nombre: "Julio",
    eventos: [],
  },
  {
    nombre: "Agosto",
    eventos: [
      {
        fecha: "18 al 21",
        etiqueta: "Mesas de Exámenes",
        titulo: "Período de inscripción",
        descripcion:
          "Inscripción a Mesas de Exámenes a través del Portal Institucional.",
      },
    ],
  },
  {
    nombre: "Septiembre",
    eventos: [],
  },
  {
    nombre: "Octubre",
    eventos: [],
  },
  {
    nombre: "Noviembre",
    eventos: [],
  },
  {
    nombre: "Diciembre",
    eventos: [],
  },
];

const ANIO_CALENDARIO = new Date().getFullYear();

const anioCalendarioEscolar = document.getElementById("anioCalendarioEscolar");

if (anioCalendarioEscolar) {
  anioCalendarioEscolar.textContent = ANIO_CALENDARIO;
}

/*
 * Comenzamos mostrando:
 * Julio | Agosto | Septiembre
 */
const mesActual = new Date().getMonth();

let indiceInicialCalendario =
  mesActual - Math.floor(obtenerCantidadMesesVisibles() / 2);

function obtenerCantidadMesesVisibles() {
  if (window.innerWidth <= 680) {
    return 1;
  }

  if (window.innerWidth <= 1000) {
    return 2;
  }

  return 3;
}

function crearHtmlEventoCalendario(evento, nombreMes) {
  return `
    <article class="calendario-evento">
      <div class="calendario-evento-fecha">
        <strong>${evento.fecha}</strong>
        <span>${nombreMes}</span>
      </div>

      <div class="calendario-evento-contenido">
        <span class="calendario-evento-etiqueta">
          ${evento.etiqueta}
        </span>

        <h4>${evento.titulo}</h4>

        <p>
          ${evento.descripcion}
        </p>
      </div>
    </article>
  `;
}

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

function mostrarMesesCalendario() {
  if (!contenedorMesesCalendario) {
    return;
  }

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

window.addEventListener("resize", mostrarMesesCalendario);

mostrarMesesCalendario();
