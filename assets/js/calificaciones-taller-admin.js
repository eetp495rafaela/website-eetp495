import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  FieldPath,
  query,
  where,
  serverTimestamp,
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

const formInicializar = document.getElementById(
  "formInicializarCalificacionesTaller",
);
const cicloCalificaciones = document.getElementById(
  "cicloCalificacionesTaller",
);
const cursoCalificaciones = document.getElementById(
  "cursoCalificacionesTaller",
);
const btnInicializar = document.getElementById(
  "btnInicializarCalificacionesTaller",
);
const mensajeCalificaciones = document.getElementById(
  "mensajeCalificacionesTallerAdmin",
);
const btnConsultarCierresCalificaciones = document.getElementById(
  "btnConsultarCierresCalificacionesTaller",
);

const estadoCierresCalificaciones = document.getElementById(
  "estadoCierresCalificacionesTaller",
);

let usuarioSoporteCalificaciones = null;
let cursosCalificaciones = [];

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarMayusculas(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarMensaje(texto, tipo = "") {
  if (!mensajeCalificaciones) return;

  mensajeCalificaciones.textContent = texto;
  mensajeCalificaciones.className = `mensaje-formulario ${tipo}`.trim();
}

function limpiarSelectorCursos(mensaje = "Seleccionar curso") {
  if (!cursoCalificaciones) return;

  cursoCalificaciones.innerHTML = `<option value="">${escaparHtml(
    mensaje,
  )}</option>`;
}

function obtenerNombreCurso(curso) {
  return String(
    curso?.nombre || `${curso?.anio || ""}º ${curso?.division || ""}`,
  ).trim();
}

function usuarioTieneRolAlumno(usuario) {
  const rolPrincipal = normalizarMayusculas(usuario?.rol);
  const roles = Array.isArray(usuario?.roles)
    ? usuario.roles.map((rol) => normalizarMayusculas(rol))
    : [];

  return rolPrincipal === "ALUMNO" || roles.includes("ALUMNO");
}

function usuarioEstaCursando(usuario) {
  const tipoVinculo = normalizarMayusculas(usuario?.tipoVinculo);
  const situacionRevista = normalizarMayusculas(usuario?.situacionRevista);

  return tipoVinculo === "CURSANDO" || situacionRevista === "CURSANDO";
}

function fechaLocalISO() {
  const hoy = new Date();

  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-");
}

async function cargarCursosCalificaciones() {
  if (!cursoCalificaciones || !usuarioSoporteCalificaciones) return;

  limpiarSelectorCursos("Cargando cursos...");
  cursoCalificaciones.disabled = true;

  try {
    const resultado = await getDocs(collection(db, "cursos"));

    cursosCalificaciones = resultado.docs
      .map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }))
      .filter((curso) => {
        const estado = normalizarMayusculas(curso.estado);
        const anio = Number(curso.anio || 0);

        return estado === "ACTIVO" && [1, 2].includes(anio);
      })
      .sort((a, b) => {
        const diferenciaAnio = Number(a.anio || 0) - Number(b.anio || 0);

        if (diferenciaAnio !== 0) return diferenciaAnio;

        return String(a.division || "").localeCompare(
          String(b.division || ""),
          "es",
          {
            numeric: true,
            sensitivity: "base",
          },
        );
      });

    if (!cursosCalificaciones.length) {
      limpiarSelectorCursos("No hay cursos activos de 1º o 2º año");
      return;
    }

    limpiarSelectorCursos("Seleccionar curso");

    cursosCalificaciones.forEach((curso) => {
      const opcion = document.createElement("option");

      opcion.value = curso.id;
      opcion.textContent = obtenerNombreCurso(curso);

      cursoCalificaciones.appendChild(opcion);
    });

    cursoCalificaciones.disabled = false;
  } catch (error) {
    console.error("Error al cargar cursos para calificaciones:", error);
    limpiarSelectorCursos("No se pudieron cargar los cursos");
    mostrarMensaje("No se pudieron cargar los cursos de 1º y 2º año.", "error");
  }
}

async function validarPeriodosConfigurados(cicloLectivo) {
  const referencia = doc(db, "configuracion_periodos", String(cicloLectivo));

  const documento = await getDoc(referencia);

  if (!documento.exists()) {
    throw new Error(
      `No están configurados los períodos del ciclo lectivo ${cicloLectivo}.`,
    );
  }

  const datos = documento.data();

  const campos = [
    "trimestre1Inicio",
    "trimestre1Fin",
    "trimestre2Inicio",
    "trimestre2Fin",
    "trimestre3Inicio",
    "trimestre3Fin",
  ];

  const incompleto = campos.some(
    (campo) => !String(datos?.[campo] || "").trim(),
  );

  if (incompleto) {
    throw new Error(
      `La configuración de períodos de ${cicloLectivo} está incompleta.`,
    );
  }
}

async function obtenerAsignacionesTaller(cursoId, cicloLectivo) {
  const consulta = query(
    collection(db, "asignaciones_docentes"),
    where("cursoId", "==", cursoId),
  );

  const resultado = await getDocs(consulta);

  const asignaciones = resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((asignacion) => {
      const estado = normalizarMayusculas(asignacion.estado);
      const tipo = normalizarMayusculas(
        asignacion.espacioTipo ||
          asignacion.tipoEspacio ||
          asignacion.tipoHorario,
      );

      return (
        ["ACTIVA", "ACTIVO"].includes(estado) &&
        tipo === "TALLER" &&
        Number(asignacion.cicloLectivo || 0) === Number(cicloLectivo)
      );
    });

  const porEspacio = new Map();

  asignaciones.forEach((asignacion) => {
    const espacioId = String(asignacion.espacioId || "").trim();

    if (!espacioId) return;

    if (!porEspacio.has(espacioId)) {
      porEspacio.set(espacioId, []);
    }

    porEspacio.get(espacioId).push(asignacion);
  });

  const espaciosDuplicados = Array.from(porEspacio.values()).filter(
    (grupo) => grupo.length > 1,
  );

  if (espaciosDuplicados.length) {
    const nombres = espaciosDuplicados
      .map(
        (grupo) => grupo[0]?.espacioNombre || grupo[0]?.espacioId || "Taller",
      )
      .join(", ");

    throw new Error(
      `Hay más de una asignación activa para el mismo Taller: ${nombres}. Revisá las asignaciones antes de inicializar.`,
    );
  }

  const unicas = Array.from(porEspacio.values())
    .map((grupo) => grupo[0])
    .sort((a, b) =>
      String(a.espacioNombre || "").localeCompare(
        String(b.espacioNombre || ""),
        "es",
        {
          sensitivity: "base",
        },
      ),
    );

  if (unicas.length !== 3) {
    throw new Error(
      `El curso debe tener exactamente 3 espacios de Taller activos para ${cicloLectivo}. Actualmente tiene ${unicas.length}.`,
    );
  }

  unicas.forEach((asignacion) => {
    if (
      !String(asignacion.espacioId || "").trim() ||
      !String(asignacion.espacioNombre || "").trim() ||
      !normalizarCorreo(asignacion.docenteCorreo)
    ) {
      throw new Error(
        "Hay una asignación de Taller incompleta. Revisá espacio curricular y docente.",
      );
    }
  });

  return unicas;
}

async function obtenerEstudiantesCurso(cursoId) {
  const consulta = query(
    collection(db, "usuarios"),
    where("cursoId", "==", cursoId),
  );

  const resultado = await getDocs(consulta);

  const estudiantes = resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((usuario) => {
      const estado = normalizarMayusculas(usuario.estado);

      return (
        estado === "ACTIVO" &&
        usuarioTieneRolAlumno(usuario) &&
        usuarioEstaCursando(usuario)
      );
    })
    .sort((a, b) =>
      String(a.nombreCompleto || "").localeCompare(
        String(b.nombreCompleto || ""),
        "es",
        {
          sensitivity: "base",
        },
      ),
    );

  if (!estudiantes.length) {
    throw new Error(
      "El curso no tiene estudiantes activos con situación CURSANDO.",
    );
  }

  /*
   * Un estudiante sin G1/G2 sigue perteneciendo al curso. En este sistema
   * esa condición indica que está exceptuado de cursar Taller, por lo que
   * no debe impedir la inicialización del Registro de Calificaciones.
   * Se conserva igualmente dentro de `alumnos` para que aparezca en la
   * vista "Todos" y continúe formando parte del listado institucional.
   */
  return estudiantes;
}

function elegirReemplazoParaCorreo(reemplazos) {
  const hoy = fechaLocalISO();

  return [...reemplazos].sort((a, b) => {
    const aDesde = String(a.fechaDesde || "");
    const aHasta = String(a.fechaHasta || "");
    const bDesde = String(b.fechaDesde || "");
    const bHasta = String(b.fechaHasta || "");

    const aVigente = aDesde <= hoy && hoy <= aHasta;
    const bVigente = bDesde <= hoy && hoy <= bHasta;

    if (aVigente !== bVigente) {
      return aVigente ? -1 : 1;
    }

    const aFuturo = aDesde > hoy;
    const bFuturo = bDesde > hoy;

    if (aFuturo !== bFuturo) {
      return aFuturo ? -1 : 1;
    }

    if (aFuturo && bFuturo) {
      return aDesde.localeCompare(bDesde);
    }

    return bHasta.localeCompare(aHasta);
  })[0];
}

async function obtenerMapasReemplazos(cursoId, cicloLectivo, asignaciones) {
  const consulta = query(
    collection(db, "reemplazos_docentes"),
    where("cursoId", "==", cursoId),
  );

  const resultado = await getDocs(consulta);

  const reemplazos = resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((reemplazo) => {
      return (
        normalizarMayusculas(reemplazo.estado) === "ACTIVO" &&
        normalizarMayusculas(reemplazo.tipoHorario) === "TALLER" &&
        Number(reemplazo.cicloLectivo || 0) === Number(cicloLectivo)
      );
    });

  return asignaciones.map((asignacion) => {
    const candidatos = reemplazos.filter(
      (reemplazo) =>
        String(reemplazo.asignacionTitularId || "").trim() === asignacion.id,
    );

    const porCorreo = new Map();

    candidatos.forEach((reemplazo) => {
      const correo = normalizarCorreo(reemplazo.reemplazanteCorreo);

      if (!correo) return;

      if (!porCorreo.has(correo)) {
        porCorreo.set(correo, []);
      }

      porCorreo.get(correo).push(reemplazo);
    });

    const mapa = {};

    porCorreo.forEach((grupo, correo) => {
      const elegido = elegirReemplazoParaCorreo(grupo);

      if (elegido?.id) {
        mapa[correo] = elegido.id;
      }
    });

    return mapa;
  });
}

function crearMapaAlumnos(estudiantes) {
  const alumnos = {};

  estudiantes.forEach((estudiante) => {
    alumnos[estudiante.id] = {
      id: estudiante.id,
      correo: normalizarCorreo(estudiante.correo || estudiante.id),
      dni: String(estudiante.dni || "").trim(),
      nombre: String(
        estudiante.nombreCompleto || estudiante.nombre || estudiante.id,
      ).trim(),
      grupoTaller: normalizarMayusculas(estudiante.grupoTaller),
    };
  });

  return alumnos;
}

function crearDatosRegistro({
  cicloLectivo,
  curso,
  asignaciones,
  reemplazos,
  estudiantes,
}) {
  const correoSoporte = normalizarCorreo(usuarioSoporteCalificaciones?.email);

  return {
    cicloLectivo,
    cicloLectivoDocId: String(cicloLectivo),

    cursoId: curso.id,
    cursoNombre: obtenerNombreCurso(curso),
    cursoAnio: Number(curso.anio || 0),
    cursoDivision: String(curso.division || "").trim(),

    espacio1Id: String(asignaciones[0].espacioId || "").trim(),
    espacio1Nombre: String(asignaciones[0].espacioNombre || "").trim(),
    espacio1DocenteCorreo: normalizarCorreo(asignaciones[0].docenteCorreo),
    espacio1AsignacionId: asignaciones[0].id,

    espacio2Id: String(asignaciones[1].espacioId || "").trim(),
    espacio2Nombre: String(asignaciones[1].espacioNombre || "").trim(),
    espacio2DocenteCorreo: normalizarCorreo(asignaciones[1].docenteCorreo),
    espacio2AsignacionId: asignaciones[1].id,

    espacio3Id: String(asignaciones[2].espacioId || "").trim(),
    espacio3Nombre: String(asignaciones[2].espacioNombre || "").trim(),
    espacio3DocenteCorreo: normalizarCorreo(asignaciones[2].docenteCorreo),
    espacio3AsignacionId: asignaciones[2].id,

    reemplazosEspacio1: reemplazos[0] || {},
    reemplazosEspacio2: reemplazos[1] || {},
    reemplazosEspacio3: reemplazos[2] || {},

    alumnos: crearMapaAlumnos(estudiantes),

    trim1Espacio1: {},
    trim1Espacio2: {},
    trim1Espacio3: {},
    trim1Resultado: {},

    trim2Espacio1: {},
    trim2Espacio2: {},
    trim2Espacio3: {},
    trim2Resultado: {},

    trim3Espacio1: {},
    trim3Espacio2: {},
    trim3Espacio3: {},
    trim3Resultado: {},

    calificacionFinal: {},
    diciembre: {},
    febrero: {},

    ultimaOperacion: {},

    creadoEn: serverTimestamp(),
    creadoPor: correoSoporte,
    actualizadoEn: serverTimestamp(),
    actualizadoPor: correoSoporte,
  };
}

async function inicializarRegistroCalificaciones(evento) {
  evento.preventDefault();

  if (
    !usuarioSoporteCalificaciones ||
    !cicloCalificaciones ||
    !cursoCalificaciones ||
    !btnInicializar
  ) {
    mostrarMensaje("Esperando validación de sesión.", "error");
    return;
  }

  const cicloLectivo = Number(cicloCalificaciones.value || 0);
  const cursoId = String(cursoCalificaciones.value || "").trim();

  if (
    !Number.isInteger(cicloLectivo) ||
    cicloLectivo < 2020 ||
    cicloLectivo > 2100
  ) {
    mostrarMensaje("Ingresá un ciclo lectivo válido.", "error");
    return;
  }

  if (!cursoId) {
    mostrarMensaje("Seleccioná un curso.", "error");
    return;
  }

  const curso = cursosCalificaciones.find((item) => item.id === cursoId);

  if (!curso) {
    mostrarMensaje("El curso seleccionado ya no está disponible.", "error");
    return;
  }

  if (![1, 2].includes(Number(curso.anio || 0))) {
    mostrarMensaje(
      "El Registro de Calificaciones de Taller se utiliza solamente en 1º y 2º año.",
      "error",
    );
    return;
  }

  const registroId = `${cicloLectivo}__${cursoId}`;
  const referenciaRegistro = doc(db, "calificaciones_taller", registroId);

  btnInicializar.disabled = true;
  mostrarMensaje("Verificando datos del curso...");

  try {
    const existente = await getDoc(referenciaRegistro);

    if (existente.exists()) {
      await Swal.fire({
        icon: "info",
        title: "El registro ya existe",
        html: `
          <p>
            Ya existe el Registro de Calificaciones de
            <strong>${escaparHtml(obtenerNombreCurso(curso))}</strong>
            para el ciclo <strong>${cicloLectivo}</strong>.
          </p>
          <p>No se modificó ningún dato.</p>
        `,
        confirmButtonText: "Aceptar",
      });

      mostrarMensaje(`El registro ${registroId} ya está inicializado.`, "ok");
      return;
    }

    await validarPeriodosConfigurados(cicloLectivo);

    const [asignaciones, estudiantes] = await Promise.all([
      obtenerAsignacionesTaller(cursoId, cicloLectivo),
      obtenerEstudiantesCurso(cursoId),
    ]);

    const reemplazos = await obtenerMapasReemplazos(
      cursoId,
      cicloLectivo,
      asignaciones,
    );

    const cantidadG1 = estudiantes.filter(
      (estudiante) => normalizarMayusculas(estudiante.grupoTaller) === "G1",
    ).length;

    const cantidadG2 = estudiantes.filter(
      (estudiante) => normalizarMayusculas(estudiante.grupoTaller) === "G2",
    ).length;

    const cantidadExceptuados = estudiantes.length - cantidadG1 - cantidadG2;

    const detalleTalleres = asignaciones
      .map(
        (asignacion) => `
          <li>
            <strong>${escaparHtml(asignacion.espacioNombre)}</strong>
            — ${escaparHtml(
              asignacion.docenteNombre || asignacion.docenteCorreo,
            )}
          </li>
        `,
      )
      .join("");

    const confirmacion = await Swal.fire({
      icon: "question",
      title: "¿Inicializar registro?",
      html: `
        <div style="text-align:left">
          <p>
            Curso:
            <strong>${escaparHtml(obtenerNombreCurso(curso))}</strong>
          </p>
          <p>
            Ciclo lectivo:
            <strong>${cicloLectivo}</strong>
          </p>
          <p>
            Estudiantes:
            <strong>${estudiantes.length}</strong>
            (G1: ${cantidadG1} · G2: ${cantidadG2} · Exceptuados: ${cantidadExceptuados})
          </p>
          <p><strong>Talleres:</strong></p>
          <ul>${detalleTalleres}</ul>
          <p>
            El registro se creará sin calificaciones.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, inicializar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmacion.isConfirmed) {
      mostrarMensaje("Inicialización cancelada.");
      return;
    }

    mostrarMensaje("Creando registro de calificaciones...");

    const datosRegistro = crearDatosRegistro({
      cicloLectivo,
      curso,
      asignaciones,
      reemplazos,
      estudiantes,
    });

    await setDoc(referenciaRegistro, datosRegistro);

    const verificacion = await getDoc(referenciaRegistro);

    if (!verificacion.exists()) {
      throw new Error("Firestore no confirmó la creación del registro.");
    }

    await Swal.fire({
      icon: "success",
      title: "Registro inicializado",
      html: `
        <p>
          Se creó correctamente el Registro de Calificaciones de
          <strong>${escaparHtml(obtenerNombreCurso(curso))}</strong>.
        </p>
        <p>
          Documento:
          <code>${escaparHtml(registroId)}</code>
        </p>
      `,
      confirmButtonText: "Aceptar",
    });

    mostrarMensaje(
      `Registro ${registroId} creado correctamente con ${estudiantes.length} estudiante(s).`,
      "ok",
    );
  } catch (error) {
    console.error("Error al inicializar calificaciones de Taller:", error);

    mostrarMensaje(
      error?.message || "No se pudo inicializar el registro de calificaciones.",
      "error",
    );

    await Swal.fire({
      icon: "error",
      title: "No se pudo inicializar",
      text:
        error?.message ||
        "Revisá las asignaciones, estudiantes, períodos y permisos.",
      confirmButtonText: "Aceptar",
    });
  } finally {
    btnInicializar.disabled = false;
  }
}

function nombreTrimestreAdmin(trimestre) {
  if (trimestre === 1) return "1° trimestre";
  if (trimestre === 2) return "2° trimestre";
  if (trimestre === 3) return "3° trimestre";
  return "";
}

async function reabrirTrimestreCalificacionesTaller(trimestre) {
  if (
    !usuarioSoporteCalificaciones ||
    !cicloCalificaciones ||
    !cursoCalificaciones ||
    ![1, 2, 3].includes(trimestre)
  ) {
    return;
  }

  const cicloLectivo = Number(cicloCalificaciones.value || 0);
  const cursoId = String(cursoCalificaciones.value || "").trim();

  if (!Number.isInteger(cicloLectivo) || !cursoId) return;

  const registroId = `${cicloLectivo}__${cursoId}`;
  const referencia = doc(db, "calificaciones_taller", registroId);

  try {
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      throw new Error("El registro ya no existe.");
    }

    const registro = documento.data();

    const cierre =
      registro.cierresTrimestres?.[String(trimestre)] ||
      registro.cierresTrimestres?.[trimestre] ||
      null;

    if (!cierre || String(cierre.estado || "").toUpperCase() !== "CERRADO") {
      await Swal.fire({
        icon: "info",
        title: "Trimestre ya abierto",
        text: `${nombreTrimestreAdmin(trimestre)} no se encuentra cerrado.`,
        confirmButtonText: "Aceptar",
      });

      await consultarCierresCalificacionesTaller();
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "Reabrir trimestre",
      html: `
        <p>
          Vas a reabrir el
          <strong>${nombreTrimestreAdmin(trimestre)}</strong>.
        </p>
        <p>
          Si su período todavía está vigente, los docentes volverán
          a poder modificar las calificaciones.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, reabrir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmacion.isConfirmed) return;

    const correo = normalizarCorreo(usuarioSoporteCalificaciones.email);

    const marcaTiempo = serverTimestamp();

    const cierreReabierto = {
      estado: "ABIERTO",
      cerradoPor: cierre.cerradoPor || "",
      cerradoEn: cierre.cerradoEn || null,
      pendientesAlCerrar: Number(cierre.pendientesAlCerrar || 0),
      reabiertoPor: correo,
      reabiertoEn: marcaTiempo,
    };

    const operacion = {
      tipo: "REABRIR_TRIMESTRE",
      trimestre,
      por: correo,
      en: marcaTiempo,
    };

    await updateDoc(
      referencia,
      new FieldPath("cierresTrimestres", String(trimestre)),
      cierreReabierto,
      "ultimaOperacion",
      operacion,
      "actualizadoEn",
      marcaTiempo,
      "actualizadoPor",
      correo,
    );

    await Swal.fire({
      icon: "success",
      title: "Trimestre reabierto",
      text: `${nombreTrimestreAdmin(trimestre)} fue reabierto correctamente.`,
      confirmButtonText: "Aceptar",
    });

    await consultarCierresCalificacionesTaller();
  } catch (error) {
    console.error("Error al reabrir trimestre de Taller:", error);

    await Swal.fire({
      icon: "error",
      title: "No se pudo reabrir",
      text:
        error?.code === "permission-denied"
          ? "Firebase rechazó la reapertura. Verificá los permisos de SOPORTE."
          : "Ocurrió un error al intentar reabrir el trimestre.",
      confirmButtonText: "Aceptar",
    });
  }
}

async function consultarCierresCalificacionesTaller() {
  if (
    !usuarioSoporteCalificaciones ||
    !cicloCalificaciones ||
    !cursoCalificaciones ||
    !estadoCierresCalificaciones
  ) {
    return;
  }

  const cicloLectivo = Number(cicloCalificaciones.value || 0);
  const cursoId = String(cursoCalificaciones.value || "").trim();

  if (!Number.isInteger(cicloLectivo) || !cursoId) {
    estadoCierresCalificaciones.textContent =
      "Seleccioná un ciclo lectivo y un curso.";
    estadoCierresCalificaciones.className = "mensaje-formulario error";
    return;
  }

  const registroId = `${cicloLectivo}__${cursoId}`;

  const referencia = doc(db, "calificaciones_taller", registroId);

  if (btnConsultarCierresCalificaciones) {
    btnConsultarCierresCalificaciones.disabled = true;
    btnConsultarCierresCalificaciones.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Consultando...
    `;
  }

  estadoCierresCalificaciones.textContent =
    "Consultando estado de los trimestres...";
  estadoCierresCalificaciones.className = "mensaje-formulario";

  try {
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
      estadoCierresCalificaciones.textContent =
        "El curso seleccionado todavía no tiene inicializado su Registro de Calificaciones.";
      estadoCierresCalificaciones.className = "mensaje-formulario error";
      return;
    }

    const registro = documento.data();
    const cierres = registro.cierresTrimestres || {};

    const cerrados = [1, 2, 3].filter((trimestre) => {
      const cierre = cierres[String(trimestre)] || cierres[trimestre] || null;

      return String(cierre?.estado || "").toUpperCase() === "CERRADO";
    });

    if (!cerrados.length) {
      estadoCierresCalificaciones.innerHTML =
        "<strong>No hay trimestres cerrados.</strong>";
      estadoCierresCalificaciones.className = "mensaje-formulario ok";
      return;
    }

    const botones = cerrados
      .map(
        (trimestre) => `
      <button
        type="button"
        class="btn-accion btn-reabrir-trimestre-calificaciones"
        data-trimestre="${trimestre}"
      >
        <i class="fa-solid fa-lock-open"></i>
        Reabrir ${nombreTrimestreAdmin(trimestre)}
      </button>
    `,
      )
      .join("");

    estadoCierresCalificaciones.innerHTML = `
  <div>
    <strong>Trimestres cerrados:</strong>
    ${cerrados.map((trimestre) => nombreTrimestreAdmin(trimestre)).join(" · ")}
  </div>

  <div
    class="acciones"
    style="margin-top: 12px"
  >
    ${botones}
  </div>
`;

    estadoCierresCalificaciones.className = "mensaje-formulario ok";

    estadoCierresCalificaciones
      .querySelectorAll(".btn-reabrir-trimestre-calificaciones")
      .forEach((boton) => {
        boton.addEventListener("click", () => {
          reabrirTrimestreCalificacionesTaller(
            Number(boton.dataset.trimestre || 0),
          );
        });
      });
  } catch (error) {
    console.error(
      "Error al consultar cierres de Calificaciones de Taller:",
      error,
    );

    estadoCierresCalificaciones.textContent =
      "No se pudo consultar el estado de los trimestres.";

    estadoCierresCalificaciones.className = "mensaje-formulario error";
  } finally {
    if (btnConsultarCierresCalificaciones) {
      btnConsultarCierresCalificaciones.disabled = false;
      btnConsultarCierresCalificaciones.innerHTML = `
        <i class="fa-solid fa-lock-open"></i>
        Consultar cierres
      `;
    }
  }
}

if (formInicializar) {
  formInicializar.addEventListener("submit", inicializarRegistroCalificaciones);
}

if (btnConsultarCierresCalificaciones) {
  btnConsultarCierresCalificaciones.addEventListener(
    "click",
    consultarCierresCalificacionesTaller,
  );
}

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) return;

  usuarioSoporteCalificaciones = usuario;

  if (cicloCalificaciones && !cicloCalificaciones.value) {
    cicloCalificaciones.value = String(new Date().getFullYear());
  }

  await cargarCursosCalificaciones();
});
