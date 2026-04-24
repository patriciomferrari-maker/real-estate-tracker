"use client"

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell, ReferenceLine, Label, LabelList
} from "recharts";
import { 
  Activity, Search, BarChart3, Crosshair, Map as MapIcon, Filter, TrendingUp,
  Sun, Moon, Zap, Navigation, MapPin, Calendar 
} from "lucide-react";

export default function AnalyticsSection({ records, mode = "charts" }: { records: any[], mode?: "charts" | "report" }) {
  // Estado original para LineChart

  // Nuevos estados para los filtros Scatter

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
      if (friendly === "Villa Nueva, Buenos Aires") return "Villa Nueva (Gral)";
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

  // 1. DATA ENRICHMENT (The performance engine)
  const enrichedRecords = useMemo(() => {
    return records.map(r => {
        const d = new Date(r.timestamp);
        const isIda = r.destination.includes("DOT") || r.destination.includes("Microcentro") || r.destination.includes("Florida") || r.destination.includes("Obelisco");
        const isDOT = isIda ? r.destination.includes("DOT") : r.origin.includes("DOT");
        const relevantBarrioRaw = isIda ? r.origin : r.destination;
        
        return {
            ...r,
            isIda,
            isDOT,
            dayOfWeek: d.getDay(),
            month: d.getMonth(),
            macro: getMacro(relevantBarrioRaw),
            barrio: shortenBarrioName(relevantBarrioRaw),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            dateStr: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            timestampDate: d
        };
    }).filter(r => {
        // Purge generic locations that distort averages
        if (r.barrio === "Villa Nueva (Gral)" || r.barrio === "Villa Nueva") return false;
        return true;
    });
  }, [records]);

  const metadata = useMemo(() => {
    const zonesSet = new Set<string>();
    const datesSet = new Set<string>();
    
    enrichedRecords.forEach(r => {
        if (!r.origin.includes("DOT") && !r.origin.includes("Microcentro") && !r.origin.includes("Florida") && !r.origin.includes("Obelisco")) zonesSet.add(r.origin);
        if (!r.destination.includes("DOT") && !r.destination.includes("Microcentro") && !r.destination.includes("Florida") && !r.destination.includes("Obelisco")) zonesSet.add(r.destination); 
        datesSet.add(r.dateStr);
    });

    return { 
        zones: Array.from(zonesSet).sort(), 
        uniqueDates: Array.from(datesSet).sort((a, b) => {
            const [d1, m1, y1] = a.split('/');
            const [d2, m2, y2] = b.split('/');
            return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
        })
    };
  }, [enrichedRecords]);

  const zones = metadata.zones;
  const uniqueDates = metadata.uniqueDates;


  // 1. GLOBAL COMMAND CENTER STATE
  const [globalMode, setGlobalMode] = useState<"macro" | "barrio">("macro");
  const [globalMacro, setGlobalMacro] = useState<string>("Todas las Zonas");
  const [globalBarrio, setGlobalBarrio] = useState<string>("Todos los Barrios");
  const [globalDestination, setGlobalDestination] = useState<string>("Ambos");
  const [timeBinSize, setTimeBinSize] = useState<number>(15);
  const [barTimeMode, setBarTimeMode] = useState<"mañana" | "tarde">("mañana");
  const [barMacro, setBarMacro] = useState<string>("Todas las Zonas");
  const [evoMacro, setEvoMacro] = useState<string>("Todas las Zonas");
  const [evoDest, setEvoDest] = useState<string>("Ambos");
  const [evoTimeMode, setEvoTimeMode] = useState<"mañana" | "tarde" | "todo">("todo");
  const [trendTimeMode, setTrendTimeMode] = useState<"mañana" | "tarde">("mañana");
  const [comparisonMode, setComparisonMode] = useState<"all" | "dow" | "month">("all");
  
  // Helpers derived from global selection
  const allMacros = useMemo(() => Array.from(new Set(zones.map(z => getMacro(z)))).sort(), [zones]);
  const barriosInSelectedMacro = useMemo(() => {
      if (globalMacro === "Todas las Zonas") return zones;
      return zones.filter(z => getMacro(z) === globalMacro);
  }, [globalMacro, zones]);

  const barriosInBarMacro = useMemo(() => {
      if (barMacro === "Todas las Zonas") return zones.map(z => shortenBarrioName(z));
      return zones.filter(z => getMacro(z) === barMacro).map(z => shortenBarrioName(z));
  }, [barMacro, zones]);

  const todayStr = useMemo(() => new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }), []);

  // Summary KPIs
  const summaryStats = useMemo(() => {
    let dotMin = 999, dotMax = 0, dotSum = 0, dotCount = 0;
    let centroMin = 999, centroMax = 0, centroSum = 0, centroCount = 0;
    const barDOT = new Map<string, { t: number, c: number }>();
    const barCentro = new Map<string, { t: number, c: number }>();

    const todayRec = enrichedRecords.find(r => r.dateStr === todayStr);
    const todayDOW = todayRec?.dayOfWeek;
    const todayMonth = todayRec?.month;

    enrichedRecords.forEach(r => {
        const isToday = r.dateStr === todayStr;
        
        // Global Filter
        if (globalMacro !== "Todas las Zonas" && r.macro !== globalMacro) return;
        if (globalBarrio !== "Todos los Barrios" && r.barrio !== globalBarrio) return;
        
        // Comparison Context Filter (Only for historical average)
        if (!isToday) {
            if (comparisonMode === "dow" && r.dayOfWeek !== todayDOW) return;
            if (comparisonMode === "month" && r.month !== todayMonth) return;
        }

        // Destination Filter
        if (globalDestination === "DOT" && !r.isDOT) return;
        if (globalDestination === "Obelisco" && r.isDOT) return;

        if (r.isDOT) {
            dotSum += r.durationMins; dotCount++;
            if (r.durationMins < dotMin) dotMin = r.durationMins;
            if (r.durationMins > dotMax) dotMax = r.durationMins;
            if (!barDOT.has(r.barrio)) barDOT.set(r.barrio, { t: 0, c: 0 });
            const s = barDOT.get(r.barrio)!; s.t += r.durationMins; s.c++;
        } else {
            centroSum += r.durationMins; centroCount++;
            if (r.durationMins < centroMin) centroMin = r.durationMins;
            if (r.durationMins > centroMax) centroMax = r.durationMins;
            if (!barCentro.has(r.barrio)) barCentro.set(r.barrio, { t: 0, c: 0 });
            const s = barCentro.get(r.barrio)!; s.t += r.durationMins; s.c++;
        }
    });

    const getBest = (m: Map<string, any>) => {
        let best = { name: '-', val: 999 };
        m.forEach((v, k) => {
            const avg = v.t / v.c;
            if (avg < best.val) best = { name: k, val: avg };
        });
        return best.name;
    };

    return {
        dot: { avg: dotCount > 0 ? Math.round(dotSum/dotCount) : 0, best: getBest(barDOT) },
        centro: { avg: centroCount > 0 ? Math.round(centroSum/centroCount) : 0, best: getBest(barCentro) },
        total: enrichedRecords.length
    };
  }, [enrichedRecords]);

  // Multibarrio Evolution
  // Evolution Multibarrio (Keep but sync with globalMacro)
  const evolutivoData = useMemo(() => {
    const map = new Map<string, any>();
    
    const todayRec = enrichedRecords.find(r => r.dateStr === todayStr);
    const todayDOW = todayRec?.dayOfWeek;
    const todayMonth = todayRec?.month;

    enrichedRecords.forEach(r => {
        // Local Filter for Evolution
        if (evoMacro !== "Todas las Zonas" && r.macro !== evoMacro) return;

        // Local Destination Filter
        if (evoDest === "DOT" && !r.isDOT) return;
        if (evoDest === "Obelisco" && r.isDOT) return;
        
        // Global Destination Filter
        if (globalDestination === "DOT" && !r.isDOT) return;
        if (globalDestination === "Obelisco" && r.isDOT) return;

        // Time Filter for Evolution
        if (evoTimeMode === "mañana" && r.hours >= 12) return;
        if (evoTimeMode === "tarde" && r.hours < 12) return;

        // Comparison Context Filter (Only for historical average)
        const isToday = r.dateStr === todayStr;
        if (!isToday) {
            if (comparisonMode === "dow" && r.dayOfWeek !== todayDOW) return;
            if (comparisonMode === "month" && r.month !== todayMonth) return;
        }

        const bin = Math.floor(r.minutes / 30) * 30; 
        const key = `${r.hours.toString().padStart(2,'0')}:${bin.toString().padStart(2,'0')}`;
        if (!map.has(key)) map.set(key, { timeTick: key, timeHourNum: r.hours + (bin/60) });
        const p = map.get(key);

        // Agrupación dinámica: Macro si es 'Todas', Barrio si selecciono una zona
        const labelBase = evoMacro === "Todas las Zonas" ? r.macro : r.barrio;
        const dataKey = `${labelBase} (${r.isDOT ? 'DOT' : 'Centro'})`;

        if (!p[dataKey]) p[dataKey + '_s'] = 0, p[dataKey + '_c'] = 0;
        p[dataKey + '_s'] += r.durationMins;
        p[dataKey + '_c']++;
        p[dataKey] = Math.round(p[dataKey + '_s'] / p[dataKey + '_c']);
    });
    
    // Calculate aggregate metrics per tick
    const result = Array.from(map.values()).sort((a,b) => a.timeHourNum - b.timeHourNum);
    result.forEach(d => {
        const vals: number[] = Object.keys(d)
            .filter(k => k !== "timeTick" && k !== "timeHourNum" && !k.endsWith('_s') && !k.endsWith('_c'))
            .map(k => d[k]);
        
        if (vals.length > 0) {
            d["__avg"] = Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
            d["__min"] = Math.min(...vals);
            d["__max"] = Math.max(...vals);
        }
    });

    return result;
  }, [enrichedRecords, evoMacro, evoDest, evoTimeMode, globalDestination, comparisonMode]);

  const evoSummary = useMemo(() => {
      if (evolutivoData.length === 0) return { min: 0, max: 0, avg: 0 };
      let min = 999, max = 0, sum = 0, count = 0;
      evolutivoData.forEach(d => {
          if (d.__min < min) min = d.__min;
          if (d.__max > max) max = d.__max;
          sum += d.__avg;
          count++;
      });
      return { min: min === 999 ? 0 : min, max, avg: count > 0 ? Math.round(sum/count) : 0 };
  }, [evolutivoData]);

  // BARS: Ranking data
  const comparisonData = useMemo(() => {
    const groups = new Map<string, any>();
    const todayRec = enrichedRecords.find(r => r.dateStr === todayStr);
    const todayDOW = todayRec?.dayOfWeek;
    const todayMonth = todayRec?.month;

    enrichedRecords.forEach(r => {
        // Local Filter for BARS
        if (barMacro !== "Todas las Zonas" && r.macro !== barMacro) return;

        // Destination Filter
        if (globalDestination === "DOT" && !r.isDOT) return;
        if (globalDestination === "Obelisco" && r.isDOT) return;

        // Dynamic drill-down: If 'Todas' is selected, group by macro. 
        // If a specific zone is selected, show its internal barrios.
        const groupKey = barMacro === "Todas las Zonas" ? r.macro : r.barrio;

        if (barTimeMode === "mañana" && !r.isIda) return;
        if (barTimeMode === "tarde" && r.isIda) return;
        
        if (!groups.has(groupKey)) groups.set(groupKey, { 
            zone: groupKey, 
            tDOT: 0, cDOT: 0, tMicro: 0, cMicro: 0,
            tdDOT: 0, cdDOT: 0, tdMicro: 0, cdMicro: 0,
            tdowDOT: 0, cdowDOT: 0, tdowMicro: 0, cdowMicro: 0
        });
        const s = groups.get(groupKey)!;
        const isToday = r.dateStr === todayStr;

        if (isToday) {
            if (r.isDOT) { s.tdDOT += r.durationMins; s.cdDOT++; }
            else { s.tdMicro += r.durationMins; s.cdMicro++; }
        } else {
            // Check if it's the same day of week
            const isSameDOW = r.dayOfWeek === todayDOW;
            
            if (r.isDOT) { 
                s.tDOT += r.durationMins; s.cDOT++; 
                if (isSameDOW) { s.tdowDOT += r.durationMins; s.cdowDOT++; }
            } else { 
                s.tMicro += r.durationMins; s.cMicro++; 
                if (isSameDOW) { s.tdowMicro += r.durationMins; s.cdowMicro++; }
            }
        }
    });
    return Array.from(groups.values()).map(s => {
        const hDOT = s.cDOT > 0 ? Math.round(s.tDOT / s.cDOT) : 0;
        const hoyDOT = s.cdDOT > 0 ? Math.round(s.tdDOT / s.cdDOT) : 0;
        const dowDOT = s.cdowDOT > 0 ? Math.round(s.tdowDOT / s.cdowDOT) : 0;

        const hMicro = s.cMicro > 0 ? Math.round(s.tMicro / s.cMicro) : 0;
        const hoyMicro = s.cdMicro > 0 ? Math.round(s.tdMicro / s.cdMicro) : 0;
        const dowMicro = s.cdowMicro > 0 ? Math.round(s.tdowMicro / s.cdowMicro) : 0;

        return {
            zone: s.zone,
            "Histórico (DOT)": hDOT,
            "Hoy (DOT)": hoyDOT,
            "Histórico DOW (DOT)": dowDOT,
            "deltaDOT": hoyDOT > 0 ? hoyDOT - hDOT : 0,
            "dotZoneLabel": `${s.zone} ${hoyDOT > 0 ? (hoyDOT >= hDOT ? `(+${hoyDOT - hDOT}m)` : `(${hoyDOT - hDOT}m)`) : ''}`,
            
            "Histórico (Centro)": hMicro,
            "Hoy (Centro)": hoyMicro,
            "Histórico DOW (Centro)": dowMicro,
            "deltaCentro": hoyMicro > 0 ? hoyMicro - hMicro : 0,
            "centroZoneLabel": `${s.zone} ${hoyMicro > 0 ? (hoyMicro >= hMicro ? `(+${hoyMicro - hMicro}m)` : `(${hoyMicro - hMicro}m)`) : ''}`
        };
    }).sort((a,b) => (a["Histórico (DOT)"] + a["Histórico (Centro)"]) - (b["Histórico (DOT)"] + b["Histórico (Centro)"]));
  }, [enrichedRecords, barTimeMode, barMacro, globalMode, todayStr, comparisonMode]);

  const highlightStats = useMemo(() => {
      const cats = {
          "mañana_dot": { ida: true, dot: true },
          "mañana_centro": { ida: true, dot: false },
          "tarde_dot": { ida: false, dot: true },
          "tarde_centro": { ida: false, dot: false }
      };

      const results: any = {};
      Object.entries(cats).forEach(([key, filter]) => {
          const sRecords = enrichedRecords.filter(r => r.isIda === filter.ida && r.isDOT === filter.dot);
          if (sRecords.length === 0) { results[key] = null; return; }

          // DOW Analysis
          const dowSum = new Array(7).fill(null).map(() => ({s:0,c:0}));
          sRecords.forEach(r => { dowSum[r.dayOfWeek].s += r.durationMins; dowSum[r.dayOfWeek].c++; });
          const dowNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
          let bestDOWIdx = -1, worstDOWIdx = -1, minDowAvg = 999, maxDowAvg = 0;
          dowSum.forEach((v,i) => {
              if (v.c === 0 || i === 0 || i === 6) return;
              const avg = v.s/v.c;
              if (avg < minDowAvg) { minDowAvg = avg; bestDOWIdx = i; }
              if (avg > maxDowAvg) { maxDowAvg = avg; worstDOWIdx = i; }
          });

          // Time Logic & Peak Impact
          const timeBuckets = new Map<string, {s:number, c:number}>();
          sRecords.forEach(r => {
              const t = `${r.hours.toString().padStart(2,'0')}:${(Math.floor(r.minutes/30)*30).toString().padStart(2,'0')}`;
              if (!timeBuckets.has(t)) timeBuckets.set(t, {s:0,c:0});
              const b = timeBuckets.get(t)!; b.s += r.durationMins; b.c++;
          });
          let bTime = "", wTime = "", bTimeVal = 999, wTimeVal = 0;
          timeBuckets.forEach((v,k) => {
              const avg = v.s/v.c;
              if (avg < bTimeVal) { bTimeVal = avg; bTime = k; }
              if (avg > wTimeVal) { wTimeVal = avg; wTime = k; }
          });

          // Reliability & Predictability
          const avgTotal = sRecords.reduce((acc, curr) => acc + curr.durationMins, 0) / sRecords.length;
          const variance = sRecords.reduce((acc, curr) => acc + Math.pow(curr.durationMins - avgTotal, 2), 0) / sRecords.length;
          const stdDev = Math.sqrt(variance);
          const reliability = Math.max(0, 100 - (stdDev / avgTotal * 100)); // 0-100 score

          // Best Barrio
          const bSum = new Map<string, {s:number,c:number}>();
          sRecords.forEach(r => {
              if (!bSum.has(r.barrio)) bSum.set(r.barrio, {s:0,c:0});
              const v = bSum.get(r.barrio)!; v.s += r.durationMins; v.c++;
          });
          let bBarrio = "", bBarrioVal = 999;
          bSum.forEach((v,k) => { if (v.s/v.c < bBarrioVal) { bBarrioVal = v.s/v.c; bBarrio = k; } });

          // NEW: Savings & Efficiency logic
          const potentialSavings = Math.round(wTimeVal - bTimeVal);
          const weeklyEfficiency = Math.round(((avgTotal - minDowAvg) / avgTotal) * 100);
          const grade = reliability > 85 ? "AAA" : (reliability > 70 ? "B+" : "C-");

          results[key] = {
              bestBarrio: bBarrio,
              minAvg: Math.round(bBarrioVal),
              bestTime: bTime,
              peakImpact: Math.round(wTimeVal - bTimeVal),
              reliability: Math.round(reliability),
              bestDOW: dowNames[bestDOWIdx],
              worstDOW: dowNames[worstDOWIdx],
              count: sRecords.length,
              potentialSavings,
              weeklyEfficiency,
              grade,
              avgTotal: Math.round(avgTotal)
          };
      });
      return results;
  }, [enrichedRecords]);

  const trendData = useMemo(() => {
    const dotMap = new Map<string, any>();
    const centroMap = new Map<string, any>();
    
    const todayRec = enrichedRecords.find(r => r.dateStr === todayStr);
    const todayDOW = todayRec?.dayOfWeek;
    const todayMonth = todayRec?.month;

    enrichedRecords.forEach(r => {
        const isToday = r.dateStr === todayStr;

        // Context Filter
        if (!isToday) {
            if (comparisonMode === "dow" && r.dayOfWeek !== todayDOW) return;
            if (comparisonMode === "month" && r.month !== todayMonth) return;
        }

        // Destination Filter
        if (globalDestination === "DOT" && !r.isDOT) return;
        if (globalDestination === "Obelisco" && r.isDOT) return;

        // Parent Filters
        if (globalMacro !== "Todas las Zonas" && r.macro !== globalMacro) return;
        if (globalBarrio !== "Todos los Barrios" && r.barrio !== globalBarrio) return;

        // Shift Filter for Trend Zoom
        if (trendTimeMode === "mañana" && r.hours >= 13) return;
        if (trendTimeMode === "tarde" && r.hours < 13) return;

        const map = r.isDOT ? dotMap : centroMap;
        const binMins = Math.floor(r.minutes / timeBinSize) * timeBinSize;
        const key = `${r.hours.toString().padStart(2,'0')}:${binMins.toString().padStart(2,'0')}`;
        
        if (!map.has(key)) map.set(key, { timeTick: key, timeHourNum: r.hours + (binMins/60) });
        const obj = map.get(key)!;
        
        const label = r.macro;
        const type = r.isIda ? 'Ida' : 'Vuelta';
        
        const dataKey = `${label} ${type} (${isToday ? 'Hoy' : 'Hist'})`;
        if (!obj[dataKey]) obj[dataKey + '_s'] = 0, obj[dataKey + '_c'] = 0;
        obj[dataKey + '_s'] += r.durationMins;
        obj[dataKey + '_c']++;
        obj[dataKey] = Math.round(obj[dataKey + '_s'] / obj[dataKey + '_c']);
    });

    const fmt = (m: Map<string, any>) => Array.from(m.values()).sort((a,b) => a.timeHourNum - b.timeHourNum);
    return { dot: fmt(dotMap), centro: fmt(centroMap) };
  }, [enrichedRecords, globalMacro, globalBarrio, globalDestination, todayStr, timeBinSize, trendTimeMode, comparisonMode]);

  const LINE_COLORS = [
      "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#f97316", "#84cc16",
      "#6366f1", "#14b8a6", "#eab308", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"
  ];

  const rawScatterPoints = useMemo(() => {
    return enrichedRecords.map(r => {
      const bin = Math.floor(r.minutes / timeBinSize) * timeBinSize;
      return { 
          id: r.id, isIda: r.isIda, isDOT: r.isDOT, duration: r.durationMins, 
          timeHour: r.hours + (bin / 60), barrio: r.barrio, macro: r.macro,
          isToday: r.dateStr === todayStr
      };
    }).filter(p => {
        if (globalMacro !== "Todas las Zonas" && p.macro !== globalMacro) return false;
        if (globalBarrio !== "Todos los Barrios" && p.barrio !== globalBarrio) return false;
        
        // Destination Filter
        if (globalDestination === "DOT" && !p.isDOT) return false;
        if (globalDestination === "Obelisco" && p.isDOT) return false;

        return true;
    });
  }, [enrichedRecords, timeBinSize, todayStr, globalMacro, globalBarrio, globalDestination]);

  const filteredScatter = useMemo(() => {
      let filtered = rawScatterPoints;
      
      const MAX_POINTS = 1200;
      if (globalMode === "barrio" && filtered.length > MAX_POINTS) {
          const stride = Math.ceil(filtered.length / MAX_POINTS);
          filtered = filtered.filter((_, i) => i % stride === 0);
      }

      if (globalMode === "macro") {
          const clustered = new Map<string, { total: number, count: number, point: any }>();
          filtered.forEach(p => {
             const key = `${p.macro}-${p.timeHour}-${p.isIda}-${p.isDOT}`;
             if (!clustered.has(key)) clustered.set(key, { total: 0, count: 0, point: { ...p, barrio: p.macro + " (Promedio)" } });
             const cluster = clustered.get(key)!;
             cluster.total += p.duration; cluster.count++;
          });
          filtered = Array.from(clustered.values()).map(c => ({ ...c.point, duration: Math.round(c.total / c.count) }));
      }

      // Group by macro and destination for more efficient rendering
      const grouped = new Map<string, any[]>();
      filtered.forEach(p => {
          const key = `${p.macro}|${p.isIda}|${p.isDOT}`;
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)!.push(p);
      });

      return Array.from(grouped.entries()).map(([key, data]) => {
          const [macro, isIda, isDOT] = key.split('|');
          return {
              macro,
              isIda: isIda === 'true',
              isDOT: isDOT === 'true',
              data
          };
      });
  }, [rawScatterPoints, globalMode]);

  // Split the grouped series into high-level categories for the charts
  const scatterSeriesIda = filteredScatter.filter(s => s.isIda);
  const scatterSeriesVuelta = filteredScatter.filter(s => !s.isIda);

  const formatHourTick = (val: number) => {
      const h = Math.floor(val);
      const m = Math.round((val % 1) * 60).toString().padStart(2, '0');
      return `${h}:${m}`;
  };

  const getColorByZone = (macro: string, isDOT: boolean) => {
      if (isDOT) {
          switch(macro) {
              case "Escobar": return "#bfdbfe";
              case "Villa Nueva": return "#93c5fd";
              case "Nordelta": return "#60a5fa";
              case "San Isidro / Bancalari": return "#2563eb";
              case "Benavidez / Pacheco": return "#1d4ed8";
              case "Tigre": return "#1e40af";
              case "Tortugas": return "#1e3a8a";
              default: return "#3b82f6";
          }
      } else {
          switch(macro) {
              case "Escobar": return "#bbf7d0";
              case "Villa Nueva": return "#86efac";
              case "Nordelta": return "#4ade80";
              case "San Isidro / Bancalari": return "#16a34a";
              case "Benavidez / Pacheco": return "#15803d";
              case "Tigre": return "#166534";
              case "Tortugas": return "#14532d";
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


  const scatterIdaStats = useMemo(() => {
      let min = 999, max = 0, sum = 0, count = 0;
      scatterSeriesIda.forEach(s => {
          s.data.forEach((p:any) => {
            if (p.duration > max) max = p.duration;
            if (p.duration < min) min = p.duration;
            sum += p.duration; count++;
          });
      });
      return { min: min === 999 ? 0 : min, max, avg: count > 0 ? Math.round(sum/count) : 0 };
  }, [scatterSeriesIda]);

  const scatterVueltaStats = useMemo(() => {
      let min = 999, max = 0, sum = 0, count = 0;
      scatterSeriesVuelta.forEach(s => {
          s.data.forEach((p:any) => {
            if (p.duration > max) max = p.duration;
            if (p.duration < min) min = p.duration;
            sum += p.duration; count++;
          });
      });
      return { min: min === 999 ? 0 : min, max, avg: count > 0 ? Math.round(sum/count) : 0 };
  }, [scatterSeriesVuelta]);
  const DeltaLabel = (props: any) => {
    const { x, y, width, height, deltaKey, payload } = props;
    if (!payload || !payload[deltaKey]) return null;
    
    const deltaValue = payload[deltaKey];
    const isBad = deltaValue > 0;
    const color = isBad ? "#ff4d4d" : "#00ff88";
    const label = isBad ? `+${deltaValue}m` : `${deltaValue}m`;

    return (
      <g>
        <rect x={x + width + 5} y={y + 1} width={35} height={height-2} fill="rgba(15,23,42,0.8)" rx={4} />
        <text 
          x={x + width + 10} 
          y={y + height / 2} 
          fill={color} 
          fontSize={12} 
          fontWeight="bold"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    );
  };

  const CustomEvolutionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const filtered = payload.filter((p: any) => !p.dataKey.toString().startsWith('__'));
      if (filtered.length === 0) return null;
      return (
        <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 shadow-xl ring-1 ring-white/10">
          <p className="text-white font-bold mb-2 border-b border-white/10 pb-1">{label}</p>
          <div className="space-y-1">
            {filtered.sort((a:any, b:any) => b.value - a.value).map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-4">
                <span style={{ color: p.stroke || p.fill }} className="text-xs font-medium">
                  {p.name}
                </span>
                <span className="text-xs text-white font-bold">{p.value}m</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8">
      {mode === "report" ? (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="text-center space-y-2 py-4">
                  <h2 className="text-3xl font-black text-white tracking-tight">Reporte Ejecutivo de Movilidad</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto">Análisis profundo basado en {enrichedRecords.length} registros históricos procesados mediante algoritmos de varianza y predictibilidad.</p>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* MAÑANA (A CABA) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                            <Sun size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">IDA: Hacia Capital</h3>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Franja: 06:00 - 12:00</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['mañana_dot', 'mañana_centro'].map((k) => {
                            const s = highlightStats[k];
                            if(!s) return null;
                            const isDOT = k.includes('dot');
                            return (
                                <div key={k} className="glass-card p-6 border-b-4 border-b-indigo-500 hover:scale-[1.01] transition-transform relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${isDOT ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-purple-900/30 text-purple-400 border-purple-500/30'}`}>
                                                    Destino: {isDOT ? 'Shopping DOT' : 'Microcentro'}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-slate-900 text-slate-400 border-white/5`}>
                                                    Reliability: {s.grade}
                                                </span>
                                            </div>
                                            <h4 className="text-3xl font-black text-white leading-none tracking-tight">{shortenBarrioName(s.bestBarrio)}</h4>
                                            <p className="text-xs text-slate-500 font-bold">Tiempo Base: <span className="text-white">{s.avgTotal}m</span> promedio global</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border text-center min-w-[80px] ${s.reliability > 85 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_-10px_rgba(245,158,11,0.3)]'}`}>
                                            <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">SCORE</div>
                                            <div className="text-2xl font-black">{s.reliability}%</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5 group-hover:border-amber-500/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                    <Zap size={16} className="text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ventana de Oro</p>
                                                    <p className="text-sm font-black text-emerald-400">{s.bestTime} hs</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-emerald-500/50 font-black uppercase">Consistencia</p>
                                                <p className="text-xs font-bold text-white">Alta</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                                                <p className="text-[9px] text-red-400/70 font-black uppercase mb-1">Pérdida en Pico</p>
                                                <p className="text-lg font-black text-red-500">+{s.peakImpact}m</p>
                                                <p className="text-[9px] text-slate-600 font-bold">vs Golden Window</p>
                                            </div>
                                            <div className="bg-emerald-600/5 border border-emerald-500/10 p-3 rounded-xl">
                                                <p className="text-[9px] text-emerald-400/70 font-black uppercase mb-1">Ahorro Máx.</p>
                                                <p className="text-lg font-black text-emerald-500">{s.potentialSavings}m</p>
                                                <p className="text-[9px] text-slate-600 font-bold">Potencial diario</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Día Óptimo</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-blue-400">{s.bestDOW}</span>
                                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1 rounded">-{s.weeklyEfficiency}%</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Día Crítico</p>
                                                <span className="text-base font-black text-red-400">{s.worstDOW}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 p-3 bg-indigo-600/5 border border-indigo-500/10 rounded-xl flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                                            <p className="text-[10px] text-indigo-300 leading-relaxed italic">
                                                {s.reliability > 85 
                                                  ? `Trayecto altamente predecible. La zona de ${shortenBarrioName(s.bestBarrio)} es ideal para traslados con horario fijo.` 
                                                  : `Zonas con varianza moderada. Se recomienda salir en la ventana de las ${s.bestTime}hs para evitar el impacto de ${s.peakImpact}m.`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                        <TrendingUp size={120} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TARDE (VUELTA) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-orange-600/10 p-4 rounded-2xl border border-orange-500/20">
                        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                            <Moon size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">VUELTA: Hacia Norte</h3>
                            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Franja: 16:00 - 20:00</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['tarde_dot', 'tarde_centro'].map((k) => {
                            const s = highlightStats[k];
                            if(!s) return null;
                            const isDOT = k.includes('dot');
                            return (
                                <div key={k} className="glass-card p-6 border-b-4 border-b-orange-500 hover:scale-[1.01] transition-transform relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${isDOT ? 'bg-orange-900/30 text-orange-400 border-orange-500/30' : 'bg-pink-900/30 text-pink-400 border-pink-500/30'}`}>
                                                    Desde: {isDOT ? 'Shopping DOT' : 'Microcentro'}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-slate-900 text-slate-400 border-white/5`}>
                                                    Reliability: {s.grade}
                                                </span>
                                            </div>
                                            <h4 className="text-3xl font-black text-white leading-none tracking-tight">{shortenBarrioName(s.bestBarrio)}</h4>
                                            <p className="text-xs text-slate-500 font-bold">Tiempo Base: <span className="text-white">{s.avgTotal}m</span> promedio global</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border text-center min-w-[80px] ${s.reliability > 85 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_-10_rgba(245,158,11,0.3)]'}`}>
                                            <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">SCORE</div>
                                            <div className="text-2xl font-black">{s.reliability}%</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5 group-hover:border-orange-500/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                    <Zap size={16} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ventana de Oro</p>
                                                    <p className="text-sm font-black text-emerald-400">{s.bestTime} hs</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] text-emerald-500/50 font-black uppercase">Flujo</p>
                                                <p className="text-xs font-bold text-white">Óptimo</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                                                <p className="text-[9px] text-red-400/70 font-black uppercase mb-1">Pérdida en Pico</p>
                                                <p className="text-lg font-black text-red-500">+{s.peakImpact}m</p>
                                                <p className="text-[9px] text-slate-600 font-bold">vs Golden Window</p>
                                            </div>
                                            <div className="bg-emerald-600/5 border border-emerald-500/10 p-3 rounded-xl">
                                                <p className="text-[9px] text-emerald-400/70 font-black uppercase mb-1">Ahorro Máx.</p>
                                                <p className="text-lg font-black text-emerald-500">{s.potentialSavings}m</p>
                                                <p className="text-[9px] text-slate-600 font-bold">Potencial diario</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Día Óptimo</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-blue-400">{s.bestDOW}</span>
                                                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1 rounded">-{s.weeklyEfficiency}%</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Día Crítico</p>
                                                <span className="text-base font-black text-red-400">{s.worstDOW}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 p-3 bg-orange-600/5 border border-orange-500/10 rounded-xl flex items-start gap-3">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                                            <p className="text-[10px] text-orange-300 leading-relaxed italic">
                                                {s.reliability > 85 
                                                  ? `Trayecto estable. Regreso desde ${isDOT ? 'DOT' : 'Centro'} hacia ${shortenBarrioName(s.bestBarrio)} con flujo constante.` 
                                                  : `Zonas con alta variabilidad. El regreso puede demorar hasta ${s.peakImpact}m extra fuera de la ventana de las ${s.bestTime}hs.`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                        <TrendingUp size={120} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
          </div>
      ) : (

    <section className="space-y-8 mb-12 animate-in fade-in duration-700">
      {/* MASTER CONTROL PANEL (Sticky) */}
      <div className="sticky top-2 z-50 glass-card border-blue-500/30 bg-slate-900/80 backdrop-blur-xl p-4 flex flex-wrap gap-6 items-center justify-between shadow-2xl rounded-2xl">
          <div className="flex gap-4 items-center">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
              <Filter size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Consola de Control</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Filtros Globales Sincronizados</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
                <button onClick={() => setGlobalMode("macro")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${globalMode === 'macro' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Zonas Agrupadas</button>
                <button onClick={() => setGlobalMode("barrio")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${globalMode === 'barrio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>Barrios</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center flex-1 justify-end">
              {/* Group Every */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Precisión</span>
                <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
                    {[5, 15, 30, 60].map(val => (
                        <button key={val} onClick={() => setTimeBinSize(val)} className={`px-3 py-1 text-[10px] font-bold rounded ${timeBinSize === val ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-white transition-colors'}`}>{val}m</button>
                    ))}
                </div>
              </div>

              {/* Macro Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Macro Zona</span>
                <select 
                    value={globalMacro} 
                    onChange={(e) => { setGlobalMacro(e.target.value); setGlobalBarrio("Todos los Barrios"); }}
                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    <option value="Todas las Zonas">Todas las Zonas</option>
                    {allMacros.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Barrio Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Barrio Específico</span>
                <select 
                    value={globalBarrio} 
                    onChange={(e) => setGlobalBarrio(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none min-w-[150px] hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    <option value="Todos los Barrios">Todos los Barrios</option>
                    {barriosInSelectedMacro.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Destination Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase ml-1">Destino</span>
                <select 
                    value={globalDestination} 
                    onChange={(e) => setGlobalDestination(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    <option value="Ambos">Ambos</option>
                    <option value="DOT">Shopping DOT</option>
                    <option value="Obelisco">Obelisco / Centro</option>
                </select>
              </div>

              {/* Comparison Mode Select */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-amber-500 font-bold uppercase ml-1">Referencia Histórica</span>
                <select 
                    value={comparisonMode} 
                    onChange={(e) => setComparisonMode(e.target.value as any)}
                    className="bg-amber-900/20 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-200 focus:ring-1 focus:ring-amber-500 outline-none hover:bg-amber-900/40 transition-colors cursor-pointer font-bold"
                >
                    <option value="all">Todo el Histórico</option>
                    <option value="dow">Mismo Día (Semana)</option>
                    <option value="month">Mismo Mes</option>
                </select>
              </div>
          </div>
      </div>


      {/* MULTI-BARRIO EVOLUTION CHART */}
      <div className="glass-card border-white/5 space-y-6">
          <div className="flex flex-col xl:flex-row justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <TrendingUp size={20} className="text-blue-400"/> 
                     Evolución {globalMacro}: Hoy vs. {comparisonMode === 'dow' ? 'Mismo Día Histórico' : (comparisonMode === 'month' ? 'Mismo Mes Histórico' : 'Promedio Histórico')}
                   </h3>
                </div>
                <div className="flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Filtrar Zona:</span>
                    <select 
                        value={evoMacro} 
                        onChange={(e) => setEvoMacro(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                    >
                        <option value="Todas las Zonas">Todas las Zonas (Vista Macro)</option>
                        {allMacros.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Turno:</span>
                        <select 
                            value={evoTimeMode} 
                            onChange={(e) => setEvoTimeMode(e.target.value as any)}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <option value="todo">Día Completo</option>
                            <option value="mañana">Mañana (Ida)</option>
                            <option value="tarde">Tarde (Vuelta)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Destino:</span>
                        <select 
                            value={evoDest} 
                            onChange={(e) => setEvoDest(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <option value="Ambos">Ambos</option>
                            <option value="DOT">Shopping DOT</option>
                            <option value="Obelisco">Obelisco</option>
                        </select>
                    </div>
               </div>
          </div>
          
          <div className="h-[350px] w-full">
              {evolutivoData.length === 0 ? <p className="text-center text-slate-500 pt-20">Seleccioná barrios para graficar</p> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutivoData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="timeTick" fontSize={10} stroke="#475569" />
                      <YAxis fontSize={10} stroke="#475569" unit="m" />
                       <Tooltip content={<CustomEvolutionTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                      <ReferenceLine y={evoSummary.max} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `MAX ${evoSummary.max}m`, fill: '#ef4444', fontSize: 10, position: 'insideLeft' }} />
                      <ReferenceLine y={evoSummary.avg} stroke="#eab308" strokeDasharray="3 3" label={{ value: `AVG ${evoSummary.avg}m`, fill: '#eab308', fontSize: 10, position: 'insideLeft' }} />
                      <ReferenceLine y={evoSummary.min} stroke="#10b981" strokeDasharray="3 3" label={{ value: `MIN ${evoSummary.min}m`, fill: '#10b981', fontSize: 10, position: 'insideLeft' }} />

                      {Object.keys(evolutivoData[0] || {}).map((k, idx) => {
                          if (k === 'timeTick' || k === 'timeHourNum' || k.endsWith('_s') || k.endsWith('_c') || k.startsWith('__')) return null;
                          return <Line key={k} type="monotone" dataKey={k} stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2} dot={false} connectNulls />;
                      })}
                    </LineChart>
                  </ResponsiveContainer>
              )}
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
               <p className="text-slate-400 text-sm max-w-xl">Mapeo de nube de puntos. Cada punto es un viaje real registrado. Analiza la densidad de viajes y la brecha entre ir al DOT (Azul) vs Centro (Verde).</p>
            </div>            
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* SCATTER IDA */}
            <div className="space-y-2">
                <h4 className="text-emerald-400 font-semibold mb-4 text-center">☀️ Nube de IDA (Mañana)</h4>
                <div className="h-[300px] w-full">
                    {scatterSeriesIda.length === 0 ? <p className="text-center text-slate-500 pt-16">Sin registros para este filtro</p> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="timeHour" domain={[6, 12]} tickFormatter={formatHourTick} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Horario" />
                                <YAxis type="number" dataKey="duration" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Minutos" unit="m" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                                <ZAxis type="number" range={[40, 40]} /> 
                                
                                {scatterIdaStats.max > 0 && <ReferenceLine y={scatterIdaStats.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3}><Label value={`MAX ${scatterIdaStats.max}m`} position="insideTopLeft" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                                {scatterIdaStats.avg > 0 && <ReferenceLine y={scatterIdaStats.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.3}><Label value={`AVG ${scatterIdaStats.avg}m`} position="insideTopLeft" fill="#eab308" fontSize={10} /></ReferenceLine>}
                                {scatterIdaStats.min > 0 && <ReferenceLine y={scatterIdaStats.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.3}><Label value={`MIN ${scatterIdaStats.min}m`} position="insideBottomLeft" fill="#10b981" fontSize={10} /></ReferenceLine>}

                                {scatterSeriesIda.map((series, idx) => (
                                    <React.Fragment key={`ida-${series.macro}-${idx}`}>
                                        <Scatter 
                                            name={`${series.macro} (Historial)`} 
                                            data={series.data.filter(p => !p.isToday)} 
                                            fill={getColorByZone(series.macro, series.isDOT)}
                                            opacity={0.1}
                                            shape="circle"
                                        />
                                        <Scatter 
                                            name={`${series.macro} (HOY)`} 
                                            data={series.data.filter(p => p.isToday)} 
                                            fill={getColorByZone(series.macro, series.isDOT)}
                                            opacity={1}
                                            shape="circle"
                                        />
                                    </React.Fragment>
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* SCATTER VUELTA */}
            <div className="space-y-2">
                <h4 className="text-amber-400 font-semibold mb-4 text-center">🌙 Nube de VUELTA (Tarde)</h4>
                <div className="h-[300px] w-full">
                    {scatterSeriesVuelta.length === 0 ? <p className="text-center text-slate-500 pt-16">Sin registros para este filtro</p> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" dataKey="timeHour" domain={[15, 20]} tickFormatter={formatHourTick} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Horario" />
                                <YAxis type="number" dataKey="duration" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} name="Minutos" unit="m" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                                <ZAxis type="number" range={[40, 40]} /> 
                                
                                {scatterVueltaStats.max > 0 && <ReferenceLine y={scatterVueltaStats.max} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3}><Label value={`MAX ${scatterVueltaStats.max}m`} position="insideTopLeft" fill="#ef4444" fontSize={10} /></ReferenceLine>}
                                {scatterVueltaStats.avg > 0 && <ReferenceLine y={scatterVueltaStats.avg} stroke="#eab308" strokeDasharray="3 3" opacity={0.3}><Label value={`AVG ${scatterVueltaStats.avg}m`} position="insideTopLeft" fill="#eab308" fontSize={10} /></ReferenceLine>}
                                {scatterVueltaStats.min > 0 && <ReferenceLine y={scatterVueltaStats.min} stroke="#10b981" strokeDasharray="3 3" opacity={0.3}><Label value={`MIN ${scatterVueltaStats.min}m`} position="insideBottomLeft" fill="#10b981" fontSize={10} /></ReferenceLine>}

                                {scatterSeriesVuelta.map((series, idx) => (
                                    <React.Fragment key={`vuelta-${series.macro}-${idx}`}>
                                        <Scatter 
                                            name={`${series.macro} (Historial)`} 
                                            data={series.data.filter(p => !p.isToday)} 
                                            fill={getColorByZone(series.macro, series.isDOT)}
                                            opacity={0.1}
                                            shape="circle"
                                        />
                                        <Scatter 
                                            name={`${series.macro} (HOY)`} 
                                            data={series.data.filter(p => p.isToday)} 
                                            fill={getColorByZone(series.macro, series.isDOT)}
                                            opacity={1}
                                            shape="circle"
                                        />
                                    </React.Fragment>
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

         </div>
      </div>


      {/* COMPARATIVE TREND CHARTS (TODAY VS HISTORY) */}
      <div className="glass-card mb-8 border-amber-500/10 border">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity size={20} className="text-amber-400" />
                    Comparativa de Tendencia: Hoy vs. {comparisonMode === 'dow' ? 'Mismo Día (DOW)' : 'Histórico Total'}
                </h3>
                <p className="text-xs text-slate-400 italic">Comparando el tráfico de <b>{globalMacro}</b> contra el {comparisonMode === 'dow' ? 'promedio de los mismos días de la semana' : 'promedio histórico general'}.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                  {/* Selector Mañana/Tarde */}
                  <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1">
                      <button 
                        onClick={() => setTrendTimeMode("mañana")}
                        className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${trendTimeMode === 'mañana' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        MAÑANA
                      </button>
                      <button 
                        onClick={() => setTrendTimeMode("tarde")}
                        className={`px-4 py-1 text-[10px] font-bold rounded transition-all ${trendTimeMode === 'tarde' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        TARDE
                      </button>
                  </div>

                  <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

                  {/* Selector Histórico/DOW */}
                  <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => setComparisonMode("all")}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${comparisonMode === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        HISTÓRICO TOTAL
                      </button>
                      <button 
                        onClick={() => setComparisonMode("dow")}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${comparisonMode === 'dow' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        MISMO DÍA (DOW)
                      </button>
                  </div>
              </div>
          </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* CHART DESTINO: DOT */}
            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" /> Destino: Shopping DOT
                </h4>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData.dot} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="timeTick" stroke="#475569" fontSize={10} tick={{ fill: '#64748b' }} />
                            <YAxis stroke="#475569" fontSize={10} unit="m" tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
                            
                            {allMacros.map((m, mIdx) => {
                                 const color = LINE_COLORS[mIdx % LINE_COLORS.length];
                                 const type = trendTimeMode === 'mañana' ? 'Ida' : 'Vuelta';
                                 return (
                                     <React.Fragment key={m}>
                                         <Line type="monotone" dataKey={`${m} ${type} (Hoy)`} name={`${m} Hoy`} stroke={color} strokeWidth={3} dot={{ r: 3 }} connectNulls />
                                         <Line type="monotone" dataKey={`${m} ${type} (Hist)`} name={`${m} Hist.`} stroke={color} strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls opacity={0.4} />
                                     </React.Fragment>
                                 );
                             })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CHART DESTINO: CENTRO */}
            <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" /> Destino: Obelisco / Centro
                </h4>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData.centro} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="timeTick" stroke="#475569" fontSize={10} tick={{ fill: '#64748b' }} />
                            <YAxis stroke="#475569" fontSize={10} unit="m" tick={{ fill: '#64748b' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
                            
                            {allMacros.map((m, mIdx) => {
                                 const color = LINE_COLORS[mIdx % LINE_COLORS.length];
                                 const type = trendTimeMode === 'mañana' ? 'Ida' : 'Vuelta';
                                 return (
                                     <React.Fragment key={m}>
                                         <Line type="monotone" dataKey={`${m} ${type} (Hoy)`} name={`${m} Hoy`} stroke={color} strokeWidth={3} dot={{ r: 3 }} connectNulls />
                                         <Line type="monotone" dataKey={`${m} ${type} (Hist)`} name={`${m} Hist.`} stroke={color} strokeWidth={1} strokeDasharray="3 3" dot={false} connectNulls opacity={0.4} />
                                     </React.Fragment>
                                 );
                             })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
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

          {/* LOCAL FILTERS FOR RANKING */}
          <div className="flex flex-wrap gap-4 px-6 pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Filtrar Ranking:</span>
                  <select 
                    value={barMacro} 
                    onChange={(e) => setBarMacro(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                  >
                      <option value="Todas las Zonas">Todas las Zonas</option>
                      {allMacros.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <h4 className="text-blue-400 font-semibold text-center border-b border-blue-500/20 pb-2">Destino: Shopping DOT</h4>
                  <div className="h-[350px] w-full">
                      {comparisonData.length === 0 ? <p className="text-center text-slate-500 pt-20">Faltan datos</p> : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                             data={comparisonData.filter(d => d["Histórico (DOT)"] > 0).sort((a,b) => a["Histórico (DOT)"] - b["Histórico (DOT)"])} 
                             layout="vertical" 
                             margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                             style={{ overflow: 'visible' }}
                           >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                              <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis 
                                dataKey="dotZoneLabel" 
                                type="category" 
                                stroke="#64748b" 
                                width={140} 
                                tick={(props: any) => {
                                  const { x, y, payload } = props;
                                  const isBad = payload.value.includes('+');
                                  const isGood = payload.value.includes('-') && !payload.value.includes('+-');
                                  const labelParts = payload.value.split(' ');
                                  const zoneName = labelParts.slice(0, -1).join(' ');
                                  const deltaText = labelParts[labelParts.length - 1];

                                  return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text x={-10} y={0} dy={4} textAnchor="end" fontSize={11} fill="#94a3b8">
                                        <tspan fill="#e2e8f0" fontWeight="bold">{zoneName}</tspan>
                                        <tspan fill={isBad ? "#ff4d4d" : (isGood ? "#00ff88" : "#94a3b8")} dx={5} fontWeight="black">
                                          {deltaText}
                                        </tspan>
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <Tooltip 
                                 cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                 formatter={(value, name, props) => {
                                   if (name === "Hoy (DOT)") {
                                     const delta = props.payload.deltaDOT;
                                     const dText = delta > 0 ? `(+${delta}m)` : (delta < 0 ? `(${delta}m)` : '');
                                     return [`${value} min ${dText}`, name];
                                   }
                                   return [`${value} min`, name];
                                 }}
                               />
                               <Legend verticalAlign="top" height={36}/>
                               <Bar dataKey="Histórico DOW (DOT)" name="Prom. Histórico DOW" fill="#4338ca" radius={[0, 4, 4, 0]} barSize={8}>
                                   <LabelList dataKey="Histórico DOW (DOT)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#818cf8', fontSize: '9px', fontWeight: 'bold' }} />
                               </Bar>
                               <Bar dataKey="Hoy (DOT)" name="Hoy Real" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={14}>
                                   <LabelList dataKey="Hoy (DOT)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 'bold' }} />
                               </Bar>
                               <Bar dataKey="Histórico (DOT)" name="Prom. General" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={8}>
                                   <LabelList dataKey="Histórico (DOT)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#64748b', fontSize: '9px', fontWeight: 'bold' }} />
                               </Bar>
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
                            <BarChart 
                             data={comparisonData.filter(d => d["Histórico (Centro)"] > 0).sort((a,b) => a["Histórico (Centro)"] - b["Histórico (Centro)"])} 
                             layout="vertical" 
                             margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                             style={{ overflow: 'visible' }}
                           >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false}/>
                              <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                              <YAxis 
                                dataKey="centroZoneLabel" 
                                type="category" 
                                stroke="#64748b" 
                                width={140} 
                                tick={(props: any) => {
                                  const { x, y, payload } = props;
                                  const isBad = payload.value.includes('+');
                                  const isGood = payload.value.includes('-') && !payload.value.includes('+-');
                                  const labelParts = payload.value.split(' ');
                                  const zoneName = labelParts.slice(0, -1).join(' ');
                                  const deltaText = labelParts[labelParts.length - 1];

                                  return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text x={-10} y={0} dy={4} textAnchor="end" fontSize={11} fill="#94a3b8">
                                        <tspan fill="#e2e8f0" fontWeight="bold">{zoneName}</tspan>
                                        <tspan fill={isBad ? "#ff4d4d" : (isGood ? "#00ff88" : "#94a3b8")} dx={5} fontWeight="black">
                                          {deltaText}
                                        </tspan>
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              <Tooltip 
                                 cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                 formatter={(value, name, props) => {
                                   if (name === "Hoy (Centro)") {
                                     const delta = props.payload.deltaCentro;
                                     const dText = delta > 0 ? `(+${delta}m)` : (delta < 0 ? `(${delta}m)` : '');
                                     return [`${value} min ${dText}`, name];
                                   }
                                   return [`${value} min`, name];
                                 }}
                               />
                               <Legend verticalAlign="top" height={36}/>
                               <Bar dataKey="Histórico DOW (Centro)" name="Prom. Histórico DOW" fill="#7e22ce" radius={[0, 4, 4, 0]} barSize={8}>
                                   <LabelList dataKey="Histórico DOW (Centro)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#c084fc', fontSize: '9px', fontWeight: 'bold' }} />
                               </Bar>
                               <Bar dataKey="Hoy (Centro)" name="Hoy Real" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={14}>
                                   <LabelList dataKey="Hoy (Centro)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#ffffff', fontSize: '11px', fontWeight: 'bold' }} />
                               </Bar>
                               <Bar dataKey="Histórico (Centro)" name="Prom. General" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={8}>
                                   <LabelList dataKey="Histórico (Centro)" position="right" formatter={(v:any) => `${v}m`} style={{ fill: '#64748b', fontSize: '9px', fontWeight: 'bold' }} />
                               </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </section>
      )}
    </div>
  )
}
