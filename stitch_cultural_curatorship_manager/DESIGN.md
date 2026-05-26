---
name: Autumnal Curator
colors:
  surface: '#fff8f6'
  surface-dim: '#e9d6d0'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#fdeae4'
  surface-container-high: '#f8e4de'
  surface-container-highest: '#f2ded8'
  on-surface: '#231916'
  on-surface-variant: '#56423b'
  inverse-surface: '#392e2a'
  inverse-on-surface: '#ffede7'
  outline: '#89726a'
  outline-variant: '#dcc1b7'
  surface-tint: '#9e421b'
  primary: '#9a4019'
  on-primary: '#ffffff'
  primary-container: '#ba582f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59a'
  secondary: '#586330'
  on-secondary: '#ffffff'
  secondary-container: '#d8e6a6'
  on-secondary-container: '#5c6834'
  tertiary: '#006674'
  on-tertiary: '#ffffff'
  tertiary-container: '#008092'
  on-tertiary-container: '#f8fdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370d00'
  on-primary-fixed-variant: '#7e2c04'
  secondary-fixed: '#dbe9a9'
  secondary-fixed-dim: '#bfcd8f'
  on-secondary-fixed: '#171e00'
  on-secondary-fixed-variant: '#404b1b'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#73d4e8'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#fff8f6'
  on-background: '#231916'
  surface-variant: '#f2ded8'
  bg-main: '#F9F6F0'
  bg-panel: '#F0EAE1'
  text-main: '#2C2520'
  text-muted: '#706253'
  status-draft: '#D4A373'
  weather-normal: '#E6CCB2'
  weather-risk: '#DDB892'
typography:
  headline-lg:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: workSans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: workSans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: workSans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  panel-sidebar: 35vw
  panel-content: 65vw
  gutter: 1.5rem
  stack: 1rem
  container-padding: 2rem
---

# DESIGN.md - Especificación de Interfaz y UI/UX
Este documento detalla la estructura semántica, el sistema de diseño visual (CSS nativo) y el comportamiento dinámico de la interfaz para el Gestor de Curaduría Cultural.
## 1. Estructura del Layout (Pantalla Partida)
La interfaz se dividirá en dos secciones principales contenidas en un visor de pantalla completa (`100vh`), eliminando el scroll general de la página para emular una aplicación nativa.
*   **Panel Izquierdo (Fijo, 35% del ancho):** Aloja el formulario de carga de eventos. Diseñado para evitar distracciones, con campos apilados verticalmente.
*   **Panel Derecho (Scrollable, 65% del ancho):** Contenedor principal de la grilla de eventos. Un espacio amplio donde las tarjetas se acomodan dinámicamente mediante Flexbox.
---
## 2. Sistema de Diseño (CSS Variables & Paleta Otoñal)
Para lograr una estética minimalista, orgánica y de alta legibilidad, se utilizará una paleta basada en tonos otoñales (tierras, ocres y verdes secos) con un contraste nítido sobre fondos limpios.
```css
:root {
    /* Paleta Neutra y Fondos */
    --bg-main: #F9F6F0;          /* Blanco lino, fondo general */
    --bg-panel: #F0EAE1;         /* Arena suave, fondo del formulario */
    --text-main: #2C2520;        /* Café oscuro profundo para tipografía principal */
    --text-muted: #706253;       /* Tierra apagado para datos secundarios */
    /* Colores Otoñales de Acento y Estado */
    --color-accent: #C05C33;     /* Terracota / Óxido para elementos activos y botones */
    --color-draft: #D4A373;      /* Ocre / Hojas secas para estado 'Borrador' */
    --color-published: #606C38;  /* Verde musgo / Seco para estado 'Publicado' */
    
    /* Contenedores Destacados (Integraciones) */
    --bg-alert-weather: #E6CCB2; /* Beige cálido para alertas de clima normal */
    --bg-alert-crit: #DDB892;    /* Tono arcilla para alertas climáticas de riesgo (lluvia) */
    --border-radius: 6px;        /* Bordes sutiles y limpios */
}
```