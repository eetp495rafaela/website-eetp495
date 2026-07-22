"use strict";

/* =====================================================
   GALERÍA INSTITUCIONAL
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
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

  /*
   * Estas imágenes son temporales.
   * Se mantienen como portadas de las seis galerías.
   * Más adelante serán reemplazadas por las fotografías publicadas.
   */
  const galerias = {
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

  let imagenesGaleriaActual = [];
  let indiceImagenActual = 0;

  function actualizarVisor() {
    const imagenActual = imagenesGaleriaActual[indiceImagenActual];

    if (!imagenActual) {
      return;
    }

    imagenLightbox.src = imagenActual.src;
    imagenLightbox.alt = imagenActual.alt;

    contadorLightbox.textContent = `${indiceImagenActual + 1} de ${imagenesGaleriaActual.length}`;

    const hayVariasImagenes = imagenesGaleriaActual.length > 1;

    btnImagenAnterior.disabled = !hayVariasImagenes;
    btnImagenSiguiente.disabled = !hayVariasImagenes;
  }

  function abrirGaleria(codigoGaleria, tituloGaleria) {
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

    imagenLightbox.src = "";
    imagenLightbox.alt = "Imagen de la galería";
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
