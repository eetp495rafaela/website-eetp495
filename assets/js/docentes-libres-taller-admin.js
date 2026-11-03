// Consulta de solo lectura de docentes libres de Taller para el Portal Admin.
// La lógica de disponibilidad es equivalente a la del Portal Gestión.
// No escribe en Firestore ni altera horarios/asignaciones.
import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

const btnDocentesLibresTallerAdmin = document.getElementById(
  "btnActualizarDocentesLibresTallerAdmin",
);
const vistaDocentesLibresTallerAdmin = document.getElementById(
  "vistaDocentesLibresTallerAdmin",
);
const tarjetaDocentesLibresTallerAdmin = document.getElementById(
  "tarjetaDocentesLibresTallerAdmin",
);
let docentesLibresTallerAdminCargados = false;
let docentesLibresTallerAdminCargando = false;

const DIAS_HORARIO_ADMIN = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

function normalizarTextoAdmin(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function escaparHtmlAdmin(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function normalizarTurnoDocenteAdmin(turno) {
  const valor = normalizarTextoAdmin(turno).toUpperCase();
  if (valor === "MANANA") return "MANANA";
  if (valor === "TARDE") return "TARDE";
  return valor;
}
function obtenerCursoHorarioAdmin(horario) {
  const cursoNombre = String(horario.cursoNombre || "").trim();
  if (cursoNombre) return cursoNombre;
  const anio = horario.cursoAnio || "";
  const division = horario.cursoDivision || "";
  if (!anio && !division) return "Curso sin cargar";
  return `${anio}º ${division}`;
}
function obtenerHorarioTextoAdmin(horario) {
  const horarioTexto = String(horario.horarioTexto || "").trim();
  if (horarioTexto) return horarioTexto;
  const inicio = String(horario.horaInicio || "").trim();
  const fin = String(horario.horaFin || "").trim();
  if (!inicio && !fin) return "Horario sin cargar";
  return `${inicio || "-"} a ${fin || "-"}`;
}
function obtenerEspacioHorarioAdmin(horario) {
  return (
    String(horario.espacioCurricular || "").trim() ||
    String(horario.espacioNombre || "").trim() ||
    "Espacio sin cargar"
  );
}
function obtenerClaveDocenteLibreTallerAdmin(datos) {
  const correo = normalizarTextoAdmin(datos?.docenteCorreo);
  const nombre = normalizarTextoAdmin(datos?.docenteNombre);
  return correo || nombre;
}

function construirPanelDocentesLibresTallerAdmin(disponibilidadTurno, turno) {
  const esManana = turno === "MANANA";
  const tituloTurno = esManana ? "Turno mañana" : "Turno tarde";
  const idTitulo = esManana
    ? "tituloDocentesLibresMananaAdmin"
    : "tituloDocentesLibresTardeAdmin";

  const dias = DIAS_HORARIO_ADMIN.map((dia) => {
    const docentes = disponibilidadTurno[dia.valor] || [];
    const cantidad = docentes.length;

    const tarjetas = docentes
      .map((docente) => {
        const clasesAula = docente.clasesAula || [];
        const tieneAula = clasesAula.length > 0;
        const inicial = String(docente.nombre || "D")
          .trim()
          .charAt(0)
          .toLocaleUpperCase("es");

        const detalleAula = tieneAula
          ? `
            <ul class="docentes-libres-detalles-aula" aria-label="Clases de aula">
              ${clasesAula
                .map(
                  (clase) => `
                    <li>
                      <span>${escaparHtmlAdmin(clase.descripcion)}</span>
                      <small>
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        ${escaparHtmlAdmin(clase.horario)}
                      </small>
                    </li>
                  `,
                )
                .join("")}
            </ul>
          `
          : "";

        return `
          <li class="docentes-libres-docente${tieneAula ? " docentes-libres-con-aula" : ""}">
            <div class="docentes-libres-identidad">
              <span class="docentes-libres-inicial" aria-hidden="true">
                ${escaparHtmlAdmin(inicial)}
              </span>
              <strong>${escaparHtmlAdmin(docente.nombre)}</strong>
            </div>
            <span class="docentes-libres-estado${tieneAula ? " docentes-libres-estado-aula" : ""}">
              <i class="fa-solid ${tieneAula ? "fa-book-open" : "fa-check"}" aria-hidden="true"></i>
              ${tieneAula ? "Tiene clases de aula" : "Sin clases de Taller"}
            </span>
            ${detalleAula}
          </li>
        `;
      })
      .join("");

    return `
      <section class="docentes-libres-dia" aria-label="${escaparHtmlAdmin(dia.etiqueta)}">
        <div class="docentes-libres-dia-encabezado">
          <h5>${escaparHtmlAdmin(dia.etiqueta)}</h5>
          <span class="docentes-libres-cantidad">
            ${cantidad} ${cantidad === 1 ? "docente" : "docentes"}
          </span>
        </div>
        ${
          cantidad
            ? `<ul class="docentes-libres-lista">${tarjetas}</ul>`
            : `<p class="docentes-libres-vacio">Sin docentes libres de Taller</p>`
        }
      </section>
    `;
  }).join("");

  return `
    <section class="docentes-libres-turno ${esManana ? "docentes-libres-manana" : "docentes-libres-tarde"}"
             aria-labelledby="${idTitulo}">
      <div class="docentes-libres-turno-encabezado">
        <span class="docentes-libres-turno-icono" aria-hidden="true">
          <i class="fa-solid ${esManana ? "fa-sun" : "fa-cloud-sun"}"></i>
        </span>
        <div>
          <h4 id="${idTitulo}">${tituloTurno}</h4>
          <p>Disponibilidad por día de la semana</p>
        </div>
      </div>
      <div class="docentes-libres-dias">${dias}</div>
    </section>
  `;
}

async function cargarDocentesLibresTallerAdmin() {
  if (!vistaDocentesLibresTallerAdmin || docentesLibresTallerAdminCargando)
    return;
  docentesLibresTallerAdminCargando = true;

  const textoOriginal = btnDocentesLibresTallerAdmin?.innerHTML || "";

  try {
    if (btnDocentesLibresTallerAdmin) {
      btnDocentesLibresTallerAdmin.disabled = true;

      btnDocentesLibresTallerAdmin.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Consultando docentes...
      `;
    }

    vistaDocentesLibresTallerAdmin.innerHTML = `
      <p class="mensaje-formulario">
        Consultando docentes de Taller y horarios activos...
      </p>
    `;

    // El Admin está protegido por el rol SOPORTE. No solicitar datos sin sesión.
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw new Error(
        "No hay una sesión autenticada para realizar la consulta.",
      );
    }

    const [resultadoAsignaciones, resultadoHorarios] = await Promise.all([
      getDocs(collection(db, "asignaciones_docentes")),

      getDocs(
        query(collection(db, "horarios"), where("estado", "==", "ACTIVO")),
      ),
    ]);

    const asignacionesTallerActivas = resultadoAsignaciones.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((asignacion) => {
        const estado = String(asignacion.estado || "")
          .trim()
          .toUpperCase();

        const tipo = String(asignacion.espacioTipo || "")
          .trim()
          .toUpperCase();

        const estaActiva =
          !estado || estado === "ACTIVA" || estado === "ACTIVO";

        return estaActiva && tipo === "TALLER";
      });

    const horariosActivos = resultadoHorarios.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    const docentesTaller = new Map();

    asignacionesTallerActivas.forEach((asignacion) => {
      const clave = obtenerClaveDocenteLibreTallerAdmin(asignacion);

      if (!clave) return;

      if (!docentesTaller.has(clave)) {
        docentesTaller.set(clave, {
          nombre:
            String(asignacion.docenteNombre || "").trim() ||
            "Docente sin cargar",

          turnos: new Set(),
        });
      }
    });

    /*
     * El turno del docente de Taller se obtiene
     * de sus bloques de TALLER activos.
     */
    horariosActivos.forEach((horario) => {
      const tipo = String(horario.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (tipo !== "TALLER") return;

      const clave = obtenerClaveDocenteLibreTallerAdmin(horario);

      const turno = normalizarTurnoDocenteAdmin(horario.turno);

      if (!docentesTaller.has(clave)) return;

      if (turno !== "MANANA" && turno !== "TARDE") {
        return;
      }

      docentesTaller.get(clave).turnos.add(turno);
    });

    /*
     * Registramos por separado los bloques de TALLER
     * y los bloques de AULA.
     *
     * - Si tiene TALLER, no se mostrará como libre.
     * - Si no tiene TALLER pero tiene AULA,
     *   se mostrará "Tiene clases de aula" con su detalle.
     */
    const bloquesTaller = new Set();
    const bloquesAula = new Map();

    horariosActivos.forEach((horario) => {
      const clave = obtenerClaveDocenteLibreTallerAdmin(horario);

      const turno = normalizarTurnoDocenteAdmin(horario.turno);

      const dia = String(horario.dia || "")
        .trim()
        .toUpperCase();

      const tipoHorario = String(horario.tipoHorario || "")
        .trim()
        .toUpperCase();

      if (!clave) return;

      if (turno !== "MANANA" && turno !== "TARDE") {
        return;
      }

      if (!DIAS_HORARIO_ADMIN.some((item) => item.valor === dia)) {
        return;
      }

      const claveBloque = `${clave}__${turno}__${dia}`;

      if (tipoHorario === "TALLER") {
        bloquesTaller.add(claveBloque);
      }

      if (tipoHorario === "AULA") {
        if (!bloquesAula.has(claveBloque)) {
          bloquesAula.set(claveBloque, []);
        }

        bloquesAula.get(claveBloque).push({
          espacio: obtenerEspacioHorarioAdmin(horario),
          curso: obtenerCursoHorarioAdmin(horario),
          horario: obtenerHorarioTextoAdmin(horario),
          horaInicio: String(horario.horaInicio || "").trim(),
        });
      }
    });

    const crearDisponibilidadVacia = () =>
      Object.fromEntries(DIAS_HORARIO_ADMIN.map((dia) => [dia.valor, []]));

    const disponibilidad = {
      MANANA: crearDisponibilidadVacia(),
      TARDE: crearDisponibilidadVacia(),
    };

    docentesTaller.forEach((docente, clave) => {
      docente.turnos.forEach((turno) => {
        DIAS_HORARIO_ADMIN.forEach((dia) => {
          const claveDiaTurno = `${clave}__${turno}__${dia.valor}`;

          const tieneTaller = bloquesTaller.has(claveDiaTurno);

          const clasesAula = bloquesAula.get(claveDiaTurno) || [];

          if (!tieneTaller) {
            const clasesOrdenadas = [...clasesAula].sort((a, b) =>
              a.horaInicio.localeCompare(b.horaInicio),
            );

            const clasesAgrupadas = [];

            clasesOrdenadas.forEach((clase) => {
              const horas = String(clase.horario || "").match(/\d{1,2}:\d{2}/g);

              const horaInicio =
                horas?.length >= 1 ? horas[0] : clase.horaInicio;

              const horaFin = horas?.length >= 2 ? horas[1] : "";

              const ultimoGrupo = clasesAgrupadas[clasesAgrupadas.length - 1];

              /*
               * Solo agrupamos si la clase inmediatamente
               * anterior corresponde al mismo espacio
               * curricular y al mismo curso.
               *
               * Si en el medio aparece otra clase,
               * comienza un grupo nuevo.
               */
              const puedeAgruparse =
                ultimoGrupo &&
                ultimoGrupo.espacio === clase.espacio &&
                ultimoGrupo.curso === clase.curso;

              if (puedeAgruparse) {
                ultimoGrupo.horaFin = horaFin;
              } else {
                clasesAgrupadas.push({
                  espacio: clase.espacio,
                  curso: clase.curso,
                  horaInicio,
                  horaFin,
                  horario: clase.horario,
                });
              }
            });

            const detallesAula = clasesAgrupadas.map((clase) => {
              const horarioAgrupado =
                clase.horaInicio && clase.horaFin
                  ? `${clase.horaInicio} a ${clase.horaFin}`
                  : clase.horario;

              return {
                descripcion: `${clase.espacio} con ${clase.curso}`,
                horario: horarioAgrupado,
              };
            });

            disponibilidad[turno][dia.valor].push({
              nombre: docente.nombre,
              clasesAula: detallesAula,
            });
          }
        });
      });
    });

    ["MANANA", "TARDE"].forEach((turno) => {
      DIAS_HORARIO_ADMIN.forEach((dia) => {
        disponibilidad[turno][dia.valor].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, "es", {
            sensitivity: "base",
          }),
        );
      });
    });

    vistaDocentesLibresTallerAdmin.innerHTML = `
      <div class="docentes-libres-introduccion">
        <div>
          <span class="docentes-libres-kicker">
            <i class="fa-solid fa-users-viewfinder" aria-hidden="true"></i>
            Consulta semanal
          </span>
          <h3>Docentes libres de Taller</h3>
          <p>
            Docentes de Taller sin alumnos a cargo. Si tienen clases de aula, se indica junto a sus horarios.
          </p>
        </div>
        <div class="docentes-libres-leyenda" aria-label="Referencia de estados">
          <span><i class="fa-solid fa-check" aria-hidden="true"></i> Sin clases de Taller</span>
          <span class="docentes-libres-leyenda-aula">
            <i class="fa-solid fa-book-open" aria-hidden="true"></i> Tiene clases de aula
          </span>
        </div>
      </div>

      ${construirPanelDocentesLibresTallerAdmin(disponibilidad.MANANA, "MANANA")}
      ${construirPanelDocentesLibresTallerAdmin(disponibilidad.TARDE, "TARDE")}
    `;
    docentesLibresTallerAdminCargados = true;
  } catch (error) {
    console.error(
      "Error al consultar docentes libres de Taller en Portal Admin:",
      error,
    );

    vistaDocentesLibresTallerAdmin.innerHTML = `
      <p class="mensaje-formulario error">
        No se pudo consultar la disponibilidad de los docentes de Taller.
      </p>
    `;
  } finally {
    docentesLibresTallerAdminCargando = false;
    if (btnDocentesLibresTallerAdmin) {
      btnDocentesLibresTallerAdmin.disabled = false;

      btnDocentesLibresTallerAdmin.innerHTML =
        textoOriginal ||
        `
          <i class="fa-solid fa-user-clock"></i>
          Actualizar consulta
        `;
    }
  }
}

// La tarjeta principal abre la sección. Se consulta una sola vez al ingresar;
// el botón "Actualizar consulta" fuerza una nueva lectura cuando sea necesario.
if (tarjetaDocentesLibresTallerAdmin) {
  tarjetaDocentesLibresTallerAdmin.addEventListener("click", () => {
    if (!docentesLibresTallerAdminCargados)
      void cargarDocentesLibresTallerAdmin();
  });
}
if (btnDocentesLibresTallerAdmin) {
  btnDocentesLibresTallerAdmin.addEventListener("click", () => {
    void cargarDocentesLibresTallerAdmin();
  });
}
