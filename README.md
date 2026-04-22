# Real Estate & Commute Tracker

Un dashboard y backend diseñado para recolectar información pasiva sobre tiempos de viaje en hora pico y nuevas oportunidades inmobiliarias de zonas de GBA Norte.

## Tecnologías utilizadas
- Next.js (App Router)
- Prisma (ORM)
- Base de datos SQLite local (`dev.db`)
- CSS Vanilla (diseño Glassmorphism Premium)
- Iconos Lucide React

## Cómo usar el proyecto

1. Ya está todo inicializado. Para correr el proyecto utilizá:
   ```bash
   npm run dev
   ```
2. Accedé a `http://localhost:3000`. Vas a ver el dashboard principal.
3. El botón "Sincronizar Datos" en la UI de momento inserta datos de prueba simulados.

### Próximos pasos (Automatización Real)

Dado que un análisis de trayecto con tráfico en tiempo real o web scraping requiere acceso a APIs externas, para operativizalo al 100% debés:

1. **Integrar Google Maps Distance Matrix API**:
   - Crear una cuenta en Google Cloud Console, habilitar la API de *Distance Matrix* y generar un API Key.
   - Guardarla en archivo `.env` como `GOOGLE_MAPS_API_KEY`.
   - Crear una ruta en Next.js (ej. `src/app/api/cron/route.ts`) que consulte los trayectos cada X tiempo usando Vercel Cron u otro programador.

2. **Web Scraper Básico**:
   - Para evitar banneos automatizados de portales inmobiliarios líderes, podés sumar `puppeteer` o un servicio como `ZenRows`. Esa herramienta volcaría sobre la base de SQLite las `PropertyListing`.
