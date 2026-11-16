import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const config = { apiKey:"AIzaSyAARktrOpu-Rz683q4RxTK2h1nmkUaUbuA", authDomain:"portal-institucional-eet-fa5c7.firebaseapp.com", projectId:"portal-institucional-eet-fa5c7", storageBucket:"portal-institucional-eet-fa5c7.firebasestorage.app", messagingSenderId:"658183549494", appId:"1:658183549494:web:84fe7da91b1ea8990f1e97" };
const db = getFirestore(getApps().length ? getApp() : initializeApp(config));
const auth = getAuth();
const form = document.getElementById("formReemplazoPreceptoria");
const campo = id => form?.querySelector('[name="' + id + '"]');
const correo = v => String(v || "").trim().toLowerCase();
const roles = u => [u.rol, ...(Array.isArray(u.roles) ? u.roles : [])].map(v => String(v || "").trim().toUpperCase());
const activo = u => String(u.estado || "").toUpperCase() === "ACTIVO";
const mensaje = (s, error=false) => { const el = document.getElementById("mensajeReemplazoPreceptoria"); if(el){el.textContent=s;el.style.color=error?"#c93a3a":"";} };
const opcion = (sel, valor, texto) => { const el=document.createElement("option"); el.value=valor;el.textContent=texto;sel.appendChild(el); };
let usuarios = new Map(), referentes = new Map();
const estadoGestion = () => String(window.portalUsuario?.rol || sessionStorage.getItem("rolActivoPortal") || "").trim().toUpperCase();

async function cargar() {
  if (!form) return;
  if (location.pathname.startsWith("/gestion/")) {
    const rol = estadoGestion();
    if (!["DIRECCION","SECRETARIA","ASISTENTE_ADMINISTRATIVO"].includes(rol)) {
      const panel = document.getElementById("panelRegistroPreceptoriaGestion");
      if (panel) { panel.hidden = true; panel.style.display = "none"; }
      form.hidden = true;
      return;
    }
  }
  try {
    const [us,refs] = await Promise.all([getDocs(query(collection(db,"usuarios"),where("rol","!=","ALUMNO"))),getDocs(collection(db,"referentes_institucionales"))]);
    usuarios=new Map(us.docs.map(d=>[correo(d.data().correo||d.id),{...d.data(),documentoId:d.id}]));
    referentes=new Map(refs.docs.filter(d=>d.data().cargo==="PRECEPTOR"&&d.data().estado==="ACTIVO"&&d.data().cursoId).map(d=>[d.id,d.data()]));
    const titular=campo("titular"),reemplazante=campo("reemplazante");
    titular.replaceChildren();reemplazante.replaceChildren();
    opcion(titular,"","Seleccionar preceptora titular");
    opcion(reemplazante,"","Seleccionar preceptora reemplazante");
    const correosTitulares=new Set([...referentes.values()].map(x=>correo(x.correo)));
    [...usuarios].filter(([email,u])=>activo(u)&&roles(u).includes("PRECEPTORIA")).sort((a,b)=>String(a[1].nombreCompleto||a[0]).localeCompare(String(b[1].nombreCompleto||b[0]),"es")).forEach(([email,u])=>{
      const etiqueta=(u.nombreCompleto||email)+" — "+email;
      if(correosTitulares.has(email)) opcion(titular,email,etiqueta);
      opcion(reemplazante,email,etiqueta);
    });
    titular.addEventListener("change",cargarCursos);
    cargarCursos();
  } catch(e) {console.error("Error al cargar reemplazos de Preceptoría",e);mensaje("No se pudieron cargar las preceptorías. Revisá los permisos.",true);}
}
function cargarCursos(){
  const sel=campo("asignacion");sel.replaceChildren();opcion(sel,"","Seleccionar curso de la titular");
  [...referentes].filter(([,a])=>correo(a.correo)===correo(campo("titular").value)).forEach(([id,a])=>opcion(sel,id,a.cursoNombre||a.cursoId));
}
form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const boton=form.querySelector('button[type="submit"]');
  const titularCorreo=correo(campo("titular").value),reemplazanteCorreo=correo(campo("reemplazante").value),asignacionTitularId=campo("asignacion").value;
  const fechaDesde=campo("desde").value,fechaHasta=campo("hasta").value;
  if(!titularCorreo||!reemplazanteCorreo||!asignacionTitularId||!fechaDesde||!fechaHasta){mensaje("Completá todos los campos.",true);return;}
  if(titularCorreo===reemplazanteCorreo||fechaHasta<fechaDesde){mensaje("Revisá las personas y las fechas del reemplazo.",true);return;}
  boton.disabled=true;
  try {
    const [ref,usr,existentes]=await Promise.all([getDoc(doc(db,"referentes_institucionales",asignacionTitularId)),getDoc(doc(db,"usuarios",usuarios.get(reemplazanteCorreo)?.documentoId || reemplazanteCorreo)),getDocs(collection(db,"reemplazos_docentes"))]);
    if(!ref.exists()||ref.data().estado!=="ACTIVO"||ref.data().cargo!=="PRECEPTOR"||correo(ref.data().correo)!==titularCorreo||!usuarios.has(titularCorreo)||!activo(usuarios.get(titularCorreo))||!roles(usuarios.get(titularCorreo)).includes("PRECEPTORIA"))throw Error("La asignación de Preceptoría ya no está vigente.");
    if(!usr.exists()||correo(usr.data().correo||usr.id)!==reemplazanteCorreo||!activo(usr.data())||!roles(usr.data()).includes("PRECEPTORIA"))throw Error("La reemplazante debe tener el rol PRECEPTORIA activo.");
    if(existentes.docs.some(d=>{const x=d.data();return x.estado==="ACTIVO"&&x.asignacionTitularId===asignacionTitularId&&fechaDesde<=x.fechaHasta&&fechaHasta>=x.fechaDesde;}))throw Error("Ya hay un reemplazo activo superpuesto para este curso.");
    const a=ref.data();
    await addDoc(collection(db,"reemplazos_docentes"),{
      asignacionTitularId,titularCorreo,titularNombre:a.nombreCompleto||titularCorreo,
      reemplazanteCorreo,reemplazanteNombre:usr.data().nombreCompleto||reemplazanteCorreo,
      cursoId:a.cursoId,cursoNombre:a.cursoNombre||"",cursoAnio:Number(a.cursoAnio||0),cursoDivision:a.cursoDivision||"",
      espacioId:"",espacioNombre:"Preceptoría",tipoHorario:"PRECEPTORIA",cicloLectivo:Number(fechaDesde.slice(0,4)),
      fechaDesde,fechaHasta,estado:"ACTIVO",creadoEn:serverTimestamp(),creadoPor:correo(auth.currentUser?.email),
      actualizadoEn:serverTimestamp(),actualizadoPor:correo(auth.currentUser?.email)
    });
    campo("asignacion").value="";campo("reemplazante").value="";campo("desde").value="";campo("hasta").value="";
    mensaje("Reemplazo de Preceptoría registrado. Podés verlo y finalizarlo desde el listado de reemplazos.");
  }catch(err){console.error(err);mensaje(err.message||"No se pudo registrar el reemplazo.",true);}
  finally{boton.disabled=false;}
});
cargar();
