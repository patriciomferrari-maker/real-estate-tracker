"use client"

import React, { useState } from 'react'
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
  CheckCircle2
} from 'lucide-react'

interface BarrioDetail {
  tag: string
  title: string
  subtitle: string
  commute: string
  type: string
  lots: string
  desc: string
  category: 'sur' | 'centro' | 'norte' | 'nautico'
}

const BARRIOS_DATA: Record<string, BarrioDetail> = {
  "Castaños": {
    tag: "Sector Sur",
    title: "Castaños",
    subtitle: "Pegado al Acceso Sur (Bancalari)",
    commute: "Inmediata (2 min a garita)",
    type: "Familiar con Lago y Club House",
    lots: "500 a 850 m²",
    desc: "El barrio más estratégico para quienes viajan diariamente a CABA por Corredor Bancalari / Panamericana. Evita las demoras de la Avenida Troncal. Cuenta con lago interno, club house con playa de arena y canchas deportivas.",
    category: "sur"
  },
  "Las Glorietas": {
    tag: "Sector Sur",
    title: "Las Glorietas",
    subtitle: "Uno de los barrios fundacionales de Nordelta",
    commute: "3 - 5 min a Acceso Sur",
    type: "Tradicional muy arbolado",
    lots: "600 a 1.000 m²",
    desc: "Destaca por su frondosa arboleda crecida a lo largo de más de 20 años. Posee costa sobre el Lago Central y lagunas internas. Muy cerca del polo educativo y colegios de la entrada sur.",
    category: "sur"
  },
  "Los Alisos": {
    tag: "Sector Sur",
    title: "Los Alisos",
    subtitle: "Lago central propio de 10 hectáreas",
    commute: "4 min a Acceso Sur",
    type: "Gran vida familiar y náutica menor",
    lots: "650 a 900 m²",
    desc: "Barrio consolidado con un imponente lago interno de 10 ha donde se practica kayak y windsurf. Club house moderno con pileta semiolímpica, canchas de tenis iluminadas y restaurante.",
    category: "sur"
  },
  "El Palmar": {
    tag: "Sector Sur / Colegios",
    title: "El Palmar",
    subtitle: "Zona de Townhouses y Condominios",
    commute: "3 min a Acceso Sur",
    type: "Departamentos y Casas Modernas",
    lots: "Condominios de 2 a 4 ambientes",
    desc: "Ubicado frente al polo de colegios (Michael Ham, Northlands, Pironio). Ideal para familias que buscan practicidad sin el mantenimiento de un jardín grande.",
    category: "sur"
  },
  "La Isla": {
    tag: "Sector Central Exclusivo",
    title: "La Isla",
    subtitle: "El barrio más exclusivo y cotizado de Nordelta",
    commute: "8 - 10 min a Panamericana",
    type: "Mansiones de alta gama sobre Lago Central",
    lots: "1.000 a 5.000 m²",
    desc: "Una península privada dentro del Lago Central de 180 ha. Solo 110 lotes de gran superficie con costas privadas infinitas. Máxima privacidad, seguridad y el mayor valor por metro cuadrado de Nordelta.",
    category: "centro"
  },
  "Los Castores": {
    tag: "Sector Central",
    title: "Los Castores",
    subtitle: "El barrio emblemático con mayor costa de lago",
    commute: "7 - 9 min a Acceso Sur",
    type: "Grandes residencias y deportes náuticos",
    lots: "900 a 1.500 m²",
    desc: "El corazón náutico histórico de Nordelta. Casi todos sus lotes dan al Lago Central o a canales internos navegables sin motor. Club house con muelle, tenis, paddle y gimnasio de primer nivel.",
    category: "centro"
  },
  "Barrancas del Lago": {
    tag: "Sector Central",
    title: "Barrancas del Lago",
    subtitle: "Estilo arquitectónico colonial / mediterráneo",
    commute: "8 min a Acceso Sur",
    type: "Lago propio y Club de Tenis",
    lots: "600 a 850 m²",
    desc: "Distinguido por su diseño homogéneo de casas de tejas y tonos cálidos que rodean un lago de 8 hectáreas. Cuenta con una de las mejores academias de tenis de Nordelta.",
    category: "centro"
  },
  "Portezuelo": {
    tag: "Sector Central",
    title: "Portezuelo",
    subtitle: "El polo de condominios sobre el Lago Mayor",
    commute: "7 min a Acceso Sur",
    type: "Edificios de departamentos residenciales",
    lots: "Condominios con balcón terraza",
    desc: "Frente al Lago Central y muy próximo a la Bahía Grande. Ofrece departamentos con vistas abiertas panorámicas al agua y amarras de cortesía.",
    category: "centro"
  },
  "Las Caletas": {
    tag: "Sector Este Náutico",
    title: "Las Caletas",
    subtitle: "Salida directa navegable al canal y Río Luján",
    commute: "10 min a Panamericana (o salida por Remeros)",
    type: "Náutico con amarra propia en el jardín",
    lots: "800 a 1.200 m²",
    desc: "Todos los lotes tienen frente sobre el canal mayor navegable. Permite tener embarcaciones con motor en la puerta de la casa y salir navegando hacia el Delta del Paraná.",
    category: "nautico"
  },
  "Los Sauces": {
    tag: "Sector Norte / Centro",
    title: "Los Sauces",
    subtitle: "Paso intermedio entre el centro y la bahía",
    commute: "6 min a Acceso Norte / 10 min a Sur",
    type: "Dos lagos internos y excelente ubicación",
    lots: "600 a 900 m²",
    desc: "Ubicación inmejorable a pasos del Centro Comercial Nordelta y del Sanatorio. Muy buscado por la comodidad de acceder caminando a servicios y comercios.",
    category: "centro"
  },
  "Los Tilos": {
    tag: "Sector Norte",
    title: "Los Tilos",
    subtitle: "Barrio tranquilo y familiar",
    commute: "5 min a Acceso Norte (Ruta 27)",
    type: "Residencial con plazas internas",
    lots: "500 a 700 m²",
    desc: "Un barrio acogedor, con calles tranquilas y plazas diseñadas para chicos. Salida rápida hacia la Ruta 27 y Benavídez.",
    category: "norte"
  },
  "La Alameda": {
    tag: "Sector Norte",
    title: "La Alameda",
    subtitle: "Lago de 7 hectáreas y Club Nordelta",
    commute: "6 min a Acceso Norte",
    type: "Familiar deportivo",
    lots: "650 a 900 m²",
    desc: "Rodeado por un lago central de 7 ha y lindero a la sede central del Club Nordelta. Excelente infraestructura social y deportiva.",
    category: "norte"
  },
  "El Tipa": {
    tag: "Sector Norte",
    title: "El Tipa",
    subtitle: "Próximo al Acceso Benavídez",
    commute: "4 min a Acceso Norte",
    type: "Lago propio y lotes arbolados",
    lots: "600 a 850 m²",
    desc: "Barrio exclusivo en el sector norte con lago central y rápido egreso hacia Benavídez y el Ramal Escobar de Panamericana.",
    category: "norte"
  },
  "El Golf": {
    tag: "Sector Noroeste",
    title: "El Golf",
    subtitle: "Rodea el prestigioso campo de 18 hoyos Nicklaus",
    commute: "8 min a Acceso Norte",
    type: "Lotes amplios con vista al green y lagos",
    lots: "1.000 a 1.800 m²",
    desc: "Uno de los barrios más codiciados de Nordelta. Diseñado alrededor del exclusivo Nordelta Golf Club. Vistas panorámicas ininterrumpidas a los fairways y lagunas.",
    category: "norte"
  },
  "Carpinchos": {
    tag: "Sector Noreste",
    title: "Carpinchos",
    subtitle: "De los barrios más modernos con lago de 16 ha",
    commute: "7 min a Acceso Norte / Remeros",
    type: "Casas contemporáneas y gran infraestructura",
    lots: "600 a 900 m²",
    desc: "Barrio de reciente consolidación con un imponente espejo de agua de 16 ha. Club house de arquitectura moderna, canchas de tenis y fútbol.",
    category: "norte"
  },
  "El Yacht": {
    tag: "Sector Noreste Náutico",
    title: "El Yacht",
    subtitle: "El barrio náutico premium con salida al Río Luján",
    commute: "8 min a Acceso Remeros / Norte",
    type: "Lotes con amarra para yates y lanchas",
    lots: "900 a 1.400 m²",
    desc: "Diseñado para los amantes de la navegación. Permite amarrar cruceros y yates de gran calado en el fondo de la casa con salida franca sin puentes al Río Luján.",
    category: "nautico"
  }
}

export default function NordeltaMasterplan() {
  const [selectedKey, setSelectedKey] = useState<string>("Castaños")
  const [filterCategory, setFilterCategory] = useState<'todos' | 'sur' | 'centro' | 'norte' | 'nautico'>('todos')
  const [selectedPoint, setSelectedPoint] = useState<{ title: string; subtitle: string; desc: string } | null>(null)

  const activeBarrio = BARRIOS_DATA[selectedKey] || BARRIOS_DATA["Castaños"]

  const handleBarrioClick = (name: string) => {
    setSelectedKey(name)
    setSelectedPoint(null)
  }

  const handlePointClick = (title: string, subtitle: string, desc: string) => {
    setSelectedPoint({ title, subtitle, desc })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER & DATOS CLAVE */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Compass size={20} />
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Masterplan de Nordelta: Geografía, Lagos y Barrios
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Superficie de <strong className="text-white">1.600 hectáreas</strong> (16 km²) • Lago Central de <strong className="text-white">180 ha</strong> • <strong className="text-white">+45.000 residentes</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
            <Waves size={13} /> Lago Central: 180 ha
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock size={13} /> Av. Troncal: 8 km
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Anchor size={13} /> Salida Río Luján
          </span>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">Filtrar por:</span>
          {(['todos', 'sur', 'centro', 'norte', 'nautico'] as const).map(cat => {
            const labels: Record<string, string> = {
              todos: 'Todos los Barrios',
              sur: 'Acceso Sur (Bancalari)',
              centro: 'Lago Central / Tradicionales',
              norte: 'Norte & Golf',
              nautico: 'Náuticos con Amarra'
            }
            const active = filterCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                  active 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {labels[cat]}
              </button>
            )
          })}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Haz clic en cualquier barrio o punto para ver sus detalles
        </span>
      </div>

      {/* CONTENEDOR: MAPA VECTORIAL + FICHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAPA SVG (8 columnas) */}
        <div className="lg:col-span-8 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span> Espejos de Agua (Lago Mayor)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Av. de los Lagos (Troncal)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span> Accesos Principales
            </span>
          </div>

          <div className="w-full aspect-[4/3] max-h-[560px]">
            <svg viewBox="0 0 850 680" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="npWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95"/>
                </linearGradient>
                <linearGradient id="npPerimeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95"/>
                </linearGradient>
              </defs>

              {/* 1. PERÍMETRO GENERAL DE NORDELTA (~1.600 HECTÁREAS) */}
              <polygon points="120,620 180,640 460,650 690,520 780,340 760,160 520,80 320,90 140,240 90,460"
                       fill="url(#npPerimeterGrad)" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" />
              <text x="140" y="655" fill="#64748b" fontSize="12" fontWeight="bold">LÍMITE MASTERPLAN NORDELTA (1.600 HA)</text>

              {/* 2. AVENIDA TRONCAL (AV. DE LOS LAGOS - 8 KM) */}
              <path d="M 230,640 Q 300,530 380,440 T 450,300 T 520,180 T 560,95" 
                    fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
              <path d="M 230,640 Q 300,530 380,440 T 450,300 T 520,180 T 560,95" 
                    fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="8,6" />
              <text x="390" y="450" fill="#fef08a" fontSize="12" fontWeight="bold" transform="rotate(-52, 390, 450)">Av. de los Lagos (Troncal)</text>

              {/* 3. RAMAL SECUNDARIO HACIA REMEROS Y BAHÍA */}
              <path d="M 450,300 Q 560,320 680,340 T 770,350" 
                    fill="none" stroke="#f59e0b" strokeWidth="3.5" opacity="0.75" />
              <text x="590" y="325" fill="#fef08a" fontSize="12" fontWeight="bold">Av. del Golf / Bahía</text>

              {/* 4. LAGO CENTRAL (180 HA) Y CUERPOS DE AGUA */}
              <path d="M 330,500 C 310,430 370,390 350,320 C 340,270 420,240 460,260 C 510,290 490,360 450,390 C 420,410 420,490 370,520 Z" 
                    fill="url(#npWaterGrad)" filter="drop-shadow(0 0 8px rgba(14, 165, 233, 0.4))" />
              <text x="395" y="350" fill="#e0f2fe" fontSize="14" fontWeight="900" letterSpacing="1">LAGO CENTRAL</text>
              <text x="415" y="366" fill="#bae6fd" fontSize="12" fontWeight="bold">(180 ha)</text>

              {/* Lagunas secundarias */}
              <ellipse cx="260" cy="560" rx="35" ry="25" fill="url(#npWaterGrad)" />
              <ellipse cx="520" cy="400" rx="35" ry="20" fill="url(#npWaterGrad)" />
              <ellipse cx="610" cy="220" rx="40" ry="24" fill="url(#npWaterGrad)" />

              {/* Canal Náutico El Yacht / Bahía con salida al Río Luján */}
              <path d="M 680,260 Q 730,280 770,250 T 820,200" 
                    fill="none" stroke="#0284c7" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
              <text x="730" y="240" fill="#7dd3fc" fontSize="12" fontWeight="bold">Canal al Río Luján</text>

              {/* 5. POLOS URBANOS */}
              <g className="cursor-pointer" onClick={() => handlePointClick('Centro Comercial Nordelta', 'Polo Comercial y Gastronómico', 'Shopping a cielo abierto con supermercado Jumbo, cines, bancos, polo gastronómico, consultorios médicos y oficinas.')}>
                <rect x="630" y="370" width="80" height="42" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <text x="640" y="388" fill="#c7d2fe" fontSize="12" fontWeight="900">CENTRO COMERCIAL</text>
                <text x="640" y="403" fill="#a5b4fc" fontSize="12">Jumbo, Cines, Bancos</text>
              </g>

              <g className="cursor-pointer" onClick={() => handlePointClick('Bahía Grande', 'Puerto Náutico & Hotelería', 'Marina sobre el canal navegable, hotel Wyndham, paseos peatonales y los principales restaurantes gourmet de Nordelta.')}>
                <rect x="690" y="310" width="75" height="38" rx="8" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
                <text x="700" y="327" fill="#bbf7d0" fontSize="12" fontWeight="900">BAHÍA GRANDE</text>
                <text x="700" y="341" fill="#86efac" fontSize="12">Puerto & Restos</text>
              </g>

              <g className="cursor-pointer" onClick={() => handlePointClick('Golf Club Nordelta', 'Campo de Golf 18 Hoyos', 'Cancha de golf internacional de campeonato diseñada por Jack Nicklaus, sede de torneos del PGA Tour Latinoamérica.')}>
                <path d="M 230,190 C 270,160 360,180 340,240 C 310,270 230,250 230,190 Z" 
                      fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.65" />
                <text x="260" y="220" fill="#6ee7b7" fontSize="12" fontWeight="900">GOLF CLUB (18 Hoyos)</text>
                <text x="265" y="235" fill="#a7f3d0" fontSize="12">Jack Nicklaus Design</text>
              </g>

              <g className="cursor-pointer" onClick={() => handlePointClick('Polo Educativo', 'Colegios Principales', 'Sede de los colegios Northlands, Michael Ham, Cardenal Pironio (Marín), St. Luke\'s y Northville.')}>
                <rect x="360" y="550" width="70" height="32" rx="6" fill="#701a75" stroke="#f472b6" strokeWidth="1.5" />
                <text x="366" y="565" fill="#fbcfe8" fontSize="12" fontWeight="bold">COLEGIOS</text>
                <text x="366" y="577" fill="#f472b6" fontSize="12">Northlands, Michael Ham</text>
              </g>

              {/* 6. ACCESOS / ENTRADAS PRINCIPALES */}
              <g className="cursor-pointer" onClick={() => handlePointClick('Acceso Sur (Bancalari)', 'Garita Sur de Nordelta', 'Salida directa hacia el Corredor Bancalari y Panamericana (Ramal Tigre y Campana). Es el acceso preferido para viajar hacia DOT y Microcentro.')}>
                <circle cx="230" cy="640" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="155" y="605" width="130" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="162" y="621" fill="#fca5a5" fontSize="12" fontWeight="900">ACCESO SUR (BANCALARI)</text>
              </g>

              <g className="cursor-pointer" onClick={() => handlePointClick('Acceso Norte (Ruta 27 / Benavídez)', 'Garita Norte', 'Conexión directa con Villa Nueva (Santa Teresa, Santa Clara, San Marco), Benavídez y Ramal Escobar.')}>
                <circle cx="560" cy="95" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="495" y="65" width="135" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="502" y="81" fill="#fca5a5" fontSize="12" fontWeight="900">ACCESO NORTE (RUTA 27)</text>
              </g>

              <g className="cursor-pointer" onClick={() => handlePointClick('Acceso Remeros', 'Garita Este', 'Salida hacia el Camino de los Remeros, Tigre Centro y Autopista hacia CABA.')}>
                <circle cx="770" cy="350" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="700" y="365" width="125" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="707" y="381" fill="#fca5a5" fontSize="12" fontWeight="900">ACCESO REMEROS</text>
              </g>

              {/* 7. BARRIOS */}
              {/* Castaños */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Castaños')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="190" y="520" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Castaños' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Castaños' ? 3 : 1.8} />
                <text x="202" y="536" fill="#ffffff" fontSize="12" fontWeight="900">Castaños</text>
                <text x="202" y="548" fill="#93c5fd" fontSize="12">Entrada Sur</text>
              </g>

              {/* Las Glorietas */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Las Glorietas')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="160" y="450" width="85" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Las Glorietas' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Las Glorietas' ? 3 : 1.8} />
                <text x="170" y="466" fill="#ffffff" fontSize="12" fontWeight="900">Las Glorietas</text>
                <text x="170" y="478" fill="#93c5fd" fontSize="12">Muy arbolado</text>
              </g>

              {/* Los Alisos */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Los Alisos')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="290" y="555" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Alisos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Alisos' ? 3 : 1.8} />
                <text x="300" y="571" fill="#ffffff" fontSize="12" fontWeight="900">Los Alisos</text>
                <text x="300" y="583" fill="#93c5fd" fontSize="12">Lago 10 ha</text>
              </g>

              {/* El Palmar */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('El Palmar')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="270" y="490" width="68" height="32" rx="7" fill="#312e81" stroke={selectedKey === 'El Palmar' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'El Palmar' ? 3 : 1.5} />
                <text x="278" y="506" fill="#ffffff" fontSize="12" fontWeight="bold">El Palmar</text>
                <text x="278" y="517" fill="#c7d2fe" fontSize="12">Townhouses</text>
              </g>

              {/* La Isla */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('La Isla')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="365" y="325" width="65" height="34" rx="8" fill="#831843" stroke={selectedKey === 'La Isla' ? '#38bdf8' : '#f472b6'} strokeWidth={selectedKey === 'La Isla' ? 3 : 2.2} />
                <text x="376" y="342" fill="#ffffff" fontSize="12" fontWeight="900">La Isla</text>
                <text x="376" y="353" fill="#fbcfe8" fontSize="12">Exclusivo</text>
              </g>

              {/* Los Castores */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Los Castores')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="235" y="360" width="85" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Castores' ? '#38bdf8' : '#38bdf8'} strokeWidth={selectedKey === 'Los Castores' ? 3 : 1.8} />
                <text x="245" y="376" fill="#ffffff" fontSize="12" fontWeight="900">Los Castores</text>
                <text x="245" y="388" fill="#bae6fd" fontSize="12">Lago Central</text>
              </g>

              {/* Barrancas del Lago */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Barrancas del Lago')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="470" y="445" width="95" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Barrancas del Lago' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Barrancas del Lago' ? 3 : 1.8} />
                <text x="478" y="461" fill="#ffffff" fontSize="12" fontWeight="900">Barrancas Lago</text>
                <text x="478" y="473" fill="#93c5fd" fontSize="12">Estilo Colonial</text>
              </g>

              {/* Portezuelo */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Portezuelo')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="520" y="495" width="75" height="32" rx="7" fill="#312e81" stroke={selectedKey === 'Portezuelo' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'Portezuelo' ? 3 : 1.5} />
                <text x="528" y="511" fill="#ffffff" fontSize="12" fontWeight="bold">Portezuelo</text>
                <text x="528" y="522" fill="#c7d2fe" fontSize="12">Condominios</text>
              </g>

              {/* Las Caletas */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Las Caletas')} opacity={filterCategory === 'todos' || filterCategory === 'nautico' ? 1 : 0.2}>
                <rect x="585" y="445" width="78" height="34" rx="8" fill="#0f766e" stroke={selectedKey === 'Las Caletas' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'Las Caletas' ? 3 : 1.8} />
                <text x="593" y="461" fill="#ffffff" fontSize="12" fontWeight="900">Las Caletas</text>
                <text x="593" y="473" fill="#99f6e4" fontSize="12">Amarras directas</text>
              </g>

              {/* Los Sauces */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Los Sauces')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="340" y="220" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Sauces' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Sauces' ? 3 : 1.8} />
                <text x="350" y="236" fill="#ffffff" fontSize="12" fontWeight="900">Los Sauces</text>
                <text x="350" y="248" fill="#93c5fd" fontSize="12">Muy central</text>
              </g>

              {/* Los Tilos */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Los Tilos')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="430" y="195" width="68" height="32" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Los Tilos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Tilos' ? 3 : 1.5} />
                <text x="440" y="211" fill="#ffffff" fontSize="12" fontWeight="bold">Los Tilos</text>
                <text x="440" y="222" fill="#93c5fd" fontSize="12">Familiar</text>
              </g>

              {/* La Alameda */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('La Alameda')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="490" y="145" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'La Alameda' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'La Alameda' ? 3 : 1.8} />
                <text x="498" y="161" fill="#ffffff" fontSize="12" fontWeight="900">La Alameda</text>
                <text x="498" y="173" fill="#93c5fd" fontSize="12">Lago 7 ha</text>
              </g>

              {/* El Tipa */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('El Tipa')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="400" y="140" width="68" height="32" rx="7" fill="#1e3a8a" stroke={selectedKey === 'El Tipa' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'El Tipa' ? 3 : 1.5} />
                <text x="412" y="156" fill="#ffffff" fontSize="12" fontWeight="bold">El Tipa</text>
                <text x="412" y="167" fill="#93c5fd" fontSize="12">Cerca Norte</text>
              </g>

              {/* El Golf */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('El Golf')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="280" y="115" width="72" height="34" rx="8" fill="#065f46" stroke={selectedKey === 'El Golf' ? '#38bdf8' : '#34d399'} strokeWidth={selectedKey === 'El Golf' ? 3 : 2} />
                <text x="294" y="131" fill="#ffffff" fontSize="12" fontWeight="900">El Golf</text>
                <text x="290" y="143" fill="#a7f3d0" fontSize="12">Cancha Nicklaus</text>
              </g>

              {/* Carpinchos */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('Carpinchos')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="580" y="160" width="78" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Carpinchos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Carpinchos' ? 3 : 1.8} />
                <text x="590" y="176" fill="#ffffff" fontSize="12" fontWeight="900">Carpinchos</text>
                <text x="590" y="188" fill="#93c5fd" fontSize="12">Lago 16 ha</text>
              </g>

              {/* El Yacht */}
              <g className="cursor-pointer" onClick={() => handleBarrioClick('El Yacht')} opacity={filterCategory === 'todos' || filterCategory === 'nautico' ? 1 : 0.2}>
                <rect x="680" y="180" width="72" height="34" rx="8" fill="#0f766e" stroke={selectedKey === 'El Yacht' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'El Yacht' ? 3 : 2} />
                <text x="694" y="196" fill="#ffffff" fontSize="12" fontWeight="900">El Yacht</text>
                <text x="688" y="208" fill="#99f6e4" fontSize="12">Río Luján</text>
              </g>

            </svg>
          </div>

        </div>

        {/* FICHA TÉCNICA DEL BARRIO O PUNTO SELECCIONADO (4 columnas) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          
          {selectedPoint ? (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  Punto de Interés
                </span>
                <h4 className="text-2xl font-black text-white mt-2">
                  {selectedPoint.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {selectedPoint.subtitle}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 leading-relaxed">
                {selectedPoint.desc}
              </div>

              <button
                onClick={() => setSelectedPoint(null)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 border border-white/10 transition-colors"
              >
                Volver a la ficha de barrios
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                  {activeBarrio.tag}
                </span>
                <h4 className="text-2xl font-black text-white mt-2">
                  {activeBarrio.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeBarrio.subtitle}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="text-slate-400">Salida a Panamericana:</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">{activeBarrio.commute}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="text-slate-400">Tipología de Barrio:</span>
                  <span className="font-bold text-white">{activeBarrio.type}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="text-slate-400">Tamaño de Lotes:</span>
                  <span className="font-bold text-white">{activeBarrio.lots}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <span className="text-slate-400 font-bold block text-xs">Radiografía & Ubicación:</span>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {activeBarrio.desc}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 space-y-1.5">
                <strong className="text-blue-300 font-black block">Esquema Rápido de Nordelta:</strong>
                <p className="text-[12px] leading-relaxed text-blue-100/90">
                  • <strong>Sur (Bancalari):</strong> Castaños, Alisos, Glorietas.<br />
                  • <strong>Centro (Lago Mayor):</strong> La Isla, Castores, Barrancas.<br />
                  • <strong>Norte (Bahía / Golf):</strong> Golf, Yacht, Sauces, Carpinchos.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
