/* E.E.T.P. N° 495 · Integración 39 · Vista de solo lectura para Soporte y Gestión. */
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  escaparHtml,
  obtenerFechaArgentina,
  obtenerClasesPrevistas,
  reemplazoDeClase,
  obtenerCursoGrupo,
  obtenerActividad,
  obtenerHorario,
  normalizar,
} from "./sira-previsiones-core.mjs";

const vista = document.getElementById("vistaSiraPrevistasHoy");
const etiquetaFecha = document.getElementById("fechaSiraPrevistasHoy");
const botonActualizar = document.getElementById("btnActualizarSiraPrevistasHoy");
const panel = document.getElementById("panelSiraPrevistasHoy");
const seccion = panel?.closest("section#sira-admin, section#sira-gestion");

if (vista && etiquetaFecha && botonActualizar && seccion) {
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
  let usuarioActual = null;
  let consultando = false;

  function seccionVisible() {
    return location.hash === `#${seccion.id}` && !seccion.hidden;
  }

  // Esta previsión se consulta a demanda. No realiza lecturas al abrir el portal.
  const aclaracion = panel.querySelector(".sira-hoy-aclaracion");

  function ocultarPrevision() {
    vista.hidden = true;
    if (aclaracion) aclaracion.hidden = true;
  }

  function mostrarPrevision() {
    vista.hidden = false;
    if (aclaracion) aclaracion.hidden = false;
  }

  function dibujarFilas(clases, reemplazos, fecha) {
    const grupos = [
      { tipo: "TALLER", titulo: "Taller" },
      { tipo: "EDUCACION_FISICA", titulo: "Educación Física" },
    ];

    const filas = grupos.map(({ tipo, titulo }) => {
      const clasesDelGrupo = clases.filter((clase) => normalizar(clase.tipoHorario) === tipo);
      if (!clasesDelGrupo.length) return "";

      const filasClases = clasesDelGrupo.map((clase) => {
        const reemplazo = reemplazoDeClase(clase, reemplazos, fecha);
        const docente = reemplazo
          ? String(reemplazo.reemplazanteNombre || reemplazo.reemplazanteCorreo || "Docente sin asignar")
          : String(clase.docenteNombre || "Docente sin asignar");
        const turno = normalizar(clase.turno) === "MANANA" ? "Mañana" : "Tarde";
        return `
          <tr>
            <td data-label="Turno"><span class="sira-hoy-turno">${turno}</span></td>
            <td data-label="Curso / grupo"><strong>${escaparHtml(obtenerCursoGrupo(clase))}</strong></td>
            <td data-label="Actividad">${escaparHtml(obtenerActividad(clase))}</td>
            <td data-label="Docente">${escaparHtml(docente)}${reemplazo ? ' <span class="sira-hoy-reemplazo">Reemplazo vigente</span>' : ""}</td>
            <td data-label="Horario">${escaparHtml(obtenerHorario(clase))}</td>
          </tr>`;
      }).join("");

      return `
        <tr class="sira-hoy-fila-grupo">
          <th scope="rowgroup" colspan="5">${titulo}<span class="sira-hoy-grupo-cantidad">${clasesDelGrupo.length} ${clasesDelGrupo.length === 1 ? "clase" : "clases"}</span></th>
        </tr>${filasClases}`;
    }).join("");

    vista.innerHTML = `
      <div class="sira-hoy-resumen">${clases.length} ${clases.length === 1 ? "clase prevista" : "clases previstas"} para hoy</div>
      <div class="sira-hoy-tabla-contenedor">
        <table class="sira-hoy-tabla">
          <thead><tr><th>Turno</th><th>Curso / grupo</th><th>Actividad</th><th>Docente</th><th>Horario</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  }

  async function consultar() {
    if (!usuarioActual || !seccionVisible() || consultando) return;
    const fecha = obtenerFechaArgentina();
    etiquetaFecha.textContent = fecha.rotulo;
    mostrarPrevision();

    if (fecha.dia === "SABADO" || fecha.dia === "DOMINGO") {
      vista.innerHTML = '<p class="sira-hoy-mensaje">Hoy no hay clases semanales programadas de Taller ni Educación Física.</p>';
      return;
    }

    consultando = true;
    botonActualizar.disabled = true;
    vista.innerHTML = '<p class="sira-hoy-mensaje">Consultando los horarios previstos para hoy...</p>';

    try {
      let resultado;
      try {
        // Filtro por día para reducir lecturas: no consulta registros de asistencia.
        resultado = await getDocs(query(
          collection(db, "horarios"),
          where("estado", "==", "ACTIVO"),
          where("dia", "==", fecha.dia),
        ));
      } catch (error) {
        if (error.code !== "failed-precondition") throw error;
        // Si Firestore pide un índice compuesto, usar la consulta ya vigente en la pizarra.
        resultado = await getDocs(query(
          collection(db, "horarios"),
          where("estado", "==", "ACTIVO"),
        ));
      }

      const horarios = resultado.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const clases = obtenerClasesPrevistas(horarios, fecha);

      if (!clases.length) {
        vista.innerHTML = '<p class="sira-hoy-mensaje">No hay clases de Taller ni Educación Física previstas para hoy en los horarios activos de este ciclo lectivo.</p>';
      } else {
        let reemplazos = [];
        let sinVerificarReemplazos = false;
        try {
          const resultadoReemplazos = await getDocs(query(
            collection(db, "reemplazos_docentes"),
            where("estado", "==", "ACTIVO"),
          ));
          reemplazos = resultadoReemplazos.docs.map((doc) => doc.data());
        } catch (error) {
          console.warn("No se pudo consultar reemplazos vigentes de Si.R.A.:", error);
          sinVerificarReemplazos = true;
        }
        dibujarFilas(clases, reemplazos, fecha);
        if (sinVerificarReemplazos) {
          vista.insertAdjacentHTML("beforeend", '<p class="sira-hoy-aviso">No fue posible verificar los reemplazos vigentes; los nombres mostrados corresponden a los horarios registrados.</p>');
        }
      }
    } catch (error) {
      console.error("No se pudieron consultar las clases previstas de Si.R.A.:", error);
      vista.innerHTML = '<p class="sira-hoy-mensaje sira-hoy-error">No se pudieron consultar los horarios previstos. Volvé a intentar con «Actualizar».</p>';
    } finally {
      consultando = false;
      botonActualizar.disabled = false;
    }
  }

  // Al abrir Si.R.A. o volver desde otra sección, la previsión sigue plegada.
  ocultarPrevision();
  let fechaMostrada = "";

  function actualizarFecha() {
    const fecha = obtenerFechaArgentina();
    if (fechaMostrada && fechaMostrada !== fecha.fechaISO) ocultarPrevision();
    fechaMostrada = fecha.fechaISO;
    etiquetaFecha.textContent = fecha.rotulo;
  }

  actualizarFecha();
  botonActualizar.addEventListener("click", () => consultar());
  window.addEventListener("hashchange", () => {
    ocultarPrevision();
    actualizarFecha();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) actualizarFecha();
  });
  onAuthStateChanged(auth, (usuario) => {
    usuarioActual = usuario;
    if (!usuario) ocultarPrevision();
  });
}
