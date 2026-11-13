# Docentes de Apoyo — Integración 41

**Fecha:** 12/11/2026  
**Estado:** interfaz y backend preparados para producción; comprobaciones de seguridad pendientes registradas.  
**Ámbito:** E.E.T.P. N° 495 · Portal Institucional 2027.

## Alcance implementado

- Rol institucional exclusivo `DOCENTE_APOYO`. No hereda las funciones del rol `DOCENTE`.
- Soporte registra cuentas y vincula estudiantes individualmente a docentes de apoyo, sin depender de su curso. El vínculo no se borra al cambiar de curso.
- Portal propio `docentes-apoyo/index.html` con navegación lateral y cuatro consultas:
  1. Informes Pedagógico-Didácticos de estudiantes vinculados (Google Docs con permiso `reader`).
  2. Horario completo (pizarra institucional).
  3. Agenda Institucional: **todos los docentes activos**, sus espacios curriculares y filtro por curso; referentes institucionales activos; estudiantes exclusivamente vinculados.
  4. Situación de Asistencia (Si.R.A.) únicamente para los estudiantes vinculados, sin leer registros completos de los cursos.
- Confirmación de vinculaciones en Soporte con modal institucional y resumen de incorporaciones/desvinculaciones.
- Actualización de asignaciones y sincronización de permisos Drive a través del backend de Google Apps Script existente; nunca escribir `apoyos_estudiantes` directamente desde el navegador.
- Reglas Firestore: lectura limitada de `apoyos_estudiantes` para su propietario o Soporte, denegación de escrituras del navegador; lectura de horarios y referentes activos; sin acceso amplio a `usuarios` ni `asistencias_clases`.

## Validaciones efectuadas

- 29 pruebas de reglas de Firestore con el emulador: permisos de lectura/escritura, roles, cuentas inactivas y aislamiento de Si.R.A.
- El usuario verificó en el entorno local con una cuenta `DOCENTE_APOYO`: inicio de sesión, diseño y navegación, Agenda general con filtro por curso, lista de vínculos y apertura de un informe de estudiante en modo lectura.
- El usuario verificó el funcionamiento habitual de Soporte, Gestión y Docentes después de desplegar las reglas.
- Implementación de Google Apps Script actualizada **sobre la versión existente**, manteniendo URL. El código privado del backend NO está en este repositorio público.

## Observaciones pendientes — no marcar como superadas

1. **HTTP 429:** una operación de resincronización respondió «No se pudo consultar el perfil institucional del usuario. Código 429». No se conoce todavía qué consulta agotó la cuota. La permanencia de los vínculos no prueba que todos los permisos Drive hayan quedado sincronizados. No reintentar repetidamente si reaparece.
2. **Revocación efectiva:** realizar una prueba controlada de desvinculación y de desactivación de cuenta, verificando en Google Drive y con la cuenta afectada que el documento deja de abrirse, y que los permisos heredados o de grupo no mantienen acceso.
3. **Acceso negativo real:** verificar que el docente no puede abrir informes de otro estudiante ni leer registros Si.R.A. de compañeros.
4. **Cargas y cuota:** reducir consultas redundantes del Apps Script si el 429 se repite. No publicar claves privadas ni datos reales de estudiantes en bitácoras públicas.

## Recuperación

- Las reglas previas están respaldadas localmente en `.backups/firestore-produccion-20261112.rules` (SHA-256 verificado por el responsable).
- Volver a un commit anterior en GitHub Pages no revierte automáticamente permisos de Drive ni reglas de Firestore.
- La bitácora histórica `BITACORA_MIGRACION_EETP495_2027.md` y `ESTADO_ACTUAL.md` permanecen **locales y excluidas de Git** de manera intencional.

## Criterio de seguridad

El permiso de escritura excepcional concedido directamente en Google Drive puede perdurar hasta revocación o resincronización; la sincronización institucional tiende a volverlo a `reader`. El sistema no concede permisos de escritura por defecto ni debe afirmar revocación completa sin una prueba real.

## Integración 42 — Legibilidad y períodos Si.R.A. (13/11/2026)

**Motivo:** el responsable solicitó tipografía equivalente a Portal Docentes y consultas de Si.R.A. por trimestre o anual.

**Cambios web:** tamaños de texto aumentados en tablas, rótulos, enlaces y botones de Informes Pedagógico-Didácticos, Agenda Institucional y Si.R.A.; CSS responsivo para pantallas reducidas. Selector de período `ANUAL`, `TRIMESTRE_1`, `TRIMESTRE_2`, `TRIMESTRE_3`, y respuesta con el período solicitado.

**Backend privado:** el usuario actualizó la implementación vigente de Google Apps Script, con la misma URL. El cálculo por período se realiza en el servidor usando el calendario configurado para el año lectivo. Las autorizaciones siguen basadas en vínculos activos y no se exponen registros de otros estudiantes en el navegador.

**Comprobado:** el usuario verificó visualmente el diseño y la presencia del selector desde la rama de desarrollo en la laptop. Se realizaron validaciones de sintaxis del JavaScript, y se mantuvo el consumo de datos de Si.R.A. exclusivamente a través del servidor.

**Aún pendiente:** verificación real de resultados numéricos de los cuatro períodos si hay registros, revocación de Google Drive al quitar vínculos y seguimiento del HTTP 429. No inferir que estas pruebas ocurrieron solamente por comprobar el diseño.

