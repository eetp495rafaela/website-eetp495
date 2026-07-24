import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain: "portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId: "portal-institucional-eet-fa5c7",
  storageBucket: "portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId: "658183549494",
  appId: "1:658183549494:web:84fe7da91b1ea8990f1e97",
};

const BACKEND_DOCUMENTACION_URL =
  "https://script.google.com/macros/s/AKfycbyJA5XiNV_JqALCztCcSctp4eVpW25jxJaKPYvGD8qVm7mbM6oJWx99Op4vqX7pk2Eqzw/exec";

const SIME_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwAoJxUZp7KRFneMwMUsfilojhYM7HdBl8_JVue1T9AukKD-EIacqT7UxhdokdSO6TRdQ/exec";

const INFORMES_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbwiPaqdCFtfChD_b0xUDOF4zqhbOs_WJ45aVBHW9kn6hnbRTGEp93A4mp2W0r0v7pXt4w/exec";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const btnVerCursosGestion = document.getElementById("btnVerCursosGestion");
const vistaCursosGestion = document.getElementById("vistaCursosGestion");
const mensajeCursosGestion = document.getElementById("mensajeCursosGestion");
const btnVerEstudiantesGestion = document.getElementById(
  "btnVerEstudiantesGestion",
);

const vistaEstudiantesGestion = document.getElementById(
  "vistaEstudiantesGestion",
);

const mensajeEstudiantesGestion = document.getElementById(
  "mensajeEstudiantesGestion",
);

const buscarEstudianteGestion = document.getElementById(
  "buscarEstudianteGestion",
);

const filtroCursoEstudianteGestion = document.getElementById(
  "filtroCursoEstudianteGestion",
);

const filtroEstadoEstudianteGestion = document.getElementById(
  "filtroEstadoEstudianteGestion",
);

const btnVerDocentesGestion = document.getElementById("btnVerDocentesGestion");

const vistaDocentesGestion = document.getElementById("vistaDocentesGestion");

const mensajeDocentesGestion = document.getElementById(
  "mensajeDocentesGestion",
);

const buscarDocenteGestion = document.getElementById("buscarDocenteGestion");

const filtroCursoDocenteGestion = document.getElementById(
  "filtroCursoDocenteGestion",
);

const filtroEspacioDocenteGestion = document.getElementById(
  "filtroEspacioDocenteGestion",
);

const filtroTurnoDocenteGestion = document.getElementById(
  "filtroTurnoDocenteGestion",
);

const btnVerHorariosGestion = document.getElementById("btnVerHorariosGestion");

const btnGenerarPizarraHorariosGestion = document.getElementById(
  "btnGenerarPizarraHorariosGestion",
);

const vistaHorariosGestion = document.getElementById("vistaHorariosGestion");

const mensajeHorariosGestion = document.getElementById(
  "mensajeHorariosGestion",
);

const filtroTipoHorarioGestion = document.getElementById(
  "filtroTipoHorarioGestion",
);

const filtroTurnoHorarioGestion = document.getElementById(
  "filtroTurnoHorarioGestion",
);
const filtroDiaHorarioGestion = document.getElementById(
  "filtroDiaHorarioGestion",
);
const filtroEspacioHorarioGestion = document.getElementById(
  "filtroEspacioHorarioGestion",
);
const filtroCursoHorarioGestion = document.getElementById(
  "filtroCursoHorarioGestion",
);
const btnVerDocumentacionGestion = document.getElementById(
  "btnVerDocumentacionGestion",
);

const vistaDocumentacionGestion = document.getElementById(
  "vistaDocumentacionGestion",
);

const mensajeDocumentacionGestion = document.getElementById(
  "mensajeDocumentacionGestion",
);

const filtroCursoDocumentacionGestion = document.getElementById(
  "filtroCursoDocumentacionGestion",
);

const filtroTipoDocumentacionGestion = document.getElementById(
  "filtroTipoDocumentacionGestion",
);

const buscarEspacioDocumentacionGestion = document.getElementById(
  "buscarEspacioDocumentacionGestion",
);
const btnVerInscripcionesSimeGestion = document.getElementById(
  "btnVerInscripcionesSimeGestion",
);

const vistaSimeGestion = document.getElementById("vistaSimeGestion");

const mensajeSimeGestion = document.getElementById("mensajeSimeGestion");

const filtroCursoSimeGestion = document.getElementById(
  "filtroCursoSimeGestion",
);

const filtroAnioCursadoSimeGestion = document.getElementById(
  "filtroAnioCursadoSimeGestion",
);

const filtroEstadoSimeGestion = document.getElementById(
  "filtroEstadoSimeGestion",
);

const buscarAlumnoSimeGestion = document.getElementById(
  "buscarAlumnoSimeGestion",
);

const btnCargarOpcionesInformesGestion = document.getElementById(
  "btnCargarOpcionesInformesGestion",
);
const btnListarInformesGestion = document.getElementById(
  "btnListarInformesGestion",
);
const formInformePedagogicoGestion = document.getElementById(
  "formInformePedagogicoGestion",
);

const cursoInformeGestion = document.getElementById("cursoInformeGestion");

const alumnoInformeGestion = document.getElementById("alumnoInformeGestion");

const btnCrearInformeGestion = document.getElementById(
  "btnCrearInformeGestion",
);

const vistaInformesGestion = document.getElementById("vistaInformesGestion");

const mensajeInformesGestion = document.getElementById(
  "mensajeInformesGestion",
);

let cursosInformesGestion = [];
let estudiantesInformesGestion = [];
let informesGestionCargados = [];
let inscripcionesSimeGestionCargadas = [];
let documentacionGestionCargada = [];
let horariosGestionCargados = [];
let asignacionesDocentesGestionCargadas = [];
let horariosDocentesGestionCargados = [];
let estudiantesGestionCargados = [];

// =========================
// MESAS DE EXAMEN - GESTIÓN
// =========================

const panelMesaDireccionGestion = document.getElementById(
  "panelMesaDireccionGestion",
);

const formMesaGestion = document.getElementById("formMesaGestion");
const mesaGestionId = document.getElementById("mesaGestionId");
const mesaGestionFecha = document.getElementById("mesaGestionFecha");
const mesaGestionHora = document.getElementById("mesaGestionHora");
const mesaGestionPeriodo = document.getElementById("mesaGestionPeriodo");
const mesaGestionEstado = document.getElementById("mesaGestionEstado");
const mesaGestionEspacio = document.getElementById("mesaGestionEspacio");
const mesaGestionCursos = document.getElementById("mesaGestionCursos");
const btnGuardarMesaGestion = document.getElementById("btnGuardarMesaGestion");
const btnCancelarMesaGestion = document.getElementById(
  "btnCancelarMesaGestion",
);
const mensajeMesaFormGestion = document.getElementById(
  "mensajeMesaFormGestion",
);

let cursosMesaGestion = [];
let espaciosMesaGestion = [];

const btnActualizarMesasGestion = document.getElementById(
  "btnActualizarMesasGestion",
);

const filtroMesaGestionEspacio = document.getElementById(
  "filtroMesaGestionEspacio",
);

const filtroMesaGestionCurso = document.getElementById(
  "filtroMesaGestionCurso",
);

const cuerpoTablaMesasGestion = document.getElementById(
  "cuerpoTablaMesasGestion",
);

const mensajeMesasGestion = document.getElementById("mensajeMesasGestion");

let mesasGestionCargadas = [];

// =========================
// MESAS DE EXAMEN - GESTIÓN
// Listado y filtros
// =========================

function mostrarMensajeMesaFormGestion(texto, tipo = "") {
  if (!mensajeMesaFormGestion) return;

  mensajeMesaFormGestion.textContent = texto || "";
  mensajeMesaFormGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeMesaFormGestion.classList.add(tipo);
  }
}

function cargarHorariosMesaGestion() {
  if (!mesaGestionHora) return;

  const valorActual = String(mesaGestionHora.value || "").trim();

  const opciones = ['<option value="">Seleccionar hora</option>'];

  const inicioMinutos = 7 * 60 + 15;
  const finMinutos = 18 * 60;

  for (
    let totalMinutos = inicioMinutos;
    totalMinutos <= finMinutos;
    totalMinutos += 15
  ) {
    const hora = Math.floor(totalMinutos / 60);
    const minuto = totalMinutos % 60;

    const hh = String(hora).padStart(2, "0");
    const mm = String(minuto).padStart(2, "0");
    const valor = `${hh}:${mm}`;

    opciones.push(`<option value="${valor}">${valor}</option>`);
  }

  mesaGestionHora.innerHTML = opciones.join("");

  if (valorActual) {
    mesaGestionHora.value = valorActual;
  }
}

function cargarPeriodosMesaGestion() {
  if (!mesaGestionPeriodo) return;

  const valorActual = String(mesaGestionPeriodo.value || "").trim();

  const meses = [
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const anioActual = new Date().getFullYear();
  const anios = [anioActual, anioActual + 1];

  const opciones = ['<option value="">Seleccionar período</option>'];

  anios.forEach((anio) => {
    meses.forEach((mes) => {
      const periodo = `${mes} ${anio}`;
      opciones.push(`<option value="${periodo}">${periodo}</option>`);
    });
  });

  mesaGestionPeriodo.innerHTML = opciones.join("");

  if (valorActual) {
    mesaGestionPeriodo.value = valorActual;
  }
}

function ordenarCursosMesaGestion(cursos) {
  return cursos.sort((a, b) => {
    const anioA = Number(a.anio || 0);
    const anioB = Number(b.anio || 0);

    if (anioA !== anioB) return anioA - anioB;

    return String(a.division || "").localeCompare(
      String(b.division || ""),
      "es",
      {
        numeric: true,
        sensitivity: "base",
      },
    );
  });
}

function ordenarEspaciosMesaGestion(espacios) {
  return espacios.sort((a, b) => {
    const anioA = Number(a.anio || 0);
    const anioB = Number(b.anio || 0);

    if (anioA !== anioB) return anioA - anioB;

    return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
      numeric: true,
      sensitivity: "base",
    });
  });
}

async function cargarEspaciosMesaGestion() {
  if (!mesaGestionEspacio) return;

  mesaGestionEspacio.innerHTML = `
    <option value="">Cargando espacios curriculares...</option>
  `;

  try {
    const consulta = await getDocs(collection(db, "espacios_curriculares"));

    espaciosMesaGestion = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((espacio) => {
        const estado = String(espacio.estado || "ACTIVO")
          .trim()
          .toUpperCase();
        return estado === "ACTIVO";
      });

    ordenarEspaciosMesaGestion(espaciosMesaGestion);

    if (!espaciosMesaGestion.length) {
      mesaGestionEspacio.innerHTML = `
        <option value="">No hay espacios activos cargados</option>
      `;
      return;
    }

    mesaGestionEspacio.innerHTML = `
      <option value="">Seleccionar espacio curricular</option>
      ${espaciosMesaGestion
        .map(
          (espacio) => `
            <option
              value="${espacio.id}"
              data-nombre="${espacio.nombre || ""}"
              data-anio="${espacio.anio || ""}"
              data-tipo="${espacio.tipo || ""}"
            >
              ${espacio.anio || "-"}º · ${espacio.nombre || "Sin nombre"}
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Error al cargar espacios para mesas en Gestión:", error);

    mesaGestionEspacio.innerHTML = `
      <option value="">Error al cargar espacios</option>
    `;

    mostrarMensajeMesaFormGestion(
      "No se pudieron cargar los espacios curriculares.",
      "error",
    );
  }
}

async function cargarCursosMesaGestion() {
  if (!mesaGestionCursos) return;

  mesaGestionCursos.innerHTML = "Cargando cursos...";

  try {
    const consulta = await getDocs(collection(db, "cursos"));

    cursosMesaGestion = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((curso) => {
        const estado = String(curso.estado || "ACTIVO")
          .trim()
          .toUpperCase();
        return estado === "ACTIVO";
      });

    ordenarCursosMesaGestion(cursosMesaGestion);

    if (!cursosMesaGestion.length) {
      mesaGestionCursos.innerHTML = "No hay cursos activos cargados.";
      return;
    }

    const cursosAgrupados = cursosMesaGestion.reduce((grupos, curso) => {
      const anio = Number(curso.anio || 0);

      if (!grupos[anio]) {
        grupos[anio] = [];
      }

      grupos[anio].push(curso);

      return grupos;
    }, {});

    mesaGestionCursos.innerHTML = [1, 2, 3, 4, 5, 6]
      .map((anio) => {
        const cursosDelAnio = (cursosAgrupados[anio] || []).sort((a, b) =>
          String(a.division || "").localeCompare(
            String(b.division || ""),
            "es",
            {
              numeric: true,
              sensitivity: "base",
            },
          ),
        );

        if (!cursosDelAnio.length) {
          return "";
        }

        return `
          <div class="columna-cursos-mesa-gestion">
            <div class="titulo-anio-mesa-gestion">
              ${anio}°
            </div>

            <div class="checks-anio-mesa-gestion">
              ${cursosDelAnio
                .map((curso) => {
                  const division = String(curso.division || "").trim();

                  return `
                    <label class="item-curso-mesa-gestion">
                      <input
                        type="checkbox"
                        value="${curso.id}"
                        data-nombre="${curso.nombre || ""}"
                        data-anio="${curso.anio || ""}"
                        data-division="${curso.division || ""}"
                      />
                      <span>${division}</span>
                    </label>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error al cargar cursos para mesas en Gestión:", error);

    mesaGestionCursos.innerHTML = "No se pudieron cargar los cursos.";

    mostrarMensajeMesaFormGestion("No se pudieron cargar los cursos.", "error");
  }
}

async function prepararFormularioMesaGestion() {
  if (!formMesaGestion) return;

  cargarHorariosMesaGestion();
  cargarPeriodosMesaGestion();

  mostrarMensajeMesaFormGestion("Cargando opciones de mesas...");

  await Promise.all([cargarEspaciosMesaGestion(), cargarCursosMesaGestion()]);

  mostrarMensajeMesaFormGestion(
    "Opciones cargadas. Ya podés preparar una mesa.",
    "ok",
  );
}

function obtenerEspacioSeleccionadoMesaGestion() {
  if (!mesaGestionEspacio) return null;

  const opcion = mesaGestionEspacio.selectedOptions[0];

  if (!opcion || !opcion.value) return null;

  return {
    id: opcion.value,
    nombre: opcion.dataset.nombre || opcion.textContent || "",
    anio: Number(opcion.dataset.anio || 0),
    tipo: opcion.dataset.tipo || "",
  };
}

function obtenerCursosSeleccionadosMesaGestion() {
  if (!mesaGestionCursos) return [];

  return Array.from(
    mesaGestionCursos.querySelectorAll('input[type="checkbox"]:checked'),
  ).map((checkbox) => ({
    id: checkbox.value,
    nombre: checkbox.dataset.nombre || "",
    anio: Number(checkbox.dataset.anio || 0),
    division: checkbox.dataset.division || "",
  }));
}

function limpiarFormularioMesaGestion() {
  if (!formMesaGestion) return;

  formMesaGestion.reset();

  if (mesaGestionId) {
    mesaGestionId.value = "";
  }

  if (mesaGestionEstado) {
    mesaGestionEstado.value = "OCULTA";
  }

  if (mesaGestionCursos) {
    mesaGestionCursos
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });
  }

  if (btnCancelarMesaGestion) {
    btnCancelarMesaGestion.hidden = true;
  }

  if (btnGuardarMesaGestion) {
    btnGuardarMesaGestion.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar mesa oculta
    `;
  }

  mostrarMensajeMesaFormGestion("");
}

async function guardarMesaGestion(event) {
  event.preventDefault();

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeMesaFormGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );
    return;
  }

  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  if (rol !== "DIRECCION") {
    mostrarMensajeMesaFormGestion(
      "No tenés permisos para cargar mesas de examen.",
      "error",
    );
    return;
  }

  const idMesa = String(mesaGestionId?.value || "").trim();
  const fecha = String(mesaGestionFecha?.value || "").trim();
  const hora = String(mesaGestionHora?.value || "").trim();
  const periodo = String(mesaGestionPeriodo?.value || "").trim();
  const estado = idMesa
    ? String(mesaGestionEstado?.value || "OCULTA")
        .trim()
        .toUpperCase()
    : "OCULTA";

  const espacio = obtenerEspacioSeleccionadoMesaGestion();
  const cursos = obtenerCursosSeleccionadosMesaGestion();

  if (!fecha || !hora || !periodo || !espacio || !cursos.length) {
    mostrarMensajeMesaFormGestion(
      "Completá fecha, hora, período, espacio curricular y al menos un curso.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "Faltan datos",
        text: "Completá todos los campos obligatorios antes de guardar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      });
    }

    return;
  }

  try {
    if (btnGuardarMesaGestion) {
      btnGuardarMesaGestion.disabled = true;
      btnGuardarMesaGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Guardando...
      `;
    }

    const datosMesa = {
      fecha,
      hora,
      periodo,

      estado,

      espacioId: espacio.id,
      espacioNombre: espacio.nombre,
      espacioAnio: espacio.anio,
      espacioTipo: espacio.tipo,

      cursos,
      cursosNombres: cursos.map((curso) => curso.nombre),

      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario.email || "",
    };

    if (idMesa) {
      await updateDoc(doc(db, "mesas_examen", idMesa), datosMesa);
    } else {
      await addDoc(collection(db, "mesas_examen"), {
        ...datosMesa,
        creadoEn: serverTimestamp(),
        creadoPor: usuario.email || "",
      });
    }

    if (window.Swal) {
      await Swal.fire({
        title: idMesa ? "Mesa actualizada" : "Mesa guardada",
        text: idMesa
          ? "La mesa se actualizó correctamente."
          : "La mesa se guardó como OCULTA. Podrás publicarla luego desde el listado.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    }

    limpiarFormularioMesaGestion();
    await cargarMesasGestion();
  } catch (error) {
    console.error("Error al guardar mesa desde Gestión:", error);

    mostrarMensajeMesaFormGestion(
      error.message || "No se pudo guardar la mesa.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo guardar",
        text: error.message || "Revisá conexión o permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnGuardarMesaGestion) {
      btnGuardarMesaGestion.disabled = false;
      btnGuardarMesaGestion.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Guardar mesa oculta
      `;
    }
  }
}

async function configurarPanelMesasDireccionGestion() {
  if (!panelMesaDireccionGestion) return;

  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  const esDireccion = rol === "DIRECCION";

  panelMesaDireccionGestion.hidden = !esDireccion;

  if (esDireccion) {
    await prepararFormularioMesaGestion();
  }
}

function mostrarMensajeMesasGestion(texto, tipo = "") {
  if (!mensajeMesasGestion) return;

  mensajeMesasGestion.textContent = texto || "";
  mensajeMesasGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeMesasGestion.classList.add(tipo);
  }
}

function formatearFechaMesaGestion(fechaTexto) {
  const texto = String(fechaTexto || "").trim();

  if (!texto) return "-";

  const partes = texto.split("-");

  if (partes.length === 3) {
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
  }

  return texto;
}

function ordenarMesasGestion(mesas) {
  return [...mesas].sort((a, b) => {
    const fechaA = String(a.fecha || "");
    const fechaB = String(b.fecha || "");

    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    return String(a.hora || "").localeCompare(String(b.hora || ""));
  });
}

function cargarFiltrosMesasGestion() {
  if (filtroMesaGestionEspacio) {
    const valorActual = String(filtroMesaGestionEspacio.value || "").trim();

    const espacios = Array.from(
      new Set(
        mesasGestionCargadas
          .map((mesa) => String(mesa.espacioNombre || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    filtroMesaGestionEspacio.innerHTML = `
      <option value="">Todos los espacios</option>
      ${espacios
        .map(
          (espacio) => `
            <option value="${escaparHtmlGestion(espacio)}">
              ${escaparHtmlGestion(espacio)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && espacios.includes(valorActual)) {
      filtroMesaGestionEspacio.value = valorActual;
    }
  }

  if (filtroMesaGestionCurso) {
    const valorActual = String(filtroMesaGestionCurso.value || "").trim();

    const cursos = Array.from(
      new Set(
        mesasGestionCargadas
          .flatMap((mesa) =>
            Array.isArray(mesa.cursosNombres) ? mesa.cursosNombres : [],
          )
          .map((curso) => String(curso || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    filtroMesaGestionCurso.innerHTML = `
      <option value="">Todos los cursos</option>
      ${cursos
        .map(
          (curso) => `
            <option value="${escaparHtmlGestion(curso)}">
              ${escaparHtmlGestion(curso)}
            </option>
          `,
        )
        .join("")}
    `;

    if (valorActual && cursos.includes(valorActual)) {
      filtroMesaGestionCurso.value = valorActual;
    }
  }
}

function aplicarFiltrosMesasGestion() {
  const espacioSeleccionado = String(
    filtroMesaGestionEspacio?.value || "",
  ).trim();

  const cursoSeleccionado = String(filtroMesaGestionCurso?.value || "").trim();

  const mesasFiltradas = mesasGestionCargadas.filter((mesa) => {
    const espacioMesa = String(mesa.espacioNombre || "").trim();

    const cursosMesa = Array.isArray(mesa.cursosNombres)
      ? mesa.cursosNombres
      : [];

    const coincideEspacio =
      !espacioSeleccionado || espacioMesa === espacioSeleccionado;

    const coincideCurso =
      !cursoSeleccionado || cursosMesa.includes(cursoSeleccionado);

    return coincideEspacio && coincideCurso;
  });

  renderizarMesasGestion(mesasFiltradas);
}

function renderizarMesasGestion(mesas) {
  if (!cuerpoTablaMesasGestion) return;

  const ordenadas = ordenarMesasGestion(mesas);

  if (!ordenadas.length) {
    cuerpoTablaMesasGestion.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-vacia">
          No hay mesas de examen para mostrar con esos filtros.
        </td>
      </tr>
    `;

    mostrarMensajeMesasGestion("No se encontraron mesas con esos filtros.");
    return;
  }

  cuerpoTablaMesasGestion.innerHTML = ordenadas
    .map((mesa) => {
      const estado = String(mesa.estado || "OCULTA")
        .trim()
        .toUpperCase();
      const publicada = estado === "PUBLICADA";

      const cursos = Array.isArray(mesa.cursosNombres)
        ? mesa.cursosNombres.join(", ")
        : "-";

      return `
        <tr>
          <td>${escaparHtmlGestion(formatearFechaMesaGestion(mesa.fecha))}</td>
          <td>${escaparHtmlGestion(mesa.hora || "-")}</td>
          <td>
            <strong>${escaparHtmlGestion(mesa.espacioNombre || "-")}</strong>
          </td>
          <td>${escaparHtmlGestion(cursos)}</td>
          <td>
            <span class="estado-gestion ${publicada ? "activo" : "inactivo"}">
              ${publicada ? "PUBLICADA" : "OCULTA"}
            </span>
          </td>
         <td class="columna-acciones-mesas-gestion">
  ${
    String(window.portalUsuario?.rol || "")
      .trim()
      .toUpperCase() === "DIRECCION"
      ? `
        <div class="acciones-mesa-gestion">
          <button
            class="btn-gestion btn-mesa-editar-gestion"
            type="button"
            data-accion-mesa-gestion="editar"
            data-id-mesa="${escaparHtmlGestion(mesa.id)}"
          >
            <i class="fa-solid fa-pen-to-square"></i>
            Editar
          </button>

          <button
            class="btn-gestion btn-mesa-estado-gestion"
            type="button"
            data-accion-mesa-gestion="estado"
            data-id-mesa="${escaparHtmlGestion(mesa.id)}"
          >
            <i class="fa-solid ${publicada ? "fa-eye-slash" : "fa-eye"}"></i>
            ${publicada ? "Ocultar" : "Publicar"}
          </button>
        </div>
      `
      : "-"
  }
</td>
        </tr>
      `;
    })
    .join("");

  mostrarMensajeMesasGestion(`${ordenadas.length} mesa(s) mostrada(s).`, "ok");
}

function editarMesaGestion(idMesa) {
  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  if (rol !== "DIRECCION") {
    Swal.fire({
      title: "Sin permisos",
      text: "Solo Dirección puede editar mesas.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const mesa = mesasGestionCargadas.find((item) => item.id === idMesa);

  if (!mesa) {
    Swal.fire({
      title: "Mesa no encontrada",
      text: "No se encontró la mesa seleccionada.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  if (mesaGestionId) {
    mesaGestionId.value = mesa.id;
  }

  if (mesaGestionFecha) {
    mesaGestionFecha.value = mesa.fecha || "";
  }

  if (mesaGestionHora) {
    mesaGestionHora.value = mesa.hora || "";
  }

  if (mesaGestionPeriodo) {
    mesaGestionPeriodo.value = mesa.periodo || "";
  }

  if (mesaGestionEstado) {
    mesaGestionEstado.value = mesa.estado || "OCULTA";
  }

  if (mesaGestionEspacio) {
    mesaGestionEspacio.value = mesa.espacioId || "";
  }

  const idsCursos = Array.isArray(mesa.cursos)
    ? mesa.cursos.map((curso) => String(curso.id || ""))
    : [];

  if (mesaGestionCursos) {
    mesaGestionCursos
      .querySelectorAll('input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = idsCursos.includes(checkbox.value);
      });
  }

  if (btnCancelarMesaGestion) {
    btnCancelarMesaGestion.hidden = false;
  }

  if (btnGuardarMesaGestion) {
    btnGuardarMesaGestion.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Actualizar mesa
    `;
  }

  mostrarMensajeMesaFormGestion(
    "Editando mesa seleccionada. Revisá los datos y guardá los cambios.",
    "ok",
  );

  document
    .getElementById("panelMesaDireccionGestion")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function cambiarEstadoMesaGestion(idMesa) {
  const rol = String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();

  if (rol !== "DIRECCION") {
    Swal.fire({
      title: "Sin permisos",
      text: "Solo Dirección puede publicar u ocultar mesas.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const mesa = mesasGestionCargadas.find((item) => item.id === idMesa);

  if (!mesa) {
    Swal.fire({
      title: "Mesa no encontrada",
      text: "No se encontró la mesa seleccionada.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const estadoActual = String(mesa.estado || "OCULTA")
    .trim()
    .toUpperCase();
  const nuevoEstado = estadoActual === "PUBLICADA" ? "OCULTA" : "PUBLICADA";

  const confirmacion = await Swal.fire({
    title: nuevoEstado === "PUBLICADA" ? "¿Publicar mesa?" : "¿Ocultar mesa?",
    text:
      nuevoEstado === "PUBLICADA"
        ? "La mesa será visible para docentes y estudiantes."
        : "La mesa dejará de ser visible para docentes y estudiantes.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText:
      nuevoEstado === "PUBLICADA" ? "Sí, publicar" : "Sí, ocultar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    await updateDoc(doc(db, "mesas_examen", idMesa), {
      estado: nuevoEstado,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: auth.currentUser?.email || "",
    });

    await cargarMesasGestion();

    Swal.fire({
      title: nuevoEstado === "PUBLICADA" ? "Mesa publicada" : "Mesa oculta",
      text: "El estado se actualizó correctamente.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error al cambiar estado de mesa desde Gestión:", error);

    Swal.fire({
      title: "No se pudo actualizar",
      text: error.message || "Revisá conexión o permisos.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

async function cargarMesasGestion() {
  if (!cuerpoTablaMesasGestion) return;

  try {
    if (btnActualizarMesasGestion) {
      btnActualizarMesasGestion.disabled = true;
      btnActualizarMesasGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando mesas...
      `;
    }

    mostrarMensajeMesasGestion("Cargando mesas de examen...");

    cuerpoTablaMesasGestion.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-vacia">
          Consultando mesas de examen...
        </td>
      </tr>
    `;

    const consulta = await getDocs(collection(db, "mesas_examen"));

    mesasGestionCargadas = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    if (!mesasGestionCargadas.length) {
      cuerpoTablaMesasGestion.innerHTML = `
        <tr>
          <td colspan="6" class="tabla-vacia">
            No hay mesas de examen cargadas.
          </td>
        </tr>
      `;

      mostrarMensajeMesasGestion("No hay mesas de examen cargadas.");
      return;
    }

    cargarFiltrosMesasGestion();
    aplicarFiltrosMesasGestion();
  } catch (error) {
    console.error("Error al cargar mesas de examen en Gestión:", error);

    cuerpoTablaMesasGestion.innerHTML = `
      <tr>
        <td colspan="6" class="tabla-vacia">
          No se pudieron cargar las mesas de examen.
        </td>
      </tr>
    `;

    mostrarMensajeMesasGestion(
      error.message || "No se pudieron cargar las mesas de examen.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar las mesas",
        text: error.message || "Revisá conexión o permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnActualizarMesasGestion) {
      btnActualizarMesasGestion.disabled = false;
      btnActualizarMesasGestion.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Actualizar mesas
      `;
    }
  }
}

function mostrarMensajeCursosGestion(texto, tipo = "") {
  if (!mensajeCursosGestion) return;

  mensajeCursosGestion.textContent = texto || "";
  mensajeCursosGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeCursosGestion.classList.add(tipo);
  }
}

function crearTextoEstadoCurso(estado) {
  const valor = String(estado || "")
    .trim()
    .toUpperCase();

  return valor || "SIN ESTADO";
}

function renderizarCursosGestion(cursos) {
  if (!vistaCursosGestion) return;

  if (!cursos.length) {
    vistaCursosGestion.innerHTML = `
      <p class="mensaje-gestion">
        No hay cursos registrados para mostrar.
      </p>
    `;

    mostrarMensajeCursosGestion("No hay cursos registrados.");
    return;
  }

  const filas = cursos
    .map(
      (curso) => `
        <tr>
          <td>${curso.nombre || "-"}</td>
          <td>${curso.anio || "-"}</td>
          <td>${curso.division || "-"}</td>
          <td>
            <span class="estado-gestion ${crearTextoEstadoCurso(curso.estado) === "ACTIVO" ? "activo" : "inactivo"}">
              ${crearTextoEstadoCurso(curso.estado)}
            </span>
          </td>
        </tr>
      `,
    )
    .join("");

  vistaCursosGestion.innerHTML = `
    <div class="tabla-gestion-contenedor">
      <table class="tabla-gestion">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Año</th>
            <th>División</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeCursosGestion(`${cursos.length} curso(s) cargado(s).`, "ok");
}

async function cargarCursosGestion() {
  if (!vistaCursosGestion) return;

  try {
    if (btnVerCursosGestion) {
      btnVerCursosGestion.disabled = true;
      btnVerCursosGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando cursos...
      `;
    }

    mostrarMensajeCursosGestion("Cargando cursos institucionales...");

    vistaCursosGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando cursos...
      </p>
    `;

    const consulta = await getDocs(collection(db, "cursos"));

    const cursos = consulta.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const anioA = Number(a.anio || 0);
        const anioB = Number(b.anio || 0);

        if (anioA !== anioB) {
          return anioA - anioB;
        }

        return String(a.division || "").localeCompare(
          String(b.division || ""),
          "es",
        );
      });

    renderizarCursosGestion(cursos);
  } catch (error) {
    console.error("Error al cargar cursos en Portal Gestión:", error);

    vistaCursosGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudieron cargar los cursos. Revisá conexión o permisos.
      </p>
    `;

    mostrarMensajeCursosGestion(
      "No se pudieron cargar los cursos. Revisá conexión o permisos.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los cursos",
        text: "Revisá la conexión o los permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerCursosGestion) {
      btnVerCursosGestion.disabled = false;
      btnVerCursosGestion.innerHTML = `
        <i class="fa-solid fa-list"></i>
        Ver cursos
      `;
    }
  }
}

function mostrarMensajeEstudiantesGestion(texto, tipo = "") {
  if (!mensajeEstudiantesGestion) return;

  mensajeEstudiantesGestion.textContent = texto || "";
  mensajeEstudiantesGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeEstudiantesGestion.classList.add(tipo);
  }
}

function normalizarTextoGestion(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function enviarAlBackendDocumentacion(datos) {
  const respuesta = await fetch(BACKEND_DOCUMENTACION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo establecer comunicación con el backend.");
  }

  return respuesta.json();
}

async function enviarAlBackendInformesGestion(datos) {
  const respuesta = await fetch(INFORMES_BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo conectar con el backend de informes.");
  }

  return respuesta.json();
}

async function probarSesionInformesGestion() {
  const usuario = auth.currentUser;

  if (!usuario) {
    console.warn("No hay sesión activa para probar informes.");
    return;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "probar_sesion",
      idToken,
    });

    console.log("Prueba backend Informes:", resultado);
  } catch (error) {
    console.error("Error probando backend Informes:", error);
  }
}

async function probarOpcionesCreacionInformeGestion() {
  const usuario = auth.currentUser;

  if (!usuario) {
    console.warn("No hay sesión activa para probar opciones de informes.");
    return;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "obtener_opciones_creacion_informe",
      idToken,
    });

    console.log("Opciones creación informe:", resultado);
  } catch (error) {
    console.error("Error probando opciones de informes:", error);
  }
}

function mostrarMensajeInformesGestion(texto, tipo = "") {
  if (!mensajeInformesGestion) return;

  mensajeInformesGestion.textContent = texto || "";
  mensajeInformesGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeInformesGestion.classList.add(tipo);
  }
}

function cargarCursosInformesGestion() {
  if (!cursoInformeGestion) return;

  cursoInformeGestion.innerHTML = `
    <option value="">Seleccionar curso</option>
    ${cursosInformesGestion
      .map(
        (curso) => `
          <option value="${escaparHtmlGestion(curso.nombre)}">
            ${escaparHtmlGestion(curso.nombre)}
          </option>
        `,
      )
      .join("")}
  `;
}

function cargarEstudiantesInformeGestion() {
  if (!alumnoInformeGestion || !cursoInformeGestion) return;

  const cursoSeleccionado = String(cursoInformeGestion.value || "").trim();

  alumnoInformeGestion.innerHTML = `
    <option value="">Seleccionar estudiante</option>
  `;

  alumnoInformeGestion.disabled = true;

  if (!cursoSeleccionado) {
    if (btnCrearInformeGestion) {
      btnCrearInformeGestion.disabled = true;
    }

    return;
  }

  const estudiantesDelCurso = estudiantesInformesGestion
    .filter((estudiante) => {
      const cursoEstudiante = String(estudiante.cursoNombre || "").trim();

      return cursoEstudiante === cursoSeleccionado;
    })
    .sort((a, b) =>
      String(a.nombreCompleto || "").localeCompare(
        String(b.nombreCompleto || ""),
        "es",
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
    );

  alumnoInformeGestion.innerHTML = `
    <option value="">Seleccionar estudiante</option>
    ${estudiantesDelCurso
      .map(
        (estudiante) => `
          <option value="${escaparHtmlGestion(estudiante.correo)}">
            ${escaparHtmlGestion(estudiante.nombreCompleto)}
          </option>
        `,
      )
      .join("")}
  `;

  alumnoInformeGestion.disabled = !estudiantesDelCurso.length;

  if (btnCrearInformeGestion) {
    btnCrearInformeGestion.disabled = true;
  }

  if (!estudiantesDelCurso.length) {
    mostrarMensajeInformesGestion(
      "No se encontraron estudiantes activos para el curso seleccionado.",
    );
    return;
  }

  mostrarMensajeInformesGestion(
    `${estudiantesDelCurso.length} estudiante(s) disponible(s) para ${cursoSeleccionado}.`,
    "ok",
  );
}

function verificarFormularioInformeGestion() {
  if (!btnCrearInformeGestion) return;

  const cursoSeleccionado = String(cursoInformeGestion?.value || "").trim();
  const alumnoSeleccionado = String(alumnoInformeGestion?.value || "").trim();

  btnCrearInformeGestion.disabled = !cursoSeleccionado || !alumnoSeleccionado;
}

async function cargarOpcionesInformesGestion() {
  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  try {
    if (btnCargarOpcionesInformesGestion) {
      btnCargarOpcionesInformesGestion.disabled = true;
      btnCargarOpcionesInformesGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando datos...
      `;
    }

    mostrarMensajeInformesGestion("");

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion">
          Consultando cursos y estudiantes...
        </p>
      `;
    }

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "obtener_opciones_creacion_informe",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar los datos para informes.",
      );
    }

    cursosInformesGestion = resultado.cursos || [];
    estudiantesInformesGestion = resultado.estudiantes || [];

    cargarCursosInformesGestion();

    if (alumnoInformeGestion) {
      alumnoInformeGestion.innerHTML = `
        <option value="">Seleccionar estudiante</option>
      `;
      alumnoInformeGestion.disabled = true;
    }

    if (btnCrearInformeGestion) {
      btnCrearInformeGestion.disabled = true;
    }

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion ok">
          Datos cargados correctamente. Seleccioná un curso para ver sus estudiantes.
        </p>
      `;
    }

    mostrarMensajeInformesGestion(
      `Cursos cargados: ${cursosInformesGestion.length}. Estudiantes cargados: ${estudiantesInformesGestion.length}.`,
      "ok",
    );
  } catch (error) {
    console.error("Error al cargar opciones de informes:", error);

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion error">
          No se pudieron cargar los datos para crear informes.
        </p>
      `;
    }

    mostrarMensajeInformesGestion(
      error.message || "No se pudieron cargar los datos para informes.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los datos",
        text:
          error.message ||
          "Revisá conexión, sesión activa o permisos del backend.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnCargarOpcionesInformesGestion) {
      btnCargarOpcionesInformesGestion.disabled = false;
      btnCargarOpcionesInformesGestion.innerHTML = `
        <i class="fa-solid fa-rotate"></i>
        Cargar datos
      `;
    }
  }
}

async function crearInformePedagogicoGestion(event) {
  event.preventDefault();

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  const alumnoCorreo = String(alumnoInformeGestion?.value || "").trim();

  if (!alumnoCorreo) {
    mostrarMensajeInformesGestion(
      "Seleccioná un estudiante para crear el informe.",
      "error",
    );

    return;
  }

  const alumnoSeleccionado = estudiantesInformesGestion.find(
    (estudiante) =>
      String(estudiante.correo || "")
        .trim()
        .toLowerCase() === alumnoCorreo.toLowerCase(),
  );

  const nombreAlumno = alumnoSeleccionado?.nombreCompleto || "el estudiante";
  const cursoAlumno = alumnoSeleccionado?.cursoNombre || "curso sin asignar";

  const confirmacion = await Swal.fire({
    title: "Crear informe pedagógico",
    html: `
  <p>Se creará un Informe Pedagógico Institucional para:</p>
  <p>
    <strong>
      ${escaparHtmlGestion(nombreAlumno)} de ${escaparHtmlGestion(cursoAlumno)}
    </strong>
  </p>
  <p>El informe quedará guardado en Drive y será visible para los docentes autorizados del curso.</p>
`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, crear informe",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#009879",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    if (btnCrearInformeGestion) {
      btnCrearInformeGestion.disabled = true;
      btnCrearInformeGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Creando informe...
      `;
    }

    mostrarMensajeInformesGestion("");

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion">
          Creando informe pedagógico en Drive...
        </p>
      `;
    }

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "crear_informe_pedagogico",
      idToken,
      alumnoCorreo,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo crear el informe pedagógico.",
      );
    }

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <div class="resultado-informe-gestion">
          <p class="mensaje-gestion ok">
            Informe pedagógico creado correctamente.
          </p>

          <a
            class="btn-gestion"
            href="${escaparHtmlGestion(resultado.informe.driveUrl)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-solid fa-eye"></i>
            Ver informe
          </a>
        </div>
      `;
    }

    mostrarMensajeInformesGestion(
      `Informe creado para ${resultado.informe.alumnoNombre}. Docentes autorizados: ${resultado.informe.docentesAutorizados}.`,
      "ok",
    );

    if (formInformePedagogicoGestion) {
      formInformePedagogicoGestion.reset();
    }

    if (alumnoInformeGestion) {
      alumnoInformeGestion.innerHTML = `
        <option value="">Seleccionar estudiante</option>
      `;
      alumnoInformeGestion.disabled = true;
    }

    if (btnCrearInformeGestion) {
      btnCrearInformeGestion.disabled = true;
    }

    await Swal.fire({
      title: "Informe creado",
      html: `
        <p>El informe pedagógico fue creado correctamente.</p>
        <p>Podés abrirlo desde el botón <strong>Ver informe</strong>.</p>
      `,
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    console.error("Error al crear informe pedagógico:", error);

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion error">
          No se pudo crear el informe pedagógico.
        </p>
      `;
    }

    mostrarMensajeInformesGestion(
      error.message || "No se pudo crear el informe pedagógico.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo crear el informe",
        text:
          error.message ||
          "Revisá conexión, permisos o configuración del backend.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnCrearInformeGestion) {
      btnCrearInformeGestion.innerHTML = `
        <i class="fa-solid fa-file-circle-plus"></i>
        Crear informe
      `;

      verificarFormularioInformeGestion();
    }
  }
}

function formatearFechaInformeGestion(fechaTexto) {
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

function renderizarTablaInformesGestion(informes) {
  if (!vistaInformesGestion) return;

  if (!informes.length) {
    vistaInformesGestion.innerHTML = `
      <p class="mensaje-gestion">
        Todavía no hay informes pedagógicos creados.
      </p>
    `;

    mostrarMensajeInformesGestion("");
    return;
  }

  vistaInformesGestion.innerHTML = `
    <div class="tabla-informes-gestion-contenedor">
      <table class="tabla-informes-gestion">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Creado por</th>
            <th>Docentes</th>
            <th>Actualizar docentes</th>
            <th>Ver</th>
            <th>Eliminar</th>
          </tr>
        </thead>

        <tbody>
          ${informes
            .map((informe) => {
              const driveUrl = String(informe.driveUrl || "").trim();

              const alumnoCorreo = String(informe.alumnoCorreo || "")
                .trim()
                .toLowerCase();

              return `
                <tr>
                  <td>
                    ${escaparHtmlGestion(
                      formatearFechaInformeGestion(informe.fechaCreacion),
                    )}
                  </td>

                  <td>
                    <strong>
                      ${escaparHtmlGestion(
                        informe.alumnoNombre || "Estudiante sin nombre",
                      )}
                    </strong>

                    <small>
                      DNI:
                      ${escaparHtmlGestion(informe.alumnoDni || "-")}
                    </small>
                  </td>

                  <td>
                    ${escaparHtmlGestion(informe.cursoNombre || "-")}
                  </td>

                  <td>
                    <strong>
                      ${escaparHtmlGestion(informe.creadoPorNombre || "-")}
                    </strong>
                  </td>

                  <td>
                    ${escaparHtmlGestion(
                      String(informe.docentesAutorizados?.length || 0),
                    )}
                  </td>

                  <td>
                    ${
                      alumnoCorreo
                        ? `
                          <button
                            class="
                              btn-informe-tabla-gestion
                              btn-actualizar-docentes-informe-gestion
                            "
                            type="button"
                            title="Actualizar docentes autorizados"
                            aria-label="Actualizar docentes autorizados"
                            data-alumno-correo="${escaparHtmlGestion(
                              alumnoCorreo,
                            )}"
                          >
                            <i class="fa-solid fa-arrows-rotate"></i>
                          </button>
                        `
                        : "-"
                    }
                  </td>

                  <td>
                    ${
                      driveUrl
                        ? `
                          <a
                            class="btn-informe-tabla-gestion"
                            href="${escaparHtmlGestion(driveUrl)}"
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

                  <td>
                    <button
                      class="
                        btn-informe-tabla-gestion
                        btn-eliminar-informe-gestion
                      "
                      type="button"
                      title="Eliminar informe"
                      aria-label="Eliminar informe"
                      data-id-informe="${escaparHtmlGestion(informe.idInforme)}"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeInformesGestion(
    `${informes.length} informe(s) pedagógico(s) mostrado(s).`,
    "ok",
  );
}

async function listarInformesGestion() {
  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  try {
    if (btnListarInformesGestion) {
      btnListarInformesGestion.disabled = true;
      btnListarInformesGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando informes...
      `;
    }

    mostrarMensajeInformesGestion("");

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion">
          Consultando informes pedagógicos creados...
        </p>
      `;
    }

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "listar_informes_gestion",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar los informes pedagógicos.",
      );
    }

    informesGestionCargados = resultado.informes || [];

    renderizarTablaInformesGestion(informesGestionCargados);
  } catch (error) {
    console.error("Error al listar informes pedagógicos:", error);

    if (vistaInformesGestion) {
      vistaInformesGestion.innerHTML = `
        <p class="mensaje-gestion error">
          No se pudieron cargar los informes pedagógicos.
        </p>
      `;
    }

    mostrarMensajeInformesGestion(
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
    if (btnListarInformesGestion) {
      btnListarInformesGestion.disabled = false;
      btnListarInformesGestion.innerHTML = `
        <i class="fa-solid fa-table-list"></i>
        Ver informes creados
      `;
    }
  }
}

async function actualizarDocentesAutorizadosInformeGestion(
  alumnoCorreo,
  boton,
) {
  const correo = String(alumnoCorreo || "")
    .trim()
    .toLowerCase();

  if (!correo) {
    mostrarMensajeInformesGestion(
      "No se recibió el estudiante cuyos informes deben actualizarse.",
      "error",
    );

    return;
  }

  const informe = informesGestionCargados.find(
    (item) =>
      String(item.alumnoCorreo || "")
        .trim()
        .toLowerCase() === correo,
  );

  const nombreAlumno = informe?.alumnoNombre || "este estudiante";

  const cursoAlumno = informe?.cursoNombre || "curso sin asignar";

  const confirmacion = await Swal.fire({
    title: "¿Actualizar docentes autorizados?",

    html: `
      <p>
        Se actualizarán los permisos de todos los
        informes pedagógicos activos de:
      </p>

      <p>
        <strong>
          ${escaparHtmlGestion(nombreAlumno)}
        </strong>
      </p>

      <p>
        Curso registrado actualmente:
        <strong>
          ${escaparHtmlGestion(cursoAlumno)}
        </strong>
      </p>

      <p>
        Los docentes actuales recibirán acceso y los
        docentes que ya no correspondan dejarán de
        verlo.
      </p>

      <p>
        Los documentos y su contenido no serán
        eliminados ni trasladados.
      </p>
    `,

    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, actualizar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#009879",
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  const htmlOriginalBoton = boton?.innerHTML || "";

  try {
    if (boton) {
      boton.disabled = true;

      boton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
      `;
    }

    mostrarMensajeInformesGestion(
      `Actualizando docentes autorizados para ${nombreAlumno}...`,
    );

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "actualizar_docentes_informes_estudiante",

      idToken,
      alumnoCorreo: correo,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje ||
          "No se pudieron actualizar los docentes autorizados.",
      );
    }

    const informesActualizados = Number(resultado.informesActualizados || 0);

    const docentesActuales = Number(resultado.docentesActuales || 0);

    const permisosAgregados = Number(resultado.permisosAgregados || 0);

    const permisosEliminados = Number(resultado.permisosEliminados || 0);

    const informesConError = Number(resultado.informesConError || 0);

    await Swal.fire({
      title: informesConError
        ? "Actualización parcial"
        : "Docentes actualizados",

      html: `
        <p>
          Los permisos de los informes de
          <strong>
            ${escaparHtmlGestion(resultado.alumnoNombre || nombreAlumno)}
          </strong>
          fueron revisados.
        </p>

        <p>
          <strong>Curso actual:</strong>
          ${escaparHtmlGestion(resultado.cursoActual || cursoAlumno)}
        </p>

        <p>
          <strong>Informes actualizados:</strong>
          ${informesActualizados}
        </p>

        <p>
          <strong>Docentes autorizados:</strong>
          ${docentesActuales}
        </p>

        <p>
          <strong>Permisos agregados:</strong>
          ${permisosAgregados}
        </p>

        <p>
          <strong>Permisos retirados:</strong>
          ${permisosEliminados}
        </p>

        ${
          informesConError
            ? `
              <p>
                <strong>
                  Informes con error:
                </strong>
                ${informesConError}
              </p>
            `
            : ""
        }
      `,

      icon: informesConError ? "warning" : "success",

      confirmButtonText: "Aceptar",
    });

    await listarInformesGestion();
  } catch (error) {
    console.error("Error al actualizar docentes autorizados:", error);

    mostrarMensajeInformesGestion(
      error.message || "No se pudieron actualizar los docentes autorizados.",
      "error",
    );

    await Swal.fire({
      title: "No se pudieron actualizar los docentes",

      text:
        error.message ||
        "Revisá conexión, sesión activa o permisos del backend.",

      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton) {
      boton.disabled = false;

      boton.innerHTML =
        htmlOriginalBoton ||
        `
          <i class="fa-solid fa-arrows-rotate"></i>
        `;
    }
  }
}

async function eliminarInformePedagogicoGestion(idInforme, boton) {
  const id = String(idInforme || "").trim();

  if (!id) {
    mostrarMensajeInformesGestion(
      "No se recibió el ID del informe a eliminar.",
      "error",
    );

    return;
  }

  const informe = informesGestionCargados.find((item) => {
    return String(item.idInforme || "").trim() === id;
  });

  const nombreAlumno = informe?.alumnoNombre || "este estudiante";
  const cursoAlumno = informe?.cursoNombre || "curso sin asignar";

  const confirmacion = await Swal.fire({
    title: "¿Eliminar informe pedagógico?",
    html: `
      <p>Se eliminará el informe pedagógico de:</p>
      <p>
        <strong>
          ${escaparHtmlGestion(nombreAlumno)} de ${escaparHtmlGestion(cursoAlumno)}
        </strong>
      </p>
      <p>El documento será enviado a la papelera de Drive y dejará de aparecer en el listado.</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#c0392b",
  });

  if (!confirmacion.isConfirmed) {
    return;
  }

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeInformesGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  const htmlOriginalBoton = boton ? boton.innerHTML : "";

  try {
    if (boton) {
      boton.disabled = true;
      boton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
      `;
    }

    mostrarMensajeInformesGestion("Eliminando informe pedagógico...", "");

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendInformesGestion({
      accion: "eliminar_informe_pedagogico",
      idToken,
      idInforme: id,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo eliminar el informe pedagógico.",
      );
    }

    await Swal.fire({
      title: "Informe eliminado",
      text: "El informe pedagógico fue eliminado correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await listarInformesGestion();
  } catch (error) {
    console.error("Error al eliminar informe pedagógico:", error);

    mostrarMensajeInformesGestion(
      error.message || "No se pudo eliminar el informe pedagógico.",
      "error",
    );

    await Swal.fire({
      title: "No se pudo eliminar",
      text:
        error.message ||
        "Revisá conexión, sesión activa o permisos del backend.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML =
        htmlOriginalBoton ||
        `
          <i class="fa-solid fa-trash-can"></i>
        `;
    }
  }
}

function escaparHtmlGestion(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function obtenerEtiquetaTipoDocumentoGestion(tipoDocumento) {
  const etiquetas = {
    PLAN_ANUAL: "Plan Anual",
    PROGRAMA_EXAMEN: "Programa de Examen",
    MATERIAL_ESTUDIO: "Material de Estudio",
  };

  return etiquetas[tipoDocumento] || "Sin tipo";
}

function formatearFechaDocumentacionGestion(fechaTexto) {
  const fecha = String(fechaTexto || "").trim();

  if (!fecha) {
    return "Sin fecha";
  }

  return fecha.replace(" ", " · ");
}

function obtenerCursoEstudianteGestion(estudiante) {
  const cursoNombre = String(estudiante.cursoNombre || "").trim();

  if (cursoNombre) return cursoNombre;

  const anio = estudiante.cursoAnio || "";
  const division = estudiante.cursoDivision || "";

  if (!anio && !division) return "Sin curso";

  return `${anio}º ${division}`;
}

function obtenerGrupoTallerEstudianteGestion(estudiante) {
  return String(estudiante.grupoTaller || "").trim() || "Sin grupo";
}

function cargarCursosFiltroEstudiantesGestion(estudiantes) {
  if (!filtroCursoEstudianteGestion) return;

  const valorActual = String(filtroCursoEstudianteGestion.value || "").trim();

  const cursos = Array.from(
    new Set(estudiantes.map(obtenerCursoEstudianteGestion).filter(Boolean)),
  )
    .filter((curso) => curso !== "Sin curso")
    .sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  filtroCursoEstudianteGestion.innerHTML = `
    <option value="">Todos los cursos</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${curso}">${curso}</option>
        `,
      )
      .join("")}
  `;

  if (valorActual && cursos.includes(valorActual)) {
    filtroCursoEstudianteGestion.value = valorActual;
  }
}

function obtenerRolGestionActual() {
  return String(window.portalUsuario?.rol || "")
    .trim()
    .toUpperCase();
}

function usuarioPuedeDarDeBajaEstudiantesGestion() {
  return ["PRECEPTORIA", "SECRETARIA", "DIRECCION"].includes(
    obtenerRolGestionActual(),
  );
}

async function darDeBajaEstudianteGestion(estudiante, boton = null) {
  const usuario = auth.currentUser;

  if (!usuario) {
    await Swal.fire({
      title: "Sesión no disponible",
      text: "Volvé a iniciar sesión para continuar.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  if (!usuarioPuedeDarDeBajaEstudiantesGestion()) {
    await Swal.fire({
      title: "Acción no autorizada",
      text: "Tu perfil no tiene permisos para dar de baja estudiantes.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  const correo = String(estudiante.correo || estudiante.id || "")
    .trim()
    .toLowerCase();

  if (!correo) {
    await Swal.fire({
      title: "No se pudo identificar al estudiante",
      text: "El registro no tiene un correo asociado.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  const rolEstudiante = String(estudiante.rol || "")
    .trim()
    .toUpperCase();

  const estadoEstudiante = String(estudiante.estado || "")
    .trim()
    .toUpperCase();

  if (rolEstudiante !== "ALUMNO" || estadoEstudiante !== "ACTIVO") {
    await Swal.fire({
      title: "La baja no está disponible",
      text: "Solamente pueden darse de baja estudiantes activos.",
      icon: "warning",
      confirmButtonText: "Aceptar",
    });

    return;
  }

  const nombre = String(estudiante.nombreCompleto || "").trim() || correo;

  const cursoActual = obtenerCursoEstudianteGestion(estudiante);

  const confirmacion = await Swal.fire({
    title: "¿Dar de baja al estudiante?",

    html: `
      <p>
        <strong>
          ${escaparHtmlGestion(nombre)}
        </strong>
      </p>

      <p>
        ${escaparHtmlGestion(correo)}
      </p>

      <p>
        Curso actual:
        <strong>
          ${escaparHtmlGestion(cursoActual)}
        </strong>
      </p>

      <hr>

      <p>
        El estudiante quedará inactivo, se quitará de su
        curso y no podrá ingresar al Portal Alumno.
      </p>

      <p>
        <strong>
          Esta acción no elimina asistencias, inscripciones
          ni otros registros históricos.
        </strong>
      </p>
    `,

    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, dar de baja",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b42318",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!confirmacion.isConfirmed) return;

  const contenidoOriginalBoton = boton?.innerHTML || "";

  try {
    if (boton) {
      boton.disabled = true;

      boton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Procesando...
      `;
    }

    await updateDoc(doc(db, "usuarios", correo), {
      estado: "INACTIVO",
      tipoVinculo: "BAJA",

      cursoId: null,
      cursoAnio: null,
      cursoDivision: null,
      cursoNombre: null,
      grupoTaller: null,

      fechaBaja: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario.email,
    });

    await Swal.fire({
      title: "Estudiante dado de baja",
      text: "El estudiante quedó inactivo y fue desvinculado de su curso.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    await cargarEstudiantesGestion();
  } catch (error) {
    console.error("Error al dar de baja al estudiante desde Gestión:", error);

    await Swal.fire({
      title: "No se pudo dar de baja",
      text: error.message || "Revisá la conexión o los permisos de Firebase.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    if (boton && boton.isConnected) {
      boton.disabled = false;
      boton.innerHTML = contenidoOriginalBoton;
    }
  }
}

function renderizarEstudiantesGestion(estudiantes) {
  if (!vistaEstudiantesGestion) return;

  if (!estudiantes.length) {
    vistaEstudiantesGestion.innerHTML = `
      <p class="mensaje-gestion">
        No se encontraron estudiantes con esos filtros.
      </p>
    `;

    mostrarMensajeEstudiantesGestion(
      "No se encontraron estudiantes con esos filtros.",
    );

    return;
  }

  const puedeDarDeBaja = usuarioPuedeDarDeBajaEstudiantesGestion();

  const filas = estudiantes
    .map((estudiante) => {
      const estado = crearTextoEstadoCurso(estudiante.estado);

      const estaActivo =
        String(estudiante.estado || "")
          .trim()
          .toUpperCase() === "ACTIVO";

      const correo = String(estudiante.correo || estudiante.id || "")
        .trim()
        .toLowerCase();

      const acciones =
        puedeDarDeBaja && estaActivo
          ? `
            <button
              class="btn-baja-estudiante-gestion"
              type="button"
              data-correo-estudiante="${escaparHtmlGestion(correo)}"
            >
              <i class="fa-solid fa-user-slash"></i>
              Dar de baja
            </button>
          `
          : `
            <span class="accion-no-disponible-gestion">
              —
            </span>
          `;

      return `
        <tr>
          <td>
            ${escaparHtmlGestion(estudiante.nombreCompleto || "-")}
          </td>

          <td>
            ${escaparHtmlGestion(estudiante.correo || correo || "-")}
          </td>

          <td>
            ${escaparHtmlGestion(obtenerCursoEstudianteGestion(estudiante))}
          </td>

          <td>
            ${escaparHtmlGestion(
              obtenerGrupoTallerEstudianteGestion(estudiante),
            )}
          </td>

          <td>
            <span
              class="estado-gestion ${
                estado === "ACTIVO" ? "activo" : "inactivo"
              }"
            >
              ${escaparHtmlGestion(estado)}
            </span>
          </td>

          <td class="celda-acciones-estudiantes-gestion">
            ${acciones}
          </td>
        </tr>
      `;
    })
    .join("");

  vistaEstudiantesGestion.innerHTML = `
    <div class="tabla-gestion-contenedor">
      <table class="tabla-gestion tabla-estudiantes-gestion">
        <thead>
          <tr>
            <th>Nombre completo</th>
            <th>Correo</th>
            <th>Curso</th>
            <th>Grupo de Taller</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeEstudiantesGestion(
    `${estudiantes.length} estudiante(s) mostrado(s).`,
    "ok",
  );
}

function aplicarFiltrosEstudiantesGestion() {
  const textoBusqueda = normalizarTextoGestion(buscarEstudianteGestion?.value);

  const cursoSeleccionado = String(
    filtroCursoEstudianteGestion?.value || "",
  ).trim();

  const estadoSeleccionado = String(filtroEstadoEstudianteGestion?.value || "")
    .trim()
    .toUpperCase();

  const estudiantesFiltrados = estudiantesGestionCargados.filter(
    (estudiante) => {
      const nombre = normalizarTextoGestion(estudiante.nombreCompleto);
      const correo = normalizarTextoGestion(estudiante.correo);

      const curso = obtenerCursoEstudianteGestion(estudiante);

      const estado = String(estudiante.estado || "")
        .trim()
        .toUpperCase();

      const coincideBusqueda =
        !textoBusqueda ||
        nombre.includes(textoBusqueda) ||
        correo.includes(textoBusqueda);

      const coincideCurso = !cursoSeleccionado || curso === cursoSeleccionado;

      const coincideEstado =
        !estadoSeleccionado || estado === estadoSeleccionado;

      return coincideBusqueda && coincideCurso && coincideEstado;
    },
  );

  renderizarEstudiantesGestion(estudiantesFiltrados);
}

async function cargarEstudiantesGestion() {
  if (!vistaEstudiantesGestion) return;

  try {
    if (btnVerEstudiantesGestion) {
      btnVerEstudiantesGestion.disabled = true;
      btnVerEstudiantesGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando estudiantes...
      `;
    }

    mostrarMensajeEstudiantesGestion("Cargando estudiantes...");

    vistaEstudiantesGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando estudiantes...
      </p>
    `;

    const consultaEstudiantes = query(
      collection(db, "usuarios"),
      where("rol", "==", "ALUMNO"),
    );

    const consulta = await getDocs(consultaEstudiantes);

    estudiantesGestionCargados = consulta.docs
      .map((documento) => ({
        id: documento.id,
        correo: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) =>
        String(a.nombreCompleto || "").localeCompare(
          String(b.nombreCompleto || ""),
          "es",
        ),
      );

    if (!estudiantesGestionCargados.length) {
      vistaEstudiantesGestion.innerHTML = `
        <p class="mensaje-gestion">
          No hay estudiantes registrados para mostrar.
        </p>
      `;

      mostrarMensajeEstudiantesGestion("No hay estudiantes registrados.");
      return;
    }

    cargarCursosFiltroEstudiantesGestion(estudiantesGestionCargados);
    aplicarFiltrosEstudiantesGestion();
  } catch (error) {
    console.error("Error al cargar estudiantes en Portal Gestión:", error);

    vistaEstudiantesGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudieron cargar los estudiantes. Revisá conexión o permisos.
      </p>
    `;

    mostrarMensajeEstudiantesGestion(
      "No se pudieron cargar los estudiantes. Revisá conexión o permisos.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los estudiantes",
        text: "Revisá la conexión o los permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerEstudiantesGestion) {
      btnVerEstudiantesGestion.disabled = false;
      btnVerEstudiantesGestion.innerHTML = `
        <i class="fa-solid fa-user-graduate"></i>
        Ver estudiantes
      `;
    }
  }
}

function mostrarMensajeDocentesGestion(texto, tipo = "") {
  if (!mensajeDocentesGestion) return;

  mensajeDocentesGestion.textContent = texto || "";
  mensajeDocentesGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeDocentesGestion.classList.add(tipo);
  }
}

function obtenerCursoAsignacionGestion(asignacion) {
  const cursoNombre = String(asignacion.cursoNombre || "").trim();

  if (cursoNombre) return cursoNombre;

  const anio = asignacion.cursoAnio || "";
  const division = asignacion.cursoDivision || "";

  if (!anio && !division) return "Curso sin cargar";

  return `${anio}º ${division}`;
}

function cargarCursosFiltroDocentesGestion(asignaciones) {
  if (!filtroCursoDocenteGestion) return;

  const valorActual = String(filtroCursoDocenteGestion.value || "").trim();

  const cursos = Array.from(
    new Set(asignaciones.map(obtenerCursoAsignacionGestion).filter(Boolean)),
  )
    .filter((curso) => curso !== "Curso sin cargar")
    .sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  filtroCursoDocenteGestion.innerHTML = `
    <option value="">Todos los cursos</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${curso}">${curso}</option>
        `,
      )
      .join("")}
  `;

  if (valorActual && cursos.includes(valorActual)) {
    filtroCursoDocenteGestion.value = valorActual;
  }
}

function cargarEspaciosFiltroDocentesGestion(asignaciones) {
  if (!filtroEspacioDocenteGestion) return;

  const valorActual = String(filtroEspacioDocenteGestion.value || "").trim();

  const espacios = Array.from(
    new Set(asignaciones.map(obtenerNombreEspacioAsignacion).filter(Boolean)),
  )
    .filter((espacio) => espacio !== "Espacio sin cargar")
    .sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  filtroEspacioDocenteGestion.innerHTML = `
    <option value="">Todos los espacios curriculares</option>

    ${espacios
      .map(
        (espacio) => `
          <option value="${escaparHtmlGestion(espacio)}">
            ${escaparHtmlGestion(espacio)}
          </option>
        `,
      )
      .join("")}
  `;

  if (valorActual && espacios.includes(valorActual)) {
    filtroEspacioDocenteGestion.value = valorActual;
  }
}

function actualizarFiltrosRelacionadosDocentesGestion(origen = "") {
  const obtenerAsignacionesPorCurso = (curso) => {
    if (!curso) {
      return asignacionesDocentesGestionCargadas;
    }

    return asignacionesDocentesGestionCargadas.filter(
      (asignacion) => obtenerCursoAsignacionGestion(asignacion) === curso,
    );
  };

  const obtenerAsignacionesPorEspacio = (espacio) => {
    if (!espacio) {
      return asignacionesDocentesGestionCargadas;
    }

    return asignacionesDocentesGestionCargadas.filter(
      (asignacion) => obtenerNombreEspacioAsignacion(asignacion) === espacio,
    );
  };

  const cursoSeleccionado = String(
    filtroCursoDocenteGestion?.value || "",
  ).trim();

  const espacioSeleccionado = String(
    filtroEspacioDocenteGestion?.value || "",
  ).trim();

  if (origen === "ESPACIO") {
    cargarCursosFiltroDocentesGestion(
      obtenerAsignacionesPorEspacio(espacioSeleccionado),
    );

    const cursoActual = String(filtroCursoDocenteGestion?.value || "").trim();

    cargarEspaciosFiltroDocentesGestion(
      obtenerAsignacionesPorCurso(cursoActual),
    );

    return;
  }

  cargarEspaciosFiltroDocentesGestion(
    obtenerAsignacionesPorCurso(cursoSeleccionado),
  );

  const espacioActual = String(filtroEspacioDocenteGestion?.value || "").trim();

  cargarCursosFiltroDocentesGestion(
    obtenerAsignacionesPorEspacio(espacioActual),
  );
}

function agruparAsignacionesPorDocente(asignaciones) {
  const docentes = new Map();

  asignaciones.forEach((asignacion) => {
    const docenteCorreo = String(asignacion.docenteCorreo || "").trim();
    const docenteNombre = String(asignacion.docenteNombre || "").trim();

    const claveDocente =
      docenteCorreo || normalizarTextoGestion(docenteNombre) || "sin-docente";

    if (!docentes.has(claveDocente)) {
      docentes.set(claveDocente, {
        docenteNombre: docenteNombre || "Docente sin cargar",
        docenteCorreo,
        cursos: new Map(),
      });
    }

    const docente = docentes.get(claveDocente);
    const curso = obtenerCursoAsignacionGestion(asignacion);

    if (!docente.cursos.has(curso)) {
      docente.cursos.set(curso, []);
    }

    docente.cursos.get(curso).push(asignacion);
  });

  return Array.from(docentes.values()).sort((a, b) =>
    String(a.docenteNombre || "").localeCompare(
      String(b.docenteNombre || ""),
      "es",
    ),
  );
}

function obtenerNombreEspacioAsignacion(asignacion) {
  return (
    String(asignacion.espacioNombre || "").trim() ||
    String(asignacion.espacioCurricular || "").trim() ||
    "Espacio sin cargar"
  );
}

function agruparAsignacionesPorEspacio(asignaciones) {
  const espacios = new Map();

  asignaciones.forEach((asignacion) => {
    const nombreEspacio = obtenerNombreEspacioAsignacion(asignacion);
    const tipoEspacio = textoTipoEspacioGestion(asignacion.espacioTipo);
    const curso = obtenerCursoAsignacionGestion(asignacion);

    const claveEspacio = normalizarTextoGestion(nombreEspacio);

    if (!espacios.has(claveEspacio)) {
      espacios.set(claveEspacio, {
        nombre: nombreEspacio,
        tipo: tipoEspacio,
        cursos: new Set(),
      });
    }

    espacios.get(claveEspacio).cursos.add(curso);
  });

  return Array.from(espacios.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function renderizarTarjetaDocenteGestion(docente) {
  const todasLasAsignaciones = Array.from(docente.cursos.values()).flat();

  const espaciosAgrupados = agruparAsignacionesPorEspacio(todasLasAsignaciones);

  const espaciosHtml = espaciosAgrupados
    .map((espacio) => {
      const cursosOrdenados = Array.from(espacio.cursos).sort((a, b) =>
        a.localeCompare(b, "es", {
          numeric: true,
          sensitivity: "base",
        }),
      );

      return `
        <div class="bloque-espacio-docente-gestion">
          <div class="encabezado-espacio-docente-gestion">
            <h5>${espacio.nombre}</h5>
            <small>${espacio.tipo}</small>
          </div>

          <p>${cursosOrdenados.join(" · ")}</p>
        </div>
      `;
    })
    .join("");

  return `
    <article class="tarjeta-docente-gestion">
      <div class="encabezado-docente-gestion">
        <div>
          <h4>${docente.docenteNombre}</h4>
          <p>${docente.docenteCorreo || "Correo no cargado"}</p>
        </div>

        <i class="fa-solid fa-chalkboard-user"></i>
      </div>

      <div class="espacios-docente-gestion">
        ${espaciosHtml}
      </div>
    </article>
  `;
}

function textoTipoEspacioGestion(tipo) {
  const valor = String(tipo || "")
    .trim()
    .toUpperCase();

  const tipos = {
    AULA: "Aula",
    TALLER: "Taller",
    EDUCACION_FISICA: "Educación Física",
  };

  return tipos[valor] || valor || "Sin tipo";
}

function normalizarTurnoDocenteGestion(turno) {
  const valor = normalizarTextoGestion(turno).toUpperCase();

  if (valor === "MANANA") return "MANANA";
  if (valor === "TARDE") return "TARDE";

  return valor;
}

function obtenerCursoHorarioDocenteGestion(horario) {
  const cursoNombre = String(horario.cursoNombre || "").trim();

  if (cursoNombre) {
    return cursoNombre;
  }

  const anio = horario.cursoAnio || "";
  const division = horario.cursoDivision || "";

  if (!anio && !division) {
    return "";
  }

  return `${anio}º ${division}`.trim();
}

function obtenerEspacioHorarioDocenteGestion(horario) {
  return (
    String(horario.espacioCurricular || "").trim() ||
    String(horario.espacioNombre || "").trim()
  );
}

function obtenerTurnosAsignacionDocenteGestion(asignacion) {
  const correoAsignacion = normalizarTextoGestion(asignacion.docenteCorreo);

  const nombreAsignacion = normalizarTextoGestion(asignacion.docenteNombre);

  const cursoIdAsignacion = String(asignacion.cursoId || "").trim();

  const cursoAsignacion = normalizarTextoGestion(
    obtenerCursoAsignacionGestion(asignacion),
  );

  const espacioIdAsignacion = String(asignacion.espacioId || "").trim();

  const espacioAsignacion = normalizarTextoGestion(
    obtenerNombreEspacioAsignacion(asignacion),
  );

  const turnos = new Set();

  horariosDocentesGestionCargados.forEach((horario) => {
    const correoHorario = normalizarTextoGestion(horario.docenteCorreo);

    const nombreHorario = normalizarTextoGestion(horario.docenteNombre);

    const mismoDocente =
      correoAsignacion && correoHorario
        ? correoAsignacion === correoHorario
        : Boolean(
            nombreAsignacion &&
            nombreHorario &&
            nombreAsignacion === nombreHorario,
          );

    if (!mismoDocente) {
      return;
    }

    const cursoIdHorario = String(horario.cursoId || "").trim();

    const cursoHorario = normalizarTextoGestion(
      obtenerCursoHorarioDocenteGestion(horario),
    );

    const mismoCurso =
      cursoIdAsignacion && cursoIdHorario
        ? cursoIdAsignacion === cursoIdHorario
        : Boolean(
            cursoAsignacion && cursoHorario && cursoAsignacion === cursoHorario,
          );

    if (!mismoCurso) {
      return;
    }

    const espacioIdHorario = String(horario.espacioId || "").trim();

    const espacioHorario = normalizarTextoGestion(
      obtenerEspacioHorarioDocenteGestion(horario),
    );

    const mismoEspacio =
      espacioIdAsignacion && espacioIdHorario
        ? espacioIdAsignacion === espacioIdHorario
        : Boolean(
            espacioAsignacion &&
            espacioHorario &&
            espacioAsignacion === espacioHorario,
          );

    if (!mismoEspacio) {
      return;
    }

    const turno = normalizarTurnoDocenteGestion(horario.turno);

    if (turno === "MANANA" || turno === "TARDE") {
      turnos.add(turno);
    }
  });

  return Array.from(turnos);
}

function renderizarDocentesGestion(asignaciones) {
  if (!vistaDocentesGestion) return;

  if (!asignaciones.length) {
    vistaDocentesGestion.innerHTML = `
      <p class="mensaje-gestion">
        No se encontraron docentes con esos filtros.
      </p>
    `;

    mostrarMensajeDocentesGestion(
      "No se encontraron docentes con esos filtros.",
    );

    return;
  }

  const docentesAgrupados = agruparAsignacionesPorDocente(asignaciones);

  const filas = docentesAgrupados.flatMap((docente) => {
    const todasLasAsignaciones = Array.from(docente.cursos.values()).flat();

    const espaciosAgrupados =
      agruparAsignacionesPorEspacio(todasLasAsignaciones);

    return espaciosAgrupados.map((espacio) => {
      const cursosOrdenados = Array.from(espacio.cursos).sort((a, b) =>
        a.localeCompare(b, "es", {
          numeric: true,
          sensitivity: "base",
        }),
      );

      return `
        <tr>
          <td>
            <strong>
              ${escaparHtmlGestion(
                docente.docenteNombre || "Docente sin cargar",
              )}
            </strong>
          </td>

          <td>
            ${escaparHtmlGestion(espacio.nombre)}
          </td>

          <td>
            ${escaparHtmlGestion(cursosOrdenados.join(" · "))}
          </td>

          <td>
            ${escaparHtmlGestion(docente.docenteCorreo || "Correo no cargado")}
          </td>
        </tr>
      `;
    });
  });

  vistaDocentesGestion.innerHTML = `
    <div class="tabla-gestion-contenedor">
      <table class="tabla-gestion tabla-docentes-gestion">
        <thead>
          <tr>
            <th>Apellido y nombre</th>
            <th>Espacio Curricular</th>
            <th>Cursos</th>
            <th>Correo electrónico</th>
          </tr>
        </thead>

        <tbody>
          ${filas.join("")}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeDocentesGestion(
    `${docentesAgrupados.length} docente(s) mostrado(s).`,
    "ok",
  );
}

function aplicarFiltrosDocentesGestion() {
  const textoBusqueda = normalizarTextoGestion(buscarDocenteGestion?.value);

  const cursoSeleccionado = String(
    filtroCursoDocenteGestion?.value || "",
  ).trim();

  const espacioSeleccionado = String(
    filtroEspacioDocenteGestion?.value || "",
  ).trim();

  const turnoSeleccionado = String(filtroTurnoDocenteGestion?.value || "")
    .trim()
    .toUpperCase();

  const asignacionesFiltradas = asignacionesDocentesGestionCargadas.filter(
    (asignacion) => {
      const docenteNombre = normalizarTextoGestion(asignacion.docenteNombre);

      const docenteCorreo = normalizarTextoGestion(asignacion.docenteCorreo);

      const curso = obtenerCursoAsignacionGestion(asignacion);

      const espacio = obtenerNombreEspacioAsignacion(asignacion);

      const turnosAsignacion =
        obtenerTurnosAsignacionDocenteGestion(asignacion);

      const coincideBusqueda =
        !textoBusqueda ||
        docenteNombre.includes(textoBusqueda) ||
        docenteCorreo.includes(textoBusqueda);

      const coincideCurso = !cursoSeleccionado || curso === cursoSeleccionado;

      const coincideEspacio =
        !espacioSeleccionado || espacio === espacioSeleccionado;

      const coincideTurno =
        !turnoSeleccionado || turnosAsignacion.includes(turnoSeleccionado);

      return (
        coincideBusqueda && coincideCurso && coincideEspacio && coincideTurno
      );
    },
  );

  renderizarDocentesGestion(asignacionesFiltradas);
}

async function cargarDocentesGestion() {
  if (!vistaDocentesGestion) return;

  try {
    if (btnVerDocentesGestion) {
      btnVerDocentesGestion.disabled = true;
      btnVerDocentesGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando docentes...
      `;
    }

    mostrarMensajeDocentesGestion("Cargando docentes y asignaciones...");

    vistaDocentesGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando asignaciones docentes...
      </p>
    `;

    const consultaAsignaciones = getDocs(
      collection(db, "asignaciones_docentes"),
    );

    const consultaHorarios = getDocs(
      query(collection(db, "horarios"), where("estado", "==", "ACTIVO")),
    );

    const [resultadoAsignaciones, resultadoHorarios] = await Promise.all([
      consultaAsignaciones,
      consultaHorarios,
    ]);

    horariosDocentesGestionCargados = resultadoHorarios.docs.map(
      (documento) => ({
        id: documento.id,
        ...documento.data(),
      }),
    );

    asignacionesDocentesGestionCargadas = resultadoAsignaciones.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .sort((a, b) => {
        const docenteA = String(a.docenteNombre || "");
        const docenteB = String(b.docenteNombre || "");

        if (docenteA !== docenteB) {
          return docenteA.localeCompare(docenteB, "es");
        }

        const cursoA = obtenerCursoAsignacionGestion(a);
        const cursoB = obtenerCursoAsignacionGestion(b);

        if (cursoA !== cursoB) {
          return cursoA.localeCompare(cursoB, "es", {
            numeric: true,
            sensitivity: "base",
          });
        }

        return obtenerNombreEspacioAsignacion(a).localeCompare(
          obtenerNombreEspacioAsignacion(b),
          "es",
        );
      });

    if (!asignacionesDocentesGestionCargadas.length) {
      vistaDocentesGestion.innerHTML = `
        <p class="mensaje-gestion">
          No hay asignaciones docentes registradas para mostrar.
        </p>
      `;

      mostrarMensajeDocentesGestion(
        "No hay asignaciones docentes registradas.",
      );
      return;
    }

    cargarCursosFiltroDocentesGestion(asignacionesDocentesGestionCargadas);

    cargarEspaciosFiltroDocentesGestion(asignacionesDocentesGestionCargadas);

    aplicarFiltrosDocentesGestion();
  } catch (error) {
    console.error("Error al cargar docentes en Portal Gestión:", error);

    vistaDocentesGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudieron cargar los docentes. Revisá conexión o permisos.
      </p>
    `;

    mostrarMensajeDocentesGestion(
      "No se pudieron cargar los docentes. Revisá conexión o permisos.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los docentes",
        text: "Revisá la conexión o los permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerDocentesGestion) {
      btnVerDocentesGestion.disabled = false;
      btnVerDocentesGestion.innerHTML = `
        <i class="fa-solid fa-chalkboard-user"></i>
        Ver docentes
      `;
    }
  }
}

function mostrarMensajeHorariosGestion(texto, tipo = "") {
  if (!mensajeHorariosGestion) return;

  mensajeHorariosGestion.textContent = texto || "";
  mensajeHorariosGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeHorariosGestion.classList.add(tipo);
  }
}

function obtenerTipoHorarioGestion(tipoHorario) {
  const valor = String(tipoHorario || "")
    .trim()
    .toUpperCase();

  const tipos = {
    AULA: "Horario de Aula",
    TALLER: "Horario de Taller",
    EDUCACION_FISICA: "Horario de Educación Física",
  };

  return tipos[valor] || valor || "Sin tipo";
}

function obtenerTurnoHorarioGestion(turno) {
  const valor = String(turno || "")
    .trim()
    .toUpperCase();

  const turnos = {
    MANANA: "Mañana",
    TARDE: "Tarde",
  };

  return turnos[valor] || valor || "Sin turno";
}

function obtenerDiaHorarioGestion(dia) {
  const valor = String(dia || "")
    .trim()
    .toUpperCase();

  const dias = {
    LUNES: "Lunes",
    MARTES: "Martes",
    MIERCOLES: "Miércoles",
    JUEVES: "Jueves",
    VIERNES: "Viernes",
  };

  return dias[valor] || valor || "Sin día";
}

function obtenerOrdenDiaHorarioGestion(dia) {
  const valor = String(dia || "")
    .trim()
    .toUpperCase();

  const orden = {
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
  };

  return orden[valor] || 99;
}

function obtenerCursoHorarioGestion(horario) {
  const cursoNombre = String(horario.cursoNombre || "").trim();

  if (cursoNombre) return cursoNombre;

  const anio = horario.cursoAnio || "";
  const division = horario.cursoDivision || "";

  if (!anio && !division) return "Curso sin cargar";

  return `${anio}º ${division}`;
}

function obtenerHorarioTextoGestion(horario) {
  const horarioTexto = String(horario.horarioTexto || "").trim();

  if (horarioTexto) return horarioTexto;

  const inicio = String(horario.horaInicio || "").trim();
  const fin = String(horario.horaFin || "").trim();

  if (!inicio && !fin) return "Horario sin cargar";

  return `${inicio || "-"} a ${fin || "-"}`;
}

function obtenerEspacioHorarioGestion(horario) {
  return (
    String(horario.espacioCurricular || "").trim() ||
    String(horario.espacioNombre || "").trim() ||
    "Espacio sin cargar"
  );
}

function obtenerExtraHorarioGestion(horario) {
  const extras = [];

  if (horario.grupoTaller) {
    extras.push(`Grupo ${horario.grupoTaller}`);
  }

  if (horario.ubicacion) {
    extras.push(horario.ubicacion);
  }

  return extras.join(" · ");
}

function cargarCursosFiltroHorariosGestion(horarios) {
  if (!filtroCursoHorarioGestion) return;

  const valorActual = String(filtroCursoHorarioGestion.value || "").trim();

  const cursos = Array.from(
    new Set(horarios.map(obtenerCursoHorarioGestion).filter(Boolean)),
  )
    .filter((curso) => curso !== "Curso sin cargar")
    .sort((a, b) =>
      a.localeCompare(b, "es", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  filtroCursoHorarioGestion.innerHTML = `
    <option value="">Todos los cursos</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${curso}">${curso}</option>
        `,
      )
      .join("")}
  `;

  if (valorActual && cursos.includes(valorActual)) {
    filtroCursoHorarioGestion.value = valorActual;
  }
}

function cargarEspaciosFiltroHorariosGestion(horarios) {
  if (!filtroEspacioHorarioGestion) return;

  const valorActual = String(filtroEspacioHorarioGestion.value || "").trim();

  const espacios = Array.from(
    new Set(
      horarios
        .map((horario) => obtenerEspacioHorarioGestion(horario))
        .filter((espacio) => espacio && espacio !== "Espacio sin cargar"),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );

  filtroEspacioHorarioGestion.innerHTML = `
    <option value="">Todos los espacios</option>

    ${espacios
      .map(
        (espacio) => `
          <option value="${escaparHtmlGestion(espacio)}">
            ${escaparHtmlGestion(espacio)}
          </option>
        `,
      )
      .join("")}
  `;

  if (valorActual && espacios.includes(valorActual)) {
    filtroEspacioHorarioGestion.value = valorActual;
  }
}

function ordenarHorariosGestion(horarios) {
  return [...horarios].sort((a, b) => {
    const tipoA = String(a.tipoHorario || "");
    const tipoB = String(b.tipoHorario || "");

    if (tipoA !== tipoB) {
      return tipoA.localeCompare(tipoB, "es");
    }

    const turnoA = String(a.turno || "");
    const turnoB = String(b.turno || "");

    if (turnoA !== turnoB) {
      return turnoA.localeCompare(turnoB, "es");
    }

    const diaA = obtenerOrdenDiaHorarioGestion(a.dia);
    const diaB = obtenerOrdenDiaHorarioGestion(b.dia);

    if (diaA !== diaB) {
      return diaA - diaB;
    }

    const horaA = String(a.horaInicio || "");
    const horaB = String(b.horaInicio || "");

    if (horaA !== horaB) {
      return horaA.localeCompare(horaB, "es");
    }

    return obtenerCursoHorarioGestion(a).localeCompare(
      obtenerCursoHorarioGestion(b),
      "es",
      {
        numeric: true,
        sensitivity: "base",
      },
    );
  });
}

const DIAS_HORARIO_GESTION = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
];

function renderizarTarjetaHorarioGestion(horario) {
  const extra = obtenerExtraHorarioGestion(horario);

  const horarioVisible = escaparHtmlGestion(
    obtenerHorarioTextoGestion(horario),
  );

  const espacioVisible = escaparHtmlGestion(
    obtenerEspacioHorarioGestion(horario),
  );

  const docenteVisible = escaparHtmlGestion(
    horario.docenteNombre || "Docente sin cargar",
  );

  const cursoVisible = escaparHtmlGestion(obtenerCursoHorarioGestion(horario));

  return `
    <article class="tarjeta-bloque-horario-gestion">
      <div class="bloque-horario-hora-gestion">
        ${horarioVisible}
      </div>

      <div class="bloque-horario-materia-gestion">
        ${espacioVisible}
      </div>

      <div class="bloque-horario-docente-gestion">
        ${docenteVisible}
      </div>

      <div class="bloque-horario-curso-gestion">
        ${cursoVisible}
      </div>

      ${
        extra
          ? `
            <div class="bloque-horario-extra-gestion">
              ${escaparHtmlGestion(extra)}
            </div>
          `
          : ""
      }
    </article>
  `;
}

function agruparHorariosPorTipoYTurno(horarios) {
  const grupos = new Map();

  ordenarHorariosGestion(horarios).forEach((horario) => {
    const tipo = String(horario.tipoHorario || "")
      .trim()
      .toUpperCase();

    const turno = String(horario.turno || "")
      .trim()
      .toUpperCase();

    const clave = `${tipo}__${turno}`;

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        tipo,
        turno,
        horarios: [],
      });
    }

    grupos.get(clave).horarios.push(horario);
  });

  return Array.from(grupos.values()).sort((a, b) => {
    const tipoA = obtenerTipoHorarioGestion(a.tipo);
    const tipoB = obtenerTipoHorarioGestion(b.tipo);

    if (tipoA !== tipoB) {
      return tipoA.localeCompare(tipoB, "es");
    }

    return obtenerTurnoHorarioGestion(a.turno).localeCompare(
      obtenerTurnoHorarioGestion(b.turno),
      "es",
    );
  });
}

function renderizarHorariosGestion(horarios) {
  if (!vistaHorariosGestion) return;

  if (!horarios.length) {
    vistaHorariosGestion.innerHTML = `
      <p class="mensaje-gestion">
        No se encontraron horarios con esos filtros.
      </p>
    `;

    mostrarMensajeHorariosGestion(
      "No se encontraron horarios con esos filtros.",
    );

    return;
  }

  const grupos = agruparHorariosPorTipoYTurno(horarios);

  const diaSeleccionado = String(filtroDiaHorarioGestion?.value || "")
    .trim()
    .toUpperCase();

  const diasVisibles = diaSeleccionado
    ? DIAS_HORARIO_GESTION.filter((dia) => dia.valor === diaSeleccionado)
    : DIAS_HORARIO_GESTION;

  vistaHorariosGestion.innerHTML = `
    <div class="grupos-horarios-gestion">
      ${grupos
        .map((grupo) => {
          const columnasDias = diasVisibles
            .map((dia) => {
              const horariosDelDia = grupo.horarios
                .filter(
                  (horario) =>
                    String(horario.dia || "")
                      .trim()
                      .toUpperCase() === dia.valor,
                )
                .sort((a, b) => {
                  const horaA = String(a.horaInicio || "");

                  const horaB = String(b.horaInicio || "");

                  if (horaA !== horaB) {
                    return horaA.localeCompare(horaB, "es");
                  }

                  return obtenerCursoHorarioGestion(a).localeCompare(
                    obtenerCursoHorarioGestion(b),
                    "es",
                    {
                      numeric: true,
                      sensitivity: "base",
                    },
                  );
                });

              return `
                <section class="dia-horario-gestion">
                  <h5>${dia.etiqueta}</h5>

                  <div class="lista-bloques-dia-gestion">
                    ${
                      horariosDelDia.length
                        ? horariosDelDia
                            .map(renderizarTarjetaHorarioGestion)
                            .join("")
                        : `
                          <p class="sin-bloques-horario-gestion">
                            Sin bloques cargados.
                          </p>
                        `
                    }
                  </div>
                </section>
              `;
            })
            .join("");

          return `
            <section class="grupo-horario-gestion">
              <div class="titulo-grupo-horario-gestion">
                <h4>
                  ${escaparHtmlGestion(obtenerTipoHorarioGestion(grupo.tipo))}
                </h4>

                <span>
                  ${escaparHtmlGestion(obtenerTurnoHorarioGestion(grupo.turno))}
                </span>
              </div>

              <div
                class="grilla-horario-semanal-gestion ${
                  diaSeleccionado ? "grilla-un-dia-gestion" : ""
                }"
              >
                ${columnasDias}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;

  mostrarMensajeHorariosGestion(
    `${horarios.length} bloque(s) horario(s) mostrado(s).`,
    "ok",
  );
}

function aplicarFiltrosHorariosGestion() {
  const tipoSeleccionado = String(filtroTipoHorarioGestion?.value || "")
    .trim()
    .toUpperCase();

  const turnoSeleccionado = String(filtroTurnoHorarioGestion?.value || "")
    .trim()
    .toUpperCase();

  const diaSeleccionado = String(filtroDiaHorarioGestion?.value || "")
    .trim()
    .toUpperCase();

  const espacioSeleccionado = String(
    filtroEspacioHorarioGestion?.value || "",
  ).trim();

  const cursoSeleccionado = String(
    filtroCursoHorarioGestion?.value || "",
  ).trim();

  const horariosFiltrados = horariosGestionCargados.filter((horario) => {
    const tipo = String(horario.tipoHorario || "")
      .trim()
      .toUpperCase();

    const turno = String(horario.turno || "")
      .trim()
      .toUpperCase();

    const dia = String(horario.dia || "")
      .trim()
      .toUpperCase();

    const curso = obtenerCursoHorarioGestion(horario);

    const espacio = obtenerEspacioHorarioGestion(horario);

    const coincideTipo = !tipoSeleccionado || tipo === tipoSeleccionado;

    const coincideTurno = !turnoSeleccionado || turno === turnoSeleccionado;

    const coincideDia = !diaSeleccionado || dia === diaSeleccionado;

    const coincideEspacio =
      !espacioSeleccionado || espacio === espacioSeleccionado;

    const coincideCurso = !cursoSeleccionado || curso === cursoSeleccionado;

    return (
      coincideTipo &&
      coincideTurno &&
      coincideDia &&
      coincideEspacio &&
      coincideCurso
    );
  });

  renderizarHorariosGestion(horariosFiltrados);
}

async function cargarHorariosGestion() {
  if (!vistaHorariosGestion) return;

  try {
    if (btnVerHorariosGestion) {
      btnVerHorariosGestion.disabled = true;
      btnVerHorariosGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando horarios...
      `;
    }

    mostrarMensajeHorariosGestion("Cargando horarios institucionales...");

    vistaHorariosGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando horarios...
      </p>
    `;

    const consultaHorariosActivos = query(
      collection(db, "horarios"),
      where("estado", "==", "ACTIVO"),
    );

    const consulta = await getDocs(consultaHorariosActivos);

    horariosGestionCargados = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    if (!horariosGestionCargados.length) {
      vistaHorariosGestion.innerHTML = `
        <p class="mensaje-gestion">
          No hay horarios activos registrados para mostrar.
        </p>
      `;

      mostrarMensajeHorariosGestion("No hay horarios activos registrados.");
      return;
    }

    cargarCursosFiltroHorariosGestion(horariosGestionCargados);

    cargarEspaciosFiltroHorariosGestion(horariosGestionCargados);

    aplicarFiltrosHorariosGestion();
  } catch (error) {
    console.error("Error al cargar horarios en Portal Gestión:", error);

    vistaHorariosGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudieron cargar los horarios. Revisá conexión o permisos.
      </p>
    `;

    mostrarMensajeHorariosGestion(
      "No se pudieron cargar los horarios. Revisá conexión o permisos.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudieron cargar los horarios",
        text: "Revisá la conexión o los permisos de Firebase.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerHorariosGestion) {
      btnVerHorariosGestion.disabled = false;
      btnVerHorariosGestion.innerHTML = `
        <i class="fa-solid fa-calendar-days"></i>
        Ver horarios
      `;
    }
  }
}

function mostrarMensajeDocumentacionGestion(texto, tipo = "") {
  if (!mensajeDocumentacionGestion) return;

  mensajeDocumentacionGestion.textContent = texto || "";
  mensajeDocumentacionGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeDocumentacionGestion.classList.add(tipo);
  }
}

function cargarCursosFiltroDocumentacionGestion(documentos) {
  if (!filtroCursoDocumentacionGestion) return;

  const cursoSeleccionado = String(
    filtroCursoDocumentacionGestion.value || "",
  ).trim();

  const cursos = Array.from(
    new Set(
      documentos
        .map((documento) => String(documento.curso || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, "es", {
      numeric: true,
      sensitivity: "base",
    }),
  );

  filtroCursoDocumentacionGestion.innerHTML = `
    <option value="">Todos los cursos</option>
    ${cursos
      .map(
        (curso) => `
          <option value="${escaparHtmlGestion(curso)}">
            ${escaparHtmlGestion(curso)}
          </option>
        `,
      )
      .join("")}
  `;

  if (cursoSeleccionado && cursos.includes(cursoSeleccionado)) {
    filtroCursoDocumentacionGestion.value = cursoSeleccionado;
  }
}

function ordenarDocumentacionGestion(documentos) {
  return [...documentos].sort((a, b) => {
    const cursoA = String(a.curso || "");
    const cursoB = String(b.curso || "");

    const comparacionCurso = cursoA.localeCompare(cursoB, "es", {
      numeric: true,
      sensitivity: "base",
    });

    if (comparacionCurso !== 0) {
      return comparacionCurso;
    }

    const tipoA = obtenerEtiquetaTipoDocumentoGestion(a.tipoDocumento);
    const tipoB = obtenerEtiquetaTipoDocumentoGestion(b.tipoDocumento);

    const comparacionTipo = tipoA.localeCompare(tipoB, "es", {
      numeric: true,
      sensitivity: "base",
    });

    if (comparacionTipo !== 0) {
      return comparacionTipo;
    }

    return String(a.espacioCurricular || "").localeCompare(
      String(b.espacioCurricular || ""),
      "es",
      {
        numeric: true,
        sensitivity: "base",
      },
    );
  });
}

function renderizarTarjetaDocumentacionGestion(documento) {
  const driveUrl = String(documento.driveUrl || "").trim();

  return `
    <article class="tarjeta-documentacion-gestion">
      <div class="encabezado-documentacion-gestion">
        <div>
          <h4>${escaparHtmlGestion(documento.espacioCurricular || "Espacio sin cargar")}</h4>
          <p>${escaparHtmlGestion(documento.curso || "Curso sin cargar")}</p>
        </div>

        <span>
          ${escaparHtmlGestion(
            obtenerEtiquetaTipoDocumentoGestion(documento.tipoDocumento),
          )}
        </span>
      </div>

      <div class="detalle-documentacion-gestion">
        <p>
          <i class="fa-solid fa-calendar-check"></i>
          ${escaparHtmlGestion(
            formatearFechaDocumentacionGestion(documento.fechaCarga),
          )}
        </p>

        ${
          documento.docenteNombre
            ? `
              <p>
                <i class="fa-solid fa-user-tie"></i>
                ${escaparHtmlGestion(documento.docenteNombre)}
              </p>
            `
            : ""
        }
      </div>

      <div class="acciones-documentacion-gestion">
        ${
          driveUrl
            ? `
              <a
                class="btn-documentacion-gestion"
                href="${escaparHtmlGestion(driveUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i class="fa-solid fa-eye"></i>
                Ver
              </a>
            `
            : `
              <span class="mensaje-documentacion-sin-url">
                Sin enlace disponible
              </span>
            `
        }
      </div>
    </article>
  `;
}

function renderizarDocumentacionGestion(documentos) {
  if (!vistaDocumentacionGestion) return;

  if (!documentos.length) {
    vistaDocumentacionGestion.innerHTML = `
      <p class="mensaje-gestion">
        No hay documentación académica cargada con los filtros seleccionados.
      </p>
    `;

    mostrarMensajeDocumentacionGestion("");
    return;
  }

  const documentosOrdenados = ordenarDocumentacionGestion(documentos);

  vistaDocumentacionGestion.innerHTML = `
    <div class="tabla-documentacion-gestion-contenedor">
      <table class="tabla-documentacion-gestion">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Tipo</th>
            <th>Espacio Curricular</th>
            <th>Fecha de carga</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${documentosOrdenados
            .map((documento) => {
              const driveUrl = String(documento.driveUrl || "").trim();

              return `
                <tr>
                  <td>
                    ${escaparHtmlGestion(documento.curso || "-")}
                  </td>

                  <td>
                    ${escaparHtmlGestion(
                      obtenerEtiquetaTipoDocumentoGestion(
                        documento.tipoDocumento,
                      ),
                    )}
                  </td>

                  <td>
                    <strong>
                      ${escaparHtmlGestion(documento.espacioCurricular || "-")}
                    </strong>
                  </td>

                  <td>
                    ${escaparHtmlGestion(
                      formatearFechaDocumentacionGestion(documento.fechaCarga),
                    )}
                  </td>

                  <td>
                    ${
                      driveUrl
                        ? `
                          <a
                            class="btn-documentacion-tabla-gestion"
                            href="${escaparHtmlGestion(driveUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver documento"
                            aria-label="Ver documento"
                          >
                            <i class="fa-solid fa-eye"></i>
                            Ver
                          </a>
                        `
                        : `
                          <span class="mensaje-documentacion-sin-url">
                            Sin archivo
                          </span>
                        `
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

  mostrarMensajeDocumentacionGestion(
    `${documentosOrdenados.length} documento(s) mostrado(s).`,
    "ok",
  );
}

function aplicarFiltrosDocumentacionGestion() {
  const cursoSeleccionado = String(
    filtroCursoDocumentacionGestion?.value || "",
  ).trim();

  const tipoSeleccionado = String(
    filtroTipoDocumentacionGestion?.value || "",
  ).trim();

  const textoEspacio = normalizarTextoGestion(
    buscarEspacioDocumentacionGestion?.value || "",
  );

  const documentosFiltrados = documentacionGestionCargada.filter(
    (documento) => {
      const cursoDocumento = String(documento.curso || "").trim();
      const tipoDocumento = String(documento.tipoDocumento || "").trim();

      const espacioDocumento = normalizarTextoGestion(
        documento.espacioCurricular || "",
      );

      const coincideCurso =
        !cursoSeleccionado || cursoDocumento === cursoSeleccionado;

      const coincideTipo =
        !tipoSeleccionado || tipoDocumento === tipoSeleccionado;

      const coincideEspacio =
        !textoEspacio || espacioDocumento.includes(textoEspacio);

      return coincideCurso && coincideTipo && coincideEspacio;
    },
  );

  renderizarDocumentacionGestion(documentosFiltrados);
}

async function cargarDocumentacionGestion() {
  if (!vistaDocumentacionGestion) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeDocumentacionGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  try {
    if (btnVerDocumentacionGestion) {
      btnVerDocumentacionGestion.disabled = true;
      btnVerDocumentacionGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando documentación...
      `;
    }

    mostrarMensajeDocumentacionGestion("");

    vistaDocumentacionGestion.innerHTML = `
  <p class="mensaje-gestion">
    Consultando documentación académica...
  </p>
`;

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendDocumentacion({
      accion: "obtener_documentos_admin",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudo cargar la documentación académica.",
      );
    }

    documentacionGestionCargada = resultado.documentos || [];

    if (!documentacionGestionCargada.length) {
      vistaDocumentacionGestion.innerHTML = `
    <p class="mensaje-gestion">
      No hay documentación académica cargada.
    </p>
  `;

      mostrarMensajeDocumentacionGestion("");

      return;
    }

    cargarCursosFiltroDocumentacionGestion(documentacionGestionCargada);
    aplicarFiltrosDocumentacionGestion();
  } catch (error) {
    console.error("Error al cargar documentación en Portal Gestión:", error);

    vistaDocumentacionGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudo cargar la documentación académica.
      </p>
    `;

    mostrarMensajeDocumentacionGestion(
      error.message || "No se pudo cargar la documentación académica.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo cargar la documentación",
        text:
          error.message ||
          "Revisá conexión, sesión activa o permisos del backend.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerDocumentacionGestion) {
      btnVerDocumentacionGestion.disabled = false;
      btnVerDocumentacionGestion.innerHTML = `
        <i class="fa-solid fa-folder-open"></i>
        Ver documentación
      `;
    }
  }
}

function mostrarMensajeSimeGestion(texto, tipo = "") {
  if (!mensajeSimeGestion) return;

  mensajeSimeGestion.textContent = texto || "";
  mensajeSimeGestion.className = "mensaje-gestion";

  if (tipo) {
    mensajeSimeGestion.classList.add(tipo);
  }
}

async function enviarAlBackendSimeGestion(datos) {
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

function obtenerEtiquetaEstadoSimeGestion(estado) {
  const valor = String(estado || "")
    .trim()
    .toUpperCase();

  if (valor === "ACTIVA") return "Activa";
  if (valor === "ANULADA") return "Anulada";

  return valor || "-";
}

function renderizarMateriasSimeGestion(materias) {
  const lista = Array.isArray(materias)
    ? materias
    : String(materias || "")
        .split(",")
        .map((materia) => materia.trim())
        .filter(Boolean);

  if (!lista.length) {
    return `<span class="materia-sime-vacia">Sin materias</span>`;
  }

  return `
    <div class="materias-sime-gestion">
      ${lista
        .map(
          (materia) => `
            <span>${escaparHtmlGestion(materia)}</span>
          `,
        )
        .join("")}
    </div>
  `;
}

function cargarFiltroAniosCursadoSimeGestion() {
  if (!filtroAnioCursadoSimeGestion) return;

  const anioSeleccionado = String(
    filtroAnioCursadoSimeGestion.value || "",
  ).trim();

  const anios = Array.from(
    new Set(
      inscripcionesSimeGestionCargadas
        .map((inscripcion) => Number(inscripcion.anioCursado || 0))
        .filter(Boolean),
    ),
  ).sort((a, b) => b - a);

  filtroAnioCursadoSimeGestion.innerHTML = `
    <option value="">Todos los años</option>
    ${anios
      .map(
        (anio) => `
          <option value="${anio}">${anio}</option>
        `,
      )
      .join("")}
  `;

  if (anioSeleccionado && anios.map(String).includes(anioSeleccionado)) {
    filtroAnioCursadoSimeGestion.value = anioSeleccionado;
  }
}

function obtenerInscripcionesFiltradasSimeGestion() {
  const cursoSeleccionado = String(filtroCursoSimeGestion?.value || "").trim();

  const anioSeleccionado = String(
    filtroAnioCursadoSimeGestion?.value || "",
  ).trim();

  const estadoSeleccionado = String(filtroEstadoSimeGestion?.value || "")
    .trim()
    .toUpperCase();

  const busqueda = normalizarTextoGestion(buscarAlumnoSimeGestion?.value || "");

  return inscripcionesSimeGestionCargadas.filter((inscripcion) => {
    const cursoOrigen = String(inscripcion.cursoOrigen || "").trim();
    const anioCursado = String(inscripcion.anioCursado || "").trim();

    const estado = String(inscripcion.estado || "")
      .trim()
      .toUpperCase();

    const textoAlumno = normalizarTextoGestion(
      [
        inscripcion.alumnoNombre,
        inscripcion.alumnoCorreo,
        inscripcion.alumnoDni,
      ].join(" "),
    );

    const coincideCurso =
      !cursoSeleccionado || cursoOrigen === cursoSeleccionado;

    const coincideAnio = !anioSeleccionado || anioCursado === anioSeleccionado;

    const coincideEstado = !estadoSeleccionado || estado === estadoSeleccionado;

    const coincideBusqueda = !busqueda || textoAlumno.includes(busqueda);

    return coincideCurso && coincideAnio && coincideEstado && coincideBusqueda;
  });
}

function renderizarTarjetaSimeGestion(inscripcion) {
  const estado = String(inscripcion.estado || "")
    .trim()
    .toUpperCase();

  return `
    <article class="tarjeta-sime-gestion">
      <div class="encabezado-sime-gestion">
        <div>
          <h4>${escaparHtmlGestion(inscripcion.alumnoNombre || "Alumno sin nombre")}</h4>
          <p>${escaparHtmlGestion(inscripcion.alumnoCorreo || "Correo no cargado")}</p>
        </div>

        <span class="estado-sime-gestion ${estado === "ACTIVA" ? "activa" : "anulada"}">
          ${escaparHtmlGestion(obtenerEtiquetaEstadoSimeGestion(estado))}
        </span>
      </div>

      <div class="detalle-sime-gestion">
        <p>
          <i class="fa-solid fa-calendar-check"></i>
          ${escaparHtmlGestion(inscripcion.fechaInscripcion || "Sin fecha")}
        </p>

        <p>
          <i class="fa-solid fa-id-card"></i>
          DNI: ${escaparHtmlGestion(inscripcion.alumnoDni || "-")}
        </p>

        <p>
          <i class="fa-solid fa-school"></i>
          Curso origen: ${
            inscripcion.cursoOrigen
              ? `${escaparHtmlGestion(inscripcion.cursoOrigen)}º`
              : "-"
          }
        </p>

        <p>
          <i class="fa-solid fa-calendar-days"></i>
          Año cursado: ${escaparHtmlGestion(inscripcion.anioCursado || "-")}
        </p>
      </div>

      <div class="materias-contenedor-sime-gestion">
        <h5>Materias</h5>
        ${renderizarMateriasSimeGestion(inscripcion.materias)}
      </div>

      <div class="acciones-sime-gestion">
        <button
          class="btn-sime-gestion btn-ver-permiso-sime-gestion"
          type="button"
          data-id-inscripcion="${escaparHtmlGestion(inscripcion.idInscripcion)}"
          ${inscripcion.tienePermiso ? "" : "disabled"}
        >
          <i class="fa-solid fa-eye"></i>
          Ver permiso
        </button>
      </div>
    </article>
  `;
}

function renderizarInscripcionesSimeGestion() {
  if (!vistaSimeGestion) return;

  const inscripciones = obtenerInscripcionesFiltradasSimeGestion();

  if (!inscripciones.length) {
    vistaSimeGestion.innerHTML = `
      <p class="mensaje-gestion">
        No hay inscripciones para mostrar con esos filtros.
      </p>
    `;

    mostrarMensajeSimeGestion("");
    return;
  }

  vistaSimeGestion.innerHTML = `
    <div class="tabla-sime-gestion-contenedor">
      <table class="tabla-sime-gestion">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Año cursado</th>
            <th>Materias</th>
            <th>Ver</th>
          </tr>
        </thead>

        <tbody>
          ${inscripciones
            .map((inscripcion) => {
              const estado = String(inscripcion.estado || "")
                .trim()
                .toUpperCase();

              return `
                <tr>
                  <td>${escaparHtmlGestion(
                    String(inscripcion.fechaInscripcion || "-").split(" ")[0],
                  )}</td>

                  <td>
                    <strong>
                      ${escaparHtmlGestion(
                        inscripcion.alumnoNombre || "Alumno sin nombre",
                      )}
                    </strong>
                    <small>
                      ${escaparHtmlGestion(inscripcion.alumnoCorreo || "")}
                    </small>
                  </td>

                  <td>
                    ${
                      inscripcion.cursoOrigen
                        ? `${escaparHtmlGestion(inscripcion.cursoOrigen)}º`
                        : "-"
                    }
                  </td>

                  <td>${escaparHtmlGestion(inscripcion.anioCursado || "-")}</td>

                  <td>
                    ${renderizarMateriasSimeGestion(inscripcion.materias)}
                  </td>

                 <td>
  <button
    class="btn-sime-tabla-gestion btn-ver-permiso-sime-gestion"
    type="button"
    title="Ver permiso"
    aria-label="Ver permiso"
    data-id-inscripcion="${escaparHtmlGestion(inscripcion.idInscripcion)}"
    ${inscripcion.tienePermiso ? "" : "disabled"}
  >
    <i class="fa-solid fa-eye"></i>
  </button>
</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  mostrarMensajeSimeGestion(
    `${inscripciones.length} inscripción(es) mostrada(s).`,
    "ok",
  );
}

function convertirBase64ABlobSimeGestion(base64, tipoMime) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: tipoMime || "application/pdf",
  });
}

async function abrirPermisoSimeGestion(idInscripcion, boton) {
  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeSimeGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  const ventanaPermiso = window.open("", "_blank");

  const htmlOriginalBoton = boton ? boton.innerHTML : "";

  if (boton) {
    boton.disabled = true;
    boton.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
  `;
  }

  try {
    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeGestion({
      accion: "obtener_permiso_inscripcion_admin",
      idToken,
      idInscripcion,
    });

    if (!resultado.ok) {
      throw new Error(resultado.mensaje || "No se pudo obtener el permiso.");
    }

    const blob = convertirBase64ABlobSimeGestion(
      resultado.permisoBase64,
      resultado.tipoMime,
    );

    const url = URL.createObjectURL(blob);

    if (ventanaPermiso) {
      ventanaPermiso.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  } catch (error) {
    console.error("Error al abrir permiso S.I.M.E. en Gestión:", error);

    if (ventanaPermiso) {
      ventanaPermiso.close();
    }

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo abrir el permiso",
        text: error.message || "Ocurrió un error al obtener el PDF.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } else {
      mostrarMensajeSimeGestion(
        error.message || "No se pudo abrir el permiso.",
        "error",
      );
    }
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerHTML =
        htmlOriginalBoton ||
        `
      <i class="fa-solid fa-eye"></i>
    `;
    }
  }
}

async function cargarInscripcionesSimeGestion() {
  if (!vistaSimeGestion) return;

  const usuario = auth.currentUser;

  if (!usuario) {
    mostrarMensajeSimeGestion(
      "No se detectó una sesión activa. Volvé a iniciar sesión.",
      "error",
    );

    return;
  }

  try {
    if (btnVerInscripcionesSimeGestion) {
      btnVerInscripcionesSimeGestion.disabled = true;
      btnVerInscripcionesSimeGestion.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Cargando inscripciones...
      `;
    }

    mostrarMensajeSimeGestion("");

    vistaSimeGestion.innerHTML = `
      <p class="mensaje-gestion">
        Consultando inscripciones S.I.M.E...
      </p>
    `;

    const idToken = await usuario.getIdToken(true);

    const resultado = await enviarAlBackendSimeGestion({
      accion: "listar_inscripciones_admin",
      idToken,
    });

    if (!resultado.ok) {
      throw new Error(
        resultado.mensaje || "No se pudieron cargar las inscripciones.",
      );
    }

    inscripcionesSimeGestionCargadas = resultado.inscripciones || [];

    if (!inscripcionesSimeGestionCargadas.length) {
      vistaSimeGestion.innerHTML = `
        <p class="mensaje-gestion">
          No hay inscripciones S.I.M.E. cargadas.
        </p>
      `;

      mostrarMensajeSimeGestion("");
      return;
    }

    cargarFiltroAniosCursadoSimeGestion();
    renderizarInscripcionesSimeGestion();
  } catch (error) {
    console.error("Error al cargar S.I.M.E. en Portal Gestión:", error);

    vistaSimeGestion.innerHTML = `
      <p class="mensaje-gestion error">
        No se pudieron cargar las inscripciones S.I.M.E.
      </p>
    `;

    mostrarMensajeSimeGestion(
      error.message || "No se pudieron cargar las inscripciones S.I.M.E.",
      "error",
    );

    if (window.Swal) {
      Swal.fire({
        title: "No se pudo cargar S.I.M.E.",
        text:
          error.message ||
          "Revisá conexión, sesión activa o permisos del backend.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  } finally {
    if (btnVerInscripcionesSimeGestion) {
      btnVerInscripcionesSimeGestion.disabled = false;
      btnVerInscripcionesSimeGestion.innerHTML = `
        <i class="fa-solid fa-list-check"></i>
        Ver inscripciones
      `;
    }
  }
}

if (btnVerCursosGestion) {
  btnVerCursosGestion.addEventListener("click", cargarCursosGestion);
}

if (btnVerEstudiantesGestion) {
  btnVerEstudiantesGestion.addEventListener("click", cargarEstudiantesGestion);
}

if (vistaEstudiantesGestion) {
  vistaEstudiantesGestion.addEventListener("click", async (event) => {
    const boton = event.target.closest(".btn-baja-estudiante-gestion");

    if (!boton) return;

    const correo = String(boton.dataset.correoEstudiante || "")
      .trim()
      .toLowerCase();

    if (!correo) return;

    const estudiante = estudiantesGestionCargados.find((registro) => {
      const correoRegistro = String(registro.correo || registro.id || "")
        .trim()
        .toLowerCase();

      return correoRegistro === correo;
    });

    if (!estudiante) {
      await Swal.fire({
        title: "Estudiante no encontrado",
        text: "Actualizá el listado e intentá nuevamente.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    await darDeBajaEstudianteGestion(estudiante, boton);
  });
}

if (buscarEstudianteGestion) {
  buscarEstudianteGestion.addEventListener(
    "input",
    aplicarFiltrosEstudiantesGestion,
  );
}

if (filtroCursoEstudianteGestion) {
  filtroCursoEstudianteGestion.addEventListener(
    "change",
    aplicarFiltrosEstudiantesGestion,
  );
}

if (filtroEstadoEstudianteGestion) {
  filtroEstadoEstudianteGestion.addEventListener(
    "change",
    aplicarFiltrosEstudiantesGestion,
  );
}

if (btnVerDocentesGestion) {
  btnVerDocentesGestion.addEventListener("click", cargarDocentesGestion);
}

if (buscarDocenteGestion) {
  buscarDocenteGestion.addEventListener("input", aplicarFiltrosDocentesGestion);
}

if (filtroCursoDocenteGestion) {
  filtroCursoDocenteGestion.addEventListener("change", () => {
    actualizarFiltrosRelacionadosDocentesGestion("CURSO");
    aplicarFiltrosDocentesGestion();
  });
}

if (filtroEspacioDocenteGestion) {
  filtroEspacioDocenteGestion.addEventListener("change", () => {
    actualizarFiltrosRelacionadosDocentesGestion("ESPACIO");
    aplicarFiltrosDocentesGestion();
  });
}

if (filtroTurnoDocenteGestion) {
  filtroTurnoDocenteGestion.addEventListener(
    "change",
    aplicarFiltrosDocentesGestion,
  );
}
if (btnVerHorariosGestion) {
  btnVerHorariosGestion.addEventListener("click", cargarHorariosGestion);
}

if (filtroTipoHorarioGestion) {
  filtroTipoHorarioGestion.addEventListener(
    "change",
    aplicarFiltrosHorariosGestion,
  );
}

if (filtroTurnoHorarioGestion) {
  filtroTurnoHorarioGestion.addEventListener(
    "change",
    aplicarFiltrosHorariosGestion,
  );
}

if (filtroDiaHorarioGestion) {
  filtroDiaHorarioGestion.addEventListener(
    "change",
    aplicarFiltrosHorariosGestion,
  );
}

if (filtroCursoHorarioGestion) {
  filtroCursoHorarioGestion.addEventListener(
    "change",
    aplicarFiltrosHorariosGestion,
  );
}

if (btnVerDocumentacionGestion) {
  btnVerDocumentacionGestion.addEventListener(
    "click",
    cargarDocumentacionGestion,
  );
}

if (filtroCursoDocumentacionGestion) {
  filtroCursoDocumentacionGestion.addEventListener(
    "change",
    aplicarFiltrosDocumentacionGestion,
  );
}

if (filtroTipoDocumentacionGestion) {
  filtroTipoDocumentacionGestion.addEventListener(
    "change",
    aplicarFiltrosDocumentacionGestion,
  );
}

if (buscarEspacioDocumentacionGestion) {
  buscarEspacioDocumentacionGestion.addEventListener(
    "input",
    aplicarFiltrosDocumentacionGestion,
  );
}

if (btnVerInscripcionesSimeGestion) {
  btnVerInscripcionesSimeGestion.addEventListener(
    "click",
    cargarInscripcionesSimeGestion,
  );
}

if (filtroCursoSimeGestion) {
  filtroCursoSimeGestion.addEventListener(
    "change",
    renderizarInscripcionesSimeGestion,
  );
}

if (filtroAnioCursadoSimeGestion) {
  filtroAnioCursadoSimeGestion.addEventListener(
    "change",
    renderizarInscripcionesSimeGestion,
  );
}

if (filtroEstadoSimeGestion) {
  filtroEstadoSimeGestion.addEventListener(
    "change",
    renderizarInscripcionesSimeGestion,
  );
}

if (buscarAlumnoSimeGestion) {
  buscarAlumnoSimeGestion.addEventListener(
    "input",
    renderizarInscripcionesSimeGestion,
  );
}

if (vistaSimeGestion) {
  vistaSimeGestion.addEventListener("click", async (event) => {
    const botonVerPermiso = event.target.closest(
      ".btn-ver-permiso-sime-gestion",
    );

    if (!botonVerPermiso) return;

    const idInscripcion = String(
      botonVerPermiso.dataset.idInscripcion || "",
    ).trim();

    if (!idInscripcion) {
      mostrarMensajeSimeGestion(
        "No se pudo identificar la inscripción seleccionada.",
        "error",
      );

      return;
    }

    await abrirPermisoSimeGestion(idInscripcion, botonVerPermiso);
  });
}

if (btnCargarOpcionesInformesGestion) {
  btnCargarOpcionesInformesGestion.addEventListener(
    "click",
    cargarOpcionesInformesGestion,
  );
}

if (btnListarInformesGestion) {
  btnListarInformesGestion.addEventListener("click", listarInformesGestion);
}

if (vistaInformesGestion) {
  vistaInformesGestion.addEventListener("click", function (event) {
    const botonActualizar = event.target.closest(
      ".btn-actualizar-docentes-informe-gestion",
    );

    if (botonActualizar) {
      actualizarDocentesAutorizadosInformeGestion(
        botonActualizar.dataset.alumnoCorreo,
        botonActualizar,
      );

      return;
    }

    const botonEliminar = event.target.closest(".btn-eliminar-informe-gestion");

    if (botonEliminar) {
      eliminarInformePedagogicoGestion(
        botonEliminar.dataset.idInforme,
        botonEliminar,
      );
    }
  });
}

if (cursoInformeGestion) {
  cursoInformeGestion.addEventListener("change", () => {
    cargarEstudiantesInformeGestion();
    verificarFormularioInformeGestion();
  });
}

if (alumnoInformeGestion) {
  alumnoInformeGestion.addEventListener(
    "change",
    verificarFormularioInformeGestion,
  );
}

if (formInformePedagogicoGestion) {
  formInformePedagogicoGestion.addEventListener(
    "submit",
    crearInformePedagogicoGestion,
  );
}

// =========================
// EVENTOS MESAS DE EXAMEN - GESTIÓN
// =========================

if (btnActualizarMesasGestion) {
  btnActualizarMesasGestion.addEventListener("click", cargarMesasGestion);
}

[filtroMesaGestionEspacio, filtroMesaGestionCurso]
  .filter(Boolean)
  .forEach((control) => {
    control.addEventListener("change", aplicarFiltrosMesasGestion);
  });

window.addEventListener(
  "portalUsuarioListo",
  configurarPanelMesasDireccionGestion,
);

document.addEventListener(
  "DOMContentLoaded",
  configurarPanelMesasDireccionGestion,
);

if (formMesaGestion) {
  formMesaGestion.addEventListener("submit", guardarMesaGestion);
}

if (btnCancelarMesaGestion) {
  btnCancelarMesaGestion.addEventListener(
    "click",
    limpiarFormularioMesaGestion,
  );
}

if (cuerpoTablaMesasGestion) {
  cuerpoTablaMesasGestion.addEventListener("click", async (event) => {
    const boton = event.target.closest("button[data-accion-mesa-gestion]");

    if (!boton) return;

    const accion = boton.dataset.accionMesaGestion;
    const idMesa = boton.dataset.idMesa;

    if (!idMesa) return;

    if (accion === "editar") {
      editarMesaGestion(idMesa);
      return;
    }

    if (accion === "estado") {
      await cambiarEstadoMesaGestion(idMesa);
    }
  });
}
