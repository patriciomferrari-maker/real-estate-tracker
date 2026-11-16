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
  Filter, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers,
  ChevronRight,
  RotateCcw,
  Info,
  ZoomIn,
  Eye,
  SlidersHorizontal
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

// Polígonos de delimitación para resaltar visualmente cada zona en el mapa
export const MACRO_ZONES_POLYGONS: Record<string, { label: string; color: string; center: [number, number]; coords: [number, number][] }> = {
  "Nordelta": {
    label: "Zona Nordelta",
    color: "#3b82f6", // Azul
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
    color: "#a855f7", // Violeta
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
    color: "#06b6d4", // Cian
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
    color: "#f59e0b", // Ámbar
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
    color: "#10b981", // Esmeralda
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
    color: "#ec4899", // Rosa
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
  // Capa base limpia y minimalista sin ruido visual (por defecto "oscuro")
  const [activeTileKey, setActiveTileKey] = useState<'oscuro' | 'claro' | 'calles' | 'satelite'>('oscuro')

  // Filtros interactivos
  const [destFilter, setDestFilter] = useState<'dot' | 'centro' | 'ambos'>('ambos')
  const [sentidoFilter, setSentidoFilter] = useState<'ida' | 'vuelta' | 'ambos'>('ida')
  const [dayFilter, setDayFilter] = useState<'todos' | 'habiles' | 'finde' | '0' | '1' | '2' | '3' | '4' | '5' | '6'>('habiles')
  const [timePreset, setTimePreset] = useState<'todo' | 'manana' | 'tarde' | 'custom'>('manana')
  const [selectedHour, setSelectedHour] = useState<number>(8)
  const [monthFilter, setMonthFilter] = useState<string>('todos')
  const [macroFilter, setMacroFilter] = useState<string>('todas')

  // Barrio seleccionado para ficha de inspección
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

  // Estadísticas globales e históricas por barrio
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

    const filteredMap = new Map<string, { 
      sum: number
      count: number
      min: number
      max: number
      hoursDist: Map<number, { sum: number; count: number }> 
    }>()

    filteredRecords.forEach(r => {
      if (!filteredMap.has(r.barrio)) {
        filteredMap.set(r.barrio, {
          sum: 0,
          count: 0,
          min: 999,
          max: 0,
          hoursDist: new Map()
        })
      }
      const it = filteredMap.get(r.barrio)!
      it.sum += r.durationMins
      it.count++
      if (r.durationMins < it.min) it.min = r.durationMins
      if (r.durationMins > it.max) it.max = r.durationMins

      if (!it.hoursDist.has(r.hours)) it.hoursDist.set(r.hours, { sum: 0, count: 0 })
      const h = it.hoursDist.get(r.hours)!
      h.sum += r.durationMins
      h.count++
    })

    const statsMap: Record<string, {
      avg: number | null
      delta: number | null
      min: number | null
      max: number | null
      count: number
      overallAvg: number | null
      hourlyAvg: { hour: number; avg: number }[]
    }> = {}

    Object.keys(BARRIOS_GEO).forEach(bName => {
      const geo = BARRIOS_GEO[bName]
      const f = filteredMap.get(bName) || filteredMap.get(geo.name)
      const o = overallMap.get(bName) || overallMap.get(geo.name)

      const overallAvg = o && o.count > 0 ? Math.round(o.sum / o.count) : null
      const avg = f && f.count > 0 ? Math.round(f.sum / f.count) : null
      const delta = avg && overallAvg ? avg - overallAvg : null

      const hourlyAvg: { hour: number; avg: number }[] = []
      if (f) {
        for (let h = 6; h <= 21; h++) {
          const item = f.hoursDist.get(h)
          if (item && item.count > 0) {
            hourlyAvg.push({ hour: h, avg: Math.round(item.sum / item.count) })
          }
        }
      }

      statsMap[bName] = {
        avg,
        delta,
        min: f && f.count > 0 ? f.min : null,
        max: f && f.count > 0 ? f.max : null,
        count: f ? f.count : 0,
        overallAvg,
        hourlyAvg
      }
    })

    return statsMap
  }, [records, filteredRecords, destFilter, sentidoFilter])

  // Helper de colores de tráfico (Fluido, Normal, Congestión, Demora Alta)
  const getTrafficColor = (mins: number | null) => {
    if (mins === null) return { bg: '#475569', border: '#64748b', text: '#94a3b8', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' }
    if (mins <= 42) return { bg: '#10b981', border: '#059669', text: '#34d399', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' }
    if (mins <= 56) return { bg: '#f59e0b', border: '#d97706', text: '#fbbf24', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
    if (mins <= 72) return { bg: '#f97316', border: '#ea580c', text: '#fb923c', badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
    return { bg: '#ef4444', border: '#dc2626', text: '#f87171', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40' }
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

        if (isMounted) {
          setMapLoaded(true)
        }
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

    map.fitBounds(bounds, { padding: [30, 30] })

    const tileConfig = TILE_LAYERS[activeTileKey]
    const tileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      attribution: tileConfig.attribution
    }).addTo(map)
    tileLayerRef.current = tileLayer

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

  // 4. DIBUJO DE POLÍGONOS DE ZONAS RESALTADAS, BARRIOS Y RUTAS
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L) return

    // Limpiar capas previas
    zonesLayerRef.current.forEach(z => z.remove())
    zonesLayerRef.current = []
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    linesRef.current.forEach(l => l.remove())
    linesRef.current = []

    // A. RESALTAR POLÍGONOS DE CADA ZONA GEOGRÁFICA
    Object.keys(MACRO_ZONES_POLYGONS).forEach(macroKey => {
      const zone = MACRO_ZONES_POLYGONS[macroKey]
      const isMacroActive = macroFilter === 'todas' || macroFilter === macroKey

      // Calcular promedio de la zona para el tooltip
      const barriosInZone = Object.values(BARRIOS_GEO).filter(b => b.macro === macroKey)
      const zoneAvgs = barriosInZone.map(b => barrioStats[b.name]?.avg).filter((v): v is number => v !== null)
      const zoneProm = zoneAvgs.length > 0 ? Math.round(zoneAvgs.reduce((a, b) => a + b, 0) / zoneAvgs.length) : null

      // Polígono sombreado con borde brillante
      const polygon = L.polygon(zone.coords, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: isMacroActive ? 0.16 : 0.04,
        weight: isMacroActive ? 2.5 : 1,
        dashArray: isMacroActive ? '6, 6' : undefined
      }).addTo(map)

      polygon.bindTooltip(`
        <div style="font-weight:900;color:${zone.color};font-size:12px;">
          ${zone.label}
        </div>
        <div style="color:#ffffff;font-size:11px;">
          Promedio de zona: ${zoneProm !== null ? `${zoneProm} min` : 'Sin datos'}
        </div>
      `, { sticky: true, opacity: 0.95 })

      polygon.on('click', () => {
        handleMacroChange(macroKey)
      })

      zonesLayerRef.current.push(polygon)

      // Etiqueta flotante en el centro de la macro-zona
      const zoneLabelIcon = L.divIcon({
        className: 'zone-label-' + macroKey.replace(/[^a-zA-Z0-9]/g, '-'),
        html: `
          <div style="
            background:rgba(15, 23, 42, 0.85);
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

    // B. DESTINOS EN CABA: SHOPPING DOT Y OBELISCO
    // Shopping DOT Baires
    const dotIcon = L.divIcon({
      className: 'dest-dot-marker',
      html: `
        <div style="
          display:flex;
          align-items:center;
          gap:6px;
          background:#020617;
          border:2px solid #3b82f6;
          color:#60a5fa;
          padding:6px 12px;
          border-radius:24px;
          font-weight:900;
          font-size:11px;
          box-shadow:0 0 20px rgba(59,130,246,0.7);
          white-space:nowrap;
          cursor:pointer;
        ">
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

    // Microcentro (Obelisco)
    const centroIcon = L.divIcon({
      className: 'dest-centro-marker',
      html: `
        <div style="
          display:flex;
          align-items:center;
          gap:6px;
          background:#020617;
          border:2px solid #a855f7;
          color:#c084fc;
          padding:6px 12px;
          border-radius:24px;
          font-weight:900;
          font-size:11px;
          box-shadow:0 0 20px rgba(168,85,247,0.7);
          white-space:nowrap;
          cursor:pointer;
        ">
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

    // C. BARRIOS RESALTADOS INDIVIDUALMENTE CON HUELLA CIRCULAR Y PINES DESTACADOS
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

      // Huella física del barrio (Círculo sombreado que resalta el predio)
      const footprintCircle = L.circle([barrio.lat, barrio.lng], {
        radius: isSelected ? 800 : 600,
        color: isSelected ? '#ffffff' : zoneColor,
        fillColor: colors.bg,
        fillOpacity: isSelected ? 0.45 : 0.28,
        weight: isSelected ? 2.5 : 1.5
      }).addTo(map)
      markersRef.current.push(footprintCircle)

      // Marcador prominente del barrio con demora y nombre
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

      marker.bindTooltip(`
        <div style="padding:4px 6px;">
          <div style="font-weight:bold;color:#f8fafc;font-size:13px;">${barrio.name}</div>
          <div style="color:${zoneColor};font-size:11px;font-weight:bold;">${barrio.macro}</div>
          <div style="color:${colors.text};font-weight:900;font-size:14px;margin-top:2px;">
            Demora: ${mins !== null ? `${mins} min` : 'Sin datos'}
          </div>
          ${stat && stat.delta !== null ? `
            <div style="font-size:10px;color:#cbd5e1;">
              Delta histórico: ${stat.delta > 0 ? `+${stat.delta}m demora` : `${stat.delta}m más rápido`}
            </div>
          ` : ''}
          <div style="font-size:9px;color:#38bdf8;margin-top:3px;">Haz clic para ver ficha detallada</div>
        </div>
      `, { direction: 'top', offset: [0, -18], opacity: 0.95 })

      markersRef.current.push(marker)

      // D. LÍNEAS DE RUTA CONECTADAS
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

  // Acciones de enfoque y zoom
  const handleResetCorredor = () => {
    if (mapInstanceRef.current && (window as any).L) {
      const L = (window as any).L
      const bounds = L.latLngBounds([
        [-34.615, -58.760],
        [-34.350, -58.370]
      ])
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], duration: 0.8 })
    }
  }

  const handleFocusZonaNorte = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-34.42, -58.66], 12.5, { duration: 0.8 })
    }
  }

  const handleMacroChange = (macro: string) => {
    setMacroFilter(macro)
    if (macro !== 'todas' && MACRO_ZONES_POLYGONS[macro] && mapInstanceRef.current) {
      const zone = MACRO_ZONES_POLYGONS[macro]
      mapInstanceRef.current.flyTo([zone.center[0], zone.center[1]], 13, { duration: 0.8 })
    } else if (macro === 'todas') {
      handleResetCorredor()
    }
  }

  const activeGeo = BARRIOS_GEO[selectedBarrio] || Object.values(BARRIOS_GEO)[0]
  const activeStat = barrioStats[activeGeo.name] || { avg: null, delta: null, min: null, max: null, count: 0, overallAvg: null, hourlyAvg: [] }
  const activeColors = getTrafficColor(activeStat.avg)

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

  const rankingList = useMemo(() => {
    const list = Object.values(BARRIOS_GEO).map(b => {
      const stat = barrioStats[b.name]
      return {
        name: b.name,
        macro: b.macro,
        avg: stat ? stat.avg : null,
        delta: stat ? stat.delta : null,
        min: stat ? stat.min : null,
        max: stat ? stat.max : null,
        count: stat ? stat.count : 0
      }
    })
    const unique = list.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
    return unique.sort((a, b) => {
      if (a.avg === null) return 1
      if (b.avg === null) return -1
      return a.avg - b.avg
    })
  }, [barrioStats])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HEADER Y TÍTULO DE LA SECCIÓN */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden bg-slate-950/80">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-fit mb-3">
              <MapIcon size={14} /> Mapa Geográfico Interactivo
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Zonas y Barrios Resaltados de Zona Norte
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Mapa visual con delimitación de cada zona (Nordelta, Villa Nueva, Pacheco, Tortugas, Tigre y Bancalari) y tiempos de viaje hacia Shopping DOT y Obelisco.
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

        {/* 2. PANEL DE FILTROS INTERACTIVOS */}
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
              <MapPin size={12} className="text-pink-400" /> Zona Geográfica
            </label>
            <select
              value={macroFilter}
              onChange={e => handleMacroChange(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
            >
              <option value="todas">Todas las Zonas</option>
              {macroList.map(m => (
                <option key={m} value={m}>{m}</option>
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

      {/* 3. CONTENEDOR PRINCIPAL: MAPA (2/3) + PANEL DE INSPECCIÓN (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: MAPA INTERACTIVO */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4 z-10 relative">
            
            {/* Selector de Estilo de Mapa (Minimalista Limpio por Defecto) */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Estilo:</span>
              {(Object.keys(TILE_LAYERS) as (keyof typeof TILE_LAYERS)[]).map(k => (
                <button
                  key={k}
                  onClick={() => setActiveTileKey(k)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTileKey === k
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {TILE_LAYERS[k].label}
                </button>
              ))}
            </div>

            {/* Botones de Enfoque Rápido */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetCorredor}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all flex items-center gap-1"
                title="Ver todo el corredor desde CABA hasta Villa Nueva"
              >
                <RotateCcw size={12} /> Todo el Corredor
              </button>
              <button
                onClick={handleFocusZonaNorte}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all flex items-center gap-1"
                title="Acercar mapa a los barrios de Zona Norte"
              >
                <ZoomIn size={12} /> Foco Norte
              </button>
            </div>
          </div>

          {/* Contenedor del Mapa Leaflet */}
          <div className="w-full h-[580px] rounded-xl overflow-hidden relative border border-white/10 shadow-inner bg-slate-900">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {!mapLoaded && !leafletError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 z-20">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400">Cargando mapa interactivo...</span>
              </div>
            )}

            {/* Leyenda de Tráfico flotante en el mapa */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-2xl pointer-events-auto">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Escala de Demora
              </span>
              <div className="flex flex-col gap-1.5 text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <span className="text-slate-200">&le; 42 min (Fluido)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                  <span className="text-slate-200">43 - 56 min (Normal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400 shadow-sm shadow-orange-400/50" />
                  <span className="text-slate-200">57 - 72 min (Congestión)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                  <span className="text-slate-200">&gt; 72 min (Demora alta)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: PANEL DE INSPECCIÓN DE BARRIO SELECCIONADO */}
        <div className="glass-card rounded-2xl border border-white/10 bg-slate-950/80 p-5 md:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info size={13} className="text-blue-400" /> Ficha de Inspección
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${activeColors.badgeClass}`}>
                {activeGeo.macro}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <MapPin size={22} className="text-blue-400 shrink-0" />
              {activeGeo.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Zona: <span className="font-bold text-slate-200">{activeGeo.macro}</span>
            </p>

            {/* Métrica Principal: Tiempo Promedio */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Demora Promedio Filtrada
              </span>
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-black font-mono ${activeColors.text}`}>
                  {activeStat.avg !== null ? `${activeStat.avg} min` : '--'}
                </span>
                {activeStat.delta !== null && (
                  <div className="text-right">
                    {activeStat.delta === 0 ? (
                      <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                        <Minus size={12} /> habitual
                      </span>
                    ) : activeStat.delta < 0 ? (
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingDown size={14} /> {Math.abs(activeStat.delta)}m más rápido
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1">
                        <TrendingUp size={14} /> +{activeStat.delta}m demora
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 block">vs promedio histórico</span>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas Secundarias */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Rango Registrado</span>
                <span className="text-sm font-black font-mono text-slate-200">
                  {activeStat.min !== null && activeStat.max !== null 
                    ? `${activeStat.min}m - ${activeStat.max}m` 
                    : '--'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Muestras Evaluadas</span>
                <span className="text-sm font-black font-mono text-slate-200">
                  {activeStat.count} registros
                </span>
              </div>
            </div>

            {/* Histograma Horario de Viaje para este Barrio */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Comportamiento por Hora (6 a 21 hs)
              </span>
              <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-white/5 max-h-52 overflow-y-auto">
                {activeStat.hourlyAvg.length > 0 ? (
                  activeStat.hourlyAvg.map(item => {
                    const c = getTrafficColor(item.avg)
                    const percent = Math.min(100, Math.max(15, (item.avg / 90) * 100))
                    return (
                      <div key={item.hour} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-mono text-[11px] text-slate-400 shrink-0">
                          {String(item.hour).padStart(2, '0')}:00 hs
                        </span>
                        <div className="flex-1 bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percent}%`, backgroundColor: c.bg }}
                          />
                        </div>
                        <span className="w-10 text-right font-mono font-bold text-[11px] text-slate-200">
                          {item.avg}m
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No hay suficientes datos horarios con los filtros actuales.
                  </p>
                )}
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500">
            Haz clic en cualquier barrio en el mapa o en el ranking para inspeccionar.
          </div>
        </div>

      </div>

      {/* 4. TABLERO DE MACRO-ZONAS Y RANKING DE BARRIOS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* TARJETAS RESUMEN POR MACRO-ZONA */}
        <div className="xl:col-span-1 space-y-4">
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers size={16} className="text-indigo-400" /> Promedios por Zona
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {macroList.map(macro => {
              const zone = MACRO_ZONES_POLYGONS[macro]
              const barriosInMacro = Object.values(BARRIOS_GEO).filter(b => b.macro === macro)
              const avgs = barriosInMacro.map(b => barrioStats[b.name]?.avg).filter((v): v is number => v !== null)
              const macroAvg = avgs.length > 0 ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null
              const colors = getTrafficColor(macroAvg)
              const isSelected = macroFilter === macro

              return (
                <div
                  key={macro}
                  onClick={() => handleMacroChange(isSelected ? 'todas' : macro)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                      : 'bg-slate-950/80 border-white/5 hover:border-white/15'
                  }`}
                  style={{ borderLeftColor: zone.color, borderLeftWidth: '4px' }}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-white block">
                      {macro}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {barriosInMacro.length} barrios monitoreados
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-black font-mono block ${colors.text}`}>
                      {macroAvg !== null ? `${macroAvg} min` : '--'}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500">
                      Promedio Zona
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TABLA DE RANKING COMPARATIVO */}
        <div className="xl:col-span-2 glass-card p-5 md:p-6 rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-base font-black text-white tracking-wide">
                Ranking de Tiempos de Viaje
              </h4>
              <p className="text-xs text-slate-400">
                Ordenado del más rápido al más congestionado bajo el filtro activo
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/10">
              {rankingList.filter(r => r.avg !== null).length} de {rankingList.length} barrios con datos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-3.5 py-2.5">#</th>
                  <th className="px-3.5 py-2.5">Barrio</th>
                  <th className="px-3.5 py-2.5">Zona</th>
                  <th className="px-3.5 py-2.5 text-right">Demora Promedio</th>
                  <th className="px-3.5 py-2.5 text-right">Delta Histórico</th>
                  <th className="px-3.5 py-2.5 text-right">Rango (Mín - Máx)</th>
                  <th className="px-3.5 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {rankingList.map((item, idx) => {
                  const colors = getTrafficColor(item.avg)
                  const isSelected = selectedBarrio === item.name
                  const zoneColor = MACRO_ZONES_POLYGONS[item.macro]?.color || '#3b82f6'

                  return (
                    <tr 
                      key={item.name}
                      onClick={() => {
                        setSelectedBarrio(item.name)
                        if (mapInstanceRef.current && BARRIOS_GEO[item.name]) {
                          const g = BARRIOS_GEO[item.name]
                          mapInstanceRef.current.flyTo([g.lat, g.lng], 13.5, { duration: 0.6 })
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-600/15 border-l-2 border-l-blue-400' 
                          : idx % 2 === 0 ? 'bg-transparent hover:bg-white/[0.04]' : 'bg-white/[0.01] hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="font-bold text-white text-sm block">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span 
                          className="text-[11px] font-semibold px-2 py-0.5 rounded border inline-block"
                          style={{ borderColor: `${zoneColor}40`, color: zoneColor, background: `${zoneColor}10` }}
                        >
                          {item.macro}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <span className={`text-base font-black font-mono ${colors.text}`}>
                          {item.avg !== null ? `${item.avg} min` : '--'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        {item.delta !== null ? (
                          item.delta === 0 ? (
                            <span className="text-[11px] font-mono text-slate-400">habitual</span>
                          ) : item.delta < 0 ? (
                            <span className="text-[11px] font-mono font-bold text-emerald-400">
                              {item.delta}m rápido
                            </span>
                          ) : (
                            <span className="text-[11px] font-mono font-bold text-red-400">
                              +{item.delta}m demora
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 font-mono text-xs">--</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono text-slate-400 text-xs">
                        {item.min !== null && item.max !== null ? `${item.min}m - ${item.max}m` : '--'}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <span className="text-blue-400 hover:text-blue-300 text-xs font-bold inline-flex items-center gap-1">
                          Ver <ChevronRight size={13} />
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}
