import prisma from "@/lib/prisma"
import { MapPin, TrendingUp, RefreshCw, CarFront, Clock, ArrowRightLeft, Calendar } from "lucide-react"

export const dynamic = 'force-dynamic';
import { syncAllData } from "./actions"
import ZoneCharts from "@/components/ZoneCharts"

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
  if (raw.includes("Florida") || raw.includes("Microcentro")) return "Microcentro";
  return raw;
}

export default async function Dashboard() {
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
    const hour = new Date(r.timestamp).getHours();
    
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
           let fillPercentage = Math.min(100, (route.avg / 120) * 100); // 2 hours = 100% full bar
           // Microcentro requires higher threshold than DOT naturally
           const colorClass = route.avg > 90 ? 'bg-red-500' : route.avg > 60 ? 'bg-yellow-500' : 'bg-emerald-500';
           
           return (
            <div key={route.name} className="relative">
              <div className="flex justify-between items-end mb-2">
                <p className="font-medium text-sm text-slate-200">{route.name}</p>
                <p className="text-sm font-bold">{route.avg} min</p>
              </div>
              
              {/* Progress Bar Container */}
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
    <main className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in relative z-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Commute <span className="gradient-text">Matrix</span></h1>
          <p className="text-slate-400">Análisis detallado de tiempos de viaje (Ida/Vuelta y Destino).</p>
        </div>
        <form action={syncAllData}>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <RefreshCw size={18} />
            Forzar Sincronización Real
          </button>
        </form>
      </header>

      {/* DASHBOARDS SEPARADOS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
        
        {/* IDA (MAÑANA) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mb-4">☀️ Trayectos MAÑANA (Ida a CABA)</h2>
          
          <div className="glass-card">
            <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-emerald-400"/> Destino: Shopping DOT</h3>
            <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos saliendo de la zona hacia el DOT.</p>
            {generateBars(groups.morningDOT)}
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><MapPin size={18} className="text-red-400"/> Destino: Microcentro</h3>
            <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos saliendo de la zona hacia Perón y Florida.</p>
            {generateBars(groups.morningMicrocentro)}
          </div>
        </section>

        {/* VUELTA (TARDE) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-2 mb-4">🌙 Trayectos TARDE (Vuelta a Provincia)</h2>
          
          <div className="glass-card">
            <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><ArrowRightLeft size={18} className="text-emerald-400"/> Saliendo desde: Shopping DOT</h3>
            <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos regresando desde el DOT hacia la zona.</p>
            {generateBars(groups.afternoonDOT)}
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-medium mb-1 text-slate-100 flex items-center gap-2"><ArrowRightLeft size={18} className="text-red-400"/> Saliendo desde: Microcentro</h3>
            <p className="text-xs text-slate-400 mb-6 border-b border-white/10 pb-4">Promedios de tiempos regresando desde Perón y Florida hacia la zona.</p>
            {generateBars(groups.afternoonMicrocentro)}
          </div>
        </section>

      </div>

      {/* DASHBOARD GRAFICO INTERACTIVO */}
      <ZoneCharts records={serializableRecords} />

      {/* RECENT LOG TABLE */}
      <section className="mb-12 glass-card overflow-hidden !p-0">
        <div className="p-4 border-b border-white/10 bg-white/5">
           <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar size={18} className="text-blue-400"/> Historial Crudo de Ejecuciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Turno</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Lugar Base</th>
                <th className="px-4 py-3">Central</th>
                <th className="px-4 py-3">Tiempo (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {records.slice(0, 10).map(r => {
                  const date = new Date(r.timestamp);
                  const isIda = formatZoneName(r.destination) === "Shopping DOT" || formatZoneName(r.destination) === "Microcentro";
                  const turno = date.getHours() < 12 ? 'Mañana' : 'Tarde/Noche';
                  
                  return (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-slate-300">{date.toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 text-slate-400">{date.toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' })}</td>
                      <td className="px-4 py-3">{turno}</td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-semibold ${isIda ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                           {isIda ? 'IDA (Hacia CABA)' : 'VUELTA (A Provincia)'}
                         </span>
                      </td>
                      <td className="px-4 py-3">{isIda ? formatZoneName(r.origin) : formatZoneName(r.destination)}</td>
                      <td className="px-4 py-3 font-semibold text-white">{isIda ? formatZoneName(r.destination) : formatZoneName(r.origin)}</td>
                      <td className={`px-4 py-3 font-bold ${r.durationMins > 75 ? 'text-red-400' : r.durationMins > 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>{r.durationMins} m</td>
                    </tr>
                  )
               })}
            </tbody>
          </table>
          {records.length === 0 && <p className="p-4 text-center text-slate-400">Aún no hay registros en la base de datos.</p>}
        </div>
      </section>
    </main>
  )
}
