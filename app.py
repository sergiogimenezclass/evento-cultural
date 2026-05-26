from flask import Flask, jsonify, request, render_template
import os
from database import init_db, obtener_eventos, insertar_evento
from integraciones import geocodificar_direccion, obtener_pronostico_clima

app = Flask(__name__)

# Asegurar que el cargador de plantillas busque en la ruta correcta del proyecto
app.template_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app.static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

@app.route('/')
def index():
    """Servir la plantilla HTML de la SPA."""
    return render_template('index.html')

@app.route('/api/eventos', methods=['GET'])
def get_eventos():
    """Recuperar la colección completa de eventos cargados."""
    try:
        eventos = obtener_eventos()
        return jsonify(eventos), 200
    except Exception as e:
        print(f"Error en GET /api/eventos: {e}")
        return jsonify({"error": "No se pudieron obtener los eventos"}), 500

@app.route('/api/eventos', methods=['POST'])
def post_evento():
    """
    Crear un nuevo evento.
    Orquesta las llamadas asíncronas para geocodificar y enriquecer climáticamente
    los datos antes de guardarlos en la base de datos.
    """
    try:
        datos = request.get_json()
        if not datos:
            return jsonify({"error": "Se requiere un payload JSON válido"}), 400

        # Validaciones de campos obligatorios
        titulo = datos.get('titulo')
        disciplina = datos.get('disciplina')
        fecha_hora = datos.get('fecha_hora')
        direccion_original = datos.get('direccion_original')
        estado = datos.get('estado', 'Borrador')

        if not all([titulo, disciplina, fecha_hora, direccion_original]):
            return jsonify({"error": "Faltan campos requeridos (titulo, disciplina, fecha_hora, direccion_original)"}), 400

        # 1. Enriquecimiento de localización (Nominatim)
        geo_data = geocodificar_direccion(direccion_original)
        direccion_normalizada = geo_data['direccion_normalizada']
        lat = geo_data['latitud']
        lon = geo_data['longitud']

        # 2. Enriquecimiento climático (Open-Meteo)
        alerta_clima = obtener_pronostico_clima(lat, lon, fecha_hora)

        # 3. Ensamblar y guardar en SQLite
        nuevo_evento = {
            'titulo': titulo,
            'disciplina': disciplina,
            'fecha_hora': fecha_hora,
            'direccion_original': direccion_original,
            'direccion_normalizada': direccion_normalizada,
            'latitud': lat,
            'longitud': lon,
            'alerta_clima': alerta_clima,
            'estado': estado
        }

        inserted_id = insertar_evento(nuevo_evento)
        if inserted_id is None:
            return jsonify({"error": "Error al guardar el evento en la base de datos"}), 500

        # Añadimos el ID asignado para retornar el objeto completo enriquecido
        nuevo_evento['id'] = inserted_id

        return jsonify(nuevo_evento), 201

    except Exception as e:
        print(f"Error en POST /api/eventos: {e}")
        return jsonify({"error": "Error interno del servidor al procesar el evento"}), 500

if __name__ == '__main__':
    # Inicializar la base de datos antes de arrancar
    init_db()
    # Ejecutar en puerto 5000 estándar
    app.run(host='0.0.0.0', port=5000, debug=True)
