"use server"

import prisma from "@/lib/prisma"
import { scrapeCommuteTime } from "@/lib/scrapers/mapsScraper"
import puppeteer from 'puppeteer'
import { revalidatePath } from "next/cache"

const ZONES = [
  "El Canton, Escobar, Buenos Aires",
  "Nordelta, Tigre, Buenos Aires",
  "Rincon de Milberg, Tigre, Buenos Aires", // La Escondida
  "Tortugas Country Club, Buenos Aires",
  "Vicente Lopez, Buenos Aires"
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
