import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, CarFront, Clock, ArrowRightLeft, Calendar, BarChart3, Database } from "lucide-react"
import Link from 'next/link'

export const dynamic = 'force-dynamic';
import { syncAllData } from "./actions"
import AnalyticsSection from "@/components/AnalyticsSection"
import DataExplorer from "@/components/DataExplorer"

// Helper to clean up names for the UI
function formatZoneName(raw: string) {
  if (raw.includes("San Matias")) return "Escobar (San Matías)";
  if (raw.includes("Puertos")) return "Escobar (Puertos)";
  if (raw.includes("Canton") || raw.includes("Cantón")) return "Escobar (El Cantón)";
  if (raw.includes("Santa Ana")) return "Escobar (Santa Ana)";
  if (raw.includes("Santa Barbara")) return "Nordelta (Santa Bárbara)";
  if (raw.includes("Castaños")) return "Nordelta (Castaños)";
  if (raw.includes("Glorietas")) return "Nordelta (Glorietas)";
  if (raw.includes("Barbarita")) return "Nordelta (Barbarita)";
  if (raw.includes("Escondida") || raw.includes("Milberg")) return "Tigre (La Escondida)";
  if (raw.includes("Liebres")) return "Tortugas (Las Liebres)";
  if (raw.includes("Boulevares") || raw.includes("Bulevares")) return "Tortugas (Los Boulevares)";
  if (raw.includes("Encuentro")) return "Benavidez (El Encuentro)";
  if (raw.includes("Altos de Pacheco")) return "Pacheco (Altos de Pacheco)";
  if (raw.includes("Sucre") || raw.includes("Rocha")) return "San Isidro (Lomas)";
  if (raw.includes("Buenavista")) return "Buenavista (Bancalari)";
  if (raw.includes("Tortugas")) return "Pilar (Tortugas)";
  if (raw.includes("Vicente Lopez")) return "Vicente Lopez";
  
  if (raw.includes("DOT")) return "Shopping DOT";
  if (raw.includes("Florida") || raw.includes("Microcentro") || raw.includes("Obelisco")) return "Microcentro";
  return raw;
}

export default async function Dashboard({ searchParams }: any) {
  // Manejo directo de tabs para modo pagina
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams?.tab || "dashboard";

  const records = await prisma.commuteRecord.findMany({
    orderBy: { timestamp: 'desc' }
  });

  // Convert dates to string for Client Components
  const serializableRecords = records.map(r => ({
     ...r,
     timestamp: r.timestamp.toISOString()
  }));

  // Calculate aggregates based on direction and destination
  interface Agg {
    count: number; totalMins: number; min: number; max: number;
    lastUpdate: Date | null;
  }
  
  const groups = {
    morningDOT: new Map<string, Agg>(), // Ida (Mañana) -> DOT
    morningMicrocentro: new Map<string, Agg>(), // Ida (Mañana) -> Microcentro
    afternoonDOT: new Map<string, Agg>(), // Vuelta (Tarde) <- DOT
    afternoonMicrocentro: new Map<string, Agg>(), // Vuelta (Tarde) <- Microcentro
  };

  records.forEach(r => {
    const orig = formatZoneName(r.origin);
    const dest = formatZoneName(r.destination);
    
    const isDOT = orig === "Shopping DOT" || dest === "Shopping DOT";
    const isMicrocentro = orig === "Microcentro" || dest === "Microcentro";
    
    // Si el destino es DOT o Microcentro, es "Ida" a la ciudad (Normalmente Mañana).
    // Si el origen es DOT o Microcentro, es "Vuelta" a provincia (Normalmente Tarde).
    const isIda = dest === "Shopping DOT" || dest === "Microcentro";
    
    const relevantZone = isIda ? orig : dest;
    
    let targetMap = null;
    if (isIda && isDOT) targetMap = groups.morningDOT;
    else if (isIda && isMicrocentro) targetMap = groups.morningMicrocentro;
    else if (!isIda && isDOT) targetMap = groups.afternoonDOT;
    else if (!isIda && isMicrocentro) targetMap = groups.afternoonMicrocentro;

    if (targetMap) {
      if (!targetMap.has(relevantZone)) {
        targetMap.set(relevantZone, { count: 0, totalMins: 0, min: 999, max: 0, lastUpdate: null });
      }
      const group = targetMap.get(relevantZone)!;
      group.count++;
      group.totalMins += r.durationMins;
      if (r.durationMins < group.min) group.min = r.durationMins;
      if (r.durationMins > group.max) group.max = r.durationMins;
      if (!group.lastUpdate || r.timestamp > group.lastUpdate) group.lastUpdate = r.timestamp;
    }
  });

  const generateBars = (mapToRender: Map<string, Agg>) => {
    const sorted = Array.from(mapToRender.entries())
      .map(([name, data]) => ({
        name,
        avg: Math.round(data.totalMins / data.count),
        ...data
      }))
      .sort((a,b) => a.avg - b.avg);

    if (sorted.length === 0) return <p className="text-slate-500 text-sm py-4">No hay datos suficientes aún.</p>;

    return (
      <div className="space-y-6">
        {sorted.map(route => {
           let fillPercentage = Math.min(100, (route.avg / 120) * 100);
           const colorClass = route.avg > 90 ? 'bg-red-500' : route.avg > 60 ? 'bg-yellow-500' : 'bg-emerald-500';
           
           return (
            <div key={route.name} className="relative">
              <div className="flex justify-between items-end mb-2">
                <p className="font-medium text-sm text-slate-200">{route.name}</p>
                <p className="text-sm font-bold">{route.avg} min</p>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mb-1 border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Récord Mejor: {route.min}m</span>
                <span>Récord Peor: {route.max}m</span>
              </div>
            </div>
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
              
              <div className="glass-card">
                <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-blue-400"/> Destino: Shopping DOT</h3>
                <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos saliendo de la zona hacia el DOT.</p>
                {generateBars(groups.morningDOT)}
              </div>

              <div className="glass-card">
                <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-purple-400"/> Destino: Microcentro</h3>
                <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos saliendo de la zona hacia Perón y Florida.</p>
                {generateBars(groups.morningMicrocentro)}
              </div>
            </section>

            {/* VUELTA (TARDE) */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mb-4 text-amber-300 flex gap-2 items-center"><ArrowRightLeft size={24}/> Trayectos TARDE (Vuelta a Provincia)</h2>
              
              <div className="glass-card">
                <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><ArrowRightLeft size={18} className="text-blue-400"/> Saliendo desde: Shopping DOT</h3>
                <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos regresando desde el DOT hacia la zona.</p>
                {generateBars(groups.afternoonDOT)}
              </div>

              <div className="glass-card">
                <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><ArrowRightLeft size={18} className="text-purple-400"/> Saliendo desde: Microcentro</h3>
                <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos regresando desde Perón y Florida hacia la zona.</p>
                {generateBars(groups.afternoonMicrocentro)}
              </div>
            </section>

          </div>
        </div>
      )}

      {currentTab === 'graficos' && (
        <div className="animate-fade-in duration-500">
           <AnalyticsSection records={serializableRecords} />
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
