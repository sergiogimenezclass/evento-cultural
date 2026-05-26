# Tareas del Proyecto: Gestor de Curaduría Cultural

Lista de tareas ordenada para hacer el seguimiento del desarrollo.

## Fase 1: Capa de Datos y Persistencia
- [x] Crear el script DDL de base de datos (`schema.sql`)
- [x] Desarrollar la capa de abstracción de SQLite (`database.py`) con soporte para inserción y lectura de eventos

## Fase 2: Integración de APIs Externas
- [x] Implementar cliente para la API Nominatim de OpenStreetMap (`integraciones.py`)
- [x] Implementar cliente para la API de Open-Meteo (`integraciones.py`)
- [x] Validar las integraciones con un script de prueba independiente (`test_integraciones.py`)

## Fase 3: Servidor Flask (API REST)
- [x] Crear el archivo principal del backend (`app.py`)
- [x] Definir el endpoint `GET /` para servir la interfaz web
- [x] Definir el endpoint `GET /api/eventos` para listar eventos enriquecidos
- [x] Definir el endpoint `POST /api/eventos` con enriquecimiento asíncrono y persistencia

## Fase 4: Frontend Premium (HTML, CSS y JS nativo)
- [x] Crear el template principal (`templates/index.html`) con estructura de pantalla partida, formulario de carga (incluyendo Dirección) y grilla Bento
- [x] Crear la hoja de estilos nativa (`static/css/styles.css`) con variables CSS otoñales y diseño Flexbox responsivo
- [x] Crear la lógica del cliente (`static/js/app.js`) para capturar envíos, actualizar la interfaz de manera optimista y realizar llamadas fetch a la API

## Fase 5: Verificación y Cierre
- [x] Realizar pruebas integrales del flujo completo en el navegador
- [x] Documentar los resultados y cambios en `walkthrough.md`
