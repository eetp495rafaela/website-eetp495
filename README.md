# E.E.T.P. N° 495 — Website institucional 2027

Sitio institucional de la E.E.T.P. N° 495 “Malvinas Argentinas”, Rafaela, Santa Fe.

## Estado actual

- **Versión vigente en el repositorio:** Website 2027, rama `main`, raíz.
- **Dominio:** `https://eetp495rafaela.edu.ar/`.
- **Integraciones 1 a 39:** finalizadas.
- **Integración 40 (11/11/2026):** Si.R.A. en Soporte y Gestión: previsión inicialmente oculta, consulta mediante «Actualizar», y una sola tabla agrupada primero por Taller y después por Educación Física. Se conservan los datos de horarios, docentes y reemplazos. Comprobado por el responsable del proyecto en ambos portales. Commit `6c4fc55`.
- **Integración 41 (12/11/2026):** Portal Docentes de Apoyo (`DOCENTE_APOYO`), con vínculos individuales por estudiante, consultas de informes en solo lectura, pizarra de horarios completa, Agenda Institucional con directorio general de docentes y filtro por curso, y resumen de asistencia Si.R.A. limitado a estudiantes vinculados. Soporte administra vinculaciones. El backend Apps Script vigente fue actualizado manualmente, sin cambiar la URL, y las reglas de Firestore fueron publicadas. El usuario comprobó accesos, agenda, visualización de informes y persistencia de vinculaciones. **Observación pendiente:** durante una resincronización de permisos se detectó HTTP 429; aún falta comprobar revocación efectiva de permisos en Drive y el comportamiento ante errores de cuota. Ver `DOCENTES_APOYO_INTEGRACION.md`.
- **Integración 42 (13/11/2026):** mejoras de legibilidad en Informes, Agenda y Si.R.A. del Portal Docentes de Apoyo (tablas, enlaces y controles). Selector de Si.R.A. por período: Anual, 1°, 2° o 3° trimestre, con cálculo a cargo de Apps Script usando `configuracion_periodos`, conservando el aislamiento por estudiantes vinculados. Google Apps Script actualizado manualmente en la implementación vigente, sin cambiar la URL. **Verificado:** interfaz en entorno local por el responsable del proyecto. **Pendiente:** validar con registros reales los conteos diferenciados de los cuatro períodos; siguen abiertos los controles de revocación Drive y diagnóstico 429 de la Integración 41.
- **Validación institucional:** Dirección probó y autorizó el funcionamiento actual, según confirmó el responsable del proyecto.

## Estructura vigente

- `index.html`: portada 2027.
- `login.html`: ingreso institucional 2027.
- `alumnos/index.html`: Portal Alumnos.
- `docentes/index.html`: Portal Docentes.
- `admin/index.html`: Portal Soporte (rol `SOPORTE`).
- `gestion/index.html`: Portal Gestión.
- `vista-2027/`: secciones públicas y recursos de la versión 2027 (**en uso; no eliminar**).
- `assets/js/` y `assets/css/`: recursos funcionales vigentes, incluidos módulos reutilizados del sistema anterior (**no eliminar por su nombre o fecha**).

## Pendientes autorizados para análisis

1. Mejorar la sección pública **Proyectos**.
2. Mejorar la **Galería** pública.
3. Continuar la limpieza conservadora, revisando referencias y dependencias antes de retirar archivos.

## Documentación y seguridad

Las bitácoras internas `BITACORA_MIGRACION_EETP495_2027.md` y `ESTADO_ACTUAL.md` se conservan **localmente**, excluidas del repositorio público mediante `.gitignore`. Cada cambio debe consignar fecha, motivo, estado de verificación y alcance.

Publicar un cambio no sustituye las pruebas de acceso, visualización y permisos. Mantener como único origen de despliegue la rama `main` de GitHub Pages.

**No ejecutar `firebase deploy` como parte de la limpieza:** `firebase.json` contempla reglas de Firestore, que quedan fuera del alcance. No modificar datos operativos, reglas, permisos ni módulos aprobados sin intervención expresamente autorizada.
