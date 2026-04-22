"use server"

import prisma from "@/lib/prisma"
import { scrapeCommuteTime } from "@/lib/scrapers/mapsScraper"
import puppeteer from 'puppeteer'
import { revalidatePath } from "next/cache"

const ZONES = [
  // Escobar
  "Barrio San Matias, Escobar, Buenos Aires",
  "Puertos de Escobar, Buenos Aires",
  "Barrio El Canton, Escobar, Buenos Aires",
  "Barrio Santa Ana, Villa Nueva, Buenos Aires",
  // Nordelta / Cercanias
  "Barrio Santa Barbara, General Pacheco, Buenos Aires",
  "Barrio Castaños, Nordelta, Buenos Aires",
  "Barrio Las Glorietas, Nordelta, Buenos Aires",
  "Barrio Barbarita, General Pacheco, Buenos Aires",
  // Tigre
  "Barrio La Escondida, Tigre, Buenos Aires",
  // San Isidro
  "Avenida Sucre y Avenida Dardo Rocha, San Isidro, Buenos Aires", // Usamos Dardo Rocha / Avellaneda que cruzan
  // San Fernando
  "Barrio Buenavista, Victoria, San Fernando, Buenos Aires"
]

const DESTINATIONS = [
  "Shopping DOT Baires, Vedia, CABA",
  "Peron y Florida, CABA"
]

export async function syncAllData() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    const hour = new Date().getHours()
    
    // We decide direction based on hour (Morning = to CABA, Afternoon = Return)
    const isMorning = hour < 12;
    const isPeakHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 19);

    for (const zone of ZONES) {
      for (const dest of DESTINATIONS) {
         // Determine direction
         const runOrigin = isMorning ? zone : dest;
         const runDest = isMorning ? dest : zone;

         console.log(`[Google Maps] Scraping ${runOrigin} -> ${runDest}...`);
         const { durationMins, distanceKm } = await scrapeCommuteTime(runOrigin, runDest, page);
         
         if (durationMins > 0) {
            await prisma.commuteRecord.create({
              data: {
                origin: runOrigin,
                destination: runDest,
                durationMins,
                distanceKm,
                isPeakHour
              }
            });
         }
      }
    }

  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    await browser.close()
  }
  revalidatePath("/");
}
