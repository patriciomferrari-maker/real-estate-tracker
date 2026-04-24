import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, Clock, ArrowRightLeft, BarChart3, Database } from "lucide-react"
import Link from 'next/link'
import { syncAllData } from "./actions"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"

export const dynamic = 'force-dynamic';

function formatZoneName(raw: string | null | undefined) {
  if (!raw) return "Desconocido";
  const str = raw.toLowerCase();
  
  // Barrios específicos
  if (str.includes("san matias")) return "San Matías";
  if (str.includes("puertos")) return "Puertos";
  if (str.includes("canton")) return "El Cantón";
  if (str.includes("santa ana")) return "Santa Ana";
  if (str.includes("san marco")) return "San Marco";
  if (str.includes("santa barbara")) return "Santa Bárbara";
  if (str.includes("castaños")) return "Castaños";
  if (str.includes("glorietas")) return "Glorietas";
  if (str.includes("barbarita")) return "Barbarita";
  if (str.includes("escondida")) return "La Escondida";
  if (str.includes("liebres")) return "Las Liebres";
  if (str.includes("boulevares") || str.includes("bulevares")) return "Los Boulevares";
  if (str.includes("encuentro")) return "El Encuentro";
  if (str.includes("altos de pacheco")) return "Altos de Pacheco";
  if (str.includes("buenavista")) return "Buenavista";
  if (str.includes("sucre") || str.includes("dardo rocha")) return "San Isidro";

  // Destinos
  if (str.includes("dot")) return "Shopping DOT";
  if (str.includes("obelisco") || str.includes("microcentro")) return "Microcentro";
  
  return raw.split(',')[0].replace("Barrio", "").trim();
}

function getMacroZona(barrio: string) {
    if (barrio.includes("San Matías") || barrio.includes("Puertos") || barrio.includes("El Cantón") || barrio.includes("Escobar")) return "Escobar";
    if (barrio.includes("Castaños") || barrio.includes("Glorietas") || barrio.includes("Nordelta")) return "Nordelta";
    if (barrio.includes("San Marco") || barrio.includes("Santa Ana") || barrio.includes("Villa Nueva")) return "Tigre / Villa Nueva";
    if (barrio.includes("Santa Bárbara") || barrio.includes("Barbarita") || barrio.includes("Altos de Pacheco") || barrio.includes("Pacheco")) return "Pacheco";
    if (barrio.includes("La Escondida") || barrio.includes("Tigre")) return "Tigre Centro";
    if (barrio.includes("El Encuentro") || barrio.includes("Benavidez")) return "Benavidez";
    if (barrio.includes("Las Liebres") || barrio.includes("Los Boulevares") || barrio.includes("Tortuguitas")) return "Pilar / Tortugas";
    if (barrio.includes("Buenavista") || barrio.includes("San Isidro")) return "San Isidro / San Fernando";
    return "Otras Zonas";
}

interface DualAgg {
  countDOT: number; totalMinsDOT: number;
  countMicro: number; totalMinsMicro: number;
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
        const bOrigin = formatZoneName(e.origin);
        const bDest = formatZoneName(e.destination);
        const isIda = bDest === "Shopping DOT" || bDest === "Microcentro";
        const barrio = isIda ? bOrigin : bDest;
        
        return {
            id: String(e.id),
            origin: String(e.origin),
            destination: String(e.destination),
            timestamp: String(e.timestamp),
            durationMins: Math.round(e.durationSum / e.count),
            isIda,
            isDOT: bOrigin === "Shopping DOT" || bDest === "Shopping DOT",
            barrio,
            zona: getMacroZona(barrio)
        };
    });

    const buildGroupData = (isIda: boolean) => {
        const zoneMap = new Map<string, Map<string, DualAgg>>();
        
        serializableRecords.filter(r => r.isIda === isIda).forEach(r => {
            const macro = r.zona;
            const barrio = r.barrio;
            
            // Si el barrio es exactamente Villa Nueva (genérico), lo ignoramos
            if (barrio === "Villa Nueva" || barrio === "Villa Nueva (Gral)") return;

            const isToDOT = r.isIda ? r.destination.includes("DOT") : r.origin.includes("DOT");
            
            if (!zoneMap.has(macro)) zoneMap.set(macro, new Map());
            const barriosInMacro = zoneMap.get(macro)!;
            
            if (!barriosInMacro.has(barrio)) {
                barriosInMacro.set(barrio, { countDOT: 0, totalMinsDOT: 0, countMicro: 0, totalMinsMicro: 0 });
            }
            
            const agg = barriosInMacro.get(barrio)!;
            if (isToDOT) {
                agg.countDOT++;
                agg.totalMinsDOT += r.durationMins;
            } else {
                agg.countMicro++;
                agg.totalMinsMicro += r.durationMins;
            }
        });
        return zoneMap;
    };

    const generateMacroSection = (data: Map<string, Map<string, DualAgg>>) => {
        const sortedMacros = Array.from(data.entries()).map(([macro, barrios]) => {
            let sumDOT = 0, cDOT = 0, sumMicro = 0, cMicro = 0;
            const barrioList = Array.from(barrios.entries()).map(([name, bData]) => {
                const avgD = bData.countDOT > 0 ? Math.round(bData.totalMinsDOT / bData.countDOT) : 0;
                const avgM = bData.countMicro > 0 ? Math.round(bData.totalMinsMicro / bData.countMicro) : 0;
                if (avgD > 0) { sumDOT += avgD; cDOT++; }
                if (avgM > 0) { sumMicro += avgM; cMicro++; }
                return { name, avgDOT: avgD, avgMicro: avgM };
            });
            
            const mAvgDOT = cDOT > 0 ? Math.round(sumDOT / cDOT) : 0;
            const mAvgMicro = cMicro > 0 ? Math.round(sumMicro / cMicro) : 0;
            return { macro, mAvgDOT, mAvgMicro, barrios: barrioList };
        }).sort((a,b) => (a.mAvgDOT + a.mAvgMicro) - (b.mAvgDOT + b.mAvgMicro));

        if (sortedMacros.length === 0) return <p className="text-slate-500 text-sm py-4">Sin datos suficientes.</p>;

        return (
            <div className="space-y-4">
                {sortedMacros.map(m => (
                    <details key={m.macro} className="group bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden transition-all">
                        <summary className="p-4 cursor-pointer hover:bg-white/5 list-none outline-none">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-black text-slate-200 flex items-center gap-2">
                                    <span className="text-blue-400 group-open:rotate-90 transition-transform">▶</span>
                                    {m.macro}
                                </span>
                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">
                                    {m.barrios.length} barrios
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">Prom. DOT</p>
                                    <p className="text-xl font-black text-white">{m.mAvgDOT}m</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Prom. Centro</p>
                                    <p className="text-xl font-black text-white">{m.mAvgMicro}m</p>
                                </div>
                            </div>
                        </summary>
                        <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
                            {m.barrios.map(b => (
                                <div key={b.name} className="flex flex-col gap-1.5 pl-3 border-l border-white/10">
                                    <p className="text-xs font-bold text-slate-300">{b.name}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <span className="text-[10px] text-slate-400 w-8">DOT</span>
                                            <span className="text-xs font-bold">{b.avgDOT}m</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            <span className="text-[10px] text-slate-400 w-10">Centro</span>
                                            <span className="text-xs font-bold">{b.avgMicro}m</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                ))}
            </div>
        );
    };

    return (
      <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto text-slate-200 bg-slate-950">
        <header className="mb-8 flex justify-between items-center pb-6 border-b border-white/10">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Commute Matrix</h1>
          <form action={syncAllData}>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-xl font-black mb-6 text-emerald-400 flex items-center gap-2 uppercase tracking-tighter">
                <Clock size={20}/> Trayectos Mañana (Ida)
              </h2>
              {generateMacroSection(buildGroupData(true))}
            </section>
            <section>
              <h2 className="text-xl font-black mb-6 text-amber-400 flex items-center gap-2 uppercase tracking-tighter">
                <ArrowRightLeft size={20}/> Trayectos Tarde (Vuelta)
              </h2>
              {generateMacroSection(buildGroupData(false))}
            </section>
          </div>
        )}

        {currentTab === 'graficos' && <AnalyticsSection records={serializableRecords} mode="charts" />}
        {currentTab === 'reporte' && <AnalyticsSection records={serializableRecords} mode="report" />}
        {currentTab === 'datos' && <DataExplorer records={serializableRecords} />}

        <footer className="mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-slate-600">
            Engine v3.2 | Sync Local Enforced (GMT-3) | {serializableRecords.length} records parsed.
        </footer>
      </main>
    );
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
