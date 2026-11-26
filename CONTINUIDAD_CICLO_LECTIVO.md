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
- Total: 137/137.
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
2. Probar interrupcion de limpieza entre lotes y reintento.
3. Revisar textos HTML de la limpieza anual.
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
