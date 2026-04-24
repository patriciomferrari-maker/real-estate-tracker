"use server"

// import puppeteer from 'puppeteer'
import { revalidatePath } from "next/cache"

const ZONES = [
  "Barrio San Marco, Villa Nueva, Buenos Aires"
]

export async function syncAllData() {
  console.log("Sync deshabilitado temporalmente para diagnóstico.");
  try {
    revalidatePath("/");
  } catch (e) {}
}
