"use client"

import React, { useState, useMemo } from 'react'
import { ProcessedRecord } from '@/components/DashboardContainer'
import { 
  Clock, 
  MapPin, 
  Sun, 
  Moon, 
  Car, 
  Navigation, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Sparkles
} from 'lucide-react'

interface LiveSectionProps {
  records: ProcessedRecord[]
}

export default function LiveSection({ records }: LiveSectionProps) {
  // 1. Obtener el registro más reciente general
  const latestOverall = records.length > 0 ? records[0] : null;

  // 2. Determinar el turno por defecto (según la hora del último registro)
  // Si el último registro fue antes de las 13 hs, es IDA (Mañana). Si es >= 13 hs, es VUELTA (Tarde).
  const defaultShift = latestOverall ? (latestOverall.hours < 13 ? 'ida' : 'vuelta') : 'vuelta';
  const [selectedShift, setSelectedShift] = useState<'ida' | 'vuelta'>(defaultShift);

  // 3. Fecha y hora de la última actualización
  const lastUpdatedInfo = useMemo(() => {
    if (!latestOverall) return { dateStr: '--/--/----', timeStr: '--:-- hs' };
    const dateStr = latestOverall.dateStr;
    const timeStr = `${String(latestOverall.hours).padStart(2, '0')}:${String(latestOverall.minutes).padStart(2, '0')} hs`;
    return { dateStr, timeStr };
  }, [latestOverall]);

  // 4. Filtrar los registros más recientes para el turno seleccionado
  // Un registro por cada combinación de (barrio, isDOT)
  const isIdaMode = selectedShift === 'ida';

  // Extraer las macros y barrios dinámicamente
  const macroOrder = [
    "Nordelta", 
    "Villa Nueva", 
    "Benavidez / Pacheco", 
    "Tortugas", 
    "Tigre", 
    "San Isidro / Bancalari"
  ];

  // Calcular promedios históricos para comparación rápida
  const historicalAverages = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    records.forEach(r => {
      if (r.isIda === isIdaMode) {
        const k = `${r.barrio}|${r.isDOT}`;
        if (!map.has(k)) map.set(k, { sum: 0, count: 0 });
        const item = map.get(k)!;
        item.sum += r.durationMins;
        item.count++;
      }
    });
    const avgMap = new Map<string, number>();
    map.forEach((val, key) => {
      avgMap.set(key, Math.round(val.sum / val.count));
    });
    return avgMap;
  }, [records, isIdaMode]);

  // Agrupar los datos en vivo por Macro y por Barrio
  const liveGroups = useMemo(() => {
    // Buscar la última lectura para cada barrio y cada destino (DOT y Microcentro) en el turno activo
    const latestByBarrioDest = new Map<string, ProcessedRecord>();

    // Como records viene ordenado descendente por timestamp, el primero que encontremos es el más reciente
    records.forEach(r => {
      if (r.isIda === isIdaMode) {
        const key = `${r.barrio}|${r.isDOT}`;
        if (!latestByBarrioDest.has(key)) {
          latestByBarrioDest.set(key, r);
        }
      }
    });

    // Solo incluir las 6 macro-zonas activas
    const sortedMacros = macroOrder;

    return sortedMacros.map(macro => {
      // Barrios en esta macro
      const barrios = Array.from(new Set(records.filter(r => r.macro === macro).map(r => r.barrio))).sort();

      const barrioData = barrios.map(barrio => {
        const dotRecord = latestByBarrioDest.get(`${barrio}|true`);
        const centroRecord = latestByBarrioDest.get(`${barrio}|false`);

        const dotAvg = historicalAverages.get(`${barrio}|true`) || null;
        const centroAvg = historicalAverages.get(`${barrio}|false`) || null;

        const dotDiff = dotRecord && dotAvg ? dotRecord.durationMins - dotAvg : null;
        const centroDiff = centroRecord && centroAvg ? centroRecord.durationMins - centroAvg : null;

        // Hora del último registro
        const lastCapture = dotRecord?.timestamp || centroRecord?.timestamp;
        let lastTimeStr = "--:--";
        if (dotRecord) {
          lastTimeStr = `${String(dotRecord.hours).padStart(2, '0')}:${String(dotRecord.minutes).padStart(2, '0')} hs`;
        } else if (centroRecord) {
          lastTimeStr = `${String(centroRecord.hours).padStart(2, '0')}:${String(centroRecord.minutes).padStart(2, '0')} hs`;
        }

        return {
          barrio,
          dot: dotRecord ? dotRecord.durationMins : null,
          dotDiff,
          centro: centroRecord ? centroRecord.durationMins : null,
          centroDiff,
          lastTimeStr
        };
      });

      // Promedios de la macro-zona
      const validDot = barrioData.map(b => b.dot).filter((d): d is number => d !== null);
      const validCentro = barrioData.map(b => b.centro).filter((c): c is number => c !== null);

      const macroDotAvg = validDot.length > 0 ? Math.round(validDot.reduce((a, b) => a + b, 0) / validDot.length) : null;
      const macroCentroAvg = validCentro.length > 0 ? Math.round(validCentro.reduce((a, b) => a + b, 0) / validCentro.length) : null;

      return {
        macro,
        barrios: barrioData,
        macroDotAvg,
        macroCentroAvg
      };
    }).filter(group => group.barrios.length > 0);
  }, [records, isIdaMode, historicalAverages]);

  // Labels dinámicos solicitados por el usuario
  const dotLabel = isIdaMode ? "Destino Shopping DOT" : "Desde Shopping DOT";
  const centroLabel = isIdaMode ? "Destino Microcentro" : "Desde Microcentro";

  // Helpers de color de tráfico
  const getTrafficColor = (diff: number | null) => {
    if (diff === null) return "text-white bg-slate-800 border-slate-700";
    if (diff <= -3) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"; // Más rápido de lo normal
    if (diff >= 5) return "text-red-400 bg-red-500/10 border-red-500/30"; // Congestión alta
    return "text-amber-300 bg-amber-500/10 border-amber-500/30"; // Normal / moderado
  };

  const getDiffBadge = (diff: number | null) => {
    if (diff === null) return null;
    if (diff === 0) {
      return (
        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
          <Minus size={10} /> habitual
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-mono font-bold">
          <TrendingDown size={11} /> {Math.abs(diff)}m más rápido
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-red-400 font-mono font-bold">
        <TrendingUp size={11} /> +{diff}m demora
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HEADER PRINCIPAL Y ÚLTIMA ACTUALIZACIÓN ARRIBA A LA DERECHA */}
      <div className="glass-card p-6 md:p-8 flex flex-col lg:flex-row justify-between lg:items-center gap-6 border-b border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Estado en Tiempo Real
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">|</span>
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">
              Monitoreo activo de Zona Norte
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Car className="text-blue-400" size={28} />
            Tiempos de Viaje: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Ahora</span>
          </h2>

          {/* Selector de turno interactivo */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-bold mr-1">Turno visible:</span>
            <button
              onClick={() => setSelectedShift('ida')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                isIdaMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sun size={14} className={isIdaMode ? 'text-amber-300' : 'text-slate-500'} />
              Mañana (Ida a CABA)
            </button>
            <button
              onClick={() => setSelectedShift('vuelta')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                !isIdaMode 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Moon size={14} className={!isIdaMode ? 'text-indigo-300' : 'text-slate-500'} />
              Tarde (Regreso a Barrios)
            </button>
          </div>
        </div>

        {/* REQUISITO: Arriba a la derecha fecha y hora de actualización */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 md:p-5 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 lg:self-center shrink-0">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Última Actualización
            </span>
            <div className="text-lg md:text-xl font-black text-white font-mono leading-tight">
              {lastUpdatedInfo.dateStr}
            </div>
            <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {lastUpdatedInfo.timeStr}
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRILLA PRINCIPAL AGRUPADA POR ZONA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {liveGroups.map(group => (
          <div 
            key={group.macro} 
            className="glass-card p-5 md:p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl bg-slate-950/60"
          >
            <div>
              {/* Header de la Macro-Zona */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      {group.macro}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {group.barrios.length} {group.barrios.length === 1 ? 'barrio monitoreado' : 'barrios monitoreados'}
                    </p>
                  </div>
                </div>

                {/* Promedios de la Zona */}
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Prom. Zona</span>
                  <div className="text-xs font-mono font-bold text-slate-300">
                    DOT: <span className="text-blue-400 font-black">{group.macroDotAvg ? `${group.macroDotAvg}m` : '--'}</span>
                    {' '}|{' '}
                    Centro: <span className="text-purple-400 font-black">{group.macroCentroAvg ? `${group.macroCentroAvg}m` : '--'}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Barrios dentro de la Zona */}
              <div className="space-y-3">
                {group.barrios.map(b => (
                  <div 
                    key={b.barrio} 
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all flex flex-col gap-2.5"
                  >
                    {/* Nombre del Barrio y Hora de la Toma */}
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Navigation size={13} className="text-blue-400 shrink-0" />
                        {b.barrio}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-500 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                        {b.lastTimeStr}
                      </span>
                    </div>

                    {/* Contenedor de Destinos DOT y Microcentro */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      
                      {/* DOT Box */}
                      <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${getTrafficColor(b.dotDiff)}`}>
                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 truncate">
                          {dotLabel}
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-black font-mono">
                            {b.dot !== null ? `${b.dot} min` : '--'}
                          </span>
                        </div>
                        <div className="mt-1">
                          {getDiffBadge(b.dotDiff)}
                        </div>
                      </div>

                      {/* Microcentro Box */}
                      <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${getTrafficColor(b.centroDiff)}`}>
                        <div className="text-[9px] font-bold uppercase tracking-wider opacity-80 truncate">
                          {centroLabel}
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xl font-black font-mono">
                            {b.centro !== null ? `${b.centro} min` : '--'}
                          </span>
                        </div>
                        <div className="mt-1">
                          {getDiffBadge(b.centroDiff)}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
