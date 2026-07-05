const btnArriba = document.getElementById("btnArriba");

if (btnArriba) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btnArriba.classList.add("mostrar");
    } else {
      btnArriba.classList.remove("mostrar");
    }
  });

  btnArriba.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
