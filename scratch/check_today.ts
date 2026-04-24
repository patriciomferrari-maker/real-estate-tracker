import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const records = await prisma.commuteRecord.findMany({
    where: {
      timestamp: {
        gte: today
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
  
  console.log('--- REPORTE DE HOY (Viernes 24) ---');
  console.log('Total registros:', records.length);
  
  const counts = { morning: 0, afternoon: 0 };
  const last10 = records.slice(0, 10).map(r => {
    const isIda = r.destination.includes('DOT') || r.destination.includes('Obelisco') || r.destination.includes('Vedia');
    if (isIda) counts.morning++; else counts.afternoon++;
    
    return {
      t: r.timestamp.toISOString(),
      from: r.origin.substring(0, 20),
      to: r.destination.substring(0, 20),
      mins: r.durationMins,
      type: isIda ? 'IDA' : 'VUELTA'
    };
  });
  
  console.table(last10);
  console.log('Distribución:', counts);
  process.exit(0);
}

test();
