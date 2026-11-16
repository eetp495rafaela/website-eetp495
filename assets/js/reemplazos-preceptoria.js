import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, writeBatch, setDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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
    const [us,refs] = await Promise.all([getDocs(query(collection(db,"usuarios"),where("rol","!=","ALUMNO"))),getDocs(query(collection(db,"referentes_institucionales"),where("estado","==","ACTIVO")))]);
    usuarios=new Map(us.docs.map(d=>[correo(d.data().correo||d.id),{...d.data(),documentoId:d.id}]));
    referentes=new Map(refs.docs.filter(d=>d.data().cargo==="PRECEPTOR"&&d.data().estado==="ACTIVO"&&d.data().cursoId).map(d=>[d.id,d.data()]));
    const titular=campo("titular"),reemplazante=campo("reemplazante");
    titular.replaceChildren();reemplazante.replaceChildren();
    opcion(titular,"","Seleccionar preceptora titular");
    opcion(reemplazante,"","Seleccionar preceptora reemplazante");
    const correosTitulares=new Set([...referentes.values()].map(x=>correo(x.correo)));
    [...usuarios].filter(([email,u])=>activo(u)&&(roles(u).includes("DOCENTE")||roles(u).includes("PRECEPTORIA"))).sort((a,b)=>String(a[1].nombreCompleto||a[0]).localeCompare(String(b[1].nombreCompleto||b[0]),"es")).forEach(([email,u])=>{
      const etiqueta=(u.nombreCompleto||email)+" — "+email;
      if(correosTitulares.has(email)) opcion(titular,email,etiqueta);
      opcion(reemplazante,email,etiqueta);
    });

  } catch(e) {console.error("Error al cargar reemplazos de Preceptoría",e);mensaje("No se pudieron cargar las preceptorías. Revisá los permisos.",true);}
}
form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const boton=form.querySelector('button[type="submit"]');
  const titularCorreo=correo(campo("titular").value),reemplazanteCorreo=correo(campo("reemplazante").value);
  const fechaDesde=campo("desde").value,fechaHasta=campo("hasta").value;
  if(!titularCorreo||!reemplazanteCorreo||!fechaDesde||!fechaHasta){mensaje("Completá todos los campos.",true);return;}
  if(titularCorreo===reemplazanteCorreo||fechaHasta<fechaDesde){mensaje("Revisá las personas y las fechas del reemplazo.",true);return;}
  boton.disabled=true;
  try {
    const [usr,existentes,refsActuales]=await Promise.all([getDoc(doc(db,"usuarios",usuarios.get(reemplazanteCorreo)?.documentoId || reemplazanteCorreo)),getDocs(collection(db,"reemplazos_docentes")),getDocs(query(collection(db,"referentes_institucionales"),where("estado","==","ACTIVO")))]);
    const asignaciones=refsActuales.docs.filter(d=>d.data().cargo==="PRECEPTOR"&&correo(d.data().correo)===titularCorreo&&d.data().cursoId);
    if(!asignaciones.length)throw Error("La titular no tiene cursos activos asignados.");
    if(!usuarios.has(titularCorreo)||!activo(usuarios.get(titularCorreo))||!roles(usuarios.get(titularCorreo)).includes("PRECEPTORIA"))throw Error("La titular ya no tiene un perfil activo de Preceptoría.");
    if(!usr.exists()||correo(usr.data().correo||usr.id)!==reemplazanteCorreo||!activo(usr.data())||!roles(usr.data()).some(r=>r==="DOCENTE"||r==="PRECEPTORIA"))throw Error("La reemplazante debe tener un perfil DOCENTE o PRECEPTORIA activo.");
    if(existentes.docs.some(d=>{const x=d.data();return x.estado==="ACTIVO"&&x.tipoHorario==="PRECEPTORIA"&&correo(x.titularCorreo)===titularCorreo&&fechaDesde<=x.fechaHasta&&fechaHasta>=x.fechaDesde;}))throw Error("Ya hay un reemplazo activo superpuesto para esta preceptora.");
    const a=asignaciones[0].data();
    if(existentes.docs.some(d=>{const v=d.data();return v.estado==="ACTIVO"&&v.tipoHorario==="PRECEPTORIA"&&correo(v.reemplazanteCorreo)===reemplazanteCorreo;}))throw Error("La reemplazante ya tiene un reemplazo activo de Preceptoría. Finalizalo antes de registrar otro para no invalidar su acceso temporal.");
    const cursos=[...new Map(asignaciones.map(d=>[String(d.data().cursoId),{id:String(d.data().cursoId),nombre:d.data().cursoNombre||String(d.data().cursoId)}])).values()];
    const referencia=doc(collection(db,"reemplazos_docentes"));
    const lote=writeBatch(db);
    lote.set(referencia,{
      asignacionTitularId:asignaciones[0].id,asignacionesTitularIds:asignaciones.map(d=>d.id),titularCorreo,titularNombre:a.nombreCompleto||titularCorreo,
      reemplazanteCorreo,reemplazanteNombre:usr.data().nombreCompleto||reemplazanteCorreo,
      cursoId:a.cursoId,cursoIds:cursos.map(c=>c.id),cursoNombre:cursos.map(c=>c.nombre).join(", "),cursoAnio:Number(a.cursoAnio||0),cursoDivision:a.cursoDivision||"",
      espacioId:"",espacioNombre:"Preceptoría",tipoHorario:"PRECEPTORIA",cicloLectivo:Number(fechaDesde.slice(0,4)),
      fechaDesde,fechaHasta,estado:"ACTIVO",creadoEn:serverTimestamp(),creadoPor:correo(auth.currentUser?.email),
      actualizadoEn:serverTimestamp(),actualizadoPor:correo(auth.currentUser?.email)
    });
    lote.set(doc(db,"accesos_preceptoria_temporales",reemplazanteCorreo),{reemplazoId:referencia.id,reemplazanteCorreo,actualizadoEn:serverTimestamp(),actualizadoPor:correo(auth.currentUser?.email)});
    await lote.commit();
    campo("reemplazante").value="";campo("desde").value="";campo("hasta").value="";
    mensaje("Reemplazo registrado para "+cursos.length+" curso(s). Podés verlo y finalizarlo desde el listado.");
  }catch(err){console.error(err);mensaje(err.message||"No se pudo registrar el reemplazo.",true);}
  finally{boton.disabled=false;}
});
cargar();


/* Vinculación retroactiva: no modifica ni duplica reemplazos reales. */
if (form) {
  const botonVincular = document.createElement("button");
  botonVincular.type = "button";
  botonVincular.className = form.querySelector('button[type="submit"]')?.className || "";
  botonVincular.textContent = "Vincular reemplazos existentes";
  botonVincular.style.marginTop = "12px";
  form.insertAdjacentElement("afterend", botonVincular);
  botonVincular.addEventListener("click", async () => {
    botonVincular.disabled = true;
    try {
      const hoy = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Argentina/Buenos_Aires",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      const docs = await getDocs(collection(db,"reemplazos_docentes"));
      const vigentes = docs.docs.filter(d => {
        const r=d.data();
        return r.tipoHorario==="PRECEPTORIA" && r.estado==="ACTIVO"
          && r.fechaDesde<=hoy && hoy<=r.fechaHasta && correo(r.reemplazanteCorreo);
      });
      const porCorreo = new Map();
      for (const d of vigentes) {
        const email=correo(d.data().reemplazanteCorreo);
        if (porCorreo.has(email)) throw Error("Hay más de un reemplazo vigente para "+email+". Revisalos antes de vincular.");
        porCorreo.set(email,d);
      }
      let creados=0,existentes=0;
      for (const [email,reemplazo] of porCorreo) {
        const ref=doc(db,"accesos_preceptoria_temporales",email);
        const actual=await getDoc(ref);
        if (actual.exists()) {
          if (actual.data().reemplazoId!==reemplazo.id) throw Error("El acceso de "+email+" apunta a otro reemplazo. No se sobrescribió.");
          existentes++;
          continue;
        }
        await setDoc(ref,{reemplazoId:reemplazo.id,reemplazanteCorreo:email,actualizadoEn:serverTimestamp(),actualizadoPor:correo(auth.currentUser?.email)});
        creados++;
      }
      mensaje("Vinculación completada: "+creados+" nuevo(s), "+existentes+" ya vinculado(s). No se modificaron reemplazos.");
    } catch (e) { console.error(e); mensaje(e.message||"No se pudo completar la vinculación.",true); }
    finally {botonVincular.disabled=false;}
  });
}
