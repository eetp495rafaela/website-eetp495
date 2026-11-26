import {
  collection,
  doc,
  query,
  where,
  getDocsFromServer,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { obtenerCicloVigente } from "./ciclo-lectivo.js";

const COLECCIONES = [
  "horarios",
  "asignaciones_docentes",
  "reemplazos_docentes"
];

export async function consultarLimpiezaCiclo(db, ciclo) {
  const vigente = await obtenerCicloVigente(db);

  if (!Number.isInteger(ciclo) || ciclo < 2000 || ciclo >= vigente) {
    throw new Error(
      "Solo se permite limpiar ciclos anteriores al vigente."
    );
  }

  const resultados = await Promise.all(
    COLECCIONES.map(nombre =>
      getDocsFromServer(query(
        collection(db, nombre),
        where("cicloLectivo", "==", ciclo)
      ))
    )
  );

  const docs = resultados.flatMap(r => r.docs);

  const resumen = {
    total: docs.length,
    aula: 0,
    taller: 0,
    educacionFisica: 0,
    otros: 0,
    asignaciones: resultados[1].size,
    reemplazos: resultados[2].size
  };

  for (const d of resultados[0].docs) {
    switch (d.data().tipoHorario) {
      case "AULA": resumen.aula++; break;
      case "TALLER": resumen.taller++; break;
      case "EDUCACION_FISICA": resumen.educacionFisica++; break;
      default: resumen.otros++;
    }
  }

  const huella = JSON.stringify(
    docs.map(d => d.ref.path).sort()
  );

  return { docs, resumen, huella };
}

export async function eliminarCicloAnterior(
  db, ciclo, huella, informar = () => {}
) {
  const revision = await consultarLimpiezaCiclo(db, ciclo);

  if (revision.huella !== huella) {
    throw new Error(
      "Los registros cambiaron. Volvé a revisar antes de eliminar."
    );
  }

  let eliminados = 0;

  for (let i = 0; i < revision.docs.length; i += 100) {
    const bloque = revision.docs.slice(i, i + 100);

    await runTransaction(db, async tx => {
      const vigente = await tx.get(doc(
        db, "configuracion_institucional", "ciclo_lectivo"
      ));

      if (!(ciclo < vigente.data()?.cicloVigente)) {
        throw new Error("No se permite eliminar el ciclo vigente.");
      }

      const actuales = await Promise.all(
        bloque.map(d => tx.get(d.ref))
      );

      for (const d of actuales) {
        if (!d.exists() || d.data().cicloLectivo !== ciclo) {
          throw new Error(
            "Un registro cambió durante la limpieza. Revisá nuevamente."
          );
        }
      }

      for (const d of actuales) {
        tx.delete(d.ref);
      }
    });

    eliminados += bloque.length;
    informar(eliminados, revision.docs.length);
  }

  const final = await consultarLimpiezaCiclo(db, ciclo);

  if (final.resumen.total !== 0) {
    throw new Error("Quedan registros pendientes de limpieza.");
  }

  return eliminados;
}
