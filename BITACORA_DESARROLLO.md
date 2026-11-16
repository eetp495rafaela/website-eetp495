## 2026-11-16 — Reemplazos de Preceptoría (primera integración)

- Se agregó `assets/js/reemplazos-preceptoria.js` y un formulario independiente en Soporte y Gestión. Selecciona una titular con referente `PRECEPTOR` activo, su curso y una reemplazante activa con rol `PRECEPTORIA` (principal o adicional).
- Se registra en `reemplazos_docentes` con `tipoHorario: PRECEPTORIA`, `asignacionTitularId` apuntando a `referentes_institucionales`, fechas, estado y auditoría. Se impide duplicación superpuesta en el cliente; los formularios de Taller y EF no se alteraron.
- Se amplió la validación de creación desde Gestión en `firestore.rules` para `PRECEPTORIA`, verificando referente y reemplazante. Se conservan permisos de Gestión (Dirección/Secretaría/Asistente Administrativo registran; Preceptoría consulta).
- El listado y finalización existentes utilizan la colección común y permiten consultar/finalizar estos registros.
- **Importante:** el rol PRECEPTORIA ya habilita las funciones generales de Gestión. Esta integración **no agrega aún una capa de autorización por curso** a cada módulo ni proyecta las asignaciones temporales en todas las vistas de referentes. No considerar probado el acceso integral a los cursos hasta completar esa integración y pruebas con cuentas reales.
- **Pendiente:** prueba funcional en navegador con usuario de rol doble, registro desde ambos portales, cierre anticipado y vencimiento; revisión de reglas desplegadas en Firebase. Cambios en GitHub no equivalen a desplegar `firestore.rules`.
- **Sin modificar:** datos existentes, roles permanentes, asignaciones originales, Taller y EF. Auditoría de seguridad desde `1a3fe88` sigue pendiente.

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

## 2026-11-15 — Validación GA4 y botones simétricos de consentimiento

- Captura de **Google Analytics 4 > Tiempo real** aportada por la institución: se observaron **1 usuario activo**, **2 vistas de Inicio** y eventos `page_view`, `first_visit`, `scroll`, `session_start` y `user_engagement`. Confirma recepción de eventos del sitio público.
- Se ajustó solamente el CSS `vista-2027/assets/css/analytics-publico-2027.css` para que **No aceptar** y **Aceptar estadísticas** tengan el mismo ancho (`flex: 1 1 0`), manteniendo sus acciones y colores.
- Se cambió la versión de la referencia CSS a `?v=2` en las siete páginas públicas para evitar reutilizar la versión anterior de la hoja de estilos.
- Sin modificaciones a Firebase, permisos, datos académicos, portales internos ni al código de medición.
- Pendiente comprobación visual final de botones en pantallas grandes y móviles.

## 2026-11-15 — Aviso de estadísticas más amigable y transparente

- Se conservó el consentimiento previo: el sitio público solamente carga la etiqueta de GA4 cuando la persona acepta; si no acepta, puede usar el sitio igualmente, pero esa visita no se envía a Analytics por este mecanismo.
- Se reemplazó el título del aviso por **«¡Ayudanos a mejorar la web de nuestra escuela!»** y se explicó en lenguaje sencillo la finalidad de las estadísticas, el posible uso de cookies y datos técnicos por Google, la exclusión de los portales internos y la libertad de cambiar la decisión.
- Permanecen las dos opciones de igual tamaño: **No aceptar** y **Aceptar estadísticas**.
- Se actualizó la versión del script a `?v=2` en las siete páginas públicas para evitar que el navegador conserve el texto anterior.
- Se verificó la sintaxis JavaScript. No hubo cambios en la identificación de GA4, eventos, permisos, Firebase ni datos institucionales. Pendiente comprobación visual de la redacción en PC y celular.

## 2026-11-15 — Infraestructura del dominio (referencia; sin cambios técnicos)

- Dominio oficial: `eetp495rafaela.edu.ar`, registrado y gestionado ante **NIC Argentina (NIC.ar)**, según confirma el responsable del proyecto.
- **Cloudflare**: servicio donde se administran los DNS del dominio, según confirma el responsable. No se verificaron aquí los registros DNS ni eventuales reglas de proxy/HTTPS.
- **GitHub Pages**: publicación del repositorio `eetp495rafaela/website-eetp495` desde `main`, según `README.md`. El archivo `CNAME` contiene `eetp495rafaela.edu.ar`.
- URL predeterminada de GitHub Pages: `https://eetp495rafaela.github.io/website-eetp495/`. El responsable recuerda que se configuró su redirección al dominio institucional, pero **la redirección actual sigue pendiente de verificación**. No se modificó.
- Dominio canónico preferido para el SEO: `https://eetp495rafaela.edu.ar/`; sitemap en `/sitemap.xml`; propiedad de dominio en Google Search Console. En noviembre de 2026 se verificó que las cuatro páginas públicas podían indexarse y se solicitaron sus indexaciones. Login y los portales internos permanecen con `noindex,nofollow`.
- **Google Analytics 4** activo para el sitio público: propiedad **Sitio Web EETP 495** (ID `550788569`), flujo **Web Principal** (medición `G-57ZS2C1RQM`); hay eventos confirmados en Tiempo real y medición condicionada a consentimiento del visitante.
- Segunda propiedad GA4 `portal-institucional-eet-fa5c7` (ID `562634371`, medición `G-CCLJGLRT3V`): se decidió **conservarla**. No se constató actividad reciente ni se investigaron exhaustivamente sus posibles vinculaciones con Firebase; no eliminar sin revisión.
- Google Cloud/Firebase: proyecto `portal-institucional-eet-fa5c7`, usado para servicios del portal. No confundir el proyecto Cloud con la propiedad GA4 de igual nombre.
- Esta entrada **solo documenta** el estado conocido y el testimonio del responsable. No se cambian DNS, redirecciones, Cloudflare, NIC.ar, CNAME, Analytics, Firebase ni código del sitio.

## 2026-11-15 — PENDIENTE: completar auditoría de seguridad del repositorio público

**Estado:** auditoría preliminar realizada; continuar en un nuevo chat. **No modificar producción sin revisar y acordar cada intervención.**

### Lo revisado hasta ahora
- Revisión parcial de archivos actuales en `main`, `.gitignore`, `firestore.rules`, módulos de autenticación, administración, documentación, backup y otros JS/HTML de portales.
- No se detectaron claves privadas, contraseñas reales ni tokens privados evidentes en los archivos examinados. La `apiKey` de configuración web de Firebase es pública por diseño, pero debe tener restricciones y reglas adecuadas.
- En `firestore.rules` (3.178 líneas) no se detectaron reglas globales del tipo `allow read, write: if true`; existen controles por autenticación, perfil y roles. **No se ha comprobado que la versión del repositorio coincida con las reglas desplegadas en Firebase.**
- Varios módulos invocan URLs de Google Apps Script visibles en código público. **Es imprescindible comprobar que cada endpoint verifica en el servidor la identidad, el token Firebase y el rol**, especialmente backups, usuarios y documentación. La validación del navegador no es suficiente.
- Se detectó uso de `innerHTML` en diversos módulos; se observaron funciones de escape en muestras revisadas, pero resta una comprobación sistemática de inyección de HTML/XSS.
- `.gitignore` excluye `.env`, archivos habituales de cuentas de servicio y credenciales, backups y algunos informes internos. Esto no borra información previamente publicada en el historial.
- El repositorio público incluye `BITACORA_DESARROLLO.md` y documentación de arquitectura. Evaluar su exposición y la del historial Git. El ZIP histórico de trabajo incluye `.git`: no distribuirlo públicamente sin revisar.
- **Importante:** esta revisión fue parcial; no se completó un escaneo exhaustivo de todos los blobs y commits históricos ni una prueba dinámica contra producción. No afirmar seguridad absoluta ni ausencia total de secretos.

### Próximos pasos, en orden recomendado
1. **Firebase Console:** contrastar reglas de Firestore publicadas con `firestore.rules`; comprobar Auth, roles, App Check y acceso a datos de estudiantes y docentes, sin cambiar nada inicialmente.
2. **Google Cloud:** revisar restricciones de las API keys web y los servicios habilitados.
3. **Apps Script / Google Drive:** revisar permisos de implementación, validación de Firebase ID tokens y roles en el servidor, especialmente backup, documentación y gestión de usuarios; comprobar permisos de los archivos Drive.
4. **Repositorio GitHub público:** completar inventario de archivos, búsqueda de secretos y datos personales en `main` e historial; revisar bitácoras/manuales/ZIP; evaluar riesgos `innerHTML`/XSS, dependencias y exposición de endpoints, y evitar publicar documentación sensible.
5. **Informe final:** separar hallazgos confirmados, riesgos potenciales y verificaciones pendientes; proponer correcciones mínimas y seguras. No tocar reglas, secretos, datos ni módulos aprobados sin autorización explícita.

**Acuerdo:** dejar estos trabajos pendientes para retomarlos mañana en un nuevo chat. Esta entrada es solo documentación.



### 2026-11-16 — Reemplazos de Preceptoría: registro por titular
- Formularios de Soporte y Gestión: se elimina selección de curso, se corrige alineación del botón y se invalida caché del módulo.
- Un registro de reemplazo de Preceptoría abarca todos los cursos activos de la titular, conservando `asignacionesTitularIds` y `cursoIds` y los campos heredados para compatibilidad del listado.
- Reglas de Firestore: validación básica de listas de cursos/asignaciones en creación desde Gestión. **Pendiente de despliegue y pruebas con emulador o cuentas de prueba**.
- **No habilitar uso productivo todavía**: pendiente integrar y verificar permisos temporales efectivos por curso, validar que se extingan por fecha y finalizar pruebas de seguridad. No se alteran referentes ni roles permanentes.

### 2026-11-16 — Aclaración funcional: acceso temporal de Preceptoría
- Confirmado: PRECEPTORIA tiene acceso institucional general por rol; las asignaciones en Referentes Institucionales se usan para mostrar referentes en Portal Alumnos, no para limitar el acceso a Gestión.
- El reemplazo debe habilitar temporalmente la elección de PRECEPTORIA en el login a un DOCENTE sin asignarle el rol permanente; debe revocarse por fecha o finalización manual y comprobarse también en reglas Firestore.
- Se actualizó el selector de reemplazantes para admitir docentes activos y se ajustó el botón. **Pendiente:** autorización temporal segura en login, proteger-portal y Firestore. No usar en producción como habilitación de acceso hasta completar despliegue y pruebas.
