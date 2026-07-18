import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const btnVerAccesosRecientes = document.getElementById(
  "btnVerAccesosRecientes",
);

const cuerpoTablaAccesosRecientes = document.getElementById(
  "cuerpoTablaAccesosRecientes",
);

const mensajeAccesosRecientes = document.getElementById(
  "mensajeAccesosRecientes",
);

const rolesLegibles = {
  ALUMNO: "Estudiante",
  DOCENTE: "Docente",
  SOPORTE: "Soporte Institucional",
  PRECEPTORIA: "Preceptoría",
  SECRETARIA: "Secretaría",
  DIRECCION: "Dirección",
};

function mostrarMensaje(texto = "", tipo = "") {
  if (!mensajeAccesosRecientes) {
    return;
  }

  mensajeAccesosRecientes.textContent = texto;
  mensajeAccesosRecientes.className = "mensaje-formulario";

  if (tipo) {
    mensajeAccesosRecientes.classList.add(tipo);
  }
}

function mostrarFilaInformativa(texto) {
  if (!cuerpoTablaAccesosRecientes) {
    return;
  }

  cuerpoTablaAccesosRecientes.replaceChildren();

  const fila = document.createElement("tr");
  const celda = document.createElement("td");

  celda.colSpan = 5;
  celda.className = "tabla-vacia";
  celda.textContent = texto;

  fila.appendChild(celda);
  cuerpoTablaAccesosRecientes.appendChild(fila);
}

function convertirFechaFirestore(valor) {
  if (!valor) {
    return null;
  }

  if (typeof valor.toDate === "function") {
    return valor.toDate();
  }

  if (valor instanceof Date) {
    return valor;
  }

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin registrar";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function formatearHora(fecha) {
  if (!fecha) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(fecha);
}

function crearCelda(texto, clase = "") {
  const celda = document.createElement("td");

  celda.textContent = texto;

  if (clase) {
    celda.className = clase;
  }

  return celda;
}

function mostrarAccesos(documentos) {
  if (!cuerpoTablaAccesosRecientes) {
    return;
  }

  cuerpoTablaAccesosRecientes.replaceChildren();

  if (!documentos.length) {
    mostrarFilaInformativa("Todavía no hay accesos registrados.");
    return;
  }

  documentos.forEach((documento) => {
    const acceso = documento.data();
    const fechaIngreso = convertirFechaFirestore(acceso.ultimoIngreso);

    const nombre =
      String(acceso.nombreCompleto || "").trim() || "Sin nombre registrado";

    const correo = String(acceso.correo || "").trim() || "Sin correo";

    const rolOriginal = String(acceso.rol || "")
      .trim()
      .toUpperCase();

    const rol = rolesLegibles[rolOriginal] || rolOriginal || "Sin rol";

    const fila = document.createElement("tr");

    fila.appendChild(crearCelda(nombre));
    fila.appendChild(crearCelda(correo));
    fila.appendChild(crearCelda(rol));
    fila.appendChild(crearCelda(formatearFecha(fechaIngreso)));
    fila.appendChild(crearCelda(formatearHora(fechaIngreso)));

    cuerpoTablaAccesosRecientes.appendChild(fila);
  });
}

async function obtenerBaseDeDatos() {
  if (window.portalDb) {
    return window.portalDb;
  }

  return new Promise((resolve, reject) => {
    const tiempoMaximo = 5000;
    const intervalo = 100;
    let tiempoTranscurrido = 0;

    const comprobacion = window.setInterval(() => {
      tiempoTranscurrido += intervalo;

      if (window.portalDb) {
        window.clearInterval(comprobacion);
        resolve(window.portalDb);
        return;
      }

      if (tiempoTranscurrido >= tiempoMaximo) {
        window.clearInterval(comprobacion);
        reject(new Error("No se pudo acceder a Firestore."));
      }
    }, intervalo);
  });
}

async function cargarAccesosRecientes() {
  if (!btnVerAccesosRecientes) {
    return;
  }

  const textoOriginal = btnVerAccesosRecientes.innerHTML;

  btnVerAccesosRecientes.disabled = true;
  btnVerAccesosRecientes.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin"></i>
    Cargando actividad...
  `;

  mostrarMensaje("");
  mostrarFilaInformativa("Consultando los últimos accesos...");

  try {
    const db = await obtenerBaseDeDatos();

    const consultaAccesos = query(
      collection(db, "accesos_recientes"),
      orderBy("ultimoIngreso", "desc"),
      limit(50),
    );

    const resultado = await getDocs(consultaAccesos);

    mostrarAccesos(resultado.docs);

    mostrarMensaje(
      resultado.empty
        ? ""
        : `Se mostraron ${resultado.size} accesos recientes.`,
      "mensaje-exito",
    );
  } catch (error) {
    console.error("Error al consultar los accesos recientes:", error);

    mostrarFilaInformativa("No se pudieron cargar los accesos recientes.");

    mostrarMensaje(
      "Ocurrió un error al consultar la actividad del portal.",
      "mensaje-error",
    );
  } finally {
    btnVerAccesosRecientes.disabled = false;
    btnVerAccesosRecientes.innerHTML = textoOriginal;
  }
}

if (btnVerAccesosRecientes) {
  btnVerAccesosRecientes.addEventListener("click", cargarAccesosRecientes);
}
