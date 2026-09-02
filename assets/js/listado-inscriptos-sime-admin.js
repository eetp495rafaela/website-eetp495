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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const SIME_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwAoJxUZp7KRFneMwMUsfilojhYM7HdBl8_JVue1T9AukKD-EIacqT7UxhdokdSO6TRdQ/exec";

const btnGenerarListadoSimePdf = document.getElementById(
  "btnGenerarListadoSimePdf",
);

const CURSOS_SIME = [
  { numero: 1, titulo: "PRIMER AÑO" },
  { numero: 2, titulo: "SEGUNDO AÑO" },
  { numero: 3, titulo: "TERCER AÑO" },
  { numero: 4, titulo: "CUARTO AÑO" },
  { numero: 5, titulo: "QUINTO AÑO" },
  { numero: 6, titulo: "SEXTO AÑO" },
];

function escaparHtmlListadoSime(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarTextoListadoSime(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerMateriasListadoSime(valor) {
  if (Array.isArray(valor)) {
    return valor.map((materia) => String(materia || "").trim()).filter(Boolean);
  }

  return String(valor || "")
    .split(",")
    .map((materia) => materia.trim())
    .filter(Boolean);
}

function obtenerClaveEstudianteListadoSime(inscripcion) {
  const correo = normalizarTextoListadoSime(inscripcion.alumnoCorreo);
  if (correo) return `correo:${correo}`;

  const dni = String(inscripcion.alumnoDni || "").replace(/\D/g, "");
  if (dni) return `dni:${dni}`;

  return `nombre:${normalizarTextoListadoSime(inscripcion.alumnoNombre)}`;
}

function compararTextoListadoSime(a, b) {
  return String(a || "").localeCompare(String(b || ""), "es", {
    numeric: true,
    sensitivity: "base",
  });
}

function compararAniosCursadoListadoSime(a, b) {
  const numeroA = Number(a);
  const numeroB = Number(b);

  if (numeroA && numeroB) {
    return numeroA - numeroB;
  }

  return compararTextoListadoSime(a, b);
}

async function enviarAlBackendListadoSime(datos) {
  const respuesta = await fetch(SIME_BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo conectar con el backend S.I.M.E.");
  }

  return respuesta.json();
}

function esInscripcionActivaListadoSime(inscripcion) {
  const estado = String(inscripcion?.estado || "")
    .trim()
    .toUpperCase();

  // El backend actual guarda "ACTIVA". Se admite también "ACTIVO"
  // por compatibilidad con registros antiguos o cargados manualmente.
  return estado === "ACTIVA" || estado === "ACTIVO";
}

function filtrarInscripcionesPeriodoListadoSime(inscripciones, configuracion) {
  const todas = Array.isArray(inscripciones) ? inscripciones : [];
  const activas = todas.filter(esInscripcionActivaListadoSime);

  if (!activas.length) return [];

  const cicloConfigurado = Number(configuracion?.cicloLectivo || 0);
  const turnoConfigurado = normalizarTextoListadoSime(
    configuracion?.turnoExamen || "",
  );

  /*
   * Si la configuración coincide con registros activos, usamos solamente
   * ese llamado. Si no coincide con ninguno, NO descartamos las inscripciones:
   * usamos todas las activas. Esto evita el falso mensaje "Sin inscripciones"
   * cuando hay registros válidos pero cambió la configuración del llamado.
   */
  const activasDelLlamado = activas.filter((inscripcion) => {
    if (
      cicloConfigurado &&
      Number(inscripcion.cicloLectivo || 0) !== cicloConfigurado
    ) {
      return false;
    }

    if (
      turnoConfigurado &&
      normalizarTextoListadoSime(inscripcion.turnoExamen) !== turnoConfigurado
    ) {
      return false;
    }

    return true;
  });

  return activasDelLlamado.length ? activasDelLlamado : activas;
}

function agruparInscripcionesListadoSime(inscripciones) {
  const cursos = new Map();

  CURSOS_SIME.forEach(({ numero }) => {
    cursos.set(numero, {
      estudiantes: new Map(),
      materias: new Map(),
    });
  });

  inscripciones.forEach((inscripcion) => {
    const curso = Number(inscripcion.cursoOrigen || 0);
    const grupoCurso = cursos.get(curso);

    if (!grupoCurso) return;

    const nombreAlumno = String(inscripcion.alumnoNombre || "").trim();
    if (!nombreAlumno) return;

    const claveAlumno = obtenerClaveEstudianteListadoSime(inscripcion);
    grupoCurso.estudiantes.set(claveAlumno, nombreAlumno);

    const anioCursado = String(
      inscripcion.anioCursado || "Sin especificar",
    ).trim();
    const materias = obtenerMateriasListadoSime(inscripcion.materias);

    materias.forEach((materia) => {
      if (!grupoCurso.materias.has(materia)) {
        grupoCurso.materias.set(materia, new Map());
      }

      const gruposAnio = grupoCurso.materias.get(materia);

      if (!gruposAnio.has(anioCursado)) {
        gruposAnio.set(anioCursado, new Map());
      }

      gruposAnio.get(anioCursado).set(claveAlumno, nombreAlumno);
    });
  });

  return cursos;
}

function obtenerTotalMateriaListadoSime(gruposAnio) {
  const estudiantes = new Set();

  gruposAnio.forEach((alumnos) => {
    alumnos.forEach((_nombre, clave) => estudiantes.add(clave));
  });

  return estudiantes.size;
}

function renderizarMateriaListadoSime(materia, gruposAnio) {
  const aniosOrdenados = [...gruposAnio.keys()].sort(
    compararAniosCursadoListadoSime,
  );

  const totalMateria = obtenerTotalMateriaListadoSime(gruposAnio);

  return `
    <section class="tarjeta-materia">
      <div class="encabezado-materia">
        <h2>${escaparHtmlListadoSime(materia)}</h2>
        <span>${totalMateria}</span>
      </div>

      ${aniosOrdenados
        .map((anio) => {
          const alumnos = [...gruposAnio.get(anio).values()].sort(
            compararTextoListadoSime,
          );

          return `
            <div class="grupo-anio-cursado">
              <h3>Año de cursado: ${escaparHtmlListadoSime(anio)}</h3>
              <ol>
                ${alumnos
                  .map((alumno) => `<li>${escaparHtmlListadoSime(alumno)}</li>`)
                  .join("")}
              </ol>
            </div>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderizarPaginaCursoListadoSime(curso, grupoCurso, datosGenerales) {
  const materiasOrdenadas = [...grupoCurso.materias.keys()].sort(
    compararTextoListadoSime,
  );

  const totalEstudiantes = grupoCurso.estudiantes.size;

  const contenidoMaterias = materiasOrdenadas.length
    ? materiasOrdenadas
        .map((materia) =>
          renderizarMateriaListadoSime(
            materia,
            grupoCurso.materias.get(materia),
          ),
        )
        .join("")
    : `
        <div class="sin-inscripciones">
          No hay estudiantes inscriptos para este curso en el llamado actual.
        </div>
      `;

  return `
    <article class="pagina-anio">
      <header class="encabezado-pagina">
        <img src="${datosGenerales.logoUrl}" alt="Logo E.E.T.P. Nº 495" />

        <div class="identidad-institucional">
          <h1>E.E.T.P. Nº 495 “Malvinas Argentinas”</h1>
          <p>S.I.M.E. · Listado de estudiantes inscriptos a Mesas de Exámenes</p>
        </div>

        <div class="datos-llamado">
          <strong>${escaparHtmlListadoSime(datosGenerales.turnoExamen)}</strong>
          <span>Ciclo lectivo ${escaparHtmlListadoSime(datosGenerales.cicloLectivo)}</span>
        </div>
      </header>

      <div class="titulo-curso">
        <div>
          <span>CURSO DE ORIGEN</span>
          <h2>${escaparHtmlListadoSime(curso.titulo)}</h2>
        </div>

        <div class="resumen-curso">
          <div>
            <strong>${totalEstudiantes}</strong>
            <span>Estudiantes</span>
          </div>
          <div>
            <strong>${materiasOrdenadas.length}</strong>
            <span>Espacios curriculares</span>
          </div>
        </div>
      </div>

      <div class="cuerpo-pagina">
        <div class="contenido-escalable">
          <div class="grilla-materias">
            ${contenidoMaterias}
          </div>
        </div>
      </div>

      <footer class="pie-pagina">
        <span>Generado el ${escaparHtmlListadoSime(datosGenerales.fechaGeneracion)}</span>
        <span>${curso.numero}° año · Página ${curso.numero} de 6</span>
      </footer>
    </article>
  `;
}

function construirHtmlListadoSime(inscripciones, configuracion) {
  const agrupadas = agruparInscripcionesListadoSime(inscripciones);

  const ciclosEncontrados = Array.from(
    new Set(
      inscripciones
        .map((inscripcion) => Number(inscripcion.cicloLectivo || 0))
        .filter(Boolean),
    ),
  );

  const turnosEncontrados = Array.from(
    new Set(
      inscripciones
        .map((inscripcion) => String(inscripcion.turnoExamen || "").trim())
        .filter(Boolean),
    ),
  );

  const cicloLectivo =
    (ciclosEncontrados.length === 1 ? ciclosEncontrados[0] : 0) ||
    Number(configuracion?.cicloLectivo || 0) ||
    new Date().getFullYear();

  const turnoExamen =
    (turnosEncontrados.length === 1 ? turnosEncontrados[0] : "") ||
    String(configuracion?.turnoExamen || "").trim() ||
    "Llamado de Mesas de Exámenes";

  const datosGenerales = {
    cicloLectivo,
    turnoExamen,
    fechaGeneracion: new Date().toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }),
    logoUrl: new URL("../assets/img/logo.png", window.location.href).href,
  };

  const paginas = CURSOS_SIME.map((curso) =>
    renderizarPaginaCursoListadoSime(
      curso,
      agrupadas.get(curso.numero),
      datosGenerales,
    ),
  ).join("");

  const tituloDocumento = `Listado SIME - ${turnoExamen} - ${cicloLectivo}`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escaparHtmlListadoSime(tituloDocumento)}</title>

        <style>
          :root {
            --verde: #0f766e;
            --verde-oscuro: #115e59;
            --verde-suave: #ecfdf5;
            --gris-borde: #d6e2df;
            --gris-texto: #34413e;
            --gris-suave: #f6f8f7;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #e9efed;
            color: #17201e;
            font-family: Arial, Helvetica, sans-serif;
          }

          .barra-acciones {
            position: sticky;
            top: 0;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 18px;
            background: #10251f;
            color: #ffffff;
            box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
          }

          .barra-acciones strong {
            font-size: 15px;
          }

          .barra-acciones button {
            border: 0;
            border-radius: 8px;
            padding: 10px 16px;
            background: #ffffff;
            color: #10251f;
            font-weight: 700;
            cursor: pointer;
          }

          .documento {
            width: 100%;
            padding: 14px 0 28px;
          }

          .pagina-anio {
            width: 281mm;
            height: 194mm;
            margin: 0 auto 14px;
            padding: 7mm 8mm 5mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #ffffff;
            border-radius: 5px;
            box-shadow: 0 4px 20px rgba(23, 32, 30, 0.13);
            break-after: page;
            page-break-after: always;
          }

          .pagina-anio:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .encabezado-pagina {
            display: grid;
            grid-template-columns: 18mm minmax(0, 1fr) auto;
            align-items: center;
            gap: 4mm;
            padding-bottom: 3mm;
            border-bottom: 1.5px solid var(--verde);
          }

          .encabezado-pagina img {
            width: 16mm;
            height: 16mm;
            object-fit: contain;
          }

          .identidad-institucional h1 {
            margin: 0 0 1mm;
            color: var(--verde-oscuro);
            font-size: 16px;
            line-height: 1.15;
          }

          .identidad-institucional p {
            margin: 0;
            color: var(--gris-texto);
            font-size: 9px;
          }

          .datos-llamado {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 1mm;
            color: var(--gris-texto);
            font-size: 9px;
            text-align: right;
          }

          .datos-llamado strong {
            color: var(--verde-oscuro);
            font-size: 11px;
          }

          .titulo-curso {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8mm;
            padding: 3mm 0;
          }

          .titulo-curso > div:first-child > span {
            display: block;
            margin-bottom: 0.5mm;
            color: #64706d;
            font-size: 7.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .titulo-curso h2 {
            margin: 0;
            color: #10251f;
            font-size: 20px;
            line-height: 1;
          }

          .resumen-curso {
            display: flex;
            gap: 3mm;
          }

          .resumen-curso > div {
            min-width: 29mm;
            padding: 2mm 3mm;
            border: 1px solid #cfe1dc;
            border-radius: 6px;
            background: var(--verde-suave);
            text-align: center;
          }

          .resumen-curso strong,
          .resumen-curso span {
            display: block;
          }

          .resumen-curso strong {
            color: var(--verde-oscuro);
            font-size: 14px;
          }

          .resumen-curso span {
            margin-top: 0.5mm;
            color: var(--gris-texto);
            font-size: 7.5px;
          }

          .cuerpo-pagina {
            flex: 1;
            min-height: 0;
            overflow: hidden;
          }

          .contenido-escalable {
            transform-origin: top left;
          }

          .grilla-materias {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            align-items: start;
            gap: 2.5mm;
          }

          .tarjeta-materia {
            overflow: hidden;
            border: 1px solid var(--gris-borde);
            border-radius: 5px;
            background: #ffffff;
            break-inside: avoid;
          }

          .encabezado-materia {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2mm;
            padding: 1.7mm 2.2mm;
            background: var(--verde);
            color: #ffffff;
          }

          .encabezado-materia h2 {
            margin: 0;
            font-size: 9.5px;
            line-height: 1.15;
          }

          .encabezado-materia span {
            min-width: 5mm;
            padding: 0.5mm 1.2mm;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.2);
            font-size: 7.5px;
            font-weight: 700;
            text-align: center;
          }

          .grupo-anio-cursado {
            padding: 1.5mm 2.2mm 1.8mm;
            border-top: 1px solid #e4ebe9;
          }

          .grupo-anio-cursado:first-of-type {
            border-top: 0;
          }

          .grupo-anio-cursado h3 {
            margin: 0 0 1mm;
            color: var(--verde-oscuro);
            font-size: 7.8px;
            line-height: 1.2;
          }

          .grupo-anio-cursado ol {
            margin: 0;
            padding-left: 5mm;
            columns: 1;
          }

          .grupo-anio-cursado li {
            margin: 0 0 0.45mm;
            padding-left: 0.4mm;
            color: #26312e;
            font-size: 7.6px;
            line-height: 1.2;
          }

          .sin-inscripciones {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80mm;
            padding: 10mm;
            border: 1px dashed #b8c9c4;
            border-radius: 8px;
            background: var(--gris-suave);
            color: #60706c;
            font-size: 13px;
            text-align: center;
          }

          .pie-pagina {
            display: flex;
            justify-content: space-between;
            gap: 6mm;
            padding-top: 2mm;
            margin-top: 2mm;
            border-top: 1px solid #dfe7e5;
            color: #71807c;
            font-size: 7px;
          }

          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          @media print {
            html,
            body {
              background: #ffffff;
            }

            .barra-acciones {
              display: none !important;
            }

            .documento {
              padding: 0;
            }

            .pagina-anio {
              width: 100%;
              height: 194mm;
              margin: 0;
              padding: 0;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="barra-acciones">
          <strong>Listado de inscriptos S.I.M.E. · 6 páginas</strong>
          <button type="button" onclick="window.print()">
            Imprimir / Guardar PDF
          </button>
        </div>

        <main class="documento">
          ${paginas}
        </main>

        <script>
          function ajustarPaginas() {
            document.querySelectorAll('.pagina-anio').forEach((pagina) => {
              const cuerpo = pagina.querySelector('.cuerpo-pagina');
              const contenido = pagina.querySelector('.contenido-escalable');
              const grilla = pagina.querySelector('.grilla-materias');

              if (!cuerpo || !contenido || !grilla) return;

              contenido.style.transform = 'none';
              contenido.style.width = '100%';
              grilla.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';

              let disponible = cuerpo.clientHeight;
              let requerido = contenido.scrollHeight;

              if (requerido > disponible * 1.45) {
                grilla.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
                requerido = contenido.scrollHeight;
              }

              if (requerido > disponible && requerido > 0) {
                const escala = Math.max(0.42, Math.min(1, disponible / requerido));
                contenido.style.transform = 'scale(' + escala + ')';
                contenido.style.width = 100 / escala + '%';
              }
            });
          }

          window.addEventListener('load', () => {
            requestAnimationFrame(() => {
              ajustarPaginas();
              setTimeout(ajustarPaginas, 250);
            });
          });

          window.addEventListener('beforeprint', ajustarPaginas);
        <\/script>
      </body>
    </html>
  `;
}

function mostrarCargaEnVentanaListadoSime(ventana) {
  ventana.document.open();
  ventana.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Preparando listado S.I.M.E.</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f3f7f6;
            color: #18302a;
            font-family: Arial, Helvetica, sans-serif;
          }
          div { text-align: center; }
          h1 { margin: 0 0 10px; font-size: 22px; }
          p { margin: 0; color: #60706c; }
        </style>
      </head>
      <body>
        <div>
          <h1>Preparando listado de inscriptos...</h1>
          <p>Consultando S.I.M.E. y organizando los seis cursos.</p>
        </div>
      </body>
    </html>
  `);
  ventana.document.close();
}

async function generarListadoSimePdfAdmin() {
  const usuario = auth.currentUser;

  if (!usuario) {
    Swal.fire({
      title: "Sesión no disponible",
      text: "No se detectó una sesión activa. Volvé a iniciar sesión.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const ventana = window.open("", "_blank");

  if (!ventana) {
    Swal.fire({
      title: "Ventana bloqueada",
      text: "Permití las ventanas emergentes para generar el listado imprimible.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  mostrarCargaEnVentanaListadoSime(ventana);

  const textoOriginal = btnGenerarListadoSimePdf.innerHTML;
  btnGenerarListadoSimePdf.disabled = true;
  btnGenerarListadoSimePdf.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Generando...
  `;

  try {
    const idToken = await usuario.getIdToken(true);

    const [resultadoInscripciones, resultadoConfiguracion] = await Promise.all([
      enviarAlBackendListadoSime({
        accion: "listar_inscripciones_admin",
        idToken,
      }),
      enviarAlBackendListadoSime({
        accion: "obtener_configuracion_admin",
        idToken,
      }),
    ]);

    if (!resultadoInscripciones.ok) {
      throw new Error(
        resultadoInscripciones.mensaje ||
          "No se pudieron consultar las inscripciones S.I.M.E.",
      );
    }

    if (!resultadoConfiguracion.ok) {
      throw new Error(
        resultadoConfiguracion.mensaje ||
          "No se pudo consultar la configuración S.I.M.E.",
      );
    }

    const configuracion = resultadoConfiguracion.configuracion || {};
    const inscripciones = filtrarInscripcionesPeriodoListadoSime(
      resultadoInscripciones.inscripciones || [],
      configuracion,
    );

    if (!inscripciones.length) {
      ventana.close();

      await Swal.fire({
        title: "Sin inscripciones activas",
        text: "No se encontraron inscripciones activas registradas en S.I.M.E.",
        icon: "info",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    ventana.document.open();
    ventana.document.write(
      construirHtmlListadoSime(inscripciones, configuracion),
    );
    ventana.document.close();
  } catch (error) {
    console.error("Error al generar listado S.I.M.E.:", error);

    ventana.close();

    await Swal.fire({
      title: "No se pudo generar el listado",
      text: error.message || "Ocurrió un error al preparar el listado S.I.M.E.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    btnGenerarListadoSimePdf.disabled = false;
    btnGenerarListadoSimePdf.innerHTML = textoOriginal;
  }
}

if (btnGenerarListadoSimePdf) {
  btnGenerarListadoSimePdf.addEventListener(
    "click",
    generarListadoSimePdfAdmin,
  );
}
