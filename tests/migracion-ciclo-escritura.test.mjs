import test from "node:test";
import assert from "node:assert/strict";

import {
  calcularHuellaPlan,
  organizarEscrituras,
  identificarPendientes,
  ejecutarLotes,
} from "../assets/js/migracion-ciclo-escritura.mjs";

function plan() {
  return {
    destino: 2027,
    asignaciones: Array.from({ length: 267 }, (_, i) => ({
      id: `a${i}`,
      datos: { cicloLectivo: 2027 },
    })),
    horarios: Array.from({ length: 828 }, (_, i) => ({
      id: `h${i}`,
      datos: { cicloLectivo: 2027 },
    })),
  };
}

test("organiza los 1095 documentos en tres lotes", () => {
  const lotes = organizarEscrituras(plan());
  assert.deepEqual(
    lotes.map(l => l.length),
    [450, 450, 195]
  );
});

test("las asignaciones preceden a los horarios", () => {
  const registros = organizarEscrituras(plan()).flat();

  assert.equal(
    registros[266].coleccion,
    "asignaciones_docentes"
  );

  assert.equal(registros[267].coleccion, "horarios");
});

test("rechaza lotes demasiado grandes", () => {
  assert.throws(() => organizarEscrituras(plan(), 501));
});

test("rechaza documentos duplicados", () => {
  const p = plan();
  p.horarios.push(p.horarios[0]);
  assert.throws(() => organizarEscrituras(p));
});

test("rechaza documentos de otro ciclo", () => {
  const p = plan();
  p.horarios[0].datos.cicloLectivo = 2026;
  assert.throws(() => organizarEscrituras(p));
});

test("identifica los documentos pendientes", () => {
  const registros = organizarEscrituras(plan()).flat();

  const existentes = registros.slice(0, 450).map(r => ({
    ...r,
    datos: {
      ...r.datos,
      migracionCicloId: "prueba",
    },
  }));

  const pendientes = identificarPendientes(
    registros,
    existentes,
    "prueba"
  );

  assert.equal(pendientes.length, 645);
});

test("bloquea documentos de otra migración", () => {
  const registros = organizarEscrituras(plan()).flat();

  assert.throws(() => identificarPendientes(
    registros,
    [registros[0]],
    "prueba"
  ));
});

test("bloquea documentos inesperados en el destino", () => {
  const registros = organizarEscrituras(plan()).flat();

  assert.throws(() => identificarPendientes(
    registros,
    [{
      coleccion: "horarios",
      id: "externo",
      datos: { migracionCicloId: "prueba" },
    }],
    "prueba"
  ));
});

test("ejecuta los lotes en orden", async () => {
  const progreso = [];

  const total = await ejecutarLotes({
    lotes: organizarEscrituras(plan()),
    escribir: async () => {},
    informar: n => progreso.push(n),
  });

  assert.equal(total, 1095);
  assert.deepEqual(progreso, [450, 900, 1095]);
});

test("detiene la escritura ante una interrupción", async () => {
  let llamadas = 0;
  const progreso = [];

  await assert.rejects(ejecutarLotes({
    lotes: organizarEscrituras(plan()),
    escribir: async () => {
      llamadas++;

      if (llamadas === 2) {
        throw new Error("Interrupción simulada");
      }
    },
    informar: n => progreso.push(n),
  }));

  assert.equal(llamadas, 2);
  assert.deepEqual(progreso, [450]);
});

test("una migración completa no tiene pendientes", () => {
  const registros = organizarEscrituras(plan()).flat();

  const existentes = registros.map(r => ({
    ...r,
    datos: {
      ...r.datos,
      migracionCicloId: "prueba",
    },
  }));

  assert.equal(
    identificarPendientes(
      registros,
      existentes,
      "prueba"
    ).length,
    0
  );
});


function planConOrigen() {
  return { ...plan(), origen: 2026 };
}

test("genera una huella SHA-256 válida", async () => {
  const huella = await calcularHuellaPlan(planConOrigen());
  assert.match(huella, /^[a-f0-9]{64}$/);
});

test("la misma migración conserva su huella", async () => {
  assert.equal(
    await calcularHuellaPlan(planConOrigen()),
    await calcularHuellaPlan(planConOrigen())
  );
});

test("el orden de los registros no altera la huella", async () => {
  const p = planConOrigen();
  const original = await calcularHuellaPlan(p);

  p.asignaciones.reverse();
  p.horarios.reverse();

  assert.equal(await calcularHuellaPlan(p), original);
});

test("un horario modificado altera la huella", async () => {
  const p = planConOrigen();
  const original = await calcularHuellaPlan(p);

  p.horarios[0].datos.horaInicio = "08:00";

  assert.notEqual(await calcularHuellaPlan(p), original);
});

test("una asignación modificada altera la huella", async () => {
  const p = planConOrigen();
  const original = await calcularHuellaPlan(p);

  p.asignaciones[0].datos.docenteCorreo = "prueba@example.org";

  assert.notEqual(await calcularHuellaPlan(p), original);
});

test("rechaza un documento migrado modificado", () => {
  const registros = organizarEscrituras(plan()).flat();

  const existente = {
    ...registros[0],
    datos: {
      ...registros[0].datos,
      migracionCicloId: "prueba",
      docenteCorreo: "otro@example.org",
    },
  };

  assert.throws(() => identificarPendientes(
    registros,
    [existente],
    "prueba"
  ), /fue modificado/);
});

test("el orden de los campos no altera la huella", async () => {
  const p = planConOrigen();

  p.horarios[0].datos = {
    cicloLectivo: 2027,
    horaInicio: "08:00",
  };

  const original = await calcularHuellaPlan(p);

  p.horarios[0].datos = {
    horaInicio: "08:00",
    cicloLectivo: 2027,
  };

  assert.equal(await calcularHuellaPlan(p), original);
});

test("detecta diferencias de nanosegundos en timestamps", async () => {
  const p = planConOrigen();

  p.horarios[0].datos.creadoEn = {
    seconds: 100,
    nanoseconds: 1,
    toDate() { return new Date(100000); },
  };

  const original = await calcularHuellaPlan(p);

  p.horarios[0].datos.creadoEn.nanoseconds = 2;

  assert.notEqual(await calcularHuellaPlan(p), original);
});
