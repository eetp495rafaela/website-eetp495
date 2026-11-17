/* Aviso institucional compartido por sitio público y portales. */
(() => {
  const init = () => {
    if (document.getElementById("aviso-propiedad-institucional")) return;
    const style = document.createElement("style");
    style.textContent = `
      #aviso-propiedad-institucional { display:inline-flex; align-items:center; justify-content:center; text-align:center; margin:0; padding:0; font-size:inherit; line-height:inherit; color:inherit; vertical-align:baseline; }\n      #aviso-propiedad-institucional.aviso-separado::before { content:"·"; margin:0 12px; opacity:.65; }
      #aviso-propiedad-institucional button { color:inherit; font:inherit; text-decoration:underline; text-underline-offset:3px; border:0; background:transparent; cursor:pointer; }
      #aviso-propiedad-institucional dialog { position:fixed; inset:0; margin:auto; width:min(92vw,510px); max-height:85vh; padding:26px; border-radius:14px; border:1px solid #6583a5; background:#fff; color:#142b46; box-shadow:0 16px 48px #0005; text-align:left; }
      #aviso-propiedad-institucional dialog::backdrop { background:rgba(2,12,29,.75); }
      #aviso-propiedad-institucional dialog h2 { font-size:1.3rem; margin:0 0 14px; color:inherit; }
      #aviso-propiedad-institucional dialog p { margin:0 0 20px; color:inherit; line-height:1.7; }
      #aviso-propiedad-institucional .aviso-cerrar { display:block; margin-left:auto; padding:9px 18px; border-radius:8px; background:#1557a8; color:#fff; text-decoration:none; font-weight:700; }
      html[data-public-theme="dark"] #aviso-propiedad-institucional dialog { background:#192f4b; color:#f0f6ff; border-color:#587698; }
    `;
    document.head.appendChild(style);
    const wrapper = document.createElement("div");
    wrapper.id = "aviso-propiedad-institucional";
    const open = document.createElement("button");
    open.type = "button";
    open.textContent = "Acerca de";
    open.setAttribute("aria-label", "Acerca del portal y su propiedad intelectual");
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Acerca del Portal Institucional");
    const title = document.createElement("h2");
    title.textContent = "Acerca del Portal Institucional";
    const text = document.createElement("p");
    text.textContent = "Los contenidos, materiales y desarrollos propios publicados en este portal pertenecen a la E.E.T.P. N° 495 «Malvinas Argentinas». Su reproducción, distribución o utilización sin autorización, fuera de los usos permitidos por la ley, puede dar lugar a responsabilidades conforme a la Ley N° 11.723 de Propiedad Intelectual y demás normativa aplicable.";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "aviso-cerrar";
    close.textContent = "Cerrar";
    close.addEventListener("click", () => dialog.close());
    open.addEventListener("click", () => dialog.showModal());
    dialog.append(title, text, close);
    wrapper.append(open, dialog);
    const footer = document.querySelector("footer");
    if (footer) footer.appendChild(wrapper);
    else document.body.appendChild(wrapper);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();
