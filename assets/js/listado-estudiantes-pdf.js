/* E.E.T.P. N.º 495: listado imprimible de estudiantes, Soporte / Gestión.
 * Sólo lectura, a demanda, usando los permisos existentes de Firestore. */
import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { collection, doc, getDocFromServer, getDocsFromServer, getFirestore, query, where }
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const cfg = {
  apiKey:"AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain:"portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId:"portal-institucional-eet-fa5c7",
  storageBucket:"portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId:"658183549494",
  appId:"1:658183549494:web:84fe7da91b1ea8990f1e97",
};
const app = getApps().length ? getApp() : initializeApp(cfg);
const db = getFirestore(app), auth = getAuth(app);
const boton = document.getElementById("btnGenerarListadoEstudiantes") ||
              document.getElementById("btnGenerarListadoEstudiantesGestion");
const TODOS = "__TODOS_LOS_CURSOS__";
const coll = new Intl.Collator("es",{sensitivity:"base",numeric:true});
const mayus = x => String(x || "").trim().toUpperCase();

function esc(x) {
  return String(x ?? "").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
function dni(x) {
  const n = String(x ?? "").replace(/\D/g,"");
  return /^[0-9]{7,8}$/.test(n) ? n : "";
}
function letra(x) {
  const c = String(x || "").trim().charAt(0).toLocaleUpperCase("es");
  if(c==="Ñ") return "Ñ";
  const n = c.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  return /^[A-Z]$/.test(n)?n:"#";
}
function ordenarCursos(cursos) {
  return [...cursos].sort((a,b)=>
    Number(a.anio||0)-Number(b.anio||0) ||
    coll.compare(String(a.division||""),String(b.division||"")) ||
    coll.compare(String(a.nombre||""),String(b.nombre||"")));
}
function alumnoVigente(a) {
  return mayus(a.rol)==="ALUMNO" && mayus(a.estado)==="ACTIVO" &&
    !["BAJA","CURSADA_COMPLETA"].includes(mayus(a.tipoVinculo)) &&
    Boolean(String(a.nombreCompleto||"").trim());
}
function filas(lista) {
  const nombres=[...lista].sort((a,b)=>coll.compare(a.nombreCompleto||"",b.nombreCompleto||"")||
    coll.compare(a.correo||"",b.correo||""));
  const letras=new Map();
  nombres.forEach(a=>{
    const l=letra(a.nombreCompleto);
    if(!letras.has(l))letras.set(l,[]);
    letras.get(l).push(a);
  });
  return [...letras.entries()].sort(([a],[b])=>coll.compare(a,b))
    .map(([l,items])=>'<tbody><tr class="letra"><th colspan="3" scope="rowgroup">'+esc(l)+'</th></tr>'+
      items.map(a=>'<tr><td class="nombre">'+esc(a.nombreCompleto)+
        '</td><td class="dni">'+esc(dni(a.dni))+'</td><td class="correo">'+
        esc(a.correo||"")+'</td></tr>').join("")+'</tbody>').join("");
}
function htmlListado(cursos, alumnos, todos) {
  const ordenados=ordenarCursos(cursos);
  const porCurso=new Map(ordenados.map(c=>[c.id,[]]));
  alumnos.forEach(a=>{const id=String(a.cursoId||"").trim();if(porCurso.has(id))porCurso.get(id).push(a)});
  const conAlumnos=ordenados.filter(c=>porCurso.get(c.id).length>0);
  const cantidad=conAlumnos.reduce((n,c)=>n+porCurso.get(c.id).length,0);
  const logo=new URL("../assets/img/logo.png",window.location.href).href;
  const fecha=new Intl.DateTimeFormat("es-AR",{
    day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"
  }).format(new Date());
  // Un encabezado institucional por curso; en "Todos" cada uno comienza en nueva hoja.
  const tabla = c => {
    const lista = porCurso.get(c.id);
    const cantidadCurso = lista.length;
    // Ajuste progresivo para que cursos numerosos aprovechen una sola hoja A4.
    const densidad = cantidadCurso > 55 ? " ultra-compacto" :
      cantidadCurso > 44 ? " muy-compacto" :
      cantidadCurso > 32 ? " compacto" : "";
    const faltantesCurso = lista.filter(a => !dni(a.dni)).length;
    return '<section class="curso' + densidad + '">' +
      '<header><img src="' + esc(logo) + '" alt="Escudo E.E.T.P. N.º 495">' +
      '<div><h1>E.E.T.P. N.º 495 “Malvinas Argentinas”</h1>' +
      '<p>Listado de estudiantes · <strong>Curso: ' + esc(c.nombre || c.id) +
      '</strong> · ' + cantidadCurso + ' estudiantes activos' +
      '<br>Generado el ' + esc(fecha) + '</p></div></header>' +
      '<div class="desplazamiento"><table>' +
      '<colgroup><col class="nombre"><col class="dni"><col class="correo"></colgroup>' +
      '<thead><tr><th>APELLIDO Y NOMBRE</th><th>DNI</th><th>CORREO</th></tr></thead>' +
      filas(lista) + '</table></div>' +
      (faltantesCurso ? '<p class="aviso">DNI pendientes de completar: ' + faltantesCurso + '.</p>' : '') +
      '<footer>Uso interno institucional · Datos personales: distribuir solo a personal autorizado.</footer>' +
      '</section>';
  };
  const estilos=[
    ":root{color-scheme:light}*{box-sizing:border-box}",
    "body{margin:0;background:#eff4fa;color:#173b60;font-family:Arial,Helvetica,sans-serif}",
    ".barra{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#083d79;color:white;padding:13px 20px}",
    ".barra button{border:0;border-radius:8px;background:white;color:#083d79;padding:10px 14px;font-weight:bold;cursor:pointer}",
    "main{max-width:210mm;margin:18px auto;padding:11mm;background:white;box-shadow:0 5px 22px #0002}",
    "header{display:flex;align-items:center;gap:10px;border-bottom:2px solid #0b4f9c;padding-bottom:7px;margin-bottom:9px}",
    "header img{width:39px;height:39px;object-fit:contain}",
    "h1{font-size:16px;color:#083d79;margin:0 0 4px}",
    "header p{font-size:10px;color:#476680;margin:0;line-height:1.4}",
    ".curso{margin:0 0 16px}.curso + .curso{margin-top:18px}",
    ".curso small{font-size:11px;font-weight:normal}",
    ".desplazamiento{overflow-x:auto}table{width:100%;min-width:680px;border-collapse:collapse;table-layout:fixed}",
    "col.nombre{width:43%}col.dni{width:16%}col.correo{width:41%}",
    "thead th{border:1px solid #8ea9be;background:#dfeefa;color:#073683;font-size:11px;text-align:left;padding:7px}",
    ".letra th{border:1px solid #8ea9be;background:#eef5fb;color:#105c9d;text-align:left;padding:4px 7px;font-size:12px}",
    "tbody td{border:1px solid #adbdca;height:7mm;padding:4px 6px;vertical-align:middle;font-size:11.5px;line-height:1.2}",
    "td.nombre{font-weight:bold;overflow-wrap:anywhere}td.dni{white-space:nowrap}td.correo{font-size:10.5px;overflow-wrap:anywhere}",
    "footer,.aviso{margin-top:6px;font-size:9px;color:#516c82}",
    ".curso.compacto tbody td{height:5.5mm;padding:2px 5px;font-size:10.5px}.curso.compacto .letra th{padding:2px 5px;font-size:11px}.curso.compacto td.correo{font-size:9.8px}",
    ".curso.muy-compacto tbody td{height:4.7mm;padding:1px 4px;font-size:10px}.curso.muy-compacto .letra th{padding:1px 4px;font-size:10px}.curso.muy-compacto td.correo{font-size:9.3px}",
    ".curso.ultra-compacto tbody td{height:4mm;padding:0 4px;font-size:9.3px}.curso.ultra-compacto .letra th{padding:1px 3px;font-size:9px}.curso.ultra-compacto td.correo{font-size:8.8px}",
    "@page{size:A4 portrait;margin:9mm 10mm}",
    "@media print{body{background:white}.barra{display:none}main{max-width:none;margin:0;padding:0;box-shadow:none}.desplazamiento{overflow:visible}table{width:100%;min-width:0}thead{display:table-header-group}tbody{display:table-row-group}tr{break-inside:avoid;page-break-inside:avoid}.letra{break-after:avoid;page-break-after:avoid}.curso header{break-after:avoid;page-break-after:avoid}main.todos .curso + .curso{break-before:page;page-break-before:always}.curso{margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}",
    "@media screen and (max-width:700px){.barra{flex-direction:column;align-items:stretch}main{margin:10px;padding:16px}}"
  ].join("");
  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>Listado de estudiantes - '+esc(todos ? "Todos los cursos" : (ordenados[0]?.nombre || "Curso"))+'</title><style>'+estilos+'</style></head><body>',
    '<div class="barra"><strong>Listado de estudiantes</strong><button type="button" onclick="window.print()">Imprimir / Guardar PDF</button></div>',
    '<main class="' + (todos ? 'todos' : 'individual') + '">',
    conAlumnos.map(tabla).join(""),
    '</main></body></html>'
  ].join("\n");
}
async function autorizado() {
  const user=auth.currentUser;
  if(!user?.email)return false;
  const snap=await getDocFromServer(doc(db,"usuarios",user.email.toLowerCase()));
  if(!snap.exists())return false;
  const p=snap.data(),roles=[p.rol,...(Array.isArray(p.roles)?p.roles:[])].map(mayus);
  let activo="";
  try{activo=mayus(sessionStorage.getItem("rolActivoPortal"))}catch(_){}
  if(!activo && roles.length===1)activo=roles[0];
  const gestion=window.location.pathname.startsWith("/gestion/");
  const permitidos=gestion?["DIRECCION","SECRETARIA","ASISTENTE_ADMINISTRATIVO","PRECEPTORIA"]:["SOPORTE"];
  return mayus(p.estado)==="ACTIVO" && roles.includes(activo) && permitidos.includes(activo);
}
async function alHacerClic() {
  if(!boton||!window.Swal)return;
  const original=boton.innerHTML;
  boton.disabled=true;
  try{
    if(!(await autorizado())){
      await window.Swal.fire({icon:"warning",title:"Acceso no autorizado",
        text:"Tu perfil no puede generar este listado.",confirmButtonText:"Aceptar"});
      return;
    }
    window.Swal.fire({title:"Listado de estudiantes",text:"Consultando cursos...",
      allowOutsideClick:false,allowEscapeKey:false,showConfirmButton:false,
      didOpen:()=>window.Swal.showLoading()});
    const resultados=await getDocsFromServer(collection(db,"cursos"));
    const cursos=ordenarCursos(resultados.docs.map(d=>({id:d.id,...d.data()}))
      .filter(c=>mayus(c.estado||"ACTIVO")==="ACTIVO"));
    window.Swal.close();
    if(!cursos.length){
      await window.Swal.fire({icon:"info",title:"Sin cursos",
        text:"No hay cursos activos registrados.",confirmButtonText:"Aceptar"});
      return;
    }
    const opciones={ [TODOS]:"TODOS LOS CURSOS",
      ...Object.fromEntries(cursos.map(c=>[c.id,String(c.nombre||c.id)])) };
    const respuesta=await window.Swal.fire({
      title:"Listado de estudiantes",text:"Elegí un curso o todos los cursos.",
      input:"select",inputOptions:opciones,inputPlaceholder:"Seleccionar curso",
      showCancelButton:true,confirmButtonText:"Generar PDF",cancelButtonText:"Cancelar",
      returnFocus:false,
      preConfirm:()=>{
        const id=String(window.Swal.getInput()?.value||"").trim();
        if(!id || (id!==TODOS && !cursos.some(c=>c.id===id))){
          window.Swal.showValidationMessage("Seleccioná un curso o Todos los cursos.");
          return false;
        }
        const ventana=window.open("","_blank");
        if(!ventana){
          window.Swal.showValidationMessage("Permití las ventanas emergentes para generar el PDF.");
          return false;
        }
        ventana.document.write('<!doctype html><html lang="es"><meta charset="utf-8"><title>Preparando listado</title><body style="font-family:Arial;padding:24px">Preparando el listado...</body></html>');
        ventana.document.close();
        return {id,ventana};
      }
    });
    if(!respuesta.isConfirmed||!respuesta.value)return;
    const {id,ventana}=respuesta.value;
    const todos=id===TODOS;
    try{
      // Misma consulta de rol ALUMNO que usa el listado existente de Gestión:
      // permite la evaluación de reglas Firestore sin índices compuestos.
      const consulta=await getDocsFromServer(query(
        collection(db,"usuarios"),where("rol","==","ALUMNO")
      ));
      const elegidos=todos?cursos:cursos.filter(c=>c.id===id);
      const ids=new Set(elegidos.map(c=>c.id));
      const alumnos=consulta.docs.map(d=>d.data()).filter(a=>
        alumnoVigente(a) && ids.has(String(a.cursoId||"").trim()));
      if(!alumnos.length){
        if(!ventana.closed)ventana.close();
        await window.Swal.fire({icon:"info",title:"Sin estudiantes",
          text:"No hay estudiantes activos asignados al curso o cursos elegidos.",
          confirmButtonText:"Aceptar"});
        return;
      }
      if(!ventana.closed){
        ventana.document.open();
        ventana.document.write(htmlListado(elegidos,alumnos,todos));
        ventana.document.close();
        ventana.focus();
      }
    }catch(err){
      console.error("Error al preparar listado PDF:",err);
      if(!ventana.closed){
        ventana.document.open();
        ventana.document.write('<!doctype html><html lang="es"><meta charset="utf-8"><title>Error</title><body style="font-family:Arial;padding:24px">No se pudo generar el listado. Revisá el aviso en el portal.</body></html>');
        ventana.document.close();
      }
      await window.Swal.fire({icon:"error",title:"No se pudo generar el listado",
        text:"Revisá tu conexión y los permisos de Firestore.",confirmButtonText:"Aceptar"});
    }
  }catch(err){
    console.error("Error al preparar listado PDF:",err);
    window.Swal?.close();
    await window.Swal?.fire({icon:"error",title:"Error al consultar cursos",
      text:"Revisá tu conexión y los permisos de acceso.",confirmButtonText:"Aceptar"});
  }finally{
    boton.disabled=false;
    boton.innerHTML=original;
  }
}
if(boton)boton.addEventListener("click",alHacerClic);
