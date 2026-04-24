const { runFullSync } = require('./src/lib/scraper-engine');

async function now() {
  console.log("🚀 LAnzando Sync de Emergencia Final...");
  try {
    await runFullSync();
    console.log("✅ Finalizado.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
now();
