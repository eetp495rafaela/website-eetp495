# Migración anual del ciclo lectivo

## Migración de ciclo lectivo — 26/11/2026

### Desarrollo completado

- CL-01: auditoría inicial.
- CL-02: separación de ciclos lectivos.
- CL-03: motor reutilizable de migración anual.
- CL-04: configuración institucional del ciclo vigente.
- CL-05: seguridad, integridad y recuperación.
- CL-06: integración con Firestore.
- CL-07: activación controlada del nuevo ciclo.
- CL-08: limpieza de registros operativos anteriores.
- CL-09: pruebas generales y validación de sintaxis.

### Validaciones

- 54 pruebas funcionales específicas aprobadas.
- 66 verificaciones de seguridad aprobadas.
- 17 verificaciones de integración aprobadas.
- Total: 137 comprobaciones específicas aprobadas.
- Pruebas generales del proyecto aprobadas.
- Git diff check sin errores.

### Funcionamiento

1. Preparar el siguiente ciclo lectivo.
2. Copiar asignaciones y horarios activos.
3. Revisar y editar los horarios del nuevo ciclo.
4. Completar promoción y distribución de estudiantes.
5. Configurar los períodos correspondientes.
6. Activar el nuevo ciclo.
7. Limpiar horarios, asignaciones y reemplazos anteriores.

La pizarra y las consultas operativas utilizan el ciclo
lectivo institucional vigente.

La limpieza conserva usuarios, cursos, espacios curriculares,
asistencias, calificaciones y mesas de examen.

### Precauciones y pendientes de implementación

- No se modificó Firestore de producción.
- No se activó el ciclo lectivo 2027.
- Verificar la configuración institucional antes de publicar.
- Realizar una copia de seguridad previa.
- Validar visualmente los formularios y confirmaciones.
- Comprobar recuperación de limpieza interrumpida entre lotes.
- No editar registros durante la migración o limpieza.
- La promoción de estudiantes debe realizarse de 6° a 1° año,
  evitando repetir promociones y revisando grupos de Taller.
- Los índices de acceso temporal de preceptoría se conservan.
- La protección de limpieza anual pertenece al motor de
  aplicación; Soporte conserva sus permisos individuales.
- La implementación definitiva se realizará cuando la
  institución disponga el inicio del ciclo lectivo 2027.

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
