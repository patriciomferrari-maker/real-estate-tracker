"use client"

import React, { useState, useMemo } from 'react';
import { Clock, Filter } from 'lucide-react';

interface ProcessedRecord {
  id: string;
  timestamp: string;
  durationMins: number;
  isIda: boolean;
  isDOT: boolean;
  dayOfWeek: number;
  month: number;
  macro: string;
  barrio: string;
  barrioRaw: string;
  hours: number;
  minutes: number;
  dateStr: string;
  diaDeSemana: string;
  fecha: string;
  año: string;
  mes: string;
  sentido: string;
  destino: string;
  tiempo: number;
  zona: string;
}

export default function MatrixSection({ records }: { records: ProcessedRecord[] }) {
  // State for filters
  const [filterType, setFilterType] = useState<'zona' | 'barrio'>('zona');
  const [selectedZona, setSelectedZona] = useState<string>('');
  const [selectedBarrio, setSelectedBarrio] = useState<string>('');
  const [selectedSentido, setSelectedSentido] = useState<string>('Ida');
  const [selectedDestino, setSelectedDestino] = useState<string>('Ambos');
  const [selectedMes, setSelectedMes] = useState<string>('');
  const [granularity, setGranularity] = useState<'hour' | '30min'>('hour');

  // Helper to normalize strings for comparison
  const clean = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // Extract unique options dynamically
  const uniqueZonas = useMemo(() => {
    return Array.from(new Set(records.map(r => r.zona))).filter(Boolean).sort();
  }, [records]);

  const uniqueBarrios = useMemo(() => {
    // If a zone is selected, we filter barrios inside that zone
    const targetRecords = selectedZona 
      ? records.filter(r => clean(r.zona) === clean(selectedZona))
      : records;
    return Array.from(new Set(targetRecords.map(r => r.barrio))).filter(Boolean).sort();
  }, [records, selectedZona]);

  const uniqueMeses = useMemo(() => {
    const mesesOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return Array.from(new Set(records.map(r => r.mes))).filter(Boolean).sort((a, b) => mesesOrder.indexOf(a) - mesesOrder.indexOf(b));
  }, [records]);

  // Set default filters on data load
  React.useEffect(() => {
    if (uniqueZonas.length > 0 && !selectedZona) {
      setSelectedZona(uniqueZonas[0]);
    }
  }, [uniqueZonas]);

  // Apply filters to records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Filter by Zone or Barrio
      if (filterType === 'zona') {
        if (selectedZona && clean(r.zona) !== clean(selectedZona)) return false;
      } else {
        if (selectedBarrio && clean(r.barrio) !== clean(selectedBarrio)) return false;
      }

      // Filter by Sentido (Ida/Vuelta)
      if (selectedSentido) {
        if (selectedSentido === 'Ida' && !r.isIda) return false;
        if (selectedSentido === 'Vuelta' && r.isIda) return false;
      }

      // Filter by Destino
      if (selectedDestino !== 'Ambos') {
        if (selectedDestino === 'Shopping DOT' && !r.isDOT) return false;
        if (selectedDestino === 'Microcentro' && r.isDOT) return false;
      }

      // Filter by Mes
      if (selectedMes && clean(r.mes) !== clean(selectedMes)) return false;

      return true;
    });
  }, [records, filterType, selectedZona, selectedBarrio, selectedSentido, selectedDestino, selectedMes]);

  // Define days of the week in order (Lunes to Domingo)
  const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Group records into matrix cells
  const matrixData = useMemo(() => {
    const cellMap = new Map<string, Map<number, { sum: number; count: number }>>();

    filteredRecords.forEach(r => {
      // Determine time slot
      let timeSlot = "";
      if (granularity === 'hour') {
        timeSlot = `${String(r.hours).padStart(2, '0')}:00`;
      } else {
        const minSlot = r.minutes < 30 ? '00' : '30';
        timeSlot = `${String(r.hours).padStart(2, '0')}:${minSlot}`;
      }

      if (!cellMap.has(timeSlot)) {
        cellMap.set(timeSlot, new Map());
      }
      const dayMap = cellMap.get(timeSlot)!;
      const dayIdx = r.dayOfWeek; // 0 (Mon) to 6 (Sun)

      if (!dayMap.has(dayIdx)) {
        dayMap.set(dayIdx, { sum: 0, count: 0 });
      }
      const cell = dayMap.get(dayIdx)!;
      cell.sum += r.durationMins;
      cell.count++;
    });

    const timeSlots = Array.from(cellMap.keys()).sort();

    return { cellMap, timeSlots };
  }, [filteredRecords, granularity]);

  const { cellMap, timeSlots } = matrixData;

  // Determine cell colors based on duration
  const getCellColorClass = (avgMins: number) => {
    if (avgMins === 0) return 'bg-slate-900/10 text-slate-600 border border-slate-900/30';
    if (avgMins < 35) {
      return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30';
    }
    if (avgMins < 50) {
      return 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/10 hover:border-amber-500/30';
    }
    return 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 font-bold';
  };

  return (
    <div className="glass-card mb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-2 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-blue-400 mb-1">Matriz de Congestión Horaria</h3>
          <p className="text-sm text-slate-400">Analizá el comportamiento de tráfico histórico cruzando horarios y días de la semana.</p>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          {filteredRecords.length} DATA_POINTS FILTRADOS
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Centro de Control de Matriz</span>
          </div>
          
          {/* ZONE / BARRIO SWITCHER */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => { setFilterType('zona'); setSelectedBarrio(''); }}
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${filterType === 'zona' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Por Zona
            </button>
            <button 
              onClick={() => { setFilterType('barrio'); if (uniqueBarrios.length > 0) setSelectedBarrio(uniqueBarrios[0]); }}
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${filterType === 'barrio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Por Barrio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* SELECT ZONA / BARRIO */}
          {filterType === 'zona' ? (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Seleccionar Zona</label>
              <select 
                value={selectedZona} 
                onChange={e => setSelectedZona(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
              >
                <option value="">Todas las Zonas</option>
                {uniqueZonas.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Seleccionar Barrio</label>
              <select 
                value={selectedBarrio} 
                onChange={e => setSelectedBarrio(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
              >
                <option value="">Seleccionar Barrio...</option>
                {uniqueBarrios.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          {/* SELECT SENTIDO */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sentido de Viaje</label>
            <select 
              value={selectedSentido} 
              onChange={e => setSelectedSentido(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="Ida">Ida (Hacia CABA)</option>
              <option value="Vuelta">Vuelta (A Provincia)</option>
            </select>
          </div>

          {/* SELECT DESTINO */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Destino</label>
            <select 
              value={selectedDestino} 
              onChange={e => setSelectedDestino(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="Ambos">Ambos Destinos</option>
              <option value="Shopping DOT">Shopping DOT</option>
              <option value="Microcentro">Microcentro / Obelisco</option>
            </select>
          </div>

          {/* SELECT MES */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Filtrar por Mes</label>
            <select 
              value={selectedMes} 
              onChange={e => setSelectedMes(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="">Todos los Meses</option>
              {uniqueMeses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* SELECT GRANULARIDAD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Granularidad</label>
            <select 
              value={granularity} 
              onChange={e => setGranularity(e.target.value as 'hour' | '30min')} 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition"
            >
              <option value="hour">Por hora entera</option>
              <option value="30min">Cada 30 minutos</option>
            </select>
          </div>
        </div>
      </div>

      {/* HEATMAP GRID */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-300 border-b border-white/10 font-bold">
              <th className="p-4 border-r border-white/10 text-left font-black tracking-widest text-[9px] uppercase text-slate-500 min-w-[100px]">
                <div className="flex items-center gap-2">
                  <Clock size={12} /> Horario
                </div>
              </th>
              {daysOfWeek.map((day) => (
                <th key={day} className="p-4 font-black tracking-wider text-[9px] uppercase text-slate-400">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.length > 0 ? (
              timeSlots.map((slot, sIdx) => (
                <tr 
                  key={slot} 
                  className={`border-b border-white/5 transition-colors ${
                    sIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                  }`}
                >
                  {/* Time slot header */}
                  <td className="p-3.5 border-r border-white/10 text-left font-black text-white font-mono bg-slate-950/20 text-[11px]">
                    {slot}
                  </td>
                  
                  {/* Cells Lunes to Domingo */}
                  {daysOfWeek.map((_, dayIdx) => {
                    const dayMap = cellMap.get(slot);
                    const dataCell = dayMap ? dayMap.get(dayIdx) : null;
                    const avgMins = dataCell ? Math.round(dataCell.sum / dataCell.count) : 0;
                    const runs = dataCell ? dataCell.count : 0;

                    return (
                      <td 
                        key={dayIdx} 
                        className={`p-3 transition-all relative group/cell cursor-help ${getCellColorClass(avgMins)}`}
                      >
                        {avgMins > 0 ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-xs font-black leading-none">{avgMins}m</span>
                            
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:flex flex-col items-center bg-slate-950/95 border border-white/10 text-[10px] text-white p-2 rounded-lg shadow-2xl whitespace-nowrap z-50 pointer-events-none transition-all scale-95 duration-200">
                              <span className="font-bold text-blue-400 mb-0.5">{daysOfWeek[dayIdx]} @ {slot}</span>
                              <span className="text-slate-300">Promedio: <b className="text-white">{avgMins} minutos</b></span>
                              <span className="text-slate-400">Muestras: {runs} recorridos</span>
                              <div className="w-2 h-2 bg-slate-950 border-r border-b border-white/10 rotate-45 mt-1 -mb-2" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-medium font-mono text-[9px]">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-20 text-center text-slate-500 italic">
                  No hay datos disponibles para la combinación de filtros seleccionada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* LEGEND & INFO */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-white/5 pt-6">
        <div className="flex flex-wrap gap-4 items-center">
          <span>Leyenda:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/20" />
            <span>Fluido (&lt; 35 min)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/20" />
            <span>Moderado (35m - 50m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/20" />
            <span>Pesado (&gt; 50 min)</span>
          </div>
        </div>
        <div>
          * Los tiempos mostrados son promedios calculados por celda.
        </div>
      </div>
    </div>
  );
}
