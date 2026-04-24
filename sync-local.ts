
import { syncAllData } from "./src/app/actions";

console.log("🚀 Iniciando extracción manual de emergencia...");
syncAllData()
  .then(() => {
     console.log("✅ Datos correctamente guardados en la DB.");
     process.exit(0);
  })
  .catch((e) => {
     console.error("❌ Error en la sincronización:", e);
     process.exit(1);
  });
