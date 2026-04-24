"use client"

import React, { useState, useMemo } from 'react';

export default function DataExplorer({ records }: { records: any[] }) {
  const [fDay, setFDay] = useState('');
  const [fSentido, setFSentido] = useState('');
  const [fDestino, setFDestino] = useState('');
  const [fBarrio, setFBarrio] = useState('');
  
  // Transform records into tabular data
  const gridData = useMemo(() => {
     return records.map(r => {
        const d = new Date(r.timestamp);
        const isIda = r.isIda;
        const barrioCrudo = isIda ? r.origin : r.destination;
        const barrio = (barrioCrudo || "").split(',')[0].replace("Barrio", "").trim();
        const dow = d.toLocaleDateString('es-ES', { weekday: 'long' });
        
        return {
            year: d.getFullYear().toString(),
            month: (d.getMonth() + 1).toString().padStart(2, '0'),
            diaDeSemana: dow.charAt(0).toUpperCase() + dow.slice(1),
            fecha: d.toLocaleDateString('es-AR'),
            zona: barrioCrudo?.includes("Escobar") ? "Escobar" : barrioCrudo?.includes("Nordelta") ? "Nordelta" : barrioCrudo?.includes("Tigre") || barrioCrudo?.includes("Pacheco") || barrioCrudo?.includes("Benavidez") ? "Tigre/Pacheco" : barrioCrudo?.includes("San Isidro") ? "San Isidro" : barrioCrudo?.includes("Tortuguitas") ? "Tortugas" : "Otro",
            barrio,
            isIda: r.isIda,
            isDOT: r.isDOT,
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
      // Normalizamos a minúsculas y eliminamos espacios para evitar fallos de formato
      if (fDay && d.diaDeSemana.toLowerCase().trim() !== fDay.toLowerCase().trim()) return false;
      if (fSentido && d.sentido.toLowerCase().trim() !== fSentido.toLowerCase().trim()) return false;
      if (fDestino && d.destino.toLowerCase().trim() !== fDestino.toLowerCase().trim()) return false;
      if (fBarrio && d.barrio.toLowerCase().trim() !== fBarrio.toLowerCase().trim()) return false;
      return true;
  });

  return (
    <div className="glass-card mb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-2 border-b border-white/10 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-1">Explorador de Base de Datos ({totalCount})</h3>
          <p className="text-sm text-slate-400">Filtrá y analizá cada viaje individual guardado en el sistema.</p>
        </div>
        <div className="flex gap-4 text-[11px] font-bold mb-1">
          <span className="text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20">IDA: {idaCount}</span>
          <span className="text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-full border border-purple-400/20">VUELTA: {vueltaCount}</span>
        </div>
      </div>

        {/* FILTERS REDESIGNED */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <select value={fDay} onChange={e=>setFDay(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Cualquier Día...</option>
                {uniqueDays.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={fSentido} onChange={e=>setFSentido(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Cualquier Sentido...</option>
                <option value="Ida">Ida (Hacia CABA)</option>
                <option value="Vuelta">Vuelta (A Provincia)</option>
            </select>

            <select value={fDestino} onChange={e=>setFDestino(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Cualquier Destino...</option>
                <option value="Shopping DOT">Shopping DOT</option>
                <option value="Microcentro">Microcentro</option>
            </select>

            <select value={fBarrio} onChange={e=>setFBarrio(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Todos los Barrios...</option>
                {uniqueBarrios.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            
            <div className="flex justify-end items-center">
                 <button 
                   onClick={() => { setFDay(''); setFSentido(''); setFDestino(''); setFBarrio(''); }}
                   className="text-xs font-bold uppercase tracking-tighter text-pink-500 hover:text-pink-400 transition bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/20"
                 >
                    Resetear Filtros
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
                                <div className="bg-slate-900/50 p-4 rounded border border-white/5 text-left w-full max-w-xl mx-auto shadow-2xl">
                                    <p className="text-[10px] text-amber-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"/> 
                                        Diagnóstico de Memoria (Primer Registro):
                                    </p>
                                    <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto">
                                        {JSON.stringify(gridData[0] || "No hay datos en memoria", null, 2)}
                                    </pre>
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
    </div>
  )
}
