import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const btnGenerarPizarraHorarios =
  document.getElementById("btnGenerarPizarraHorarios") ||
  document.getElementById("btnGenerarPizarraHorariosGestion");

const mensajePizarraHorarios =
  document.getElementById("mensajePizarraHorarios") ||
  document.getElementById("mensajePizarraHorariosGestion") ||
  document.getElementById("mensajeHorariosGestion");

const DIAS_PIZARRA = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const TIPOS_PIZARRA = [
  {
    valor: "AULA",
    titulo: "Horario de Aula",
  },
  {
    valor: "TALLER",
    titulo: "Horario de Taller",
  },
  {
    valor: "EDUCACION_FISICA",
    titulo: "Educación Física",
  },
];

const TURNOS_PIZARRA = [
  {
    valor: "MANANA",
    titulo: "Turno Mañana",
  },
  {
    valor: "TARDE",
    titulo: "Turno Tarde",
  },
];

const GRILLAS_HORARIAS_AULA = {
  MANANA: [
    {
      tipo: "BLOQUE",
      numero: 1,
      inicio: "07:15",
      fin: "07:55",
    },
    {
      tipo: "BLOQUE",
      numero: 2,
      inicio: "07:55",
      fin: "08:35",
    },
    {
      tipo: "RECREO",
      inicio: "08:35",
      fin: "08:45",
    },
    {
      tipo: "BLOQUE",
      numero: 3,
      inicio: "08:45",
      fin: "09:25",
    },
    {
      tipo: "BLOQUE",
      numero: 4,
      inicio: "09:25",
      fin: "10:05",
    },
    {
      tipo: "RECREO",
      inicio: "10:05",
      fin: "10:15",
    },
    {
      tipo: "BLOQUE",
      numero: 5,
      inicio: "10:15",
      fin: "10:55",
    },
    {
      tipo: "BLOQUE",
      numero: 6,
      inicio: "10:55",
      fin: "11:35",
    },
    {
      tipo: "RECREO",
      inicio: "11:35",
      fin: "11:40",
    },
    {
      tipo: "BLOQUE",
      numero: 7,
      inicio: "11:40",
      fin: "12:20",
    },
  ],

  TARDE: [
    {
      tipo: "BLOQUE",
      numero: 1,
      inicio: "13:15",
      fin: "13:55",
    },
    {
      tipo: "BLOQUE",
      numero: 2,
      inicio: "13:55",
      fin: "14:35",
    },
    {
      tipo: "RECREO",
      inicio: "14:35",
      fin: "14:45",
    },
    {
      tipo: "BLOQUE",
      numero: 3,
      inicio: "14:45",
      fin: "15:25",
    },
    {
      tipo: "BLOQUE",
      numero: 4,
      inicio: "15:25",
      fin: "16:05",
    },
    {
      tipo: "RECREO",
      inicio: "16:05",
      fin: "16:15",
    },
    {
      tipo: "BLOQUE",
      numero: 5,
      inicio: "16:15",
      fin: "16:55",
    },
    {
      tipo: "BLOQUE",
      numero: 6,
      inicio: "16:55",
      fin: "17:35",
    },
    {
      tipo: "RECREO",
      inicio: "17:35",
      fin: "17:40",
    },
    {
      tipo: "BLOQUE",
      numero: 7,
      inicio: "17:40",
      fin: "18:20",
    },
  ],
};

function mostrarMensajePizarra(texto, tipo = "") {
  if (!mensajePizarraHorarios) return;

  mensajePizarraHorarios.textContent = texto || "";
  mensajePizarraHorarios.className = "mensaje-formulario";

  if (tipo === "ok") {
    mensajePizarraHorarios.classList.add("mensaje-ok");
  }

  if (tipo === "error") {
    mensajePizarraHorarios.classList.add("mensaje-error");
  }
}

function normalizarTextoPizarra(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const coloresDocentesPizarra = new Map();

/*
 * Paleta categórica preparada para distinguir docentes.
 *
 * Se combinan colores oscuros, medios y claros.
 * Cada color ya tiene definido un texto legible.
 */
const PALETA_DOCENTES = [
  { fondo: "#0b3d91", borde: "#06275f", texto: "#ffffff" },
  { fondo: "#d7263d", borde: "#991426", texto: "#ffffff" },
  { fondo: "#148f3c", borde: "#0b6128", texto: "#ffffff" },
  { fondo: "#6a1b9a", borde: "#451166", texto: "#ffffff" },
  { fondo: "#f57c00", borde: "#a95400", texto: "#ffffff" },
  { fondo: "#00838f", borde: "#00565e", texto: "#ffffff" },
  { fondo: "#ad1457", borde: "#760d3b", texto: "#ffffff" },
  { fondo: "#4e342e", borde: "#2f1f1b", texto: "#ffffff" },

  { fondo: "#1565c0", borde: "#0d4381", texto: "#ffffff" },
  { fondo: "#2e7d32", borde: "#1d5220", texto: "#ffffff" },
  { fondo: "#c62828", borde: "#851919", texto: "#ffffff" },
  { fondo: "#4527a0", borde: "#2c1969", texto: "#ffffff" },
  { fondo: "#ef6c00", borde: "#a04800", texto: "#ffffff" },
  { fondo: "#00695c", borde: "#00463d", texto: "#ffffff" },
  { fondo: "#7b1fa2", borde: "#51136b", texto: "#ffffff" },
  { fondo: "#37474f", borde: "#202b30", texto: "#ffffff" },

  { fondo: "#f9a825", borde: "#a96f11", texto: "#17202a" },
  { fondo: "#9e9d24", borde: "#686718", texto: "#ffffff" },
  { fondo: "#00acc1", borde: "#007582", texto: "#10203f" },
  { fondo: "#43a047", borde: "#2c6b30", texto: "#ffffff" },
  { fondo: "#8e24aa", borde: "#5e1870", texto: "#ffffff" },
  { fondo: "#f4511e", borde: "#a83414", texto: "#ffffff" },
  { fondo: "#3949ab", borde: "#263173", texto: "#ffffff" },
  { fondo: "#00897b", borde: "#005c53", texto: "#ffffff" },

  { fondo: "#c0ca33", borde: "#808821", texto: "#17202a" },
  { fondo: "#ffb300", borde: "#ad7900", texto: "#17202a" },
  { fondo: "#8d6e63", borde: "#5e4942", texto: "#ffffff" },
  { fondo: "#039be5", borde: "#02689a", texto: "#ffffff" },
  { fondo: "#7cb342", borde: "#52772b", texto: "#17202a" },
  { fondo: "#d81b60", borde: "#91113f", texto: "#ffffff" },
  { fondo: "#5e35b1", borde: "#3d2275", texto: "#ffffff" },
  { fondo: "#fb8c00", borde: "#a85e00", texto: "#17202a" },

  { fondo: "#00a152", borde: "#006b36", texto: "#ffffff" },
  { fondo: "#c2185b", borde: "#81103c", texto: "#ffffff" },
  { fondo: "#1976d2", borde: "#104e8b", texto: "#ffffff" },
  { fondo: "#5d4037", borde: "#3b2923", texto: "#ffffff" },

  { fondo: "#ffd54f", borde: "#b09228", texto: "#17202a" },
  { fondo: "#80cbc4", borde: "#478f89", texto: "#10203f" },
  { fondo: "#90caf9", borde: "#548db8", texto: "#10203f" },
  { fondo: "#f48fb1", borde: "#ad5c79", texto: "#33101d" },
  { fondo: "#ce93d8", borde: "#93619d", texto: "#27102b" },
  { fondo: "#a5d6a7", borde: "#6d976f", texto: "#102c12" },
  { fondo: "#ffab91", borde: "#b8735f", texto: "#35150c" },
  { fondo: "#b0bec5", borde: "#77868d", texto: "#17202a" },

  { fondo: "#fff176", borde: "#b3a747", texto: "#27240b" },
  { fondo: "#b39ddb", borde: "#7967a0", texto: "#201535" },
  { fondo: "#81d4fa", borde: "#4b96b8", texto: "#102a3a" },
  { fondo: "#ffcc80", borde: "#b38b50", texto: "#33220c" },

  { fondo: "#000000", borde: "#000000", texto: "#ffffff" },
  { fondo: "#263238", borde: "#111719", texto: "#ffffff" },
  { fondo: "#800000", borde: "#4d0000", texto: "#ffffff" },
  { fondo: "#004d40", borde: "#002e26", texto: "#ffffff" },
];

function obtenerNombreDocente(bloque) {
  return String(bloque.docenteNombre || "").trim() || "Docente sin cargar";
}

/*
 * Genera un color adicional solamente en el caso de que
 * haya más docentes que colores disponibles en la paleta.
 */
function crearColorDocenteAdicional(indice) {
  const tono = Math.round((indice * 137.508) % 360);

  const niveles = [
    {
      saturacion: 82,
      luminosidad: 34,
      texto: "#ffffff",
    },
    {
      saturacion: 78,
      luminosidad: 55,
      texto: "#ffffff",
    },
    {
      saturacion: 70,
      luminosidad: 76,
      texto: "#17202a",
    },
  ];

  const nivel = niveles[Math.floor(indice / 24) % niveles.length];

  const luminosidadBorde = Math.max(18, nivel.luminosidad - 15);

  return {
    fondo: `hsl(${tono}, ${nivel.saturacion}%, ${nivel.luminosidad}%)`,
    borde: `hsl(${tono}, ${nivel.saturacion}%, ${luminosidadBorde}%)`,
    texto: nivel.texto,
  };
}

/*
 * Convierte un color hexadecimal en sus componentes RGB.
 */
function convertirHexARgb(colorHex) {
  const valor = String(colorHex || "")
    .trim()
    .replace("#", "");

  const valorCompleto =
    valor.length === 3
      ? valor
          .split("")
          .map((caracter) => caracter + caracter)
          .join("")
      : valor;

  if (!/^[0-9a-f]{6}$/i.test(valorCompleto)) {
    return {
      rojo: 128,
      verde: 128,
      azul: 128,
    };
  }

  const numero = Number.parseInt(valorCompleto, 16);

  return {
    rojo: (numero >> 16) & 255,
    verde: (numero >> 8) & 255,
    azul: numero & 255,
  };
}

/*
 * Calcula una distancia visual aproximada entre dos colores.
 *
 * Cuanto mayor sea el resultado, más distintos se perciben.
 */
function calcularDistanciaEntreColores(colorA, colorB) {
  const rgbA = convertirHexARgb(colorA.fondo);
  const rgbB = convertirHexARgb(colorB.fondo);

  const diferenciaRojo = rgbA.rojo - rgbB.rojo;
  const diferenciaVerde = rgbA.verde - rgbB.verde;
  const diferenciaAzul = rgbA.azul - rgbB.azul;

  const promedioRojo = (rgbA.rojo + rgbB.rojo) / 2;

  return Math.sqrt(
    (2 + promedioRojo / 256) * diferenciaRojo * diferenciaRojo +
      4 * diferenciaVerde * diferenciaVerde +
      (2 + (255 - promedioRojo) / 256) * diferenciaAzul * diferenciaAzul,
  );
}

/*
 * Identifica la hoja visual en la que aparecerá un bloque.
 *
 * Los docentes que compartan tipo, turno y día serán
 * considerados docentes que deben tener colores muy distintos.
 */
function obtenerGrupoVisualBloque(bloque) {
  const tipoHorario = String(bloque.tipoHorario || "")
    .trim()
    .toUpperCase();

  const turno = String(bloque.turno || "")
    .trim()
    .toUpperCase();

  const dia = String(bloque.dia || "")
    .trim()
    .toUpperCase();

  return `${tipoHorario}|${turno}|${dia}`;
}

/*
 * Construye las relaciones entre docentes que aparecen
 * juntos en una misma sección, turno y día.
 */
function construirConflictosDocentes(bloques) {
  const docentesPorGrupo = new Map();
  const conflictos = new Map();

  bloques.forEach((bloque) => {
    const grupoVisual = obtenerGrupoVisualBloque(bloque);

    const docente = obtenerNombreDocente(bloque);

    const claveDocente = normalizarTextoPizarra(docente);

    if (!docentesPorGrupo.has(grupoVisual)) {
      docentesPorGrupo.set(grupoVisual, new Set());
    }

    docentesPorGrupo.get(grupoVisual).add(claveDocente);

    if (!conflictos.has(claveDocente)) {
      conflictos.set(claveDocente, new Set());
    }
  });

  docentesPorGrupo.forEach((docentesGrupo) => {
    const docentes = Array.from(docentesGrupo);

    for (let indiceA = 0; indiceA < docentes.length; indiceA += 1) {
      for (let indiceB = indiceA + 1; indiceB < docentes.length; indiceB += 1) {
        const docenteA = docentes[indiceA];
        const docenteB = docentes[indiceB];

        conflictos.get(docenteA).add(docenteB);
        conflictos.get(docenteB).add(docenteA);
      }
    }
  });

  return conflictos;
}

/*
 * Evalúa qué tan conveniente es un color para un docente.
 *
 * Se prioriza la máxima separación respecto de los docentes
 * que aparecen junto a él en alguna hoja.
 */
function calcularPuntajeColor(colorCandidato, claveDocente, conflictos) {
  const docentesRelacionados = conflictos.get(claveDocente) || new Set();

  const coloresRelacionados = Array.from(docentesRelacionados)
    .map((claveRelacionada) => coloresDocentesPizarra.get(claveRelacionada))
    .filter(Boolean);

  /*
   * Cuando todavía no hay conflictos asignados,
   * se intenta separar el color del resto de los
   * docentes que ya recibieron color.
   */
  const coloresAComparar = coloresRelacionados.length
    ? coloresRelacionados
    : Array.from(coloresDocentesPizarra.values());

  if (!coloresAComparar.length) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.min(
    ...coloresAComparar.map((colorAsignado) =>
      calcularDistanciaEntreColores(colorCandidato, colorAsignado),
    ),
  );
}

function prepararColoresDocentes(bloques) {
  coloresDocentesPizarra.clear();

  const docentesPorClave = new Map();

  bloques.forEach((bloque) => {
    const nombre = obtenerNombreDocente(bloque);

    const clave = normalizarTextoPizarra(nombre);

    if (!docentesPorClave.has(clave)) {
      docentesPorClave.set(clave, nombre);
    }
  });

  const conflictos = construirConflictosDocentes(bloques);

  /*
   * Primero se asignan los colores a los docentes
   * que aparecen junto a más colegas.
   */
  const docentesOrdenados = Array.from(docentesPorClave.entries()).sort(
    ([claveA, nombreA], [claveB, nombreB]) => {
      const cantidadConflictosA = conflictos.get(claveA)?.size || 0;

      const cantidadConflictosB = conflictos.get(claveB)?.size || 0;

      if (cantidadConflictosA !== cantidadConflictosB) {
        return cantidadConflictosB - cantidadConflictosA;
      }

      return nombreA.localeCompare(nombreB, "es", {
        sensitivity: "base",
      });
    },
  );

  const coloresDisponibles = [...PALETA_DOCENTES];

  docentesOrdenados.forEach(([claveDocente], indiceDocente) => {
    /*
     * Si todavía quedan colores de la paleta,
     * seleccionamos el más distante respecto
     * de los docentes relacionados.
     */
    if (coloresDisponibles.length) {
      let mejorIndice = 0;
      let mejorPuntaje = -1;

      coloresDisponibles.forEach((colorCandidato, indiceColor) => {
        const puntaje = calcularPuntajeColor(
          colorCandidato,
          claveDocente,
          conflictos,
        );

        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejorIndice = indiceColor;
        }
      });

      const [colorElegido] = coloresDisponibles.splice(mejorIndice, 1);

      coloresDocentesPizarra.set(claveDocente, colorElegido);

      return;
    }

    /*
     * Respaldo para el caso excepcional de que
     * haya más docentes que colores preparados.
     */
    const indiceAdicional = indiceDocente - PALETA_DOCENTES.length;

    coloresDocentesPizarra.set(
      claveDocente,
      crearColorDocenteAdicional(indiceAdicional),
    );
  });
}

function obtenerColorDocente(docenteNombre) {
  const claveDocente = normalizarTextoPizarra(
    docenteNombre || "Docente sin cargar",
  );

  return (
    coloresDocentesPizarra.get(claveDocente) || {
      fondo: "#e5e7eb",
      borde: "#6b7280",
      texto: "#111827",
    }
  );
}

function obtenerEtiquetaTurno(turno) {
  const valor = String(turno || "")
    .trim()
    .toUpperCase();

  if (valor === "MANANA") return "Mañana";
  if (valor === "TARDE") return "Tarde";

  return valor || "-";
}

function obtenerNombreCurso(bloque) {
  const cursoNombre = String(bloque.cursoNombre || "").trim();

  if (cursoNombre) return cursoNombre;

  const anio = bloque.cursoAnio || "";
  const division = bloque.cursoDivision || "";

  if (!anio && !division) return "Curso sin cargar";

  return `${anio}º ${division}`;
}

function obtenerHorarioBloque(bloque) {
  if (bloque.horarioTexto) return bloque.horarioTexto;

  const inicio = bloque.horaInicio || "";
  const fin = bloque.horaFin || "";

  if (!inicio && !fin) return "-";

  return `${inicio || "-"} a ${fin || "-"}`;
}

function normalizarHoraPizarra(valor) {
  const coincidencia = String(valor || "")
    .trim()
    .match(/(\d{1,2}):(\d{2})/);

  if (!coincidencia) {
    return "";
  }

  return `${coincidencia[1].padStart(2, "0")}:${coincidencia[2]}`;
}

function obtenerHorasDelBloque(bloque) {
  let inicio = normalizarHoraPizarra(bloque.horaInicio);

  let fin = normalizarHoraPizarra(bloque.horaFin);

  /*
   * Respaldo para documentos que tengan horarioTexto
   * pero no horaInicio u horaFin.
   */
  if ((!inicio || !fin) && bloque.horarioTexto) {
    const horas = String(bloque.horarioTexto).match(/\d{1,2}:\d{2}/g);

    if (horas?.length >= 2) {
      inicio = normalizarHoraPizarra(horas[0]);
      fin = normalizarHoraPizarra(horas[1]);
    }
  }

  return {
    inicio,
    fin,
  };
}

function obtenerClaveHorario(inicio, fin) {
  return `${inicio}|${fin}`;
}

function obtenerClaveHorarioBloque(bloque) {
  const { inicio, fin } = obtenerHorasDelBloque(bloque);

  return obtenerClaveHorario(inicio, fin);
}

function obtenerTextoExtraBloque(bloque) {
  const partes = [];

  if (bloque.grupoTaller) {
    partes.push(`Grupo ${bloque.grupoTaller}`);
  }

  if (bloque.ubicacion) {
    partes.push(bloque.ubicacion);
  }

  return partes.join(" · ");
}

function obtenerIndiceDia(diaValor) {
  const indice = DIAS_PIZARRA.findIndex((dia) => dia.valor === diaValor);
  return indice === -1 ? 999 : indice;
}

function ordenarBloquesPizarra(bloques) {
  return bloques.sort((a, b) => {
    const diaA = obtenerIndiceDia(a.dia);
    const diaB = obtenerIndiceDia(b.dia);

    if (diaA !== diaB) return diaA - diaB;

    const horaA = String(a.horaInicio || "");
    const horaB = String(b.horaInicio || "");

    if (horaA !== horaB) return horaA.localeCompare(horaB);

    return obtenerNombreCurso(a).localeCompare(obtenerNombreCurso(b), "es");
  });
}

function renderizarTarjetaBloque(bloque) {
  const espacio = bloque.espacioCurricular || "Espacio sin cargar";

  const docente = obtenerNombreDocente(bloque);
  const colores = obtenerColorDocente(docente);

  return `
    <article
      class="tarjeta-horario"
      style="
        --color-fondo: ${colores.fondo};
        --color-borde: ${colores.borde};
        --color-texto: ${colores.texto};
      "
    >
      <div class="tarjeta-horario-hora">
        ${obtenerHorarioBloque(bloque)}
      </div>

      <div class="tarjeta-horario-curso">
        ${obtenerNombreCurso(bloque)}
      </div>

      <div class="tarjeta-horario-espacio">
        ${espacio}
      </div>

<div class="tarjeta-horario-docente">
  ${docente}
</div>

      ${
        obtenerTextoExtraBloque(bloque)
          ? `<div class="tarjeta-horario-extra">
              ${obtenerTextoExtraBloque(bloque)}
            </div>`
          : ""
      }
    </article>
  `;
}

function agruparBloquesPorCurso(bloques) {
  const cursos = new Map();

  bloques.forEach((bloque) => {
    const curso = obtenerNombreCurso(bloque);

    if (!cursos.has(curso)) {
      cursos.set(curso, []);
    }

    cursos.get(curso).push(bloque);
  });

  return Array.from(cursos.entries()).sort(([cursoA], [cursoB]) =>
    cursoA.localeCompare(cursoB, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function renderizarGrillaHorariaAula(cursosDelDia, turnoValor) {
  const estructuraTurno = GRILLAS_HORARIAS_AULA[turnoValor];

  if (!estructuraTurno) {
    return "";
  }

  const bloquesPermitidos = estructuraTurno.filter(
    (item) => item.tipo === "BLOQUE",
  );

  const clavesPermitidas = new Set(
    bloquesPermitidos.map((item) => obtenerClaveHorario(item.inicio, item.fin)),
  );

  const encabezadosCursos = cursosDelDia
    .map(
      ([curso], indiceCurso) => `
        <div
          class="encabezado-curso-grilla"
          style="
            grid-column: ${indiceCurso + 1};
            grid-row: 1;
          "
        >
          ${curso}
        </div>
      `,
    )
    .join("");

  const filasRecreo = estructuraTurno
    .map((item, indiceFila) => {
      if (item.tipo !== "RECREO") {
        return "";
      }

      return `
        <div
          class="fila-recreo-aula"
          style="
            grid-column: 1 / -1;
            grid-row: ${indiceFila + 2};
          "
        >
          <span>
            Recreo · ${item.inicio} a ${item.fin}
          </span>
        </div>
      `;
    })
    .join("");

  const celdasCursos = cursosDelDia
    .map(([, bloquesCurso], indiceCurso) => {
      const bloquesPorHorario = new Map();

      bloquesCurso.forEach((bloque) => {
        const clave = obtenerClaveHorarioBloque(bloque);

        if (!bloquesPorHorario.has(clave)) {
          bloquesPorHorario.set(clave, []);
        }

        bloquesPorHorario.get(clave).push(bloque);
      });

      return estructuraTurno
        .map((item, indiceFila) => {
          if (item.tipo !== "BLOQUE") {
            return "";
          }

          const clave = obtenerClaveHorario(item.inicio, item.fin);

          const bloquesCelda = bloquesPorHorario.get(clave) || [];

          return `
            <div
              class="celda-bloque-aula ${
                bloquesCelda.length
                  ? "celda-bloque-aula-ocupada"
                  : "celda-bloque-aula-vacia"
              }"
              style="
                grid-column: ${indiceCurso + 1};
                grid-row: ${indiceFila + 2};
              "
            >
              ${
                bloquesCelda.length
                  ? bloquesCelda.map(renderizarTarjetaBloque).join("")
                  : `<span class="marca-bloque-vacio">
                      Bloque ${item.numero}
                    </span>`
              }
            </div>
          `;
        })
        .join("");
    })
    .join("");

  /*
   * Ningún bloque queda oculto si su horario no coincide
   * con la grilla institucional configurada.
   */
  const bloquesFueraDeGrilla = cursosDelDia.flatMap(([curso, bloquesCurso]) =>
    bloquesCurso
      .filter(
        (bloque) => !clavesPermitidas.has(obtenerClaveHorarioBloque(bloque)),
      )
      .map((bloque) => ({
        curso,
        bloque,
      })),
  );

  const avisoFueraDeGrilla = bloquesFueraDeGrilla.length
    ? `
        <div class="aviso-bloques-fuera-grilla">
          <strong>
            Bloques con horarios fuera de la grilla:
          </strong>

          ${bloquesFueraDeGrilla
            .map(
              ({ curso, bloque }) => `
                <span>
                  ${curso} ·
                  ${obtenerHorarioBloque(bloque)}
                </span>
              `,
            )
            .join("")}
        </div>
      `
    : "";

  return `
    <div
      class="grilla-horaria-aula"
      style="
        --cantidad-cursos: ${cursosDelDia.length};
      "
    >
      ${encabezadosCursos}
      ${filasRecreo}
      ${celdasCursos}
    </div>

    ${avisoFueraDeGrilla}
  `;
}

function ordenarBloquesSemanales(bloques) {
  return [...bloques].sort((bloqueA, bloqueB) => {
    const cursoA = obtenerNombreCurso(bloqueA);
    const cursoB = obtenerNombreCurso(bloqueB);

    const comparacionCurso = cursoA.localeCompare(cursoB, "es", {
      numeric: true,
      sensitivity: "base",
    });

    if (comparacionCurso !== 0) {
      return comparacionCurso;
    }

    const grupoA = String(bloqueA.grupoTaller || "").trim();
    const grupoB = String(bloqueB.grupoTaller || "").trim();

    const comparacionGrupo = grupoA.localeCompare(grupoB, "es", {
      numeric: true,
      sensitivity: "base",
    });

    if (comparacionGrupo !== 0) {
      return comparacionGrupo;
    }

    const horaA = normalizarHoraPizarra(bloqueA.horaInicio);
    const horaB = normalizarHoraPizarra(bloqueB.horaInicio);

    if (horaA !== horaB) {
      return horaA.localeCompare(horaB);
    }

    return String(bloqueA.espacioCurricular || "").localeCompare(
      String(bloqueB.espacioCurricular || ""),
      "es",
      {
        sensitivity: "base",
      },
    );
  });
}

function obtenerCursosSemanalesOrdenados(bloques) {
  return Array.from(
    new Set(
      bloques.map((bloque) => obtenerNombreCurso(bloque)).filter(Boolean),
    ),
  ).sort((cursoA, cursoB) =>
    cursoA.localeCompare(cursoB, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function renderizarGrillaSemanal(bloquesTurno) {
  const htmlColumnas = DIAS_PIZARRA.map((dia) => {
    const bloquesDia = ordenarBloquesSemanales(
      bloquesTurno.filter((bloque) => bloque.dia === dia.valor),
    );

    return `
      <section class="columna-dia-semanal">
        <h4>${dia.etiqueta}</h4>

        <div class="bloques-dia-semanal">
          ${
            bloquesDia.length
              ? bloquesDia.map(renderizarTarjetaBloque).join("")
              : `<p class="sin-bloques sin-bloques-dia-semanal">
                  Sin bloques cargados.
                </p>`
          }
        </div>
      </section>
    `;
  }).join("");

  return `
    <div class="grilla-semanal-pizarra">
      ${htmlColumnas}
    </div>
  `;
}

function renderizarTallerTardeEnPaginas(bloquesTurno) {
  const cursosOrdenados = obtenerCursosSemanalesOrdenados(bloquesTurno);
  const gruposDeCursos = [];

  /*
   * Taller del turno tarde se divide en páginas de cinco
   * cursos, pero cada página conserva los cinco días.
   */
  for (let indice = 0; indice < cursosOrdenados.length; indice += 5) {
    gruposDeCursos.push(cursosOrdenados.slice(indice, indice + 5));
  }

  const htmlPaginas = gruposDeCursos
    .map((cursosPagina, indicePagina) => {
      const clavesCursosPagina = new Set(
        cursosPagina.map((curso) => normalizarTextoPizarra(curso)),
      );

      const bloquesPagina = bloquesTurno.filter((bloque) =>
        clavesCursosPagina.has(
          normalizarTextoPizarra(obtenerNombreCurso(bloque)),
        ),
      );

      const etiquetaCursos = cursosPagina.join(" · ");

      return `
        <section
          class="pagina-semanal-pizarra pagina-taller-tarde"
          data-pagina="${indicePagina + 1}"
          data-cursos="Cursos: ${etiquetaCursos}"
        >
          <div class="titulo-cursos-pagina">
            Cursos: ${etiquetaCursos}
          </div>

          ${renderizarGrillaSemanal(bloquesPagina)}
        </section>
      `;
    })
    .join("");

  return `
    <div class="paginas-taller-tarde">
      ${htmlPaginas}
    </div>
  `;
}

function renderizarGrillaTurno(bloquesTurno, tipoHorario, turnoValor) {
  const usarGrillaHorariaAula =
    tipoHorario === "AULA" && ["MANANA", "TARDE"].includes(turnoValor);

  /*
   * Taller del turno tarde conserva los cinco días, pero se
   * divide en páginas de cinco cursos para mejorar la lectura.
   */
  if (tipoHorario === "TALLER" && turnoValor === "TARDE") {
    return renderizarTallerTardeEnPaginas(bloquesTurno);
  }

  /*
   * Taller turno mañana y Educación Física usan una grilla
   * semanal: una columna por cada día.
   */
  if (!usarGrillaHorariaAula) {
    return renderizarGrillaSemanal(bloquesTurno);
  }

  const htmlDias = DIAS_PIZARRA.map((dia) => {
    const bloquesDia = ordenarBloquesPizarra(
      bloquesTurno.filter((bloque) => bloque.dia === dia.valor),
    );

    const cursosDelDia = agruparBloquesPorCurso(bloquesDia);

    const contenidoDia = cursosDelDia.length
      ? renderizarGrillaHorariaAula(cursosDelDia, turnoValor)
      : `<p class="sin-bloques">
          Sin bloques cargados para este día.
        </p>`;

    return `
      <section class="bloque-dia-pizarra">
        <h4>${dia.etiqueta}</h4>

        ${contenidoDia}
      </section>
    `;
  }).join("");

  return `
    <div class="grilla-dias-por-curso">
      ${htmlDias}
    </div>
  `;
}

function renderizarSeccionTipo(tipo, bloques) {
  const claseTipo = `seccion-pizarra-${tipo.valor
    .toLowerCase()
    .replace(/_/g, "-")}`;

  const bloquesTipo = bloques.filter(
    (bloque) =>
      String(bloque.tipoHorario || "")
        .trim()
        .toUpperCase() === tipo.valor,
  );

  if (!bloquesTipo.length) {
    return `
      <section class="seccion-pizarra ${claseTipo}">
        <h2>${tipo.titulo}</h2>
        <p class="sin-datos-seccion">
          No hay horarios cargados para esta sección.
        </p>
      </section>
    `;
  }

  const htmlTurnos = TURNOS_PIZARRA.map((turno) => {
    const bloquesTurno = bloquesTipo.filter(
      (bloque) =>
        String(bloque.turno || "")
          .trim()
          .toUpperCase() === turno.valor,
    );

    const claseTurno = `turno-pizarra-${turno.valor.toLowerCase()}`;

    if (!bloquesTurno.length) {
      return "";
    }

    return `
      <section class="turno-pizarra ${claseTurno}">
        <h3>${turno.titulo}</h3>

        ${renderizarGrillaTurno(
          ordenarBloquesPizarra(bloquesTurno),
          tipo.valor,
          turno.valor,
        )}
      </section>
    `;
  }).join("");

  return `
    <section class="seccion-pizarra ${claseTipo}">
      <h2>${tipo.titulo}</h2>
      ${htmlTurnos}
    </section>
  `;
}

function generarLeyendaColores(bloques) {
  const docentes = new Map();

  bloques.forEach((bloque) => {
    const docente = obtenerNombreDocente(bloque);
    const clave = normalizarTextoPizarra(docente);

    if (!docentes.has(clave)) {
      docentes.set(clave, {
        nombre: docente,
        colores: obtenerColorDocente(docente),
      });
    }
  });

  const htmlItems = Array.from(docentes.values())
    .sort((docenteA, docenteB) =>
      docenteA.nombre.localeCompare(docenteB.nombre, "es"),
    )
    .map(
      ({ nombre, colores }) => `
        <span
          class="item-leyenda"
          style="
            --color-fondo: ${colores.fondo};
            --color-borde: ${colores.borde};
            --color-texto: ${colores.texto};
          "
        >
          ${nombre}
        </span>
      `,
    )
    .join("");

  return `
    <section class="leyenda-colores">
      <h2>Referencias por docente</h2>

      <div class="items-leyenda">
        ${htmlItems || "<p>No hay docentes para referenciar.</p>"}
      </div>
    </section>
  `;
}

function obtenerFechaGeneracion() {
  return new Date().toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function obtenerRutaCssPizarra() {
  const baseUrl = new URL(
    "../assets/css/pizarra-horarios-admin.css",
    window.location.href,
  );
  return baseUrl.href;
}

function obtenerRutaLogo() {
  const baseUrl = new URL("../assets/img/logo.png", window.location.href);
  return baseUrl.href;
}

function construirHtmlPizarra(bloques) {
  const bloquesOrdenados = ordenarBloquesPizarra([...bloques]);

  prepararColoresDocentes(bloquesOrdenados);

  const htmlSecciones = TIPOS_PIZARRA.map((tipo) =>
    renderizarSeccionTipo(tipo, bloquesOrdenados),
  ).join("");

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Pizarra General de Horarios | E.E.T.P. Nº 495</title>

        <link
          rel="stylesheet"
          href="${obtenerRutaCssPizarra()}"
        />
      </head>

      <body>
        <div class="barra-acciones">
          <strong>Pizarra general de horarios</strong>

          <button type="button" onclick="window.print()">
            Imprimir / Guardar PDF
          </button>
        </div>

        <main class="pizarra">
          <header class="encabezado-pizarra">
            <img
              src="${obtenerRutaLogo()}"
              alt="Logo E.E.T.P. Nº 495"
            />

            <div>
              <h1>E.E.T.P. Nº 495 “Malvinas Argentinas”</h1>

              <p>
                Pizarra general de horarios institucionales · Generada el ${obtenerFechaGeneracion()}
              </p>
            </div>
          </header>

          ${htmlSecciones}
        </main>
      </body>
    </html>
  `;
}

function abrirPizarraImprimible(bloques) {
  const ventana = window.open("", "_blank");

  if (!ventana) {
    throw new Error(
      "El navegador bloqueó la ventana emergente. Permití pop-ups para generar la pizarra.",
    );
  }

  ventana.document.open();
  ventana.document.write(construirHtmlPizarra(bloques));
  ventana.document.close();
}

async function generarPizarraHorarios() {
  if (!btnGenerarPizarraHorarios) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("No se detectó una sesión activa. Volvé a iniciar sesión.");
  }

  const textoOriginal = btnGenerarPizarraHorarios.innerHTML;

  try {
    btnGenerarPizarraHorarios.disabled = true;

    btnGenerarPizarraHorarios.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Generando pizarra...
    `;

    mostrarMensajePizarra(
      "Consultando horarios activos y preparando vista imprimible...",
    );

    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
    );

    const resultado = await getDocs(consultaHorarios);

    const bloques = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (!["AULA", "TALLER", "EDUCACION_FISICA"].includes(tipoHorario)) {
        return;
      }

      bloques.push({
        id: documento.id,
        ...datos,
        tipoHorario,
      });
    });

    if (!bloques.length) {
      throw new Error(
        "No hay horarios activos cargados para generar la pizarra.",
      );
    }

    abrirPizarraImprimible(bloques);

    mostrarMensajePizarra(
      `Pizarra generada correctamente con ${bloques.length} bloques activos.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al generar pizarra de horarios:", error);

    mostrarMensajePizarra(
      error.message || "No se pudo generar la pizarra de horarios.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo generar la pizarra",
        text: error.message || "Ocurrió un error al generar la pizarra.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    btnGenerarPizarraHorarios.disabled = false;
    btnGenerarPizarraHorarios.innerHTML = textoOriginal;
  }
}

if (btnGenerarPizarraHorarios) {
  btnGenerarPizarraHorarios.addEventListener("click", generarPizarraHorarios);
}
