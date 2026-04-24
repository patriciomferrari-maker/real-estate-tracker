import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, CarFront, Clock, ArrowRightLeft, Calendar, BarChart3, Database } from "lucide-react"
import Link from 'next/link'

export const dynamic = 'force-dynamic';
import { syncAllData } from "./actions"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"

// Helper to clean up names for the UI
function formatZoneName(raw: string) {
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
  if (raw.includes("Vicente Lopez")) return "Vicente Lopez";
  
  if (raw.includes("DOT")) return "Shopping DOT";
  if (raw.includes("Florida") || raw.includes("Microcentro") || raw.includes("Obelisco")) return "Microcentro";
  return raw.split(',')[0].replace("Barrio", "").trim();
}

export default async function Dashboard({ searchParams }: any) {
  // Manejo directo de tabs para modo pagina
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || "dashboard";

  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

  const records = await prisma.commuteRecord.findMany({
    where: {
      timestamp: {
        gte: fortyFiveDaysAgo
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  // SERVER-SIDE AGGREGATION: Reduce 10,000+ records to ~1/3 size using 15-min buckets
  const aggregatedMap = new Map<string, any>();
  
  records.forEach(r => {
      const d = new Date(r.timestamp);
      const dateKey = d.toLocaleDateString('en-CA'); 
      const hourBucket = d.getHours();
      const minuteBucket = Math.floor(d.getMinutes() / 5) * 5; 
      
      const key = `${r.origin}|${r.destination}|${dateKey}|${hourBucket}|${minuteBucket}`;
      
      if (!aggregatedMap.has(key)) {
          aggregatedMap.set(key, {
              id: `${r.id}_agg`,
              origin: r.origin,
              destination: r.destination,
              timestamp: new Date(`${dateKey}T${hourBucket.toString().padStart(2,'0')}:${minuteBucket.toString().padStart(2,'0')}:00`).toISOString(),
              durationSum: 0,
              count: 0
          });
      }
      const entry = aggregatedMap.get(key)!;
      entry.durationSum += r.durationMins;
      entry.count++;
  });

  const serializableRecords = Array.from(aggregatedMap.values()).map(e => ({
      id: e.id,
      origin: e.origin,
      destination: e.destination,
      timestamp: e.timestamp,
      durationMins: Math.round(e.durationSum / e.count),
      isAggregate: true,
      // Metadatos para consistencia total en el dashboard
      isIda: e.destination.includes("DOT") || e.destination.includes("Microcentro") || e.destination.includes("Florida") || e.destination.includes("Obelisco"),
      isDOT: e.origin.includes("DOT") || e.destination.includes("DOT")
  }));

  // Calculate aggregates based on direction and destination
  interface DualAgg {
    countDOT: number; totalMinsDOT: number; minDOT: number; maxDOT: number;
    countMicro: number; totalMinsMicro: number; minMicro: number; maxMicro: number;
  }
  
  const groups = {
    morning: new Map<string, DualAgg>(), // Ida (Mañana) -> Ciudad
    afternoon: new Map<string, DualAgg>(), // Vuelta (Tarde) <- Ciudad
  };

  records.forEach(r => {
    const orig = formatZoneName(r.origin);
    const dest = formatZoneName(r.destination);
    
    const isDOT = orig === "Shopping DOT" || dest === "Shopping DOT";
    const isMicrocentro = orig === "Microcentro" || dest === "Microcentro" || orig.includes("Obelisco") || dest.includes("Obelisco");
    
    const isIda = dest === "Shopping DOT" || dest === "Microcentro" || dest.includes("Obelisco");
    const relevantZone = isIda ? orig : dest;
    const targetMap = isIda ? groups.morning : groups.afternoon;

    if (!targetMap.has(relevantZone)) {
      targetMap.set(relevantZone, { 
        countDOT: 0, totalMinsDOT: 0, minDOT: 999, maxDOT: 0,
        countMicro: 0, totalMinsMicro: 0, minMicro: 999, maxMicro: 0
      });
    }
    
    const group = targetMap.get(relevantZone)!;
    if (isDOT) {
      group.countDOT++;
      group.totalMinsDOT += r.durationMins;
      if (r.durationMins < group.minDOT) group.minDOT = r.durationMins;
      if (r.durationMins > group.maxDOT) group.maxDOT = r.durationMins;
    } else if (isMicrocentro) {
      group.countMicro++;
      group.totalMinsMicro += r.durationMins;
      if (r.durationMins < group.minMicro) group.minMicro = r.durationMins;
      if (r.durationMins > group.maxMicro) group.maxMicro = r.durationMins;
    }
  });

  const generateDualBars = (mapToRender: Map<string, DualAgg>) => {
    const rawList = Array.from(mapToRender.entries()).map(([name, data]) => {
      const avgDOT = data.countDOT > 0 ? Math.round(data.totalMinsDOT / data.countDOT) : 0;
      const avgMicro = data.countMicro > 0 ? Math.round(data.totalMinsMicro / data.countMicro) : 0;
      
      return {
        name,
        avgDOT,
        avgMicro,
        sortVal: (avgDOT || 0) + (avgMicro || 0), // Use sum for robust sorting
        macro: (name.includes("Escobar") || name.includes("San Matías") || name.includes("El Cantón") || name.includes("Puertos")) ? "Escobar" : 
               (name.includes("Nordelta") || name.includes("Glorietas") || name.includes("Castaños") || name.includes("Santa Bárbara") || name.includes("Barbarita")) ? "Nordelta" : 
               (name.includes("Villa Nueva") || name.includes("San Marco") || name.includes("Santa Ana")) ? "Villa Nueva" :
               (name.includes("Tortugas") || name.includes("Liebres") || name.includes("Boulevares")) ? "Tortugas" : 
               (name.includes("Tigre") || name.includes("Pacheco") || name.includes("Benavidez") || name.includes("Encuentro")) ? "Benavidez / Pacheco" : 
               (name.includes("San Isidro") || name.includes("Buenavista")) ? "San Isidro / Bancalari" : "Otros",
        ...data
      };
    });

    if (rawList.every(i => i.sortVal === 0)) return <p className="text-slate-500 text-sm py-4">No hay datos suficientes aún.</p>;

    const grouped = new Map<string, typeof rawList>();
    rawList.filter(i => i.sortVal > 0).forEach(item => {
       if (!grouped.has(item.macro)) grouped.set(item.macro, []);
       grouped.get(item.macro)!.push(item);
    });

    const macrosSorted = Array.from(grouped.entries()).map(([macro, items]) => {
      let sumMacroDOT = 0, countMacroDOT = 0;
      let sumMacroMicro = 0, countMacroMicro = 0;
      
      items.forEach(i => {
         if(i.avgDOT > 0) { sumMacroDOT += i.avgDOT; countMacroDOT++; }
         if(i.avgMicro > 0) { sumMacroMicro += i.avgMicro; countMacroMicro++; }
      });

      const avgMacroDOT = countMacroDOT > 0 ? Math.round(sumMacroDOT / countMacroDOT) : 0;
      const avgMacroMicro = countMacroMicro > 0 ? Math.round(sumMacroMicro / countMacroMicro) : 0;

      return { 
        macro, 
        avgMacroDOT, 
        avgMacroMicro, 
        sortMacro: avgMacroDOT + avgMacroMicro,
        items: items.sort((a,b) => a.sortVal - b.sortVal) 
      };
    }).sort((a,b) => a.sortMacro - b.sortMacro);

    return (
      <div className="space-y-3">
        {macrosSorted.map(group => {
           let fillDOT = group.avgMacroDOT > 0 ? Math.min(100, (group.avgMacroDOT / 120) * 100) : 0;
           let fillMicro = group.avgMacroMicro > 0 ? Math.min(100, (group.avgMacroMicro / 120) * 100) : 0;

           return (
            <details key={group.macro} className="group bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden open:ring-1 open:ring-white/10 transition-all">
              {/* ACCORDION HEADER */}
              <summary className="p-3 cursor-pointer hover:bg-white/5 transition flex flex-col list-none w-full outline-none">
                 <div className="flex justify-between items-center w-full mb-2">
                    <span className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                       <span className="text-blue-400 group-open:rotate-90 transition-transform inline-block">▶</span>
                       {group.macro}
                    </span>
                    {group.avgMacroMicro > 0 && group.avgMacroDOT > 0 && (
                       <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded text-slate-300 border border-white/10" title="Diferencia de tiempo entre Centro y DOT">
                          Δ {Math.abs(group.avgMacroMicro - group.avgMacroDOT)} min
                       </span>
                    )}
                 </div>
                 <div className="space-y-1.5 opacity-90">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 font-semibold text-blue-300">Al DOT:</span>
                        <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                           {fillDOT > 0 && <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${fillDOT}%` }} />}
                        </div>
                        <span className="w-10 text-right font-black text-white">{group.avgMacroDOT > 0 ? `${group.avgMacroDOT}m` : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 font-semibold text-purple-300">Al Centro:</span>
                        <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                           {fillMicro > 0 && <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${fillMicro}%` }} />}
                        </div>
                        <span className="w-10 text-right font-black text-white">{group.avgMacroMicro > 0 ? `${group.avgMacroMicro}m` : '-'}</span>
                    </div>
                 </div>
              </summary>

              {/* ACCORDION BODY */}
              <div className="p-4 bg-black/30 border-t border-white/5 space-y-5">
                  {group.items.map(route => {
                    let fillBarDOT = route.avgDOT > 0 ? Math.min(100, (route.avgDOT / 120) * 100) : 0;
                    let fillBarMicro = route.avgMicro > 0 ? Math.min(100, (route.avgMicro / 120) * 100) : 0;
                    
                    return (
                      <div key={route.name} className="relative pl-3 border-l-2 border-white/10 space-y-1.5">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-2">
                           <p className="font-medium text-xs text-slate-200">{route.name}</p>
                           {route.avgMicro > 0 && route.avgDOT > 0 && (
                             <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="Costo adicional de tiempo hacia el Centro">
                               + {Math.abs(route.avgMicro - route.avgDOT)} min
                             </span>
                           )}
                        </div>
                        
                        {/* DOT BAR */}
                        {route.avgDOT > 0 && (
                          <div className="flex items-center gap-2 text-[11px]">
                             <span className="w-8 text-slate-400">DOT</span>
                             <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full rounded-full bg-blue-500" style={{ width: `${fillBarDOT}%` }} />
                             </div>
                             <span className="font-bold w-12 text-right">{route.avgDOT} min</span>
                          </div>
                        )}
                        {/* MICROCENTRO BAR */}
                        {route.avgMicro > 0 && (
                          <div className="flex items-center gap-2 text-[11px]">
                             <span className="w-8 text-slate-400">Centro</span>
                             <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full rounded-full bg-purple-500" style={{ width: `${fillBarMicro}%` }} />
                             </div>
                             <span className="font-bold w-12 text-right">{route.avgMicro} min</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </details>
           );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto text-slate-200">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Commute Matrix</h1>
          <p className="text-slate-400 mt-2 text-lg">Inteligencia inmobiliaria automatizada.</p>
        </div>
        
        {/* Sync Button */}
        <form action={syncAllData}>
          <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-purple-900/50 hover:shadow-purple-900/80 hover:-translate-y-1 transition-all border border-purple-400/30">
            <RefreshCw size={18} /> Forzar Análisis Total
          </button>
        </form>
      </header>

      {/* NAVEGACION DE TABS */}
      <nav className="flex flex-wrap gap-3 mb-8 pb-4 border-b border-white/5">
          <Link href="?tab=dashboard" className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2 ${currentTab === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white ring-2 ring-blue-400/50' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>
              <MapPin size={18} /> Resumen General
          </Link>
          <Link href="?tab=graficos" className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2 ${currentTab === 'graficos' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white ring-2 ring-purple-400/50' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>
              <BarChart3 size={18} /> Analíticas Visuales
          </Link>
          <Link href="?tab=reporte" className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2 ${currentTab === 'reporte' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white ring-2 ring-amber-400/50' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>
              <TrendingUp size={18} /> Reporte Ejecutivo
          </Link>
          <Link href="?tab=datos" className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2 ${currentTab === 'datos' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white ring-2 ring-emerald-400/50' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}`}>
              <Database size={18} /> Explorador de Datos
          </Link>
      </nav>

      {/* RENDERIZADO CONDICIONAL POR PESTAÑAS */}

      {currentTab === 'dashboard' && (
        <div className="animate-fade-in duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            
            {/* IDA (MAÑANA) */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mb-4 text-emerald-300 flex gap-2 items-center"><Clock size={24}/> Trayectos MAÑANA (Ida a CABA)</h2>
              <div className="glass-card shadow-lg shadow-emerald-900/10">
                <p className="text-sm text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios consolidados desde la Provincia hacia la capital (Shopping DOT y Centro).</p>
                {generateDualBars(groups.morning)}
              </div>
            </section>

            {/* VUELTA (TARDE) */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mb-4 text-amber-300 flex gap-2 items-center"><ArrowRightLeft size={24}/> Trayectos TARDE (Vuelta a Provincia)</h2>
              <div className="glass-card shadow-lg shadow-amber-900/10">
                <p className="text-sm text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios consolidados regresando desde Capital (Centro o DOT) hacia zona norte.</p>
                {generateDualBars(groups.afternoon)}
              </div>
            </section>

          </div>
        </div>
      )}

      {currentTab === 'graficos' && (
        <div className="animate-fade-in duration-500">
           <AnalyticsSection records={serializableRecords} mode="charts" />
        </div>
      )}

      {currentTab === 'reporte' && (
        <div className="animate-fade-in duration-500">
           <AnalyticsSection records={serializableRecords} mode="report" />
        </div>
      )}

      {currentTab === 'datos' && (
        <div className="animate-fade-in duration-500">
           <DataExplorer records={serializableRecords} />
        </div>
      )}

      {/* FOOTER GENERAL */}
      {records.length > 0 && (
         <div className="text-center mt-12 text-slate-500 text-sm italic">
           Ultima actualización registrada: {new Date(records[0].timestamp).toLocaleString('es-AR')} - Hay {records.length} registros analizados en la DB.
         </div>
      )}

    </main>
  );
}
