"use client"

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine, Label
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
      if (friendly.includes("Barbarita")) return "Barbarita";
      if (friendly.includes("San Marco")) return "San Marco";
      if (friendly.includes("Santa Ana")) return "Santa Ana";
      if (friendly.includes("Villa Nueva")) return "Villa Nueva";
      if (friendly.includes("Encuentro")) return "El Encuentro";
      if (friendly.includes("Escondida")) return "La Escondida";
      if (friendly.includes("Tigre")) return "Tigre";
      return friendly.split(',')[0].replace("Barrio", "").trim();
  };

  // Utility to determine Macro from name
  const getMacro = (name: string) => {
      if (name.includes("Escobar") || name.includes("San Matias") || name.includes("Canton") || name.includes("Puertos")) return "Escobar";
      if (name.includes("Nordelta") || name.includes("Glorietas") || name.includes("Castaños") || name.includes("Santa Barbara") || name.includes("Barbarita")) return "Nordelta";
      if (name.includes("Villa Nueva") || name.includes("San Marco") || name.includes("Santa Ana")) return "Villa Nueva";
      if (name.includes("Tortugas") || name.includes("Liebres") || name.includes("Boulevares")) return "Tortugas";
      if (name.includes("Pacheco") || name.includes("Benavidez") || name.includes("Encuentro")) return "Benavidez / Pacheco";
      if (name.includes("Tigre") || name.includes("Escondida")) return "Tigre";
      if (name.includes("San Isidro") || name.includes("Buenavista") || name.includes("Lomas")) return "San Isidro / Bancalari";
      return "Otras Zonas";
  };

  const [scatterMode, setScatterMode] = useState<"barrio" | "macro">("barrio");
  const [scatterDestino, setScatterDestino] = useState<"todos" | "dot" | "centro">("todos");
  const [barTimeMode, setBarTimeMode] = useState<"mañana" | "tarde">("mañana");

  // 1. DATA: Comparison Averages (Bar Chart)
  const comparisonData = useMemo(() => {
      const groups = new Map<string, { zone: string, totalDOT: number, countDOT: number, totalMicro: number, countMicro: number }>();
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          
          if (barTimeMode === "mañana" && !isIda) return;
          if (barTimeMode === "tarde" && isIda) return;

          const isDOT = isIda ? r.destination.includes("DOT") : r.origin.includes("DOT");
          let friendlyZone = shortenBarrioName(isIda ? r.origin : r.destination);
          
          if (!groups.has(friendlyZone)) groups.set(friendlyZone, { zone: friendlyZone, totalDOT: 0, countDOT: 0, totalMicro: 0, countMicro: 0 });
          const stat = groups.get(friendlyZone)!;
          
          if (isDOT) {
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
  }, [records, barTimeMode]);

  const [lineSentido, setLineSentido] = useState<"ida" | "vuelta">("ida");
  const [lineDestino, setLineDestino] = useState<"todos" | "dot" | "centro">("todos");
  const [lineMacro, setLineMacro] = useState<string>("Todas las Zonas");
  const [lineDate, setLineDate] = useState<string>("Histórico Promediado");
  const [lineModoView, setLineModoView] = useState<"desglosado" | "promediado">("desglosado");

  const uniqueDates = useMemo(() => {
      const dates = new Set<string>();
      records.forEach(r => {
          dates.add(new Date(r.timestamp).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
      });
      return Array.from(dates).sort((a, b) => {
          const [d1, m1, y1] = a.split('/');
          const [d2, m2, y2] = b.split('/');
          return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
      });
  }, [records]);

  const barriosForLine = useMemo(() => {
      if (lineMacro === "Todas las Zonas" || lineModoView === "promediado") return [];
      return zones.filter(z => getMacro(z) === lineMacro).map(shortenBarrioName);
  }, [lineMacro, zones, lineModoView]);

  const evolutivoData = useMemo(() => {
      const timeMap = new Map<string, any>();
      
      records.forEach(r => {
          const date = new Date(r.timestamp);
          const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (lineDate !== "Histórico Promediado" && dateStr !== lineDate) return;

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

          const mRounded = Math.floor(date.getMinutes() / 5) * 5; 
          const key = `${date.getHours().toString().padStart(2,'0')}:${mRounded.toString().padStart(2,'0')}`;

          if (!timeMap.has(key)) timeMap.set(key, { timeHourNum: date.getHours() + (mRounded/60), timeTick: key });
          const point = timeMap.get(key);
          
          let seriesKey = (lineMacro === "Todas las Zonas" || lineModoView === "promediado") ? macro : relevantBarrio;
          if (lineDestino === "todos") {
              seriesKey += isDOT ? " (DOT)" : " (Centro)";
          }
          
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
  }, [records, lineSentido, lineDestino, lineMacro, lineDate, lineModoView]);

  const dynamicLineKeys = useMemo(() => {
      let baseKeys: string[] = [];
      if (lineMacro === "Todas las Zonas" || lineModoView === "promediado") {
          baseKeys = Array.from(new Set(zones.map(z => getMacro(z)))).filter(m => m !== "Otras Zonas");
          if (lineMacro !== "Todas las Zonas") baseKeys = [lineMacro];
      } else {
          baseKeys = Array.from(new Set(barriosForLine));
      }

      if (lineDestino === "todos") {
          const expanded: string[] = [];
          baseKeys.forEach(k => {
              expanded.push(`${k} (DOT)`);
              expanded.push(`${k} (Centro)`);
          });
          return expanded;
      }
      return baseKeys;
  }, [lineMacro, zones, barriosForLine, lineDestino]);

  const LINE_COLORS = [
      "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#f97316", "#84cc16",
      "#6366f1", "#14b8a6", "#eab308", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"
  ];

  // 3. DATA: Radar Macro-Zone Comparability (Split by Ida/Vuelta)
  const radarIdaData = useMemo(() => {
      const macro = new Map<string, { name: string, min: number, max: number }>();
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          if (!isIda) return;
          
          let macroName = getMacro(r.origin);
          if (macroName === "Otras Zonas") return;
          
          // Filter out unrealistically low values (< 10 mins)
          if (r.durationMins < 10) return;

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

  const radarVueltaData = useMemo(() => {
      const macro = new Map<string, { name: string, min: number, max: number }>();
      records.forEach(r => {
          const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
          if (isIda) return; // Only return
          
          let macroName = getMacro(r.destination);
          if (macroName === "Otras Zonas") return;
          
          // Filter out unrealistically low values (< 10 mins)
          if (r.durationMins < 10) return;

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
          
          if (scatterDestino === "dot" && !p.isDOT) return false;
          if (scatterDestino === "centro" && p.isDOT) return false;
          
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
              case "Escobar": return "#bfdbfe"; // blue-200
              case "Villa Nueva": return "#93c5fd"; // blue-300
              case "Nordelta": return "#60a5fa"; // blue-400
              case "San Isidro / Bancalari": return "#2563eb"; // blue-600
              case "Benavidez / Pacheco": return "#1d4ed8"; // blue-700
              case "Tigre": return "#1e40af"; // blue-800
              case "Tortugas": return "#1e3a8a"; // blue-900
              default: return "#3b82f6";
          }
      } else {
          switch(macro) {
              case "Escobar": return "#bbf7d0"; // green-200
              case "Villa Nueva": return "#86efac"; // green-300
              case "Nordelta": return "#4ade80"; // green-400
              case "San Isidro / Bancalari": return "#16a34a"; // green-600
              case "Benavidez / Pacheco": return "#15803d"; // green-700
              case "Tigre": return "#166534"; // green-800
              case "Tortugas": return "#14532d"; // green-900
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

  const evolutivoStats = useMemo(() => {
      let dotMin = 999, dotMax = 0, dotSum = 0, dotCount = 0;
      let centroMin = 999, centroMax = 0, centroSum = 0, centroCount = 0;

      evolutivoData.forEach(pt => {
         Object.keys(pt).forEach(k => {
             if (k !== 'timeTick' && k !== 'timeHourNum') {
                 const v = pt[k];
                 if (lineDestino === 'todos') {
                     if (k.includes('(DOT)')) {
                         if (v > dotMax) dotMax = v;
                         if (v < dotMin) dotMin = v;
                         dotSum += v; dotCount++;
                     } else if (k.includes('(Centro)')) {
                         if (v > centroMax) centroMax = v;
                         if (v < centroMin) centroMin = v;
                         centroSum += v; centroCount++;
                     }
                 } else if (lineDestino === 'dot') {
                     if (v > dotMax) dotMax = v;
                     if (v < dotMin) dotMin = v;
                     dotSum += v; dotCount++;
                 } else {
                     if (v > centroMax) centroMax = v;
                     if (v < centroMin) centroMin = v;
                     centroSum += v; centroCount++;
                 }
             }
         });
      });
      return { 
          dot: { min: dotMin === 999 ? 0 : dotMin, max: dotMax, avg: dotCount > 0 ? Math.round(dotSum/dotCount) : 0 },
          centro: { min: centroMin === 999 ? 0 : centroMin, max: centroMax, avg: centroCount > 0 ? Math.round(centroSum/centroCount) : 0 }
      };
  }, [evolutivoData, lineDestino]);

  const scatterIdaStats = useMemo(() => {
      let min = 999, max = 0, sum = 0;
      const all = [...scatterIdaDOT, ...scatterIdaCentro];
      all.forEach(p => {
          if (p.duration > max) max = p.duration;
          if (p.duration < min) min = p.duration;
          sum += p.duration;
      });
      return { min: min === 999 ? 0 : min, max, avg: all.length > 0 ? Math.round(sum/all.length) : 0 };
  }, [scatterIdaDOT, scatterIdaCentro]);

  const scatterVueltaStats = useMemo(() => {
      let min = 999, max = 0, sum = 0;
      const all = [...scatterVueltaDOT, ...scatterVueltaCentro];
      all.forEach(p => {
          if (p.duration > max) max = p.duration;
          if (p.duration < min) min = p.duration;
          sum += p.duration;
      });
      return { min: min === 999 ? 0 : min, max, avg: all.length > 0 ? Math.round(sum/all.length) : 0 };
  }, [scatterVueltaDOT, scatterVueltaCentro]);


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
               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 mr-4">
                  <button 
                    onClick={() => setScatterMode("barrio")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterMode === 'barrio' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Nubes (Barrios)
                  </button>
                  <button 
                    onClick={() => setScatterMode("macro")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterMode === 'macro' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Promedios (Macro)
                  </button>
               </div>

               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setScatterDestino("todos")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterDestino === 'todos' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ambos
                  </button>
                  <button 
                    onClick={() => setScatterDestino("dot")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterDestino === 'dot' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Solo DOT
                  </button>
                  <button 
                    onClick={() => setScatterDestino("centro")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${scatterDestino === 'centro' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Solo Centro
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
                                
                                {scatterIdaStats.max > 0 && <ReferenceLine y={scatterIdaStats.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3}><Label value={`MAX ${scatterIdaStats.max}m`} position="insideTopLeft" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                                {scatterIdaStats.avg > 0 && <ReferenceLine y={scatterIdaStats.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.3}><Label value={`AVG ${scatterIdaStats.avg}m`} position="insideTopLeft" fill="#eab308" fontSize={10} /></ReferenceLine>}
                                {scatterIdaStats.min > 0 && <ReferenceLine y={scatterIdaStats.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.3}><Label value={`MIN ${scatterIdaStats.min}m`} position="insideBottomLeft" fill="#10b981" fontSize={10} /></ReferenceLine>}

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
                                
                                {scatterVueltaStats.max > 0 && <ReferenceLine y={scatterVueltaStats.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3}><Label value={`MAX ${scatterVueltaStats.max}m`} position="insideTopLeft" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                                {scatterVueltaStats.avg > 0 && <ReferenceLine y={scatterVueltaStats.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.3}><Label value={`AVG ${scatterVueltaStats.avg}m`} position="insideTopLeft" fill="#eab308" fontSize={10} /></ReferenceLine>}
                                {scatterVueltaStats.min > 0 && <ReferenceLine y={scatterVueltaStats.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.3}><Label value={`MIN ${scatterVueltaStats.min}m`} position="insideBottomLeft" fill="#10b981" fontSize={10} /></ReferenceLine>}

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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-white/10 pb-4 mb-6">
           <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Activity size={20} className="text-orange-400" /> 
                  Evolución Minuto a Minuto
              </h3>
              <p className="text-slate-400 text-sm">Compara la línea en el tiempo para cada barrio dentro de una zona (o compara las macro-zonas enteras).</p>
           </div>
           
           <div className="mt-4 xl:mt-0 flex gap-4 flex-wrap">
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
               
               <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setLineModoView("desglosado")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineModoView === 'desglosado' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ver Barrios
                  </button>
                  <button 
                    onClick={() => setLineModoView("promediado")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-all ${lineModoView === 'promediado' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Promedio Zonal
                  </button>
               </div>

               <div className="relative min-w-[200px]">
                   <select 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={lineMacro}
                      onChange={(e) => setLineMacro(e.target.value)}
                   >
                       <option value="Todas las Zonas">Todas las Zonas</option>
                       {Array.from(new Set(zones.map(z => getMacro(z)))).filter(m => m !== "Otras Zonas").sort().map(z => <option key={z} value={z}>{z}</option>)}
                   </select>
               </div>
               
               <div className="relative min-w-[150px]">
                   <select 
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-1.5 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-slate-500"
                      value={lineDate}
                      onChange={(e) => setLineDate(e.target.value)}
                   >
                       <option value="Histórico Promediado">Histórico</option>
                       {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
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
                    
                    {/* DOT STATS */}
                    {['dot', 'todos'].includes(lineDestino) && evolutivoStats.dot.max > 0 && <ReferenceLine y={evolutivoStats.dot.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.6}><Label value={`MAX (DOT): ${evolutivoStats.dot.max}m`} position="insideTopLeft" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                    {['dot', 'todos'].includes(lineDestino) && evolutivoStats.dot.avg > 0 && <ReferenceLine y={evolutivoStats.dot.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.6}><Label value={`AVG (DOT): ${evolutivoStats.dot.avg}m`} position="insideTopLeft" fill="#eab308" fontSize={10} /></ReferenceLine>}
                    {['dot', 'todos'].includes(lineDestino) && evolutivoStats.dot.min > 0 && <ReferenceLine y={evolutivoStats.dot.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.6}><Label value={`MIN (DOT): ${evolutivoStats.dot.min}m`} position="insideBottomLeft" fill="#10b981" fontSize={10} /></ReferenceLine>}

                    {/* CENTRO STATS */}
                    {['centro', 'todos'].includes(lineDestino) && evolutivoStats.centro.max > 0 && <ReferenceLine y={evolutivoStats.centro.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.6}><Label value={`MAX (Centro): ${evolutivoStats.centro.max}m`} position="insideTopRight" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                    {['centro', 'todos'].includes(lineDestino) && evolutivoStats.centro.avg > 0 && <ReferenceLine y={evolutivoStats.centro.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.6}><Label value={`AVG (Centro): ${evolutivoStats.centro.avg}m`} position="insideTopRight" fill="#eab308" fontSize={10} /></ReferenceLine>}
                    {['centro', 'todos'].includes(lineDestino) && evolutivoStats.centro.min > 0 && <ReferenceLine y={evolutivoStats.centro.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.6}><Label value={`MIN (Centro): ${evolutivoStats.centro.min}m`} position="insideBottomRight" fill="#10b981" fontSize={10} /></ReferenceLine>}


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

      {/* VOLATILITY RADAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="glass-card border-purple-500/10 border">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Crosshair size={18} className="text-emerald-400"/> Volatilidad: IDA (Mañana)
              </h3>
              <p className="text-xs text-slate-400 mb-6">Brecha entre mejor y peor tiempo hacia CABA.</p>
              
              <div className="h-[320px] w-full">
                 {radarIdaData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarIdaData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: '#64748b', fontSize: 9 }} />
                          <Radar name="Peor Tránsito" dataKey="Peor Tránsito" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                          <Radar name="Mejor Tiempo" dataKey="Mejor Tiempo" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                          <Legend />
                        </RadarChart>
                     </ResponsiveContainer>
                 )}
              </div>
          </div>

          <div className="glass-card border-purple-500/10 border">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <Crosshair size={18} className="text-amber-400"/> Volatilidad: VUELTA (Tarde)
              </h3>
              <p className="text-xs text-slate-400 mb-6">Brecha entre mejor y peor tiempo hacia Provincia.</p>
              
              <div className="h-[320px] w-full">
                 {radarVueltaData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarVueltaData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
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

      {/* COMPARISON BAR CHARTS (MOVED TO END) */}
      <div className="glass-card mt-8 border-blue-500/20 border-2">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-400" />
                      Ranking Comparativo de Tiempos
                  </h3>
                  <p className="text-slate-400 text-sm">Promedios generales por barrio hacia los destinos principales.</p>
              </div>

              <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setBarTimeMode("mañana")}
                    className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${barTimeMode === 'mañana' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    MIRA LA MAÑANA (A CABA)
                  </button>
                  <button 
                    onClick={() => setBarTimeMode("tarde")}
                    className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${barTimeMode === 'tarde' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    MIRA LA TARDE (A PROVINCIA)
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <h4 className="text-blue-400 font-semibold text-center border-b border-blue-500/20 pb-2">Destino: Shopping DOT</h4>
                  <div className="h-[350px] w-full">
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

              <div className="space-y-4">
                  <h4 className="text-purple-400 font-semibold text-center border-b border-purple-500/20 pb-2">Destino: Microcentro</h4>
                  <div className="h-[350px] w-full">
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
      </div>
    </section>
  )
}
