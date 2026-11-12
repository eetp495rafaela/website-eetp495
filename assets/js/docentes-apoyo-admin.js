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
/*
 * Resumen accesible de altas, bajas o resincronización de permisos.
 * Solamente mejora la presentación: el backend sigue autorizando
 * y ejecutando los cambios, nunca esta confirmación.
 */
function resumenPersonasApoyo(titulo,personas,clase){
  if(!personas.length)return "";
  const visibles=personas.slice(0,6);
  const restantes=personas.length-visibles.length;
  return '<div class="apoyo-conf-grupo '+clase+'">'+
    '<div class="apoyo-conf-grupo-titulo"><strong>'+html(titulo)+'</strong>'+
    '<span>'+personas.length+'</span></div>'+
    '<ul>'+visibles.map(nombre=>'<li>'+html(nombre)+'</li>').join("")+
    (restantes?'<li class="apoyo-conf-restantes">Y '+restantes+' estudiante(s) más</li>':"")+
    '</ul></div>';
}
async function confirmarCambiosApoyo(docenteCorreo,agregar,quitar,actuales){
  const docente=docentes.find(d=>correo(d.correo)===docenteCorreo);
  const nombreDocente=String(docente?.nombreCompleto||docente?.correo||docenteCorreo);
  const nombresAltas=agregar.map(a=>String(a.alumnoNombre||a.alumnoCorreo));
  const nombresBajas=quitar.map(c=>{
    const alumno=alumnos.find(a=>correo(a.correo)===c);
    return String(alumno?.nombreCompleto||c);
  });
  const tieneCambios=Boolean(agregar.length||quitar.length);
  const titulo=tieneCambios?"Confirmar vinculaciones":"Sincronizar permisos";
  const texto=tieneCambios?
    "Revisá las asignaciones antes de guardar. Se actualizarán los permisos de los informes pedagógicos en Google Drive.":
    "No hay cambios en los estudiantes seleccionados. Podés revisar y sincronizar nuevamente los permisos de Google Drive.";
  if(!window.Swal?.fire){
    const detalle=tieneCambios
      ? "Incorporar: "+agregar.length+". Desvincular: "+quitar.length+"."
      : "Sin cambios en los vínculos.";
    return window.confirm(titulo+"\nDocente: "+nombreDocente+"\n"+detalle+"\n"+texto);
  }
  const resumen= tieneCambios
    ? resumenPersonasApoyo("Vincular estudiantes",nombresAltas,"apoyo-conf-altas")+
      resumenPersonasApoyo("Desvincular estudiantes",nombresBajas,"apoyo-conf-bajas")
    : '<div class="apoyo-conf-sin-cambios"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Se comprobarán los permisos actuales sin cambiar las asignaciones.</div>';
  const respuesta=await window.Swal.fire({
    title:titulo,
    icon:tieneCambios?"question":"info",
    html:'<div class="apoyo-conf-contenido">'+
      '<p class="apoyo-conf-docente">Docente de Apoyo <strong>'+html(nombreDocente)+'</strong></p>'+
      '<p class="apoyo-conf-descripcion">'+html(texto)+'</p>'+
      resumen+
      '<p class="apoyo-conf-aviso"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Los cambios se validarán en el servidor; no se otorgarán permisos de edición.</p>'+
      '</div>',
    confirmButtonText:tieneCambios?"Guardar y sincronizar":"Revisar permisos",
    cancelButtonText:"Cancelar",
    showCancelButton:true,
    buttonsStyling:false,
    reverseButtons:true,
    focusCancel:true,
    width:540,
    customClass:{
      popup:"apoyo-confirmacion-modal",
      confirmButton:"apoyo-conf-aceptar",
      cancelButton:"apoyo-conf-cancelar",
      actions:"apoyo-conf-acciones"
    },
    allowOutsideClick:()=>!window.Swal.isLoading()
  });
  return respuesta.isConfirmed===true;
}

boton?.addEventListener("click",async()=>{
  if(!esSoporte()||ocupado)return;
  const docenteCorreo=correo(docenteSelect.value);
  if(!docenteCorreo)return;
  const visibles=alumnos.filter(a=>!cursoSelect.value||obtenerCurso(a)===cursoSelect.value);
  const seleccionadas=new Set(Array.from(lista.querySelectorAll('input[data-alumno-correo]:checked')).map(input=>correo(input.dataset.alumnoCorreo)));
  const actuales=new Set(vinculos.filter(v=>v.estado==="ACTIVO").map(v=>correo(v.alumnoCorreo)));
  const agregar=visibles.filter(a=>seleccionadas.has(correo(a.correo))&&!actuales.has(correo(a.correo))).map(a=>({alumnoCorreo:correo(a.correo),alumnoNombre:a.nombreCompleto||""}));
  const quitar=visibles.filter(a=>!seleccionadas.has(correo(a.correo))&&actuales.has(correo(a.correo))).map(a=>correo(a.correo));
  // Confirmar desde un modal institucional sin alterar la operación de seguridad.
  const confirmado=await confirmarCambiosApoyo(docenteCorreo,agregar,quitar,actuales);
  if(!confirmado)return;
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
