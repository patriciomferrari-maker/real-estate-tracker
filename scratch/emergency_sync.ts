import prisma from "../src/lib/prisma";
import puppeteer from 'puppeteer';

async function scrapeMaps(origin: string, dest: string, page: any) {
  try {
    const url = `https://www.google.com.ar/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(dest)}`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('div[id*="section-directions-trip-0"]', { timeout: 15000 });
    
    const durationText = await page.$eval('div[id*="section-directions-trip-0"]', (el: any) => {
      const match = el.innerText.match(/(\d+)\s*min/);
      return match ? match[1] : "0";
    });

    const distanceText = await page.$eval('div[id*="section-directions-trip-0"]', (el: any) => {
      const match = el.innerText.match(/(\d+,?\d*)\s*km/);
      return match ? match[1].replace(',', '.') : "0";
    });

    return { durationMins: parseInt(durationText), distanceKm: parseFloat(distanceText) };
  } catch (e: any) {
    console.log(`Error scraping ${origin.split(',')[0]}:`, e.message);
    return { durationMins: 0, distanceKm: 0 };
  }
}

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
];

const DOT = "Shopping DOT Baires, Vedia, CABA";
const MICROCENTRO = "Obelisco, CABA";
const DESTINATIONS = [DOT, MICROCENTRO];

async function run() {
  console.log("--- INICIANDO SCRAPER DE EMERGENCIA (VIERNES TARDE) ---");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  for (const zone of ZONES) {
    for (const dest of DESTINATIONS) {
      console.log(`Scrapeando: ${dest.split(',')[0]} -> ${zone.split(',')[0]}`);
      const { durationMins, distanceKm } = await scrapeMaps(dest, zone, page);
      
      if (durationMins > 0) {
        await prisma.commuteRecord.create({
          data: {
            origin: dest,
            destination: zone,
            durationMins,
            distanceKm,
            isPeakHour: true
          }
        });
        console.log(`✅ Guardado: ${durationMins} min`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log("--- SCRAPE FINALIZADO ---");
  await browser.close();
  process.exit(0);
}

run();
