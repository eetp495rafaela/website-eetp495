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
  doc,
  getDoc,
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

function renderizarHorarioAulaAlumno(bloques, perfilAlumno) {
  if (!vistaHorarioAulaAlumno) return;

  if (!bloques.length) {
    mostrarMensajeHorarioAlumno(
      "Todavía no hay horarios de aula cargados para tu curso.",
    );
    return;
  }

  const cursoVisible = String(perfilAlumno.cursoNombre || "").trim();

  const htmlDias = DIAS_HORARIO_AULA_ALUMNO.map((dia) => {
    const bloquesDia = bloques
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
                        ${bloque.horaInicio} a ${bloque.horaFin}
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

  vistaHorarioAulaAlumno.innerHTML = `
    <div class="encabezado-horario-alumno">
      <strong>Curso:</strong> ${cursoVisible || `${perfilAlumno.cursoAnio}º ${perfilAlumno.cursoDivision}`}
    </div>

    <div class="grilla-horario-aula-alumno">
      ${htmlDias}
    </div>
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

    const bloques = [];

    resultado.forEach((documento) => {
      const datos = documento.data();

      const tipoHorario = String(datos.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (tipoHorario !== "AULA") return;

      bloques.push({
        id: documento.id,
        ...datos,
      });
    });

    bloques.sort((a, b) => {
      const diaA = DIAS_HORARIO_AULA_ALUMNO.findIndex(
        (dia) => dia.valor === a.dia,
      );
      const diaB = DIAS_HORARIO_AULA_ALUMNO.findIndex(
        (dia) => dia.valor === b.dia,
      );

      if (diaA !== diaB) return diaA - diaB;

      return Number(a.bloqueNumero || 0) - Number(b.bloqueNumero || 0);
    });

    renderizarHorarioAulaAlumno(bloques, perfilAlumno);
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
