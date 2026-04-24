import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    // Forzamos un pool pequeño para evitar saturar las 15 conexiones de la DB
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connection_limit=3&pool_timeout=20'
      },
    },
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
