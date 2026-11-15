# Bitácora de desarrollo — Website 2027

Repositorio: `eetp495rafaela/website-eetp495`  
Rama de trabajo: `main`

## 2026-11-15 — Planilla imprimible de asistencia a reuniones

**Archivo modificado:** `assets/js/contactos-institucionales.js`  
**Commit de implementación:** `5e371282906590a33743a1d06981ca1bf146ecd2`

- Se amplió la planilla desde cuatro hasta seis columnas: Apellido y nombre, DNI, Correo, Firma, Constancia y Escuela.
- Se ajustaron los anchos a 23 %, 11 %, 27 %, 17 %, 11 % y 11 %, respectivamente, conservando la impresión en A4 horizontal.
- La columna Constancia incorpora una casilla vacía por persona: marcada significa **Sí**; sin marcar significa **No**.
- La columna Escuela queda libre para completar a mano los números de uno o varios establecimientos donde presentar la constancia.
- Se excluyen **solo de la planilla imprimible** las cuentas `soportetecnico.tec495@gmail.com` (Soporte Técnico - Administrador) y `enviotrabajos495@gmail.com` (Soporte Técnico - Auxiliar).
- La exclusión se realiza por igualdad exacta de correo normalizado; **no depende del rol Soporte**. Un docente con rol Soporte sigue figurando, salvo que corresponda a una de esas dos cuentas.
- Se conservan datos institucionales, acceso desde Soporte y Gestión, grupos alfabéticos, DNI cargados, encabezado y pie, y función de impresión/guardado como PDF.
- No se cambió la base de datos ni se alteraron registros o permisos.
- **Pendiente de validación visual:** comprobar en el PDF real los correos largos, el espacio de firmas, la casilla y los saltos de página.

## Estado del repositorio al 2026-11-15

- GitHub remoto: verificada **una sola rama**, `main`.
- La actualización de la laptop debe realizarse localmente con `git fetch` y `git pull --ff-only`, después de comprobar que no haya cambios sin guardar.

## 2026-11-15 — Modal de reunión para planilla imprimible

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `aa16f0c67054fde0f838eb49745531ee2525272d`

- Al generar la planilla desde Contactos Institucionales (Soporte o Gestión) se abre un modal que pregunta si corresponde a una reunión.
- Si se elige **Sí**, exige Fecha de reunión, Horario (formato 24 horas HH:mm), Lugar y Motivo; los muestra en una fila sobre la tabla imprimible.
- Si se elige **No**, genera la misma planilla sin la fila de datos de reunión.
- **Cancelar** o cerrar el modal no genera documentos ni modifica contactos.
- Los campos se utilizan solamente para el documento generado; no se persisten en Firestore.
- Se preservan las seis columnas, la casilla de constancia, las dos exclusiones por correo y la impresión A4 horizontal.
- **Pendiente de prueba manual en navegador:** flujo Sí/No/Cancelar, validación HH:mm, saltos de página y visualización del motivo largo.

## 2026-11-15 — Corrección visual del modal de planilla

- **Commit:** `05d5aa8acc68adf499241dd4e7a50365196508b9`.
- Se fuerza la ubicación centrada del diálogo en la ventana para evitar interferencias de estilos globales del portal.
- Se restablece el fondo blanco y el texto oscuro del modal; se limita su alto al espacio visible con desplazamiento interno en pantallas pequeñas.
- No se modificaron formularios, contactos, filtros ni la generación de PDFs.
- Pendiente: confirmar visualmente el resultado en Soporte y Gestión.

## 2026-11-15 — Selección de Departamento/Curso al generar planilla

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `25f890fc83cc7fc293cdac4476183300a5f465bb`

- Se suma al modal la opción predeterminada **Todos los contactos activos** y la alternativa **Elegir Departamento/Curso**, basada en las etiquetas institucionales existentes.
- El listado de etiquetas se construye a partir de una consulta actual al servidor, considerando solo contactos activos elegibles para impresión; no depende de los filtros de la tabla en pantalla.
- Una etiqueta puede corresponder a varios docentes y un docente puede tener varias etiquetas; se imprime una sola fila por contacto incluido.
- La selección por Departamento/Curso se combina con la elección Sí/No de reunión, manteniendo fecha, horario de 24 horas, lugar y motivo cuando corresponda.
- Las dos cuentas técnicas continúan excluidas por correo exacto; la autorización de Soporte de cualquier otro docente no lo excluye.
- Se identifican el Departamento/Curso elegido y la cantidad de personas en el encabezado del documento. No hay cambios en Firestore ni datos institucionales.
- **Pendiente:** validar visualmente el modal en Soporte y Gestión y comprobar la salida impresa en ambos modos, incluyendo usuarios con varias etiquetas.

## 2026-11-15 — Compatibilidad del modal con modo oscuro

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `363cffd76fead34114d1ab7877dc3f8961f47d65`

- Se detecta el modo oscuro ya utilizado en los portales mediante el selector CSS `html[data-public-theme="dark"]`.
- El modal de generación de planilla adapta fondo, título, etiquetas, controles, selectores, botones y contraste al modo activo sin perder el estilo claro ni su centrado.
- Sin cambios en permisos, usuarios, datos, consultas, filtrado por Departamento/Curso o generación del PDF.
- Se constató que el commit local del usuario `f7686d4` modificó los nombres visibles Si.R.A. y S.I.M.E. e incluyó reformateo HTML; ese archivo no se alteró en este ajuste.
- Pendiente: verificar el resultado en modo claro y oscuro desde Soporte y Gestión.

## 2026-11-15 — Mejora del ancho de CORREO en planilla

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `226ef5e04240ed394f92ff241f43e3148327c5db`

- Se redistribuyeron los anchos de las seis columnas de la planilla A4 horizontal: Apellido y nombre 23 %, DNI 11 %, Correo 33 %, Firma 17 %, Constancia 8 % y Escuela 8 %.
- Correo gana 6 puntos porcentuales para reducir cortes de direcciones largas en la vista imprimible; Constancia y Escuela ceden 3 puntos porcentuales cada una.
- No se modificaron los filtros, las casillas, los datos de reunión, las cuentas excluidas ni los datos institucionales.
- **Pendiente:** verificar visualmente la impresión y revisar los correos excepcionalmente largos.

## 2026-11-15 — Corrección urgente: restaurar botones de Contactos Institucionales

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `f56f7195d1b9c6f4c888c2ff952a95e04e85d133`

- Se corrigió un error de sintaxis introducido en la cadena JavaScript que define el CSS del modo oscuro del modal: las comillas dobles sin escapar en `data-public-theme="dark"` impedían que el navegador interpretara el módulo.
- El fallo afectaba a los tres botones de Contactos Institucionales, pues no se registraban sus manejadores de eventos.
- Los selectores CSS usan ahora comillas simples dentro de la cadena JavaScript; se verificó que el archivo completo supera el análisis sintáctico de JavaScript (sin las declaraciones `import`).
- No se modificaron las consultas, las funciones de los botones, los datos institucionales ni los permisos.
- **Pendiente:** comprobación manual de los tres botones y del modal en modo claro/oscuro desde los portales Soporte y Gestión.

## 2026-11-15 — Legibilidad de encabezados Constancia y Escuela

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `e2dc44efdb75a566d20aa622623912f80cf7ff81`

- Se redujo exclusivamente la fuente de los encabezados **CONSTANCIA** y **ESCUELA** de 12 px a 10 px y su padding horizontal de 7 px a 3 px.
- Se aplicó `white-space: nowrap` a esos encabezados para evitar solapamientos visuales.
- Se conservaron los porcentajes de ancho, casillas, altura de filas, contenido y el resto de funcionalidades.
- Se comprobó sintaxis JavaScript; pendiente verificación visual en navegador e impresión.

## 2026-11-15 — Controles Sí/No más grandes en modal

**Archivo:** `assets/js/contactos-institucionales.js`  
**Commit:** `1c744dd1d6601842f129cc2c03e66edbe6e23bc5`

- Se aumentó a 21 × 21 px el tamaño de las dos opciones de selección (Sí y No) para identificar si la planilla corresponde a una reunión.
- Se conserva el comportamiento nativo, la selección exclusiva y la adaptación al modo oscuro.
- No se cambiaron el filtro Departamento/Curso, la impresión ni los datos institucionales.
- Se comprobó sintaxis JavaScript; pendiente comprobación visual en Soporte y Gestión.

## 2026-11-15 — Auditoría SEO y habilitación controlada de indexación pública

**Repositorio:** `eetp495rafaela/website-eetp495` · rama `main`  
**Implementación:** commits `ee455d0`, `3d07991`, `daa5152`, `47a0f18` y `ef64d88`.

- Google Search Console (capturas proporcionadas): la propiedad de dominio existe; el sitemap previo se procesaba correctamente pero declaraba solo una URL. Informe al 08/11/2026: una URL indexada (`https://eetp495rafaela.edu.ar/`) y dos excluidas por `noindex` (raíz HTTP y `/login.html`). Los datos de Search Console pueden tener retraso y no prueban el estado actual.
- Se habilitó `index,follow` solamente en: `index.html`, `vista-2027/escuela.html`, `vista-2027/plan-estudios.html` y `vista-2027/calendario.html`.
- A cada una se incorporó una URL canónica absoluta HTTPS y una descripción específica de su contenido institucional.
- `sitemap.xml` ahora declara esas cuatro URLs públicas definitivas.
- Se preservaron `noindex,nofollow` en `login.html`, los cinco portales internos (Soporte, Gestión, Docentes, Estudiantes y Docentes de Apoyo) y las páginas públicas con contenido demostrativo (`proyectos.html`, `novedades.html` e `inscripciones.html`).
- `robots.txt` se conserva intacto para que los buscadores puedan leer las etiquetas `noindex` de las páginas que deben excluirse.
- Se comprobaron de nuevo los indicadores de indexación en los 13 HTML pertinentes y las cuatro entradas del sitemap; no se alteraron JavaScript, estilos, autenticación, permisos, Firebase ni datos institucionales.
- **Pendiente:** verificar el despliegue público; actualizar/enviar sitemap en Search Console, inspeccionar las cuatro URLs HTTPS y seguir los informes de indexación. No hay garantía de indexación ni de posiciones por el solo hecho de habilitarla.
- **Google Analytics 4:** no se detectó instalación en el código revisado; pendiente verificar si existe propiedad y flujo de datos en la cuenta institucional antes de incorporarlo.

## 2026-11-15 — Google Analytics 4 para Website 2027 (solo sitio público)

- Se verificó desde la cuenta institucional la propiedad GA4 **Sitio Web EETP 495**, flujo **Web Principal**, URL `https://eetp495rafaela.edu.ar` e ID de medición `G-57ZS2C1RQM`. La captura de Analytics indicaba ausencia de datos durante las últimas 48 horas.
- Se crearon `vista-2027/assets/js/analytics-publico-2027.js` y `vista-2027/assets/css/analytics-publico-2027.css`; se incorporaron a **siete páginas públicas**: Inicio, La Escuela, Plan de Estudios, Calendario Escolar, Proyectos, Novedades e Inscripciones.
- No se añadió la etiqueta a `login.html` ni a los cinco portales autenticados. Las tres páginas públicas aún demostrativas continúan con `noindex,nofollow`.
- Se implementó aviso de consentimiento no obligatorio, con opciones **No aceptar** y **Aceptar estadísticas**, persistencia local de la elección y acceso permanente a **Privacidad y estadísticas** en el pie de las páginas públicas.
- **Sin consentimiento afirmativo no se descarga `gtag.js` ni se envían eventos GA4.** Con consentimiento, se mantiene almacenamiento publicitario denegado, se inhabilitan señales de publicidad y se emiten vistas de páginas con ruta sin query string ni fragmentos.
- La persona puede cambiar su preferencia posteriormente. Al rechazar/revocar, se deshabilita el envío y se intenta retirar las cookies propias de GA que sean accesibles al navegador.
- Se comprobó mediante lectura de la rama `main` que las siete páginas públicas contienen una sola referencia al módulo y su CSS, que los seis documentos privados revisados no contienen dichas referencias, y que el JavaScript supera la comprobación de sintaxis.
- **Pendiente:** comprobar visualmente el aviso en móvil y escritorio, modos claro y oscuro; probar consentimiento/rechazo; verificar evento `page_view` en **Tiempo real** de GA4 después de la publicación. No se comprobó aún la recepción real de eventos.
- No se alteraron autenticación, permisos, Firebase, bases de datos ni funcionamiento de módulos institucionales.

