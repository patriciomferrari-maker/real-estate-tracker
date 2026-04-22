import { syncAllData } from "./src/app/actions";

console.log("🚀 Iniciando extracción simultánea en Google Maps...");
syncAllData()
  .then(() => {
     console.log("✅ Datos correctamente guardados en SQLite.");
     process.exit(0);
  })
  .catch((e) => {
     console.error(e);
     process.exit(1);
  });
