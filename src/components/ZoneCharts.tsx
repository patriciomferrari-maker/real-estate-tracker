"use client"

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Search } from "lucide-react";

export default function ZoneCharts({ records }: { records: any[] }) {
  const [selectedZone, setSelectedZone] = useState<string>("");

  const zones = useMemo(() => {
    const list = new Set<string>();
    records.forEach(r => {
        // It's a base zone if it's not DOT and not Microcentro
        if (!r.origin.includes("DOT") && !r.origin.includes("Microcentro") && !r.origin.includes("Florida") && !r.origin.includes("San Isidro")) {
            list.add(r.origin);
        }
        if (!r.destination.includes("DOT") && !r.destination.includes("Microcentro") && !r.destination.includes("Florida") && !r.destination.includes("San Isidro")) {
            list.add(r.destination); // For "Vuelta" elements
        }
        // Always add San Isidro even though it's technically close
        if (r.origin.includes("San Isidro")) list.add(r.origin);
        if (r.destination.includes("San Isidro")) list.add(r.destination);
    });
    // Remove DOT / Microcentro explicitly
    const finalArray = Array.from(list).filter(z => !z.includes("DOT") && !z.includes("Microcentro") && !z.includes("Florida"));
    return finalArray.sort();
  }, [records]);

  // Set default
  React.useEffect(() => {
     if (!selectedZone && zones.length > 0) setSelectedZone(zones[0])
  }, [zones, selectedZone])

  // Filter records to the selected zone
  const chartData = useMemo(() => {
    if (!selectedZone) return [];
    
    // We want data points representing times of day
    // e.g. { dateTime: "22/04 08:30", toDOT: 45, toMicrocentro: 70 }
    // As records come individually, we group them by the nearest hour/minute
    
    const timeGroups = new Map<string, any>();

    records.forEach(r => {
      const isOrigin = r.origin === selectedZone;
      const isDest = r.destination === selectedZone;
      if (!isOrigin && !isDest) return;

      const date = new Date(r.timestamp);
      // Grouping key
      const key = `${date.getDate()}/${date.getMonth()+1} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
      
      if (!timeGroups.has(key)) {
         timeGroups.set(key, { dateTime: key });
      }

      const point = timeGroups.get(key)!;
      // Determine what this record is:
      let target = isOrigin ? r.destination : r.origin;
      
      // Simplify target name
      if (target.includes("DOT")) target = "DOT";
      if (target.includes("Florida") || target.includes("Microcentro")) target = "Microcentro";

      if (isOrigin) {
          point[`IDA (Hacia ${target})`] = r.durationMins;
      } else {
          point[`VUELTA (Desde ${target})`] = r.durationMins;
      }
    });

    // Convert map to array and sort by chronological order
    // (Assuming original records are descending, so we read keys and revert, or just sort strings)
    // To sort properly we need a solid timestamp
    const sortedRaw = records.filter(r => r.origin === selectedZone || r.destination === selectedZone).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const seriesData: any[] = [];
    const usedKeys = new Set();
    sortedRaw.forEach(r => {
       const date = new Date(r.timestamp);
       const key = `${date.getDate()}/${date.getMonth()+1} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
       if(!usedKeys.has(key)) {
          usedKeys.add(key);
          seriesData.push(timeGroups.get(key));
       }
    })

    return seriesData;
  }, [selectedZone, records]);

  return (
    <div className="glass-card mb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6">
         <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Activity size={24} className="text-purple-400" /> 
                Análisis Individual de Tráfico
            </h2>
            <p className="text-slate-400 text-sm">Evolución de los tiempos de viaje a lo largo del día para el barrio elegido.</p>
         </div>

         <div className="mt-4 md:mt-0 relative min-w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <select 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
             >
                 {zones.map(z => (
                     <option key={z} value={z}>{z}</option>
                 ))}
             </select>
         </div>
      </div>

      <div className="w-full h-[400px]">
          {chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Aún no hay datos históricos para graficar sobre {selectedZone}.
              </div>
          ) : (
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="dateTime" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickMargin={10} 
                    tick={{ fill: '#64748b' }}
                />
                <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    unit="m"
                    domain={['dataMin - 5', 'dataMax + 10']}
                    tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {/* LÍNEAS DE IDA (Mañana típicamente) */}
                <Line type="monotone" dataKey="IDA (Hacia DOT)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="IDA (Hacia Microcentro)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                
                {/* LÍNEAS DE VUELTA (Tarde típicamente) */}
                <Line type="monotone" dataKey="VUELTA (Desde DOT)" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="VUELTA (Desde Microcentro)" stroke="#d946ef" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
            </ResponsiveContainer>
          )}
      </div>

    </div>
  )
}
