# Integración 44 — DAI en Informes Docentes y espaciado en Soporte

**Fecha:** 13/11/2026  
**Estado:** validación visual local aprobada por el responsable; preparado para integrar en `main`.

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

## Ampliación aprobada — Portal Gestión (13/11/2026)

- Se incorpora **una tarjeta independiente debajo de los Informes Pedagógico-Didácticos** en `gestion/index.html`.
- La tabla agrupa por Docente de Apoyo (nombre y correo), con estudiantes asociados y **curso actual**. Un estudiante con dos DAI aparece en las dos filas. Los DAI vigentes sin alumnos se muestran con la leyenda «Sin estudiantes vinculados».
- **Consulta exclusivamente a demanda:** al abrir el Portal Gestión, suscribir eventos o navegar a Informes, la nueva tarjeta **no consulta Firestore ni Apps Script**. La acción `listar_docentes_apoyo_gestion` se llama solo al pulsar «Ver docentes de apoyo», sin escrituras ni actualización automática.
- Roles permitidos: `DIRECCION`, `SECRETARIA`, `ASISTENTE_ADMINISTRATIVO` y `PRECEPTORIA`, comprobados en el **servidor**, y con perfil activo. Los docentes tradicionales, los DAI y los usuarios sin sesión no pueden usar la acción.
- El backend de Informes Pedagógico-Didácticos contiene esta nueva acción en el archivo privado completo `Informes_Pedagogicos_DAI_Gestion_Integracion_44_20261113.gs`. Actualizar **la implementación vigente de Informes** conservando URL; no modificar el Apps Script de Baja Global.
- No se modifican reglas Firestore. No se conceden permisos de lectura directa desde navegador a `usuarios` ni `apoyos_estudiantes`.
- Se realizaron pruebas simuladas del backend para autenticación/roles, vínculos activos, duplicados, ausencia de DAI, orden, cambios de curso y conteos de consultas; no se ejecutaron lecturas reales.
- **Pendiente:** prueba real desde Gestión, comprobación visual PC/móvil, y contraste del directorio con asignaciones efectivas. No publicar en `main` hasta validación.

## Cierre de alcance — 13/11/2026

- El responsable aprobó la visualización de las tres mejoras y solicitó publicar y cerrar esta integración.
- La tabla de Gestión permanece **a demanda** (solo consulta al hacer clic; sin lecturas automáticas ni escrituras).
- El responsable recibió y utilizó una versión del Apps Script de Informes para la consulta de Gestión. Se preparó además una variante privada optimizada por lotes; **no consta confirmación expresa de que esa última variante haya sido instalada**. No se requiere cambiar el backend para fusionar la presentación web que el responsable ya verificó.
- Se registraron 10 pruebas web exitosas: 5 del renderizado DAI en Informes y 5 del directorio de Gestión, con datos ficticios.
- No se modifican reglas ni datos de Firestore en esta integración. Los antecedentes pendientes de Drive, HTTP 429 y Si.R.A. se conservan en bitácora, sin declararlos resueltos.
- La posible migración parcial desde Apps Script hacia Firebase/Cloud Functions **queda sujeta a decisión de Dirección en 2027**, sin cambio aprobado ni programado.
