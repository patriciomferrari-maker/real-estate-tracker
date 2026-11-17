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
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

export interface MasterplanZone {
  name: string
  type: 'nordelta' | 'vecino'
  categoryLabel: string
  badgeText: 'N' | 'Z'
  surfaceHa: number
  lotsCount: number | string
  launchYear: number | string
  typicalLotSize: string
  exitGate: string
  commuteTime: string
  highlight: string
  amenities: string[]
  desc: string
  center: [number, number]
  polygon: [number, number][]
}

export const MASTERPLAN_DATA: Record<string, MasterplanZone> = {
  // ================= NORDELTA (BADGE N - VERDE/TEAL) =================
  "Los Alisos": {
    name: "Los Alisos",
    type: "nordelta",
    categoryLabel: "Sector Noroeste • Lago 10 ha",
    badgeText: "N",
    surfaceHa: 95,
    lotsCount: 520,
    launchYear: 2008,
    typicalLotSize: "650 a 950 m²",
    exitGate: "Av. de los Lagos hacia Benavídez / Bancalari",
    commuteTime: "5 min a salida",
    highlight: "Imponente lago central de 10 ha para kayak y windsurf",
    amenities: ["Lago 10 ha", "Club House", "Pileta Semiolímpica", "Tenis (4 canchas)", "Fútbol", "Restaurante"],
    desc: "Ubicado en el cuadrante noroeste de Nordelta, al oeste del Centro Comercial. Se organiza en torno a un gran lago de 10 hectáreas con intensa vida náutica deportiva a remo y vela.",
    center: [-34.4065, -58.6565],
    polygon: [
      [-34.4015, -58.6635],
      [-34.4035, -58.6500],
      [-34.4085, -58.6490],
      [-34.4115, -58.6570],
      [-34.4095, -58.6650]
    ]
  },
  "Los Sauces": {
    name: "Los Sauces",
    type: "nordelta",
    categoryLabel: "Sector Norte • Centro Cívico",
    badgeText: "N",
    surfaceHa: 70,
    lotsCount: 380,
    launchYear: 2001,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Av. de los Lagos / Garita Benavídez",
    commuteTime: "4 min a salida Norte",
    highlight: "Se puede ir caminando al Centro Comercial, Cines y Sanatorio",
    amenities: ["2 Lagos Internos", "Club House", "Tenis", "Fútbol", "Plazas"],
    desc: "Ubicado estratégicamente al sur inmediato del Centro Comercial Nordelta. Cuenta con dos lagos internos y es de los barrios con mayor conectividad peatonal a bancos, cines y servicios médicos.",
    center: [-34.4045, -58.6480],
    polygon: [
      [-34.4020, -58.6515],
      [-34.4015, -58.6435],
      [-34.4075, -58.6440],
      [-34.4080, -58.6515]
    ]
  },
  "La Alameda": {
    name: "La Alameda",
    type: "nordelta",
    categoryLabel: "Sector Oeste • Lago 7 ha",
    badgeText: "N",
    surfaceHa: 75,
    lotsCount: 340,
    launchYear: 2004,
    typicalLotSize: "650 a 900 m²",
    exitGate: "Av. de los Lagos",
    commuteTime: "6 min a salida",
    highlight: "Barrio consolidado junto a la sede deportiva de Club Nordelta",
    amenities: ["Lago Central 7 ha", "Club House", "Tenis", "Fútbol", "Pileta"],
    desc: "Situado sobre el lateral oeste de Nordelta, junto al ramal de Av. de los Lagos. Rodea un lago de 7 hectáreas con calles tranquilas en cul-de-sac y excelente arboleda crecida.",
    center: [-34.4125, -58.6675],
    polygon: [
      [-34.4090, -58.6685],
      [-34.4105, -58.6630],
      [-34.4155, -58.6645],
      [-34.4145, -58.6710]
    ]
  },
  "Castores": {
    name: "Castores",
    type: "nordelta",
    categoryLabel: "Corazón al Lago Central",
    badgeText: "N",
    surfaceHa: 135,
    lotsCount: 560,
    launchYear: 2000,
    typicalLotSize: "900 a 1.600 m²",
    exitGate: "Av. de los Lagos / Bancalari",
    commuteTime: "6 min a Bancalari",
    highlight: "El barrio tradicional más importante con mayor costa sobre el Lago Central",
    amenities: ["Lago Central", "Club House con Restaurante", "Tenis Polvo de Ladrillo (6)", "Fútbol 11", "Playón Deportivo", "Muelle Náutico"],
    desc: "El corazón emblemático de Nordelta. Casi la totalidad de sus lotes dan al Lago Central de 180 ha o a canales internos navegables. Es el barrio con mayor espíritu social y deportivo.",
    center: [-34.4165, -58.6565],
    polygon: [
      [-34.4105, -58.6630],
      [-34.4110, -58.6530],
      [-34.4180, -58.6515],
      [-34.4225, -58.6560],
      [-34.4215, -58.6645],
      [-34.4150, -58.6640]
    ]
  },
  "Las Glorietas": {
    name: "Las Glorietas",
    type: "nordelta",
    categoryLabel: "Fundacional y Arbolado",
    badgeText: "N",
    surfaceHa: 80,
    lotsCount: 410,
    launchYear: 1999,
    typicalLotSize: "600 a 1.000 m²",
    exitGate: "Av. de los Lagos / Bancalari",
    commuteTime: "4 min a Bancalari",
    highlight: "Vegetación frondosa con 25 años de crecimiento y cercanía a colegios",
    amenities: ["Costa sobre Lago Central", "Lagunas Internas", "Club House", "Tenis", "Fútbol", "Plazas"],
    desc: "Primer barrio fundado en Nordelta. Su arboleda añosa y consolidada le confiere una identidad única. Muy próximo a los colegios Northlands y Michael Ham.",
    center: [-34.4230, -58.6620],
    polygon: [
      [-34.4200, -58.6675],
      [-34.4215, -58.6590],
      [-34.4265, -58.6595],
      [-34.4260, -58.6675]
    ]
  },
  "Barrancas del Lago": {
    name: "Barrancas del Lago",
    type: "nordelta",
    categoryLabel: "Estilo Colonial Mediterráneo",
    badgeText: "N",
    surfaceHa: 85,
    lotsCount: 440,
    launchYear: 2001,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Av. de los Lagos / Bancalari",
    commuteTime: "4 min a Bancalari",
    highlight: "Casas homogéneas de tejas coloniales que rodean un lago de 8 ha",
    amenities: ["Lago de 8 ha", "Club House", "Tenis Polvo de Ladrillo", "Pileta", "Fútbol", "Plazas"],
    desc: "Ubicado al sur de Las Glorietas sobre la Avenida de los Lagos. Destaca por su uniformidad de diseño estilo mediterráneo y su prestigiosa academia de tenis.",
    center: [-34.4275, -58.6565],
    polygon: [
      [-34.4255, -58.6595],
      [-34.4265, -58.6525],
      [-34.4310, -58.6540],
      [-34.4300, -58.6605]
    ]
  },
  "La Isla": {
    name: "La Isla",
    type: "nordelta",
    categoryLabel: "Península Exclusiva 360°",
    badgeText: "N",
    surfaceHa: 110,
    lotsCount: 110,
    launchYear: 2000,
    typicalLotSize: "1.000 a 5.000 m²",
    exitGate: "Av. de los Lagos / Bancalari",
    commuteTime: "6 min a Bancalari",
    highlight: "El barrio más exclusivo y cotizado de toda la ciudad pueblo",
    amenities: ["Costas privadas", "Lago Central 360°", "Club House", "Tenis", "Seguridad Reforzada"],
    desc: "Ubicado en una península natural dentro del Lago Central de 180 ha, entre Castores y El Golf. Sus 110 lotes de gran superficie albergan algunas de las residencias más espectaculares de Argentina.",
    center: [-34.4190, -58.6475],
    polygon: [
      [-34.4160, -58.6505],
      [-34.4170, -58.6440],
      [-34.4230, -58.6445],
      [-34.4225, -58.6515]
    ]
  },
  "Los Puentes": {
    name: "Los Puentes",
    type: "nordelta",
    categoryLabel: "Alta Gama sobre el Lago",
    badgeText: "N",
    surfaceHa: 65,
    lotsCount: 320,
    launchYear: 2018,
    typicalLotSize: "800 a 1.400 m²",
    exitGate: "Av. de los Lagos / Bancalari",
    commuteTime: "3 min a Bancalari",
    highlight: "Islas residenciales unidas por puentes de diseño sobre el lago",
    amenities: ["Lago Central", "Puentes Peatonales y Vehiculares", "Club House", "Tenis", "Fútbol"],
    desc: "Ubicado al sur de La Isla, entre la Avenida de los Lagos y la Avenida del Golf. Diseñado con puentes arquitectónicos que conectan islas privadas dentro de la laguna.",
    center: [-34.4270, -58.6465],
    polygon: [
      [-34.4240, -58.6510],
      [-34.4235, -58.6425],
      [-34.4315, -58.6430],
      [-34.4320, -58.6500]
    ]
  },
  "Castaños": {
    name: "Castaños",
    type: "nordelta",
    categoryLabel: "Acceso Inmediato Bancalari",
    badgeText: "N",
    surfaceHa: 75,
    lotsCount: 450,
    launchYear: 2014,
    typicalLotSize: "500 a 850 m²",
    exitGate: "Garita Bancalari (Sur)",
    commuteTime: "1 min a garita Bancalari",
    highlight: "Salida directa sin tráfico interno por Avenida Troncal",
    amenities: ["Lago Propio", "Club House con Playa de Arena", "Pileta", "Tenis (4)", "Cancha de Fútbol", "SUM"],
    desc: "Ubicado a metros de la garita de ingreso sur (Bancalari). Permite ingresar y salir de Nordelta de inmediato sin transitar los kilómetros de la Avenida de los Lagos.",
    center: [-34.4365, -58.6435],
    polygon: [
      [-34.4325, -58.6490],
      [-34.4325, -58.6385],
      [-34.4410, -58.6395],
      [-34.4415, -58.6480]
    ]
  },
  "El Golf": {
    name: "El Golf",
    type: "nordelta",
    categoryLabel: "Campo 18 Hoyos Jack Nicklaus",
    badgeText: "N",
    surfaceHa: 140,
    lotsCount: 420,
    launchYear: 2006,
    typicalLotSize: "1.200 a 2.000 m²",
    exitGate: "Av. del Golf / Garita Benavídez",
    commuteTime: "7 min a salida Norte",
    highlight: "Lotes con fondos abiertos a los fairways del campo de golf PGA",
    amenities: ["Cancha de Golf 18 Hoyos PGA", "Club House del Golf", "Restaurante Gourmet", "Tenis", "Pileta", "Gimnasio"],
    desc: "Rodea el prestigioso campo de campeonato de golf de 18 hoyos par 72 diseñado por Jack Nicklaus. Sus parcelas de dimensiones generosas disfrutan de amplias vistas al green y lagos.",
    center: [-34.4150, -58.6360],
    polygon: [
      [-34.4095, -58.6425],
      [-34.4070, -58.6315],
      [-34.4215, -58.6310],
      [-34.4245, -58.6405]
    ]
  },
  "Islas del Golf": {
    name: "Islas del Golf",
    type: "nordelta",
    categoryLabel: "Condominios & Lotes Náuticos",
    badgeText: "N",
    surfaceHa: 45,
    lotsCount: 220,
    launchYear: 2012,
    typicalLotSize: "Departamentos y Lotes al Agua",
    exitGate: "Av. del Golf",
    commuteTime: "7 min a salida Norte",
    highlight: "Penínsulas con vista combinada al golf y a los brazos del lago",
    amenities: ["Vistas al Golf", "Brazo de Laguna", "Club House", "Pileta", "Seguridad"],
    desc: "Ubicado al este inmediato del campo de golf, con lotes y condominios ubicados sobre dedos de tierra que entran en la laguna.",
    center: [-34.4140, -58.6295],
    polygon: [
      [-34.4110, -58.6320],
      [-34.4100, -58.6255],
      [-34.4175, -58.6265],
      [-34.4180, -58.6320]
    ]
  },
  "Las Caletas": {
    name: "Las Caletas",
    type: "nordelta",
    categoryLabel: "Náutico con Amarras",
    badgeText: "N",
    surfaceHa: 45,
    lotsCount: 180,
    launchYear: 2002,
    typicalLotSize: "800 a 1.200 m²",
    exitGate: "Ruta 27 / Garita Remeros",
    commuteTime: "5 min a salida",
    highlight: "Amarras privadas con salida directa por canal mayor al Río Luján",
    amenities: ["Amarras Privadas", "Canal Mayor", "Club House", "Tenis", "Plazas"],
    desc: "Barrio náutico boutique en el extremo norte de Nordelta, conectado al canal que desemboca en el Río Luján.",
    center: [-34.3985, -58.6425],
    polygon: [
      [-34.3955, -58.6465],
      [-34.3945, -58.6390],
      [-34.4015, -58.6385],
      [-34.4020, -58.6455]
    ]
  },
  "Carpinchos": {
    name: "Carpinchos",
    type: "nordelta",
    categoryLabel: "Moderno con Lago de 16 ha",
    badgeText: "N",
    surfaceHa: 85,
    lotsCount: 440,
    launchYear: 2017,
    typicalLotSize: "600 a 900 m²",
    exitGate: "Av. del Golf / Garita Bancalari o Remeros",
    commuteTime: "6 min a salida",
    highlight: "Enorme espejo de agua de 16 ha y arquitectura contemporánea",
    amenities: ["Lago 16 ha", "Club House Minimalista", "Pileta", "Tenis (4)", "Fútbol", "Playa"],
    desc: "Uno de los desarrollos más codiciados en el cuadrante sureste de Nordelta, lindero a Barbarita y Santa Bárbara. Su lago central de 16 ha es epicentro de actividades náuticas.",
    center: [-34.4320, -58.6315],
    polygon: [
      [-34.4285, -58.6365],
      [-34.4265, -58.6275],
      [-34.4355, -58.6270],
      [-34.4365, -58.6345]
    ]
  },

  // ================= ZONAS Y BARRIOS VECINOS (BADGE Z - NARANJA/TERRACOTA) =================
  "Santa Barbara": {
    name: "Santa Barbara",
    type: "vecino",
    categoryLabel: "Gran Urbanización al Sur • 232 ha",
    badgeText: "Z",
    surfaceHa: 232,
    lotsCount: 1400,
    launchYear: 1998,
    typicalLotSize: "800 a 1.200 m²",
    exitGate: "Corredor Bancalari (Altura 3900) y Cam. Remeros",
    commuteTime: "Salida directa a Panamericana",
    highlight: "Laguna de 60 hectáreas con 4 islas y puentes vehiculares",
    amenities: ["Laguna 60 ha", "4 Islas", "Puentes", "Club House", "Tenis", "Fútbol", "Paseos Peatonales"],
    desc: "Ubicado exactamente al SUR de Nordelta, entre el Corredor Bancalari y el Camino de los Remeros. Cuenta con una espectacular laguna de 60 hectáreas donde las islas se comunican por puentes vehiculares.",
    center: [-34.4440, -58.6220],
    polygon: [
      [-34.4365, -58.6265],
      [-34.4335, -58.6185],
      [-34.4490, -58.6110],
      [-34.4535, -58.6235],
      [-34.4455, -58.6285]
    ]
  },
  "Barrio Cerrado Barbarita": {
    name: "Barrio Cerrado Barbarita",
    type: "vecino",
    categoryLabel: "Barrio Vecino al Este de Nordelta",
    badgeText: "Z",
    surfaceHa: 50,
    lotsCount: 280,
    launchYear: 2010,
    typicalLotSize: "600 a 850 m²",
    exitGate: "Camino de los Remeros / Bancalari",
    commuteTime: "5 min a salida",
    highlight: "Barrio cerrado con laguna central ubicado al norte de Santa Bárbara",
    amenities: ["Laguna Central", "Club House", "Tenis", "Fútbol", "Seguridad 24h"],
    desc: "Ubicado justo al norte de Santa Bárbara y al este de Carpinchos. Posee laguna propia y salida rápida hacia Camino de los Remeros y Corredor Bancalari.",
    center: [-34.4270, -58.6225],
    polygon: [
      [-34.4235, -58.6260],
      [-34.4225, -58.6180],
      [-34.4295, -58.6165],
      [-34.4315, -58.6255]
    ]
  },
  "Santa María de Tigre": {
    name: "Santa María de Tigre",
    type: "vecino",
    categoryLabel: "Barrio Náutico al Noreste",
    badgeText: "Z",
    surfaceHa: 130,
    lotsCount: 650,
    launchYear: 1997,
    typicalLotSize: "800 a 1.200 m²",
    exitGate: "Ruta 27 hacia Tigre Centro",
    commuteTime: "Salida directa a Ruta 27",
    highlight: "Emblemático barrio náutico con salida al Río Luján",
    amenities: ["Canal Navegable al Río", "Marina", "Club House", "Tenis", "Fútbol", "Capilla"],
    desc: "Ubicado al noreste de Nordelta, sobre la Ruta 27. Sus canales comunican con el Río Luján, permitiendo la navegación directa hacia el Delta del Paraná.",
    center: [-34.3980, -58.6240],
    polygon: [
      [-34.3930, -58.6315],
      [-34.3910, -58.6235],
      [-34.4020, -58.6190],
      [-34.4040, -58.6275]
    ]
  },
  "Barrio Cerrado Altamira": {
    name: "Barrio Cerrado Altamira",
    type: "vecino",
    categoryLabel: "Barrio Vecino al Norte de El Golf",
    badgeText: "Z",
    surfaceHa: 45,
    lotsCount: 220,
    launchYear: 2002,
    typicalLotSize: "700 a 1.000 m²",
    exitGate: "Ruta 27 / Remeros Plaza",
    commuteTime: "3 min a Ruta 27",
    highlight: "Barrio arbolado con laguna cerca del centro comercial Remeros Plaza",
    amenities: ["Laguna Central", "Club House", "Tenis", "Fútbol", "Plaza"],
    desc: "Ubicado al norte del campo de golf de Nordelta, lindero a la Ruta 27. Muy buscado por su cercanía al centro comercial Remeros Plaza.",
    center: [-34.4065, -58.6305],
    polygon: [
      [-34.4040, -58.6345],
      [-34.4025, -58.6285],
      [-34.4085, -58.6265],
      [-34.4095, -58.6335]
    ]
  },
  "San Agustin": {
    name: "San Agustin",
    type: "vecino",
    categoryLabel: "Complejo Villa Nueva (Noroeste)",
    badgeText: "Z",
    surfaceHa: 65,
    lotsCount: 300,
    launchYear: 2006,
    typicalLotSize: "800 a 1.000 m²",
    exitGate: "Ruta 27 / Dique Luján",
    commuteTime: "10 min a Panamericana",
    highlight: "Barrio con lago dentro del mega emprendimiento Villa Nueva",
    amenities: ["Lago Interno", "Club House", "Tenis", "Fútbol", "Seguridad"],
    desc: "Ubicado en el cuadrante noroeste, cruzando el canal hacia el Complejo Villa Nueva (EIDICO), cerca de Santa Teresa.",
    center: [-34.3980, -58.6850],
    polygon: [
      [-34.3950, -58.6890],
      [-34.3930, -58.6810],
      [-34.4010, -58.6795],
      [-34.4025, -58.6875]
    ]
  },
  "El Encuentro": {
    name: "El Encuentro",
    type: "vecino",
    categoryLabel: "Barrio Cerrado en Benavídez / Bancalari",
    badgeText: "Z",
    surfaceHa: 110,
    lotsCount: 530,
    launchYear: 2005,
    typicalLotSize: "800 a 1.200 m²",
    exitGate: "Corredor Bancalari / Ruta 197",
    commuteTime: "Salida directa a Bancalari",
    highlight: "Gran arboleda añosa y lago central en Benavídez",
    amenities: ["Lago Central", "Club House", "Tenis Polvo de Ladrillo", "Fútbol", "Plazas"],
    desc: "Ubicado al suroeste de Nordelta, sobre el lateral de Bancalari. Famoso por su frondoso parque forestal y su lago central.",
    center: [-34.4295, -58.6765],
    polygon: [
      [-34.4255, -58.6815],
      [-34.4245, -58.6715],
      [-34.4340, -58.6690],
      [-34.4365, -58.6775]
    ]
  },
  "La Comarca": {
    name: "La Comarca",
    type: "vecino",
    categoryLabel: "Barrio Cerrado al Suroeste",
    badgeText: "Z",
    surfaceHa: 65,
    lotsCount: 380,
    launchYear: 2008,
    typicalLotSize: "600 a 850 m²",
    exitGate: "Corredor Bancalari / Las Tunas",
    commuteTime: "Salida ágil por Bancalari",
    highlight: "Comunidad consolidada con lago y club deportivo",
    amenities: ["Lago Interno", "Club House", "Tenis", "Fútbol", "Pileta"],
    desc: "Situado al sur de El Encuentro sobre el eje de Bancalari. Barrio familiar de gran consolidación con laguna y servicios completos.",
    center: [-34.4375, -58.6690],
    polygon: [
      [-34.4350, -58.6740],
      [-34.4340, -58.6655],
      [-34.4415, -58.6630],
      [-34.4425, -58.6715]
    ]
  },
  "Talar del Lago II": {
    name: "Talar del Lago II",
    type: "vecino",
    categoryLabel: "Corredor Bancalari Sur • Etapa II",
    badgeText: "Z",
    surfaceHa: 65,
    lotsCount: 340,
    launchYear: 2005,
    typicalLotSize: "800 a 1.000 m²",
    exitGate: "Av. Bancalari",
    commuteTime: "Salida directa Bancalari",
    highlight: "Barrio consolidado con lago propio frente al Centro Cívico",
    amenities: ["Lago Privado", "Club House", "Tenis", "Fútbol", "Piscina"],
    desc: "Ubicado al sur del Corredor Bancalari, justo al oeste de Santa Bárbara y al sur de Castaños. Destaca por su tranquilidad y acceso directo a Panamericana.",
    center: [-34.4445, -58.6575],
    polygon: [
      [-34.4405, -58.6620],
      [-34.4395, -58.6530],
      [-34.4465, -58.6515],
      [-34.4475, -58.6605]
    ]
  },
  "Talar del Lago": {
    name: "Talar del Lago",
    type: "vecino",
    categoryLabel: "Corredor Bancalari Sur • Etapa I",
    badgeText: "Z",
    surfaceHa: 60,
    lotsCount: 310,
    launchYear: 2002,
    typicalLotSize: "800 a 1.100 m²",
    exitGate: "Av. Bancalari",
    commuteTime: "Salida directa Bancalari",
    highlight: "Primer desarrollo de Talar del Lago con gran lago náutico a remo",
    amenities: ["Gran Lago Náutico", "Club House", "Tenis", "Fútbol", "Playa"],
    desc: "Continuación inmediata hacia el sur de Talar del Lago II. Rodea un gran lago artificial consolidado con casas de estilo colonial y moderno.",
    center: [-34.4510, -58.6550],
    polygon: [
      [-34.4475, -58.6605],
      [-34.4465, -58.6515],
      [-34.4545, -58.6495],
      [-34.4555, -58.6585]
    ]
  }
}

export default function NordeltaMasterplan() {
  const [selectedKey, setSelectedKey] = useState<string>("Castores")
  const [filterType, setFilterType] = useState<'todos' | 'nordelta' | 'vecino'>('todos')
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [tileLayerType, setTileLayerType] = useState<'calles' | 'satelite'>('calles')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const polygonsRef = useRef<any[]>([])
  const markersRef = useRef<any[]>([])
  const [mapReady, setMapReady] = useState(false)

  const activeZone = MASTERPLAN_DATA[selectedKey] || MASTERPLAN_DATA["Castores"]

  // Filtrado de zonas
  const filteredZones = useMemo(() => {
    return Object.values(MASTERPLAN_DATA).filter(z => {
      if (filterType !== 'todos' && z.type !== filterType) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const mName = z.name.toLowerCase().includes(q)
        const mCat = z.categoryLabel.toLowerCase().includes(q)
        const mDesc = z.desc.toLowerCase().includes(q)
        if (!mName && !mCat && !mDesc) return false
      }
      return true
    })
  }, [filterType, searchQuery])

  // Carga de Leaflet Assets
  useEffect(() => {
    let isMounted = true

    const loadLeaflet = async () => {
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
            script.onerror = () => reject(new Error('Failed to load Leaflet'))
            document.body.appendChild(script)
          })
        }

        if (isMounted) setMapReady(true)
      } catch (e) {
        console.error('Error loading Leaflet in Masterplan:', e)
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
    }
  }, [])

  // Inicialización del Mapa Leaflet
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current) return
    const L = (window as any).L
    if (!L || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-34.422, -58.647],
      zoom: 13.5,
      zoomControl: false,
      attributionControl: true
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const tileUrl = tileLayerType === 'satelite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileLayerType === 'satelite' ? '&copy; Esri Imagery' : '&copy; OpenStreetMap'
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
  }, [mapReady])

  // Cambio de capa base de mapa (Calles vs Satélite)
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L) return

    if (tileLayerRef.current) {
      tileLayerRef.current.remove()
    }

    const tileUrl = tileLayerType === 'satelite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileLayerType === 'satelite' ? '&copy; Esri Imagery' : '&copy; OpenStreetMap'
    }).addTo(map)

    map.invalidateSize()
  }, [tileLayerType])

  // Dibujado de Polígonos con Profundidad y Badges estilo Barrios Maps
  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L) return

    // Limpiar polígonos y marcadores anteriores
    polygonsRef.current.forEach(p => p.remove())
    polygonsRef.current = []
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    filteredZones.forEach(zone => {
      const isSelected = selectedKey === zone.name
      const isNordelta = zone.type === 'nordelta'

      // Colores fieles a la imagen del usuario
      // Nordelta: Verde/Teal (#0d9488) | Vecinos: Naranja/Terracota (#c2410c)
      const baseColor = isNordelta ? '#0d9488' : '#c2410c'
      const strokeColor = isSelected ? '#ffffff' : (isNordelta ? '#14b8a6' : '#ea580c')

      // Polígono con transparencia para ver las partes internas y calles
      const polygon = L.polygon(zone.polygon, {
        color: strokeColor,
        weight: isSelected ? 3.5 : 2,
        fillColor: baseColor,
        fillOpacity: isSelected ? 0.55 : 0.35,
        dashArray: isSelected ? undefined : '4, 4'
      }).addTo(map)

      polygon.on('click', () => {
        setSelectedKey(zone.name)
        map.flyTo(zone.center, 15, { duration: 0.6 })
      })

      polygonsRef.current.push(polygon)

      // Marcador Pill IDÉNTICO al de la imagen del usuario:
      // Círculo con letra N o Z + Pastilla blanca con nombre en negrita
      const markerHtml = `
        <div style="
          display:flex;
          align-items:center;
          gap:5px;
          background:#ffffff;
          border:1.5px solid ${baseColor};
          padding:2px 8px 2px 3px;
          border-radius:20px;
          box-shadow:0 3px 12px rgba(0,0,0,0.35);
          cursor:pointer;
          transform:${isSelected ? 'scale(1.18)' : 'scale(1)'};
          transition:transform 0.2s ease;
          white-space:nowrap;
        ">
          <span style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:18px;
            height:18px;
            border-radius:50%;
            background:${baseColor};
            color:#ffffff;
            font-size:11px;
            font-weight:900;
            font-family:sans-serif;
          ">
            ${zone.badgeText}
          </span>
          <span style="
            color:#0f172a;
            font-size:11px;
            font-weight:800;
            font-family:sans-serif;
          ">
            ${zone.name}
          </span>
        </div>
      `

      const icon = L.divIcon({
        className: 'masterplan-badge-' + zone.name.replace(/\s+/g, '-'),
        html: markerHtml,
        iconSize: [120, 26],
        iconAnchor: [60, 13]
      })

      const marker = L.marker(zone.center, {
        icon,
        zIndexOffset: isSelected ? 1500 : 200
      }).addTo(map)

      marker.on('click', () => {
        setSelectedKey(zone.name)
        map.flyTo(zone.center, 15, { duration: 0.6 })
      })

      markersRef.current.push(marker)
    })
  }, [mapReady, filteredZones, selectedKey, tileLayerType])

  // FlyTo cuando se selecciona un barrio desde el buscador
  const handleSelectZone = (name: string) => {
    setSelectedKey(name)
    const z = MASTERPLAN_DATA[name]
    if (z && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(z.center, 15.2, { duration: 0.6 })
    }
  }

  const handleResetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-34.422, -58.647], 13.5, { duration: 0.6 })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & BUSCADOR */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
              <Compass size={22} />
            </span>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Nordelta & Barrios Cerrados Linderos
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
                  GIS EN PROFUNDIDAD
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualización con <strong className="text-teal-400">polígonos transparentes</strong> para ver todas las calles internas, rotondas y lagos.
              </p>
            </div>
          </div>
        </div>

        {/* Buscador y Controles de Capa */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Input de Búsqueda */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar barrio (ej. Castores, Santa Bárbara)..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
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

          {/* Selector de Capa de Mapa */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-white/10">
            <button
              onClick={() => setTileLayerType('calles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tileLayerType === 'calles'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Calles & Loteo</span>
            </button>
            <button
              onClick={() => setTileLayerType('satelite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tileLayerType === 'satelite'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Satélite HD</span>
            </button>
          </div>

          <button
            onClick={handleResetMap}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all hover:scale-105"
            title="Centrar Vista General"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* 2. CHIPS DE FILTRO TIPO DE ZONA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setFilterType('todos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
            filterType === 'todos'
              ? 'bg-teal-600/30 border-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Todos los Barrios</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
            {Object.keys(MASTERPLAN_DATA).length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('nordelta')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
            filterType === 'nordelta'
              ? 'bg-teal-600/30 border-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] font-black flex items-center justify-center">N</span>
          <span>Barrios Nordelta</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
            {Object.values(MASTERPLAN_DATA).filter(z => z.type === 'nordelta').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('vecino')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
            filterType === 'vecino'
              ? 'bg-orange-600/30 border-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">Z</span>
          <span>Zonas Linderas (Santa Bárbara, etc.)</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300">
            {Object.values(MASTERPLAN_DATA).filter(z => z.type === 'vecino').length}
          </span>
        </button>
      </div>

      {/* 3. CONTENEDOR GRID: MAPA GIS LEAFLET + FICHA LATERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAPA GIS CON LEAFLET (8 columnas) */}
        <div className="lg:col-span-8 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Barra superior de estado */}
          <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-400 mb-2 px-1 gap-2">
            <span className="flex items-center gap-2 font-bold text-teal-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Polígonos Verdes: Barrios Nordelta [N]
            </span>
            <span className="flex items-center gap-2 font-bold text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span> Polígonos Rojos/Marrón: Zonas Aledañas [Z]
            </span>
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
              Hacé zoom para ver las calles internas de cada barrio
            </span>
          </div>

          {/* Contenedor del Mapa Leaflet Interactivo */}
          <div className="w-full h-[580px] md:h-[640px] rounded-xl overflow-hidden relative shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            
            {!mapReady && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center z-20">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-300 font-bold">Cargando motor cartográfico GIS...</p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            💡 <strong>Profundidad GIS:</strong> Podés hacer zoom libremente con la rueda del mouse o los botones +/- para inspeccionar cada calle, rotonda, muelle o manzana interna.
          </p>
        </div>

        {/* FICHA TÉCNICA LATERAL (4 columnas) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5">
          
          {/* Cabecera del Barrio Seleccionado */}
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wide flex items-center gap-1.5 ${
                activeZone.type === 'nordelta'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${activeZone.type === 'nordelta' ? 'bg-teal-400' : 'bg-orange-500'}`} />
                {activeZone.type === 'nordelta' ? 'Barrio Nordelta' : 'Zona Aledaña'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Lanzamiento: {activeZone.launchYear}
              </span>
            </div>

            <h4 className="text-2xl md:text-3xl font-black text-white mt-3">
              {activeZone.name}
            </h4>
            <p className="text-xs font-bold text-cyan-400 mt-1">
              {activeZone.highlight}
            </p>
          </div>

          {/* Cuadrícula de Métricas Catastrales */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Superficie</span>
              <span className="text-base font-black font-mono text-white">{activeZone.surfaceHa} ha</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Lotes</span>
              <span className="text-base font-black font-mono text-white">{activeZone.lotsCount}</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3 col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Metraje Típico</span>
              <span className="text-sm font-bold text-slate-200">{activeZone.typicalLotSize}</span>
            </div>
          </div>

          {/* Conexión Vial y Tiempos */}
          <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Navigation size={13} className="text-amber-400" /> Salida / Egreso:
              </span>
              <span className="font-bold text-slate-200 text-right">{activeZone.exitGate}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Clock size={13} className="text-emerald-400" /> Demora de salida:
              </span>
              <span className="font-mono font-black text-emerald-400">{activeZone.commuteTime}</span>
            </div>
          </div>

          {/* Amenities & Equipamiento */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 flex items-center gap-1.5">
              <Shield size={13} className="text-cyan-400" /> Amenities y Servicios
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeZone.amenities.map(am => (
                <span
                  key={am}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300"
                >
                  {am}
                </span>
              ))}
            </div>
          </div>

          {/* Reseña de la Zona */}
          <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
            <span className="text-slate-400 font-bold block mb-1">Radiografía y Ubicación:</span>
            {activeZone.desc}
          </div>

        </div>

      </div>

    </div>
  )
}
