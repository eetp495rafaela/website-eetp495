# Integración 45 — Modo claro/oscuro del sitio público y los portales

**Fecha:** 14/11/2026  
**Estado:** sitio público validado visualmente por el responsable; ampliación a los cinco portales preparada en desarrollo, pendiente de prueba local. No fusionar con `main` antes de probar.

## Alcance inicial (sitio público)
- El **sitio público 2027**, portada y las seis secciones de `vista-2027/`.
- Botón rectangular redondeado en el encabezado con ☀️ y 🌙. Se destaca el icono del modo activo. Cada clic alterna entre claro y oscuro, actualiza su accesibilidad (`aria-label`, `aria-pressed`) y guarda la elección en `localStorage`.
- Modo claro inicial; se restaura la elección en toda la navegación pública sin destellos claros cuando existe modo oscuro guardado.
- Hoja independiente de estilos oscuros con paleta azul institucional; se adaptan encabezado, tarjetas, calendarios, Plan de Estudios, transporte y contacto. No se invierten fotografías, escudos, ni íconos.
- Comportamiento en celular: selector junto al acceso al Portal Institucional y el menú. No modifica navegación ni lógica de la galería.
- Funciona sin cuenta, sin Firebase, sin Apps Script y sin llamadas de red adicionales salvo los recursos estáticos.
- Sin modificar datos institucionales ni la lógica de las aplicaciones.


## Auditoría visual integral por capturas — Integración 45B (14/11/2026)

**Autorización:** el responsable finalizó la revisión de capturas y pidió corregir los portales de manera integral.

- **Docentes:** Mis Horarios (degradado amarillo), Si.R.A. Registro (tarjetas, nombres y controles), Parte (encabezado y resultados), Situación (mensajes sin datos), Calificaciones (filtros y estados lectura/edición), Documentación Académica (tabla), Mesas de Examen (panel y filtros), Agenda (desplegables), Gestiones Docentes y Normativa (tarjetas PDF).
- **Soporte:** Usuarios y DAI, Contactos, Referentes, Estudiantes y cambio de ciclo, Cursos, Asignaciones/Reemplazos, Horarios, Docentes libres (se conservan colores semánticos), Calificaciones, Si.R.A., modales.
- **Gestión:** formularios, tablas, S.I.M.E., Si.R.A., horarios, directorio DAI, mensajes.
- **Alumnos:** horarios, documentos, S.I.M.E., listados y referentes.
- **Docentes de Apoyo:** filtros, tablas de informes, agendas y asistencia.
- **Login:** se añadió el mismo selector, con CSS específico de contraste. No cambia el login con Google, solicitudes ni fotografías.

**Criterio:** `tema-portales-2027.css` contiene overrides exclusivamente visuales bajo el atributo de tema. El CSS para el login es separado. Se conservan estados de asistencia, éxito/error, libre/ocupado y lectura/edición, y ningún usuario obtiene permisos nuevos.

**Pruebas:** validación estática de sintaxis agrupada, estructura, alternancia y contrastes AA de combinaciones centrales; tests locales en `tests/publico/tema-contrastes.test.cjs`. Son pruebas estáticas: no reemplazan una validación visual real en cada módulo y navegador.

**Incidencias funcionales observadas, fuera de alcance:** App Check/reCAPTCHA en Documentación Académica y un posible registro de Calificaciones sin inicializar. El CSS no resuelve esos errores ni modifica autenticación.

**Estado:** cambios preparados en la rama de desarrollo y **aún no publicados**. Se requiere prueba local antes de fusionar.

## Pruebas previstas
- Alternar tres veces en la portada y verificar alternancia completa, accesibilidad y la preferencia guardada.
- Navegar a La Escuela, Plan, Proyectos, Novedades, Calendario e Inscripciones con cada tema.
- Probar PC y celular, menú desplegable, contraste y fotografías.
- Inspeccionar que, al volver, persista el último modo elegido.
- Comprobar que ninguna función institucional ni permiso depende de la elección del tema.

## Ajuste y ampliación aprobados (14/11/2026)

- El responsable confirmó que el selector público es cómodo y funciona visualmente. Detectó un caso de contraste: **«Nuestra historia»** en La Escuela tenía color azul fijado en línea; se sustituyó por `var(--navy)`, que es oscuro en claro y blanco azulado en oscuro.
- Se incorporó el mismo selector ☀️ / 🌙 en las barras superiores **visibles** de los cinco portales: Alumnos, Docentes, Docentes de Apoyo, Gestión y Soporte. Se evita el encabezado antiguo oculto de Gestión y Soporte.
- Se reutiliza `vista-2027/assets/js/tema-publico-2027.js` y la clave de almacenamiento `eetp495-public-theme`. Al navegar entre público y portales se conserva la preferencia. `login.html` permanece sin cambios.
- La nueva hoja `assets/css/portales/tema-portales-2027.css` contiene únicamente presentación (paneles, tablas, formularios, barra lateral, calendario/Si.R.A. y directorios). Se cargó **al final** de los estilos originales para tener prioridad de tema, sin modificar permisos, acciones, identificadores, semántica de alertas o datos.
- En pantallas pequeñas se prioriza menú, selector y salida. Solo a menos de 500 px se oculta el nombre en el encabezado, no el usuario ni sus permisos.
- Pruebas de referencia: `node --test tests/publico/*.test.cjs`. Se requiere revisión manual en PC y móvil de todos los módulos y, en particular, formularios, tablas, menús y contraste. **Producción y `main` intactos.**

### Precisión de alcance (14/11/2026)

- También se incorporó el interruptor en `docentes-apoyo/index.html`, página separada de `docentes/index.html`.
- Su CSS exclusivo adapta filtros, tablas y avisos del DAI con colores legibles, sin cambiar la lógica de autorización de vínculos.
