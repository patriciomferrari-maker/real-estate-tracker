"use client"

import React, { useState, useMemo } from 'react';

export default function DataExplorer({ records }: { records: any[] }) {
  const [fDay, setFDay] = useState('');
  const [fSentido, setFSentido] = useState('');
  const [fDestino, setFDestino] = useState('');
  const [fBarrio, setFBarrio] = useState('');

  // Helper para normalizar strings (sacar tildes, espacios, etc)
  const clean = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  
  // Transform records into tabular data
  const gridData = useMemo(() => {
     return records.map(r => {
        const d = new Date(r.timestamp);
        const isIda = r.isIda;
        const barrioCrudo = isIda ? r.origin : r.destination;
        const barrio = (barrioCrudo || "").split(',')[0].replace("Barrio", "").trim();
        const dow = d.toLocaleDateString('es-ES', { weekday: 'long' });
        
        return {
            ...r,
            diaDeSemana: dow.charAt(0).toUpperCase() + dow.slice(1),
            fecha: d.toLocaleDateString('es-AR'),
            sentido: r.isIda ? 'Ida' : 'Vuelta',
            destino: r.isDOT ? 'Shopping DOT' : 'Microcentro',
            tiempo: r.durationMins
        };
      });
   }, [records]);

   const totalCount = records.length;
   const idaCount = records.filter(r => r.isIda).length;
   const vueltaCount = records.filter(r => !r.isIda).length;

  // Extracts lists for selects
  const uniqueDays = Array.from(new Set(gridData.map(d => d.diaDeSemana))).sort();
  const uniqueBarrios = Array.from(new Set(gridData.map(d => d.barrio))).sort();

  // Filter apply
  const filteredData = gridData.filter(d => {
      if (fDay && clean(d.diaDeSemana) !== clean(fDay)) return false;
      if (fSentido && clean(d.sentido) !== clean(fSentido)) return false;
      if (fDestino && clean(d.destino) !== clean(fDestino)) return false;
      if (fBarrio && clean(d.barrio) !== clean(fBarrio)) return false;
      return true;
  });

  // Estadísticas de coincidencia para debug
  const matchDay = fDay ? gridData.filter(d => clean(d.diaDeSemana) === clean(fDay)).length : totalCount;
  const matchSentido = fSentido ? gridData.filter(d => clean(d.sentido) === clean(fSentido)).length : totalCount;
  const matchDestino = fDestino ? gridData.filter(d => clean(d.destino) === clean(fDestino)).length : totalCount;
  const matchBarrio = fBarrio ? gridData.filter(d => clean(d.barrio) === clean(fBarrio)).length : totalCount;
  const sanMarcoCount = gridData.filter(d => clean(d.barrio).includes("marco")).length;

  // Generar Matriz Día vs Sentido para Diagnóstico
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const matrix = days.map(day => ({
      day,
      ida: gridData.filter(d => clean(d.diaDeSemana) === clean(day) && d.isIda).length,
      vuelta: gridData.filter(d => clean(d.diaDeSemana) === clean(day) && !d.isIda).length
  }));

  return (
    <div className="glass-card mb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-2 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-1">Explorador de Base de Datos ({totalCount})</h3>
          <p className="text-sm text-slate-400">Filtrá y analizá cada viaje individual guardado en el sistema.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-bold mb-1">
          <span className="text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">IDA: {idaCount}</span>
          <span className="text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-full border border-purple-400/20">VUELTA: {vueltaCount}</span>
        </div>
      </div>

        {/* FILTERS REDESIGNED */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
            <div className="space-y-1">
                <select value={fDay} onChange={e=>setFDay(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="">Cualquier Día...</option>
                    {uniqueDays.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {fDay && <p className="text-[10px] text-slate-500 text-center">{matchDay} registros</p>}
            </div>

            <div className="space-y-1">
                <select value={fSentido} onChange={e=>setFSentido(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="">Cualquier Sentido...</option>
                    <option value="Ida">Ida (Hacia CABA)</option>
                    <option value="Vuelta">Vuelta (A Provincia)</option>
                </select>
                {fSentido && <p className="text-[10px] text-slate-500 text-center">{matchSentido} registros</p>}
            </div>

            <div className="space-y-1">
                <select value={fDestino} onChange={e=>setFDestino(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="">Cualquier Destino...</option>
                    <option value="Shopping DOT">Shopping DOT</option>
                    <option value="Microcentro">Microcentro</option>
                </select>
                {fDestino && <p className="text-[10px] text-slate-500 text-center">{matchDestino} registros</p>}
            </div>

            <div className="space-y-1">
                <select value={fBarrio} onChange={e=>setFBarrio(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                    <option value="">Todos los Barrios...</option>
                    {uniqueBarrios.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                {fBarrio && <p className="text-[10px] text-slate-500 text-center">{matchBarrio} registros</p>}
            </div>
            
            <div className="flex justify-end items-start pt-0.5">
                 <button 
                   onClick={() => { setFDay(''); setFSentido(''); setFDestino(''); setFBarrio(''); }}
                   className="text-xs font-bold uppercase tracking-tighter text-pink-500 hover:text-pink-400 transition bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/20 shadow-lg shadow-pink-500/5"
                 >
                    Resetear
                 </button>
            </div>
        </div>

        <div className="mb-6 text-[9px] text-slate-600 italic">
            Filtrando actualmente {filteredData.length} de {totalCount} registros totales.
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
                <th className="p-3 border-b border-white/5 font-semibold">Sentido</th>
                <th className="p-3 border-b border-white/5 font-semibold">Destino</th>
                <th className="p-3 border-b border-white/5 font-semibold text-right">Tiempo</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.length > 0 ? filteredData.slice(0, 500).map((row, i) => (
                <tr key={i} className={`hover:bg-white/5 transition-colors border-b border-white/5 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
                    <td className="p-3 text-slate-300">{row.fecha}</td>
                    <td className="p-3 text-slate-400">{row.diaDeSemana}</td>
                    <td className="p-3 text-emerald-400 font-medium">{row.zona}</td>
                    <td className="p-3 text-blue-300">{row.barrio}</td>
                    <td className="p-3 text-purple-300">{row.sentido}</td>
                    <td className="p-3 text-sky-400">{row.destino}</td>
                    <td className="p-3 text-right font-bold text-white">{row.tiempo} min</td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan={7} className="p-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-slate-500">No se encontraron datos para estos filtros.</p>
                                <div className="flex flex-col gap-3 mt-4">
                                    <button 
                                        onClick={() => { setFDay('Jueves'); setFSentido('Vuelta'); }}
                                        className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition shadow-lg"
                                    >
                                        💡 Sugerencia: Ver Vuelta de Jueves (1806 registros)
                                    </button>
                                    <button 
                                        onClick={() => { setFDay(''); setFSentido(''); setFDestino(''); setFBarrio(''); }}
                                        className="bg-white/5 border border-white/10 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition"
                                    >
                                        Ver todos los datos (5740 registros)
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
            {filteredData.length > 500 && (
                <div className="p-3 text-center text-xs text-slate-500 bg-black/20">Se muestran los últimos 500 registros. {filteredData.length} en total.</div>
            )}
        </div>

        {/* PRUEBA DE VIDA - ULTIMOS 10 REGISTROS */}
        <div className="mt-12 pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"/> 
                Monitor de Datos en Tiempo Real (Últimos 10 registros sin filtros)
            </h4>
            <div className="grid grid-cols-5 gap-2">
                {gridData.slice(0, 10).map((r, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded border border-white/5 text-[9px] flex flex-col gap-1">
                        <span className="text-slate-400">{r.fecha} - {r.diaDeSemana}</span>
                        <span className="text-emerald-400 font-bold truncate">{r.barrio}</span>
                        <span className="text-white font-mono">{r.tiempo} min</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}
