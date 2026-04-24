import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, Clock, ArrowRightLeft, BarChart3, Database } from "lucide-react"
import Link from 'next/link'
import { syncAllData } from "./actions"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"
import Sparkline from "@/components/Sparkline"

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

// ... (después de buildGroupData)

    const generateMacroSection = (data: Map<string, Map<string, DualAgg>>) => {
        const sortedMacros = Array.from(data.entries()).map(([macro, barrios]) => {
            let sumDOT = 0, cDOT = 0, sumMicro = 0, cMicro = 0;
            let totalDelta = 0;
            
            const barrioList = Array.from(barrios.entries()).map(([name, bData]) => {
                const avgD = bData.countDOT > 0 ? Math.round(bData.totalMinsDOT / bData.countDOT) : 0;
                const avgM = bData.countMicro > 0 ? Math.round(bData.totalMinsMicro / bData.countMicro) : 0;
                
                // Obtenemos los últimos valores para el Sparkline y Delta
                const neighborhoodRecords = serializableRecords
                    .filter(r => r.barrio === name)
                    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .slice(-8);
                
                const trendDOT = neighborhoodRecords.filter(r => r.isDOT).map(r => r.durationMins);
                const trendMicro = neighborhoodRecords.filter(r => !r.isDOT).map(r => r.durationMins);
                
                const lastVal = trendDOT[trendDOT.length - 1] || avgD;
                const prevVal = trendDOT[trendDOT.length - 2] || lastVal;
                const delta = lastVal - prevVal;
                totalDelta += delta;

                if (avgD > 0) { sumDOT += avgD; cDOT++; }
                if (avgM > 0) { sumMicro += avgM; cMicro++; }
                
                return { name, avgDOT: avgD, avgMicro: avgM, delta, trendDOT, trendMicro };
            });
            
            const mAvgDOT = cDOT > 0 ? Math.round(sumDOT / cDOT) : 0;
            const mAvgMicro = cMicro > 0 ? Math.round(sumMicro / cMicro) : 0;
            const macroDelta = Math.round(totalDelta / (barrioList.length || 1));

            return { macro, mAvgDOT, mAvgMicro, macroDelta, barrios: barrioList };
        }).sort((a,b) => (a.mAvgDOT + a.mAvgMicro) - (b.mAvgDOT + b.mAvgMicro));

        if (sortedMacros.length === 0) return <p className="text-slate-500 text-sm py-4">Sin datos suficientes.</p>;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sortedMacros.map(m => (
                    <details key={m.macro} className="group bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20 shadow-2xl">
                        <summary className="p-5 cursor-pointer hover:bg-white/[0.05] list-none outline-none">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp size={18} className="text-blue-400 group-open:rotate-90 transition-transform" />
                                    <div>
                                        <span className="text-lg font-black text-white block leading-none">{m.macro}</span>
                                        {m.macroDelta !== 0 && (
                                            <span className={`text-[9px] font-bold ${m.macroDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                ZONA {m.macroDelta > 0 ? '▲' : '▼'} {Math.abs(m.macroDelta)}m trend
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold bg-blue-500/10 px-3 py-1 rounded-full text-blue-300 border border-blue-500/10 uppercase">
                                    {m.barrios.length} sectores
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] uppercase font-black text-blue-400/80">DOT</p>
                                        <Sparkline data={m.barrios[0]?.trendDOT} color="#3b82f6" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white">{m.mAvgDOT}</span>
                                        <span className="text-xs font-medium text-slate-500">m</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 relative overflow-hidden">
                                     <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] uppercase font-black text-purple-400/80">Centro</p>
                                        <Sparkline data={m.barrios[0]?.trendMicro} color="#a855f7" />
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white">{m.mAvgMicro}</span>
                                        <span className="text-xs font-medium text-slate-500">m</span>
                                    </div>
                                </div>
                            </div>
                        </summary>
                        <div className="p-5 bg-black/60 border-t border-white/10 space-y-4">
                            {m.barrios.map(b => (
                                <div key={b.name} className="relative pl-4 border-l-2 border-white/5 hover:border-blue-500/50 transition-colors py-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-black text-slate-200">{b.name}</p>
                                        {b.delta !== 0 && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.delta > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {b.delta > 0 ? '▲' : '▼'} {Math.abs(b.delta)}m
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 flex items-center justify-between bg-white/[0.02] px-2 py-1.5 rounded-lg border border-white/5">
                                            <Sparkline data={b.trendDOT} color="#3b82f6" />
                                            <span className="text-xs font-black text-blue-300 ml-2">{b.avgDOT}m</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-between bg-white/[0.02] px-2 py-1.5 rounded-lg border border-white/5">
                                            <Sparkline data={b.trendMicro} color="#a855f7" />
                                            <span className="text-xs font-black text-purple-300 ml-2">{b.avgMicro}m</span>
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
      <main className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto text-slate-200 bg-slate-950 selection:bg-blue-500/30">
        <header className="mb-10 flex justify-between items-center pb-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">Commute Intelligence</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-Time Transit Analysis Gateway</p>
            </div>
          </div>
          <form action={syncAllData}>
            <button type="submit" className="flex items-center gap-3 bg-white text-black hover:bg-slate-200 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95">
              <RefreshCw size={18} className="animate-spin-slow" /> SYNC DATA
            </button>
          </form>
        </header>

        <nav className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {["dashboard", "graficos", "reporte", "datos"].map(t => (
            <Link key={t} href={`?tab=${t}`} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${currentTab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}>
              {t.toUpperCase()}
            </Link>
          ))}
        </nav>

        {currentTab === 'dashboard' && (
          <div className="space-y-16">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/20"></div>
                <h2 className="text-xs font-black text-emerald-400 flex items-center gap-2 uppercase tracking-[0.2em] bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <Clock size={16}/> Ida (Mañana)
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/20"></div>
              </div>
              {generateMacroSection(buildGroupData(true))}
            </section>
            
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/20"></div>
                <h2 className="text-xs font-black text-amber-400 flex items-center gap-2 uppercase tracking-[0.2em] bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                  <ArrowRightLeft size={16}/> Vuelta (Tarde)
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/20"></div>
              </div>
              {generateMacroSection(buildGroupData(false))}
            </section>
          </div>
        )}

        {currentTab === 'graficos' && <AnalyticsSection records={serializableRecords} mode="charts" />}
        {currentTab === 'reporte' && <AnalyticsSection records={serializableRecords} mode="report" />}
        {currentTab === 'datos' && <DataExplorer records={serializableRecords} />}

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Core Intelligence Engine v4.0</span>
            <div className="flex gap-6">
              <span>{serializableRecords.length} DATA_POINTS</span>
              <span className="text-blue-500">Local Daemon: ACTIVE</span>
            </div>
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
