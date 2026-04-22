import puppeteer from 'puppeteer';

export async function scrapeMercadoLibreCasas(neighborhood: string, location: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    const query = `${neighborhood} ${location} barrio cerrado venta casa 3 dormitorios`;
    const searchUrl = `https://listado.mercadolibre.com.ar/${encodeURIComponent(query).replace(/%20/g, '-')}`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const listings = await page.evaluate((neigh, loc) => {
      const items = Array.from(document.querySelectorAll('.ui-search-result__wrapper'));
      return items.slice(0, 3).map(item => {
         const priceEl = item.querySelector('.andes-money-amount__fraction');
         const currencyEl = item.querySelector('.andes-money-amount__currency-symbol');
         const urlEl = item.querySelector('a.ui-search-link');
         
         const priceText = priceEl ? priceEl.textContent?.replace(/\D/g,'') : "0";
         const price = priceText ? parseInt(priceText, 10) : 0;
         const currency = currencyEl ? currencyEl.textContent : "USD";
         const url = urlEl ? (urlEl as HTMLAnchorElement).href : "";
         
         return {
            price,
            currency: currency || "USD",
            url,
            zone: loc,
            neighborhood: neigh,
            rooms: 3,
            source: 'MercadoLibre'
         };
      }).filter(l => l.price > 0 && l.url); // filter out empty lines
    }, neighborhood, location);
    
    return listings;
  } catch (error) {
    console.error("Property Scraping error:", error);
    return [];
  } finally {
    await browser.close();
  }
}
