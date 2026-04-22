import prisma from "./src/lib/prisma";
import { scrapeCommuteTime } from "./src/lib/scrapers/mapsScraper";
import { scrapeMercadoLibreCasas } from "./src/lib/scrapers/propertyScraper";

async function main() {
    console.log("Iniciando scraping 100% gratuito (Puppeteer) local...");
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const origin = isMorning ? "Barrio El Canton, Escobar, Buenos Aires" : "Shopping DOT Baires, Vedia, CABA";
    const dest = isMorning ? "Shopping DOT Baires, Vedia, CABA" : "Barrio El Canton, Escobar, Buenos Aires";

    console.log(`[Google Maps] Scraping viaje de ${origin} a ${dest}...`);
    const { durationMins, distanceKm } = await scrapeCommuteTime(origin, dest);
    
    console.log(`=> Tiempo estimado: ${durationMins} minutos (${distanceKm} km). Guardando en BD...`);
    await prisma.commuteRecord.create({
      data: {
        origin, destination: dest, durationMins, distanceKm,
        isPeakHour: (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 19)
      }
    });

    console.log(`[MercadoLibre] Scraping casas (3+ hab) en Escobar, El Canton...`);
    const listings = await scrapeMercadoLibreCasas("El Canton", "Escobar");
    console.log(`=> Encontradas ${listings.length} publicaciones. Guardando en BD...`);
    
    for (const listing of listings) {
      const exists = await prisma.propertyListing.findUnique({ where: { url: listing.url } });
      if (!exists) {
        await prisma.propertyListing.create({ data: listing });
        console.log(`   + Guardada propiedad por ${listing.currency} ${listing.price.toLocaleString()}`);
      }
    }
    console.log("=== Scraping Finalizado con Exito ===");
}
main();
