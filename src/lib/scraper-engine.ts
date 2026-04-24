import prisma from "./prisma"
import { scrapeCommuteTime } from "./scrapers/mapsScraper"
import puppeteer from 'puppeteer'

const ZONES = [
  "Barrio San Matias, Escobar, Buenos Aires",
  "Puertos de Escobar, Buenos Aires",
  "Barrio El Canton, Escobar, Buenos Aires",
  "Barrio Santa Ana, Villa Nueva, Buenos Aires",
  "Barrio San Marco, Villa Nueva, Buenos Aires",
  "Barrio Santa Barbara, General Pacheco, Buenos Aires",
  "Barrio Castaños, Nordelta, Buenos Aires",
  "Barrio Las Glorietas, Nordelta, Buenos Aires",
  "Barrio Barbarita, General Pacheco, Buenos Aires",
  "Barrio La Escondida, Tigre, Buenos Aires",
  "Avenida Sucre y Avenida Dardo Rocha, San Isidro, Buenos Aires",
  "Barrio Buenavista, Victoria, San Fernando, Buenos Aires",
  "Barrio Las Liebres, Tortuguitas, Buenos Aires",
  "Barrio Los Boulevares, Tortuguitas, Buenos Aires",
  "Barrio El Encuentro, Benavidez, Buenos Aires",
  "Barrio Altos de Pacheco, General Pacheco, Buenos Aires"
]

const DOT = "Shopping DOT Baires, Vedia, CABA";
const MICROCENTRO = "Obelisco, CABA";
const DESTINATIONS = [DOT, MICROCENTRO];

export async function runFullSync() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    const now = new Date();
    const argHour = (now.getUTCHours() - 3 + 24) % 24; 
    
    const isMorning = argHour >= 6 && argHour < 13;
    const isPeakHour = (argHour >= 7 && argHour <= 10) || (argHour >= 16 && argHour <= 20);

    for (const zone of ZONES) {
      for (const dest of DESTINATIONS) {
         const runOrigin = isMorning ? zone : dest;
         const runDest = isMorning ? dest : zone;

         console.log(`[Scraper Engine] ${isMorning ? 'IDA' : 'VUELTA'}: ${runOrigin.split(',')[0]} -> ${runDest.split(',')[0]} (Hora ARG: ${argHour})`);
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
         await new Promise(r => setTimeout(r, 1500));
      }
    }

  } catch (err) {
    console.error("[Scraper Engine Error]:", err);
  } finally {
    await browser.close();
  }
}
