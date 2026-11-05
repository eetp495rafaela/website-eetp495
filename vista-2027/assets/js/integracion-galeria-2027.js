"use strict";
/**
 * Website 2027 — integración pública inicial, SOLO LECTURA.
 * Mantiene intactas la maqueta aprobada, los scripts del sitio vigente,
 * las conexiones Apps Script y las reglas del backend.
 * No realiza ninguna escritura ni solicita autenticación.
 *
 * Contrato tomado de assets/js/galeria.js del Website 2026:
 * GET ?accion=obtener_galeria --> {ok, galerias:{codigo:[{src,alt,...}]}}.
 */
(() => {
  const BACKEND_GALERIA_URL =
    "https://script.google.com/macros/s/AKfycbwgqaaYJLlGZl7CcxcYRwy-qqPrlqKoL2L1qDxk0nqsPCbVZqmmbTS5KaCsdDNxVpq-/exec";
  const CODIGOS = [
    "01-HISTORIA-EDIFICIO",
    "02-TALLERES",
    "03-AULAS",
    "04-EXPOS-FERIAS-CONCURSOS",
    "05-ACTOS-ESCOLARES",
    "06-ACTIVIDADES-VARIAS",
  ];
  // Las cinco tarjetas de la maqueta conservan su disposición exacta.
  // La última agrupa las dos categorías de vida escolar, sólo en esta prueba.
  const MAPA_TARJETAS = [
    [CODIGOS[0]],
    [CODIGOS[3]],
    [CODIGOS[1]],
    [CODIGOS[2]],
    [CODIGOS[4], CODIGOS[5]],
  ];
  const FALLBACKS = {
    [CODIGOS[0]]: [
      {
        src: "vista-2027/assets/img/escuela.webp",
        alt: "Historia y edificio de la escuela",
      },
    ],
    [CODIGOS[1]]: [
      {
        src: "vista-2027/assets/img/talleres.webp",
        alt: "Talleres de la escuela",
      },
    ],
    [CODIGOS[2]]: [
      { src: "vista-2027/assets/img/aula.webp", alt: "Aulas de la escuela" },
    ],
    [CODIGOS[3]]: [
      {
        src: "vista-2027/assets/img/laboratorio.webp",
        alt: "Exposiciones, ferias y concursos",
      },
    ],
    [CODIGOS[4]]: [
      { src: "vista-2027/assets/img/actos.webp", alt: "Actos escolares" },
    ],
    [CODIGOS[5]]: [
      {
        src: "vista-2027/assets/img/patio.webp",
        alt: "Actividades institucionales",
      },
    ],
  };
  const galerias = { ...FALLBACKS };
  const tiles = [...document.querySelectorAll("#galeria .gallery-tile")];
  const dialog = document.getElementById("gallery-lightbox");
  const img = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  if (tiles.length !== 5 || !dialog || !img || !caption) {
    console.warn(
      "Integración galería 2027: estructura visual inesperada; se mantiene la maqueta sin modificar.",
    );
    return;
  }
  let current = [];
  let index = 0;
  let trigger = null;
  const resolve = (codes) =>
    codes.flatMap((code) => galerias[code] || FALLBACKS[code] || []);
  const isValidSource = (value) => {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const uri = new URL(value);
      return uri.protocol === "https:";
    } catch {
      return false;
    }
  };
  function showImage() {
    if (!current.length) return;
    const item = current[index];
    img.src = item.src;
    img.alt = item.alt || "Fotografía institucional";
    caption.textContent = `${item.alt || "Galería institucional"} · ${index + 1} de ${current.length}`;
    img.title =
      current.length > 1
        ? "Seleccionar para ver la siguiente fotografía"
        : "Fotografía institucional";
    img.style.cursor = current.length > 1 ? "pointer" : "default";
  }
  function go(delta) {
    if (!dialog.open || current.length <= 1) return;
    index = (index + delta + current.length) % current.length;
    showImage();
  }
  // Listener en fase de captura: evita abrir al mismo tiempo el visor de
  // demostración que instala maqueta.js, sin modificar el script aprobado.
  tiles.forEach((tile, i) =>
    tile.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        current = resolve(MAPA_TARJETAS[i]);
        index = 0;
        trigger = tile;
        if (!current.length) return;
        showImage();
        if (!dialog.open) dialog.showModal();
      },
      { capture: true },
    ),
  );
  img.addEventListener("click", () => go(1));
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  });
  let touchStart = null;
  img.addEventListener(
    "touchstart",
    (e) => {
      touchStart = e.changedTouches[0]?.screenX ?? null;
    },
    { passive: true },
  );
  img.addEventListener(
    "touchend",
    (e) => {
      if (touchStart === null) return;
      const diff = (e.changedTouches[0]?.screenX ?? touchStart) - touchStart;
      if (Math.abs(diff) > 60) go(diff < 0 ? 1 : -1);
      touchStart = null;
    },
    { passive: true },
  );
  dialog.addEventListener("close", () => {
    img.removeAttribute("title");
    if (trigger) trigger.focus();
  });
  async function loadPublished() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(
        `${BACKEND_GALERIA_URL}?accion=obtener_galeria&_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload?.ok || !payload.galerias)
        throw new Error("Respuesta no válida del backend de galería");
      for (const code of CODIGOS) {
        const entries = payload.galerias[code];
        if (!Array.isArray(entries)) continue;
        const valid = entries
          .filter((x) => x && isValidSource(x.src))
          .map((x) => ({
            src: x.src.trim(),
            alt: String(
              x.alt || x.nombreArchivo || "Fotografía institucional",
            ).trim(),
          }));
        if (valid.length) galerias[code] = valid;
      }
      tiles.forEach((tile, i) => {
        const published = MAPA_TARJETAS[i].flatMap((code) =>
          galerias[code] !== FALLBACKS[code] ? galerias[code] : [],
        );
        const first = published[0];
        const photo = tile.querySelector("img");
        // No cambiar la portada aprobada si sólo contamos con respaldos.
        if (!first || !photo) return;
        const fallback = photo.getAttribute("src");
        // Exactamente como la galería vigente: respaldo ante imagen fallida.
        photo.addEventListener(
          "error",
          () => {
            if (fallback) photo.src = fallback;
          },
          { once: true },
        );
        photo.src = first.src;
        photo.alt = first.alt;
      });
      console.info(
        "Galería 2027: consulta pública conectada; sin modificaciones de datos.",
      );
    } catch (error) {
      console.warn("Galería 2027: se conservan imágenes de respaldo.", error);
    } finally {
      clearTimeout(timeout);
    }
  }
  loadPublished();
})();
