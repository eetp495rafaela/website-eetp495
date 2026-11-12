'use strict';
/* Pruebas locales con identidades ficticias. NO conectar a producción. */
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, collection, query, where, getDoc, getDocs, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('ERROR: ejecutar con firebase emulators:exec --only firestore.'); process.exit(2);
}
const [host, portText] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
const port = Number(portText);
if (!host || !Number.isInteger(port) || port < 1) process.exit(2);

async function main() {
  const rules = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
  const env = await initializeTestEnvironment({
    projectId: 'portal-institucional-eet-fa5c7', firestore: { host, port, rules }
  });
  const e = {
    a:'apoyo1@pruebas.invalid', b:'apoyo2@pruebas.invalid',
    off:'apoyoinactivo@pruebas.invalid', multi:'apoyomultirol@pruebas.invalid',
    sop:'soporte@pruebas.invalid', doc:'docente@pruebas.invalid',
    s1:'alumna1@pruebas.invalid', s2:'alumno2@pruebas.invalid',
    s3:'alumna3@pruebas.invalid'
  };
  let count = 0;
  const run = async (name, promise) => {
    await promise(); count++;
    console.log('  OK ' + String(count).padStart(2,'0') + ' | ' + name);
  };
  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => {
      const db = ctx.firestore();
      const profiles = [
        [e.a,'DOCENTE_APOYO','ACTIVO',['DOCENTE_APOYO']],
        [e.b,'DOCENTE_APOYO','ACTIVO',['DOCENTE_APOYO']],
        [e.off,'DOCENTE_APOYO','INACTIVO',['DOCENTE_APOYO']],
        [e.multi,'DOCENTE_APOYO','ACTIVO',['DOCENTE_APOYO','DOCENTE']],
        [e.sop,'SOPORTE','ACTIVO',['SOPORTE']],
        [e.doc,'DOCENTE','ACTIVO',['DOCENTE']],
        [e.s1,'ALUMNO','ACTIVO',['ALUMNO']],
        [e.s2,'ALUMNO','ACTIVO',['ALUMNO']],
        [e.s3,'ALUMNO','ACTIVO',['ALUMNO']]
      ];
      for (const [email,rol,estado,roles] of profiles) {
        await setDoc(doc(db,'usuarios',email),{correo:email,rol,estado,roles,cursoId:'1A'});
      }
      for (const [id,teacher,student,status] of [
        ['v1',e.a,e.s1,'ACTIVO'],['v2',e.a,e.s2,'ACTIVO'],
        ['v3',e.b,e.s3,'ACTIVO'],['v4',e.a,e.s3,'INACTIVO'],
        ['v5',e.off,e.s1,'ACTIVO'],['v6',e.multi,e.s1,'ACTIVO']
      ]) {
        await setDoc(doc(db,'apoyos_estudiantes',id),{
          docenteCorreo:teacher,alumnoCorreo:student,estado:status
        });
      }
      await setDoc(doc(db,'horarios','activo'),{estado:'ACTIVO'});
      await setDoc(doc(db,'horarios','inactivo'),{estado:'INACTIVO'});
      await setDoc(doc(db,'referentes_institucionales','activo'),{estado:'ACTIVO'});
      await setDoc(doc(db,'referentes_institucionales','inactivo'),{estado:'INACTIVO'});
      await setDoc(doc(db,'asistencias_clases','clase'),{
        estado:'ACTIVA',docenteCorreo:e.doc,cursoId:'1A',
        alumnos:[{correo:e.s1,estado:'PRESENTE'},{correo:e.s3,estado:'AUSENTE'}]
      });
    });
    const as = email => env.authenticatedContext('uid-'+email,{email,email_verified:true}).firestore();
    const a=as(e.a), b=as(e.b), off=as(e.off), multi=as(e.multi);
    const sop=as(e.sop), teacher=as(e.doc), anon=env.unauthenticatedContext().firestore();
    const d=(db,c,id)=>doc(db,c,id);
    const allow=(name,p)=>run(name,()=>assertSucceeds(p));
    const deny=(name,p)=>run(name,()=>assertFails(p));
    console.log('Probando reglas de DOCENTE_APOYO (datos ficticios):');
    await allow('Lee vínculo propio 1', getDoc(d(a,'apoyos_estudiantes','v1')));
    await allow('Lee vínculo propio 2, otro alumno', getDoc(d(a,'apoyos_estudiantes','v2')));
    await deny('No lee vínculo de otro apoyo', getDoc(d(a,'apoyos_estudiantes','v3')));
    await deny('No lee vínculo propio inactivo', getDoc(d(a,'apoyos_estudiantes','v4')));
    await run('Consulta filtrada lista solo sus dos vínculos',async()=>{
      const snap=await assertSucceeds(getDocs(query(collection(a,'apoyos_estudiantes'),
        where('docenteCorreo','==',e.a),where('estado','==','ACTIVO'))));
      if (snap.size!==2) throw new Error('Se esperaban 2 vínculos; recibidos: '+snap.size);
    });
    await deny('No lista vínculos sin filtros',getDocs(collection(a,'apoyos_estudiantes')));
    await deny('No consulta vínculos de otro docente',getDocs(query(collection(a,'apoyos_estudiantes'),
      where('docenteCorreo','==',e.b),where('estado','==','ACTIVO'))));
    await allow('Otro apoyo lee solo su propio vínculo',getDoc(d(b,'apoyos_estudiantes','v3')));
    await deny('Cuenta de apoyo inactiva rechazada',getDoc(d(off,'apoyos_estudiantes','v5')));
    await deny('Apoyo con multirrol rechazado',getDoc(d(multi,'apoyos_estudiantes','v6')));
    await deny('Docente tradicional no accede a vínculos',getDoc(d(teacher,'apoyos_estudiantes','v1')));
    await deny('Sin autenticación no accede a vínculos',getDoc(d(anon,'apoyos_estudiantes','v1')));
    await allow('Soporte puede consultar vínculos',getDoc(d(sop,'apoyos_estudiantes','v3')));
    await deny('Apoyo no puede crear vínculo',setDoc(d(a,'apoyos_estudiantes','nuevo'),
      {docenteCorreo:e.a,alumnoCorreo:e.s3,estado:'ACTIVO'}));
    await deny('Apoyo no puede modificar vínculo',updateDoc(d(a,'apoyos_estudiantes','v1'),
      {estado:'INACTIVO'}));
    await deny('Apoyo no puede eliminar vínculo',deleteDoc(d(a,'apoyos_estudiantes','v1')));
    await deny('Soporte navegador tampoco puede escribir vínculos',updateDoc(d(sop,'apoyos_estudiantes','v1'),
      {estado:'INACTIVO'}));
    await allow('Apoyo ve horarios activos',getDoc(d(a,'horarios','activo')));
    await deny('Apoyo no ve horarios inactivos',getDoc(d(a,'horarios','inactivo')));
    await deny('Apoyo no edita horarios',updateDoc(d(a,'horarios','activo'),{estado:'INACTIVO'}));
    await allow('Apoyo ve referente activo',getDoc(d(a,'referentes_institucionales','activo')));
    await deny('Apoyo no ve referente inactivo',getDoc(d(a,'referentes_institucionales','inactivo')));
    await deny('Apoyo no consulta fichas de alumnos directamente',getDoc(d(a,'usuarios',e.s1)));
    await deny('Apoyo no lee asistencia de curso completa',getDoc(d(a,'asistencias_clases','clase')));
    await deny('Apoyo no edita asistencia de curso',updateDoc(d(a,'asistencias_clases','clase'),
      {estado:'INACTIVA'}));
    console.log('\nPRUEBAS SUPERADAS: '+count+' verificaciones.');
  } finally {
    await env.cleanup();
  }
}
main().catch(err=>{console.error('\nPRUEBA FALLIDA:',err?.message||err);process.exitCode=1;});
