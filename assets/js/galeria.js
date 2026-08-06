"use strict";

/* =====================================================
   GALERÍA INSTITUCIONAL
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_GALERIA_URL =
    "https://script.google.com/macros/s/AKfycbwgqaaYJLlGZl7CcxcYRwy-qqPrlqKoL2L1qDxk0nqsPCbVZqmmbTS5KaCsdDNxVpq-/exec";

  const lightbox = document.getElementById("lightbox");
  const imagenLightbox = document.getElementById("imagenLightbox");
  const tituloLightbox = document.getElementById("tituloLightbox");
  const contadorLightbox = document.getElementById("contadorLightbox");

  const cerrarLightbox = document.getElementById("cerrarLightbox");
  const btnImagenAnterior = document.getElementById("btnImagenAnterior");
  const btnImagenSiguiente = document.getElementById("btnImagenSiguiente");

  const categoriasGaleria = document.querySelectorAll(".galeria-categoria");

  if (
    !lightbox ||
    !imagenLightbox ||
    !tituloLightbox ||
    !contadorLightbox ||
    !cerrarLightbox ||
    !btnImagenAnterior ||
    !btnImagenSiguiente
  ) {
    console.warn(
      "No se encontraron todos los elementos necesarios del visor de galería.",
    );

    return;
  }

  /* =====================================================
     IMÁGENES DE RESPALDO

     Se utilizarán cuando una categoría todavía no tenga
     fotografías publicadas o cuando el backend no responda.
  ===================================================== */

  const galeriasRespaldo = {
    "01-HISTORIA-EDIFICIO": [
      {
        src: "assets/img/escuela.jpg",
        alt: "Historia y edificio de la escuela",
      },
    ],

    "02-TALLERES": [
      {
        src: "assets/img/talleres.jpg",
        alt: "Talleres de la escuela",
      },
    ],

    "03-AULAS": [
      {
        src: "assets/img/aula.jpg",
        alt: "Aulas de la escuela",
      },
    ],

    "04-EXPOS-FERIAS-CONCURSOS": [
      {
        src: "assets/img/laboratorio.jpg",
        alt: "Participación en exposiciones, ferias y concursos",
      },
    ],

    "05-ACTOS-ESCOLARES": [
      {
        src: "assets/img/actos.jpg",
        alt: "Actos escolares",
      },
    ],

    "06-ACTIVIDADES-VARIAS": [
      {
        src: "assets/img/patio.jpg",
        alt: "Actividades institucionales variadas",
      },
    ],
  };

  /*
   * Inicialmente se cargan las imágenes de respaldo.
   * Cuando responde el backend, se reemplazan únicamente
   * las categorías que tengan fotografías publicadas.
   */
  const galerias = {
    ...galeriasRespaldo,
  };

  let imagenesGaleriaActual = [];
  let indiceImagenActual = 0;

  /* =====================================================
     PORTADAS DE LAS CATEGORÍAS
  ===================================================== */

  function actualizarPortadaCategoria(codigoGaleria, imagen) {
    if (!imagen?.src) {
      return;
    }

    const categoria = Array.from(categoriasGaleria).find((elemento) => {
      return elemento.dataset.galeria === codigoGaleria;
    });

    if (!categoria) {
      return;
    }

    const imagenPortada = categoria.querySelector("img");

    if (!imagenPortada) {
      return;
    }

    const srcRespaldo = imagenPortada.getAttribute("src");

    imagenPortada.dataset.srcRespaldo = srcRespaldo || "";
    imagenPortada.src = imagen.src;
    imagenPortada.alt = imagen.alt || categoria.dataset.titulo || "Galería";

    imagenPortada.addEventListener(
      "error",
      () => {
        const respaldo = imagenPortada.dataset.srcRespaldo;

        if (respaldo && imagenPortada.src !== respaldo) {
          imagenPortada.src = respaldo;
        }
      },
      { once: true },
    );
  }

  /* =====================================================
     CONSULTA AL BACKEND
  ===================================================== */

  async function cargarGaleriasPublicadas() {
    const controlador = new AbortController();

    const temporizador = window.setTimeout(() => {
      controlador.abort();
    }, 12000);

    try {
      const urlConsulta =
        `${BACKEND_GALERIA_URL}?accion=obtener_galeria` + `&_=${Date.now()}`;

      const respuesta = await fetch(urlConsulta, {
        method: "GET",
        cache: "no-store",
        signal: controlador.signal,
      });

      const texto = await respuesta.text();

      let datos;

      try {
        datos = JSON.parse(texto || "{}");
      } catch (error) {
        console.error("Respuesta recibida del backend:", texto);

        throw new Error(
          "La respuesta de la galería no pudo interpretarse correctamente.",
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje ||
            `El servidor respondió con el código HTTP ${respuesta.status}.`,
        );
      }

      if (!datos.ok || !datos.galerias) {
        throw new Error(
          datos.mensaje ||
            "No fue posible obtener las fotografías institucionales.",
        );
      }

      Object.keys(galeriasRespaldo).forEach((codigoGaleria) => {
        const imagenesPublicadas = datos.galerias[codigoGaleria];

        if (!Array.isArray(imagenesPublicadas)) {
          return;
        }

        const imagenesValidas = imagenesPublicadas
          .filter((imagen) => {
            return (
              imagen &&
              typeof imagen.src === "string" &&
              imagen.src.trim() !== ""
            );
          })
          .map((imagen) => {
            return {
              id: String(imagen.id || "").trim(),
              src: imagen.src.trim(),
              alt: String(
                imagen.alt ||
                  imagen.nombreArchivo ||
                  "Fotografía institucional",
              ).trim(),
              nombreArchivo: String(imagen.nombreArchivo || "").trim(),
              fechaPublicacion: String(imagen.fechaPublicacion || "").trim(),
            };
          });

        /*
         * Si la categoría tiene fotografías publicadas,
         * reemplazamos la imagen temporal.
         *
         * Si está vacía, se conserva la portada local.
         */
        if (imagenesValidas.length > 0) {
          galerias[codigoGaleria] = imagenesValidas;

          actualizarPortadaCategoria(codigoGaleria, imagenesValidas[0]);
        }
      });

      console.info(
        `Galería institucional cargada correctamente. Fotografías publicadas: ${
          Number(datos.total) || 0
        }.`,
      );
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(
          "La consulta de la galería superó el tiempo máximo de espera. Se utilizarán las imágenes de respaldo.",
        );

        return;
      }

      console.error("No fue posible cargar las fotografías publicadas:", error);

      /*
       * No interrumpimos el sitio.
       * Se mantienen las seis imágenes locales de respaldo.
       */
    } finally {
      window.clearTimeout(temporizador);
    }
  }

  const promesaCargaGaleria = cargarGaleriasPublicadas();

  /* =====================================================
     VISOR DE IMÁGENES
  ===================================================== */

  function actualizarVisor() {
    const imagenActual = imagenesGaleriaActual[indiceImagenActual];

    if (!imagenActual) {
      return;
    }

    imagenLightbox.src = imagenActual.src;
    imagenLightbox.alt =
      imagenActual.alt || imagenActual.nombreArchivo || "Imagen de la galería";

    contadorLightbox.textContent = `${indiceImagenActual + 1} de ${imagenesGaleriaActual.length}`;

    const hayVariasImagenes = imagenesGaleriaActual.length > 1;

    btnImagenAnterior.disabled = !hayVariasImagenes;
    btnImagenSiguiente.disabled = !hayVariasImagenes;
  }

  async function abrirGaleria(codigoGaleria, tituloGaleria) {
    /*
     * Esperamos la consulta del backend antes de abrir.
     * Si falla, la promesa igualmente termina y se usa el respaldo.
     */
    await promesaCargaGaleria;

    const imagenes = galerias[codigoGaleria];

    if (!Array.isArray(imagenes) || imagenes.length === 0) {
      console.warn(`La galería ${codigoGaleria} no tiene imágenes.`);

      return;
    }

    imagenesGaleriaActual = imagenes;
    indiceImagenActual = 0;

    tituloLightbox.textContent = tituloGaleria;

    actualizarVisor();

    lightbox.classList.add("activo");
    lightbox.setAttribute("aria-hidden", "false");

    document.body.classList.add("sin-scroll");

    cerrarLightbox.focus();
  }

  function cerrarGaleria() {
    lightbox.classList.remove("activo");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("sin-scroll");

    imagenLightbox.removeAttribute("src");
    imagenLightbox.alt = "Imagen de la galería";

    imagenesGaleriaActual = [];
    indiceImagenActual = 0;
  }

  function mostrarImagenAnterior() {
    if (imagenesGaleriaActual.length <= 1) {
      return;
    }

    indiceImagenActual =
      (indiceImagenActual - 1 + imagenesGaleriaActual.length) %
      imagenesGaleriaActual.length;

    actualizarVisor();
  }

  function mostrarImagenSiguiente() {
    if (imagenesGaleriaActual.length <= 1) {
      return;
    }

    indiceImagenActual =
      (indiceImagenActual + 1) % imagenesGaleriaActual.length;

    actualizarVisor();
  }

  /* =====================================================
     EVENTOS GALERIA NUEVA ultima
  ===================================================== */

  categoriasGaleria.forEach((categoria) => {
    function abrirCategoria() {
      abrirGaleria(categoria.dataset.galeria, categoria.dataset.titulo);
    }

    categoria.addEventListener("click", abrirCategoria);

    categoria.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();

        abrirCategoria();
      }
    });
  });

  cerrarLightbox.addEventListener("click", cerrarGaleria);

  btnImagenAnterior.addEventListener("click", mostrarImagenAnterior);

  btnImagenSiguiente.addEventListener("click", mostrarImagenSiguiente);

  lightbox.addEventListener("click", (evento) => {
    if (evento.target === lightbox) {
      cerrarGaleria();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (!lightbox.classList.contains("activo")) {
      return;
    }

    if (evento.key === "Escape") {
      cerrarGaleria();
    }

    if (evento.key === "ArrowLeft") {
      mostrarImagenAnterior();
    }

    if (evento.key === "ArrowRight") {
      mostrarImagenSiguiente();
    }
  });
});
