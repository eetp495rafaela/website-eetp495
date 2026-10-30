import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const vistaHorarioAulaAlumno = document.getElementById(
  "vistaHorarioAulaAlumno",
);

const btnVerMiHorario = document.getElementById("btnVerMiHorario");

let usuarioHorarioAlumnoActual = null;
let horarioAlumnoCargado = false;

const DIAS_HORARIO_AULA_ALUMNO = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const DIAS_HORARIO_TALLER_ALUMNO = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const DIAS_HORARIO_EF_ALUMNO = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

function normalizarCorreoHorarioAlumno(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function mostrarMensajeHorarioAlumno(texto, tipo = "") {
  if (!vistaHorarioAulaAlumno) return;

  vistaHorarioAulaAlumno.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

// Grilla especial de Aula para 6.º año: cada franja horaria es una fila compartida.
// Se utilizan las franjas reales del horario de Aula; los huecos se dejan vacíos.
const FRANJAS_AULA_SEXTO = {
  MANANA: [
    ["07:15", "07:55"],
    ["07:55", "08:35"],
    ["08:45", "09:25"],
    ["09:25", "10:05"],
    ["10:15", "10:55"],
    ["10:55", "11:35"],
    ["11:40", "12:20"],
  ],
  TARDE: [
    ["13:15", "13:55"],
    ["13:55", "14:35"],
    ["14:45", "15:25"],
    ["15:25", "16:05"],
    ["16:15", "16:55"],
    ["16:55", "17:35"],
    ["17:40", "18:20"],
  ],
};

function textoSeguroAulaSexto(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function horaNormalizadaAulaSexto(valor) {
  const hora = String(valor || "").trim();
  const partes = /^(\d{1,2}):(\d{2})$/.exec(hora);
  return partes ? `${partes[1].padStart(2, "0")}:${partes[2]}` : hora;
}

function turnoBloqueAulaSexto(bloque) {
  const turno = String(bloque.turno || "").trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (turno === "MANANA" || turno === "TARDE") return turno;
  // Compatibilidad con horarios antiguos sin turno registrado.
  return horaNormalizadaAulaSexto(bloque.horaInicio) < "13:00" ? "MANANA" : "TARDE";
}

function tarjetaBloqueAulaSexto(bloque) {
  return `<div class="tarjeta-bloque-horario-alumno">
    <div class="bloque-horario-hora-alumno">${textoSeguroAulaSexto(bloque.horaInicio || "-")} a ${textoSeguroAulaSexto(bloque.horaFin || "-")}</div>
    <div class="bloque-horario-materia-alumno">${textoSeguroAulaSexto(bloque.espacioCurricular || "-")}</div>
    <div class="bloque-horario-docente-alumno">${textoSeguroAulaSexto(bloque.docenteNombre || "Docente sin cargar")}</div>
    ${bloque.ubicacion ? `<div class="bloque-horario-ubicacion-alumno">${textoSeguroAulaSexto(bloque.ubicacion)}</div>` : ""}
  </div>`;
}

function renderizarGrillaAulaSextoAlumno(bloquesAula) {
  const resultado = [];
  for (const turno of ["MANANA", "TARDE"]) {
    const bloquesTurno = bloquesAula.filter((bloque) => turnoBloqueAulaSexto(bloque) === turno);
    if (!bloquesTurno.length) continue;

    // Incluir TODAS las franjas desde el inicio del turno hasta el último bloque
    // ocupado de la semana, incluso si están libres todos los días.
    const franjasBase = FRANJAS_AULA_SEXTO[turno];
    const franjasPorHora = new Map(franjasBase.map(([inicio, fin]) => [inicio, fin]));
    for (const bloque of bloquesTurno) {
      const inicio = horaNormalizadaAulaSexto(bloque.horaInicio);
      if (inicio && !franjasPorHora.has(inicio)) {
        // No ocultar horarios excepcionales cargados fuera de la grilla usual.
        franjasPorHora.set(inicio, horaNormalizadaAulaSexto(bloque.horaFin));
      }
    }
    const ultimaHora = bloquesTurno.reduce((ultima, bloque) => {
      const inicio = horaNormalizadaAulaSexto(bloque.horaInicio);
      return inicio > ultima ? inicio : ultima;
    }, "");
    const franjas = Array.from(franjasPorHora, ([inicio, fin]) => ({ inicio, fin }))
      .filter(({ inicio }) => inicio <= ultimaHora)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));

    const cabecera = `<div class="horario-sexto-cabecera horario-sexto-hora-titulo">Hora</div>` +
      DIAS_HORARIO_AULA_ALUMNO.map((dia) =>
        `<div class="horario-sexto-cabecera">${dia.etiqueta}</div>`
      ).join("");

    const filas = franjas.map(({ inicio, fin }) => {
      const horario = `<div class="horario-sexto-hora">${textoSeguroAulaSexto(inicio)}<span>a ${textoSeguroAulaSexto(fin)}</span></div>`;
      const dias = DIAS_HORARIO_AULA_ALUMNO.map((dia) => {
        const bloquesCelda = bloquesTurno.filter((bloque) =>
          bloque.dia === dia.valor && horaNormalizadaAulaSexto(bloque.horaInicio) === inicio
        );
        return `<div class="horario-sexto-celda ${bloquesCelda.length ? "con-clase" : "sin-clase"}" ${bloquesCelda.length ? "" : 'aria-label="Sin clase en este horario"'}>
          ${bloquesCelda.length ? bloquesCelda.map(tarjetaBloqueAulaSexto).join("") : '<span aria-hidden="true">—</span>'}
        </div>`;
      }).join("");
      return horario + dias;
    }).join("");

    const titulo = turno === "MANANA" ? "Turno Mañana" : "Turno Tarde";
    resultado.push(`<section class="horario-sexto-turno" aria-label="${titulo}">
      <h4 class="horario-sexto-titulo">${titulo}</h4>
      <div class="horario-sexto-desplazamiento" tabindex="0" aria-label="Grilla semanal de ${titulo}; desplazamiento horizontal disponible en pantallas pequeñas">
        <div class="horario-sexto-grilla">${cabecera}${filas}</div>
      </div>
    </section>`);
  }
  return `<div class="horario-aula-sexto-alumno">${resultado.join("")}</div>`;
}

function renderizarHorarioCompletoAlumno(
  bloquesAula,
  bloquesTaller,
  bloquesEducacionFisica,
  perfilAlumno,
) {
  if (!vistaHorarioAulaAlumno) return;

  const cursoVisible = String(perfilAlumno.cursoNombre || "").trim();
  const grupoTaller = String(perfilAlumno.grupoTaller || "")
    .trim()
    .toUpperCase();

  const htmlAula = DIAS_HORARIO_AULA_ALUMNO.map((dia) => {
    const bloquesDia = bloquesAula
      .filter((bloque) => bloque.dia === dia.valor)
      .sort(
        (a, b) => String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-alumno">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-alumno">
                      <div class="bloque-horario-hora-alumno">
                        ${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}
                      </div>

                      <div class="bloque-horario-materia-alumno">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      <div class="bloque-horario-docente-alumno">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-alumno">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin clases cargadas.</p>`
        }
      </div>
    `;
  }).join("");

  const htmlTaller = DIAS_HORARIO_TALLER_ALUMNO.map((dia) => {
    const bloquesDia = bloquesTaller
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-alumno">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-alumno">
                      <div class="bloque-horario-hora-alumno">
                        ${
                          bloque.horarioTexto ||
                          `${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}`
                        }
                      </div>

                      <div class="bloque-horario-materia-alumno">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      <div class="bloque-horario-docente-alumno">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      <div class="bloque-horario-ubicacion-alumno">
                        Grupo: ${bloque.grupoTaller || grupoTaller || "-"}
                      </div>

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-alumno">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin taller cargado.</p>`
        }
      </div>
    `;
  }).join("");

  const htmlEducacionFisica = DIAS_HORARIO_EF_ALUMNO.map((dia) => {
    const bloquesDia = bloquesEducacionFisica
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-alumno">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-alumno">
                      <div class="bloque-horario-hora-alumno">
                        ${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}
                      </div>

                      <div class="bloque-horario-materia-alumno">
                        ${bloque.espacioCurricular || "Educación Física"}
                      </div>

                      <div class="bloque-horario-docente-alumno">
                        ${bloque.docenteNombre || "Docente sin cargar"}
                      </div>

                      ${
                        bloque.turno
                          ? `<div class="bloque-horario-ubicacion-alumno">
                              Turno: ${
                                String(bloque.turno || "").trim() === "MANANA"
                                  ? "Mañana"
                                  : String(bloque.turno || "").trim() ===
                                      "TARDE"
                                    ? "Tarde"
                                    : bloque.turno
                              }
                            </div>`
                          : ""
                      }

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-alumno">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin Educación Física cargada.</p>`
        }
      </div>
    `;
  }).join("");

  vistaHorarioAulaAlumno.innerHTML = `
    <div class="encabezado-horario-alumno">
      <strong>Curso:</strong>
      ${cursoVisible || `${perfilAlumno.cursoAnio}º ${perfilAlumno.cursoDivision}`}

      ${
        grupoTaller
          ? `<span class="separador-horario-alumno">|</span>
             <strong>Grupo de taller:</strong> ${grupoTaller}`
          : ""
      }
    </div>

    <section class="bloque-horario-seccion-alumno">
      <div class="titulo-horario-seccion-alumno">
        <h3>Horario de Aula</h3>
        <p>Clases semanales correspondientes a tu curso.</p>
      </div>

      ${
        bloquesAula.length
          ? Number(perfilAlumno.cursoAnio || 0) === 6
            ? renderizarGrillaAulaSextoAlumno(bloquesAula)
            : `<div class="grilla-horario-aula-alumno">${htmlAula}</div>`
          : `<p class="mensaje-formulario">Todavía no hay horarios de aula cargados para tu curso.</p>`
      }
    </section>

        <section class="bloque-horario-seccion-alumno">
      <div class="titulo-horario-seccion-alumno">
        <h3>Horario de Taller</h3>
        <p>
          ${
            grupoTaller
              ? `Taller correspondiente a tu grupo asignado: ${grupoTaller}.`
              : "Tu cuenta todavía no tiene grupo de taller asignado."
          }
        </p>
      </div>

      ${
        grupoTaller
          ? bloquesTaller.length
            ? `<div class="grilla-horario-aula-alumno">${htmlTaller}</div>`
            : `<p class="mensaje-formulario">Todavía no hay horarios de taller cargados para tu grupo.</p>`
          : `<p class="mensaje-formulario error">
              Consultá con Preceptoría o Soporte para que asignen tu grupo de taller.
            </p>`
      }
    </section>

    <section class="bloque-horario-seccion-alumno">
      <div class="titulo-horario-seccion-alumno">
        <h3>Educación Física</h3>
        <p>Clases de Educación Física correspondientes a tu curso.</p>
      </div>

      ${
        bloquesEducacionFisica.length
          ? `<div class="grilla-horario-aula-alumno">${htmlEducacionFisica}</div>`
          : `<p class="mensaje-formulario">Todavía no hay horarios de Educación Física cargados para tu curso.</p>`
      }
    </section>
  `;
}

function obtenerFechaActualHorarioAlumno() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function reemplazoHorarioAlumnoEstaVigente(reemplazo) {
  const estado = String(reemplazo.estado || "")
    .trim()
    .toUpperCase();

  const fechaDesde = String(reemplazo.fechaDesde || "").trim();

  const fechaHasta = String(reemplazo.fechaHasta || "").trim();

  const hoy = obtenerFechaActualHorarioAlumno();

  return (
    estado === "ACTIVO" &&
    fechaDesde &&
    fechaHasta &&
    hoy >= fechaDesde &&
    hoy <= fechaHasta
  );
}

function bloqueHorarioAlumnoPerteneceAReemplazo(bloque, reemplazo) {
  const tipoBloque = String(bloque.tipoHorario || "")
    .trim()
    .toUpperCase();

  const tipoReemplazo = String(reemplazo.tipoHorario || "")
    .trim()
    .toUpperCase();

  if (tipoBloque !== tipoReemplazo) {
    return false;
  }

  if (
    normalizarCorreoHorarioAlumno(bloque.docenteCorreo) !==
    normalizarCorreoHorarioAlumno(reemplazo.titularCorreo)
  ) {
    return false;
  }

  const asignacionBloque = String(bloque.asignacionId || "").trim();

  const asignacionReemplazo = String(
    reemplazo.asignacionTitularId || "",
  ).trim();

  if (asignacionBloque && asignacionReemplazo) {
    return asignacionBloque === asignacionReemplazo;
  }

  return (
    String(bloque.cursoId || "").trim() ===
      String(reemplazo.cursoId || "").trim() &&
    String(bloque.espacioId || "").trim() ===
      String(reemplazo.espacioId || "").trim()
  );
}

function aplicarReemplazoVisualHorarioAlumno(bloque, reemplazos) {
  const tipoHorario = String(bloque.tipoHorario || "")
    .trim()
    .toUpperCase();

  if (tipoHorario !== "TALLER" && tipoHorario !== "EDUCACION_FISICA") {
    return bloque;
  }

  const reemplazo = reemplazos.find(
    (item) =>
      reemplazoHorarioAlumnoEstaVigente(item) &&
      bloqueHorarioAlumnoPerteneceAReemplazo(bloque, item),
  );

  if (!reemplazo) {
    return bloque;
  }

  return {
    ...bloque,

    docenteTitularNombre: bloque.docenteNombre || "",

    docenteTitularCorreo: bloque.docenteCorreo || "",

    docenteNombre: `${
      reemplazo.reemplazanteNombre ||
      reemplazo.reemplazanteCorreo ||
      "Docente reemplazante"
    } (Reemplazante)`,

    docenteCorreo: reemplazo.reemplazanteCorreo || "",
  };
}

async function cargarHorarioAulaAlumno(usuario) {
  if (!vistaHorarioAulaAlumno) return;

  mostrarMensajeHorarioAlumno("Cargando horario de aula...");

  try {
    const correo = normalizarCorreoHorarioAlumno(usuario.email);
    const referenciaUsuario = doc(db, "usuarios", correo);
    const documentoUsuario = await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) {
      throw new Error("No se encontró tu perfil de estudiante.");
    }

    const perfilAlumno = documentoUsuario.data();

    const cursoAnio = Number(perfilAlumno.cursoAnio || 0);
    const cursoDivision = String(perfilAlumno.cursoDivision || "")
      .trim()
      .toUpperCase();

    if (!cursoAnio || !cursoDivision) {
      throw new Error(
        "Tu cuenta todavía no tiene un curso asignado. Consultá con Soporte o Preceptoría.",
      );
    }

    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("cursoAnio", "==", cursoAnio),
      where("cursoDivision", "==", cursoDivision),
    );

    const resultado = await getDocs(consultaHorarios);

    const cursoId = String(perfilAlumno.cursoId || "").trim();

    let reemplazosHorarioAlumno = [];

    if (cursoId) {
      const consultaReemplazos = query(
        collection(db, "reemplazos_docentes"),
        where("cursoId", "==", cursoId),
      );

      const resultadoReemplazos = await getDocs(consultaReemplazos);

      reemplazosHorarioAlumno = resultadoReemplazos.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));
    }

    const grupoTallerAlumno = String(perfilAlumno.grupoTaller || "")
      .trim()
      .toUpperCase();

    const bloquesAula = [];
    const bloquesTaller = [];
    const bloquesEducacionFisica = [];

    resultado.forEach((documento) => {
      const datosOriginales = {
        id: documento.id,
        ...documento.data(),
      };

      const datos = aplicarReemplazoVisualHorarioAlumno(
        datosOriginales,
        reemplazosHorarioAlumno,
      );

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (tipoHorario === "AULA") {
        bloquesAula.push({
          id: documento.id,
          ...datos,
        });

        return;
      }

      if (tipoHorario === "TALLER") {
        const grupoTallerBloque = String(datos.grupoTaller || "")
          .trim()
          .toUpperCase();

        if (!grupoTallerAlumno) return;
        if (grupoTallerBloque !== grupoTallerAlumno) return;

        bloquesTaller.push({
          id: documento.id,
          ...datos,
        });

        return;
      }

      if (tipoHorario === "EDUCACION_FISICA") {
        bloquesEducacionFisica.push({
          id: documento.id,
          ...datos,
        });
      }
    });

    bloquesAula.sort((a, b) => {
      const diaA = DIAS_HORARIO_AULA_ALUMNO.findIndex(
        (dia) => dia.valor === a.dia,
      );
      const diaB = DIAS_HORARIO_AULA_ALUMNO.findIndex(
        (dia) => dia.valor === b.dia,
      );

      if (diaA !== diaB) return diaA - diaB;

      return String(a.horaInicio || "").localeCompare(String(b.horaInicio || ""));
    });

    bloquesTaller.sort((a, b) => {
      const diaA = DIAS_HORARIO_TALLER_ALUMNO.findIndex(
        (dia) => dia.valor === a.dia,
      );
      const diaB = DIAS_HORARIO_TALLER_ALUMNO.findIndex(
        (dia) => dia.valor === b.dia,
      );

      if (diaA !== diaB) return diaA - diaB;

      return String(a.horaInicio || "").localeCompare(
        String(b.horaInicio || ""),
      );
    });

    bloquesEducacionFisica.sort((a, b) => {
      const diaA = DIAS_HORARIO_EF_ALUMNO.findIndex(
        (dia) => dia.valor === a.dia,
      );
      const diaB = DIAS_HORARIO_EF_ALUMNO.findIndex(
        (dia) => dia.valor === b.dia,
      );

      if (diaA !== diaB) return diaA - diaB;

      return String(a.horaInicio || "").localeCompare(
        String(b.horaInicio || ""),
      );
    });

    renderizarHorarioCompletoAlumno(
      bloquesAula,
      bloquesTaller,
      bloquesEducacionFisica,
      perfilAlumno,
    );
  } catch (error) {
    console.error("Error al cargar horario de aula del alumno:", error);

    mostrarMensajeHorarioAlumno(
      error.message || "No se pudo cargar tu horario de aula.",
      "error",
    );
  }
}

if (btnVerMiHorario) {
  btnVerMiHorario.addEventListener("click", async () => {
    if (!usuarioHorarioAlumnoActual) {
      mostrarMensajeHorarioAlumno(
        "No se detectó una sesión activa. Volvé a iniciar sesión.",
        "error",
      );

      return;
    }

    /*
     * Si el horario ya fue cargado,
     * solamente lo mostramos u ocultamos.
     */
    if (horarioAlumnoCargado) {
      const estaOculto = vistaHorarioAulaAlumno.hidden;

      vistaHorarioAulaAlumno.hidden = !estaOculto;

      btnVerMiHorario.innerHTML = estaOculto
        ? `
              <i class="fa-solid fa-eye-slash"></i>
              Ocultar mi horario
            `
        : `
              <i class="fa-solid fa-calendar-days"></i>
              Ver mi horario
            `;

      return;
    }

    /*
     * Primera consulta:
     * cargamos el horario normalmente.
     */
    btnVerMiHorario.disabled = true;

    btnVerMiHorario.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando...
      `;

    vistaHorarioAulaAlumno.hidden = false;

    try {
      await cargarHorarioAulaAlumno(usuarioHorarioAlumnoActual);

      horarioAlumnoCargado = Boolean(
        vistaHorarioAulaAlumno.querySelector(".bloque-horario-seccion-alumno"),
      );

      if (horarioAlumnoCargado) {
        btnVerMiHorario.innerHTML = `
            <i class="fa-solid fa-eye-slash"></i>
            Ocultar mi horario
          `;
      }
    } finally {
      btnVerMiHorario.disabled = false;

      if (!horarioAlumnoCargado) {
        btnVerMiHorario.innerHTML = `
            <i class="fa-solid fa-calendar-days"></i>
            Ver mi horario
          `;
      }
    }
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioHorarioAlumnoActual = usuario;

  mostrarMensajeHorarioAlumno(
    "Todavía no se consultó tu horario. Presioná “Ver mi horario” para cargarlo.",
  );
});
