import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, Clock, ArrowRightLeft, BarChart3, Database } from "lucide-react"
import Link from 'next/link'
import { syncAllData } from "./actions"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"

export const dynamic = 'force-dynamic';

function formatZoneName(raw: string | null | undefined) {
  if (!raw) return "Desconocido";
  if (raw.includes("San Matias")) return "San Matías";
  if (raw.includes("Puertos")) return "Puertos";
  if (raw.includes("Canton") || raw.includes("Cantón")) return "El Cantón";
  if (raw.includes("Santa Ana")) return "Santa Ana";
  if (raw.includes("San Marco")) return "San Marco";
  if (raw.includes("Villa Nueva")) return "Villa Nueva";
  if (raw.includes("Santa Barbara")) return "Santa Bárbara";
  if (raw.includes("Castaños")) return "Castaños";
  if (raw.includes("Glorietas")) return "Glorietas";
  if (raw.includes("Barbarita")) return "Barbarita";
  if (raw.includes("Escondida") || raw.includes("Milberg")) return "La Escondida";
  if (raw.includes("Liebres")) return "Las Liebres";
  if (raw.includes("Boulevares") || raw.includes("Bulevares")) return "Los Boulevares";
  if (raw.includes("Encuentro")) return "El Encuentro";
  if (raw.includes("Altos de Pacheco")) return "Altos de Pacheco";
  if (raw.includes("Sucre") || raw.includes("Rocha")) return "San Isidro";
  if (raw.includes("Buenavista")) return "Buenavista";
  if (raw.includes("Tortugas")) return "Pilar (Tortugas)";
  
  if (raw.includes("DOT")) return "Shopping DOT";
  if (raw.includes("Florida") || raw.includes("Microcentro") || raw.includes("Obelisco")) return "Microcentro";
  return raw.split(',')[0].replace("Barrio", "").trim();
}

interface DualAgg {
  countDOT: number; totalMinsDOT: number; minDOT: number; maxDOT: number;
  countMicro: number; totalMinsMicro: number; minMicro: number; maxMicro: number;
}

export default async function Dashboard({ searchParams }: any) {
  try {
    const resolvedParams = await (searchParams || {});
    const currentTab = resolvedParams?.tab || "dashboard";

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

    const serializableRecords = Array.from(aggregatedMap.values()).map(e => {
        const cleanOrigin = formatZoneName(e.origin);
        const cleanDest = formatZoneName(e.destination);
        const isIda = cleanDest === "Shopping DOT" || cleanDest === "Microcentro" || cleanDest.includes("Obelisco");
        const isDOT = cleanOrigin === "Shopping DOT" || cleanDest === "Shopping DOT";
        const barrio = isIda ? cleanOrigin : cleanDest;
        
        return {
            id: String(e.id),
            origin: String(e.origin),
            destination: String(e.destination),
            timestamp: String(e.timestamp),
            durationMins: Math.round(e.durationSum / e.count),
            isAggregate: true,
            isIda,
            isDOT,
            barrio,
            zona: (barrio.includes("Escobar") || barrio.includes("San Matías") || barrio.includes("Cantón")) ? "Escobar" : 
                  (barrio.includes("Nordelta") || barrio.includes("Castaños") || barrio.includes("Glorietas")) ? "Nordelta" : 
                  (barrio.includes("Villa Nueva") || barrio.includes("San Marco") || barrio.includes("Santa Ana")) ? "Tigre/Villa Nueva" :
                  (barrio.includes("Tigre") || barrio.includes("Pacheco") || barrio.includes("Encuentro")) ? "Tigre/Pacheco" : "Zona Norte"
        };
    });

    const groups = { morning: new Map<string, DualAgg>(), afternoon: new Map<string, DualAgg>() };
    records.forEach(r => {
      const orig = formatZoneName(r.origin);
      const dest = formatZoneName(r.destination);
      const isDOT = orig === "Shopping DOT" || dest === "Shopping DOT";
      const isMicro = orig === "Microcentro" || dest === "Microcentro" || orig.includes("Obelisco") || dest.includes("Obelisco");
      const isIda = dest === "Shopping DOT" || dest === "Microcentro" || dest.includes("Obelisco");
      const zone = isIda ? orig : dest;
      const target = isIda ? groups.morning : groups.afternoon;

      if (!target.has(zone)) {
        target.set(zone, { countDOT: 0, totalMinsDOT: 0, minDOT: 999, maxDOT: 0, countMicro: 0, totalMinsMicro: 0, minMicro: 999, maxMicro: 0 });
      }
      const g = target.get(zone)!;
      if (isDOT) { g.countDOT++; g.totalMinsDOT += r.durationMins; }
      else if (isMicro) { g.countMicro++; g.totalMinsMicro += r.durationMins; }
    });

    const generateDualBars = (mapToRender: Map<string, DualAgg>) => {
      const items = Array.from(mapToRender.entries()).map(([name, d]) => ({
        name,
        avgDOT: d.countDOT > 0 ? Math.round(d.totalMinsDOT / d.countDOT) : 0,
        avgMicro: d.countMicro > 0 ? Math.round(d.totalMinsMicro / d.countMicro) : 0,
      })).filter(i => i.avgDOT > 0 || i.avgMicro > 0);

      if (items.length === 0) return <p className="text-slate-500 text-sm py-4">No hay datos suficientes.</p>;

      return (
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.name} className="bg-slate-900/40 p-3 rounded-lg border border-white/5">
              <p className="text-xs font-bold text-slate-300 mb-2">{i.name}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-blue-400">DOT</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (i.avgDOT/100)*100)}%` }} />
                  </div>
                  <span className="w-8 text-right font-bold">{i.avgDOT}m</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="w-10 text-purple-400">Centro</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (i.avgMicro/100)*100)}%` }} />
                  </div>
                  <span className="w-8 text-right font-bold">{i.avgMicro}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto text-slate-200 bg-slate-950">
        <header className="mb-8 flex justify-between items-center pb-6 border-b border-white/10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Commute Matrix</h1>
          <form action={syncAllData}>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
              <RefreshCw size={16} /> Sync
            </button>
          </form>
        </header>

        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["dashboard", "graficos", "reporte", "datos"].map(t => (
            <Link key={t} href={`?tab=${t}`} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentTab === t ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:text-slate-300'}`}>
              {t.toUpperCase()}
            </Link>
          ))}
        </nav>

        {currentTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2"><Clock size={18}/> IDA (MAÑANA)</h2>
              {generateDualBars(groups.morning)}
            </section>
            <section>
              <h2 className="text-lg font-bold mb-4 text-amber-400 flex items-center gap-2"><ArrowRightLeft size={18}/> VUELTA (TARDE)</h2>
              {generateDualBars(groups.afternoon)}
            </section>
          </div>
        )}

        {currentTab === 'graficos' && <AnalyticsSection records={serializableRecords} mode="charts" />}
        {currentTab === 'reporte' && <AnalyticsSection records={serializableRecords} mode="report" />}
        {currentTab === 'datos' && <DataExplorer records={serializableRecords} />}

        <footer className="mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-slate-600">
          {records.length} registros cargados. Argentina Time enforced (GMT-3).
        </footer>
      </main>
    );
  } catch (e: any) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl max-w-md text-center">
          <p className="text-red-400 font-bold mb-2">Error de Sistema</p>
          <p className="text-xs text-slate-400 mb-4 font-mono">{e.message}</p>
          <Link href="/" className="text-xs underline">Reintentar carga</Link>
        </div>
      </div>
    );
  }
}
