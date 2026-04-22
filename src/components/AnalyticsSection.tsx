"use client"

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { Activity, Search, BarChart3, Crosshair, Map as MapIcon } from "lucide-react";

export default function AnalyticsSection({ records }: { records: any[] }) {
  const [selectedZone, setSelectedZone] = useState<string>("");

  const zones = useMemo(() => {
    const list = new Set<string>();
    records.forEach(r => {
        if (!r.origin.includes("DOT") && !r.origin.includes("Microcentro") && !r.origin.includes("Florida") && !r.origin.includes("Obelisco") && !r.origin.includes("San Isidro")) list.add(r.origin);
        if (!r.destination.includes("DOT") && !r.destination.includes("Microcentro") && !r.destination.includes("Florida") && !r.destination.includes("Obelisco") && !r.destination.includes("San Isidro")) list.add(r.destination); 
        if (r.origin.includes("San Isidro")) list.add(r.origin);
        if (r.destination.includes("San Isidro")) list.add(r.destination);
    });
    return Array.from(list).filter(z => !z.includes("DOT") && !z.includes("Microcentro") && !z.includes("Florida")).sort();
  }, [records]);

  React.useEffect(() => {
     if (!selectedZone && zones.length > 0) setSelectedZone(zones[0])
  }, [zones, selectedZone]);

  // 1. DATA: Comparison Averages (Bar Chart)
  const comparisonData = useMemo(() => {
      const groups = new Map<string, { zone: string, totalDOT: number, countDOT: number, totalMicro: number, countMicro: number }>();
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          if (!isIda) return; // Sólo promedios de IDA.
          
          let friendlyZone = r.origin;
          if (friendlyZone.includes("San Matias")) friendlyZone = "San Matías";
          else if (friendlyZone.includes("Puertos")) friendlyZone = "Puertos";
          else if (friendlyZone.includes("Canton")) friendlyZone = "El Cantón";
          else if (friendlyZone.includes("Liebres")) friendlyZone = "Liebres";
          else if (friendlyZone.includes("Boulevares")) friendlyZone = "Boulevares";
          else if (friendlyZone.includes("Glorietas")) friendlyZone = "Glorietas";
          else if (friendlyZone.includes("Castaños")) friendlyZone = "Castaños";
          else if (friendlyZone.includes("Santa Barbara")) friendlyZone = "Santa Bárbara";
          else if (friendlyZone.includes("Encuentro")) friendlyZone = "El Encuentro";
          else if (friendlyZone.includes("Escondida")) friendlyZone = "La Escondida";
          else friendlyZone = friendlyZone.split(',')[0].replace("Barrio", "").trim();

          if (!groups.has(friendlyZone)) groups.set(friendlyZone, { zone: friendlyZone, totalDOT: 0, countDOT: 0, totalMicro: 0, countMicro: 0 });
          const stat = groups.get(friendlyZone)!;
          
          if (r.destination.includes("DOT")) {
              stat.totalDOT += r.durationMins; stat.countDOT++;
          } else {
              stat.totalMicro += r.durationMins; stat.countMicro++;
          }
      });

      return Array.from(groups.values()).map(s => ({
          zone: s.zone,
          "Al DOT": s.countDOT > 0 ? Math.round(s.totalDOT / s.countDOT) : 0,
          "Al Microcentro": s.countMicro > 0 ? Math.round(s.totalMicro / s.countMicro) : 0,
      })).filter(s => s["Al DOT"] > 0 || s["Al Microcentro"] > 0).sort((a,b) => (a["Al DOT"] + a["Al Microcentro"]) - (b["Al DOT"] + b["Al Microcentro"]));
  }, [records]);


  // 2. DATA: Time of Day Line Chart (Individual)
  const lineChartData = useMemo(() => {
    if (!selectedZone) return [];
    const timeGroups = new Map<string, any>();
    records.forEach(r => {
      const isOrigin = r.origin === selectedZone;
      const isDest = r.destination === selectedZone;
      if (!isOrigin && !isDest) return;
      const date = new Date(r.timestamp);
      const key = `${date.getDate()}/${date.getMonth()+1} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
      if (!timeGroups.has(key)) timeGroups.set(key, { dateTime: key });
      const point = timeGroups.get(key)!;
      let target = isOrigin ? r.destination : r.origin;
      if (target.includes("DOT")) target = "DOT";
      if (target.includes("Florida") || target.includes("Microcentro") || target.includes("Obelisco")) target = "Microcentro";
      if (isOrigin) point[`IDA (Hacia ${target})`] = r.durationMins;
      else point[`VUELTA (Desde ${target})`] = r.durationMins;
    });

    const sortedRaw = records.filter(r => r.origin === selectedZone || r.destination === selectedZone).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const seriesData: any[] = [];
    const usedKeys = new Set();
    sortedRaw.forEach(r => {
       const date = new Date(r.timestamp);
       const key = `${date.getDate()}/${date.getMonth()+1} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
       if(!usedKeys.has(key)) { usedKeys.add(key); seriesData.push(timeGroups.get(key)); }
    })
    return seriesData;
  }, [selectedZone, records]);

  // 3. DATA: Radar Macro-Zone Comparability
  const radarData = useMemo(() => {
    const macro = new Map<string, { name: string, min: number, max: number }>();
    records.forEach(r => {
        let macroName = "Otro";
        if (r.origin.includes("Escobar") || r.destination.includes("Escobar")) macroName = "Corredor Escobar";
        else if (r.origin.includes("Nordelta") || r.destination.includes("Nordelta")) macroName = "Corredor Nordelta";
        else if (r.origin.includes("Tortuguitas") || r.destination.includes("Tortuguitas")) macroName = "Tortugas/Tortuguitas";
        else if (r.origin.includes("San Isidro") || r.origin.includes("Buenavista")) macroName = "Centrico (S.Isidro/S.F)";
        
        if (macroName === "Otro") return;
        
        if (!macro.has(macroName)) macro.set(macroName, { name: macroName, min: 999, max: 0 });
        const obj = macro.get(macroName)!;
        if (r.durationMins < obj.min) obj.min = r.durationMins;
        if (r.durationMins > obj.max) obj.max = r.durationMins;
    });
    return Array.from(macro.values()).map(m => ({
        subject: m.name,
        "Mejor Tiempo": m.min === 999 ? 0 : m.min,
        "Peor Tránsito": m.max
    }));
  }, [records]);


  return (
    <section className="space-y-8 mb-12">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2 mt-8 mb-4 border-b border-white/10 pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
           <BarChart3 className="text-blue-500" size={28}/> 
           Central Analítica
        </h2>
        <p className="text-slate-400">Visualizaciones multiplataforma para comprender el comportamiento profundo por barrios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BAR CHART: COMPARISON DOT */}
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><MapIcon size={18} className="text-blue-400"/> Promedios Mañana: Al Shopping DOT</h3>
              <p className="text-xs text-slate-400 mb-6">Ranking de tiempos desde cada barrio hasta el inicio de CABA.</p>
              
              <div className="h-[300px] w-full">
                  {comparisonData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.filter(d => d["Al DOT"] > 0).sort((a,b) => a["Al DOT"] - b["Al DOT"])} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                          <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis dataKey="zone" type="category" stroke="#64748b" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Bar dataKey="Al DOT" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16}>
                             {/* Optional labels */}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                  )}
              </div>
          </div>

          {/* BAR CHART: COMPARISON MICROCENTRO */}
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><MapIcon size={18} className="text-purple-400"/> Promedios Mañana: Al Microcentro</h3>
              <p className="text-xs text-slate-400 mb-6">Ranking de tiempos desde cada barrio hasta el corazón del centro.</p>
              
              <div className="h-[300px] w-full">
                  {comparisonData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.filter(d => d["Al Microcentro"] > 0).sort((a,b) => a["Al Microcentro"] - b["Al Microcentro"])} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                          <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis dataKey="zone" type="category" stroke="#64748b" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Bar dataKey="Al Microcentro" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                  )}
              </div>
          </div>

          {/* RADAR: VOLATILITY */}
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Crosshair size={18} className="text-purple-400"/> Volatilidad y Previsibilidad de Corredores</h3>
              <p className="text-xs text-slate-400 mb-6">Brecha entre un día sin tránsito ("Mejor tiempo") y picos de colapso ("Peor tránsito").</p>
              
              <div className="h-[350px] w-full">
                 {radarData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Radar name="Peor Tránsito" dataKey="Peor Tránsito" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                          <Radar name="Mejor Tiempo" dataKey="Mejor Tiempo" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Legend />
                        </RadarChart>
                     </ResponsiveContainer>
                 )}
              </div>
          </div>
      </div>

      {/* INDIVIDUAL LINE CHART */}
      <div className="glass-card mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6">
           <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Activity size={20} className="text-yellow-400" /> 
                  Micro-Análisis por Hora
              </h3>
              <p className="text-slate-400 text-sm">Fluctuación exacta por minuto para un barrio en específico.</p>
           </div>
           <div className="mt-4 md:mt-0 relative min-w-[280px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <select 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
               >
                   {zones.map(z => <option key={z} value={z}>{z}</option>)}
               </select>
           </div>
        </div>

        <div className="w-full h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="dateTime" stroke="#64748b" fontSize={11} tickMargin={10} tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" fontSize={11} unit="m" domain={['dataMin - 5', 'dataMax + 10']} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Line type="monotone" dataKey="IDA (Hacia DOT)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="IDA (Hacia Microcentro)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="VUELTA (Desde DOT)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="VUELTA (Desde Microcentro)" stroke="#d946ef" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} connectNulls />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
