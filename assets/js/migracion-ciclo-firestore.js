import {
  doc,
  collection,
  query,
  where,
  getDocsFromServer,
  getDocFromServer,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  calcularHuellaPlan,
  organizarEscrituras,
  identificarPendientes,
  ejecutarLotes,
} from "./migracion-ciclo-escritura.mjs";

import {
  crearEstadoMigracion,
  validarRecuperacion,
  completarMigracion,
} from "./migracion-ciclo-estado.mjs";

function referenciaCiclo(db) {
  return doc(
    db,
    "configuracion_institucional",
    "ciclo_lectivo"
  );
}

function referenciaMigracion(db, destino) {
  return doc(db, "migraciones_ciclo", String(destino));
}

export async function consultarEstadoMigracion(db, destino) {
  const resultado = await getDocFromServer(
    referenciaMigracion(db, destino)
  );

  return resultado.exists() ? resultado.data() : null;
}

async function consultarDestino(db, destino) {
  const colecciones = [
    "asignaciones_docentes",
    "horarios",
  ];

  const resultados = await Promise.all(
    colecciones.map(async nombre => {
      const resultado = await getDocsFromServer(
        query(
          collection(db, nombre),
          where("cicloLectivo", "==", destino)
        )
      );

      return resultado.docs.map(d => ({
        coleccion: nombre,
        id: d.id,
        datos: d.data(),
      }));
    })
  );

  return resultados.flat();
}

export async function ejecutarMigracionFirestore({
  db,
  plan,
  informar = () => {},
}) {
  if (!db || !plan) {
    throw new Error("Migración no disponible.");
  }

  const registros = organizarEscrituras(plan).flat();

  const esperado = crearEstadoMigracion({
    origen: plan.origen,
    destino: plan.destino,
    huella: await calcularHuellaPlan(plan),
    total: registros.length,
  });

  const refCiclo = referenciaCiclo(db);
  const refEstado = referenciaMigracion(db, plan.destino);

  const existentes = await consultarDestino(
    db,
    plan.destino
  );

  const estadoInicial = await consultarEstadoMigracion(
    db,
    plan.destino
  );

  if (estadoInicial) {
    validarRecuperacion(estadoInicial, esperado);

    identificarPendientes(
      registros,
      existentes,
      esperado.migracionId
    );
  } else if (existentes.length) {
    throw new Error("El destino contiene registros previos.");
  }

  await runTransaction(db, async tx => {
    const ciclo = await tx.get(refCiclo);
    const estado = await tx.get(refEstado);

    if (ciclo.data()?.cicloVigente !== plan.origen) {
      throw new Error("El ciclo vigente cambió.");
    }

    if (estado.exists()) {
      validarRecuperacion(estado.data(), esperado);
    } else {
      tx.set(refEstado, esperado);
    }
  });

  const actuales = await consultarDestino(
    db,
    plan.destino
  );

  const pendientes = identificarPendientes(
    registros,
    actuales,
    esperado.migracionId
  );

  const completados = registros.length - pendientes.length;

  informar(completados, registros.length);

  const lotes = [];

  for (let i = 0; i < pendientes.length; i += 100) {
    lotes.push(pendientes.slice(i, i + 100));
  }

  await ejecutarLotes({
    lotes,

    escribir: async lote => {
      await runTransaction(db, async tx => {
        const ciclo = await tx.get(refCiclo);
        const estado = await tx.get(refEstado);

        if (ciclo.data()?.cicloVigente !== plan.origen) {
          throw new Error("El ciclo vigente cambió.");
        }

        validarRecuperacion(estado.data(), esperado);

        const documentos = await Promise.all(
          lote.map(async r => {
            const referencia = doc(
              db,
              r.coleccion,
              r.id
            );

            const resultado = await tx.get(referencia);

            return { r, referencia, resultado };
          })
        );

        const encontrados = documentos
          .filter(d => d.resultado.exists())
          .map(d => ({
            coleccion: d.r.coleccion,
            id: d.r.id,
            datos: d.resultado.data(),
          }));

        const faltantes = identificarPendientes(
          lote,
          encontrados,
          esperado.migracionId
        );

        for (const r of faltantes) {
          tx.set(doc(db, r.coleccion, r.id), {
            ...r.datos,
            migracionCicloId: esperado.migracionId,
          });
        }
      });
    },

    informar: cantidad => {
      informar(
        completados + cantidad,
        registros.length
      );
    },
  });

  const verificados = await consultarDestino(
    db,
    plan.destino
  );

  const faltantes = identificarPendientes(
    registros,
    verificados,
    esperado.migracionId
  );

  if (faltantes.length) {
    throw new Error("La migración está incompleta.");
  }

  const final = completarMigracion(
    esperado,
    verificados.length
  );

  await runTransaction(db, async tx => {
    const ciclo = await tx.get(refCiclo);
    const estado = await tx.get(refEstado);

    if (ciclo.data()?.cicloVigente !== plan.origen) {
      throw new Error("El ciclo vigente cambió.");
    }

    validarRecuperacion(estado.data(), esperado);

    tx.update(refEstado, {
      estado: final.estado,
    });
  });

  return final;
}


export async function activarCicloFirestore(db, origen, destino) {
  if (!Number.isInteger(origen) || destino !== origen + 1) {
    throw new Error("Ciclos lectivos incorrectos.");
  }

  const registros = await consultarDestino(db, destino);

  const asignaciones = registros.filter(r =>
    r.coleccion === "asignaciones_docentes" &&
    ["ACTIVA", "ACTIVO"].includes(r.datos.estado)
  );

  const horarios = registros.filter(r =>
    r.coleccion === "horarios" &&
    r.datos.estado === "ACTIVO"
  );

  if (!asignaciones.length || !horarios.length) {
    throw new Error("El nuevo ciclo no contiene suficientes registros.");
  }

  for (const { id, datos: h } of horarios) {
    const vinculada = asignaciones.some(a =>
      a.datos.docenteCorreo === h.docenteCorreo &&
      a.datos.cursoId === h.cursoId &&
      a.datos.espacioId === h.espacioId &&
      (!h.asignacionId || a.id === h.asignacionId)
    );

    if (!vinculada) {
      throw new Error(`Horario sin asignación válida: ${id}`);
    }
  }

  await runTransaction(db, async tx => {
    const refCiclo = referenciaCiclo(db);
    const refEstado = referenciaMigracion(db, destino);

    const ciclo = await tx.get(refCiclo);
    const estado = await tx.get(refEstado);

    if (ciclo.data()?.cicloVigente !== origen) {
      throw new Error("El ciclo vigente cambió.");
    }

    const migracion = estado.data();

    if (
      migracion?.estado !== "PREPARADO" ||
      migracion.origen !== origen ||
      migracion.destino !== destino
    ) {
      throw new Error("El nuevo ciclo todavía no está preparado.");
    }

    tx.update(refCiclo, {
      cicloVigente: destino,
    });
  });

  return destino;
}
