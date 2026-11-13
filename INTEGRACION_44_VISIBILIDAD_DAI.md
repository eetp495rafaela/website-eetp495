# Integración 44 — DAI en Informes Docentes y espaciado en Soporte

**Fecha:** 13/11/2026  
**Estado:** preparado en rama de desarrollo, aún no publicado.

## Motivo
- Soporte: separar visualmente el texto descriptivo de «Asignaciones de Docentes de Apoyo» respecto del título y los selectores.
- Portal Docentes: junto al DNI de cada estudiante en Informes Pedagógico-Didácticos, mostrar «DAI: nombre - correo» por cada Docente de Apoyo vigente. Si no tiene ninguno, no agregar texto.

## Implementación web
- `assets/css/portales/docentes-apoyo-admin.css`: espaciado exclusivo del párrafo bajo `#gestionDocentesApoyo`.
- `assets/js/informes-docente.js`: muestra `docentesApoyo` en cada fila, escapando HTML, deduplicando correos y validando formato básico; no hace consultas nuevas a Firestore.
- `assets/css/portales/informes-docente-dai.css`: presentación alineada con la tabla docente, apta para múltiples DAI y correos largos.
- `admin/index.html` y `docentes/index.html`: actualización de referencias de caché y estilos.

## Backend privado (NO publicar en GitHub)
La versión completa `Informes_Pedagogicos_DAI_Integracion_44_20261113.gs` se preparó a partir del último backend con períodos Si.R.A. Requiere actualizar la **implementación vigente de Informes Pedagógico-Didácticos**, no la implementación de Baja Global.

- Conserva `listar_informes_docente` y su validación del rol DOCENTE.
- **Primero** filtra los informes que ese docente ya tiene autorizados.
- **Después** lee vínculos `apoyos_estudiantes` activos y perfiles `DOCENTE_APOYO` activos, exclusivos y con acceso vigente, y solamente devuelve los contactos correspondientes a esos informes.
- Si no hay informes autorizados, ni siquiera consulta vínculos/perfiles. Si no hay vínculos activos, no consulta perfiles.
- No modifica documentos, permisos de Google Drive, ni las reglas Firestore. No permite consultar otros estudiantes ni ver vínculos desde el frontend.

## Pruebas
- 12 comprobaciones de backend simulado: informes autorizados, dos DAI por estudiante, duplicados, DAI inactivo/multirrol/vencido, aislamiento de informes ajenos y falta de vínculos.
- 5 pruebas automatizadas de interfaz en `tests/docentes-apoyo/dai-informes.test.cjs`, sin servicios externos ni datos reales.
- **Pendiente:** actualizar Apps Script y verificar con una cuenta DOCENTE y un alumno que tenga un DAI real activo. Si se dio de baja la cuenta DAI de ensayo, no aparecerá en los informes: es el comportamiento correcto.
- Mantener como pendientes históricos revocación efectiva de Drive, HTTP 429 y comprobación numérica de Si.R.A.

## Publicación
No fusionar a `main` ni eliminar esta rama hasta comprobar el entorno local y la actualización de Apps Script; después registrar el cierre en la bitácora privada y actualizar la laptop.
