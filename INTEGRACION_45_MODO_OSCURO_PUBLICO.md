# Integración 45 — Modo claro/oscuro del sitio público y los portales

**Fecha:** 14/11/2026  
**Estado final:** tema claro/oscuro revisado visualmente por el responsable en entorno local y aprobado para integración en `main`. Las verificaciones de despliegue público se realizan por separado.

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

**Estado de la etapa 45B:** estas correcciones se prepararon inicialmente en desarrollo. La aprobación visual posterior y los ajustes finales se consignan en el cierre siguiente.

## Pruebas previstas
- Alternar tres veces en la portada y verificar alternancia completa, accesibilidad y la preferencia guardada.
- Navegar a La Escuela, Plan, Proyectos, Novedades, Calendario e Inscripciones con cada tema.
- Probar PC y celular, menú desplegable, contraste y fotografías.
- Inspeccionar que, al volver, persista el último modo elegido.
- Comprobar que ninguna función institucional ni permiso depende de la elección del tema.

## Ajuste y ampliación aprobados (14/11/2026)

- El responsable confirmó que el selector público es cómodo y funciona visualmente. Detectó un caso de contraste: **«Nuestra historia»** en La Escuela tenía color azul fijado en línea; se sustituyó por `var(--navy)`, que es oscuro en claro y blanco azulado en oscuro.
- Se incorporó el mismo selector ☀️ / 🌙 en las barras superiores **visibles** de los cinco portales: Alumnos, Docentes, Docentes de Apoyo, Gestión y Soporte. Se evita el encabezado antiguo oculto de Gestión y Soporte.
- Se reutiliza `vista-2027/assets/js/tema-publico-2027.js` y la clave de almacenamiento `eetp495-public-theme`. Al navegar entre público y portales se conserva la preferencia. La operación de acceso de `login.html` permanece intacta; su adaptación visual se documenta en 45B.
- La nueva hoja `assets/css/portales/tema-portales-2027.css` contiene únicamente presentación (paneles, tablas, formularios, barra lateral, calendario/Si.R.A. y directorios). Se cargó **al final** de los estilos originales para tener prioridad de tema, sin modificar permisos, acciones, identificadores, semántica de alertas o datos.
- En pantallas pequeñas se prioriza menú, selector y salida. Solo a menos de 500 px se oculta el nombre en el encabezado, no el usuario ni sus permisos.
- Pruebas de referencia: `node --test tests/publico/*.test.cjs`. Se requiere revisión manual en PC y móvil de todos los módulos y, en particular, formularios, tablas, menús y contraste. **En esa etapa**, producción y `main` permanecían intactos. El cierre y la integración se documentan a continuación.

### Precisión de alcance (14/11/2026)

- También se incorporó el interruptor en `docentes-apoyo/index.html`, página separada de `docentes/index.html`.
- Su CSS exclusivo adapta filtros, tablas y avisos del DAI con colores legibles, sin cambiar la lógica de autorización de vínculos.

## Cierre del desarrollo — revisión final de los portales (14/11/2026)

**Aprobación visual:** el responsable revisó pantallas de los portales Docentes, Soporte, Alumnos y Gestión en el entorno local, comunicó incidencias de contraste y finalmente confirmó que el resto se veía correctamente. La confirmación es una revisión visual del usuario, no una auditoría automatizada completa de funciones, permisos o responsive.

**Últimos ajustes de la capa `assets/css/portales/tema-portales-2027.css`:**

- **Integración 46:** selectores nativos de Si.R.A. y Parte del Portal Docentes; etiquetas y títulos de modales de Soporte y SweetAlert2; tarjetas de bloques de **Horario de Aula únicamente**; cursos de mesas de examen en Soporte y Gestión; tabla de Mis docentes y panel de Mesas de Examen de Alumnos; distintivos de Horarios, panel de Docentes libres de Taller, mensaje informativo de Si.R.A., períodos y filtros de asistencia de Gestión.
- **Navegación:** se retiró exclusivamente el enlace «Volver al inicio» de las pantallas **Mesas de Examen de Docentes y Alumnos**, manteniendo la navegación superior y lateral.
- **Integración 47:** se aclararon el cargo, el correo y su ícono en las tarjetas de referentes de «Mis docentes» (Alumnos); se ajustó el mensaje de «Asistencias previstas para hoy» de Si.R.A. (Soporte), equivalente al ajuste de Gestión.
- **Caché:** las páginas afectadas referencian `tema-portales-2027.css?v=46` o `v=47` según el cierre de cada revisión; el archivo CSS es compartido. El modo claro conserva sus reglas base, salvo el ajuste localizado del rótulo «Mis compañeros».
- **Pruebas estáticas:** se actualizaron las verificaciones para aceptar versiones CSS vigentes y se agregó un control AA de los últimos colores. La ejecución propuesta es `node --test tests/publico/*.test.cjs`. La comprobación visual de los módulos fue realizada por el responsable; las pruebas automatizadas no sustituyen una revisión de flujos de datos.

**Sin cambios en:** Firestore, reglas y datos reales, permisos, App Check, Apps Script, autenticación, registro de asistencias, operaciones de alta/baja, ni lógica de inscripciones/mesas. Las tareas pendientes de seguridad de las integraciones 41 a 44 no se marcan como resueltas.

**Publicación acordada:** integrar la rama `desarrollo/modo-oscuro-publico-20261114` en `main`, origen del sitio publicado. La presencia del commit en `main` confirma la integración del código, pero no por sí sola la propagación completa de GitHub Pages ni el comportamiento bajo una sesión autenticada.

**Continuidad local:** actualizar las bitácoras privadas `BITACORA_MIGRACION_EETP495_2027.md` y `ESTADO_ACTUAL.md` en la laptop; ambos archivos se mantienen excluidos de Git.
