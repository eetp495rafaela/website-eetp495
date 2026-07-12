import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
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

    return `
      <div class="dia-horario-docente">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-docente">
                      <div class="bloque-horario-hora-docente">
                        ${bloque.horaInicio} a ${bloque.horaFin}
                      </div>

                      <div class="bloque-horario-curso-docente">
                        ${bloque.cursoNombre || `${bloque.cursoAnio}º ${bloque.cursoDivision}`}
                      </div>

                      <div class="bloque-horario-materia-docente">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      ${
                        bloque.turno
                          ? `<div class="bloque-horario-turno-docente">
                              Turno ${obtenerEtiquetaTurnoDocente(bloque.turno)}
                            </div>`
                          : ""
                      }

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-docente">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques asignados.</p>`
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
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-docente">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-docente">
                      <div class="bloque-horario-hora-docente">
                        ${
                          bloque.horarioTexto ||
                          `${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}`
                        }
                      </div>

                      <div class="bloque-horario-curso-docente">
                        ${bloque.cursoNombre || `${bloque.cursoAnio}º ${bloque.cursoDivision}`}
                      </div>

                      <div class="bloque-horario-materia-docente">
                        ${bloque.espacioCurricular || "-"}
                      </div>

                      <div class="bloque-horario-turno-docente">
                        Grupo ${bloque.grupoTaller || "-"}
                      </div>

                      ${
                        bloque.turno
                          ? `<div class="bloque-horario-turno-docente">
                              Turno ${obtenerEtiquetaTurnoDocente(bloque.turno)}
                            </div>`
                          : ""
                      }

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-docente">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques asignados.</p>`
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
  if (!vistaHorarioEducacionFisicaDocente) return;

  if (!bloques.length) {
    mostrarMensajeHorarioEducacionFisicaDocente(
      "Todavía no tenés horarios de Educación Física cargados.",
    );
    return;
  }

  const htmlDias = DIAS_HORARIO_DOCENTE.map((dia) => {
    const bloquesDia = bloques
      .filter((bloque) => bloque.dia === dia.valor)
      .sort((a, b) =>
        String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")),
      );

    return `
      <div class="dia-horario-docente">
        <h4>${dia.etiqueta}</h4>

        ${
          bloquesDia.length
            ? bloquesDia
                .map(
                  (bloque) => `
                    <div class="tarjeta-bloque-horario-docente">
                      <div class="bloque-horario-hora-docente">
                        ${bloque.horaInicio || "-"} a ${bloque.horaFin || "-"}
                      </div>

                      <div class="bloque-horario-curso-docente">
                        ${
                          bloque.cursoNombre ||
                          `${bloque.cursoAnio || ""}º ${bloque.cursoDivision || ""}`
                        }
                      </div>

                      <div class="bloque-horario-materia-docente">
                        ${bloque.espacioCurricular || "Educación Física"}
                      </div>

                      ${
                        bloque.turno
                          ? `<div class="bloque-horario-turno-docente">
                              Turno ${obtenerEtiquetaTurnoDocente(bloque.turno)}
                            </div>`
                          : ""
                      }

                      ${
                        bloque.ubicacion
                          ? `<div class="bloque-horario-ubicacion-docente">
                              ${bloque.ubicacion}
                            </div>`
                          : ""
                      }
                    </div>
                  `,
                )
                .join("")
            : `<p class="mensaje-formulario">Sin bloques asignados.</p>`
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

async function cargarHorarioTallerDocente(usuario) {
  if (!vistaHorarioTallerDocente) return;

  mostrarMensajeHorarioTallerDocente("Cargando horario de taller...");

  try {
    const correoDocente = normalizarCorreoDocente(usuario.email);

    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("tipoHorario", "==", "TALLER"),
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

    renderizarHorarioTallerDocente(bloques);
  } catch (error) {
    console.error("Error al cargar horario de taller docente:", error);

    mostrarMensajeHorarioTallerDocente(
      error.message || "No se pudo cargar tu horario de taller.",
      "error",
    );
  }
}

async function cargarHorarioEducacionFisicaDocente(usuario) {
  if (!vistaHorarioEducacionFisicaDocente) return;

  mostrarMensajeHorarioEducacionFisicaDocente(
    "Cargando horario de Educación Física...",
  );

  try {
    const correoDocente = normalizarCorreoDocente(usuario.email);

    const consultaHorarios = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
      where("tipoHorario", "==", "EDUCACION_FISICA"),
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
