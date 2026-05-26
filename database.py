import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'eventos.db')
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')

def dict_factory(cursor, row):
    """Convierte las filas de la base de datos en diccionarios de Python."""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    """Establece una conexión a la base de datos SQLite."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    return conn

def init_db():
    """Inicializa la base de datos aplicando el esquema DDL si no existe."""
    if not os.path.exists(SCHEMA_PATH):
        print(f"Error: No se encontró el archivo de esquema en {SCHEMA_PATH}")
        return

    conn = get_db_connection()
    try:
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            conn.executescript(f.read())
        conn.commit()
        print("Base de datos inicializada correctamente.")
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")
    finally:
        conn.close()

def obtener_eventos():
    """Recupera la colección completa de eventos guardados, ordenados por ID descendente."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM eventos ORDER BY id DESC")
        eventos = cursor.fetchall()
        return eventos
    except Exception as e:
        print(f"Error al obtener eventos: {e}")
        return []
    finally:
        conn.close()

def insertar_evento(evento):
    """
    Inserta un nuevo evento enriquecido en la base de datos y retorna su ID asignado.
    
    :param evento: Diccionario con los datos del evento.
    :return: El ID del registro insertado, o None si falla.
    """
    conn = get_db_connection()
    query = """
        INSERT INTO eventos (
            titulo, disciplina, fecha_hora, direccion_original, 
            direccion_normalizada, latitud, longitud, alerta_clima, estado
        ) VALUES (
            :titulo, :disciplina, :fecha_hora, :direccion_original, 
            :direccion_normalizada, :latitud, :longitud, :alerta_clima, :estado
        )
    """
    try:
        cursor = conn.cursor()
        cursor.execute(query, evento)
        conn.commit()
        inserted_id = cursor.lastrowid
        return inserted_id
    except Exception as e:
        print(f"Error al insertar el evento: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()
