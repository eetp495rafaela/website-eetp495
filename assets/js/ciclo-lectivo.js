import {
  doc,
  getDocFromServer,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  interpretarConfiguracion,
} from "./ciclo-lectivo-core.mjs";

export async function obtenerCicloVigente(db) {
  if (!db) {
    throw new Error("Conexión institucional no disponible.");
  }

  const referencia = doc(
    db,
    "configuracion_institucional",
    "ciclo_lectivo"
  );

  const resultado = await getDocFromServer(referencia);

  return interpretarConfiguracion(
    resultado.exists() ? resultado.data() : null
  );
}
