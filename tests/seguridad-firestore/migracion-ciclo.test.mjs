import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";

import {
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const sdk = import.meta.resolve("firebase/firestore");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier ===
      "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js"
    ) {
      return nextResolve(sdk, context);
    }

    return nextResolve(specifier, context);
  },
});

const {
  activarCicloFirestore,
  ejecutarMigracionFirestore,
  consultarEstadoMigracion,
} = await import(
  "../../assets/js/migracion-ciclo-firestore.js"
);

const {
  prepararMigracion,
} = await import(
  "../../assets/js/migracion-ciclo-core.mjs"
);

const hostEmulador = process.env.FIRESTORE_EMULATOR_HOST;

if (!hostEmulador) {
  throw new Error("Se requiere Firestore emulado.");
}

const [host, puerto] = hostEmulador.split(":");

if (host !== "127.0.0.1" && host !== "localhost") {
  throw new Error("El emulador debe ser local.");
}

const env = await initializeTestEnvironment({
  projectId: "demo-eetp495-ciclo",
  firestore: {
    host,
    port: Number(puerto),
    rules: readFileSync(
      new URL("../../firestore.rules", import.meta.url),
      "utf8"
    ),
  },
});

const correo = "soporte@pruebas.invalid";
const docente = "docente@pruebas.invalid";

const asignacion = {
  docenteCorreo: docente,
  docenteNombre: "Docente de prueba",
  cursoId: "1A",
  espacioId: "taller1",
  cicloLectivo: 2026,
  estado: "ACTIVA",
};

function crearDatos(cantidad = 2) {
  return {
    asignaciones: [{
      id: "asignacion_original",
      datos: { ...asignacion },
    }],

    horarios: Array.from(
      { length: cantidad },
      (_, i) => ({
        id: `horario_${i}`,
        datos: {
          ...asignacion,
          estado: "ACTIVO",
          tipoHorario: "TALLER",
          asignacionId: "asignacion_original",
          dia: "LUNES",
          horaInicio: "08:00",
          horaFin: "09:00",
        },
      })
    ),
  };
}

async function prepararEntorno(cantidad = 2) {
  await env.clearFirestore();

  const datos = crearDatos(cantidad);

  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();

    await setDoc(doc(db, "usuarios", correo), {
      correo,
      rol: "SOPORTE",
      roles: ["SOPORTE"],
      estado: "ACTIVO",
    });

    await setDoc(
      doc(db, "configuracion_institucional", "ciclo_lectivo"),
      { cicloVigente: 2026 }
    );

    for (const a of datos.asignaciones) {
      await setDoc(
        doc(db, "asignaciones_docentes", a.id),
        a.datos
      );
    }

    for (const h of datos.horarios) {
      await setDoc(doc(db, "horarios", h.id), h.datos);
    }
  });

  const db = env.authenticatedContext(
    "uid-soporte",
    { email: correo, email_verified: true }
  ).firestore();

  const plan = prepararMigracion({
    origen: 2026,
    destino: 2027,
    ...datos,
  });

  return { db, plan, datos };
}

async function contar(db, nombre, ciclo) {
  const resultado = await getDocs(
    query(
      collection(db, nombre),
      where("cicloLectivo", "==", ciclo)
    )
  );

  return resultado.size;
}

try {
  {
    const { db, plan } = await prepararEntorno();

    const final = await ejecutarMigracionFirestore({
      db,
      plan,
    });

    assert.equal(final.estado, "PREPARADO");
    assert.equal(await contar(db, "horarios", 2027), 2);
    assert.equal(
      await contar(db, "asignaciones_docentes", 2027),
      1
    );

    const horario = await getDoc(
      doc(db, "horarios", plan.horarios[0].id)
    );

    assert.equal(
      horario.data().asignacionId,
      plan.asignaciones[0].id
    );

    console.log("OK 1 | Migracion completa y vinculos correctos");

    assert.equal(await contar(db, "horarios", 2026), 2);

    assert.equal(
      await contar(db, "asignaciones_docentes", 2026),
      1
    );

    const ciclo = await getDoc(
      doc(db, "configuracion_institucional", "ciclo_lectivo")
    );

    assert.equal(ciclo.data().cicloVigente, 2026);

    console.log("OK 2 | Origen y ciclo vigente conservados");

    await assert.rejects(
      ejecutarMigracionFirestore({ db, plan })
    );

    console.log("OK 3 | No repite migracion preparada");
  }

  {
    const { db, plan } = await prepararEntorno(101);

    await assert.rejects(
      ejecutarMigracionFirestore({
        db,
        plan,
        informar: cantidad => {
          if (cantidad >= 100) {
            throw new Error("Interrupcion simulada");
          }
        },
      }),
      /Interrupcion simulada/
    );

    const estado = await consultarEstadoMigracion(db, 2027);

    assert.equal(estado.estado, "EN_PROCESO");

    assert.equal(await contar(db, "horarios", 2027), 99);

    const final = await ejecutarMigracionFirestore({
      db,
      plan,
    });

    assert.equal(final.estado, "PREPARADO");
    assert.equal(await contar(db, "horarios", 2027), 101);

    console.log("OK 4 | Recuperacion sin duplicaciones");
  }

  {
    const { db, plan } = await prepararEntorno();

    await setDoc(doc(db, "horarios", "ajeno"), {
      cicloLectivo: 2027,
      estado: "ACTIVO",
    });

    await assert.rejects(
      ejecutarMigracionFirestore({ db, plan }),
      /registros previos/
    );

    assert.equal(await contar(db, "horarios", 2027), 1);

    console.log("OK 5 | Proteccion de registros ajenos");
  }

  {
    const { db, plan } = await prepararEntorno();

    await assert.rejects(
      ejecutarMigracionFirestore({
        db,
        plan,
        informar: cantidad => {
          if (cantidad > 0) {
            throw new Error("Interrupcion simulada");
          }
        },
      })
    );

    plan.horarios[0].datos.horaInicio = "10:00";

    await assert.rejects(
      ejecutarMigracionFirestore({ db, plan }),
      /no coincide/
    );

    console.log("OK 6 | Rechaza cambios en el plan");
  }


  {
    const { db, plan } = await prepararEntorno();

    await assert.rejects(
      activarCicloFirestore(db, 2026, 2027)
    );

    console.log("OK 7 | No activa destino sin preparar");

    await ejecutarMigracionFirestore({ db, plan });

    const referencia = doc(
      db, "horarios", plan.horarios[0].id
    );

    await setDoc(
      referencia,
      { docenteCorreo: "incorrecto@pruebas.invalid" },
      { merge: true }
    );

    await assert.rejects(
      activarCicloFirestore(db, 2026, 2027),
      /Horario sin asignación válida/
    );

    console.log("OK 8 | Rechaza horarios inconsistentes");

    await setDoc(
      referencia,
      {
        docenteCorreo: docente,
        horaInicio: "10:00",
        horaFin: "11:00",
      },
      { merge: true }
    );

    const destino = await activarCicloFirestore(
      db, 2026, 2027
    );

    assert.equal(destino, 2027);

    const ciclo = await getDoc(
      doc(
        db,
        "configuracion_institucional",
        "ciclo_lectivo"
      )
    );

    assert.equal(ciclo.data().cicloVigente, 2027);

    const horario = await getDoc(referencia);

    assert.equal(horario.data().horaInicio, "10:00");

    console.log("OK 9 | Activa ciclo con horarios editados");

    assert.equal(await contar(db, "horarios", 2026), 2);
    assert.equal(await contar(db, "horarios", 2027), 2);

    assert.equal(
      await contar(db, "asignaciones_docentes", 2026),
      1
    );

    assert.equal(
      await contar(db, "asignaciones_docentes", 2027),
      1
    );

    console.log("OK 10 | Activacion conserva ambos ciclos");

    await assert.rejects(
      activarCicloFirestore(db, 2026, 2027)
    );

    console.log("OK 11 | No permite repetir activacion");
  }


  {
    const {
      consultarLimpiezaCiclo,
      eliminarCicloAnterior
    } = await import(
      "../../assets/js/limpieza-ciclo-firestore.js"
    );

    const { db, plan } = await prepararEntorno();

    await assert.rejects(consultarLimpiezaCiclo(db, 2026));
    await assert.rejects(consultarLimpiezaCiclo(db, 2027));

    console.log("OK 12 | Protege ciclo vigente y futuro");

    await ejecutarMigracionFirestore({ db, plan });
    await activarCicloFirestore(db, 2026, 2027);

    await env.withSecurityRulesDisabled(async ctx => {
      const base = ctx.firestore();

      for (const nombre of [
        "reemplazos_docentes",
        "asistencias_clases",
        "calificaciones_taller",
        "mesas_examen"
      ]) {
        for (const ciclo of [2026, 2027]) {
          await setDoc(doc(base, nombre, String(ciclo)), {
            cicloLectivo: ciclo,
            estado: "ACTIVO"
          });
        }
      }
    });

    const revision = await consultarLimpiezaCiclo(db, 2026);
    assert.equal(revision.resumen.total, 4);
    assert.equal(revision.resumen.reemplazos, 1);

    console.log("OK 13 | Revisa las tres colecciones operativas");

    await assert.rejects(
      eliminarCicloAnterior(db, 2026, "huella incorrecta")
    );

    assert.equal(await contar(db, "horarios", 2026), 2);

    console.log("OK 14 | Rechaza una revision desactualizada");

    assert.equal(
      await eliminarCicloAnterior(db, 2026, revision.huella),
      4
    );

    for (const nombre of [
      "horarios",
      "asignaciones_docentes",
      "reemplazos_docentes"
    ]) {
      assert.equal(await contar(db, nombre, 2026), 0);
      assert.ok(await contar(db, nombre, 2027) > 0);
    }

    console.log("OK 15 | Elimina solo registros operativos anteriores");

    for (const nombre of [
      "asistencias_clases",
      "calificaciones_taller",
      "mesas_examen"
    ]) {
      assert.equal(await contar(db, nombre, 2026), 1);
      assert.equal(await contar(db, nombre, 2027), 1);
    }

    console.log("OK 16 | Conserva registros academicos");

    const vacio = await consultarLimpiezaCiclo(db, 2026);
    assert.equal(vacio.resumen.total, 0);

    assert.equal(
      await eliminarCicloAnterior(db, 2026, vacio.huella),
      0
    );

    console.log("OK 17 | Limpieza repetible sin efectos adicionales");
  }

  console.log("INTEGRACION SUPERADA: 17 verificaciones.");


} finally {
  await env.cleanup();
}
