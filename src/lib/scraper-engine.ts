import prisma from "./prisma"
import { scrapeCommuteTime } from "./scrapers/mapsScraper"
import puppeteer from 'puppeteer'
import os from 'os'
import path from 'path'
import fs from 'fs'

const ZONES = [
  "Barrio Santa Teresa, Villa Nueva, Buenos Aires",
  "Barrio Santa Clara, Villa Nueva, Buenos Aires",
  "Barrio San Marco, Villa Nueva, Buenos Aires",
  "Barrio Santa Barbara, General Pacheco, Buenos Aires",
  "Barrio Castaños, Nordelta, Buenos Aires",
  "Barrio Las Glorietas, Nordelta, Buenos Aires",
  "Barrio Barbarita, General Pacheco, Buenos Aires",
  "Barrio La Escondida, Tigre, Buenos Aires",
  "Barrio Buenavista, Victoria, San Fernando, Buenos Aires",
  "Barrio Las Liebres, Tortuguitas, Buenos Aires",
  "Barrio Los Boulevares, Tortuguitas, Buenos Aires",
  "Barrio El Encuentro, Benavidez, Buenos Aires",
  "Barrio Altos de Pacheco, General Pacheco, Buenos Aires",
  "Barrio La Comarca, Cnel. Artigas, B1617 Gral. Pacheco, Provincia de Buenos Aires"
]

const DOT = "Shopping DOT Baires, Vedia, CABA";
const MICROCENTRO = "Obelisco, CABA";
const DESTINATIONS = [DOT, MICROCENTRO];

export async function runFullSync() {
  const runId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const tempProfileDir = path.join(os.tmpdir(), `commute_chrome_${runId}`);

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      userDataDir: tempProfileDir,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--disable-gpu'
      ]
    });

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
         try {
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
         } catch (scrapeErr) {
           console.error(`[Scraper Error ${runOrigin} -> ${runDest}]:`, scrapeErr);
         }
         await new Promise(r => setTimeout(r, 1200));
      }
    }

  } catch (err) {
    console.error("[Scraper Engine Error]:", err);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("[Scraper Engine] Error al cerrar browser:", closeErr);
      }
    }
    try {
      if (fs.existsSync(tempProfileDir)) {
        fs.rmSync(tempProfileDir, { recursive: true, force: true });
      }
    } catch (rmErr) {
      // Ignorar lock temporal de Windows al borrar
    }
  }
}
