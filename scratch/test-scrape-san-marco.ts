
import puppeteer from 'puppeteer'
import { scrapeCommuteTime } from './src/lib/scrapers/mapsScraper'

async function test() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const zone = "Barrio San Marco, Villa Nueva, Buenos Aires";
    const dest = "Shopping DOT Baires, Vedia, CABA";
    
    console.log(`Testing scrap for: ${zone}`);
    const results = await scrapeCommuteTime(zone, dest, page);
    console.log('Results:', results);
    
    await browser.close();
}

test();
