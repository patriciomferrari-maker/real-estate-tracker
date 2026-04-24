import cron from "node-cron";
import { runFullSync } from "./src/lib/scraper-engine";

console.log("🚦 Arrancando Servidor de Automatización (Daemon v2) 🚦");
console.log("- Los horarios configurados son: Lun-Dom, 6:00-11:00 y 15:00-20:00");
console.log("- Corriendo ahora motor independiente del Dashboard.");

// Mañana
cron.schedule("*/10 6-11 * * *", async () => {
  console.log(`\n[DAEMON] ⏰ Iniciando Ciclo Mañana: ${new Date().toLocaleString()}`);
  try {
    await runFullSync();
    console.log("✅ Ciclo completado.");
  } catch (e) {
    console.error("❌ Fallo:", e);
  }
});

// Tarde
cron.schedule("*/10 15-20 * * *", async () => {
  console.log(`\n[DAEMON] ⏰ Iniciando Ciclo Tarde: ${new Date().toLocaleString()}`);
  try {
    await runFullSync();
    console.log("✅ Ciclo completado.");
  } catch (e) {
    console.error("❌ Fallo:", e);
  }
});

// Ejecución inmediata si estamos en franja
const hour = (new Date().getUTCHours() - 3 + 24) % 24;
if ((hour >= 7 && hour <= 11) || (hour >= 15 && hour <= 20)) {
    console.log("🚀 Estamos en franja horaria. Iniciando primer ciclo inmediato...");
    runFullSync();
}

console.log("Esperando cron...\n");
