
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const records = await prisma.commuteRecord.findMany({
        where: {
            OR: [
                { origin: { contains: 'San Marco' } },
                { destination: { contains: 'San Marco' } }
            ]
        },
        orderBy: { timestamp: 'desc' },
        take: 5
    })
    console.log(JSON.stringify(records, null, 2))
}
main()
