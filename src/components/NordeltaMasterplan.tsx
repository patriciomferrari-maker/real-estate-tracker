"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Compass, 
  MapPin, 
  Waves, 
  Trees, 
  Anchor, 
  GraduationCap, 
  ShoppingBag, 
  Sparkles,
  Info,
  Clock,
  Home,
  Navigation,
  Fuel,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  X,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Shield,
  Building2
} from 'lucide-react'

export interface BarrioMasterplanData {
  name: string
  category: 'sur' | 'centro' | 'norte' | 'nautico' | 'golf' | 'condo'
  categoryLabel: string
  surfaceHa: number
  lotsCount: number | string
  launchYear: number | string
  typicalLotSize: string
  exitGate: string
  commuteTime: string
  highlight: string
  amenities: string[]
  desc: string
  coords: [number, number] // [lat, lng]
}

export const NORDELTA_BARRIOS: Record<string, BarrioMasterplanData> = {
  "La Isla": {
    name: "La Isla",
    category: "centro",
    categoryLabel: "Máxima Exclusividad",
    surfaceHa: 110,
    lotsCount: 110,
    launchYear: 2000,
    typicalLotSize: "1.000 a 5.000 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "8 min a Panamericana",
    highlight: "El barrio más exclusivo y cotizado de Nordelta",
    amenities: ["Costas privadas", "Lago Central 360°", "Club House", "Canchas de Tenis", "Seguridad Reforzada"],
    desc: "Ubicado en una península privada que se adentra en el corazón del Lago Central de 180 hectáreas. Cuenta con solo 110 lotes de gran superficie con costas privadas infinitas. Sus mansiones son de las más cotizadas del país.",
    coords: [-34.4180, -58.6480]
  },
  "Los Castores": {
    name: "Los Castores",
    category: "centro",
    categoryLabel: "Tradicional al Lago Central",
    surfaceHa: 135,
    lotsCount: 560,
    launchYear: 2000,
    typicalLotSize: "900 a 1.600 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "7 min a Panamericana",
    highlight: "El corazón náutico histórico con mayor costa de lago",
    amenities: ["Lago Central", "Club House con Restaurante", "Tenis Polvo de Ladrillo (6)", "Fútbol 11", "Playón Deportivo", "Muelle Náutico"],
    desc: "El barrio tradicional más importante de Nordelta. Casi la totalidad de sus lotes tienen salida directa al Lago Central o a canales internos navegables sin motor. Posee una vida deportiva y social sumamente activa.",
    coords: [-34.4160, -58.6650]
  },
  "Castaños": {
    name: "Castaños",
    category: "sur",
    categoryLabel: "Acceso Inmediato Bancalari",
    surfaceHa: 75,
    lotsCount: 450,
    launchYear: 2014,
    typicalLotSize: "500 a 850 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "2 min a Bancalari / 12 min a Panamericana",
    highlight: "Salida directa sin tráfico interno por Avenida Troncal",
    amenities: ["Lago Propio", "Club House con Playa de Arena", "Pileta", "Tenis (4)", "Cancha de Fútbol", "SUM"],
    desc: "El barrio predilecto de las familias y profesionales que viajan a CABA todos los días. Al estar ubicado a metros de la garita de Bancalari, ahorra hasta 15 minutos de traslado interno dentro de Nordelta.",
    coords: [-34.4258, -58.6475]
  },
  "Las Glorietas": {
    name: "Las Glorietas",
    category: "sur",
    categoryLabel: "Fundacional y Arbolado",
    surfaceHa: 80,
    lotsCount: 410,
    launchYear: 1999,
    typicalLotSize: "600 a 1.000 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "4 min a Bancalari",
    highlight: "Frondosa arboleda añosa y cercanía al polo educativo",
    amenities: ["Costa sobre Lago Central", "Lagunas Internas", "Club House", "Tenis", "Fútbol", "Plazas de Juegos"],
    desc: "Primer barrio lanzado en Nordelta. Su frondosa vegetación con más de 25 años de crecimiento le otorga una atmósfera única. Muy cercano al polo educativo de los colegios Northlands y Michael Ham.",
    coords: [-34.4125, -58.6570]
  },
  "Los Alisos": {
    name: "Los Alisos",
    category: "sur",
    categoryLabel: "Gran Vida Familiar",
    surfaceHa: 95,
    lotsCount: 520,
    launchYear: 2008,
    typicalLotSize: "650 a 950 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "4 min a Bancalari",
    highlight: "Imponente lago central de 10 ha para kayak y windsurf",
    amenities: ["Lago Propio 10 ha", "Club House Moderno", "Pileta Semiolímpica", "Tenis Iluminado (4)", "Fútbol", "Restaurante"],
    desc: "Gran consolidación familiar. Su imponente lago de 10 hectáreas es el centro de actividades náuticas a remo y vela. Excelente infraestructura deportiva y club house con servicio gastronómico continuo.",
    coords: [-34.4290, -58.6380]
  },
  "El Golf": {
    name: "El Golf",
    category: "golf",
    categoryLabel: "Campo Jack Nicklaus 18 Hoyos",
    surfaceHa: 140,
    lotsCount: 420,
    launchYear: 2006,
    typicalLotSize: "1.200 a 2.000 m²",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "8 min a Acceso Norte",
    highlight: "Vistas panorámicas infinitas al green de golf y lagunas",
    amenities: ["Cancha de Golf 18 Hoyos PGA", "Club House del Golf", "Restaurante Gourmet", "Tenis", "Pileta", "Gimnasio"],
    desc: "Diseñado rodeando el prestigioso Nordelta Golf Club, un campo de campeonato de 18 hoyos par 72 diseñado por Jack Nicklaus. Sus lotes de amplias dimensiones gozan de fondos abiertos al fairway.",
    coords: [-34.4050, -58.6720]
  },
  "El Yacht": {
    name: "El Yacht",
    category: "nautico",
    categoryLabel: "Náutico Premium al Río Luján",
    surfaceHa: 95,
    lotsCount: 430,
    launchYear: 2011,
    typicalLotSize: "900 a 1.500 m²",
    exitGate: "Garita Remeros (Lateral Este)",
    commuteTime: "8 min a Camino Remeros",
    highlight: "Amarras para yates y cruceros con salida directa al Río Luján",
    amenities: ["Amarras Privadas", "Salida al Río Luján sin esclusas", "Club House Náutico", "Tenis", "Pileta", "Guardería Náutica"],
    desc: "Diseñado para los amantes de la náutica de motor. Cada lote sobre el canal mayor permite amarrar embarcaciones de calado importante en el fondo del jardín y salir directamente al Río Luján y al Delta.",
    coords: [-34.3940, -58.6180]
  },
  "Las Caletas": {
    name: "Las Caletas",
    category: "nautico",
    categoryLabel: "Náutico Exclusivo",
    surfaceHa: 45,
    lotsCount: 180,
    launchYear: 2002,
    typicalLotSize: "800 a 1.200 m²",
    exitGate: "Garita Remeros (Lateral Este)",
    commuteTime: "9 min a Camino Remeros",
    highlight: "Barrio boutique sobre el canal navegable mayor",
    amenities: ["Amarras Propias", "Canal Mayor", "Club House", "Tenis", "Plazas"],
    desc: "Un barrio náutico boutique con solo 180 lotes. Todos ellos poseen amarras privadas y están conectados al canal que desemboca en el Río Luján.",
    coords: [-34.4050, -58.6250]
  },
  "Barrancas del Lago": {
    name: "Barrancas del Lago",
    category: "centro",
    categoryLabel: "Estilo Colonial Mediterráneo",
    surfaceHa: 85,
    lotsCount: 440,
    launchYear: 2001,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Garita Bancalari / Benavídez",
    commuteTime: "8 min a Panamericana",
    highlight: "Arquitectura homogénea de tejas y academia de tenis",
    amenities: ["Lago de 8 ha", "Club House", "Tenis Polvo de Ladrillo", "Pileta", "Fútbol", "Plazas"],
    desc: "Uno de los barrios con mayor identidad arquitectónica, caracterizado por sus residencias de tejas coloniales y tonos cálidos que rodean un lago de 8 hectáreas. Posee una de las mejores academias de tenis de la zona.",
    coords: [-34.4080, -58.6430]
  },
  "Los Sauces": {
    name: "Los Sauces",
    category: "centro",
    categoryLabel: "Pegado al Centro Comercial",
    surfaceHa: 70,
    lotsCount: 380,
    launchYear: 2001,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "6 min a Acceso Norte",
    highlight: "Se puede ir caminando al Shopping, Cines y Sanatorio",
    amenities: ["2 Lagos Internos", "Club House", "Tenis", "Fútbol", "Plaza de Juegos"],
    desc: "Ubicación privilegiada en el centro geográfico de servicios de Nordelta. Permite acceder a pie o en bicicleta al Centro Comercial, supermercado Jumbo, cines y centros de salud.",
    coords: [-34.4010, -58.6530]
  },
  "Los Tilos": {
    name: "Los Tilos",
    category: "norte",
    categoryLabel: "Residencial Familiar",
    surfaceHa: 60,
    lotsCount: 350,
    launchYear: 2004,
    typicalLotSize: "500 a 750 m²",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "5 min a Acceso Norte",
    highlight: "Calles tranquilas y plazas diseñadas para niños",
    amenities: ["Club House", "Pileta", "Tenis", "Fútbol", "Plazas Infantiles"],
    desc: "Barrio netamente residencial y apacible en el sector norte, muy elegido por familias jóvenes con niños pequeños por la seguridad y tranquilidad de sus cul-de-sacs.",
    coords: [-34.3960, -58.6500]
  },
  "La Alameda": {
    name: "La Alameda",
    category: "norte",
    categoryLabel: "Junto al Club Nordelta",
    surfaceHa: 75,
    lotsCount: 340,
    launchYear: 2004,
    typicalLotSize: "650 a 900 m²",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "6 min a Acceso Norte",
    highlight: "Lago central de 7 ha y lindero a la sede central del Club",
    amenities: ["Lago de 7 ha", "Club House", "Tenis", "Fútbol", "Pileta", "Cercanía a Club Nordelta"],
    desc: "Ubicado en el sector norte, rodea un lago central de 7 hectáreas y tiene acceso inmediato a la sede deportiva principal del Club Nordelta.",
    coords: [-34.3920, -58.6430]
  },
  "Tipas": {
    name: "Tipas",
    category: "norte",
    categoryLabel: "Sector Norte Ágil",
    surfaceHa: 70,
    lotsCount: 370,
    launchYear: 2012,
    typicalLotSize: "600 a 850 m²",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "4 min a Acceso Norte (Ruta 27)",
    highlight: "Salida veloz hacia Benavídez y Ramal Escobar",
    amenities: ["Lago Central", "Club House", "Pileta", "Tenis", "Fútbol", "Parrilla"],
    desc: "Barrio moderno con lago central propio y rápido egreso hacia la Ruta 27 y el Complejo Villa Nueva. Muy consolidado con casas de arquitectura contemporánea.",
    coords: [-34.3910, -58.6570]
  },
  "Carpinchos": {
    name: "Carpinchos",
    category: "norte",
    categoryLabel: "Moderno con Lago de 16 ha",
    surfaceHa: 85,
    lotsCount: 440,
    launchYear: 2017,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Garita Benavídez / Remeros",
    commuteTime: "7 min a Accesos Norte y Este",
    highlight: "Enorme espejo de agua de 16 ha y club house contemporáneo",
    amenities: ["Lago 16 ha", "Club House de Vanguardia", "Pileta", "Tenis (4)", "Fútbol", "Playa"],
    desc: "Uno de los desarrollos más recientes y exitosos de Nordelta. Destaca por su gigantesco lago de 16 hectáreas donde se practican deportes sin motor y su club house de arquitectura minimalista.",
    coords: [-34.3980, -58.6280]
  },
  "Los Lagos": {
    name: "Los Lagos",
    category: "centro",
    categoryLabel: "Gran Espejo de Agua de 22 ha",
    surfaceHa: 95,
    lotsCount: 470,
    launchYear: 2009,
    typicalLotSize: "700 a 1.100 m²",
    exitGate: "Garita Benavídez / Bancalari",
    commuteTime: "7 min a Accesos",
    highlight: "Lago imponente de 22 hectáreas con costa para la mayoría de los lotes",
    amenities: ["Lago de 22 ha", "Club House", "Tenis Polvo de Ladrillo (4)", "Fútbol", "Pileta", "Muelle"],
    desc: "Reconocido por tener uno de los espejos de agua más grandes de toda la urbanización, brindando vistas abiertas y actividades náuticas en un entorno de gran categoría.",
    coords: [-34.4060, -58.6350]
  },
  "Los Puentes": {
    name: "Los Puentes",
    category: "centro",
    categoryLabel: "Lotes Premium sobre el Lago",
    surfaceHa: 65,
    lotsCount: 320,
    launchYear: 2018,
    typicalLotSize: "800 a 1.400 m²",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "6 min a Bancalari",
    highlight: "Barrio de alta gama con puentes que conectan islas internas",
    amenities: ["Lago Central", "Puentes Peatonales y Vehiculares", "Club House", "Tenis", "Fútbol"],
    desc: "Urbanización de alta gama donde la arquitectura de puentes interconecta islas residenciales dentro de una gran laguna. Máxima privacidad y diseño paisajístico de nivel internacional.",
    coords: [-34.4140, -58.6360]
  },
  "Portezuelo": {
    name: "Portezuelo",
    category: "condo",
    categoryLabel: "Condominios al Lago Mayor",
    surfaceHa: 50,
    lotsCount: "Edificios de Condominios",
    launchYear: 2001,
    typicalLotSize: "Departamentos 2 a 5 ambientes",
    exitGate: "Garita Bancalari / Remeros",
    commuteTime: "7 min a Panamericana",
    highlight: "Vistas panorámicas al Lago Central y cercanía a Bahía Grande",
    amenities: ["Costanera sobre Lago Central", "Amarras de Cortesía", "Canchas de Tenis", "Piletas Privadas", "Seguridad 24h"],
    desc: "El sector de condominios residenciales más consolidado de Nordelta. Edificios de baja altura con terrazas y parrillas propias que miran directamente a la inmensidad del Lago Central.",
    coords: [-34.4020, -58.6370]
  },
  "El Palmar": {
    name: "El Palmar",
    category: "condo",
    categoryLabel: "Townhouses frente a Colegios",
    surfaceHa: 45,
    lotsCount: "Townhouses & Casas",
    launchYear: 2007,
    typicalLotSize: "Casas apareadas y departamentos",
    exitGate: "Garita Bancalari (Lateral Oeste)",
    commuteTime: "3 min a Bancalari",
    highlight: "Ubicado exactamente frente al polo de colegios",
    amenities: ["Piscina Central", "Solárium", "Seguridad Integral", "Paseos Peatonales", "Cercanía a Colegios"],
    desc: "Complejo de condominios y townhouses ubicado estratégicamente frente a los colegios Northlands y Michael Ham. La mejor opción para familias que buscan practicidad sin el mantenimiento de un parque grande.",
    coords: [-34.4210, -58.6550]
  },
  "Sendero": {
    name: "Sendero",
    category: "condo",
    categoryLabel: "Departamentos junto al Shopping",
    surfaceHa: 40,
    lotsCount: "Condominios & Departamentos",
    launchYear: 2012,
    typicalLotSize: "Departamentos 1 a 4 ambientes",
    exitGate: "Garita Benavídez / Bancalari",
    commuteTime: "5 min a Accesos",
    highlight: "A 200 metros del Centro Comercial Nordelta y Sanatorio",
    amenities: ["Laguna Central", "Piletas", "Canchas de Tenis", "Fútbol", "Gimnasio", "Seguridad"],
    desc: "Complejo cerrado de condominios modernos con laguna propia y amenities completos. Su gran atractivo es la cercanía peatonal al Centro Comercial Nordelta y al Sanatorio Las Lomas.",
    coords: [-34.4060, -58.6520]
  },
  "Yoo Nordelta": {
    name: "Yoo Nordelta",
    category: "golf",
    categoryLabel: "Diseño Philippe Starck",
    surfaceHa: 25,
    lotsCount: "Residencias de Lujo",
    launchYear: 2010,
    typicalLotSize: "Suites y Departamentos Premium",
    exitGate: "Garita Benavídez (Lateral Norte)",
    commuteTime: "8 min a Acceso Norte",
    highlight: "Condominios de ultra lujo con diseño de autor sobre el campo de golf",
    amenities: ["Vistas al Golf 18 hoyos", "Piscina Infinity Climatizada", "Spa & Sauna", "Restaurante Exclusivo", "Concierge"],
    desc: "Complejo de condominios de ultra lujo concebido por el afamado diseñador internacional Philippe Starck. Ofrece servicios de hotelería 5 estrellas con vistas al campo de golf.",
    coords: [-34.4030, -58.6700]
  },
  "Bahía Grande": {
    name: "Bahía Grande",
    category: "nautico",
    categoryLabel: "Polo Gastronómico & Marina",
    surfaceHa: 35,
    lotsCount: "Hotelería, Marina y Gastronomía",
    launchYear: 2008,
    typicalLotSize: "Edificios y Locales Comerciales",
    exitGate: "Garita Remeros / Benavídez",
    commuteTime: "8 min a Camino Remeros",
    highlight: "Puerto de Nordelta, Hotel Wyndham y los mejores restaurantes",
    amenities: ["Marina con amarras de cortesía", "Hotel Wyndham", "Restaurantes de primer nivel", "Paseo costanero peatonal", "Seguridad"],
    desc: "El centro social y gastronómico nocturno de Nordelta. Cuenta con una marina náutica sobre el canal que conecta con el Río Luján, hoteles de nivel internacional y una variada oferta gastronómica frente al agua.",
    coords: [-34.4015, -58.6315]
  },
  "Centro Comercial": {
    name: "Centro Comercial Nordelta",
    category: "centro",
    categoryLabel: "Polo Comercial y de Salud",
    surfaceHa: 30,
    lotsCount: "140 Locales & Consultorios",
    launchYear: 2004,
    typicalLotSize: "Shopping a cielo abierto",
    exitGate: "Garita Benavídez / Bancalari",
    commuteTime: "Sobre Avenida de los Lagos",
    highlight: "Jumbo, Cines Atlas, Bancos, Sanatorio Las Lomas y Swiss Medical",
    amenities: ["Supermercado Jumbo", "Cines Atlas 3D", "Sanatorio Las Lomas", "Swiss Medical", "Bancos", "Gastronomía"],
    desc: "El corazón comercial de toda la ciudad pueblo. Ofrece todos los servicios bancarios, médicos, farmacias, cines y supermercados, siendo el punto neurálgico de compras de Nordelta y alrededores.",
    coords: [-34.4035, -58.6450]
  }
}

export default function NordeltaMasterplan() {
  const [selectedKey, setSelectedKey] = useState<string>("La Isla")
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'sur' | 'centro' | 'norte' | 'nautico' | 'golf' | 'condo'>('todos')
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewType, setViewType] = useState<'plano' | 'satelital'>('plano')

  // Refs para Leaflet satelital
  const leafletContainerRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // Filtrado reactivo de barrios
  const filteredBarrios = useMemo(() => {
    return Object.values(NORDELTA_BARRIOS).filter(b => {
      if (categoryFilter !== 'todos' && b.category !== categoryFilter) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchName = b.name.toLowerCase().includes(q)
        const matchCat = b.categoryLabel.toLowerCase().includes(q)
        const matchDesc = b.desc.toLowerCase().includes(q)
        if (!matchName && !matchCat && !matchDesc) return false
      }
      return true
    })
  }, [categoryFilter, searchQuery])

  const activeBarrio = NORDELTA_BARRIOS[selectedKey] || NORDELTA_BARRIOS["La Isla"]

  // Carga e inicialización de Leaflet para modo satelital
  useEffect(() => {
    if (viewType !== 'satelital') return

    let isMounted = true
    const initLeaflet = async () => {
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

        if (!isMounted || !leafletContainerRef.current) return
        const L = (window as any).L
        if (!L) return

        if (!leafletMapRef.current) {
          const map = L.map(leafletContainerRef.current, {
            center: [-34.410, -58.645],
            zoom: 14,
            zoomControl: true
          })

          // Capa Satélite de Esri
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: '&copy; Esri World Imagery'
          }).addTo(map)

          leafletMapRef.current = map

          // Dibujar balizas para cada barrio
          Object.values(NORDELTA_BARRIOS).forEach(b => {
            const marker = L.circleMarker(b.coords, {
              radius: 9,
              fillColor: '#38bdf8',
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9
            }).addTo(map)

            marker.bindTooltip(b.name, { permanent: false, direction: 'top' })
            marker.on('click', () => {
              setSelectedKey(b.name)
              map.flyTo(b.coords, 15, { duration: 0.6 })
            })
          })
        }

        setLeafletLoaded(true)
      } catch (err) {
        console.error('Error init Leaflet in NordeltaMasterplan:', err)
      }
    }

    initLeaflet()

    return () => {
      isMounted = false
    }
  }, [viewType])

  // Centrar en el barrio seleccionado en modo satelital
  useEffect(() => {
    if (viewType === 'satelital' && leafletMapRef.current && activeBarrio) {
      leafletMapRef.current.flyTo(activeBarrio.coords, 15, { duration: 0.6 })
    }
  }, [selectedKey, viewType, activeBarrio])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP TOOLBAR: BARRIOS MAPS STYLE */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
              <Compass size={22} />
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Nordelta Masterplan
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  BARRIOS MAPS
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Plano integral interactivo de los <strong className="text-slate-200">22 barrios y sectores</strong>, lagos, amarras y accesos viales.
              </p>
            </div>
          </div>
        </div>

        {/* Buscador Rápido y Selector de Modo */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Input de Búsqueda */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar barrio, golf, bahía..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Toggle de Modo: Plano Vectorial vs Satelital */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-white/10">
            <button
              onClick={() => setViewType('plano')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewType === 'plano'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Plano Vectorial</span>
            </button>
            <button
              onClick={() => setViewType('satelital')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewType === 'satelital'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Satelital HD</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. CHIPS DE FILTRO POR CATEGORÍA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { key: 'todos', label: 'Todos los Barrios', count: 22 },
          { key: 'centro', label: 'Lago Central & Tradicionales', count: 6 },
          { key: 'sur', label: 'Acceso Bancalari (Sur)', count: 4 },
          { key: 'nautico', label: 'Náuticos al Río', count: 3 },
          { key: 'golf', label: 'Golf & Exclusivos', count: 3 },
          { key: 'norte', label: 'Sector Norte', count: 4 },
          { key: 'condo', label: 'Condominios & Deptos', count: 3 }
        ].map(cat => {
          const active = categoryFilter === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
                active
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${active ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. CONTENEDOR PRINCIPAL: MAPA + FICHA TÉCNICA LATERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA MAPA (8 columnas) */}
        <div className="lg:col-span-8 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Header Superior del Mapa */}
          <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 px-1 gap-2">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-1.5 rounded bg-amber-500"></span> Av. de los Lagos (Troncal 8 km)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-1.5 rounded bg-cyan-400"></span> Lago Central (180 ha)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span> Garitas de Entrada
            </span>
            <span className="text-slate-500 text-[11px]">
              {filteredBarrios.length} barrios visibles
            </span>
          </div>

          {/* VISTA 1: PLANO VECTORIAL ESTILO BARRIOS MAPS */}
          {viewType === 'plano' && (
            <div className="w-full aspect-[4/3] max-h-[620px] relative">
              <svg viewBox="0 0 1020 740" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Gradiente de Agua Estilo Blueprint Náutico */}
                  <linearGradient id="bmWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85"/>
                    <stop offset="50%" stopColor="#0369a1" stopOpacity="0.95"/>
                    <stop offset="100%" stopColor="#075985" stopOpacity="1"/>
                  </linearGradient>

                  {/* Gradiente Perímetro Masterplan */}
                  <linearGradient id="bmPerimeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.7"/>
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95"/>
                  </linearGradient>

                  {/* Patrón de Loteo Fino (Blueprint Texture) */}
                  <pattern id="loteoPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8"/>
                  </pattern>
                </defs>

                {/* Fondo Base Cartográfico */}
                <rect x="0" y="0" width="1020" height="740" fill="#090d16" />

                {/* --- 1. LÍMITES REGIONALES Y VECINOS --- */}
                {/* Santa Bárbara (Oeste del Corredor Bancalari) */}
                <polygon points="10,670 100,670 90,380 10,400" fill="#1e293b" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                <ellipse cx="50" cy="530" rx="30" ry="70" fill="#0369a1" opacity="0.35" />
                <text x="25" y="520" fill="#94a3b8" fontSize="11" fontWeight="bold">SANTA</text>
                <text x="20" y="534" fill="#94a3b8" fontSize="11" fontWeight="bold">BÁRBARA</text>

                {/* Complejo Villa Nueva (Norte de Ruta 27) */}
                <polygon points="260,10 760,10 740,65 280,65" fill="#1e293b" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
                <text x="460" y="38" fill="#38bdf8" fontSize="12" fontWeight="900" letterSpacing="1">COMPLEJO VILLA NUEVA (EIDICO)</text>
                <text x="410" y="52" fill="#94a3b8" fontSize="10">Santa Teresa • Santa Clara • San Marco • San Isidro Labrador</text>

                {/* Perímetro Masterplan Nordelta (1.600 Hectáreas) */}
                <polygon points="160,680 210,690 520,700 750,560 840,360 810,150 640,90 280,75 150,210 120,510"
                         fill="url(#bmPerimeterGrad)" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6,4" />
                <rect x="160" y="80" width="670" height="610" fill="url(#loteoPattern)" />
                <text x="230" y="715" fill="#3b82f6" fontSize="11" fontWeight="bold" opacity="0.8">
                  LÍMITE MASTERPLAN NORDELTA (1.600 HECTÁREAS)
                </text>

                {/* --- 2. RÍO LUJÁN Y CANALES NAVEGABLES --- */}
                <path d="M 740,35 Q 840,95 890,190 T 980,310" 
                      fill="none" stroke="#0284c7" strokeWidth="26" strokeLinecap="round" opacity="0.8" />
                <text x="860" y="145" fill="#7dd3fc" fontSize="12" fontWeight="900" transform="rotate(50, 860, 145)">
                  RÍO LUJÁN (Navegable al Delta)
                </text>

                {/* Canal Náutico Mayor de Nordelta */}
                <path d="M 730,260 Q 780,270 820,240 T 890,195" 
                      fill="none" stroke="#0284c7" strokeWidth="16" strokeLinecap="round" opacity="0.9" />

                {/* --- 3. RED VIAL EXTERIOR (ARTERIAS LATERALES) --- */}
                {/* A. Corredor Bancalari (Lateral Oeste) */}
                <path d="M 115,730 L 115,480 Q 115,350 145,210 T 260,75" 
                      fill="none" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                <path d="M 115,730 L 115,480 Q 115,350 145,210 T 260,75" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <path d="M 115,730 L 115,480 Q 115,350 145,210 T 260,75" 
                      fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,5" />
                <text x="35" y="625" fill="#fbbf24" fontSize="11" fontWeight="900">CORREDOR BANCALARI</text>
                <text x="45" y="640" fill="#94a3b8" fontSize="10">↓ Hacia Panamericana Sur</text>

                {/* B. Ruta 27 (Lateral Norte y Este) */}
                <path d="M 250,75 L 630,85 Q 740,90 780,160 T 845,340 T 905,560" 
                      fill="none" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                <path d="M 250,75 L 630,85 Q 740,90 780,160 T 845,340 T 905,560" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <path d="M 250,75 L 630,85 Q 740,90 780,160 T 845,340 T 905,560" 
                      fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="7,5" />
                <text x="370" y="80" fill="#34d399" fontSize="11" fontWeight="900">RUTA 27 (LATERAL NORTE)</text>

                {/* C. Camino de los Remeros (Lateral Este) */}
                <path d="M 845,340 Q 875,450 895,590 T 925,725" 
                      fill="none" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                <path d="M 845,340 Q 875,450 895,590 T 925,725" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <path d="M 845,340 Q 875,450 895,590 T 925,725" 
                      fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,4" />
                <text x="825" y="450" fill="#7dd3fc" fontSize="11" fontWeight="900">CAMINO DE LOS REMEROS</text>

                {/* --- 4. RED VIAL INTERNA DE NORDELTA --- */}
                {/* Avenida de los Lagos (Troncal de 8 km) */}
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 605,90" 
                      fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 605,90" 
                      fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 605,90" 
                      fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="7,5" />
                <text x="415" y="420" fill="#fef08a" fontSize="12" fontWeight="900" transform="rotate(-54, 415, 420)">
                  Av. de los Lagos (Troncal 8 km)
                </text>

                {/* Ramal Avenida del Golf */}
                <path d="M 400,430 Q 320,380 290,260 T 320,130" 
                      fill="none" stroke="#f59e0b" strokeWidth="3.5" opacity="0.8" />
                <text x="290" y="320" fill="#fde68a" fontSize="10" fontWeight="bold" transform="rotate(-75, 290, 320)">
                  Av. del Golf
                </text>

                {/* Ramal Avenida de la Bahía */}
                <path d="M 470,290 Q 570,305 680,315 T 780,325" 
                      fill="none" stroke="#f59e0b" strokeWidth="3.5" opacity="0.8" />
                <text x="610" y="300" fill="#fde68a" fontSize="10" fontWeight="bold">
                  Av. de la Bahía
                </text>

                {/* --- 5. ESPEJOS DE AGUA DE NORDELTA --- */}
                {/* LAGO CENTRAL (180 HA) */}
                <path d="M 370,510 C 350,440 400,390 380,320 C 370,270 450,230 490,250 C 550,280 530,360 480,400 C 450,420 450,490 400,520 Z" 
                      fill="url(#bmWaterGrad)" filter="drop-shadow(0 0 12px rgba(14, 165, 233, 0.5))" />
                <text x="420" y="350" fill="#e0f2fe" fontSize="14" fontWeight="900" letterSpacing="1">LAGO CENTRAL</text>
                <text x="445" y="366" fill="#bae6fd" fontSize="12" fontWeight="bold">(180 ha)</text>

                {/* Lagunas Internas de los Barrios */}
                <ellipse cx="280" cy="590" rx="45" ry="30" fill="url(#bmWaterGrad)" />
                <ellipse cx="550" cy="420" rx="40" ry="24" fill="url(#bmWaterGrad)" />
                <ellipse cx="660" cy="210" rx="45" ry="26" fill="url(#bmWaterGrad)" />

                {/* --- 6. GARITAS DE ACCESO VEHICULAR --- */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Castaños')}>
                  <circle cx="125" cy="540" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  <rect x="55" y="500" width="135" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="62" y="516" fill="#fca5a5" fontSize="10" fontWeight="900">GARITA BANCALARI (SUR)</text>
                </g>

                <g className="cursor-pointer" onClick={() => setSelectedKey('Tipas')}>
                  <circle cx="605" cy="90" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  <rect x="530" y="58" width="145" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="537" y="74" fill="#fca5a5" fontSize="10" fontWeight="900">GARITA BENAVÍDEZ (NORTE)</text>
                </g>

                <g className="cursor-pointer" onClick={() => setSelectedKey('El Yacht')}>
                  <circle cx="845" cy="340" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                  <rect x="770" y="355" width="135" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="777" y="371" fill="#fca5a5" fontSize="10" fontWeight="900">GARITA REMEROS (ESTE)</text>
                </g>

                {/* --- 7. POLOS URBANOS --- */}
                {/* Cancha de Golf Nicklaus */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('El Golf')}>
                  <path d="M 240,170 C 280,140 370,160 350,220 C 320,250 240,230 240,170 Z" 
                        fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.75" />
                  <text x="260" y="195" fill="#6ee7b7" fontSize="11" fontWeight="900">GOLF CLUB (18 Hoyos)</text>
                  <text x="265" y="210" fill="#a7f3d0" fontSize="10">Jack Nicklaus Design</text>
                </g>

                {/* Centro Comercial & Sanatorio */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Centro Comercial')}>
                  <rect x="670" y="360" width="90" height="46" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                  <text x="678" y="378" fill="#c7d2fe" fontSize="11" fontWeight="900">CENTRO COMERCIAL</text>
                  <text x="678" y="392" fill="#a5b4fc" fontSize="10">Jumbo, Cines, Bancos</text>
                  <text x="678" y="402" fill="#f472b6" fontSize="9">Sanatorio Las Lomas</text>
                </g>

                {/* Bahía Grande & Wyndham */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Bahía Grande')}>
                  <rect x="735" y="295" width="85" height="42" rx="8" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
                  <text x="745" y="313" fill="#bbf7d0" fontSize="11" fontWeight="900">BAHÍA GRANDE</text>
                  <text x="745" y="327" fill="#86efac" fontSize="10">Marina & Gastronomía</text>
                  <text x="745" y="335" fill="#a7f3d0" fontSize="9">Hotel Wyndham</text>
                </g>

                {/* Polo Educativo (Colegios) */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('El Palmar')}>
                  <rect x="360" y="565" width="80" height="34" rx="6" fill="#701a75" stroke="#f472b6" strokeWidth="1.5" />
                  <text x="368" y="580" fill="#fbcfe8" fontSize="11" fontWeight="bold">COLEGIOS</text>
                  <text x="368" y="593" fill="#f472b6" fontSize="10">Northlands, Michael Ham</text>
                </g>

                {/* --- 8. POLÍGONOS Y NODOS DE CADA BARRIO --- */}

                {/* LA ISLA */}
                <g className="cursor-pointer group" onClick={() => setSelectedKey('La Isla')}>
                  <rect x="385" y="325" width="70" height="36" rx="8" fill="#831843" stroke={selectedKey === 'La Isla' ? '#38bdf8' : '#f472b6'} strokeWidth={selectedKey === 'La Isla' ? 3.5 : 2} />
                  <text x="398" y="343" fill="#ffffff" fontSize="12" fontWeight="900">La Isla</text>
                  <text x="395" y="355" fill="#fbcfe8" fontSize="10">Exclusivo 360°</text>
                </g>

                {/* LOS CASTORES */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Castores')}>
                  <rect x="250" y="375" width="90" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Castores' ? '#38bdf8' : '#38bdf8'} strokeWidth={selectedKey === 'Los Castores' ? 3.5 : 2} />
                  <text x="262" y="392" fill="#ffffff" fontSize="12" fontWeight="900">Los Castores</text>
                  <text x="262" y="405" fill="#bae6fd" fontSize="10">Lago Central</text>
                </g>

                {/* CASTAÑOS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Castaños')}>
                  <rect x="180" y="550" width="78" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Castaños' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Castaños' ? 3.5 : 2} />
                  <text x="192" y="567" fill="#ffffff" fontSize="12" fontWeight="900">Castaños</text>
                  <text x="190" y="580" fill="#93c5fd" fontSize="10">Entrada Rápida</text>
                </g>

                {/* LAS GLORIETAS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Las Glorietas')}>
                  <rect x="185" y="465" width="88" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Las Glorietas' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Las Glorietas' ? 3.5 : 2} />
                  <text x="196" y="482" fill="#ffffff" fontSize="12" fontWeight="900">Las Glorietas</text>
                  <text x="196" y="495" fill="#93c5fd" fontSize="10">Muy Arbolado</text>
                </g>

                {/* LOS ALISOS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Alisos')}>
                  <rect x="300" y="605" width="78" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Alisos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Alisos' ? 3.5 : 2} />
                  <text x="310" y="622" fill="#ffffff" fontSize="12" fontWeight="900">Los Alisos</text>
                  <text x="310" y="635" fill="#93c5fd" fontSize="10">Lago 10 ha</text>
                </g>

                {/* EL PALMAR */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('El Palmar')}>
                  <rect x="280" y="535" width="70" height="34" rx="7" fill="#312e81" stroke={selectedKey === 'El Palmar' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'El Palmar' ? 3.5 : 1.8} />
                  <text x="288" y="551" fill="#ffffff" fontSize="11" fontWeight="bold">El Palmar</text>
                  <text x="288" y="563" fill="#c7d2fe" fontSize="10">Townhouses</text>
                </g>

                {/* BARRANCAS DEL LAGO */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Barrancas del Lago')}>
                  <rect x="500" y="460" width="100" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Barrancas del Lago' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Barrancas del Lago' ? 3.5 : 2} />
                  <text x="508" y="477" fill="#ffffff" fontSize="11" fontWeight="900">Barrancas Lago</text>
                  <text x="508" y="489" fill="#93c5fd" fontSize="10">Estilo Colonial</text>
                </g>

                {/* PORTEZUELO */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Portezuelo')}>
                  <rect x="550" y="515" width="78" height="34" rx="7" fill="#312e81" stroke={selectedKey === 'Portezuelo' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'Portezuelo' ? 3.5 : 1.8} />
                  <text x="558" y="531" fill="#ffffff" fontSize="11" fontWeight="bold">Portezuelo</text>
                  <text x="558" y="543" fill="#c7d2fe" fontSize="10">Condominios</text>
                </g>

                {/* LAS CALETAS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Las Caletas')}>
                  <rect x="620" y="445" width="80" height="36" rx="8" fill="#0f766e" stroke={selectedKey === 'Las Caletas' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'Las Caletas' ? 3.5 : 2} />
                  <text x="628" y="462" fill="#ffffff" fontSize="11" fontWeight="900">Las Caletas</text>
                  <text x="628" y="474" fill="#99f6e4" fontSize="10">Amarras Propias</text>
                </g>

                {/* LOS SAUCES */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Sauces')}>
                  <rect x="370" y="220" width="78" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Sauces' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Sauces' ? 3.5 : 2} />
                  <text x="380" y="237" fill="#ffffff" fontSize="12" fontWeight="900">Los Sauces</text>
                  <text x="380" y="249" fill="#93c5fd" fontSize="10">Junto a Centro</text>
                </g>

                {/* LOS TILOS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Tilos')}>
                  <rect x="460" y="190" width="70" height="34" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Los Tilos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Tilos' ? 3.5 : 1.8} />
                  <text x="470" y="206" fill="#ffffff" fontSize="11" fontWeight="bold">Los Tilos</text>
                  <text x="470" y="218" fill="#93c5fd" fontSize="10">Familiar</text>
                </g>

                {/* LA ALAMEDA */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('La Alameda')}>
                  <rect x="525" y="145" width="78" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'La Alameda' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'La Alameda' ? 3.5 : 2} />
                  <text x="533" y="162" fill="#ffffff" fontSize="11" fontWeight="900">La Alameda</text>
                  <text x="533" y="174" fill="#93c5fd" fontSize="10">Lago 7 ha</text>
                </g>

                {/* TIPAS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Tipas')}>
                  <rect x="435" y="140" width="70" height="34" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Tipas' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Tipas' ? 3.5 : 1.8} />
                  <text x="449" y="156" fill="#ffffff" fontSize="11" fontWeight="bold">Tipas</text>
                  <text x="444" y="168" fill="#93c5fd" fontSize="10">Acceso Norte</text>
                </g>

                {/* EL GOLF */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('El Golf')}>
                  <rect x="290" y="115" width="75" height="36" rx="8" fill="#065f46" stroke={selectedKey === 'El Golf' ? '#38bdf8' : '#34d399'} strokeWidth={selectedKey === 'El Golf' ? 3.5 : 2} />
                  <text x="306" y="132" fill="#ffffff" fontSize="12" fontWeight="900">El Golf</text>
                  <text x="300" y="145" fill="#a7f3d0" fontSize="10">Nicklaus 18H</text>
                </g>

                {/* CARPINCHOS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Carpinchos')}>
                  <rect x="625" y="160" width="80" height="36" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Carpinchos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Carpinchos' ? 3.5 : 2} />
                  <text x="635" y="177" fill="#ffffff" fontSize="11" fontWeight="900">Carpinchos</text>
                  <text x="635" y="190" fill="#93c5fd" fontSize="10">Lago 16 ha</text>
                </g>

                {/* EL YACHT */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('El Yacht')}>
                  <rect x="720" y="180" width="75" height="36" rx="8" fill="#0f766e" stroke={selectedKey === 'El Yacht' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'El Yacht' ? 3.5 : 2} />
                  <text x="734" y="197" fill="#ffffff" fontSize="12" fontWeight="900">El Yacht</text>
                  <text x="728" y="210" fill="#99f6e4" fontSize="10">Al Río Luján</text>
                </g>

                {/* LOS LAGOS */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Lagos')}>
                  <rect x="560" y="380" width="78" height="34" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Los Lagos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Lagos' ? 3.5 : 1.8} />
                  <text x="569" y="396" fill="#ffffff" fontSize="11" fontWeight="900">Los Lagos</text>
                  <text x="569" y="408" fill="#93c5fd" fontSize="10">Lago 22 ha</text>
                </g>

                {/* LOS PUENTES */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Los Puentes')}>
                  <rect x="365" y="470" width="78" height="34" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Los Puentes' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Puentes' ? 3.5 : 1.8} />
                  <text x="373" y="486" fill="#ffffff" fontSize="11" fontWeight="900">Los Puentes</text>
                  <text x="373" y="498" fill="#93c5fd" fontSize="10">Alta Gama</text>
                </g>

                {/* SENDERO */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Sendero')}>
                  <rect x="635" y="495" width="68" height="32" rx="6" fill="#312e81" stroke={selectedKey === 'Sendero' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'Sendero' ? 3.5 : 1.5} />
                  <text x="645" y="510" fill="#ffffff" fontSize="10" fontWeight="bold">Sendero</text>
                  <text x="643" y="521" fill="#c7d2fe" fontSize="9">Condominios</text>
                </g>

                {/* YOO NORDELTA */}
                <g className="cursor-pointer" onClick={() => setSelectedKey('Yoo Nordelta')}>
                  <rect x="235" y="240" width="80" height="34" rx="7" fill="#065f46" stroke={selectedKey === 'Yoo Nordelta' ? '#38bdf8' : '#34d399'} strokeWidth={selectedKey === 'Yoo Nordelta' ? 3.5 : 1.8} />
                  <text x="245" y="255" fill="#ffffff" fontSize="11" fontWeight="bold">Yoo Nordelta</text>
                  <text x="245" y="267" fill="#a7f3d0" fontSize="9">Ph. Starck</text>
                </g>

              </svg>
            </div>
          )}

          {/* VISTA 2: MAPA SATELITAL HD CON LEAFLET */}
          {viewType === 'satelital' && (
            <div className="w-full h-[580px] rounded-xl overflow-hidden relative">
              <div ref={leafletContainerRef} className="w-full h-full" />
              {!leafletLoaded && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

        </div>

        {/* COLUMNA FICHA TÉCNICA (4 columnas) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5">
          
          {/* Cabecera del Barrio */}
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                {activeBarrio.categoryLabel}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Lanzamiento: {activeBarrio.launchYear}
              </span>
            </div>

            <h4 className="text-2xl md:text-3xl font-black text-white mt-3">
              {activeBarrio.name}
            </h4>
            <p className="text-xs font-bold text-cyan-400 mt-1">
              {activeBarrio.highlight}
            </p>
          </div>

          {/* Cuadrícula de Métricas de Loteo */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Superficie</span>
              <span className="text-base font-black font-mono text-white">{activeBarrio.surfaceHa} ha</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Lotes</span>
              <span className="text-base font-black font-mono text-white">{activeBarrio.lotsCount}</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3 col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Metraje Típico</span>
              <span className="text-sm font-bold text-slate-200">{activeBarrio.typicalLotSize}</span>
            </div>
          </div>

          {/* Conexión Vial y Tiempos */}
          <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Navigation size={13} className="text-amber-400" /> Egreso Principal:
              </span>
              <span className="font-bold text-slate-200 text-right">{activeBarrio.exitGate}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Clock size={13} className="text-emerald-400" /> Demora a Panamericana:
              </span>
              <span className="font-mono font-black text-emerald-400">{activeBarrio.commuteTime}</span>
            </div>
          </div>

          {/* Amenities & Equipamiento */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 flex items-center gap-1.5">
              <Shield size={13} className="text-cyan-400" /> Amenities y Servicios
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeBarrio.amenities.map(am => (
                <span
                  key={am}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300"
                >
                  {am}
                </span>
              ))}
            </div>
          </div>

          {/* Reseña del Barrio */}
          <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="text-slate-400 font-bold block mb-1">Radiografía del Barrio:</span>
            {activeBarrio.desc}
          </div>

        </div>

      </div>

    </div>
  )
}
