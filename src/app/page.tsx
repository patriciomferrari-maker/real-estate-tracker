import prisma from "@/lib/prisma"
import DashboardContainer from "@/components/DashboardContainer"

export const dynamic = 'force-dynamic';

function formatZoneName(raw: string | null | undefined) {
  if (!raw) return "Desconocido";
  const str = raw.toLowerCase();
  
  // Barrios específicos
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

  // Destinos
  if (str.includes("dot")) return "Shopping DOT";
  if (str.includes("obelisco") || str.includes("microcentro")) return "Microcentro";
  
  return raw.split(',')[0].replace("Barrio", "").trim();
}

export default async function Dashboard() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await prisma.commuteRecord.findMany({
      where: { 
        timestamp: { gte: thirtyDaysAgo },
        NOT: [
          { origin: { contains: 'Escobar' } },
          { destination: { contains: 'Escobar' } },
          { origin: { contains: 'Canton' } },
          { destination: { contains: 'Canton' } },
          { origin: { contains: 'San Matias' } },
          { destination: { contains: 'San Matias' } },
          { origin: { contains: 'Puertos' } },
          { destination: { contains: 'Puertos' } },
          { origin: { contains: 'Santa Ana' } },
          { destination: { contains: 'Santa Ana' } },
          { origin: { contains: 'Sucre' } },
          { destination: { contains: 'Sucre' } },
          { origin: { contains: 'Dardo Rocha' } },
          { destination: { contains: 'Dardo Rocha' } }
        ]
      },
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
                id: String(r.id),
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
    const daysES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    const preEnrichedRecords = Array.from(aggregatedMap.values()).map(e => {
        const durationMins = Math.round(e.durationSum / e.count);
        
        // Argentina is UTC-3. 
        // Shift the UTC timestamp by -3 hours to easily get Argentina time via UTC methods.
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
        
        // Determine Ida/Vuelta and DOT/Microcentro
        const bOrigin = formatZoneName(e.origin);
        const bDest = formatZoneName(e.destination);
        const isIda = bDest === "Shopping DOT" || bDest === "Microcentro";
        const isDOT = bOrigin === "Shopping DOT" || bDest === "Shopping DOT";
        const barrioRaw = isIda ? e.origin : e.destination;
        
        // Shorten barrio name using the precise logic expected by AnalyticsSection
        const shortenBarrioName = (raw: string) => {
          let friendly = raw;
          if (friendly.includes("Santa Teresa")) return "Santa Teresa";
          if (friendly.includes("Santa Clara")) return "Santa Clara";
          if (friendly.includes("Comarca")) return "La Comarca";
          if (friendly.includes("Liebres")) return "Liebres";
          if (friendly.includes("Boulevares")) return "Boulevares";
          if (friendly.includes("Glorietas")) return "Glorietas";
          if (friendly.includes("Castaños") || friendly.includes("Casta\uFFFDos")) return "Castaños";
          if (friendly.includes("Santa Barbara") || friendly.includes("Santa B\uFFFDrbara")) return "Santa Bárbara";
          if (friendly.includes("Barbarita")) return "Barbarita";
          if (friendly.includes("San Marco")) return "San Marco";
          if (friendly === "Villa Nueva, Buenos Aires") return "Villa Nueva (Gral)";
          if (friendly.includes("Villa Nueva")) return "Villa Nueva";
          if (friendly.includes("Encuentro")) return "El Encuentro";
          if (friendly.includes("Altos de Pacheco")) return "Altos de Pacheco";
          if (friendly.includes("Buenavista")) return "Buenavista";
          if (friendly.includes("Escondida")) return "La Escondida";
          if (friendly.includes("Tigre")) return "Tigre";
          return friendly.split(',')[0].replace("Barrio", "").trim();
        };
        
        const friendlyBarrio = shortenBarrioName(barrioRaw);
        
        // Get Macro using the precise logic from AnalyticsSection
        const getMacro = (name: string) => {
          if (name.includes("Nordelta") || name.includes("Glorietas") || name.includes("Casta") || name.includes("Santa Barbara") || name.includes("Barbarita")) return "Nordelta";
          if (name.includes("Villa Nueva") || name.includes("San Marco") || name.includes("Santa Teresa") || name.includes("Santa Clara")) return "Villa Nueva";
          if (name.includes("Tortugas") || name.includes("Liebres") || name.includes("Boulevares")) return "Tortugas";
          if (name.includes("Pacheco") || name.includes("Benavidez") || name.includes("Encuentro") || name.includes("Comarca")) return "Benavidez / Pacheco";
          if (name.includes("Tigre") || name.includes("Escondida")) return "Tigre";
          if (name.includes("San Isidro") || name.includes("Buenavista") || name.includes("Lomas")) return "San Isidro / Bancalari";
          return "Otras Zonas";
        };
        
        const macro = getMacro(barrioRaw);
        const dateStr = `${d_d}/${m_m}/${y_y}`;
        
        // Spanish formatting for DataExplorer
        const diaDeSemana = daysES[rawDay];
        const mesStr = monthsES[m_m_num];
        
        return {
          id: String(e.id),
          origin: String(e.origin),
          destination: String(e.destination),
          timestamp: d.toISOString(),
          durationMins,
          isIda,
          isDOT,
          dayOfWeek,
          month: m_m_num,
          macro,
          barrio: friendlyBarrio,
          barrioRaw,
          hours: hour,
          minutes: min,
          dateStr,
          
          // DataExplorer specific
          diaDeSemana,
          fecha: dateStr,
          año: String(y_y),
          mes: mesStr,
          sentido: isIda ? 'Ida' : 'Vuelta',
          destino: isDOT ? 'Shopping DOT' : 'Microcentro',
          tiempo: durationMins,
          zona: macro
        };
    }).filter(r => {
        // Purge generic locations that distort averages
        if (r.barrio === "Villa Nueva (Gral)" || r.barrio === "Villa Nueva") return false;
        if (r.macro === "Escobar" || r.barrioRaw.includes("Escobar") || r.barrioRaw.includes("San Matias") || r.barrioRaw.includes("Canton") || r.barrioRaw.includes("Puertos")) return false;
        if (r.barrio === "Santa Ana" || r.barrioRaw.includes("Santa Ana")) return false;
        if (r.barrio === "San Isidro" || r.barrioRaw.includes("Sucre") || r.barrioRaw.includes("Dardo Rocha")) return false;
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
