# Punto de continuidad — E.E.T.P. N° 495

Fecha: 26/11/2026

## Repositorio

- GitHub: eetp495rafaela/website-eetp495
- Ruta local: ~/EETP495_2027/Website
- Rama: desarrollo/ciclo-lectivo-2027
- Commit funcional de referencia: 5a1d286
- Rama main sin fusionar con este desarrollo.

## Estado

ETAPA DE DESARROLLO COMPLETADA.
IMPLEMENTACION EN PRODUCCION PENDIENTE.

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

## Pendientes antes de publicar

1. Validar visualmente las interfaces y confirmaciones.
2. Interrupcion de limpieza y reintento: APROBADO 7/7.
3. Textos HTML corregidos. Validacion visual pendiente.
4. Revisar valores predeterminados de ciclo en otros modulos.
5. Verificar configuracion institucional de produccion.
6. Realizar respaldo previo.
7. Revisar diferencias con main antes de fusionar.
8. Coordinar publicacion de reglas y sitio web.

## Precauciones

- No se modificaron datos reales de Firestore.
- No se activo el ciclo lectivo 2027.
- No se fusiono la rama de desarrollo con main.
- La promocion de estudiantes se realiza de 6° a 1° año.
- No repetir promociones y revisar grupos de Taller.
- No editar registros durante migracion o limpieza.
- La limpieza es transaccional por lote.
- Soporte conserva permisos individuales de eliminacion.
- La validacion de activacion no bloquea todas las
  posibles modificaciones concurrentes.

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

Validacion preproduccion e implementacion institucional
del ciclo lectivo 2027.

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
