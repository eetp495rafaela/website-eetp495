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

function obtenerColorEspacio(espacioCurricular) {
  const texto = normalizarTextoPizarra(espacioCurricular || "Sin espacio");

  let hash = 0;

  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }

  const tono = Math.abs(hash) % 360;

  return {
    fondo: `hsl(${tono}, 78%, 90%)`,
    borde: `hsl(${tono}, 70%, 42%)`,
    texto: `hsl(${tono}, 72%, 22%)`,
  };
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
  const colores = obtenerColorEspacio(espacio);

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
        ${bloque.docenteNombre || "Docente sin cargar"}
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

function renderizarGrillaTurno(bloquesTurno) {
  const htmlDias = DIAS_PIZARRA.map((dia) => {
    const bloquesDia = ordenarBloquesPizarra(
      bloquesTurno.filter((bloque) => bloque.dia === dia.valor),
    );

    const cursosDelDia = agruparBloquesPorCurso(bloquesDia);

    return `
      <section class="bloque-dia-pizarra">
        <h4>${dia.etiqueta}</h4>

        ${
          cursosDelDia.length
            ? `<div class="grilla-cursos-dia">
                ${cursosDelDia
                  .map(
                    ([curso, bloquesCurso]) => `
                      <article class="columna-curso-dia">
                        <h5>${curso}</h5>

                        <div class="bloques-curso-dia">
                          ${ordenarBloquesPizarra(bloquesCurso)
                            .map(renderizarTarjetaBloque)
                            .join("")}
                        </div>
                      </article>
                    `,
                  )
                  .join("")}
              </div>`
            : `<p class="sin-bloques">Sin bloques cargados para este día.</p>`
        }
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
  const bloquesTipo = bloques.filter(
    (bloque) =>
      String(bloque.tipoHorario || "")
        .trim()
        .toUpperCase() === tipo.valor,
  );

  if (!bloquesTipo.length) {
    return `
      <section class="seccion-pizarra">
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

    return `
      <section class="turno-pizarra">
        <h3>${turno.titulo}</h3>

        ${
          bloquesTurno.length
            ? renderizarGrillaTurno(ordenarBloquesPizarra(bloquesTurno))
            : `<p class="sin-datos-seccion">
                No hay bloques cargados en ${turno.titulo.toLowerCase()}.
              </p>`
        }
      </section>
    `;
  }).join("");

  return `
    <section class="seccion-pizarra">
      <h2>${tipo.titulo}</h2>
      ${htmlTurnos}
    </section>
  `;
}

function generarLeyendaColores(bloques) {
  const espacios = new Map();

  bloques.forEach((bloque) => {
    const espacio = String(
      bloque.espacioCurricular || "Espacio sin cargar",
    ).trim();

    if (!espacios.has(espacio)) {
      espacios.set(espacio, obtenerColorEspacio(espacio));
    }
  });

  const htmlItems = Array.from(espacios.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(
      ([espacio, colores]) => `
        <span
          class="item-leyenda"
          style="
            --color-fondo: ${colores.fondo};
            --color-borde: ${colores.borde};
            --color-texto: ${colores.texto};
          "
        >
          ${espacio}
        </span>
      `,
    )
    .join("");

  return `
    <section class="leyenda-colores">
      <h2>Referencias por espacio curricular</h2>

      <div class="items-leyenda">
        ${htmlItems || "<p>No hay espacios para referenciar.</p>"}
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
