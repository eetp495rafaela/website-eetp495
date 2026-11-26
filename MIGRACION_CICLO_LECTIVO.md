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
