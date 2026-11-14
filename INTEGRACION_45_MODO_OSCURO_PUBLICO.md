# Integración 45 — Modo claro/oscuro en el sitio público

**Fecha:** 14/11/2026  
**Estado:** rama de desarrollo. No fusionar con `main` antes de probar.

## Alcance
- Solo el **sitio público 2027**, portada y las seis secciones de `vista-2027/`.
- Botón rectangular redondeado en el encabezado con ☀️ y 🌙. Se destaca el icono del modo activo. Cada clic alterna entre claro y oscuro, actualiza su accesibilidad (`aria-label`, `aria-pressed`) y guarda la elección en `localStorage`.
- Modo claro inicial; se restaura la elección en toda la navegación pública sin destellos claros cuando existe modo oscuro guardado.
- Hoja independiente de estilos oscuros con paleta azul institucional; se adaptan encabezado, tarjetas, calendarios, Plan de Estudios, transporte y contacto. No se invierten fotografías, escudos, ni íconos.
- Comportamiento en celular: selector junto al acceso al Portal Institucional y el menú. No modifica navegación ni lógica de la galería.
- Funciona sin cuenta, sin Firebase, sin Apps Script y sin llamadas de red adicionales salvo los recursos estáticos.
- No cambia login, Docentes, Gestión, Soporte o Alumnos. Sin modificar datos institucionales.

## Pruebas previstas
- Alternar tres veces en la portada y verificar alternancia completa, accesibilidad y la preferencia guardada.
- Navegar a La Escuela, Plan, Proyectos, Novedades, Calendario e Inscripciones con cada tema.
- Probar PC y celular, menú desplegable, contraste y fotografías.
- Inspeccionar que, al volver, persista el último modo elegido.
- Comprobar que ningún portal institucional heredó este cambio.
