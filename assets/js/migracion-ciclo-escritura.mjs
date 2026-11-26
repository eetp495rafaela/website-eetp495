
function normalizarValor(valor) {
  if (valor === null) return null;

  if (valor instanceof Date) {
    return ["fecha", valor.toISOString()];
  }

  if (typeof valor === "object") {
    if (
      typeof valor.toDate === "function" &&
      Number.isInteger(valor.seconds) &&
      Number.isInteger(valor.nanoseconds)
    ) {
      return [
        "timestamp",
        valor.seconds,
        valor.nanoseconds,
      ];
    }

    if (Array.isArray(valor)) {
      return ["array", valor.map(normalizarValor)];
    }

    const prototipo = Object.getPrototypeOf(valor);

    if (
      prototipo !== Object.prototype &&
      prototipo !== null
    ) {
      throw new Error("Tipo de dato no admitido en la migración.");
    }

    return [
      "objeto",
      Object.keys(valor).sort().map(clave => [
        clave,
        normalizarValor(valor[clave]),
      ]),
    ];
  }

  if (
    typeof valor === "string" ||
    typeof valor === "boolean" ||
    (typeof valor === "number" && Number.isFinite(valor))
  ) {
    return [typeof valor, valor];
  }

  throw new Error("Valor no admitido en la migración.");
}

function serializar(valor) {
  return JSON.stringify(normalizarValor(valor));
}

export async function calcularHuellaPlan(plan) {
  const registros = organizarEscrituras(plan).flat();

  registros.sort((a, b) => {
    const x = `${a.coleccion}/${a.id}`;
    const y = `${b.coleccion}/${b.id}`;

    return x < y ? -1 : x > y ? 1 : 0;
  });

  const contenido = serializar({
    origen: plan.origen,
    destino: plan.destino,
    registros,
  });

  const bytes = new TextEncoder().encode(contenido);
  const hash = await globalThis.crypto.subtle.digest(
    "SHA-256",
    bytes
  );

  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export function organizarEscrituras(plan, limite = 450) {
  if (!Number.isInteger(limite) || limite < 1 || limite > 450) {
    throw new Error("Tamaño de lote incorrecto.");
  }

  const registros = [
    ...plan.asignaciones.map(r => ({
      ...r,
      coleccion: "asignaciones_docentes",
    })),
    ...plan.horarios.map(r => ({
      ...r,
      coleccion: "horarios",
    })),
  ];

  const claves = new Set();

  for (const r of registros) {
    const clave = `${r.coleccion}/${r.id}`;

    if (!r.id || claves.has(clave)) {
      throw new Error("Documento duplicado en el plan.");
    }

    if (r.datos.cicloLectivo !== plan.destino) {
      throw new Error("Documento con ciclo incorrecto.");
    }

    claves.add(clave);
  }

  const lotes = [];

  for (let i = 0; i < registros.length; i += limite) {
    lotes.push(registros.slice(i, i + limite));
  }

  return lotes;
}

export function identificarPendientes(
  registros,
  existentes,
  migracionId
) {
  if (!migracionId) {
    throw new Error("Identificador de migración requerido.");
  }

  const clave = r => `${r.coleccion}/${r.id}`;
  const previstos = new Map(registros.map(r => [clave(r), r]));
  const mapa = new Map();

  for (const r of existentes) {
    const k = clave(r);

    if (mapa.has(k)) {
      throw new Error("Documento existente duplicado.");
    }

    if (
      !previstos.has(k) ||
      r.datos.migracionCicloId !== migracionId
    ) {
      throw new Error(
        `El destino contiene registros ajenos a la migración: ${k}`
      );
    }

    const esperado = {
      ...previstos.get(k).datos,
      migracionCicloId: migracionId,
    };

    if (serializar(r.datos) !== serializar(esperado)) {
      throw new Error(
        `El documento migrado fue modificado: ${k}`
      );
    }

    mapa.set(k, r);
  }

  return registros.filter(r => !mapa.has(clave(r)));
}

export async function ejecutarLotes({
  lotes,
  escribir,
  informar = () => {},
}) {
  let completados = 0;

  for (const lote of lotes) {
    await escribir(lote);

    completados += lote.length;

    informar(completados);
  }

  return completados;
}
