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

const vistaHorarioAulaDocente = document.getElementById(
  "vistaHorarioAulaDocente",
);

const vistaHorarioTallerDocente = document.getElementById(
  "vistaHorarioTallerDocente",
);
const vistaHorarioEducacionFisicaDocente = document.getElementById(
  "vistaHorarioEducacionFisicaDocente",
);

const btnVerMisHorariosDocente = document.getElementById(
  "btnVerMisHorariosDocente",
);

let usuarioHorarioDocenteActual = null;

const DIAS_HORARIO_DOCENTE = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

const TURNOS_HORARIO_DOCENTE = [
  {
    valor: "MANANA",
    etiqueta: "Turno Mañana",
  },
  {
    valor: "TARDE",
    etiqueta: "Turno Tarde",
  },
];

function normalizarCorreoDocente(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function mostrarMensajeHorarioDocente(texto, tipo = "") {
  if (!vistaHorarioAulaDocente) return;

  vistaHorarioAulaDocente.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

function mostrarMensajeHorarioTallerDocente(texto, tipo = "") {
  if (!vistaHorarioTallerDocente) return;

  vistaHorarioTallerDocente.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

function mostrarMensajeHorarioEducacionFisicaDocente(texto, tipo = "") {
  if (!vistaHorarioEducacionFisicaDocente) return;

  vistaHorarioEducacionFisicaDocente.innerHTML = `
    <p class="mensaje-formulario ${tipo === "error" ? "mensaje-error" : ""}">
      ${texto}
    </p>
  `;
}

function obtenerEtiquetaTurnoDocente(turno) {
  const valor = String(turno || "")
    .trim()
    .toUpperCase();

  if (valor === "MANANA") return "Mañana";
  if (valor === "TARDE") return "Tarde";

  return valor || "";
}

function renderizarHorarioAulaDocente(bloques) {
  if (!vistaHorarioAulaDocente) return;

  if (!bloques.length) {
    mostrarMensajeHorarioDocente("Todavía no tenés horarios de aula cargados.");

    return;
  }

  const htmlDias = DIAS_HORARIO_DOCENTE.map((dia) => {
    const bloquesDia = bloques.filter((bloque) => bloque.dia === dia.valor);

    const htmlTurnos = TURNOS_HORARIO_DOCENTE.map((turno) => {
      const bloquesTurno = bloquesDia
        .filter(
          (bloque) =>
            String(bloque.turno || "")
              .trim()
              .toUpperCase() === turno.valor,
        )
        .sort((a, b) => {
          const horaA = String(a.horaInicio || "");

          const horaB = String(b.horaInicio || "");

          if (horaA !== horaB) {
            return horaA.localeCompare(horaB);
          }

          return String(a.cursoNombre || "").localeCompare(
            String(b.cursoNombre || ""),
            "es",
          );
        });

      if (!bloquesTurno.length) {
        return "";
      }

      return `
              <div class="grupo-turno-horario-docente">

                <h5 class="titulo-turno-horario-docente">
                  ${turno.etiqueta}
                </h5>

                ${bloquesTurno
                  .map(
                    (bloque) => `
                      <div class="tarjeta-bloque-horario-docente">

                        <div class="bloque-horario-hora-docente">
                          ${bloque.horaInicio} a ${bloque.horaFin}
                        </div>

                        <div class="bloque-horario-curso-docente">
                          ${
                            bloque.cursoNombre ||
                            `${bloque.cursoAnio}º ${bloque.cursoDivision}`
                          }
                        </div>

                        <div class="bloque-horario-materia-docente">
                          ${bloque.espacioCurricular || "-"}
                        </div>

                        ${
                          bloque.ubicacion
                            ? `
                              <div class="bloque-horario-ubicacion-docente">
                                ${bloque.ubicacion}
                              </div>
                            `
                            : ""
                        }

                      </div>
                    `,
                  )
                  .join("")}

              </div>
            `;
    }).join("");

    return `
        <div class="dia-horario-docente">

          <h4>${dia.etiqueta}</h4>

          ${
            bloquesDia.length
              ? htmlTurnos
              : `
                <p class="mensaje-formulario">
                  Sin bloques asignados.
                </p>
              `
          }

        </div>
      `;
  }).join("");

  vistaHorarioAulaDocente.innerHTML = `
    <div class="grilla-horario-aula-docente">
      ${htmlDias}
    </div>
  `;
}

function renderizarHorarioTallerDocente(bloques) {
  if (!vistaHorarioTallerDocente) return;

  if (!bloques.length) {
    mostrarMensajeHorarioTallerDocente(
      "Todavía no tenés horarios de taller cargados.",
    );

    return;
  }

  const htmlDias = DIAS_HORARIO_DOCENTE.map((dia) => {
    const bloquesDia = bloques.filter((bloque) => bloque.dia === dia.valor);

    const htmlTurnos = TURNOS_HORARIO_DOCENTE.map((turno) => {
      const bloquesTurno = bloquesDia
        .filter(
          (bloque) =>
            String(bloque.turno || "")
              .trim()
              .toUpperCase() === turno.valor,
        )
        .sort((a, b) =>
          String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
        );

      if (!bloquesTurno.length) {
        return "";
      }

      return `
              <div class="grupo-turno-horario-docente">

                <h5 class="titulo-turno-horario-docente">
                  ${turno.etiqueta}
                </h5>

                ${bloquesTurno
                  .map(
                    (bloque) => `
                      <div class="tarjeta-bloque-horario-docente">

                        <div class="bloque-horario-hora-docente">
                          ${
                            bloque.horarioTexto ||
                            `${bloque.horaInicio || "-"} a ${
                              bloque.horaFin || "-"
                            }`
                          }
                        </div>

                        <div class="bloque-horario-curso-docente">
                          ${
                            bloque.cursoNombre ||
                            `${bloque.cursoAnio}º ${bloque.cursoDivision}`
                          }
                        </div>

                        <div class="bloque-horario-materia-docente">
                          ${bloque.espacioCurricular || "-"}
                        </div>

                        <div class="bloque-horario-turno-docente">
                          Grupo ${bloque.grupoTaller || "-"}
                        </div>

                        ${
                          bloque.ubicacion
                            ? `
                              <div class="bloque-horario-ubicacion-docente">
                                ${bloque.ubicacion}
                              </div>
                            `
                            : ""
                        }

                      </div>
                    `,
                  )
                  .join("")}

              </div>
            `;
    }).join("");

    return `
        <div class="dia-horario-docente">

          <h4>${dia.etiqueta}</h4>

          ${
            bloquesDia.length
              ? htmlTurnos
              : `
                <p class="mensaje-formulario">
                  Sin bloques asignados.
                </p>
              `
          }

        </div>
      `;
  }).join("");

  vistaHorarioTallerDocente.innerHTML = `
    <div class="grilla-horario-aula-docente">
      ${htmlDias}
    </div>
  `;
}

function renderizarHorarioEducacionFisicaDocente(bloques) {
  if (!vistaHorarioEducacionFisicaDocente) {
    return;
  }

  if (!bloques.length) {
    mostrarMensajeHorarioEducacionFisicaDocente(
      "Todavía no tenés horarios de Educación Física cargados.",
    );

    return;
  }

  const htmlDias = DIAS_HORARIO_DOCENTE.map((dia) => {
    const bloquesDia = bloques.filter((bloque) => bloque.dia === dia.valor);

    const htmlTurnos = TURNOS_HORARIO_DOCENTE.map((turno) => {
      const bloquesTurno = bloquesDia
        .filter(
          (bloque) =>
            String(bloque.turno || "")
              .trim()
              .toUpperCase() === turno.valor,
        )
        .sort((a, b) =>
          String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
        );

      if (!bloquesTurno.length) {
        return "";
      }

      return `
              <div class="grupo-turno-horario-docente">

                <h5 class="titulo-turno-horario-docente">
                  ${turno.etiqueta}
                </h5>

                ${bloquesTurno
                  .map(
                    (bloque) => `
                      <div class="tarjeta-bloque-horario-docente">

                        <div class="bloque-horario-hora-docente">
                          ${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}
                        </div>

                        <div class="bloque-horario-curso-docente">
                          ${
                            bloque.cursoNombre ||
                            `${bloque.cursoAnio || ""}º ${
                              bloque.cursoDivision || ""
                            }`
                          }
                        </div>

                        <div class="bloque-horario-materia-docente">
                          ${bloque.espacioCurricular || "Educación Física"}
                        </div>

                        ${
                          bloque.ubicacion
                            ? `
                              <div class="bloque-horario-ubicacion-docente">
                                ${bloque.ubicacion}
                              </div>
                            `
                            : ""
                        }

                      </div>
                    `,
                  )
                  .join("")}

              </div>
            `;
    }).join("");

    return `
        <div class="dia-horario-docente">

          <h4>${dia.etiqueta}</h4>

          ${
            bloquesDia.length
              ? htmlTurnos
              : `
                <p class="mensaje-formulario">
                  Sin bloques asignados.
                </p>
              `
          }

        </div>
      `;
  }).join("");

  vistaHorarioEducacionFisicaDocente.innerHTML = `
    <div class="grilla-horario-aula-docente">
      ${htmlDias}
    </div>
  `;
}

async function cargarHorarioAulaDocente(usuario) {
  if (!vistaHorarioAulaDocente) return;

  mostrarMensajeHorarioDocente("Cargando horario de aula...");

  try {
    const correoDocente = normalizarCorreoDocente(usuario.email);

    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("tipoHorario", "==", "AULA"),
      where("docenteCorreo", "==", correoDocente),
    );

    const resultado = await getDocs(consultaHorarios);

    const bloques = [];

    resultado.forEach((documento) => {
      bloques.push({
        id: documento.id,
        ...documento.data(),
      });
    });

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === a.dia);
      const diaB = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) return diaA - diaB;

      const horaA = String(a.horaInicio || "");
      const horaB = String(b.horaInicio || "");

      if (horaA !== horaB) {
        return horaA.localeCompare(horaB);
      }

      return String(a.cursoNombre || "").localeCompare(
        String(b.cursoNombre || ""),
        "es",
      );
    });

    renderizarHorarioAulaDocente(bloques);
  } catch (error) {
    console.error("Error al cargar horario de aula docente:", error);

    mostrarMensajeHorarioDocente(
      error.message || "No se pudo cargar tu horario de aula.",
      "error",
    );
  }
}

function obtenerFechaActualHorarioDocente() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function reemplazoDocenteEstaVigente(reemplazo) {
  const estado = String(reemplazo.estado || "")
    .trim()
    .toUpperCase();

  const tipoHorario = String(reemplazo.tipoHorario || "")
    .trim()
    .toUpperCase();

  const fechaDesde = String(reemplazo.fechaDesde || "").trim();
  const fechaHasta = String(reemplazo.fechaHasta || "").trim();

  const hoy = obtenerFechaActualHorarioDocente();

  return (
    estado === "ACTIVO" &&
    tipoHorario === "TALLER" &&
    fechaDesde &&
    fechaHasta &&
    hoy >= fechaDesde &&
    hoy <= fechaHasta
  );
}

function bloquePerteneceAReemplazo(bloque, reemplazo) {
  const asignacionBloque = String(bloque.asignacionId || "").trim();

  const asignacionReemplazo = String(
    reemplazo.asignacionTitularId || "",
  ).trim();

  if (asignacionBloque && asignacionReemplazo) {
    return asignacionBloque === asignacionReemplazo;
  }

  return (
    normalizarCorreoDocente(bloque.docenteCorreo) ===
      normalizarCorreoDocente(reemplazo.titularCorreo) &&
    String(bloque.cursoId || "").trim() ===
      String(reemplazo.cursoId || "").trim() &&
    String(bloque.espacioId || "").trim() ===
      String(reemplazo.espacioId || "").trim()
  );
}

async function obtenerReemplazosTallerDocente(correoDocente) {
  const consultaComoTitular = query(
    collection(db, "reemplazos_docentes"),
    where("titularCorreo", "==", correoDocente),
  );

  const consultaComoReemplazante = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const [resultadoTitular, resultadoReemplazante] = await Promise.all([
    getDocs(consultaComoTitular),
    getDocs(consultaComoReemplazante),
  ]);

  const comoTitular = [];
  const comoReemplazante = [];

  resultadoTitular.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    if (reemplazoDocenteEstaVigente(reemplazo)) {
      comoTitular.push(reemplazo);
    }
  });

  resultadoReemplazante.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    if (reemplazoDocenteEstaVigente(reemplazo)) {
      comoReemplazante.push(reemplazo);
    }
  });

  return {
    comoTitular,
    comoReemplazante,
  };
}

async function cargarHorarioTallerDocente(usuario) {
  if (!vistaHorarioTallerDocente) return;

  mostrarMensajeHorarioTallerDocente("Cargando horario de taller...");

  try {
    const correoDocente = normalizarCorreoDocente(usuario.email);

    const consultaHorariosPropios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("tipoHorario", "==", "TALLER"),
      where("docenteCorreo", "==", correoDocente),
    );

    const [resultadoPropios, reemplazos] = await Promise.all([
      getDocs(consultaHorariosPropios),
      obtenerReemplazosTallerDocente(correoDocente),
    ]);

    const bloquesPropios = [];

    resultadoPropios.forEach((documento) => {
      bloquesPropios.push({
        id: documento.id,
        ...documento.data(),
      });
    });

    const bloques = bloquesPropios.filter(
      (bloque) =>
        !reemplazos.comoTitular.some((reemplazo) =>
          bloquePerteneceAReemplazo(bloque, reemplazo),
        ),
    );

    for (const reemplazo of reemplazos.comoReemplazante) {
      const titularCorreo = normalizarCorreoDocente(reemplazo.titularCorreo);

      const consultaHorariosTitular = query(
        collection(db, "horarios"),
        where("estado", "==", "ACTIVO"),
        where("tipoHorario", "==", "TALLER"),
        where("docenteCorreo", "==", titularCorreo),
      );

      const resultadoTitular = await getDocs(consultaHorariosTitular);

      resultadoTitular.forEach((documento) => {
        const bloque = {
          id: documento.id,
          ...documento.data(),
        };

        if (bloquePerteneceAReemplazo(bloque, reemplazo)) {
          bloques.push({
            ...bloque,

            esReemplazoTemporal: true,
            reemplazoId: reemplazo.id,

            docenteTitularCorreo: reemplazo.titularCorreo || "",

            docenteTitularNombre: reemplazo.titularNombre || "",
          });
        }
      });
    }

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === a.dia);

      const diaB = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      const horaA = String(a.horaInicio || "");
      const horaB = String(b.horaInicio || "");

      if (horaA !== horaB) {
        return horaA.localeCompare(horaB);
      }

      return String(a.cursoNombre || "").localeCompare(
        String(b.cursoNombre || ""),
        "es",
      );
    });

    renderizarHorarioTallerDocente(bloques);
  } catch (error) {
    console.error("Error al cargar horario de taller docente:", error);

    mostrarMensajeHorarioTallerDocente(
      error.message || "No se pudo cargar tu horario de taller.",
      "error",
    );
  }
}

function reemplazoEducacionFisicaEstaVigente(reemplazo) {
  const estado = String(reemplazo.estado || "")
    .trim()
    .toUpperCase();

  const tipoHorario = String(reemplazo.tipoHorario || "")
    .trim()
    .toUpperCase();

  const fechaDesde = String(reemplazo.fechaDesde || "").trim();
  const fechaHasta = String(reemplazo.fechaHasta || "").trim();

  const hoy = obtenerFechaActualHorarioDocente();

  return (
    estado === "ACTIVO" &&
    tipoHorario === "EDUCACION_FISICA" &&
    fechaDesde &&
    fechaHasta &&
    hoy >= fechaDesde &&
    hoy <= fechaHasta
  );
}

async function obtenerReemplazosEducacionFisicaDocente(correoDocente) {
  const consultaComoTitular = query(
    collection(db, "reemplazos_docentes"),
    where("titularCorreo", "==", correoDocente),
  );

  const consultaComoReemplazante = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const [resultadoTitular, resultadoReemplazante] = await Promise.all([
    getDocs(consultaComoTitular),
    getDocs(consultaComoReemplazante),
  ]);

  const comoTitular = [];
  const comoReemplazante = [];

  resultadoTitular.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    if (reemplazoEducacionFisicaEstaVigente(reemplazo)) {
      comoTitular.push(reemplazo);
    }
  });

  resultadoReemplazante.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    if (reemplazoEducacionFisicaEstaVigente(reemplazo)) {
      comoReemplazante.push(reemplazo);
    }
  });

  return {
    comoTitular,
    comoReemplazante,
  };
}

async function cargarHorarioEducacionFisicaDocente(usuario) {
  if (!vistaHorarioEducacionFisicaDocente) return;

  mostrarMensajeHorarioEducacionFisicaDocente(
    "Cargando horario de Educación Física...",
  );

  try {
    const correoDocente = normalizarCorreoDocente(usuario.email);

    const consultaHorariosPropios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("tipoHorario", "==", "EDUCACION_FISICA"),
      where("docenteCorreo", "==", correoDocente),
    );

    const [resultadoPropios, reemplazos] = await Promise.all([
      getDocs(consultaHorariosPropios),
      obtenerReemplazosEducacionFisicaDocente(correoDocente),
    ]);

    const bloquesPropios = [];

    resultadoPropios.forEach((documento) => {
      bloquesPropios.push({
        id: documento.id,
        ...documento.data(),
      });
    });

    const bloques = bloquesPropios.filter(
      (bloque) =>
        !reemplazos.comoTitular.some((reemplazo) =>
          bloquePerteneceAReemplazo(bloque, reemplazo),
        ),
    );

    for (const reemplazo of reemplazos.comoReemplazante) {
      const titularCorreo = normalizarCorreoDocente(reemplazo.titularCorreo);

      const consultaHorariosTitular = query(
        collection(db, "horarios"),
        where("estado", "==", "ACTIVO"),
        where("tipoHorario", "==", "EDUCACION_FISICA"),
        where("docenteCorreo", "==", titularCorreo),
      );

      const resultadoTitular = await getDocs(consultaHorariosTitular);

      resultadoTitular.forEach((documento) => {
        const bloque = {
          id: documento.id,
          ...documento.data(),
        };

        if (bloquePerteneceAReemplazo(bloque, reemplazo)) {
          bloques.push({
            ...bloque,

            esReemplazoTemporal: true,
            reemplazoId: reemplazo.id,

            docenteTitularCorreo: reemplazo.titularCorreo || "",

            docenteTitularNombre: reemplazo.titularNombre || "",
          });
        }
      });
    }

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === a.dia);

      const diaB = DIAS_HORARIO_DOCENTE.findIndex((dia) => dia.valor === b.dia);

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      const horaA = String(a.horaInicio || "");
      const horaB = String(b.horaInicio || "");

      if (horaA !== horaB) {
        return horaA.localeCompare(horaB);
      }

      return String(a.cursoNombre || "").localeCompare(
        String(b.cursoNombre || ""),
        "es",
      );
    });

    renderizarHorarioEducacionFisicaDocente(bloques);
  } catch (error) {
    console.error(
      "Error al cargar horario de Educación Física docente:",
      error,
    );

    mostrarMensajeHorarioEducacionFisicaDocente(
      error.message || "No se pudo cargar tu horario de Educación Física.",
      "error",
    );
  }
}

if (btnVerMisHorariosDocente) {
  btnVerMisHorariosDocente.addEventListener("click", async () => {
    if (!usuarioHorarioDocenteActual) {
      mostrarMensajeHorarioDocente(
        "No se detectó una sesión activa. Volvé a iniciar sesión.",
        "error",
      );
      return;
    }

    btnVerMisHorariosDocente.disabled = true;

    const textoOriginal = btnVerMisHorariosDocente.innerHTML;

    btnVerMisHorariosDocente.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarHorarioAulaDocente(usuarioHorarioDocenteActual);
      await cargarHorarioTallerDocente(usuarioHorarioDocenteActual);
      await cargarHorarioEducacionFisicaDocente(usuarioHorarioDocenteActual);
    } finally {
      btnVerMisHorariosDocente.disabled = false;
      btnVerMisHorariosDocente.innerHTML = textoOriginal;
    }
  });
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) return;

  usuarioHorarioDocenteActual = usuario;

  mostrarMensajeHorarioDocente(
    "Todavía no se consultó tu horario de aula. Presioná “Ver mis horarios” para cargarlo.",
  );

  mostrarMensajeHorarioTallerDocente(
    "Todavía no se consultó tu horario de taller. Presioná “Ver mis horarios” para cargarlo.",
  );
  mostrarMensajeHorarioEducacionFisicaDocente(
    "Todavía no se consultó tu horario de Educación Física. Presioná “Ver mis horarios” para cargarlo.",
  );
});
