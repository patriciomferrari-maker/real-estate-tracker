import cron from "node-cron";
import { syncAllData } from "./src/app/actions";

console.log("🚦 Arrancando Servidor de Automatización (Daemon) 🚦");
console.log("- Los horarios configurados son: Lun-Dom, 6:00-10:59 y 15:00-19:59");
console.log("- Frecuencia: Cada 5 minutos dentro de esa franja.");

// Cron 1: Mañana (6 AM a 10:59 AM) cada 5 minutos
cron.schedule("*/5 6-10 * * *", async () => {
  console.log(`\n[MAÑANA] ⏰ Cron ejecutado a las ${new Date().toLocaleTimeString()}...`);
  try {
    await syncAllData();
    console.log("✅ Ciclo de extracción exitoso.");
  } catch (e) {
    console.error("❌ Fallo en extracción:", e);
  }
});

// Cron 2: Tarde (15 PM a 19:59 PM) cada 5 minutos
cron.schedule("*/5 15-19 * * *", async () => {
  console.log(`\n[TARDE] ⏰ Cron ejecutado a las ${new Date().toLocaleTimeString()}...`);
  try {
    await syncAllData();
    console.log("✅ Ciclo de extracción exitoso.");
  } catch (e) {
    console.error("❌ Fallo en extracción:", e);
  }
});

console.log("Esperando la próxima ventana de ejecución cron...\n");
