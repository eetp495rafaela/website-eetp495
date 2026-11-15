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

