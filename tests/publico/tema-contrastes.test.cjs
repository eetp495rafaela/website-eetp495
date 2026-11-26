const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root,p), "utf8");
const css = read("assets/css/portales/tema-portales-2027.css");
const login = read("vista-2027/assets/css/tema-login-2027.css");
function balanced(text) {
 const src = text.replace(/\/\*[\s\S]*?\*\//g,""); const stack=[];
 const close={"}":"{",")":"(","]":"["}; let q=null;
 for(let i=0;i<src.length;i++){const c=src[i];
  if(q){if(c==="\\")i++;else if(c===q)q=null;continue;}
  if(c==='"'||c==="'"){q=c;continue;}
  if("{([".includes(c))stack.push(c);
  if("})]".includes(c))assert.equal(stack.pop(),close[c],"CSS balance at "+i);
 }
 assert.deepEqual(stack,[]);assert.equal(q,null);
}
function contrast(a,b){
 const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
 const l=c.map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
 return l[0]*.2126+l[1]*.7152+l[2]*.0722;};
 const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
test("sintaxis CSS: grupos de reglas y comillas equilibrados",()=>{balanced(css);balanced(login);});
test("contraste principal AA en paneles, entradas y campos deshabilitados",()=>{
 for(const [f,t] of [["#1a2e49","#dfecfb"],["#13273f","#edf5ff"],["#243449","#c0cede"],["#1b304a","#eaf4ff"]])
  assert(contrast(f,t)>=4.5,f+" / "+t);
});
test("módulos Docentes de las capturas cubiertos",()=>{
 for(const id of ["#mis-horarios-docente","#sira-docente","#parte-sira-docente","#situacion-asistencia-docente","#calificaciones-taller-docente","#panelDocumentacionAcademica","#mesas-examen-docente","#agenda-institucional-docente"])
  assert(css.includes(id),id);
});
test("módulos Soporte de las capturas cubiertos",()=>{
 for(const id of ["#gestionDocentesApoyo","#estudiantesApoyoAdmin","#vistaDocentesLibresTallerAdmin","#horario-aula","#sira-admin"])
  assert(css.includes(id),id);
});
test("Gestión, Alumnos y Docentes de Apoyo cubiertos",()=>{
 for(const item of [".panel-dai-gestion",".dia-horario-alumno",".apoyo-panel"])
  assert(css.includes(item),item);
});
test("opciones nativas y estado de controles se distinguen",()=>{
 assert(css.includes("select option,select optgroup"));
 assert(css.includes("color-scheme: dark"));
 assert(css.includes("select option:disabled"));
});
test("avisos error/ok y modo de edición conservan semántica",()=>{
 assert(css.includes(".mensaje-formulario.error"));
 assert(css.includes(".mensaje-formulario.ok"));
 assert(css.includes("estado-calificaciones-solo-lectura.edicion-habilitada"));
 assert(css.includes("#adf0d4"));
});
test("gestiones y normativa conservan sus enlaces, sin ocultar botones",()=>{
 for(const id of ["#gestiones-docentes-2027","#normativa-vigente-2027"]) assert(css.includes(id),id);
 assert(!/display:\s*none\s*!important/.test(css));
});
test("el ingreso mantiene Google y la solicitud de acceso",()=>{
 const html=read("login.html");
 assert(html.includes("tema-login-2027.css?v=45b"));
 assert(html.includes("data-public-theme-toggle"));
 assert(html.includes('id="btnGoogle"'));
 assert(html.includes('id="formSolicitudAlumno"'));
 assert(!/filter:\s*invert\(/.test(login));
});


test("los últimos ajustes de Alumnos y Soporte mantienen AA en modo oscuro",()=>{
 const inicio=css.indexOf("Integración 47");
 const fin=css.indexOf("/* Si.R.A. · previsiones:",inicio);
 assert(inicio>=0 && fin>inicio);
 const patch=css.slice(inicio,fin);
 assert(patch.startsWith("Integración 47"),"Se requiere integración 47");
 assert(patch.includes('body.portal-alumnos-2027 #mis-docentes-alumno'));
 assert(patch.includes(".correo-referente-alumno:not(.sin-correo)"));
 assert(patch.includes(".cargo-referente-alumno"));
 assert(patch.includes('body.portal-soporte-2027 #sira-admin'));
 assert(patch.includes(".sira-hoy .sira-hoy-mensaje:not(.sira-hoy-error)"));
 assert(!patch.includes("html:not([data-public-theme"),"No modificar modo claro");
 for(const [bg,fg] of [["#1b304a","#a8dcff"],["#1b304a","#9ed0f7"],["#233b56","#dceaff"]])
  assert(contrast(bg,fg)>=4.5,bg+" / "+fg);
});
