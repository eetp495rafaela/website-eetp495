/*
 * Portal Gestión · Consulta DAI y estudiantes vinculados.
 * No ejecutar consultas a Firestore ni Apps Script al cargar esta página.
 * La consulta se dispara exclusivamente con un clic.
 */
import {getApp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const URL_INFORMES_DAI_GESTION =
  "https://script.google.com/macros/s/AKfycbwiPaqdCFtfChD_b0xUDOF4zqhbOs_WJ45aVBHW9kn6hnbRTGEp93A4mp2W0r0v7pXt4w/exec";

const botonDAIGestion = document.getElementById("btnVerDAIGestion");
const vistaDAIGestion = document.getElementById("vistaDAIGestion");
let consultandoDAIGestion = false;

function crearElementoDAIGestion(etiqueta, clase, contenido) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (contenido !== undefined) elemento.textContent = String(contenido ?? "");
  return elemento;
}

function mostrarMensajeDAIGestion(texto, esError = false) {
  if (!vistaDAIGestion) return;
  const parrafo = crearElementoDAIGestion(
    "p", esError ? "mensaje-gestion error" : "mensaje-gestion", texto,
  );
  vistaDAIGestion.replaceChildren(parrafo);
}

function pintarDirectorioDAIGestion(docentes) {
  if (!vistaDAIGestion) return;
  if (!Array.isArray(docentes) || !docentes.length) {
    mostrarMensajeDAIGestion("No hay docentes de apoyo activos registrados.");
    return;
  }

  const contenedor = crearElementoDAIGestion("div", "dai-gestion-tabla-scroll");
  const tabla = crearElementoDAIGestion("table", "dai-gestion-tabla");
  const cabecera = document.createElement("thead");
  const titulos = document.createElement("tr");
  ["Docente de Apoyo (DAI)", "Estudiantes vinculados"].forEach((titulo) => {
    const celda = crearElementoDAIGestion("th", "", titulo);
    celda.setAttribute("scope", "col");
    titulos.append(celda);
  });
  cabecera.append(titulos);
  tabla.append(cabecera);

  const cuerpo = document.createElement("tbody");
  docentes.forEach((docente) => {
    const fila = document.createElement("tr");
    const celdaDocente = document.createElement("td");
    celdaDocente.append(
      crearElementoDAIGestion("strong", "dai-gestion-nombre", docente.nombre || "Sin nombre"),
      crearElementoDAIGestion("small", "dai-gestion-correo", docente.correo || ""),
    );
    fila.append(celdaDocente);

    const celdaEstudiantes = document.createElement("td");
    const estudiantes = Array.isArray(docente.estudiantes) ? docente.estudiantes : [];
    if (!estudiantes.length) {
      celdaEstudiantes.append(
        crearElementoDAIGestion("span", "dai-gestion-sin-estudiantes", "Sin estudiantes vinculados"),
      );
    } else {
      const lista = crearElementoDAIGestion("ul", "dai-gestion-estudiantes");
      estudiantes.forEach((estudiante) => {
        const item = document.createElement("li");
        item.append(
          crearElementoDAIGestion("strong", "dai-gestion-nombre", estudiante.nombre || "Sin nombre"),
          crearElementoDAIGestion("small", "dai-gestion-curso", estudiante.cursoNombre || "Curso sin asignar"),
        );
        lista.append(item);
      });
      celdaEstudiantes.append(lista);
    }
    fila.append(celdaEstudiantes);
    cuerpo.append(fila);
  });
  tabla.append(cuerpo);
  contenedor.append(tabla);
  const contador = crearElementoDAIGestion(
    "p", "dai-gestion-contador",
    docentes.length + (docentes.length === 1 ? " docente de apoyo activo." : " docentes de apoyo activos."),
  );
  vistaDAIGestion.replaceChildren(contenedor, contador);
}

async function consultarDocentesApoyoGestion() {
  if (!botonDAIGestion || consultandoDAIGestion) return;
  consultandoDAIGestion = true;
  botonDAIGestion.disabled = true;
  mostrarMensajeDAIGestion("Consultando docentes de apoyo y estudiantes vinculados...");
  try {
    // Obtener sesión cuando se solicita la consulta: no en el arranque.
    const usuario = getAuth(getApp()).currentUser;
    if (!usuario) throw new Error("Ingresá nuevamente al portal para consultar los docentes de apoyo.");
    const idToken = await usuario.getIdToken();
    const respuesta = await fetch(URL_INFORMES_DAI_GESTION, {
      method: "POST",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify({accion: "listar_docentes_apoyo_gestion", idToken}),
    });
    if (!respuesta.ok) throw new Error("No se pudo conectar con el servidor de Informes.");
    const datos = await respuesta.json();
    if (!datos || datos.ok !== true) {
      throw new Error(datos?.mensaje || "El servidor rechazó la consulta.");
    }
    pintarDirectorioDAIGestion(datos.docentes);
  } catch (error) {
    mostrarMensajeDAIGestion(error?.message || "No se pudo consultar la información.", true);
  } finally {
    consultandoDAIGestion = false;
    botonDAIGestion.disabled = false;
  }
}

botonDAIGestion?.addEventListener("click", consultarDocentesApoyoGestion);
