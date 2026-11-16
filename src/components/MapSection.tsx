"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ProcessedRecord } from '@/components/DashboardContainer'
import { 
  Map as MapIcon, 
  MapPin, 
  Navigation, 
  Car, 
  Building2, 
  Clock, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers,
  RotateCcw,
  Info,
  ZoomIn,
  Sun,
  Moon,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'

export interface BarrioGeo {
  name: string
  macro: string
  lat: number
  lng: number
}

export const BARRIOS_GEO: Record<string, BarrioGeo> = {
  "Castaños": { name: "Castaños", macro: "Nordelta", lat: -34.4258, lng: -58.6475 },
  "Las Glorietas": { name: "Las Glorietas", macro: "Nordelta", lat: -34.4125, lng: -58.6570 },
  "Glorietas": { name: "Las Glorietas", macro: "Nordelta", lat: -34.4125, lng: -58.6570 },
  "Santa Bárbara": { name: "Santa Bárbara", macro: "Nordelta", lat: -34.4410, lng: -58.6360 },
  "Barbarita": { name: "Barbarita", macro: "Nordelta", lat: -34.4490, lng: -58.6250 },
  "Santa Teresa": { name: "Santa Teresa", macro: "Villa Nueva", lat: -34.3750, lng: -58.6920 },
  "Santa Clara": { name: "Santa Clara", macro: "Villa Nueva", lat: -34.3700, lng: -58.6970 },
  "San Marco": { name: "San Marco", macro: "Villa Nueva", lat: -34.3640, lng: -58.7040 },
  "El Encuentro": { name: "El Encuentro", macro: "Benavidez / Pacheco", lat: -34.4080, lng: -58.6850 },
  "Altos de Pacheco": { name: "Altos de Pacheco", macro: "Benavidez / Pacheco", lat: -34.4550, lng: -58.6500 },
  "La Comarca": { name: "La Comarca", macro: "Benavidez / Pacheco", lat: -34.4500, lng: -58.6650 },
  "Las Liebres": { name: "Las Liebres", macro: "Tortugas", lat: -34.4600, lng: -58.7400 },
  "Los Boulevares": { name: "Los Boulevares", macro: "Tortugas", lat: -34.4550, lng: -58.7480 },
  "La Escondida": { name: "La Escondida", macro: "Tigre", lat: -34.4200, lng: -58.5900 },
  "Buenavista": { name: "Buenavista", macro: "San Isidro / Bancalari", lat: -34.4820, lng: -58.5480 }
}

export const MACRO_ZONES_POLYGONS: Record<string, { label: string; color: string; center: [number, number]; coords: [number, number][] }> = {
  "Nordelta": {
    label: "Zona Nordelta",
    color: "#3b82f6",
    center: [-34.425, -58.647],
    coords: [
      [-34.398, -58.672],
      [-34.402, -58.632],
      [-34.435, -58.618],
      [-34.458, -58.632],
      [-34.448, -58.665]
    ]
  },
  "Villa Nueva": {
    label: "Zona Villa Nueva",
    color: "#a855f7",
    center: [-34.370, -58.697],
    coords: [
      [-34.352, -58.718],
      [-34.352, -58.682],
      [-34.385, -58.678],
      [-34.392, -58.712]
    ]
  },
  "Benavidez / Pacheco": {
    label: "Zona Benavídez / Pacheco",
    color: "#06b6d4",
    center: [-34.438, -58.666],
    coords: [
      [-34.395, -58.705],
      [-34.402, -58.668],
      [-34.468, -58.638],
      [-34.475, -58.675]
    ]
  },
  "Tortugas": {
    label: "Zona Tortugas",
    color: "#f59e0b",
    center: [-34.458, -58.744],
    coords: [
      [-34.442, -58.765],
      [-34.442, -58.722],
      [-34.478, -58.722],
      [-34.478, -58.765]
    ]
  },
  "Tigre": {
    label: "Zona Tigre",
    color: "#10b981",
    center: [-34.420, -58.590],
    coords: [
      [-34.402, -58.612],
      [-34.402, -58.568],
      [-34.438, -58.568],
      [-34.438, -58.612]
    ]
  },
  "San Isidro / Bancalari": {
    label: "Zona Bancalari / Buenavista",
    color: "#ec4899",
    center: [-34.482, -58.548],
    coords: [
      [-34.468, -58.568],
      [-34.468, -58.528],
      [-34.498, -58.528],
      [-34.498, -58.568]
    ]
  }
}

const DEST_DOT = { name: "Shopping DOT Baires", lat: -34.5453, lng: -58.4891, color: "#3b82f6" }
const DEST_CENTRO = { name: "Microcentro (Obelisco)", lat: -34.6037, lng: -58.3816, color: "#a855f7" }

const TILE_LAYERS = {
  oscuro: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    label: '🌙 Minimalista Oscuro',
    attribution: '&copy; Esri World Dark Gray'
  },
  claro: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    label: '☀️ Minimalista Claro',
    attribution: '&copy; Esri World Light Gray'
  },
  calles: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    label: '🗺️ Calles Detalladas',
    attribution: '&copy; OpenStreetMap'
  },
  satelite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    label: '🛰️ Satélite',
    attribution: '&copy; Esri World Imagery'
  }
}

interface MapSectionProps {
  records: ProcessedRecord[]
}

export default function MapSection({ records }: MapSectionProps) {
  const [activeTileKey, setActiveTileKey] = useState<'oscuro' | 'claro' | 'calles' | 'satelite'>('oscuro')

  // Filtros del Mapa
  const [destFilter, setDestFilter] = useState<'dot' | 'centro' | 'ambos'>('ambos')
  const [sentidoFilter, setSentidoFilter] = useState<'ida' | 'vuelta' | 'ambos'>('ida')
  const [dayFilter, setDayFilter] = useState<'todos' | 'habiles' | 'finde' | '0' | '1' | '2' | '3' | '4' | '5' | '6'>('habiles')
  const [timePreset, setTimePreset] = useState<'todo' | 'manana' | 'tarde' | 'custom'>('manana')
  const [selectedHour, setSelectedHour] = useState<number>(8)
  const [monthFilter, setMonthFilter] = useState<string>('todos')
  const [macroFilter, setMacroFilter] = useState<string>('todas')

  // Barrio seleccionado para la ficha de inspección debajo del mapa
  const [selectedBarrio, setSelectedBarrio] = useState<string>('Santa Teresa')

  // Referencias para Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const zonesLayerRef = useRef<any[]>([])
  const markersRef = useRef<any[]>([])
  const linesRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletError, setLeafletError] = useState(false)

  // Meses disponibles
  const availableMonths = useMemo(() => {
    const monthsOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    const unique = Array.from(new Set(records.map(r => r.mes))).filter(Boolean)
    return unique.sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b))
  }, [records])

  const macroList = useMemo(() => Object.keys(MACRO_ZONES_POLYGONS), [])

  // Lista única de barrios para los selectores
  const uniqueBarriosList = useMemo(() => {
    const list = Object.values(BARRIOS_GEO).map(b => b.name)
    return Array.from(new Set(list)).sort()
  }, [])

  // Filtrado reactivo de records para el mapa
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

  // Helper de colores de tráfico
  const getTrafficColor = (mins: number | null) => {
    if (mins === null) return { bg: '#475569', text: '#94a3b8', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' }
    if (mins <= 42) return { bg: '#10b981', text: '#34d399', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
    if (mins <= 56) return { bg: '#f59e0b', text: '#fbbf24', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
    if (mins <= 72) return { bg: '#f97316', text: '#fb923c', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
    return { bg: '#ef4444', text: '#f87171', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40' }
  }

  // Estadísticas para los marcadores en el mapa
  const barrioStats = useMemo(() => {
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

    const filteredMap = new Map<string, { sum: number; count: number }>()
    filteredRecords.forEach(r => {
      if (!filteredMap.has(r.barrio)) filteredMap.set(r.barrio, { sum: 0, count: 0 })
      const it = filteredMap.get(r.barrio)!
      it.sum += r.durationMins
      it.count++
    })

    const statsMap: Record<string, { avg: number | null; delta: number | null }> = {}
    Object.keys(BARRIOS_GEO).forEach(bName => {
      const geo = BARRIOS_GEO[bName]
      const f = filteredMap.get(bName) || filteredMap.get(geo.name)
      const o = overallMap.get(bName) || overallMap.get(geo.name)
      const overallAvg = o && o.count > 0 ? Math.round(o.sum / o.count) : null
      const avg = f && f.count > 0 ? Math.round(f.sum / f.count) : null
      const delta = avg && overallAvg ? avg - overallAvg : null
      statsMap[bName] = { avg, delta }
    })
    return statsMap
  }, [records, filteredRecords, destFilter, sentidoFilter])

  // DESGLOSE COMPLETO Y PROFUNDO PARA EL BARRIO SELECCIONADO (FICHA DE INSPECCIÓN)
  const selectedBarrioDetails = useMemo(() => {
    const targetName = selectedBarrio
    const bRecords = records.filter(r => r.barrio === targetName)

    const calcSubset = (list: ProcessedRecord[]) => {
      if (list.length === 0) return { avg: null, min: null, max: null, count: 0 }
      const sum = list.reduce((a, b) => a + b.durationMins, 0)
      const min = Math.min(...list.map(r => r.durationMins))
      const max = Math.max(...list.map(r => r.durationMins))
      return { avg: Math.round(sum / list.length), min, max, count: list.length }
    }

    // 1. Mañana (Ida a CABA): DOT vs Centro (06 a 11 hs)
    const mananaDOT = calcSubset(bRecords.filter(r => r.isIda && r.isDOT && r.hours >= 6 && r.hours <= 11))
    const mananaCentro = calcSubset(bRecords.filter(r => r.isIda && !r.isDOT && r.hours >= 6 && r.hours <= 11))

    // 2. Tarde (Vuelta a Barrios): DOT vs Centro (14 a 21 hs)
    const tardeDOT = calcSubset(bRecords.filter(r => !r.isIda && r.isDOT && r.hours >= 14 && r.hours <= 21))
    const tardeCentro = calcSubset(bRecords.filter(r => !r.isIda && !r.isDOT && r.hours >= 14 && r.hours <= 21))

    // 3. Desglose por Día de la Semana (0=Lun ... 6=Dom)
    const daysName = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    const dayBreakdown = daysName.map((name, idx) => {
      const dRecords = bRecords.filter(r => r.dayOfWeek === idx)
      const stats = calcSubset(dRecords)
      return { name, dayIndex: idx, ...stats }
    })

    // 4. Desglose por Mes
    const monthsOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    const availableMesesForBarrio = Array.from(new Set(bRecords.map(r => r.mes))).filter(Boolean)
      .sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b))

    const monthBreakdown = availableMesesForBarrio.map(mesName => {
      const mRecords = bRecords.filter(r => r.mes === mesName)
      const stats = calcSubset(mRecords)
      return { name: mesName, ...stats }
    })

    // 5. Curva Horaria (6 a 21 hs)
    const hourlyCurve: { hour: number; avg: number; count: number }[] = []
    for (let h = 6; h <= 21; h++) {
      const hRecords = bRecords.filter(r => r.hours === h)
      if (hRecords.length > 0) {
        const stats = calcSubset(hRecords)
        hourlyCurve.push({ hour: h, avg: stats.avg!, count: stats.count })
      }
    }

    // Promedio general de este barrio
    const overall = calcSubset(bRecords)

    return {
      barrio: targetName,
      macro: BARRIOS_GEO[targetName]?.macro || 'Zona Norte',
      overall,
      mananaDOT,
      mananaCentro,
      tardeDOT,
      tardeCentro,
      dayBreakdown,
      monthBreakdown,
      hourlyCurve
    }
  }, [records, selectedBarrio])

  // Handlers para interactuar con el mapa
  const handleMacroChange = (macroKey: string) => {
    setMacroFilter(prev => prev === macroKey ? 'todas' : macroKey)
    const zone = MACRO_ZONES_POLYGONS[macroKey]
    if (zone && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(zone.center, 12.5, { duration: 0.6 })
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      const L = (window as any).L
      if (L) {
        const bounds = L.latLngBounds([
          [-34.615, -58.760],
          [-34.350, -58.370]
        ])
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] })
      }
    }
  }

  const handleSelectBarrio = (barrioName: string) => {
    setSelectedBarrio(barrioName)
    const geo = BARRIOS_GEO[barrioName]
    if (geo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([geo.lat, geo.lng], 13.5, { duration: 0.6 })
    }
  }

  // 1. CARGA DINÁMICA DE ASSETS LEAFLET
  useEffect(() => {
    let isMounted = true

    const loadLeafletAssets = async () => {
      try {
        if (!(window as any).L) {
          if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
          }

          await new Promise<void>((resolve, reject) => {
            if (document.getElementById('leaflet-js')) {
              const existing = document.getElementById('leaflet-js')
              existing?.addEventListener('load', () => resolve())
              return
            }
            const script = document.createElement('script')
            script.id = 'leaflet-js'
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Leaflet JS'))
            document.body.appendChild(script)
          })
        }

        if (isMounted) setMapLoaded(true)
      } catch (err) {
        console.error('Error loading Leaflet:', err)
        if (isMounted) setLeafletError(true)
      }
    }

    loadLeafletAssets()

    return () => {
      isMounted = false
    }
  }, [])

  // 2. INICIALIZACIÓN DEL MAPA
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L) return

    if (mapInstanceRef.current) return

    const bounds = L.latLngBounds([
      [-34.615, -58.760],
      [-34.350, -58.370]
    ])

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    map.fitBounds(bounds, { padding: [35, 35] })

    const tileConfig = TILE_LAYERS[activeTileKey]
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution
    }).addTo(map)

    mapInstanceRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mapLoaded])

  // 3. CAMBIO DE CAPA TILE
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L) return

    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }

    const tileConfig = TILE_LAYERS[activeTileKey]
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution
    }).addTo(map)

    map.invalidateSize()
  }, [activeTileKey])

  // 4. POLÍGONOS DE ZONAS, BARRIOS Y LÍNEAS DE RUTA
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L) return

    zonesLayerRef.current.forEach(z => z.remove())
    zonesLayerRef.current = []
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    linesRef.current.forEach(l => l.remove())
    linesRef.current = []

    // Polígonos de zonas
    Object.keys(MACRO_ZONES_POLYGONS).forEach(macroKey => {
      const zone = MACRO_ZONES_POLYGONS[macroKey]
      const isMacroActive = macroFilter === 'todas' || macroFilter === macroKey

      const polygon = L.polygon(zone.coords, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: isMacroActive ? 0.16 : 0.04,
        weight: isMacroActive ? 2.5 : 1,
        dashArray: isMacroActive ? '6, 6' : undefined
      }).addTo(map)

      polygon.on('click', () => {
        handleMacroChange(macroKey)
      })

      zonesLayerRef.current.push(polygon)

      const zoneLabelIcon = L.divIcon({
        className: 'zone-label-' + macroKey.replace(/[^a-zA-Z0-9]/g, '-'),
        html: `
          <div style="
            background:rgba(15, 23, 42, 0.9);
            border:1px solid ${zone.color};
            color:${zone.color};
            padding:2px 8px;
            border-radius:8px;
            font-size:9px;
            font-weight:900;
            letter-spacing:0.8px;
            text-transform:uppercase;
            box-shadow:0 0 10px rgba(0,0,0,0.8);
            white-space:nowrap;
            pointer-events:none;
            opacity:${isMacroActive ? '1' : '0.4'};
          ">
            ${zone.label}
          </div>
        `,
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      })

      const zoneLabelMarker = L.marker(zone.center, { icon: zoneLabelIcon, zIndexOffset: 50 }).addTo(map)
      zonesLayerRef.current.push(zoneLabelMarker)
    })

    // Destinos: Shopping DOT y Microcentro
    const dotIcon = L.divIcon({
      className: 'dest-dot-marker',
      html: `
        <div style="display:flex;align-items:center;gap:6px;background:#020617;border:2px solid #3b82f6;color:#60a5fa;padding:6px 12px;border-radius:24px;font-weight:900;font-size:11px;box-shadow:0 0 20px rgba(59,130,246,0.7);white-space:nowrap;cursor:pointer;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#3b82f6;box-shadow:0 0 10px #3b82f6;"></span>
          Shopping DOT Baires
        </div>
      `,
      iconSize: [150, 32],
      iconAnchor: [75, 16]
    })
    const dotMarker = L.marker([DEST_DOT.lat, DEST_DOT.lng], { icon: dotIcon, zIndexOffset: 500 }).addTo(map)
    dotMarker.bindPopup('<b>Shopping DOT Baires</b><br/>Panamericana y General Paz (Saavedra)')
    markersRef.current.push(dotMarker)

    const centroIcon = L.divIcon({
      className: 'dest-centro-marker',
      html: `
        <div style="display:flex;align-items:center;gap:6px;background:#020617;border:2px solid #a855f7;color:#c084fc;padding:6px 12px;border-radius:24px;font-weight:900;font-size:11px;box-shadow:0 0 20px rgba(168,85,247,0.7);white-space:nowrap;cursor:pointer;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#a855f7;box-shadow:0 0 10px #a855f7;"></span>
          Microcentro (Obelisco)
        </div>
      `,
      iconSize: [160, 32],
      iconAnchor: [80, 16]
    })
    const centroMarker = L.marker([DEST_CENTRO.lat, DEST_CENTRO.lng], { icon: centroIcon, zIndexOffset: 500 }).addTo(map)
    centroMarker.bindPopup('<b>Microcentro (Obelisco)</b><br/>Av. 9 de Julio y Corrientes')
    markersRef.current.push(centroMarker)

    // Barrios individuales
    const uniqueBarrios = Object.values(BARRIOS_GEO).filter((b, idx, self) => 
      self.findIndex(t => t.name === b.name) === idx
    )

    uniqueBarrios.forEach(barrio => {
      if (macroFilter !== 'todas' && barrio.macro !== macroFilter) return

      const stat = barrioStats[barrio.name]
      const mins = stat ? stat.avg : null
      const colors = getTrafficColor(mins)
      const isSelected = selectedBarrio === barrio.name
      const zoneInfo = MACRO_ZONES_POLYGONS[barrio.macro]
      const zoneColor = zoneInfo ? zoneInfo.color : '#3b82f6'

      // Huella física circular
      const footprintCircle = L.circle([barrio.lat, barrio.lng], {
        radius: isSelected ? 800 : 600,
        color: isSelected ? '#ffffff' : zoneColor,
        fillColor: colors.bg,
        fillOpacity: isSelected ? 0.45 : 0.28,
        weight: isSelected ? 2.5 : 1.5
      }).addTo(map)
      markersRef.current.push(footprintCircle)

      // Marcador prominente del barrio
      const markerHtml = `
        <div style="
          display:flex;
          flex-direction:column;
          align-items:center;
          cursor:pointer;
          transform:${isSelected ? 'scale(1.22)' : 'scale(1)'};
          transition:transform 0.2s ease;
        ">
          <div style="
            display:flex;
            align-items:center;
            gap:4px;
            background:#020617;
            border:2px solid ${colors.bg};
            padding:3px 8px;
            border-radius:14px;
            box-shadow:0 4px 15px rgba(0,0,0,0.8), 0 0 10px ${colors.bg};
            white-space:nowrap;
          ">
            <span style="
              background:${colors.bg};
              color:#ffffff;
              font-weight:900;
              font-size:11px;
              font-family:monospace;
              padding:1px 6px;
              border-radius:8px;
            ">
              ${mins !== null ? `${mins}m` : '--'}
            </span>
            <span style="
              color:#f8fafc;
              font-weight:800;
              font-size:11px;
              padding-right:2px;
            ">
              ${barrio.name}
            </span>
          </div>
        </div>
      `

      const icon = L.divIcon({
        className: 'barrio-badge-' + barrio.name.replace(/\s+/g, '-'),
        html: markerHtml,
        iconSize: [130, 30],
        iconAnchor: [65, 15]
      })

      const marker = L.marker([barrio.lat, barrio.lng], { 
        icon, 
        zIndexOffset: isSelected ? 1200 : 200 
      }).addTo(map)

      marker.on('click', () => {
        setSelectedBarrio(barrio.name)
        map.flyTo([barrio.lat, barrio.lng], 13.5, { duration: 0.6 })
      })

      markersRef.current.push(marker)

      if (mins !== null) {
        const strokeColor = colors.bg

        if (destFilter === 'dot' || destFilter === 'ambos') {
          const lineDot = L.polyline([[barrio.lat, barrio.lng], [DEST_DOT.lat, DEST_DOT.lng]], {
            color: strokeColor,
            weight: isSelected ? 3.5 : 1.5,
            opacity: isSelected ? 0.9 : 0.28,
            dashArray: isSelected ? undefined : '5, 8'
          }).addTo(map)
          linesRef.current.push(lineDot)
        }

        if (destFilter === 'centro' || destFilter === 'ambos') {
          const lineCentro = L.polyline([[barrio.lat, barrio.lng], [DEST_CENTRO.lat, DEST_CENTRO.lng]], {
            color: strokeColor,
            weight: isSelected ? 3.5 : 1.5,
            opacity: isSelected ? 0.9 : 0.28,
            dashArray: isSelected ? undefined : '5, 8'
          }).addTo(map)
          linesRef.current.push(lineCentro)
        }
      }
    })

  }, [mapLoaded, barrioStats, selectedBarrio, destFilter, macroFilter])

  const details = selectedBarrioDetails
  const selectedZoneInfo = MACRO_ZONES_POLYGONS[details.macro]
  const selectedZoneColor = selectedZoneInfo ? selectedZoneInfo.color : '#3b82f6'

  // Encontrar el día más rápido y el más lento
  const validDays = details.dayBreakdown.filter(d => d.avg !== null)
  const fastestDay = validDays.length > 0 ? validDays.reduce((min, d) => d.avg! < min.avg! ? d : min, validDays[0]) : null
  const slowestDay = validDays.length > 0 ? validDays.reduce((max, d) => d.avg! > max.avg! ? d : max, validDays[0]) : null

  // Máximo para escalar la curva horaria
  const maxHourlyAvg = details.hourlyCurve.length > 0 ? Math.max(...details.hourlyCurve.map(h => h.avg)) : 100

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. ENCABEZADO Y CONTROLES DEL MAPA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <MapIcon size={20} />
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Mapa Geoespacial de Tráfico y Corredores
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizá los tiempos de viaje proyectados desde Zona Norte hacia Shopping DOT y Obelisco en tiempo real.
          </p>
        </div>

        {/* Botón centrar mapa */}
        <button
          onClick={handleResetView}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all hover:scale-105"
        >
          <RotateCcw size={14} />
          Centrar Vista Completa
        </button>
      </div>

      {/* 2. BARRA DE FILTROS DEL MAPA */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl shadow-xl space-y-4">
        {/* Selector de Macrozonas */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
            <Layers size={13} className="text-blue-400" /> Zona:
          </span>
          <button
            onClick={() => handleMacroChange('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              macroFilter === 'todas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            Todas las Zonas
          </button>
          {macroList.map(mKey => {
            const z = MACRO_ZONES_POLYGONS[mKey]
            const active = macroFilter === mKey
            return (
              <button
                key={mKey}
                onClick={() => handleMacroChange(mKey)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border"
                style={{
                  borderColor: active ? z.color : 'rgba(255,255,255,0.08)',
                  background: active ? `${z.color}25` : 'rgba(255,255,255,0.03)',
                  color: active ? '#ffffff' : z.color
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                {z.label.replace('Zona ', '')}
              </button>
            )
          })}
        </div>

        {/* Filtros de Destino, Sentido, Horario y Capa */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 border-t border-white/5">
          {/* Destino */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Destino
            </label>
            <select
              value={destFilter}
              onChange={e => setDestFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ambos">DOT y Centro (Ambos)</option>
              <option value="dot">Solo Shopping DOT</option>
              <option value="centro">Solo Microcentro</option>
            </select>
          </div>

          {/* Sentido */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Sentido
            </label>
            <select
              value={sentidoFilter}
              onChange={e => setSentidoFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ida">Ida (Hacia CABA)</option>
              <option value="vuelta">Vuelta (Hacia Barrios)</option>
              <option value="ambos">Ambos Sentidos</option>
            </select>
          </div>

          {/* Horario */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Horario
            </label>
            <select
              value={timePreset}
              onChange={e => setTimePreset(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="manana">Pico Mañana (06 - 10 hs)</option>
              <option value="tarde">Pico Tarde (15 - 20 hs)</option>
              <option value="todo">Todo el día</option>
            </select>
          </div>

          {/* Días */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Días
            </label>
            <select
              value={dayFilter}
              onChange={e => setDayFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="habiles">Días Hábiles (Lun a Vie)</option>
              <option value="finde">Fines de Semana</option>
              <option value="todos">Todos los días</option>
            </select>
          </div>

          {/* Capa de Mapa */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Estilo Visual
            </label>
            <select
              value={activeTileKey}
              onChange={e => setActiveTileKey(e.target.value as any)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="oscuro">🌙 Minimalista Oscuro</option>
              <option value="claro">☀️ Minimalista Claro</option>
              <option value="calles">🗺️ Calles OpenStreetMap</option>
              <option value="satelite">🛰️ Satélite Aéreo</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAPA A TODO LO ANCHO */}
      <div className="relative w-full h-[580px] md:h-[640px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
        
        {/* Contenedor Leaflet */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Estado de carga */}
        {!mapLoaded && !leafletError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-300">Cargando motor de mapas satelital...</p>
          </div>
        )}

        {/* Mensaje de error si falla Leaflet */}
        {leafletError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 p-6 text-center">
            <Info size={36} className="text-amber-400 mb-3" />
            <p className="text-base font-bold text-white mb-1">No se pudo cargar la vista cartográfica</p>
            <p className="text-xs text-slate-400 max-w-md">Verificá tu conexión a internet para cargar los mapas de OpenStreetMap / Esri Canvas.</p>
          </div>
        )}

        {/* Leyenda de Tráfico flotante sobre el mapa */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-white/10 p-3.5 rounded-xl shadow-2xl max-w-xs pointer-events-auto">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles size={11} className="text-blue-400" /> Escala de Demora
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              <span className="text-emerald-400">≤ 42 min (Fluido)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
              <span className="text-amber-400">43 - 56 min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500" />
              <span className="text-orange-400">57 - 72 min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
              <span className="text-red-400">&gt; 72 min (Alto)</span>
            </div>
          </div>
        </div>

        {/* Indicador de Barrio Seleccionado flotante arriba a la derecha */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-xl pointer-events-auto">
          <span className="text-[11px] text-slate-400 font-medium">Barrio activo:</span>
          <span className="text-xs font-black text-white">{selectedBarrio}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${selectedZoneColor}25`, color: selectedZoneColor }}>
            {details.macro}
          </span>
        </div>

      </div>

      {/* 4. BARRA SELECTORA DE BARRIOS */}
      <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Seleccionar Barrio para Ficha de Inspección
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Haz clic en cualquier barrio para ver su radiografía completa
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {uniqueBarriosList.map(bName => {
            const isSel = selectedBarrio === bName
            const stat = barrioStats[bName]
            const avgMins = stat?.avg
            const colors = getTrafficColor(avgMins ?? null)
            const bGeo = BARRIOS_GEO[bName]
            const zColor = bGeo ? MACRO_ZONES_POLYGONS[bGeo.macro]?.color || '#3b82f6' : '#3b82f6'

            return (
              <button
                key={bName}
                onClick={() => handleSelectBarrio(bName)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSel 
                    ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.03]' 
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: zColor }} />
                <span>{bName}</span>
                {avgMins !== null && avgMins !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${colors.badgeClass}`}>
                    {avgMins}m
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. FICHA DE INSPECCIÓN DETALLADA DEL BARRIO */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
        
        {/* Cabecera del Barrio */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {details.barrio}
              </h2>
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  borderColor: `${selectedZoneColor}50`,
                  background: `${selectedZoneColor}20`,
                  color: selectedZoneColor
                }}
              >
                {details.macro}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ficha integral de tiempos de viaje, patrones horarios, días pico y análisis estacional.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl self-start md:self-auto">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Promedio General
              </span>
              <span className="text-2xl font-black text-white font-mono">
                {details.overall.avg !== null ? `${details.overall.avg} min` : '--'}
              </span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                Muestras
              </span>
              <span className="text-sm font-black text-slate-300 font-mono">
                {details.overall.count} reg
              </span>
            </div>
          </div>
        </div>

        {/* 4 CARDS: MAÑANA Y TARDE x DOT Y MICROCENTRO */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-400" />
            <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider">
              Tiempos Clave por Turno y Destino
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Mañana DOT */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  Mañana $\rightarrow$ DOT
                </span>
                <span className="text-[10px] text-slate-400">06:00 - 11:00 hs</span>
              </div>
              <div className="text-3xl font-black font-mono text-white mb-2">
                {details.mananaDOT.avg !== null ? `${details.mananaDOT.avg} min` : '--'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Rango:</span>
                <span className="font-mono text-slate-300 font-bold">
                  {details.mananaDOT.min !== null ? `${details.mananaDOT.min}m - ${details.mananaDOT.max}m` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Registros:</span>
                <span className="font-mono">{details.mananaDOT.count}</span>
              </div>
            </div>

            {/* 2. Mañana Centro */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sun size={14} className="text-amber-400" />
                  Mañana $\rightarrow$ Obelisco
                </span>
                <span className="text-[10px] text-slate-400">06:00 - 11:00 hs</span>
              </div>
              <div className="text-3xl font-black font-mono text-white mb-2">
                {details.mananaCentro.avg !== null ? `${details.mananaCentro.avg} min` : '--'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Rango:</span>
                <span className="font-mono text-slate-300 font-bold">
                  {details.mananaCentro.min !== null ? `${details.mananaCentro.min}m - ${details.mananaCentro.max}m` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Registros:</span>
                <span className="font-mono">{details.mananaCentro.count}</span>
              </div>
            </div>

            {/* 3. Tarde DOT */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-400" />
                  Tarde $\leftarrow$ DOT
                </span>
                <span className="text-[10px] text-slate-400">14:00 - 21:00 hs</span>
              </div>
              <div className="text-3xl font-black font-mono text-white mb-2">
                {details.tardeDOT.avg !== null ? `${details.tardeDOT.avg} min` : '--'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Rango:</span>
                <span className="font-mono text-slate-300 font-bold">
                  {details.tardeDOT.min !== null ? `${details.tardeDOT.min}m - ${details.tardeDOT.max}m` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Registros:</span>
                <span className="font-mono">{details.tardeDOT.count}</span>
              </div>
            </div>

            {/* 4. Tarde Centro */}
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-400" />
                  Tarde $\leftarrow$ Obelisco
                </span>
                <span className="text-[10px] text-slate-400">14:00 - 21:00 hs</span>
              </div>
              <div className="text-3xl font-black font-mono text-white mb-2">
                {details.tardeCentro.avg !== null ? `${details.tardeCentro.avg} min` : '--'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Rango:</span>
                <span className="font-mono text-slate-300 font-bold">
                  {details.tardeCentro.min !== null ? `${details.tardeCentro.min}m - ${details.tardeCentro.max}m` : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Registros:</span>
                <span className="font-mono">{details.tardeCentro.count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 COLUMNAS: DÍAS DE LA SEMANA & MESES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          
          {/* Desglose por Día de la Semana */}
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-400" />
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Demoras por Día de la Semana
                </h4>
              </div>
              {fastestDay && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Día más rápido: {fastestDay.name} ({fastestDay.avg}m)
                </span>
              )}
            </div>

            <div className="space-y-2">
              {details.dayBreakdown.map(d => {
                const colors = getTrafficColor(d.avg)
                const isFastest = fastestDay && fastestDay.name === d.name && d.avg !== null
                const isSlowest = slowestDay && slowestDay.name === d.name && d.avg !== null && slowestDay.name !== fastestDay?.name

                return (
                  <div
                    key={d.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                      isFastest 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : isSlowest 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.bg }} />
                      <span className="text-xs font-bold text-slate-200">{d.name}</span>
                      {isFastest && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          Más veloz
                        </span>
                      )}
                      {isSlowest && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-400">
                          Más lento
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        {d.min !== null ? `${d.min} - ${d.max}m` : '--'}
                      </span>
                      <span className="text-slate-400 text-[11px]">{d.count} reg</span>
                      <span className={`font-black text-sm w-14 text-right ${colors.text}`}>
                        {d.avg !== null ? `${d.avg}m` : '--'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desglose por Mes (Histórico) */}
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-400" />
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  Evolución Histórica por Mes
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {details.monthBreakdown.length} meses relevados
              </span>
            </div>

            {details.monthBreakdown.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No hay suficientes datos mensuales agrupados para este barrio.
              </div>
            ) : (
              <div className="space-y-2">
                {details.monthBreakdown.map(m => {
                  const colors = getTrafficColor(m.avg)

                  return (
                    <div
                      key={m.name}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.bg }} />
                        <span className="text-xs font-bold text-slate-200">{m.name}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-500 text-[11px] hidden sm:inline">
                          {m.min !== null ? `${m.min} - ${m.max}m` : '--'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{m.count} reg</span>
                        <span className={`font-black text-sm w-14 text-right ${colors.text}`}>
                          {m.avg !== null ? `${m.avg}m` : '--'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* CURVA HORARIA DE CONGESTIÓN (06:00 a 21:00 hs) */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Curva Horaria de Congestión (06:00 a 21:00 hs)
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-500" /> Pico Mañana (07 - 09hs)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-purple-500" /> Pico Tarde (17 - 19hs)
              </span>
            </div>
          </div>

          {details.hourlyCurve.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No hay datos horarios registrados para este barrio.
            </div>
          ) : (
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 items-end h-44 pt-6">
              {Array.from({ length: 16 }, (_, i) => i + 6).map(hour => {
                const hData = details.hourlyCurve.find(h => h.hour === hour)
                const val = hData?.avg || 0
                const colors = getTrafficColor(hData ? val : null)
                const heightPercent = val > 0 ? Math.max(15, Math.round((val / maxHourlyAvg) * 100)) : 4
                const isMorningPeak = hour >= 7 && hour <= 9
                const isEveningPeak = hour >= 17 && hour <= 19

                return (
                  <div key={hour} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    {hData && (
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/20 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none shadow-xl">
                        {hour}:00hs: {val}m ({hData.count} reg)
                      </div>
                    )}

                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t-md transition-all group-hover:brightness-125 ${
                        isMorningPeak ? 'ring-1 ring-amber-400/40' : isEveningPeak ? 'ring-1 ring-purple-400/40' : ''
                      }`}
                      style={{
                        height: `${heightPercent}%`,
                        background: val > 0 ? colors.bg : 'rgba(255,255,255,0.05)'
                      }}
                    />

                    {/* Value label */}
                    <span className="text-[9px] font-mono font-bold text-slate-400 mt-1">
                      {val > 0 ? `${val}m` : '--'}
                    </span>

                    {/* Hour label */}
                    <span className={`text-[9px] font-mono font-bold ${
                      isMorningPeak ? 'text-amber-400' : isEveningPeak ? 'text-purple-400' : 'text-slate-500'
                    }`}>
                      {hour}h
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
