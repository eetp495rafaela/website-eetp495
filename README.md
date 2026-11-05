# E.E.T.P. N° 495 — Website institucional 2027

Sitio institucional de la E.E.T.P. N° 495 “Malvinas Argentinas”, Rafaela, Santa Fe.

- `index.html`: portada 2027.
- `login.html`: ingreso institucional 2027.
- `alumnos/index.html`: Portal Alumnos.
- `docentes/index.html`: Portal Docentes.
- `admin/index.html`: Portal Soporte (rol `SOPORTE`).
- `gestion/index.html`: Portal Gestión.
- `vista-2027/`: secciones públicas.
- `assets/js/` y `assets/css/`: recursos funcionales vigentes, incluidos módulos reutilizados del sistema anterior.

GitHub Pages previsto: `main`, raíz, dominio `eetp495rafaela.edu.ar`.

Publicar el diseño no confirma el funcionamiento de autenticación, App Check
ni permisos. Validar los accesos reales tras el despliegue.

No utilizar `firebase deploy` para esta migración: el archivo `firebase.json`
actual contiene la configuración de reglas de Firestore, fuera del alcance.
