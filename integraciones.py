import urllib.request
import urllib.parse
import json
import ssl
from datetime import datetime

# Desactivar verificación estricta de SSL en entornos de desarrollo si hay problemas de certificados locales.
# Generalmente no es necesario, pero es una buena práctica de tolerancia a fallos.
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def geocodificar_direccion(direccion_original):
    """
    Usa la API pública de Nominatim (OpenStreetMap) para obtener coordenadas
    y una dirección normalizada a partir de un texto libre.
    
    Nominatim requiere un User-Agent claro para evitar bloqueos.
    """
    if not direccion_original or not direccion_original.strip():
        return None

    # Normalización básica y codificación para URL
    url_base = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': direccion_original,
        'format': 'json',
        'limit': 1
    }
    url = f"{url_base}?{urllib.parse.urlencode(params)}"
    
    req = urllib.request.Request(
        url, 
        headers={
            # Cabecera requerida por los términos de uso de Nominatim
            'User-Agent': 'GestorCuraduriaCultural/1.0 (sergio@evento-cultural.local)'
        }
    )
    
    try:
        # Petición HTTP con timeout de 5 segundos
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data and len(data) > 0:
                first_result = data[0]
                return {
                    'direccion_normalizada': first_result.get('display_name'),
                    'latitud': float(first_result.get('lat')),
                    'longitud': float(first_result.get('lon'))
                }
    except Exception as e:
        print(f"Error en geocodificación (Nominatim): {e}")
    
    # Retorna un fallback con la dirección original si falla la geocodificación
    return {
        'direccion_normalizada': direccion_original,
        'latitud': None,
        'longitud': None
    }

def obtener_pronostico_clima(latitud, longitud, fecha_hora_iso):
    """
    Usa la API de Open-Meteo para obtener datos climáticos (lluvia, probabilidad, temperatura).
    Requiere coordenadas válidas y una fecha en formato ISO 8601 (YYYY-MM-DDTHH:MM).
    
    Si la fecha está fuera de rango de predicción de Open-Meteo (más de 16 días en el futuro),
    retorna un mensaje indicando que no hay pronóstico disponible.
    """
    if latitud is None or longitud is None:
        return "Clima no disponible (Sin coordenadas)"

    try:
        # Extraemos fecha y hora
        dt = datetime.fromisoformat(fecha_hora_iso)
        fecha_str = dt.strftime('%Y-%m-%d')
        hora_target = dt.hour
    except Exception as e:
        print(f"Error al parsear fecha_hora para clima: {e}")
        return "Clima no disponible (Fecha inválida)"

    url_base = "https://api.open-meteo.com/v1/forecast"
    params = {
        'latitude': latitud,
        'longitude': longitud,
        'start_date': fecha_str,
        'end_date': fecha_str,
        'hourly': 'rain,precipitation_probability,temperature_2m'
    }
    url = f"{url_base}?{urllib.parse.urlencode(params)}"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'GestorCuraduriaCultural/1.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            hourly = data.get('hourly', {})
            times = hourly.get('time', [])
            rains = hourly.get('rain', [])
            probs = hourly.get('precipitation_probability', [])
            temps = hourly.get('temperature_2m', [])
            
            # Buscar el índice correspondiente a la hora del evento
            # Los elementos de time vienen en formato 'YYYY-MM-DDTHH:00'
            hora_buscar = f"{fecha_str}T{hora_target:02d}:00"
            
            idx = -1
            for i, t in enumerate(times):
                if t.startswith(f"{fecha_str}T{hora_target:02d}:"):
                    idx = i
                    break
            
            # Si no hay coincidencia exacta de la hora, usamos la más cercana
            if idx == -1 and len(times) > 0:
                idx = min(range(len(times)), key=lambda i: abs(int(times[i].split('T')[1].split(':')[0]) - hora_target))
            
            if idx != -1:
                rain_value = rains[idx] if idx < len(rains) else 0.0
                prob_value = probs[idx] if idx < len(probs) else 0
                temp_value = temps[idx] if idx < len(temps) else None
                
                # Lógica de alerta
                if rain_value > 0.0 or prob_value > 30:
                    return f"Riesgo de Lluvia ({prob_value}% prob, {rain_value}mm) - Temp: {temp_value}°C"
                else:
                    return f"Clima Estable - Temp: {temp_value}°C"
                    
    except urllib.error.HTTPError as he:
        # Capturamos el error 400 que devuelve Open-Meteo si la fecha está fuera de rango de predicción
        if he.code == 400:
            return "Sin pronóstico (Fecha fuera de rango)"
        print(f"Error HTTP en pronóstico de clima: {he.code} - {he.reason}")
    except Exception as e:
        print(f"Error general al obtener pronóstico de clima: {e}")
        
    return "Clima no disponible"
