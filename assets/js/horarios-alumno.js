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
        (a, b) => Number(a.bloqueNumero || 0) - Number(b.bloqueNumero || 0),
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
          ? `<div class="grilla-horario-aula-alumno">${htmlAula}</div>`
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

    const grupoTallerAlumno = String(perfilAlumno.grupoTaller || "")
      .trim()
      .toUpperCase();

    const bloquesAula = [];
    const bloquesTaller = [];
    const bloquesEducacionFisica = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

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

      return Number(a.bloqueNumero || 0) - Number(b.bloqueNumero || 0);
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

    btnVerMiHorario.disabled = true;

    const textoOriginal = btnVerMiHorario.innerHTML;

    btnVerMiHorario.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Cargando...
    `;

    try {
      await cargarHorarioAulaAlumno(usuarioHorarioAlumnoActual);
    } finally {
      btnVerMiHorario.disabled = false;
      btnVerMiHorario.innerHTML = textoOriginal;
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
