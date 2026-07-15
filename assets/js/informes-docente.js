import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const INFORMES_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwiPaqdCFtfChD_b0xUDOF4zqhbOs_WJ45aVBHW9kn6hnbRTGEp93A4mp2W0r0v7pXt4w/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const btnVerInformesDocente = document.getElementById("btnVerInformesDocente");

const vistaInformesDocente = document.getElementById("vistaInformesDocente");

const mensajeInformesDocente = document.getElementById(
  "mensajeInformesDocente",
);

let informesDocenteCargados = [];

function escaparHtmlDocente(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarMensajeInformesDocente(texto, tipo = "") {
  if (!mensajeInformesDocente) return;

  mensajeInformesDocente.textContent = texto || "";
  mensajeInformesDocente.className = "mensaje-formulario";

  if (tipo) {
    mensajeInformesDocente.classList.add(tipo);
  }
}

function formatearFechaInformeDocente(fechaTexto) {
  const texto = String(fechaTexto || "").trim();

  if (!texto) {
    return "-";
  }

  const soloFecha = texto.split(" ")[0];
  const partes = soloFecha.split("-");

  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}-${mes}-${anio}`;
  }

  return soloFecha;
}

async function enviarAlBackendInformesDocente(payload) {
  const respuesta = await fetch(INFORMES_BACKEND_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!respuesta.ok) {
    throw new Error(`Error de conexión con el backend: ${respuesta.status}`);
  }

  return respuesta.json();
}

function renderizarInformesDocente(informes) {
  if (!vistaInformesDocente) return;

  if (!informes.length) {
    vistaInformesDocente.innerHTML = `
      <p class="mensaje-formulario">
        No tenés informes pedagógicos disponibles por el momento.
      </p>
    `;

    mostrarMensajeInformesDocente("");
    return;
  }

  vistaInformesDocente.innerHTML = `
    <div class="tabla-informes-docente-contenedor">
      <table class="tabla-informes-docente">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Creado por</th>
            <th>Ver</th>
          </tr>
        </thead>

        <tbody>
          ${informes
            .map((informe) => {
              const driveUrl = String(informe.driveUrl || "").trim();

              return `
                <tr>
                  <td>
                    ${escaparHtmlDocente(
                      formatearFechaInformeDocente(informe.fechaCreacion),
                    )}
                  </td>

                  <td>
                    <strong>
                      ${escaparHtmlDocente(
                        informe.alumnoNombre || "Estudiante sin nombre",
                      )}
                    </strong>
                    <small>
                      DNI: ${escaparHtmlDocente(informe.alumnoDni || "-")}
                    </small>
                  </td>

                  <td>
                    ${escaparHtmlDocente(informe.cursoNombre || "-")}
                  </td>

                  <td>
                    ${escaparHtmlDocente(informe.creadoPorNombre || "-")}
                  </td>

                  <td>
                    ${
                      driveUrl
                        ? `
                          <a
                            class="btn-informe-docente"
                            href="${escaparHtmlDocente(driveUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver informe"
                            aria-label="Ver informe"
                          >
                            <i class="fa-solid fa-eye"></i>
                          </a>
                        `
                        : "-"
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeInformesDocente(
    `${informes.length} informe(s) pedagógico(s) disponible(s).`,
    "ok",
  );
}

async function cargarInformesDocente() {
  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesDocente(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  try {
    if (btnVerInformesDocente) {
      btnVerInformesDocente.disabled = true;
      btnVerInformesDocente.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando informes...
      `;
    }

    mostrarMensajeInformesDocente("");

    if (vistaInformesDocente) {
      vistaInformesDocente.innerHTML = `
        <p class="mensaje-formulario">
          Consultando informes pedagógicos disponibles...
        </p>
      `;
    }

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesDocente({
      accion: "listar_informes_docente",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar los informes pedagógicos.",
      );
    }

    informesDocenteCargados = resultado.informes || [];

    renderizarInformesDocente(informesDocenteCargados);
  } catch (error) {
    console.error("Error al cargar informes pedagógicos del docente:", error);

    if (vistaInformesDocente) {
      vistaInformesDocente.innerHTML = `
        <p class="mensaje-formulario error">
          No se pudieron cargar los informes pedagógicos.
        </p>
      `;
    }

    mostrarMensajeInformesDocente(
      error.message || "No se pudieron cargar los informes pedagógicos.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los informes",
        text:
          error.message ||
          "Revisá conexión, sesión activa o permisos del backend.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerInformesDocente) {
      btnVerInformesDocente.disabled = false;
      btnVerInformesDocente.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver informes
      `;
    }
  }
}

if (btnVerInformesDocente) {
  btnVerInformesDocente.addEventListener("click", cargarInformesDocente);
}
