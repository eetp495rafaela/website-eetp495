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
