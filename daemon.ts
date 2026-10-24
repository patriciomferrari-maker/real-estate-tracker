import cron from "node-cron";
import { runFullSync } from "./src/lib/scraper-engine";

// Blindaje contra excepciones no capturadas en procesos asíncronos en Windows
process.on('unhandledRejection', (reason) => {
  console.error('[DAEMON] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[DAEMON] Uncaught Exception:', err);
});

console.log("🚦 Arrancando Servidor de Automatización (Daemon v2) 🚦");
console.log("- Horarios configurados: Lun-Dom, Mañana: 06:00 a 10:00 hs | Tarde: 15:00 a 20:30 hs");
console.log("- Corriendo ahora motor independiente del Dashboard.");

let isRunning = false;

async function executeCycle(shiftName: string) {
  if (isRunning) {
    console.log(`[DAEMON] ⚠️ Ya hay un ciclo en ejecución. Omitiendo ${shiftName} duplicado.`);
    return;
  }
  isRunning = true;
  console.log(`\n[DAEMON] 🚀 Iniciando Ciclo ${shiftName}: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`);
  try {
    await runFullSync();
    console.log("✅ Ciclo completado.");
  } catch (e) {
    console.error("❌ Fallo en ciclo:", e);
  } finally {
    isRunning = false;
  }
}

// Mañana: 06:00 a 10:00 hs (cada 15 min)
cron.schedule("*/15 6-10 * * *", async () => {
  const now = new Date();
  const argHour = (now.getUTCHours() - 3 + 24) % 24;
  const minute = now.getUTCMinutes();
  // Cortar a las 10:00 inclusive (no ejecutar a las 10:15, 10:30, 10:45)
  if (argHour === 10 && minute > 0) return;
  await executeCycle("Mañana");
});

// Tarde: 15:00 a 20:30 hs (cada 15 min)
cron.schedule("*/15 15-20 * * *", async () => {
  const now = new Date();
  const argHour = (now.getUTCHours() - 3 + 24) % 24;
  const minute = now.getUTCMinutes();
  // Cortar a las 20:30 inclusive (no ejecutar a las 20:45)
  if (argHour === 20 && minute > 30) return;
  await executeCycle("Tarde");
});

// Ejecución inmediata si estamos en franja
const now = new Date();
const currentArgHour = (now.getUTCHours() - 3 + 24) % 24;
const currentMinute = now.getUTCMinutes();
const inMorning = (currentArgHour >= 6 && currentArgHour < 10) || (currentArgHour === 10 && currentMinute === 0);
const inAfternoon = (currentArgHour >= 15 && currentArgHour < 20) || (currentArgHour === 20 && currentMinute <= 30);

if (inMorning || inAfternoon) {
    console.log("⚡ Estamos en franja horaria. Iniciando primer ciclo inmediato...");
    executeCycle(inMorning ? "Mañana" : "Tarde");
}

console.log("Esperando cron...\n");
