"use client"

import React, { useState, useMemo } from 'react'
import { ProcessedRecord } from '@/components/DashboardContainer'
import { 
  Trophy, 
  Layers, 
  Navigation, 
  Car, 
  Clock, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpDown,
  ChevronRight,
  MapPin
} from 'lucide-react'

export const MACRO_ZONES = [
  { name: "Nordelta", color: "#3b82f6" },
  { name: "Villa Nueva", color: "#a855f7" },
  { name: "Benavidez / Pacheco", color: "#06b6d4" },
  { name: "Tortugas", color: "#f59e0b" },
  { name: "Tigre", color: "#10b981" },
  { name: "San Isidro / Bancalari", color: "#ec4899" }
]

interface RankingSectionProps {
  records: ProcessedRecord[]
}

type SortField = 'rank' | 'barrio' | 'macro' | 'avg' | 'delta' | 'count'

export default function RankingSection({ records }: RankingSectionProps) {
  const [destFilter, setDestFilter] = useState<'dot' | 'centro' | 'ambos'>('ambos')
  const [sentidoFilter, setSentidoFilter] = useState<'ida' | 'vuelta' | 'ambos'>('ida')
  const [dayFilter, setDayFilter] = useState<'todos' | 'habiles' | 'finde' | '0' | '1' | '2' | '3' | '4' | '5' | '6'>('habiles')
  const [timePreset, setTimePreset] = useState<'todo' | 'manana' | 'tarde' | 'custom'>('manana')
  const [selectedHour, setSelectedHour] = useState<number>(8)
  const [monthFilter, setMonthFilter] = useState<string>('todos')
  const [macroFilter, setMacroFilter] = useState<string>('todas')

  const [sortField, setSortField] = useState<SortField>('avg')
  const [sortAsc, setSortAsc] = useState<boolean>(true)

  // Meses disponibles
  const availableMonths = useMemo(() => {
    const monthsOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    const unique = Array.from(new Set(records.map(r => r.mes))).filter(Boolean)
    return unique.sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b))
  }, [records])

  // Filtrado reactivo de records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (destFilter === 'dot' && !r.isDOT) return false
      if (destFilter === 'centro' && r.isDOT) return false

      if (sentidoFilter === 'ida' && !r.isIda) return false
      if (sentidoFilter === 'vuelta' && r.isIda) return false

      if (dayFilter === 'habiles' && r.dayOfWeek > 4) return false
      if (dayFilter === 'finde' && r.dayOfWeek < 5) return false
      if (dayFilter !== 'todos' && dayFilter !== 'habiles' && dayFilter !== 'finde') {
        if (String(r.dayOfWeek) !== dayFilter) return false
      }

      if (timePreset === 'manana' && (r.hours < 6 || r.hours > 10)) return false
      if (timePreset === 'tarde' && (r.hours < 15 || r.hours > 20)) return false
      if (timePreset === 'custom' && r.hours !== selectedHour) return false

      if (monthFilter !== 'todos' && r.mes !== monthFilter) return false
      if (macroFilter !== 'todas' && r.macro !== macroFilter) return false

      return true
    })
  }, [records, destFilter, sentidoFilter, dayFilter, timePreset, selectedHour, monthFilter, macroFilter])

  // Helper de color según minutos
  const getTrafficColor = (mins: number | null) => {
    if (mins === null) return { bg: '#475569', text: '#94a3b8', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' }
    if (mins <= 42) return { bg: '#10b981', text: '#34d399', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
    if (mins <= 56) return { bg: '#f59e0b', text: '#fbbf24', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
    if (mins <= 72) return { bg: '#f97316', text: '#fb923c', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
    return { bg: '#ef4444', text: '#f87171', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40' }
  }

  // Estadísticas globales e históricas por barrio
  const barrioRanking = useMemo(() => {
    const overallMap = new Map<string, { sum: number; count: number }>()
    records.forEach(r => {
      let match = true
      if (destFilter === 'dot' && !r.isDOT) match = false
      if (destFilter === 'centro' && r.isDOT) match = false
      if (sentidoFilter === 'ida' && !r.isIda) match = false
      if (sentidoFilter === 'vuelta' && r.isIda) match = false
      if (match) {
        if (!overallMap.has(r.barrio)) overallMap.set(r.barrio, { sum: 0, count: 0 })
        const it = overallMap.get(r.barrio)!
        it.sum += r.durationMins
        it.count++
      }
    })

    const filteredMap = new Map<string, { sum: number; count: number; min: number; max: number; macro: string }>()
    filteredRecords.forEach(r => {
      if (!filteredMap.has(r.barrio)) {
        filteredMap.set(r.barrio, { sum: 0, count: 0, min: 999, max: 0, macro: r.macro })
      }
      const it = filteredMap.get(r.barrio)!
      it.sum += r.durationMins
      it.count++
      if (r.durationMins < it.min) it.min = r.durationMins
      if (r.durationMins > it.max) it.max = r.durationMins
    })

    // Lista de todos los barrios
    const allBarrios = Array.from(new Set(records.map(r => ({ barrio: r.barrio, macro: r.macro }))))
    const uniqueBarrios = allBarrios.filter((v, i, a) => a.findIndex(t => t.barrio === v.barrio) === i)

    const list = uniqueBarrios.map(b => {
      const f = filteredMap.get(b.barrio)
      const o = overallMap.get(b.barrio)

      const overallAvg = o && o.count > 0 ? Math.round(o.sum / o.count) : null
      const avg = f && f.count > 0 ? Math.round(f.sum / f.count) : null
      const delta = avg && overallAvg ? avg - overallAvg : null

      return {
        barrio: b.barrio,
        macro: b.macro,
        avg,
        delta,
        min: f && f.count > 0 ? f.min : null,
        max: f && f.count > 0 ? f.max : null,
        count: f ? f.count : 0
      }
    })

    return list
  }, [records, filteredRecords, destFilter, sentidoFilter])

  // Ordenamiento de tabla
  const sortedRanking = useMemo(() => {
    return [...barrioRanking].sort((a, b) => {
      let cmp = 0
      if (sortField === 'barrio') cmp = a.barrio.localeCompare(b.barrio)
      else if (sortField === 'macro') cmp = a.macro.localeCompare(b.macro)
      else if (sortField === 'avg') {
        const valA = a.avg ?? (sortAsc ? 999 : -999)
        const valB = b.avg ?? (sortAsc ? 999 : -999)
        cmp = valA - valB
      } else if (sortField === 'delta') {
        const valA = a.delta ?? (sortAsc ? 999 : -999)
        const valB = b.delta ?? (sortAsc ? 999 : -999)
        cmp = valA - valB
      } else if (sortField === 'count') {
        cmp = a.count - b.count
      }
      return sortAsc ? cmp : -cmp
    })
  }, [barrioRanking, sortField, sortAsc])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(field === 'avg' || field === 'barrio' || field === 'macro')
    }
  }

  // Estadísticas consolidadas por Macro-Zona
  const macroStats = useMemo(() => {
    return MACRO_ZONES.map(z => {
      const barriosInZone = barrioRanking.filter(b => b.macro === z.name)
      const validAvgs = barriosInZone.map(b => b.avg).filter((v): v is number => v !== null)
      const avg = validAvgs.length > 0 ? Math.round(validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length) : null
      const totalCount = barriosInZone.reduce((acc, b) => acc + b.count, 0)

      // Barrio más rápido y más lento de la zona
      const sortedInZone = [...barriosInZone].filter(b => b.avg !== null).sort((a, b) => a.avg! - b.avg!)
      const fastest = sortedInZone.length > 0 ? sortedInZone[0] : null
      const slowest = sortedInZone.length > 0 ? sortedInZone[sortedInZone.length - 1] : null

      return {
        name: z.name,
        color: z.color,
        avg,
        barriosCount: barriosInZone.length,
        totalCount,
        fastest,
        slowest
      }
    })
  }, [barrioRanking])

  const applyPreset = (presetName: string) => {
    if (presetName === 'pico-manana-caba') {
      setSentidoFilter('ida')
      setDayFilter('habiles')
      setTimePreset('manana')
    } else if (presetName === 'pico-tarde-vuelta') {
      setSentidoFilter('vuelta')
      setDayFilter('habiles')
      setTimePreset('tarde')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HEADER Y FILTROS */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden bg-slate-950/80">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full w-fit mb-3">
              <Trophy size={14} /> Ranking & Zonas
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Ranking de Tiempos & Promedios por Zona
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Compara el rendimiento de viaje de cada macro-zona y barrio bajo diferentes condiciones de día, horario, sentido y mes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block w-full md:w-auto">
              Presets de consulta:
            </span>
            <button
              onClick={() => applyPreset('pico-manana-caba')}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles size={12} className="text-amber-400" /> Pico Mañana (Lun-Vie)
            </button>
            <button
              onClick={() => applyPreset('pico-tarde-vuelta')}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles size={12} className="text-purple-400" /> Pico Tarde Regreso
            </button>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-6">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Navigation size={12} className="text-blue-400" /> Destino
            </label>
            <select
              value={destFilter}
              onChange={e => setDestFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ambos">Ambos (DOT y Obelisco)</option>
              <option value="dot">Shopping DOT Baires</option>
              <option value="centro">Microcentro (Obelisco)</option>
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Car size={12} className="text-emerald-400" /> Sentido
            </label>
            <select
              value={sentidoFilter}
              onChange={e => setSentidoFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ida">Ida (hacia CABA)</option>
              <option value="vuelta">Vuelta (hacia Barrios)</option>
              <option value="ambos">Ambos sentidos</option>
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-400" /> Día de la semana
            </label>
            <select
              value={dayFilter}
              onChange={e => setDayFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="habiles">Días hábiles (Lun a Vie)</option>
              <option value="todos">Todos los días</option>
              <option value="0">Lunes</option>
              <option value="1">Martes</option>
              <option value="2">Miércoles</option>
              <option value="3">Jueves</option>
              <option value="4">Viernes</option>
              <option value="finde">Fin de semana (Sáb-Dom)</option>
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock size={12} className="text-cyan-400" /> Horario / Turno
            </label>
            <select
              value={timePreset}
              onChange={e => setTimePreset(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="manana">Mañana Pico (06:00 a 10:00)</option>
              <option value="tarde">Tarde Pico (15:00 a 20:30)</option>
              <option value="todo">Todo el día</option>
              <option value="custom">Hora específica...</option>
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers size={12} className="text-indigo-400" /> Mes
            </label>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">Todos los meses</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin size={12} className="text-pink-400" /> Filtrar Zona
            </label>
            <select
              value={macroFilter}
              onChange={e => setMacroFilter(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
            >
              <option value="todas">Todas las Zonas</option>
              {MACRO_ZONES.map(z => (
                <option key={z.name} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>

        {timePreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Seleccionar hora:</span>
            {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  selectedHour === h
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {String(h).padStart(2, '0')}:00 hs
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. PROMEDIOS POR MACRO-ZONA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2.5">
            <Layers size={18} className="text-indigo-400" /> Promedios por Zona Geográfica
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Haz clic en una zona para filtrarla en el ranking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {macroStats.map(zone => {
            const colors = getTrafficColor(zone.avg)
            const isSelected = macroFilter === zone.name

            return (
              <div
                key={zone.name}
                onClick={() => setMacroFilter(isSelected ? 'todas' : zone.name)}
                className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10' 
                    : 'bg-slate-950/80 border-white/10 hover:border-white/20'
                }`}
                style={{ borderLeftColor: zone.color, borderLeftWidth: '5px' }}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="font-black text-base text-white">
                      {zone.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                      {zone.barriosCount} barrios
                    </span>
                  </div>

                  <div className="py-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Promedio Zona
                      </span>
                      <span className={`text-3xl font-black font-mono ${colors.text}`}>
                        {zone.avg !== null ? `${zone.avg} min` : '--'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {zone.totalCount} registros
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Más Rápido</span>
                    <span className="font-bold text-emerald-400 truncate block">
                      {zone.fastest ? `${zone.fastest.barrio} (${zone.fastest.avg}m)` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Más Demorado</span>
                    <span className="font-bold text-red-400 truncate block">
                      {zone.slowest ? `${zone.slowest.barrio} (${zone.slowest.avg}m)` : '--'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. TABLA DE RANKING DE TIEMPOS DE VIAJE */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" /> Ranking de Tiempos de Viaje
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquier columna para ordenar según tu preferencia
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-center">
            {sortedRanking.filter(r => r.avg !== null).length} de {sortedRanking.length} barrios con datos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/90 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('avg')}>
                  #
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('barrio')}>
                  <div className="flex items-center gap-1.5">
                    <span>Barrio</span>
                    <ArrowUpDown size={11} className={sortField === 'barrio' ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort('macro')}>
                  <div className="flex items-center gap-1.5">
                    <span>Zona</span>
                    <ArrowUpDown size={11} className={sortField === 'macro' ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('avg')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Demora Promedio</span>
                    <ArrowUpDown size={11} className={sortField === 'avg' ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('delta')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Delta Histórico</span>
                    <ArrowUpDown size={11} className={sortField === 'delta' ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">
                  Rango (Mín - Máx)
                </th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('count')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Muestras</span>
                    <ArrowUpDown size={11} className={sortField === 'count' ? 'text-blue-400' : 'text-slate-600'} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {sortedRanking.map((item, idx) => {
                const colors = getTrafficColor(item.avg)
                const zoneColor = MACRO_ZONES.find(z => z.name === item.macro)?.color || '#3b82f6'

                return (
                  <tr 
                    key={item.barrio} 
                    className={`hover:bg-white/[0.04] transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white text-sm block">
                        {item.barrio}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span 
                        className="text-[11px] font-semibold px-2 py-0.5 rounded border inline-block"
                        style={{ borderColor: `${zoneColor}40`, color: zoneColor, background: `${zoneColor}10` }}
                      >
                        {item.macro}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-base font-black font-mono ${colors.text}`}>
                        {item.avg !== null ? `${item.avg} min` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.delta !== null ? (
                        item.delta === 0 ? (
                          <span className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                            <Minus size={11} /> habitual
                          </span>
                        ) : item.delta < 0 ? (
                          <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                            <TrendingDown size={12} /> {Math.abs(item.delta)}m rápido
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono font-bold text-red-400 flex items-center justify-end gap-1">
                            <TrendingUp size={12} /> +{item.delta}m demora
                          </span>
                        )
                      ) : (
                        <span className="text-slate-600 font-mono text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-300 text-xs">
                      {item.min !== null && item.max !== null ? `${item.min}m - ${item.max}m` : '--'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-xs">
                      {item.count}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
