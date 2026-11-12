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

async function cargarAgenda(){
  mensaje("resultadoAgendaApoyo","Cargando contactos...");
  const [vinculos,referentes,agenda]=await Promise.all([
    vinculosActivos(),
    getDocs(query(collection(db,"referentes_institucionales"),where("estado","==","ACTIVO"))),
    consultarBackend("listar_agenda_docente_apoyo")
  ]);
  const personas=referentes.docs.map(d=>d.data()).sort((a,b)=>String(a.nombreCompleto||a.nombre||"").localeCompare(String(b.nombreCompleto||b.nombre||""),"es"));
  const filas=personas.map(r=>{
    const correo=correoNormalizado(r.correo||r.email);
    const email=correo&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)?'<a href="mailto:'+textoSeguro(correo)+'">'+textoSeguro(correo)+"</a>":"-";
    return "<tr><td>"+textoSeguro(r.nombreCompleto||r.nombre||"-")+"</td><td>"+textoSeguro(r.cargo||"-")+"</td><td>"+email+"</td></tr>";
  }).join("");
  const asignados=vinculos.length?vinculos.map(v=>"<li>"+textoSeguro(v.alumnoNombre||"Estudiante")+"</li>").join(""):"<li>No tenés estudiantes vinculados.</li>";
  const colegas=Array.isArray(agenda.colegas)?agenda.colegas:[];
  const filasColegas=colegas.map(c=>{
    const email=correoNormalizado(c.correo),enlace=email?'<a href="mailto:'+textoSeguro(email)+'">'+textoSeguro(email)+'</a>':"-";
    return "<tr><td>"+textoSeguro(c.nombre||"-")+"</td><td>"+textoSeguro(c.cursoNombre||"-")+"</td><td>"+enlace+"</td></tr>";
  }).join("");
  const tablaColegas=filasColegas?'<div class="tabla"><table><thead><tr><th>Docente</th><th>Curso</th><th>Correo</th></tr></thead><tbody>'+filasColegas+"</tbody></table></div>":"<p class='mensaje'>No hay docentes vinculados a los cursos de tus estudiantes.</p>";
  mostrar("resultadoAgendaApoyo",'<h4>Estudiantes a tu cargo</h4><ul>'+asignados+'</ul><h4>Mis colegas docentes</h4>'+tablaColegas+'<h4>Administración institucional</h4>'+(filas?'<div class="tabla"><table><thead><tr><th>Nombre</th><th>Cargo</th><th>Contacto</th></tr></thead><tbody>'+filas+"</tbody></table></div>":"<p class='mensaje'>Sin contactos disponibles.</p>"));
}

document.querySelectorAll("[data-abrir]").forEach(btn=>btn.addEventListener("click",()=>{
  const objetivo=btn.dataset.abrir;
  document.querySelectorAll("section.detalle").forEach(panel=>panel.hidden=panel.id!==objetivo);
  document.getElementById(objetivo)?.scrollIntoView({behavior:"smooth",block:"start"});
}));
document.getElementById("btnCargarInformesApoyo")?.addEventListener("click",()=>ejecutarConBoton("btnCargarInformesApoyo",cargarInformes));
document.getElementById("btnCargarAsistenciaApoyo")?.addEventListener("click",()=>ejecutarConBoton("btnCargarAsistenciaApoyo",cargarAsistencia));
document.getElementById("btnCargarAgendaApoyo")?.addEventListener("click",()=>ejecutarConBoton("btnCargarAgendaApoyo",cargarAgenda));

function sesionLista(event){
  const datos=event?.detail||window.portalUsuario;
  if(!datos || datos.rol!=="DOCENTE_APOYO")return;
  perfil=datos;
  const el=document.getElementById("bienvenidaApoyo");
  if(el)el.textContent="Bienvenido/a, "+datos.nombreCompleto+". Tus consultas están limitadas a los estudiantes que acompañás.";
}
window.addEventListener("portalUsuarioListo",sesionLista);
if(window.portalUsuario)sesionLista({detail:window.portalUsuario});
