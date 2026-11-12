/*
 * Soporte · Docentes de Apoyo.
 * La modificación se ejecuta EXCLUSIVAMENTE en Apps Script:
 * el servidor valida SOPORTE, actualiza vínculos y sincroniza permisos Drive.
 * Mientras la acción no esté implementada, NO se escribe nada.
 */
import {getApps,getApp,initializeApp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
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
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const docenteSelect=document.getElementById("docenteApoyoAdmin");
const cursoSelect=document.getElementById("cursoApoyoAdmin");
const lista=document.getElementById("estudiantesApoyoAdmin");
const boton=document.getElementById("btnGuardarApoyoAdmin");
const mensaje=document.getElementById("mensajeApoyoAdmin");
let docentes=[],alumnos=[],vinculos=[],listo=false,ocupado=false;

const correo=v=>String(v||"").trim().toLowerCase();
const html=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
function informar(texto,error=false){if(mensaje){mensaje.textContent=texto;mensaje.style.color=error?"#ad1830":"";}}
function esSoporte(){return window.portalUsuario?.rol==="SOPORTE" && auth.currentUser && correo(window.portalUsuario.correo)===correo(auth.currentUser.email);}
function obtenerCurso(a){return String(a.cursoId||"").trim() || [a.cursoAnio,a.cursoDivision].filter(Boolean).join("_")||"SIN_CURSO";}
function nombreCurso(a){return String(a.cursoNombre||"").trim()||[a.cursoAnio?String(a.cursoAnio)+"°":"",a.cursoDivision].filter(Boolean).join(" ")||"Sin curso";}
async function consultarBackend(accion,otros={}){
  if(!esSoporte())throw Error("La sesión debe tener rol Soporte.");
  const idToken=await auth.currentUser.getIdToken(true);
  const resp=await fetch(URL_BACKEND_INFORMES,{
    method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({accion,idToken,...otros})
  });
  if(!resp.ok)throw Error("Error de conexión con el backend de informes.");
  const r=await resp.json();
  if(!r?.ok)throw Error(r?.mensaje||"El servidor rechazó la operación.");
  return r;
}
function pintar(){
  if(!lista||!docenteSelect||!cursoSelect)return;
  const docenteCorreo=correo(docenteSelect.value);
  const activas=new Set(vinculos.filter(v=>v.estado==="ACTIVO").map(v=>correo(v.alumnoCorreo)));
  const curso=cursoSelect.value;
  const visibles=alumnos.filter(a=>!curso||obtenerCurso(a)===curso);
  cursoSelect.disabled=!docenteCorreo||ocupado;
  boton.disabled=!docenteCorreo||ocupado;
  if(!docenteCorreo){lista.innerHTML="<p>Seleccioná un docente para comenzar.</p>";return;}
  if(!visibles.length){lista.innerHTML="<p>No hay estudiantes activos para este filtro.</p>";return;}
  lista.innerHTML=visibles.map(a=>{
    const c=correo(a.correo),nombre=a.nombreCompleto||c;
    return '<label style="display:flex;gap:10px;align-items:center;padding:6px;border-bottom:1px solid #e5ecf2">'+
      '<input type="checkbox" data-alumno-correo="'+html(c)+'" '+(activas.has(c)?"checked":"")+'>'+
      '<span><strong>'+html(nombre)+'</strong> <small style="color:#648097">('+html(nombreCurso(a))+')</small></span></label>';
  }).join("");
}
async function cargarVinculos(){
  vinculos=[];
  const docenteCorreo=correo(docenteSelect?.value);
  if(!docenteCorreo){pintar();return;}
  const snap=await getDocs(query(collection(db,"apoyos_estudiantes"),where("docenteCorreo","==",docenteCorreo)));
  vinculos=snap.docs.map(d=>d.data());
  pintar();
  const activas=vinculos.filter(v=>v.estado==="ACTIVO");
  informar(activas.length?activas.length+" estudiante(s) vinculado(s) actualmente.":"El docente todavía no tiene estudiantes vinculados.");
}
async function iniciar(){
  if(!esSoporte()||listo)return;
  listo=true;informar("Cargando docentes y estudiantes...");
  try{
    const [snapDoc,snapAl]=await Promise.all([
      getDocs(query(collection(db,"usuarios"),where("rol","==","DOCENTE_APOYO"),where("estado","==","ACTIVO"))),
      getDocs(query(collection(db,"usuarios"),where("rol","==","ALUMNO"),where("estado","==","ACTIVO")))
    ]);
    docentes=snapDoc.docs.map(d=>d.data()).sort((a,b)=>String(a.nombreCompleto||"").localeCompare(String(b.nombreCompleto||""),"es"));
    alumnos=snapAl.docs.map(d=>d.data()).filter(a=>["CURSANDO"].includes(String(a.tipoVinculo||a.situacionRevista||"").toUpperCase())).sort((a,b)=>String(a.nombreCompleto||"").localeCompare(String(b.nombreCompleto||""),"es"));
    docenteSelect.innerHTML='<option value="">Seleccionar Docente de Apoyo</option>'+docentes.map(d=>'<option value="'+html(correo(d.correo))+'">'+html(d.nombreCompleto||d.correo)+'</option>').join("");
    const cursos=new Map();
    alumnos.forEach(a=>cursos.set(obtenerCurso(a),nombreCurso(a)));
    cursoSelect.innerHTML='<option value="">Todos los cursos</option>'+Array.from(cursos.entries()).sort((a,b)=>a[1].localeCompare(b[1],"es")).map(([id,n])=>'<option value="'+html(id)+'">'+html(n)+'</option>').join("");
    informar("Elegí un Docente de Apoyo y marcá sus estudiantes.");
  }catch(e){listo=false;informar(e.message||"No se pudo cargar la información.",true);}
}
docenteSelect?.addEventListener("change",async()=>{informar("Cargando vínculos...");try{await cargarVinculos();}catch(e){informar(e.message||"Error al cargar vínculos.",true);}});
cursoSelect?.addEventListener("change",pintar);
boton?.addEventListener("click",async()=>{
  if(!esSoporte()||ocupado)return;
  const docenteCorreo=correo(docenteSelect.value);
  if(!docenteCorreo)return;
  const visibles=alumnos.filter(a=>!cursoSelect.value||obtenerCurso(a)===cursoSelect.value);
  const seleccionadas=new Set(Array.from(lista.querySelectorAll('input[data-alumno-correo]:checked')).map(input=>correo(input.dataset.alumnoCorreo)));
  const actuales=new Set(vinculos.filter(v=>v.estado==="ACTIVO").map(v=>correo(v.alumnoCorreo)));
  const agregar=visibles.filter(a=>seleccionadas.has(correo(a.correo))&&!actuales.has(correo(a.correo))).map(a=>({alumnoCorreo:correo(a.correo),alumnoNombre:a.nombreCompleto||""}));
  const quitar=visibles.filter(a=>!seleccionadas.has(correo(a.correo))&&actuales.has(correo(a.correo))).map(a=>correo(a.correo));
  if(!agregar.length&&!quitar.length){
    if(!confirm("No hay cambios en los estudiantes. ¿Querés comprobar y sincronizar de nuevo los permisos de Google Drive?"))return;
  } else if(!confirm("¿Confirmás "+agregar.length+" incorporación(es) y "+quitar.length+" desvinculación(es)? Se actualizarán los permisos de Google Drive."))return;
  ocupado=true;pintar();informar("Actualizando vinculaciones y permisos de informes...");
  try{
    // La operación del servidor debe verificar SOPORTE, validar todos los
    // estudiantes y realizar la sincronización de Google Drive.
    // En caso de rechazo, no se efectúa ninguna escritura desde el navegador.
    const respuesta=await consultarBackend("actualizar_vinculos_docente_apoyo",{docenteCorreo,agregar,quitar});
    await cargarVinculos();
    informar(respuesta.mensaje||"Vínculos y permisos actualizados correctamente.");
  }catch(e){
    // El servidor puede haber guardado un vínculo y fallado al sincronizar
    // Drive. Recargar la situación real antes de ofrecer otro intento.
    try{await cargarVinculos();}catch(error){console.error("No se pudieron recargar los vínculos:",error);}
    informar(e.message||"La operación quedó incompleta. Revisá la sincronización.",true);
  }
  finally{ocupado=false;pintar();}
});
window.addEventListener("portalUsuarioListo",iniciar);
if(window.portalUsuario)iniciar();
