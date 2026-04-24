"use client"

import React, { useState, useMemo } from 'react';

export default function DataExplorer({ records }: { records: any[] }) {
  const [fYear, setFYear] = useState('');
  const [fMonth, setFMonth] = useState('');
  const [fDay, setFDay] = useState('');
  const [fTurno, setFTurno] = useState('');
  const [fBarrio, setFBarrio] = useState('');
  
  // Transform records into tabular data
  const gridData = useMemo(() => {
     return records.map(r => {
        const d = new Date(r.timestamp);
        return {
            year: d.getFullYear().toString(),
            month: (d.getMonth() + 1).toString(),
            diaDeSemana: d.toLocaleDateString('es-ES', { weekday: 'long' }),
            fecha: d.toLocaleDateString(),
            zona: r.zona,
            barrio: r.barrio,
            turno: r.isIda ? (r.isDOT ? 'Ida al DOT' : 'Ida al Centro') : 'Vuelta a Provincia',
            tiempo: r.durationMins
        };
      });
   }, [records]);

   const totalCount = records.length;

  // Extracts lists for selects
  const uniqueYears = Array.from(new Set(gridData.map(d => d.year)));
  const uniqueMonths = Array.from(new Set(gridData.map(d => d.month)));
  const uniqueDays = Array.from(new Set(gridData.map(d => d.diaDeSemana)));
  const uniqueTurnos = Array.from(new Set(gridData.map(d => d.turno)));
  const uniqueBarrios = Array.from(new Set(gridData.map(d => d.barrio))).sort();

  // Filter apply
  const filteredData = gridData.filter(d => {
      if (fYear && d.year !== fYear) return false;
      if (fMonth && d.month !== fMonth) return false;
      if (fDay && d.diaDeSemana !== fDay) return false;
      if (fTurno && d.turno !== fTurno) return false;
      if (fBarrio && d.barrio !== fBarrio) return false;
      return true;
  });

  return (
    <div className="glass-card mb-12">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h3 className="text-xl font-bold text-emerald-400 mb-1">Explorador de Base de Datos ({totalCount} registros)</h3>
            <p className="text-sm text-slate-400">Filtrá y analizá cada viaje individual guardado en el sistema.</p>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <select value={fYear} onChange={e=>setFYear(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm">
                <option value="">Todos los Años...</option>
                {uniqueYears.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={fMonth} onChange={e=>setFMonth(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm">
                <option value="">Todos los Meses...</option>
                {uniqueMonths.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={fDay} onChange={e=>setFDay(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm">
                <option value="">Todos los Días...</option>
                {uniqueDays.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={fTurno} onChange={e=>setFTurno(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm">
                <option value="">Todos los Turnos...</option>
                {uniqueTurnos.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={fBarrio} onChange={e=>setFBarrio(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm">
                <option value="">Todos los Barrios...</option>
                {uniqueBarrios.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            
            <div className="col-span-2 md:col-span-5 flex justify-end">
                 <button 
                   onClick={() => { setFYear(''); setFMonth(''); setFDay(''); setFTurno(''); setFBarrio(''); }}
                   className="text-sm text-pink-400 hover:text-pink-300 transition"
                 >
                    Limpiar Filtros
                 </button>
            </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-lg border border-white/10 h-[500px] overflow-y-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#1e293b] text-slate-300 sticky top-0 shadow-md">
                <tr>
                <th className="p-3 border-b border-white/5 font-semibold">Fecha Exacta</th>
                <th className="p-3 border-b border-white/5 font-semibold">Día</th>
                <th className="p-3 border-b border-white/5 font-semibold">Macro-Zona</th>
                <th className="p-3 border-b border-white/5 font-semibold">Barrio</th>
                <th className="p-3 border-b border-white/5 font-semibold">Sentido (Turno)</th>
                <th className="p-3 border-b border-white/5 font-semibold text-right">Tiempo de Viaje</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.slice(0, 500).map((row, i) => (
                <tr key={i} className={`hover:bg-white/5 transition-colors border-b border-white/5 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
                    <td className="p-3 text-slate-300">{row.fecha}</td>
                    <td className="p-3 text-slate-400">{row.diaDeSemana}</td>
                    <td className="p-3 text-emerald-400 font-medium">{row.zona}</td>
                    <td className="p-3 text-blue-300">{row.barrio}</td>
                    <td className="p-3 text-purple-300">{row.turno}</td>
                    <td className="p-3 text-right font-bold text-white">{row.tiempo} min</td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredData.length === 0 && (
                <div className="p-8 text-center text-slate-500">No se encontraron datos para estos filtros.</div>
            )}
            {filteredData.length > 500 && (
                <div className="p-3 text-center text-xs text-slate-500 bg-black/20">Se muestran los últimos 500 registros. {filteredData.length} en total.</div>
            )}
        </div>
    </div>
  )
}
