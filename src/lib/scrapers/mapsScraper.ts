import puppeteer, { Page } from 'puppeteer';

export async function scrapeCommuteTime(origin: string, destination: string, existingPage?: Page) {
  let browser;
  let page = existingPage;
  
  if (!page) {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }
  
  try {
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/`;
    await page!.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page!.waitForSelector('div[data-trip-index]', { timeout: 7000 }).catch(() => {});

    const routeInfo = await page!.evaluate(() => {
      const timeRegex = /((?:\d+\s*(?:h|hora|horas)\s*)?(?:\d+\s*min)|\d+\s*(?:h|hora|horas))/i;
      
      const firstRouteParams = document.querySelector('div[data-trip-index="0"]');
      if (firstRouteParams) {
        const text = firstRouteParams.textContent || "";
        const timeMatch = text.match(timeRegex);
        const kmMatches = text.match(/(\d+[,.]?\d*)\s*km/i);
        return {
          durationRaw: timeMatch ? timeMatch[0] : null,
          distanceRaw: kmMatches ? kmMatches[0] : null
        };
      }
      
      const timeMatchAlt = document.body.innerText.match(timeRegex);
      const kmMatchesAlt = document.body.innerText.match(/(\d+[,.]?\d*)\s*km/i);
      return {
        durationRaw: timeMatchAlt ? timeMatchAlt[0] : null,
        distanceRaw: kmMatchesAlt ? kmMatchesAlt[0] : null
      };
    });

    let durationMins = 0;
    if (routeInfo.durationRaw) {
      const isHour = routeInfo.durationRaw.includes('h');
      const vals = routeInfo.durationRaw.match(/\d+/g);
      if (isHour && vals) {
         if (vals.length >= 2) durationMins = parseInt(vals[0]) * 60 + parseInt(vals[1]);
         else durationMins = parseInt(vals[0]) * 60;
      } else if (vals) {
         durationMins = parseInt(vals[0]);
      }
    }
    
    let distanceKm = 0;
    if (routeInfo.distanceRaw) {
       const vals = routeInfo.distanceRaw.match(/[\d,.]+/);
       if (vals) distanceKm = parseFloat(vals[0].replace(',', '.'));
    }

    return { 
      durationMins: durationMins || 0, 
      distanceKm: distanceKm || 0 
    };
  } catch (error) {
    console.error(`Map scrape error for ${origin}:`, error);
    return { durationMins: 0, distanceKm: 0 };
  } finally {
    if (browser) await browser.close();
  }
}
