# Baja Global — Docentes de Apoyo

**Fecha:** 13/11/2026  
**Estado:** preparado en desarrollo; pruebas reales y despliegue pendiente.

## Causa del bloqueo
El Apps Script de Baja Global, versión `2026-09-15-PRODUCCION-6`, no contempla el rol institucional exclusivo `DOCENTE_APOYO` en el enrutador de bajas. Esto produce «La combinación de roles del usuario no está habilitada para baja global automática».

## Corrección del backend (código privado, fuera de GitHub)
- Ruta exclusiva para `DOCENTE_APOYO` cuando `usuarios/{correo}` está `INACTIVO`.
- Bloquea `DOCENTE_APOYO` combinado con otros roles; no hereda la baja tradicional de `DOCENTE`.
- Prevalidación especializada: consulta vínculos en `apoyos_estudiantes`, autorizaciones a informes, permisos Drive y accesos recientes; **no barrer Si.R.A. ni S.I.M.E.**.
- Bloquea la baja si un archivo de informe requerido no está accesible o tiene permisos protegidos de propietario/organizador.
- Deshabilita Firebase Authentication, retira permisos directos y autorizaciones de informes, efectúa el barrido de Drive, borra vínculos de `apoyos_estudiantes` y accesos recientes, elimina la identidad Firebase y por último el perfil Firestore.
- Conserva documentos e índices históricos de Informes Pedagógico-Didácticos, datos de estudiantes, Si.R.A., S.I.M.E. y horarios de clases.
- El código fuente privado corregido se distribuye fuera del repositorio. **No subirlo a GitHub**.

## Ajuste del frontend
`assets/js/usuarios-inactivos-admin.js` muestra `DOCENTE_APOYO` como «Docente de Apoyo» y presenta en el resumen previo las desvinculaciones de estudiantes, autorizaciones y permisos Drive que se retirarán. No ejecuta cambios por sí mismo: todas las acciones sensibles deben ser validadas por el servidor.

## Validaciones
- Sintaxis JavaScript del backend verificada.
- Pruebas simuladas: plan de baja, permisos y orden de operaciones; rechazo de cuenta ACTIVA o multirrol; protección de propiedad Drive; fallo de revocación mantiene perfil/vínculos y deja Auth deshabilitada.
- **Pendientes:** hacer copia del Apps Script de Baja Global vigente, actualizar esa implementación sin cambiar URL, comprobar prevalidación real con cuenta de prueba, baja real y revocación de acceso a Google Docs. Verificar que una cuota HTTP 429 no provoque una baja incompleta.

## Advertencias operativas
- La eliminación afecta la cuenta del **proyecto Firebase Authentication**, no elimina una cuenta personal de Google.
- Un permiso heredado de una carpeta o grupo en Google Drive puede requerir comprobación/retirada adicional.
- No eliminar manualmente `usuarios/{correo}`: un fallo parcial debe quedar reintentable.
- Eliminar la rama de desarrollo solo después de pruebas y publicación autorizadas.
