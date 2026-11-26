import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  doc, getDocFromServer, writeBatch
} from "firebase/firestore";

const sdk = import.meta.resolve("firebase/firestore");

registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier === "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
        ? sdk : specifier,
      context
    );
  }
});

assert.equal(
  process.env.FIRESTORE_EMULATOR_HOST,
  "127.0.0.1:8085",
  "Se requiere el emulador local en el puerto 8085"
);

const {
  consultarLimpiezaCiclo,
  eliminarCicloAnterior
} = await import("../../assets/js/limpieza-ciclo-firestore.js");

const env = await initializeTestEnvironment({
  projectId: "demo-eetp495-ciclo",
  firestore: {
    host: "127.0.0.1",
    port: 8085,
    rules: readFileSync(
      new URL("../../firestore.rules", import.meta.url),
      "utf8"
    )
  }
});

const correo = "soporte@pruebas.invalid";

const operativas = [
  "horarios",
  "asignaciones_docentes",
  "reemplazos_docentes"
];

const academicas = [
  "asistencias_clases",
  "calificaciones_taller",
  "mesas_examen"
];

try {
  await env.clearFirestore();

  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    const lote = writeBatch(db);

    lote.set(doc(db, "usuarios", correo), {
      correo,
      rol: "SOPORTE",
      roles: ["SOPORTE"],
      estado: "ACTIVO"
    });

    lote.set(
      doc(db, "configuracion_institucional", "ciclo_lectivo"),
      { cicloVigente: 2027 }
    );

    for (let i = 0; i < 100; i++) {
      lote.set(doc(db, "horarios", `anterior_${i}`), {
        cicloLectivo: 2026,
        tipoHorario: "AULA",
        estado: "ACTIVO"
      });
    }

    for (const nombre of operativas.slice(1)) {
      lote.set(doc(db, nombre, "anterior"), {
        cicloLectivo: 2026
      });
    }

    for (const nombre of operativas) {
      for (const ciclo of [2027, 2028]) {
        lote.set(doc(db, nombre, String(ciclo)), {
          cicloLectivo: ciclo
        });
      }
    }

    for (const nombre of academicas) {
      lote.set(doc(db, nombre, "2026"), {
        cicloLectivo: 2026
      });
    }

    await lote.commit();
  });

  const db = env.authenticatedContext(
    "uid-soporte",
    { email: correo, email_verified: true }
  ).firestore();

  const inicial = await consultarLimpiezaCiclo(db, 2026);
  assert.equal(inicial.resumen.total, 102);
  console.log("OK 1 | Revision inicial: 102 registros");

  await assert.rejects(
    eliminarCicloAnterior(db, 2026, inicial.huella, cantidad => {
      if (cantidad === 100) {
        throw new Error("Interrupcion simulada");
      }
    }),
    /Interrupcion simulada/
  );

  console.log("OK 2 | Interrupcion tras el primer lote");

  const pendiente = await consultarLimpiezaCiclo(db, 2026);
  assert.equal(pendiente.resumen.total, 2);
  assert.equal(pendiente.resumen.asignaciones, 1);
  assert.equal(pendiente.resumen.reemplazos, 1);

  console.log("OK 3 | Dos registros pendientes intactos");

  await assert.rejects(
    eliminarCicloAnterior(db, 2026, inicial.huella),
    /Los registros cambiaron/
  );

  console.log("OK 4 | Rechaza la confirmacion anterior");

  assert.equal(
    await eliminarCicloAnterior(db, 2026, pendiente.huella),
    2
  );

  assert.equal(
    (await consultarLimpiezaCiclo(db, 2026)).resumen.total,
    0
  );

  console.log("OK 5 | Reintento completa la limpieza");

  await env.withSecurityRulesDisabled(async ctx => {
    const base = ctx.firestore();

    for (const nombre of operativas) {
      for (const ciclo of [2027, 2028]) {
        assert.ok(
          (await getDocFromServer(
            doc(base, nombre, String(ciclo))
          )).exists()
        );
      }
    }

    console.log("OK 6 | Ciclos vigente y futuro conservados");

    for (const nombre of academicas) {
      assert.ok(
        (await getDocFromServer(
          doc(base, nombre, "2026")
        )).exists()
      );
    }

    console.log("OK 7 | Registros academicos conservados");
  });

  console.log("VP-02 SUPERADA: 7/7");
} finally {
  await env.cleanup();
}
