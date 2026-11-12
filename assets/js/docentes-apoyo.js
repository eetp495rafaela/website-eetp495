/*
 * Portal Docentes de Apoyo.
 * Seguridad: el navegador NO determina qué informes ni registros Si.R.A.
 * puede consultar. Esas autorizaciones deben verificarse en Apps Script.
 */
import {getApp,getApps,initializeApp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {getFirestore,collection,getDocs,query,where} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig={
  apiKey:"AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA",
  authDomain:"portal-institucional-eet-fa5c7.firebaseapp.com",
  projectId:"portal-institucional-eet-fa5c7",
  storageBucket:"portal-institucional-eet-fa5c7.firebasestorage.app",
  messagingSenderId:"658183549494",
  appId:"1:658183549494:web:84fe7da91b1ea8990f1e97"
};
const URL_BACKEND_INFORMES="https://script.google.com/macros/s/AKfycbwiPaqdCFtfChD_b0xUDOF4zqhbOs_WJ45aVBHW9kn6hnbRTGEp93A4mp2W0r0v7pXt4w/exec";
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);
let perfil=null;

const correoNormalizado=v=>String(v||"").trim().toLowerCase();
const textoSeguro=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
function mostrar(id,contenido,clase=""){const el=document.getElementById(id);if(el){el.className=clase;el.innerHTML=contenido;}}
function mensaje(id,texto,esError=false){mostrar(id,'<p class="mensaje '+(esError?'error':'')+'">'+textoSeguro(texto)+'</p>');}
function asegurarSesion(){
  const usuario=auth.currentUser;
  if(!usuario || !perfil || perfil.rol!=="DOCENTE_APOYO" || correoNormalizado(perfil.correo)!==correoNormalizado(usuario.email)){
    throw new Error("Tu sesión no está autorizada para consultar esta información.");
  }
  return usuario;
}
async function vinculosActivos(){
  const usuario=asegurarSesion();
  const q=query(collection(db,"apoyos_estudiantes"),where("docenteCorreo","==",correoNormalizado(usuario.email)),where("estado","==","ACTIVO"));
  const snap=await getDocs(q);
  return snap.docs.map(d=>d.data()).sort((a,b)=>String(a.alumnoNombre||"").localeCompare(String(b.alumnoNombre||""),"es"));
}
async function consultarBackend(accion){
  const idToken=await asegurarSesion().getIdToken(true);
  const respuesta=await fetch(URL_BACKEND_INFORMES,{
    method:"POST",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({accion,idToken})
  });
  if(!respuesta.ok)throw new Error("No se pudo conectar con el sistema institucional.");
  const resultado=await respuesta.json();
  if(!resultado?.ok)throw new Error(resultado?.mensaje||"El servidor no autorizó esta consulta.");
  return resultado;
}
function urlSeguraDrive(url){
  try {
    const u=new URL(String(url||""));
    if(u.protocol!=="https:" || !["docs.google.com","drive.google.com"].includes(u.hostname))return "";
    return u.href;
  } catch {return "";}
}
async function ejecutarConBoton(id,fn){
  const btn=document.getElementById(id);
  if(btn)btn.disabled=true;
  try{await fn();}catch(error){
    const destino={btnCargarInformesApoyo:"resultadoInformesApoyo",btnCargarAsistenciaApoyo:"resultadoAsistenciaApoyo",btnCargarAgendaApoyo:"resultadoAgendaApoyo"}[id];
    mensaje(destino,error.message||"No se pudo completar la consulta.",true);
  }finally{if(btn)btn.disabled=false;}
}

async function cargarInformes(){
  mensaje("resultadoInformesApoyo","Consultando informes autorizados...");
  const resultado=await consultarBackend("listar_informes_docente_apoyo");
  const informes=Array.isArray(resultado.informes)?resultado.informes:[];
  if(!informes.length){mensaje("resultadoInformesApoyo","Por el momento no hay informes disponibles.");return;}
  const filas=informes.map(informe=>{
    const url=urlSeguraDrive(informe.driveUrl),link=url?'<a href="'+textoSeguro(url)+'" target="_blank" rel="noopener noreferrer">Ver documento</a>':"Sin enlace";
    return "<tr><td>"+textoSeguro(informe.alumnoNombre||"-")+"</td><td>"+textoSeguro(informe.cursoNombre||"-")+"</td><td>"+textoSeguro(informe.fechaCreacion||"-")+"</td><td>"+link+"</td></tr>";
  }).join("");
  mostrar("resultadoInformesApoyo",'<div class="tabla"><table><thead><tr><th>Estudiante</th><th>Curso</th><th>Fecha</th><th>Informe</th></tr></thead><tbody>'+filas+"</tbody></table></div>");
}

async function cargarAsistencia(){
  mensaje("resultadoAsistenciaApoyo","Consultando Si.R.A. de tus estudiantes...");
  // Nunca leer asistencias_clases desde el cliente: cada documento contiene
  // registros de todo un curso. El servidor debe devolver solo filas autorizadas.
  const resultado=await consultarBackend("listar_situacion_asistencia_apoyo");
  const registros=Array.isArray(resultado.estudiantes)?resultado.estudiantes:[];
  if(!registros.length){mensaje("resultadoAsistenciaApoyo","No hay registros de asistencia disponibles para tus estudiantes.");return;}
  const filas=registros.map(r=>"<tr><td>"+textoSeguro(r.nombre||r.alumnoNombre||"-")+"</td><td>"+textoSeguro(r.cursoNombre||"-")+"</td><td>"+textoSeguro(r.presentes??0)+"</td><td>"+textoSeguro(r.ausentes??0)+"</td><td>"+textoSeguro(r.tardanzas??0)+"</td><td>"+textoSeguro(r.porcentaje??"-")+" %</td></tr>").join("");
  mostrar("resultadoAsistenciaApoyo",'<div class="tabla"><table><thead><tr><th>Estudiante</th><th>Curso</th><th>P</th><th>A</th><th>T</th><th>% asistencia</th></tr></thead><tbody>'+filas+'</tbody></table></div><p class="mensaje">4 tardanzas equivalen a 1 falta. Los datos son de consulta y no pueden editarse.</p>');
}

/* Misma presentación de Agenda que el Portal Docentes.
 * Los filtros son locales sobre datos YA autorizados por Firestore y Apps Script.
 * Nunca se consulta /usuarios desde el navegador.
 */
let cacheDatosAgendaApoyo = null;
let promesaAgendaApoyo = null;
const categoriaAgendaApoyo = document.getElementById("categoriaAgendaApoyo");
const cursoAgendaApoyo = document.getElementById("cursoAgendaApoyo");
const buscarAgendaApoyo = document.getElementById("buscarAgendaApoyo");

const ordenarAgendaApoyo = (a,b) => String(a||"").localeCompare(String(b||""),"es",{numeric:true,sensitivity:"base"});
const normalizarBusquedaAgendaApoyo = v => String(v||"").trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es");

function cursoDeReferenciaApoyo(datos) {
  const nombre=String(datos.cursoNombre||datos.nombreCurso||"").trim();
  if(nombre) return nombre;
  const anio=Number(datos.cursoAnio||datos.anio||0);
  const division=String(datos.cursoDivision||datos.division||"").trim();
  return anio&&division ? anio+"° "+division : "";
}
function listaCursosContactoApoyo(datos) {
  const cursos=Array.isArray(datos.cursos) ? datos.cursos : [];
  const nom=cursoDeReferenciaApoyo(datos);
  return [...new Set([...cursos.map(x=>String(x||"").trim()),nom].filter(Boolean))];
}
function agruparContactosAgendaApoyo(registros, categoria) {
  const agrupados=new Map();
  registros.forEach(item=>{
    const correo=correoNormalizado(item.correo||item.email||item.alumnoCorreo);
    const nombre=String(item.nombre||item.nombreCompleto||item.alumnoNombre||"").trim()||"Sin nombre";
    const cargo=String(item.cargo||"").trim().toUpperCase();
    const clave=(correo||normalizarBusquedaAgendaApoyo(nombre))+"|"+(categoria==="ADMINISTRACION"?cargo:"");
    const cursos=listaCursosContactoApoyo(item);
    const espacios=Array.isArray(item.espacios)?item.espacios.map(x=>String(x||"").trim()).filter(Boolean):[];
    if(!agrupados.has(clave)) agrupados.set(clave,{nombre,correo,cargo,cursos:[],espacios:[]});
    const actual=agrupados.get(clave);
    cursos.forEach(c=>{if(!actual.cursos.includes(c))actual.cursos.push(c)});
    espacios.forEach(e=>{if(!actual.espacios.includes(e))actual.espacios.push(e)});
  });
  return [...agrupados.values()].sort((a,b)=>ordenarAgendaApoyo(a.nombre,b.nombre));
}
async function obtenerDatosAgendaApoyo() {
  if(cacheDatosAgendaApoyo) return cacheDatosAgendaApoyo;
  if(promesaAgendaApoyo) return promesaAgendaApoyo;
  promesaAgendaApoyo=(async()=>{
    asegurarSesion();
    const [vinculos,referentes,agenda]=await Promise.all([
      vinculosActivos(),
      getDocs(query(collection(db,"referentes_institucionales"),where("estado","==","ACTIVO"))),
      consultarBackend("listar_agenda_docente_apoyo")
    ]);
    const estudiantesServidor=Array.isArray(agenda.estudiantes)?agenda.estudiantes:null;
    // Compatibilidad con una versión anterior del GAS: vínculos propios (sin consulta global).
    const estudiantes=estudiantesServidor||vinculos.map(v=>({
      nombre:String(v.alumnoNombre||"").trim(),correo:correoNormalizado(v.alumnoCorreo),
      cursoNombre:cursoDeReferenciaApoyo(v)
    }));
    const resultado={
      ALUMNOS:agruparContactosAgendaApoyo(estudiantes,"ALUMNOS"),
      COLEGAS:agruparContactosAgendaApoyo(Array.isArray(agenda.colegas)?agenda.colegas:[],"COLEGAS"),
      ADMINISTRACION:agruparContactosAgendaApoyo(referentes.docs.map(d=>d.data()),"ADMINISTRACION")
    };
    cacheDatosAgendaApoyo=resultado;
    return resultado;
  })();
  try {return await promesaAgendaApoyo}
  finally {promesaAgendaApoyo=null}
}
function detalleContactoAgendaApoyo(contacto,categoria) {
  const cursos=[...contacto.cursos].sort(ordenarAgendaApoyo);
  if(categoria==="ADMINISTRACION"){
    const cargo=({"DIRECTORA":"Director/a","DIRECTOR":"Director/a","VICE_DIRECTORA":"Vice Director/a",
      "SECRETARIO":"Secretario/a","SECRETARIA":"Secretario/a","PRO_SECRETARIO":"Pro Secretario/a",
      "PRECEPTOR":"Preceptor/a","PRECEPTORA":"Preceptor/a","ASISTENTE_ADMINISTRATIVO":"Asistente Administrativo"})[contacto.cargo]||
      contacto.cargo||"Administración institucional";
    return cargo+((["PRECEPTOR","PRECEPTORA"].includes(contacto.cargo)&&cursos.length)?" · "+cursos.join(", "):"");
  }
  if(categoria==="COLEGAS") return contacto.espacios.length?contacto.espacios.sort(ordenarAgendaApoyo).join(" · "):cursos.join(" · ")||"Sin espacio asignado";
  return cursos.join(" · ")||"Curso sin informar";
}
function actualizarFiltroCursoAgendaApoyo() {
  const categoria=categoriaAgendaApoyo?.value||"";
  const conCurso=["COLEGAS","ALUMNOS"].includes(categoria);
  const anterior=cursoAgendaApoyo?.value||"";
  const cursos=conCurso&&cacheDatosAgendaApoyo?
    [...new Set((cacheDatosAgendaApoyo[categoria]||[]).flatMap(c=>c.cursos))].sort(ordenarAgendaApoyo):[];
  if(!cursoAgendaApoyo)return;
  cursoAgendaApoyo.replaceChildren(new Option("Todos los cursos",""),
    ...cursos.map(c=>new Option(c,c)));
  cursoAgendaApoyo.disabled=!conCurso||!cursos.length;
  if(cursos.includes(anterior))cursoAgendaApoyo.value=anterior;
}
function renderizarAgendaApoyo() {
  const categoria=categoriaAgendaApoyo?.value||"";
  if(!categoria){mensaje("resultadoAgendaApoyo","Seleccioná una categoría para consultar la agenda.");return}
  if(!cacheDatosAgendaApoyo){mensaje("resultadoAgendaApoyo","Cargando contactos...");return}
  const curso=["COLEGAS","ALUMNOS"].includes(categoria)?cursoAgendaApoyo?.value||"":"";
  const buscar=normalizarBusquedaAgendaApoyo(buscarAgendaApoyo?.value);
  const visibles=(cacheDatosAgendaApoyo[categoria]||[]).filter(c=>
    (!curso||c.cursos.includes(curso)) &&
    (!buscar||normalizarBusquedaAgendaApoyo(c.nombre).includes(buscar))
  );
  const titulos={COLEGAS:"Mis colegas docentes",ADMINISTRACION:"Administración institucional",ALUMNOS:"Mis alumnos"};
  const titulosDetalle={COLEGAS:"Espacio curricular",ADMINISTRACION:"Cargo",ALUMNOS:"Curso"};
  if(!visibles.length){
    mostrar("resultadoAgendaApoyo",'<div class="apoyo-agenda-resumen"><strong>'+textoSeguro(titulos[categoria])+'</strong></div><p class="mensaje">No se encontraron contactos disponibles para esta categoría.</p>');
    return;
  }
  const filas=visibles.map(c=>{
    const correo=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo)?c.correo:"";
    const enlace=correo?'<a href="mailto:'+textoSeguro(correo)+'">'+textoSeguro(correo)+'</a>':"Correo no cargado";
    return '<tr><td><strong>'+textoSeguro(c.nombre)+'</strong></td><td>'+textoSeguro(detalleContactoAgendaApoyo(c,categoria))+'</td><td>'+enlace+'</td></tr>';
  }).join("");
  mostrar("resultadoAgendaApoyo",'<div class="apoyo-agenda-resumen"><strong>'+textoSeguro(titulos[categoria])+' :</strong><span>'+visibles.length+' '+(visibles.length===1?"contacto":"contactos")+'</span></div>'+
    '<div class="tabla"><table><thead><tr><th>Apellido y nombre</th><th>'+textoSeguro(titulosDetalle[categoria])+'</th><th>Correo electrónico</th></tr></thead><tbody>'+filas+"</tbody></table></div>");
}
async function cargarCategoriaAgendaApoyo() {
  if(!categoriaAgendaApoyo?.value){renderizarAgendaApoyo();return}
  mensaje("resultadoAgendaApoyo","Cargando contactos...");
  try {
    await obtenerDatosAgendaApoyo();
    actualizarFiltroCursoAgendaApoyo();
    renderizarAgendaApoyo();
  }catch(error){
    mensaje("resultadoAgendaApoyo",error.message||"No se pudieron cargar los contactos.",true);
  }
}
categoriaAgendaApoyo?.addEventListener("change",()=>{
  if(buscarAgendaApoyo) buscarAgendaApoyo.value="";
  if(cursoAgendaApoyo) cursoAgendaApoyo.value="";
  cargarCategoriaAgendaApoyo();
});
cursoAgendaApoyo?.addEventListener("change",renderizarAgendaApoyo);
buscarAgendaApoyo?.addEventListener("input",renderizarAgendaApoyo);

document.getElementById("btnCargarInformesApoyo")?.addEventListener("click",()=>ejecutarConBoton("btnCargarInformesApoyo",cargarInformes));
document.getElementById("btnCargarAsistenciaApoyo")?.addEventListener("click",()=>ejecutarConBoton("btnCargarAsistenciaApoyo",cargarAsistencia));


function sesionLista(event){
  const datos=event?.detail||window.portalUsuario;
  if(!datos || datos.rol!=="DOCENTE_APOYO")return;
  perfil=datos;
  const el=document.getElementById("bienvenidaApoyo");
  if(el)el.textContent="Bienvenido/a, "+datos.nombreCompleto+". Tus consultas están limitadas a los estudiantes que acompañás.";
}
window.addEventListener("portalUsuarioListo",sesionLista);
if(window.portalUsuario)sesionLista({detail:window.portalUsuario});
