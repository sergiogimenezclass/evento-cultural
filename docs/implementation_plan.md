# Plan de Implementación: Gestor de Curaduría Cultural

Este plan de implementación detalla la estrategia de desarrollo para construir la plataforma SPA (Single Page Application) del Gestor de Curaduría Cultural. Integraremos la arquitectura técnica del backend (Flask + SQLite + APIs) con las directrices visuales otoñales propuestas por **Stitch**.

---

## 🔍 Análisis de Alineación Técnica y de Diseño

Al contrastar la especificación técnica (`proyecto.md`) con el diseño de Stitch (`DESIGN.md`, `code.html`), identificamos los siguientes puntos a resolver:

### 1. Sistema de Estilos: ¿TailwindCSS o CSS Nativo?
- **La especificación técnica (`proyecto.md`):** Requiere expresamente Vanilla HTML5 y CSS3 nativo (`styles.css` con variables CSS) sin frameworks, priorizando rendimiento y portabilidad local sin requerir internet para compilar o procesar.
- **La propuesta de Stitch (`code.html`):** Utiliza TailwindCSS vía CDN en combinación con Google Fonts e iconos de Material Symbols.
- **Propuesta:** Recomiendo **traducir el diseño premium de Stitch a Vanilla CSS utilizando las variables CSS nativas** ya configuradas en el `:root` de su diseño. Esto mantendrá la estética premium (sombras, tipografías, transiciones, bento layout) y respetará a la perfección la arquitectura minimalista solicitada.

### 2. Discrepancia de Campos en el Formulario
- **La especificación técnica:** Requiere un campo **Dirección (Input texto)** para que la API de geocodificación (Nominatim) pueda normalizar la ubicación y obtener coordenadas.
- **El diseño de Stitch (`code.html`):** No incluye el input de Dirección en el formulario, pero sus tarjetas muestran datos de dirección y alertas de clima.
- **Propuesta:** Añadir el campo **Dirección** de manera fluida y elegante en el formulario lateral del panel izquierdo, usando el mismo estilo visual de Stitch.

---

## 🛠️ Propuesta de Fases de Desarrollo

Proponemos realizar la implementación en **4 fases secuenciales**:

### Fase 1: Inicialización y Capa de Datos (SQLite)
- Crear el script `schema.sql` y escribir el cargador del esquema en `database.py`.
- Desarrollar las funciones CRUD básicas (`obtener_eventos`, `insertar_evento`).

### Fase 2: Integración de APIs Externas
- Implementar en `integraciones.py` el cliente HTTP para:
  1. **Nominatim (OpenStreetMap):** Para convertir una dirección a coordenadas (Lat/Lon) y dirección normalizada.
  2. **Open-Meteo:** Para consultar la predicción de lluvia basándonos en la localización y fecha/hora del evento.

### Fase 3: Servidor Flask (API REST)
- Crear `app.py`.
- Definir las rutas:
  - `GET /` (Servir plantilla principal)
  - `GET /api/eventos`
  - `POST /api/eventos` (con lógica de orquestación de geocodificación y clima).

### Fase 4: Frontend Premium con Flujo Optimista
- Diseñar `templates/index.html` basándonos en la estructura bento de Stitch.
- Escribir `static/css/styles.css` con las variables de colores otoñales, fuentes (Manrope y Work Sans) y transiciones fluidas.
- Escribir `static/js/app.js` con el algoritmo de inserción de tarjetas temporales y la llamada asíncrona a la API.

---

## 📁 Propuesta de Archivos a Crear/Modificar

### [Componente Backend]

#### [NEW] [schema.sql](file:///home/sergio/Documents/src/evento-cultural/schema.sql)
Contendrá el DDL para inicializar la tabla `eventos`.

#### [NEW] [database.py](file:///home/sergio/Documents/src/evento-cultural/database.py)
Encargado de inicializar la base de datos SQLite y exponer métodos seguros de lectura e inserción.

#### [NEW] [integraciones.py](file:///home/sergio/Documents/src/evento-cultural/integraciones.py)
Cliente HTTP simplificado para conectarse de manera segura a Nominatim y Open-Meteo utilizando la librería nativa de Python `urllib` (para evitar añadir la dependencia externa `requests`).

#### [NEW] [app.py](file:///home/sergio/Documents/src/evento-cultural/app.py)
Aplicación Flask principal que gestiona las rutas e interactúa con `database.py` e `integraciones.py`.

---

### [Componente Frontend]

#### [NEW] [index.html](file:///home/sergio/Documents/src/evento-cultural/templates/index.html)
Estructura semántica del Gestor de Curaduría con el formulario a la izquierda y el visor bento a la derecha.

#### [NEW] [styles.css](file:///home/sergio/Documents/src/evento-cultural/static/css/styles.css)
Hoja de estilos nativa que traduce el diseño otoñal y bento de Stitch a reglas CSS puras y eficientes.

#### [NEW] [app.js](file:///home/sergio/Documents/src/evento-cultural/static/js/app.js)
Lógica del cliente para el procesamiento optimista del formulario, deshabilitación de inputs y renderizado reactivo de tarjetas.

---

## 🎯 Plan de Verificación

### Pruebas Automatizadas (Simulaciones)
- Creación de un script temporal `test_integraciones.py` para probar de forma directa Nominatim y Open-Meteo con direcciones de prueba (ej: "Defensa 1100, San Telmo, Buenos Aires").

### Pruebas Manuales en Navegador
- Ejecutar el servidor Flask local (`python app.py`) y abrirlo en el navegador.
- Enviar eventos reales y verificar:
  - Inserción optimista instantánea con opacidad reducida.
  - Actualización del estado (de opacidad y badges climáticos) una vez que el backend responde con los datos enriquecidos.
  - Reactividad ante el cambio de estado "Borrador/Publicado".
  - Comportamiento adaptativo y responsivo del layout.
