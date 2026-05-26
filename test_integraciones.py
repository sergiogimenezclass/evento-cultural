import sys
from integraciones import geocodificar_direccion, obtener_pronostico_clima
from datetime import datetime, timedelta

def test():
    print("=== PROBANDO INTEGRACIÓN DE GEOLOCALIZACIÓN ===")
    direccion = "Defensa 1100, San Telmo, Buenos Aires"
    print(f"Dirección de prueba: '{direccion}'")
    
    geo = geocodificar_direccion(direccion)
    print(f"Resultado:\n{geo}\n")
    
    if not geo or geo['latitud'] is None:
        print("FAIL: No se pudo obtener la geolocalización.")
        return

    print("=== PROBANDO INTEGRACIÓN DE CLIMA (FECHA CERCANA) ===")
    # Mañana a las 16:00
    mañana = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%dT16:00')
    print(f"Fecha/Hora de prueba: {mañana}")
    
    clima_cercano = obtener_pronostico_clima(geo['latitud'], geo['longitud'], mañana)
    print(f"Resultado Clima Cercano: '{clima_cercano}'\n")

    print("=== PROBANDO INTEGRACIÓN DE CLIMA (FECHA FUTURA - FUERA DE RANGO) ===")
    # Año 2027
    fecha_futura = "2027-10-15T16:00"
    print(f"Fecha/Hora futura de prueba: {fecha_futura}")
    
    clima_futuro = obtener_pronostico_clima(geo['latitud'], geo['longitud'], fecha_futura)
    print(f"Resultado Clima Futuro: '{clima_futuro}'\n")

if __name__ == "__main__":
    test()
