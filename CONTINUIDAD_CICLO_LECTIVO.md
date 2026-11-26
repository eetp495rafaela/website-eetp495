# Punto de continuidad — E.E.T.P. N° 495

Fecha: 26/11/2026

## Repositorio

- GitHub: eetp495rafaela/website-eetp495
- Ruta local: ~/EETP495_2027/Website
- Rama única: main
- Commit funcional de referencia: 091cbf9
- Rama de desarrollo integrada y eliminada.

## Estado

PREPARACIÓN REAL DE 2027 COMPLETADA Y APROBADA.
CICLO VIGENTE: 2026. ACTIVACIÓN DE 2027 PENDIENTE.

CL-01 a CL-10 completados.

## Pruebas

- Funcionales especificas: 54/54.
- Seguridad Firestore: 66/66.
- Integracion Firestore: 17/17.
- Total inicial: 137/137.
- Validacion adicional VP-02: 7/7.
- Total acumulado: 144/144.
- Pruebas generales aprobadas.
- Sintaxis validada.
- Git diff check correcto.

## Funcionalidades desarrolladas

- Configuracion institucional del ciclo lectivo vigente.
- Migracion anual reutilizable.
- Copia de asignaciones docentes activas.
- Copia de horarios de Aula, Taller y Educacion Fisica.
- Recuperacion de migraciones interrumpidas.
- Edicion de horarios del ciclo preparado.
- Activacion controlada del nuevo ciclo.
- Pizarra correspondiente al ciclo vigente.
- Limpieza de horarios, asignaciones y reemplazos anteriores.
- Proteccion del ciclo vigente y de ciclos futuros.

## Informacion conservada durante la limpieza

- Usuarios y credenciales.
- Cursos y espacios curriculares.
- Asistencias.
- Calificaciones.
- Mesas de examen.
- Configuracion de periodos.
- Indices de acceso temporal de preceptoria.

## Pendientes al inicio de 2027

Consultar la última entrada de este documento. No repetir la migración.

## Precauciones

- No activar 2027 hasta completar la organización institucional.
- Promover estudiantes de 6° a 1° año, sin repetir movimientos.
- No editar registros durante migración, activación o limpieza.
- La limpieza es transaccional por lote; Soporte conserva permisos individuales de eliminación.
- La validación de activación no bloquea todas las posibles modificaciones concurrentes.
- No limpiar ciclos anteriores sin respaldo e informes históricos.

## Emulador Firestore

Ante un cierre SIGABRT, el reintento fue exitoso utilizando:

export JAVA_TOOL_OPTIONS="-Xms128m -Xmx1024m"

Proyecto de pruebas: demo-eetp495-ciclo
Puerto local: 8085

## Documentacion relacionada

- BITACORA_DESARROLLO.md
- MIGRACION_CICLO_LECTIVO.md
- CONTINUIDAD_CICLO_LECTIVO.md

## Proxima etapa

Organización académica y activación institucional en 2027.
Consultar el procedimiento actualizado al final de este documento.

No repetir las etapas CL-01 a CL-10.
No reconstruir funcionalidades ya desarrolladas.
Priorizar sencillez, seguridad y reutilizacion.

## Validación preproducción — 26/11/2026

- VP-02: aprobada, 7/7 comprobaciones adicionales.
- Limpieza interrumpida después de 100 de 102 registros.
- Conservación de los dos registros pendientes.
- Rechazo de la confirmación anterior.
- Reintento exitoso mediante una nueva revisión.
- Conservación de ciclos vigentes y futuros.
- Conservación de registros académicos.
- VP-03: textos HTML de limpieza anual actualizados.
- VP-01: validación visual todavía pendiente.
- Total acumulado: 144/144 comprobaciones específicas.
- Prueba de regresión:
  tests/seguridad-firestore/limpieza-interrumpida.test.mjs

### Entorno de pruebas

El emulador presentó fallos internos SIGSEGV/SIGABRT
con OpenJDK 21.0.13.1.

Configuración que permitió completar VP-02:

    export JAVA_TOOL_OPTIONS="-Xms128m -Xmx1536m -XX:+UseSerialGC -XX:ActiveProcessorCount=2 -Xint -Xshare:off"

Proyecto ficticio: demo-eetp495-ciclo.
Puerto del emulador: 8085.
Sin modificaciones en Firestore de producción.
Sin activación del ciclo 2027 en producción.
Sin fusión con main.

Próximas tareas: VP-01 y VP-04.

## VP-04 — Ciclos lectivos predeterminados

Fecha: 26/11/2026.

- Ciclo institucional integrado en asignaciones docentes,
  horarios, calificaciones y consultas de asistencia.
- Valores fijos de 2026 retirados de los formularios.
- Selección manual de otros ciclos conservada.
- Fechas reales y períodos de mesas de examen conservados.
- Documentación Académica: eliminado el valor fijo de respaldo.
- Pendiente verificar el ciclo informado por Apps Script.
- Corregidas dos pruebas preexistentes del tema visual:
  alcance del bloque CSS y versiones de caché alfanuméricas.
- 90 pruebas generales aprobadas.
- Sintaxis JavaScript y git diff check correctos.
- Se conservan las 144 comprobaciones específicas previas.
- Pendiente validación funcional y visual en navegador.
- Sin cambios en Firestore de producción.
- Sin despliegue de reglas ni fusión con main.

Próxima tarea: VP-01, validación visual y funcional.

## Cierre de desarrollo y preparación de producción — 26/11/2026

- Etapas CL-01 a CL-10 finalizadas.
- 144 comprobaciones específicas aprobadas.
- 90/90 pruebas generales aprobadas.
- Sintaxis JavaScript correcta.
- VP-02 aprobada.
- VP-03 corregida.
- VP-04 implementada.
- Commit de código consolidado: d51e78b.
- Comparación preliminar con main: 4 commits por delante,
  ninguno por detrás y 46 archivos diferentes.
- Repositorio local y remoto sincronizados.
- Desarrollo de código cerrado para esta etapa.

### Próxima etapa: portal institucional real

- Verificar configuración institucional de producción.
- Realizar respaldo previo.
- Revisar diferencias funcionales con main.
- Coordinar publicación de reglas y sitio.
- Validar las interfaces en el portal institucional.
- Verificar Documentación Académica y Apps Script.
- Mantener 2026 como ciclo vigente durante las pruebas.
- No ejecutar migraciones, promociones, activaciones
  ni limpiezas sobre datos reales durante la validación.

La publicación del sistema y la activación del ciclo 2027
son operaciones independientes.

## 2026-11-26 — Preparación real del ciclo 2027 aprobada

- Publicación del sistema en producción y consolidación en la única rama main.
- Configuración institucional inicial: cicloVigente = 2026.
- Respaldo lógico previo de Firestore: 1.794 documentos y reglas; el responsable confirmó además el backup del portal antes de preparar el ciclo.
- Corrección visual de períodos de asistencia y selector/columna de ciclo en Asignaciones Docentes aprobados por el responsable en ambos temas.
- Migración real desde Soporte: 267 asignaciones, 704 horarios de Aula, 88 de Taller y 36 de Educación Física (828 horarios; 1.095 registros en total).
- El portal informó «Migración completada» y «El ciclo 2026 continúa vigente». El responsable confirmó la revisión de las asignaciones y los horarios copiados de 2027, sin diferencias observadas respecto de 2026.
- Estado actual: 2027 PREPARADO, NO ACTIVADO. No repetir la migración.
- Sin promoción ni repitencia de estudiantes, sin activación de 2027 ni limpieza de 2026 en esta etapa.
- Commit de código de referencia: 091cbf9. Se cierra la etapa de preparación; no se da por probada la activación ni la limpieza en producción.

### Continuidad al inicio del ciclo 2027

1. Realizar y verificar un nuevo respaldo.
2. Revisar y ajustar las asignaciones docentes de 2027 y sus horarios vinculados.
3. Revisar y ajustar los horarios de Aula, Taller y Educación Física de 2027. Los cambios posteriores de 2026 no se copian automáticamente.
4. Una vez cerradas las actividades que dependen de la matrícula 2026, realizar promociones y repitencias de 6° a 1° año, sin procesar dos veces a un estudiante.
5. Incorporar ingresantes y revisar divisiones y grupos de Taller.
6. Configurar los períodos de asistencia 2027.
7. Activar desde Gestionar ciclo lectivo, escribiendo ACTIVAR 2027 únicamente cuando todo esté listo.
8. Verificar todos los portales, inicializar calificaciones de Taller y revisar S.I.M.E., Documentación Académica y Apps Script.
9. Conservar informes históricos, verificar su accesibilidad y realizar respaldo antes de decidir si limpiar los registros operativos de 2026.

Pendiente verificar cobertura del backup de Apps Script y ciclo de Documentación Académica; revisar vínculos horarios al editar asignaciones y consultas históricas antes de limpiar. No ejecutar limpieza de asistencias como parte del cambio anual. No hay reversión de activación desde la interfaz.
