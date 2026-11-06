/* Integración 35 · E.E.T.P. N° 495 · impresión local, sin subir archivos.
   Usa exclusivamente el resultado ya renderizado en Portal Soporte o Gestión.
   El usuario decide si imprime en papel o guarda como PDF desde el navegador.
*/
(() => {
  "use strict";

  const BOTON_SOPORTE = "btnGenerarPdfDocentesLibresTallerAdmin";
  const BOTON_GESTION = "btnGenerarPdfDocentesLibresTallerGestion";
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  function texto(elemento) {
    return (elemento?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function escapar(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function leerDocente(elemento) {
    const nombre = texto(elemento.querySelector(".docentes-libres-identidad strong"));
    const conAula = elemento.classList.contains("docentes-libres-con-aula");
    const clases = Array.from(
      elemento.querySelectorAll(".docentes-libres-detalles-aula li"),
      (li) => ({
        descripcion: texto(li.querySelector("span")),
        horario: texto(li.querySelector("small")),
      }),
    );
    return { nombre, conAula, clases };
  }

  function leerTurno(vista, claseTurno) {
    const turno = vista.querySelector(`.docentes-libres-turno.${claseTurno}`);
    if (!turno) return null;

    const mapaDias = new Map();
    turno.querySelectorAll(".docentes-libres-dia").forEach((seccion) => {
      const nombreDia = texto(seccion.querySelector("h5"));
      const docentes = Array.from(
        seccion.querySelectorAll(".docentes-libres-lista > .docentes-libres-docente"),
        leerDocente,
      );
      mapaDias.set(nombreDia, docentes);
    });

    return DIAS.map((nombre) => ({
      nombre,
      docentes: mapaDias.get(nombre) || [],
    }));
  }

  function tarjetaDocente(docente) {
    const detalle = docente.clases.length
      ? `<ul class="aula">${docente.clases
          .map((c) => `<li>${escapar(c.descripcion)}<small>${escapar(c.horario)}</small></li>`)
          .join("")}</ul>`
      : "";
    return `<li class="docente ${docente.conAula ? "con-aula" : ""}">
      <strong>${escapar(docente.nombre)}</strong>
      <span class="estado">${docente.conAula ? "Tiene clases de aula" : "Sin clases de Taller"}</span>
      ${detalle}
    </li>`;
  }

  function paginaTurno(nombre, dias, fecha, numero) {
    return `<section class="pagina" aria-label="${escapar(nombre)}">
      <div class="pagina-contenido">
        <header>
          <div class="institucion">E.E.T.P. N° 495 · Malvinas Argentinas</div>
          <h1>Docentes libres de Taller <span>— ${escapar(nombre)}</span></h1>
          <p>Disponibilidad semanal por día. Las clases de aula se indican con espacio, curso y horario.</p>
        </header>
        <main class="dias">${dias
          .map((dia) => `<section class="dia">
            <h2>${escapar(dia.nombre)} <small>${dia.docentes.length} ${dia.docentes.length === 1 ? "docente" : "docentes"}</small></h2>
            ${dia.docentes.length
              ? `<ul class="docentes">${dia.docentes.map(tarjetaDocente).join("")}</ul>`
              : `<p class="vacio">Sin docentes libres de Taller</p>`}
          </section>`)
          .join("")}</main>
        <footer>Consulta generada: ${escapar(fecha)} <span>Página ${numero} de 2</span></footer>
      </div>
    </section>`;
  }

  function documentoImprimible(manana, tarde) {
    const fecha = new Date().toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const paginas =
      paginaTurno("Turno mañana", manana, fecha, 1) +
      paginaTurno("Turno tarde", tarde, fecha, 2);

    return `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Docentes libres de Taller · EETP 495</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #e8edf2; color: #18324e; font-family: Arial, Helvetica, sans-serif; }
  .barra { padding: 10px 20px; background: #143d76; color: white; display: flex;
    align-items: center; justify-content: center; gap: 16px; font-size: 13px; }
  .barra button { border: 0; border-radius: 7px; padding: 10px 16px;
    background: white; color: #143d76; font-size: 13px; font-weight: bold; cursor: pointer; }
  .pagina { width: 281mm; height: 194mm; margin: 12px auto; padding: 3mm;
    overflow: hidden; background: #fff; box-shadow: 0 3px 18px #0002; }
  .pagina-contenido { width: 100%; transform-origin: top left; }
  header { border-bottom: 2px solid #143d76; padding-bottom: 7px; margin-bottom: 9px; }
  .institucion { text-transform: uppercase; font-weight: 800; font-size: 10px; letter-spacing: .55px; }
  h1 { font-size: 18px; line-height: 1.2; margin: 4px 0; color: #102d54; }
  h1 span { color: #256f99; }
  header p { margin: 4px 0 0; font-size: 10px; color: #56687b; }
  .dias { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; align-items: start; }
  .dia { min-width: 0; background: #f5f8fb; border: 1px solid #d5e0ea; border-radius: 6px; overflow: hidden; }
  h2 { background: #e8eff8; color: #17416d; padding: 7px 6px;
    margin: 0; font-size: 11px; display: flex; gap: 3px; justify-content: space-between; align-items: center; }
  h2 small { font-size: 8px; font-weight: normal; white-space: nowrap; }
  .docentes { margin: 0; padding: 5px; list-style: none; }
  .docente { background: white; margin: 0 0 5px; padding: 6px 6px 5px;
    border: 1px solid #dce7e7; border-left: 3px solid #19896c; border-radius: 5px;
    break-inside: avoid; overflow-wrap: anywhere; }
  .docente.con-aula { border-color: #ecd8b8; border-left-color: #c58a31; }
  .docente strong { display: block; font-size: 9.5px; line-height: 1.3; }
  .estado { display: block; font-size: 8px; color: #0c795f; margin-top: 2px; }
  .con-aula .estado { color: #99610d; }
  .aula { margin: 5px 0 0; padding: 4px 0 0; list-style: none; border-top: 1px dashed #eadbc7; }
  .aula li { font-size: 8px; line-height: 1.3; margin-bottom: 4px; }
  .aula small { display: block; font-size: 7.8px; font-weight: bold; color: #566477; margin-top: 2px; }
  .vacio { padding: 12px 7px; margin: 0; font-size: 9px; color: #6a7887; }
  footer { display: flex; justify-content: space-between; margin-top: 7px;
    padding-top: 6px; border-top: 1px solid #d7e3ec; font-size: 8px; color: #66778a; }
  @media print {
    body { background: white; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .barra { display: none; }
    .pagina { margin: 0; padding: 3mm; box-shadow: none;
      page-break-after: always; break-after: page; }
    .pagina:last-child { page-break-after: auto; break-after: auto; }
  }
</style>
</head>
<body>
<div class="barra"><span>Una página por turno · A4 horizontal</span>
  <button type="button" id="imprimir">Imprimir / Guardar como PDF</button></div>
${paginas}
<script>
  function ajustarPaginas() {
    document.querySelectorAll('.pagina').forEach(function(pagina) {
      var contenido = pagina.querySelector('.pagina-contenido');
      var estilo = window.getComputedStyle(pagina);
      var altura = pagina.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom) - 2;
      var anchura = pagina.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight) - 2;
      var factor = Math.min(1, altura / contenido.scrollHeight, anchura / contenido.scrollWidth);
      if (factor < 1) contenido.style.zoom = String(Math.max(0.1, factor));
    });
  }
  window.addEventListener('load', function() {
    ajustarPaginas();
    document.getElementById('imprimir').addEventListener('click', function() { window.print(); });
    window.setTimeout(function() { window.print(); }, 250);
  });
<\/script>
</body>
</html>`;
  }

  function generar(e) {
    const boton = e.target.closest("button");
    if (!boton || (boton.id !== BOTON_SOPORTE && boton.id !== BOTON_GESTION)) return;

    const vistaId = boton.id === BOTON_SOPORTE
      ? "vistaDocentesLibresTallerAdmin"
      : "vistaDocentesLibresTallerGestion";
    const vista = document.getElementById(vistaId);
    const manana = vista && leerTurno(vista, "docentes-libres-manana");
    const tarde = vista && leerTurno(vista, "docentes-libres-tarde");

    if (!manana || !tarde || vista?.querySelector(".mensaje-formulario.error, .mensaje-gestion.error")) {
      window.alert("Primero realizá la consulta de docentes libres de Taller para generar el PDF.");
      return;
    }

    // Abrir directamente dentro del clic permite la impresión en navegadores con bloqueador de ventanas.
    const ventana = window.open("", "_blank");
    if (!ventana) {
      window.alert("El navegador bloqueó la vista de impresión. Permití las ventanas emergentes para este sitio e intentá nuevamente.");
      return;
    }
    ventana.opener = null;
    ventana.document.open();
    ventana.document.write(documentoImprimible(manana, tarde));
    ventana.document.close();
  }

  document.addEventListener("click", generar);
})();
