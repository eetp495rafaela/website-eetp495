// =====================================================
// RELOJ
// =====================================================

const reloj = document.querySelector(".reloj");

// Crear las 60 marcas
for (let i = 0; i < 60; i++) {
  const marca = document.createElement("span");

  marca.classList.add("marca");

  if (i % 5 === 0) {
    marca.classList.add("principal");
  }

  marca.style.transform = `rotate(${i * 6}deg)`;

  reloj.appendChild(marca);
}

const marcas = document.querySelectorAll(".marca");

// =====================================================
// ANIMACIÓN DEL RELOJ
// =====================================================

let animacion = null;

function iniciarAnimacion() {
  let indice = 0;
  let colorAmarillo = true;

  animacion = setInterval(() => {
    if (colorAmarillo) {
      marcas[indice].classList.add("activa");
      marcas[indice].classList.remove("blanca");
    } else {
      marcas[indice].classList.remove("activa");
      marcas[indice].classList.add("blanca");
    }

    indice++;

    if (indice >= marcas.length) {
      indice = 0;
      colorAmarillo = !colorAmarillo;
    }
  }, 20);
}

function detenerAnimacion() {
  clearInterval(animacion);
  animacion = null;

  marcas.forEach((marca) => {
    marca.classList.remove("activa");
    marca.classList.remove("blanca");
  });
}

// =====================================================
// LOGIN
// =====================================================

const boton = document.querySelector(".btn-ingresar");
const usuario = document.querySelector("#usuario");
const password = document.querySelector("#password");
const mensaje = document.querySelector(".mensaje-login");
boton.addEventListener("click", (e) => {
  e.preventDefault();

  if (animacion) return;

  mensaje.textContent = "";

  iniciarAnimacion();

  setTimeout(() => {
    if (usuario.value === "admin" && password.value === "1234") {
      detenerAnimacion();

      mensaje.textContent = "✅ Acceso concedido";

      setTimeout(() => {
        window.location.href = "admin/index.html";
      }, 800);

      // Más adelante acá iremos al portal
    } else {
      detenerAnimacion();

      mensaje.textContent = "❌ Usuario o contraseña incorrectos";
    }
  }, 2000);
});
