CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    disciplina TEXT NOT NULL,          -- Ej: 'Fotografía', 'Feria de Diseño', 'Literatura'
    fecha_hora TEXT NOT NULL,          -- Formato ISO 8601: YYYY-MM-DDTHH:MM
    direccion_original TEXT NOT NULL,  -- Lo que ingresa el organizador manualmente
    direccion_normalizada TEXT,        -- Devuelto por el servicio de geocodificación
    latitud REAL,                      -- Coordenada para consultas de clima y mapas
    longitud REAL,                     -- Coordenada para consultas de clima y mapas
    alerta_clima TEXT,                 -- Advertencia generada por el backend
    estado TEXT DEFAULT 'Borrador'     -- Estados permitidos: 'Borrador' o 'Publicado'
);
