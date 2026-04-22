"use client"

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import { Activity, Search, BarChart3, Crosshair, Map as MapIcon, Filter } from "lucide-react";

export default function AnalyticsSection({ records }: { records: any[] }) {
  // Estado original para LineChart
  const [selectedZone, setSelectedZone] = useState<string>("");

  // Nuevos estados para los filtros Scatter
  const [scatterMacro, setScatterMacro] = useState<string>("Todas las Zonas");
  const [scatterBarrio, setScatterBarrio] = useState<string>("Todos los Barrios");

  const zones = useMemo(() => {
    const list = new Set<string>();
    records.forEach(r => {
        if (!r.origin.includes("DOT") && !r.origin.includes("Microcentro") && !r.origin.includes("Florida") && !r.origin.includes("Obelisco") && !r.origin.includes("San Isidro")) list.add(r.origin);
        if (!r.destination.includes("DOT") && !r.destination.includes("Microcentro") && !r.destination.includes("Florida") && !r.destination.includes("Obelisco") && !r.destination.includes("San Isidro")) list.add(r.destination); 
        if (r.origin.includes("San Isidro")) list.add(r.origin);
        if (r.destination.includes("San Isidro")) list.add(r.destination);
    });
    return Array.from(list).filter(z => !z.includes("DOT") && !z.includes("Microcentro") && !z.includes("Florida") && !z.includes("Obelisco")).sort();
  }, [records]);

  React.useEffect(() => {
     if (!selectedZone && zones.length > 0) setSelectedZone(zones[0])
  }, [zones, selectedZone]);

  // Utility to shorten raw names
  const shortenBarrioName = (raw: string) => {
      let friendly = raw;
      if (friendly.includes("San Matias")) return "San Matías";
      if (friendly.includes("Puertos")) return "Puertos";
      if (friendly.includes("Canton")) return "El Cantón";
      if (friendly.includes("Liebres")) return "Liebres";
      if (friendly.includes("Boulevares")) return "Boulevares";
      if (friendly.includes("Glorietas")) return "Glorietas";
      if (friendly.includes("Castaños")) return "Castaños";
      if (friendly.includes("Santa Barbara")) return "Santa Bárbara";
      if (friendly.includes("Encuentro")) return "El Encuentro";
      if (friendly.includes("Escondida")) return "La Escondida";
      if (friendly.includes("Tigre")) return "Tigre";
      return friendly.split(',')[0].replace("Barrio", "").trim();
  };

  // Utility to determine Macro from name
  const getMacro = (name: string) => {
      if (name.includes("Escobar") || name.includes("San Matias") || name.includes("Canton") || name.includes("Puertos")) return "Escobar";
      if (name.includes("Nordelta") || name.includes("Glorietas") || name.includes("Castaños")) return "Nordelta";
      if (name.includes("Tortugas") || name.includes("Liebres") || name.includes("Boulevares")) return "Tortugas";
      if (name.includes("Pacheco") || name.includes("Benavidez") || name.includes("Encuentro")) return "Benavidez / Pacheco";
      if (name.includes("Tigre") || name.includes("Escondida") || name.includes("Santa Barbara") || name.includes("Barbarita")) return "Tigre";
      if (name.includes("San Isidro") || name.includes("Buenavista") || name.includes("Lomas")) return "San Isidro / Bancalari";
      return "Otras Zonas";
  };

  const [scatterMode, setScatterMode] = useState<"barrio" | "macro">("barrio");

  // 1. DATA: Comparison Averages (Bar Chart)
  const comparisonData = useMemo(() => {
      const groups = new Map<string, { zone: string, totalDOT: number, countDOT: number, totalMicro: number, countMicro: number }>();
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          if (!isIda) return; 
          
          let friendlyZone = shortenBarrioName(r.origin);
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

  const [lineSentido, setLineSentido] = useState<"ida" | "vuelta">("ida");
  const [lineDestino, setLineDestino] = useState<"todos" | "dot" | "centro">("todos");
  const [lineMacro, setLineMacro] = useState<string>("Todas las Zonas");

  const barriosForLine = useMemo(() => {
      if (lineMacro === "Todas las Zonas") return [];
      return zones.filter(z => getMacro(z) === lineMacro).map(shortenBarrioName);
  }, [lineMacro, zones]);

  const evolutivoData = useMemo(() => {
      const timeMap = new Map<string, any>();
      
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          if (lineSentido === "ida" && !isIda) return;
          if (lineSentido === "vuelta" && isIda) return;

          const isDOT = isIda ? r.destination.includes("DOT") : r.origin.includes("DOT");
          if (lineDestino === "dot" && !isDOT) return;
          if (lineDestino === "centro" && isDOT) return;

          const relevantBarrioRaw = isIda ? r.origin : r.destination;
          const relevantBarrio = shortenBarrioName(relevantBarrioRaw);
          const macro = getMacro(relevantBarrioRaw);
          if (macro === "Otras Zonas") return;
          
          if (lineMacro !== "Todas las Zonas" && macro !== lineMacro) return;

          const date = new Date(r.timestamp);
          const mRounded = Math.floor(date.getMinutes() / 5) * 5; 
          const key = `${date.getHours().toString().padStart(2,'0')}:${mRounded.toString().padStart(2,'0')}`;

          if (!timeMap.has(key)) timeMap.set(key, { timeHourNum: date.getHours() + (mRounded/60), timeTick: key });
          const point = timeMap.get(key);
          
          const seriesKey = lineMacro === "Todas las Zonas" ? macro : relevantBarrio;
          
          if (!point[`_sum_${seriesKey}`]) { point[`_sum_${seriesKey}`] = 0; point[`_count_${seriesKey}`] = 0; }
          point[`_sum_${seriesKey}`] += r.durationMins;
          point[`_count_${seriesKey}`]++;
      });

      return Array.from(timeMap.values()).map(pt => {
          const finalPt: any = { timeTick: pt.timeTick, timeHourNum: pt.timeHourNum };
          Object.keys(pt).forEach(k => {
              if (k.startsWith("_sum_")) {
                  const series = k.replace("_sum_", "");
                  finalPt[series] = Math.round(pt[k] / pt[`_count_${series}`]);
              }
          });
          return finalPt;
      }).sort((a,b) => a.timeHourNum - b.timeHourNum);
  }, [records, lineSentido, lineDestino, lineMacro]);

  const dynamicLineKeys = useMemo(() => {
      if (lineMacro === "Todas las Zonas") return Array.from(new Set(zones.map(z => getMacro(z)))).filter(m => m !== "Otras Zonas").sort();
      return Array.from(new Set(barriosForLine));
  }, [lineMacro, zones, barriosForLine]);

  const LINE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#f97316", "#84cc16"];

  // 3. DATA: Radar Macro-Zone Comparability
  const radarData = useMemo(() => {
    const macro = new Map<string, { name: string, min: number, max: number }>();
    records.forEach(r => {
        let macroName = getMacro(r.origin);
        if (macroName === "Otras Zonas") macroName = getMacro(r.destination);
        if (macroName === "Otras Zonas") return;
        
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

  // 4. SCATTER PLOTS DATA
  const allMacros = useMemo(() => Array.from(new Set(zones.map(z => getMacro(z)))).sort(), [zones]);
  const barriosInSelectedMacro = useMemo(() => {
      if (scatterMacro === "Todas las Zonas") return zones;
      return zones.filter(z => getMacro(z) === scatterMacro);
  }, [scatterMacro, zones]);
  
  // Format scatter points
  const rawScatterPoints = useMemo(() => {
      return records.map(r => {
         const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
         const relevantBarrio = isIda ? r.origin : r.destination;
         const isDOT = isIda ? r.destination.includes("DOT") : r.origin.includes("DOT");
         
         const d = new Date(r.timestamp);
         const timeDecimal = d.getHours() + (d.getMinutes() / 60);

         return {
            id: r.id,
            isIda,
            isDOT,
            duration: r.durationMins,
            timeHour: timeDecimal,
            barrio: relevantBarrio,
            macro: getMacro(relevantBarrio)
         };
      });
  }, [records]);

  const filteredScatter = useMemo(() => {
      let filtered = rawScatterPoints.filter(p => {
          if (scatterMacro !== "Todas las Zonas" && p.macro !== scatterMacro) return false;
          if (scatterBarrio !== "Todos los Barrios" && p.barrio !== scatterBarrio) return false;
          return true;
      });

      if (scatterMode === "macro") {
          // Conglomerate points by [macro + timeHour + isIda + isDOT]
          const clustered = new Map<string, { total: number, count: number, point: any }>();
          filtered.forEach(p => {
             const key = `${p.macro}-${p.timeHour}-${p.isIda}-${p.isDOT}`;
             if (!clustered.has(key)) clustered.set(key, { total: 0, count: 0, point: { ...p, barrio: p.macro + " (Promedio)" } });
             const cluster = clustered.get(key)!;
             cluster.total += p.duration;
             cluster.count++;
          });
          return Array.from(clustered.values()).map(c => ({
             ...c.point,
             duration: Math.round(c.total / c.count)
          }));
      }

      return filtered;
  }, [rawScatterPoints, scatterMacro, scatterBarrio, scatterMode]);

  const scatterIdaDOT = filteredScatter.filter(p => p.isIda && p.isDOT);
  const scatterIdaCentro = filteredScatter.filter(p => p.isIda && !p.isDOT);
  
  const scatterVueltaDOT = filteredScatter.filter(p => !p.isIda && p.isDOT);
  const scatterVueltaCentro = filteredScatter.filter(p => !p.isIda && !p.isDOT);

  const formatHourTick = (val: number) => {
      const h = Math.floor(val);
      const m = Math.round((val % 1) * 60).toString().padStart(2, '0');
      return `${h}:${m}`;
  };

  const getColorByZone = (macro: string, isDOT: boolean) => {
      // isDOT = Azul, Centro = Verde
      if (isDOT) {
          switch(macro) {
              case "Corredor Escobar": return "#bfdbfe"; // blue-200
              case "Nordelta": return "#60a5fa"; // blue-400
              case "San Isidro / Bancalari": return "#2563eb"; // blue-600
              case "Tigre / Pacheco / Benav.": return "#1d4ed8"; // blue-700
              case "Tortugas / Pilar": return "#1e3a8a"; // blue-900
              default: return "#3b82f6";
          }
      } else {
          switch(macro) {
              case "Corredor Escobar": return "#bbf7d0"; // green-200
              case "Nordelta": return "#4ade80"; // green-400
              case "San Isidro / Bancalari": return "#16a34a"; // green-600
              case "Tigre / Pacheco / Benav.": return "#15803d"; // green-700
              case "Tortugas / Pilar": return "#14532d"; // green-900
              default: return "#22c55e";
          }
      }
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-sm font-sans flex flex-col gap-1">
          <p className="font-bold mb-1" style={{color: getColorByZone(data.macro, data.isDOT)}}>{data.barrio}</p>
          <p className="text-slate-300">Horario: <span className="text-white font-medium">{formatHourTick(data.timeHour)}</span></p>
          <p className="text-slate-300">Duración: <span className="text-white font-medium">{data.duration} min</span></p>
          <p className="text-slate-400 text-xs mt-1">Hacia: {data.isDOT ? 'Shopping DOT' : 'Microcentro'}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <section className="space-y-8 mb-12">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2 mt-8 mb-4 border-b border-white/10 pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
           <BarChart3 className="text-blue-500" size={28}/> 
           Central Analítica
        </h2>
        <p className="text-slate-400">Visualizaciones estadísticas para comprender el comportamiento profundo del tránsito por barrios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BAR CHART: COMPARISON DOT */}
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><MapIcon size={18} className="text-blue-400"/> Promedios Mañana: Al Shopping DOT</h3>
              <p className="text-xs text-slate-400 mb-6">Ranking de tiempos promedio desde todas las zonas de provincia.</p>
              
              <div className="h-[300px] w-full">
                  {comparisonData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.filter(d => d["Al DOT"] > 0).sort((a,b) => a["Al DOT"] - b["Al DOT"])} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                          <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis dataKey="zone" type="category" stroke="#64748b" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                          <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Bar dataKey="Al DOT" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                  )}
              </div>
          </div>

          {/* BAR CHART: COMPARISON MICROCENTRO */}
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><MapIcon size={18} className="text-purple-400"/> Promedios Mañana: Al Microcentro</h3>
              <p className="text-xs text-slate-400 mb-6">Ranking de tiempos promedio llegando al punto más congestionado de la ciudad.</p>
              
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
      </div>

      {/* DISPERSION SCATTER PLOTS */}
      <div className="glass-card mt-8 border-violet-500/20 border-2">
         <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-6 mb-6">
            <div className="mb-4 md:mb-0">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                   <Crosshair size={20} className="text-cyan-400" /> 
                   Dispersión de Peajes y Horarios
               </h3>
               <p className="text-slate-400 text-sm max-w-xl mb-4">Mapeo de nube de puntos. Cada punto es un viaje real registrado. Analiza la densidad de viajes a distintas horas del día y la brecha entre ir al DOT (Azul) vs Centro (Violeta).</p>
               
               {/* SCATTER VIEW TOGGLE */}
               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setScatterMode("barrio")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterMode === 'barrio' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Nubes Reales (Barrios)
                  </button>
                  <button 
                    onClick={() => setScatterMode("macro")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterMode === 'macro' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Promedios (Macro-Zonas)
                  </button>
               </div>
            </div>            
            
            {/* FILTERS FOR SCATTER */}
            <div className="flex flex-col gap-3 min-w-[280px]">
                <div className="relative">
                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <select 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      value={scatterMacro}
                      onChange={(e) => { setScatterMacro(e.target.value); setScatterBarrio("Todos los Barrios"); }}
                   >
                       <option value="Todas las Zonas">Todas las Zonas Macro</option>
                       {allMacros.map(z => <option key={z} value={z}>{z}</option>)}
                   </select>
                </div>
                <div className="relative">
                   <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <select 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500 opacity-90"
                      value={scatterBarrio}
                      onChange={(e) => setScatterBarrio(e.target.value)}
                   >
                       <option value="Todos los Barrios">Todos los Barrios</option>
                       {barriosInSelectedMacro.map(z => <option key={z} value={z}>{z}</option>)}
                   </select>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* SCATTER IDA */}
            <div className="space-y-2">
                <h4 className="text-emerald-400 font-semibold mb-4 text-center">☀️ Nube de IDA (Mañana)</h4>
                <div className="h-[300px] w-full">
                    {scatterIdaDOT.length === 0 && scatterIdaCentro.length === 0 ? <p className="text-center text-slate-500 pt-16">Sin registros para este filtro</p> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="timeHour" domain={[6, 12]} tickFormatter={formatHourTick} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Horario" />
                                <YAxis type="number" dataKey="duration" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Minutos" unit="m" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                                <ZAxis type="number" range={[50, 50]} /> 
                                <Scatter name="Hacia DOT" data={scatterIdaDOT} opacity={0.8}>
                                    {scatterIdaDOT.map((entry, index) => <Cell key={`cell-dot-${index}`} fill={getColorByZone(entry.macro, true)} />)}
                                </Scatter>
                                <Scatter name="Hacia Centro" data={scatterIdaCentro} opacity={0.8}>
                                    {scatterIdaCentro.map((entry, index) => <Cell key={`cell-centro-${index}`} fill={getColorByZone(entry.macro, false)} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* SCATTER VUELTA */}
            <div className="space-y-2">
                <h4 className="text-amber-400 font-semibold mb-4 text-center">🌙 Nube de VUELTA (Tarde)</h4>
                <div className="h-[300px] w-full">
                    {scatterVueltaDOT.length === 0 && scatterVueltaCentro.length === 0 ? <p className="text-center text-slate-500 pt-16">Sin registros para este filtro</p> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="timeHour" domain={[15, 20]} tickFormatter={formatHourTick} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Horario" />
                                <YAxis type="number" dataKey="duration" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Minutos" unit="m" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                                <ZAxis type="number" range={[50, 50]} /> 
                                <Scatter name="Desde DOT" data={scatterVueltaDOT} opacity={0.8}>
                                    {scatterVueltaDOT.map((entry, index) => <Cell key={`cell-dot-v-${index}`} fill={getColorByZone(entry.macro, true)} />)}
                                </Scatter>
                                <Scatter name="Desde Centro" data={scatterVueltaCentro} opacity={0.8}>
                                    {scatterVueltaCentro.map((entry, index) => <Cell key={`cell-centro-v-${index}`} fill={getColorByZone(entry.macro, false)} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

         </div>
      </div>


      {/* INDIVIDUAL EVOLUTION LINE CHART */}
      <div className="glass-card mt-8 border-orange-500/20 border-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 mb-6">
           <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Activity size={20} className="text-orange-400" /> 
                  Evolución Minuto a Minuto
              </h3>
              <p className="text-slate-400 text-sm">Compara la línea en el tiempo para cada barrio dentro de una zona (o compara las macro-zonas enteras).</p>
           </div>
           
           <div className="mt-4 md:mt-0 flex gap-4 flex-wrap">
               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setLineSentido("ida")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineSentido === 'ida' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    IDA (A Capital)
                  </button>
                  <button 
                    onClick={() => setLineSentido("vuelta")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineSentido === 'vuelta' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    VUELTA (A Provincia)
                  </button>
               </div>

               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setLineDestino("todos")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineDestino === 'todos' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ambos
                  </button>
                  <button 
                    onClick={() => setLineDestino("dot")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineDestino === 'dot' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Solo DOT
                  </button>
                  <button 
                    onClick={() => setLineDestino("centro")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineDestino === 'centro' ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Solo Centro
                  </button>
               </div>

               <div className="relative min-w-[220px]">
                   <select 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={lineMacro}
                      onChange={(e) => setLineMacro(e.target.value)}
                   >
                       <option value="Todas las Zonas">Todas las Macro-Zonas</option>
                       {Array.from(new Set(zones.map(z => getMacro(z)))).filter(m => m !== "Otras Zonas").sort().map(z => <option key={z} value={z}>{z}</option>)}
                   </select>
               </div>
           </div>
        </div>

        <div className="w-full h-[400px]">
             {evolutivoData.length === 0 ? <p className="text-center text-slate-500 pt-20">No hay datos acumulados en estos parámetros.</p> : (
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutivoData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="timeTick" stroke="#64748b" fontSize={11} tickMargin={10} tick={{ fill: '#64748b' }} />
                    <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 5', 'dataMax + 10']} tick={{ fill: '#64748b' }} unit="m" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    
                    {dynamicLineKeys.map((k, i) => (
                        <Line 
                           key={k} 
                           type="monotone" 
                           dataKey={k} 
                           name={k} 
                           stroke={LINE_COLORS[i % LINE_COLORS.length]} 
                           strokeWidth={3} 
                           dot={{ r: 4 }} 
                           activeDot={{ r: 6 }} 
                           connectNulls 
                        />
                    ))}
                    </LineChart>
                </ResponsiveContainer>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="glass-card">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Crosshair size={18} className="text-purple-400"/> Volatilidad Macro-Zonal</h3>
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
          
          <div className="glass-card flex flex-col items-center justify-center text-center p-8 space-y-4">
               <Activity size={48} className="text-slate-700" />
               <h3 className="text-xl font-bold text-slate-400">Inteligencia en Progreso</h3>
               <p className="text-slate-500 text-sm max-w-sm">Mientras el sistema automatizado sigue alimentando la base de datos cada 5 minutos, las redes neuronales pronto detectarán el piso y el techo de los corredores viales para comprar bienes raíces mejor valuados.</p>
          </div>
      </div>
    </section>
  )
}
