import { runFullSync } from "./src/lib/scraper-engine";

async function main() {
  const start = new Date();
  console.log(`[SYNC] Iniciando sync único del scraper a las ${start.toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
  
  // Calcular el retraso respecto al slot de 15 minutos anterior más cercano
  const minutes = start.getMinutes();
  const baseMinutes = Math.floor(minutes / 15) * 15;
  const targetTime = new Date(start);
  targetTime.setMinutes(baseMinutes);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);
  
  const delayMs = start.getTime() - targetTime.getTime();
  const delaySeconds = Math.round(delayMs / 1000);
  const delayMins = Math.floor(delaySeconds / 60);
  const delaySecsRemaining = delaySeconds % 60;
  
  console.log(`[SYNC] Slot planificado: ${targetTime.toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`);
  console.log(`[SYNC] Retraso de inicio del trigger de GitHub: ${delayMins} min ${delaySecsRemaining} seg`);
  
  await runFullSync();
  
  const end = new Date();
  const durationSec = Math.round((end.getTime() - start.getTime()) / 1000);
  console.log(`[SYNC] Sync completado con éxito en ${durationSec} segundos.`);
  process.exit(0);
}

main().catch(err => {
  console.error("[SYNC] Error crítico en ejecución:", err);
  process.exit(1);
});
