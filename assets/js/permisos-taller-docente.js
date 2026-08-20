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

const SELECTOR_ELEMENTOS_TALLER = "[data-solo-docente-taller]";

const SECCIONES_RESTRINGIDAS_TALLER = new Set([
  "#sira-docente",
  "#parte-sira-docente",
  "#situacion-asistencia-docente",
]);

function normalizarCorreo(correo) {
  return String(correo || "")
    .trim()
    .toLowerCase();
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toUpperCase();
}

function obtenerFechaActualPermisosDocente() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerElementosSoloTaller() {
  return Array.from(document.querySelectorAll(SELECTOR_ELEMENTOS_TALLER));
}

function establecerVisibilidadHerramientasTaller(puedeVer) {
  obtenerElementosSoloTaller().forEach((elemento) => {
    elemento.hidden = !puedeVer;

    if (puedeVer) {
      elemento.style.removeProperty("display");
    } else {
      elemento.style.setProperty("display", "none", "important");
    }
  });
}

function controlarAccesoPorHash(puedeVer) {
  if (puedeVer) return;

  const hashActual = String(window.location.hash || "").trim();

  if (SECCIONES_RESTRINGIDAS_TALLER.has(hashActual)) {
    window.location.replace("#inicio");
  }
}

async function obtenerAsignacionesActivasDocente(correoDocente) {
  const asignacionesPorId = new Map();

  const consultas = [
    query(
      collection(db, "asignaciones_docentes"),
      where("docenteCorreo", "==", correoDocente),
      where("estado", "==", "ACTIVA"),
    ),
    query(
      collection(db, "asignaciones_docentes"),
      where("docenteCorreo", "==", correoDocente),
      where("estado", "==", "ACTIVO"),
    ),
  ];

  for (const consultaAsignaciones of consultas) {
    const resultado = await getDocs(consultaAsignaciones);

    resultado.forEach((documento) => {
      asignacionesPorId.set(documento.id, {
        id: documento.id,
        ...documento.data(),
      });
    });
  }

  return Array.from(asignacionesPorId.values());
}

async function obtenerReemplazosVigentesDocente(correoDocente) {
  const consulta = query(
    collection(db, "reemplazos_docentes"),
    where("reemplazanteCorreo", "==", correoDocente),
  );

  const resultado = await getDocs(consulta);

  const hoy = obtenerFechaActualPermisosDocente();

  const reemplazos = [];

  resultado.forEach((documento) => {
    const reemplazo = {
      id: documento.id,
      ...documento.data(),
    };

    const estado = normalizarTexto(reemplazo.estado);
    const tipoHorario = normalizarTexto(reemplazo.tipoHorario);
    const fechaDesde = String(reemplazo.fechaDesde || "").trim();
    const fechaHasta = String(reemplazo.fechaHasta || "").trim();

    const esTipoSira =
      tipoHorario === "TALLER" || tipoHorario === "EDUCACION_FISICA";

    const estaVigente =
      estado === "ACTIVO" &&
      esTipoSira &&
      fechaDesde &&
      fechaHasta &&
      hoy >= fechaDesde &&
      hoy <= fechaHasta;

    if (estaVigente) {
      reemplazos.push(reemplazo);
    }
  });

  return reemplazos;
}

function tieneAsignacionSira(asignaciones) {
  return asignaciones.some((asignacion) => {
    const estado = normalizarTexto(asignacion.estado);
    const espacioTipo = normalizarTexto(asignacion.espacioTipo);

    return (
      ["ACTIVA", "ACTIVO"].includes(estado) &&
      (espacioTipo === "TALLER" || espacioTipo === "EDUCACION_FISICA")
    );
  });
}

/*
  Las herramientas permanecen ocultas hasta confirmar
  que el docente posee una asignación activa de Taller /
  Educación Física o un reemplazo vigente.
*/
establecerVisibilidadHerramientasTaller(false);

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    establecerVisibilidadHerramientasTaller(false);
    return;
  }

  try {
    const correoDocente = normalizarCorreo(usuario.email);

    if (!correoDocente) {
      establecerVisibilidadHerramientasTaller(false);
      return;
    }

    const [asignaciones, reemplazosVigentes] = await Promise.all([
      obtenerAsignacionesActivasDocente(correoDocente),
      obtenerReemplazosVigentesDocente(correoDocente),
    ]);

    const tieneAsignacion = tieneAsignacionSira(asignaciones);
    const tieneReemplazo = reemplazosVigentes.length > 0;

    const puedeUsarHerramientasSira = tieneAsignacion || tieneReemplazo;

    establecerVisibilidadHerramientasTaller(puedeUsarHerramientasSira);

    controlarAccesoPorHash(puedeUsarHerramientasSira);

    window.addEventListener("hashchange", () => {
      controlarAccesoPorHash(puedeUsarHerramientasSira);
    });
  } catch (error) {
    console.error(
      "No se pudieron verificar los permisos de asistencia del docente:",
      error,
    );

    establecerVisibilidadHerramientasTaller(false);
    controlarAccesoPorHash(false);
  }
});
