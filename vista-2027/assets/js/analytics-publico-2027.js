/* Analytics GA4 del sitio público E.E.T.P. N° 495.
 * Solo se carga tras consentimiento explícito. No incluir en Login ni portales.
 */
(() => {
  "use strict";
  const MEDICION = "G-57ZS2C1RQM";
  const CLAVE = "eetp495-analytics-consent-v1";
  let iniciado = false;

  const leerPreferencia = () => {
    try {
      const valor = localStorage.getItem(CLAVE);
      return valor === "si" || valor === "no" ? valor : null;
    } catch (_) { return null; }
  };

  const guardarPreferencia = (valor) => {
    try { localStorage.setItem(CLAVE, valor); } catch (_) {
      // Si no hay almacenamiento disponible, la elección aplica a esta página.
    }
  };

  const iniciarMedicion = () => {
    if (iniciado) return;
    iniciado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", MEDICION, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    // Nunca enviar parámetros de consulta ni fragmentos (pueden contener datos personales).
    const ruta = window.location.pathname;
    window.gtag("event", "page_view", {
      send_to: MEDICION,
      page_location: window.location.origin + ruta,
      page_path: ruta,
      page_title: document.title,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEDICION);
    document.head.appendChild(script);
  };

  const crearBoton = (texto, clase, accion) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;
    boton.addEventListener("click", accion);
    return boton;
  };

  function mostrarOpciones() {
    if (document.getElementById("eetp-consentimiento")) return;
    const caja = document.createElement("section");
    caja.id = "eetp-consentimiento";
    caja.className = "eetp-consentimiento";
    caja.setAttribute("aria-label", "Privacidad y estadísticas");
    const texto = document.createElement("div");
    const titulo = document.createElement("strong");
    titulo.textContent = "Privacidad y estadísticas";
    const parrafo = document.createElement("p");
    parrafo.textContent = "¿Nos permitís medir visitas anónimas al sitio público con Google Analytics? Es opcional y no afecta tu acceso. No medimos los portales internos.";
    texto.append(titulo, parrafo);
    const acciones = document.createElement("div");
    acciones.className = "eetp-consentimiento-acciones";

    const elegir = (acepta) => {
      guardarPreferencia(acepta ? "si" : "no");
      caja.remove();
      if (acepta) iniciarMedicion();
      else if (iniciado) {
        // Cortar de inmediato el envío de eventos y evitar tráfico al volver a cargar.
        window["ga-disable-" + MEDICION] = true;
        if (typeof window.gtag === "function") {
          window.gtag("consent", "update", { analytics_storage: "denied" });
        }
      }
    };
    acciones.append(
      crearBoton("No aceptar", "eetp-consentimiento-rechazar", () => elegir(false)),
      crearBoton("Aceptar estadísticas", "eetp-consentimiento-aceptar", () => elegir(true))
    );
    caja.append(texto, acciones);
    document.body.appendChild(caja);
    acciones.querySelector("button").focus({ preventScroll: true });
  }

  const pie = document.querySelector("footer");
  if (pie) {
    const acceso = crearBoton("Privacidad y estadísticas", "eetp-enlace-privacidad", mostrarOpciones);
    acceso.setAttribute("aria-label", "Cambiar preferencia de estadísticas");
    pie.appendChild(acceso);
  }

  if (leerPreferencia() === "si") iniciarMedicion();
  else if (leerPreferencia() === null) mostrarOpciones();
})();
