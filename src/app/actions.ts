"use server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ACCIÓN LIGERA: Solo para disparar revalidaciones o tareas simples
// No importamos Puppeteer aquí para evitar el Error 500 en Vercel
export async function syncAllData() {
  console.log("[Action] Sync disparado. Revalidando...");
  try {
    // Intentamos despertar al scraper si hay una URL configurada
    if (process.env.SCRAPER_WEBHOOK) {
      fetch(process.env.SCRAPER_WEBHOOK);
    }
    revalidatePath("/");
  } catch (e) {}
}
