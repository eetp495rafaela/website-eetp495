# Docentes de Apoyo — integración pendiente (2026-11-12)

**Estado: rama de desarrollo / no desplegar ni combinar con main.**

## Funcionalidad acordada
- Rol independiente `DOCENTE_APOYO`, sin heredar permisos de `DOCENTE` y sin asignaciones curriculares.
- Vinculación `apoyos_estudiantes` por `docenteCorreo` + `alumnoCorreo`, independiente de curso; múltiples docentes y estudiantes.
- Soporte asigna o desvincula; al desactivar usuario deben revocarse las autorizaciones de Drive.
- Puede consultar: **informes de sus estudiantes**, **pizarra completa**, **agenda institucional** y **situación Si.R.A. solamente de sus estudiantes**. Ningún permiso de edición de asistencia.
- Al cambiar de curso un estudiante conserva el vínculo y la visibilidad de sus informes mientras sigue vinculado.

## Contrato obligatorio del backend de informes (Apps Script, código aún no incorporado)
Se necesita el código real de la implementación que ya ofrece `listar_informes_docente`, `crear_informe_pedagogico`, `sincronizar_permisos_usuario` y `actualizar_docentes_informes_estudiante`.

Debe incorporar estas operaciones **antes de activar el rol**:

1. `actualizar_vinculos_docente_apoyo`: validar ID token Firebase, `estado=ACTIVO`, rol principal `SOPORTE` y vigencia. Validar docente destino `DOCENTE_APOYO`, alumnos activos y pares ya vinculados; aceptar `agregar:[{alumnoCorreo,alumnoNombre}]` y `quitar:[alumnoCorreo]`. Crear/activar/desactivar documentos `apoyos_estudiantes`, revocar/compartir **todos** los Google Docs pertinentes y devolver `ok:true` solo cuando la sincronización sea consistente. **No confiar en los nombres ni cursos enviados por el navegador**; recuperar de Firestore.
2. `listar_informes_docente_apoyo`: validar ID token y rol `DOCENTE_APOYO` activo; consultar desde el servidor exclusivamente sus vínculos `ACTIVO` y devolver solo informes de esos estudiantes, con `alumnoNombre`, `cursoNombre`, `fechaCreacion`, `driveUrl`. Nunca aceptar una lista de alumnos aportada por el cliente como fuente de autorización.
3. `listar_situacion_asistencia_apoyo`: validar token y rol; resolver los estudiantes a cargo; leer registros de `asistencias_clases` en el servidor, calcular `presentes,ausentes,tardanzas,porcentaje` por estudiante y devolver **solo** filas autorizadas. Los documentos Si.R.A. incluyen registros de varios estudiantes: **no** habilitar lectura directa de `asistencias_clases` para el rol.
4. Modificar la creación de informes de Dirección para agregar al compartir los Docentes de Apoyo vinculados. Modificar la sincronización de permisos por estudiante y por usuario para añadir/quitar correctamente docentes de apoyo, incluidos informes históricos.
5. Al desactivar un `DOCENTE_APOYO` en Soporte, revocar de Drive las autorizaciones previas; reactivar no debe otorgar acceso salvo vínculos activos y cuenta vigente. Si cambia el responsable del estudiante, sincronizar inmediatamente.
6. Si el estudiante cambia de curso, no alterar vínculos. Usar un identificador estable del alumno y de los registros Si.R.A., evitando identificar menores solo por nombres coincidentes.
7. Asegurar que el backend rechace `idToken` omitido, inválido, expirado, de usuario desactivado o rol incorrecto en **todas** las operaciones.

**Nota:** el módulo de Agenda preparado inicialmente muestra estudiantes vinculados y referentes institucionales. Antes de producción se debe acordar y habilitar una consulta depurada de colegas relacionados con los cursos, si corresponde, sin conceder lectura indiscriminada de perfiles.

## Firestore
Se añadió `match /apoyos_estudiantes/{vinculoId}`: lectura permitida solo a Soporte o al docente de apoyo activo propietario del vínculo (filtrado por correo + estado). La escritura desde clientes queda denegada; el Apps Script usa credenciales de servicio tras comprobar autorización.
Se amplió lectura de `horarios` activos y `referentes_institucionales` activos para el nuevo rol, y **no** se amplió lectura de usuarios alumnos ni asistencia por curso.

## Validaciones previas a fusionar
- Comprobar reglas contra emulador de Firestore: rol activo, inactivo, no vinculado; denegaciones de lectura de otros estudiantes y Si.R.A., prohibición de escrituras.
- Ensayar docente con 3 estudiantes de distintos cursos, dos docentes apoyando a alumnos del mismo curso y cambios de curso.
- Comprobar con cuenta de prueba que informes/Drive solo se comparten con titulares de vínculo activo y se revocan al quitar o dar de baja.
- Comprobar Si.R.A. a través del backend sin permitir leer registros de compañeros.
- Probar alta, edición, desactivación, reactivación y flujos sin cambios.
- Confirmar que docentes habituales, Dirección, Soporte, estudiantes, SIRA y Galería no sufren regresiones.
- Crear versión nueva del Web App existente, mantener URL y acceso requeridos; publicar reglas solo al confirmar pruebas.
- **No fusionar esta rama ni desplegar reglas antes de completar el backend y las pruebas de seguridad.**

## Estado del código
La rama incluye formularios, navegación, rol y reglas propuestas. El frontend de informes/Si.R.A. **depende de las nuevas acciones de backend todavía no implementadas**, que rechazarán solicitudes hasta que se integren.
