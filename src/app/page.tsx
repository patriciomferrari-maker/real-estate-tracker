import prisma from "@/lib/prisma"
import DashboardContainer, { ProcessedRecord } from "@/components/DashboardContainer"

export const dynamic = 'force-dynamic';

function formatZoneName(raw: string | null | undefined) {
  if (!raw) return "Desconocido";
  const str = raw.toLowerCase();
  
  if (str.includes("santa teresa")) return "Santa Teresa";
  if (str.includes("santa clara")) return "Santa Clara";
  if (str.includes("comarca")) return "La Comarca";
  if (str.includes("san marco")) return "San Marco";
  if (str.includes("santa barbara")) return "Santa Bárbara";
  if (str.includes("castaños") || str.includes("castañon") || str.includes("castanos")) return "Castaños";
  if (str.includes("glorietas")) return "Glorietas";
  if (str.includes("barbarita")) return "Barbarita";
  if (str.includes("escondida")) return "La Escondida";
  if (str.includes("liebres")) return "Las Liebres";
  if (str.includes("boulevares") || str.includes("bulevares")) return "Los Boulevares";
  if (str.includes("encuentro")) return "El Encuentro";
  if (str.includes("altos de pacheco")) return "Altos de Pacheco";
  if (str.includes("buenavista")) return "Buenavista";

  if (str.includes("dot")) return "Shopping DOT";
  if (str.includes("obelisco") || str.includes("microcentro")) return "Microcentro";
  
  return raw.split(',')[0].replace("Barrio", "").trim();
}

export default async function Dashboard() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await prisma.commuteRecord.findMany({
      where: { timestamp: { gte: thirtyDaysAgo } },
      orderBy: { timestamp: 'desc' }
    });

    const aggregatedMap = new Map<string, any>();
    records.forEach(r => {
        const d = new Date(r.timestamp);
        const dateKey = d.toLocaleDateString('en-CA'); 
        const hourBucket = d.getHours();
        const minuteBucket = Math.floor(d.getMinutes() / 5) * 5; 
        const key = `${r.origin}|${r.destination}|${dateKey}|${hourBucket}|${minuteBucket}`;
        
        if (!aggregatedMap.has(key)) {
            aggregatedMap.set(key, {
                id: r.id,
                origin: r.origin,
                destination: r.destination,
                timestamp: d.toISOString(),
                durationSum: 0,
                count: 0
            });
        }
        const entry = aggregatedMap.get(key)!;
        entry.durationSum += (r.durationMins || 0);
        entry.count++;
    });

    const monthsES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const getMacro = (name: string) => {
      if (name.includes("Nordelta") || name.includes("Glorietas") || name.includes("Casta") || name.includes("Santa Barbara") || name.includes("Barbarita")) return "Nordelta";
      if (name.includes("Villa Nueva") || name.includes("San Marco") || name.includes("Santa Teresa") || name.includes("Santa Clara")) return "Villa Nueva";
      if (name.includes("Tortugas") || name.includes("Liebres") || name.includes("Boulevares")) return "Tortugas";
      if (name.includes("Pacheco") || name.includes("Benavidez") || name.includes("Encuentro") || name.includes("Comarca")) return "Benavidez / Pacheco";
      if (name.includes("Tigre") || name.includes("Escondida")) return "Tigre";
      if (name.includes("San Isidro") || name.includes("Buenavista") || name.includes("Lomas")) return "San Isidro / Bancalari";
      return "Otras Zonas";
    };

    const preEnrichedRecords: ProcessedRecord[] = Array.from(aggregatedMap.values()).map(e => {
        const durationMins = Math.round(e.durationSum / e.count);
        
        // Argentina is UTC-3.
        const d = new Date(e.timestamp);
        const argTime = new Date(d.getTime() - 3 * 60 * 60 * 1000);
        
        const y_y = argTime.getUTCFullYear();
        const m_m_num = argTime.getUTCMonth(); // 0-11
        const d_d_num = argTime.getUTCDate();
        const hour = argTime.getUTCHours();
        const min = argTime.getUTCMinutes();
        const rawDay = argTime.getUTCDay(); // 0-6 (Sunday is 0)
        
        const m_m = String(m_m_num + 1).padStart(2, '0');
        const d_d = String(d_d_num).padStart(2, '0');
        const dayOfWeek = rawDay === 0 ? 6 : rawDay - 1; // Mon=0, Tue=1... Sun=6
        
        const bOrigin = formatZoneName(e.origin);
        const bDest = formatZoneName(e.destination);
        const isIda = bDest === "Shopping DOT" || bDest === "Microcentro";
        const isDOT = bOrigin === "Shopping DOT" || bDest === "Shopping DOT";
        const barrioRaw = isIda ? e.origin : e.destination;
        const friendlyBarrio = isIda ? bOrigin : bDest;
        const macro = getMacro(barrioRaw);
        const dateStr = `${d_d}/${m_m}/${y_y}`;
        const mesStr = monthsES[m_m_num];
        
        return {
          id: e.id,
          timestamp: d.toISOString(),
          durationMins,
          isIda,
          isDOT,
          dayOfWeek,
          month: m_m_num,
          macro,
          barrio: friendlyBarrio,
          hours: hour,
          minutes: min,
          dateStr,
          mes: mesStr
        };
    }).filter(r => {
        if (r.barrio === "Villa Nueva (Gral)" || r.barrio === "Villa Nueva" || r.barrio === "Desconocido") return false;
        return true;
    });

    return <DashboardContainer records={preEnrichedRecords} />;
  } catch (e: any) {
     return (
      <div className="p-10 text-center bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
           <p className="font-bold text-red-500 mb-2">Error de Sinergia</p>
           <p className="text-xs font-mono text-slate-400">{e.message}</p>
        </div>
      </div>
     )
  }
}
