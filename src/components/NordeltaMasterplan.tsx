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
  Navigation,
  Fuel,
  Activity,
  Layers,
  ExternalLink
} from 'lucide-react'

interface MapItemDetail {
  tag: string
  title: string
  subtitle: string
  commute?: string
  type: string
  lots?: string
  desc: string
  isStreet?: boolean
}

const ITEMS_DATA: Record<string, MapItemDetail> = {
  // --- CALLES Y ARTERIAS REGIONALES ---
  "Corredor Bancalari": {
    tag: "Arteria Lateral Oeste",
    title: "Corredor Bancalari - Benavídez",
    subtitle: "Ruta troncal paralela al límite oeste de Nordelta",
    commute: "Conexión directa a Panamericana (12 - 18 min)",
    type: "Avenida Interurbana de 4 carriles con rotondas",
    desc: "Es la arteria lateral estratégica que recorre todo el flanco oeste de Nordelta. Nace en Panamericana (cerca del peaje Bancalari / San Isidro) y sube en sentido sur-norte hasta la Ruta 27 en Benavídez. Por aquí ingresan al Acceso Sur los vecinos de Castaños, Alisos y Glorietas, y conecta del otro lado con barrios como Santa Bárbara y Barbarita.",
    isStreet: true
  },
  "Ruta Provincial 27": {
    tag: "Arteria Perimetral Norte y Este",
    title: "Ruta 27 (Av. Agustín M. García)",
    subtitle: "Borde norte de Nordelta hacia Villa Nueva y Tigre",
    commute: "5 min a Villa Nueva • 10 min a Tigre Centro",
    type: "Ruta Provincial Multicarril con bulevar central",
    desc: "Bordea todo el perímetro norte de Nordelta. Sobre esta ruta se ubican la Garita del Acceso Benavídez, el Centro Comercial Nordelta, el Sanatorio Las Lomas y el acceso a Bahía Grande. Hacia el norte cruza hacia el complejo Villa Nueva (Santa Teresa, Santa Clara, etc.) y hacia el este conecta con Tigre y Camino de los Remeros.",
    isStreet: true
  },
  "Camino de los Remeros": {
    tag: "Arteria Lateral Este",
    title: "Camino de los Remeros",
    subtitle: "Conector directo hacia Autopista Acceso Tigre",
    commute: "15 min a Autopista Panamericana",
    type: "Autovía rápida costera junto al Canal Aliviador",
    desc: "Nace en la rotonda este de la Ruta 27 (Acceso Remeros de Nordelta) y va recto hacia el sur bordeando la Pista Nacional de Remo hasta desembocar en el Acceso Norte Ramal Tigre. Es la vía más despejada para salir en horas pico cuando Bancalari tiene mucha carga vehicular.",
    isStreet: true
  },
  "Avenida de los Lagos": {
    tag: "Columna Vertebral Interna",
    title: "Av. de los Lagos (Troncal de Nordelta)",
    subtitle: "8 km de bulevar parquizado de doble mano",
    commute: "Velocidad máxima controlada: 60 km/h",
    type: "Avenida Troncal Interna con Bicisenda",
    desc: "Cruza toda la ciudad pueblo de punta a punta, uniendo la Garita Bancalari (Lateral Oeste) con la Garita Benavídez (Lateral Norte). Posee cámaras de velocidad, bicisendas continuas para running y ciclismo, y rotondas que derivan el tránsito hacia cada uno de los 30 barrios cerrados.",
    isStreet: true
  },

  // --- BARRIOS ---
  "Castaños": {
    tag: "Sector Sur",
    title: "Castaños",
    subtitle: "Pegado al Acceso Sur (Bancalari)",
    commute: "Inmediata (2 min a garita Bancalari)",
    type: "Familiar con Lago y Club House",
    lots: "500 a 850 m²",
    desc: "El barrio más estratégico para quienes viajan diariamente a CABA por Corredor Bancalari / Panamericana. Evita todo el tránsito de la Avenida Troncal. Cuenta con lago interno, club house con playa de arena y canchas deportivas."
  },
  "Las Glorietas": {
    tag: "Sector Sur",
    title: "Las Glorietas",
    subtitle: "Uno de los barrios fundacionales de Nordelta",
    commute: "3 - 5 min a Acceso Sur",
    type: "Tradicional muy arbolado sobre Lago Central",
    lots: "600 a 1.000 m²",
    desc: "Destaca por su frondosa arboleda crecida a lo largo de más de 20 años. Posee costa sobre el Lago Central y lagunas internas. Muy cerca del polo educativo y colegios de la entrada sur."
  },
  "Los Alisos": {
    tag: "Sector Sur",
    title: "Los Alisos",
    subtitle: "Lago central propio de 10 hectáreas",
    commute: "4 min a Acceso Sur",
    type: "Gran vida familiar y náutica menor",
    lots: "650 a 900 m²",
    desc: "Barrio consolidado con un imponente lago interno de 10 ha donde se practica kayak y windsurf. Club house moderno con pileta semiolímpica, canchas de tenis iluminadas y restaurante."
  },
  "El Palmar": {
    tag: "Sector Sur / Colegios",
    title: "El Palmar",
    subtitle: "Zona de Townhouses y Condominios",
    commute: "3 min a Acceso Sur",
    type: "Departamentos y Casas Modernas",
    lots: "Condominios de 2 a 4 ambientes",
    desc: "Ubicado frente al polo de colegios (Michael Ham, Northlands, Pironio). Ideal para familias que buscan practicidad sin el mantenimiento de un jardín grande."
  },
  "La Isla": {
    tag: "Sector Central Exclusivo",
    title: "La Isla",
    subtitle: "El barrio más exclusivo y cotizado de Nordelta",
    commute: "8 - 10 min a Panamericana",
    type: "Mansiones de alta gama sobre Lago Central",
    lots: "1.000 a 5.000 m²",
    desc: "Una península privada dentro del Lago Central de 180 ha. Solo 110 lotes de gran superficie con costas privadas infinitas. Máxima privacidad, seguridad y el mayor valor por metro cuadrado de Nordelta."
  },
  "Los Castores": {
    tag: "Sector Central",
    title: "Los Castores",
    subtitle: "El barrio emblemático con mayor costa de lago",
    commute: "7 - 9 min a Acceso Sur",
    type: "Grandes residencias y deportes náuticos",
    lots: "900 a 1.500 m²",
    desc: "El corazón náutico histórico de Nordelta. Casi todos sus lotes dan al Lago Central o a canales internos navegables sin motor. Club house con muelle, tenis, paddle y gimnasio de primer nivel."
  },
  "Barrancas del Lago": {
    tag: "Sector Central",
    title: "Barrancas del Lago",
    subtitle: "Estilo arquitectónico colonial / mediterráneo",
    commute: "8 min a Acceso Sur",
    type: "Lago propio y Club de Tenis",
    lots: "600 a 850 m²",
    desc: "Distinguido por su diseño homogéneo de casas de tejas y tonos cálidos que rodean un lago de 8 hectáreas. Cuenta con una de las mejores academias de tenis de Nordelta."
  },
  "Portezuelo": {
    tag: "Sector Central",
    title: "Portezuelo",
    subtitle: "El polo de condominios sobre el Lago Mayor",
    commute: "7 min a Acceso Sur",
    type: "Edificios de departamentos residenciales",
    lots: "Condominios con balcón terraza",
    desc: "Frente al Lago Central y muy próximo a la Bahía Grande. Ofrece departamentos con vistas abiertas panorámicas al agua y amarras de cortesía."
  },
  "Las Caletas": {
    tag: "Sector Este Náutico",
    title: "Las Caletas",
    subtitle: "Salida directa navegable al canal y Río Luján",
    commute: "10 min a Panamericana (o salida por Remeros)",
    type: "Náutico con amarra propia en el jardín",
    lots: "800 a 1.200 m²",
    desc: "Todos los lotes tienen frente sobre el canal mayor navegable. Permite tener embarcaciones con motor en la puerta de la casa y salir navegando hacia el Delta del Paraná."
  },
  "Los Sauces": {
    tag: "Sector Norte / Centro",
    title: "Los Sauces",
    subtitle: "Paso intermedio entre el centro y la bahía",
    commute: "6 min a Acceso Norte / 10 min a Sur",
    type: "Dos lagos internos y excelente ubicación",
    lots: "600 a 900 m²",
    desc: "Ubicación inmejorable a pasos del Centro Comercial Nordelta y del Sanatorio. Muy buscado por la comodidad de acceder caminando a servicios y comercios."
  },
  "Los Tilos": {
    tag: "Sector Norte",
    title: "Los Tilos",
    subtitle: "Barrio tranquilo y familiar",
    commute: "5 min a Acceso Norte (Ruta 27)",
    type: "Residencial con plazas internas",
    lots: "500 a 700 m²",
    desc: "Un barrio acogedor, con calles tranquilas y plazas diseñadas para chicos. Salida rápida hacia la Ruta 27 y Benavídez."
  },
  "La Alameda": {
    tag: "Sector Norte",
    title: "La Alameda",
    subtitle: "Lago de 7 hectáreas y Club Nordelta",
    commute: "6 min a Acceso Norte",
    type: "Familiar deportivo",
    lots: "650 a 900 m²",
    desc: "Rodeado por un lago central de 7 ha y lindero a la sede central del Club Nordelta. Excelente infraestructura social y deportiva."
  },
  "El Tipa": {
    tag: "Sector Norte",
    title: "El Tipa",
    subtitle: "Próximo al Acceso Benavídez",
    commute: "4 min a Acceso Norte",
    type: "Lago propio y lotes arbolados",
    lots: "600 a 850 m²",
    desc: "Barrio exclusivo en el sector norte con lago central y rápido egreso hacia Benavídez y el Ramal Escobar de Panamericana."
  },
  "El Golf": {
    tag: "Sector Noroeste",
    title: "El Golf",
    subtitle: "Rodea el prestigioso campo de 18 hoyos Nicklaus",
    commute: "8 min a Acceso Norte",
    type: "Lotes amplios con vista al green y lagos",
    lots: "1.000 a 1.800 m²",
    desc: "Uno de los barrios más codiciados de Nordelta. Diseñado alrededor del exclusivo Nordelta Golf Club. Vistas panorámicas ininterrumpidas a los fairways y lagunas."
  },
  "Carpinchos": {
    tag: "Sector Noreste",
    title: "Carpinchos",
    subtitle: "De los barrios más modernos con lago de 16 ha",
    commute: "7 min a Acceso Norte / Remeros",
    type: "Casas contemporáneas y gran infraestructura",
    lots: "600 a 900 m²",
    desc: "Barrio de reciente consolidación con un imponente espejo de agua de 16 ha. Club house de arquitectura moderna, canchas de tenis y fútbol."
  },
  "El Yacht": {
    tag: "Sector Noreste Náutico",
    title: "El Yacht",
    subtitle: "El barrio náutico premium con salida al Río Luján",
    commute: "8 min a Acceso Remeros / Norte",
    type: "Lotes con amarra para yates y lanchas",
    lots: "900 a 1.400 m²",
    desc: "Diseñado para los amantes de la navegación. Permite amarrar cruceros y yates de gran calado en el fondo de la casa con salida franca sin puentes al Río Luján."
  },

  // --- BARRIOS LINDEROS Y CONTEXTO REGIONAL ---
  "Santa Bárbara": {
    tag: "Barrio Lindero al Oeste",
    title: "Santa Bárbara",
    subtitle: "Ubicado cruzando el Corredor Bancalari",
    commute: "Salida directa por Corredor Bancalari",
    type: "Barrio cerrado independiente de 232 hectáreas",
    desc: "Enorme urbanización cerrada que limita con el lateral oeste de Nordelta. Cuenta con una gran laguna intercomunicada de 55 hectáreas. Se accede directamente por el Corredor Bancalari."
  },
  "Complejo Villa Nueva": {
    tag: "Mega-Desarrollo al Norte",
    title: "Complejo Villa Nueva",
    subtitle: "Cruzando la Ruta 27 hacia el norte",
    commute: "5 a 10 min al Acceso Benavídez de Nordelta",
    type: "Polo de 12 barrios náuticos y lagunas (EIDICO)",
    desc: "Desarrollo masivo contiguo a Nordelta que incluye barrios como Santa Teresa, Santa Clara, San Marco, San Isidro Labrador y San Rafael. Sus residentes utilizan a diario el Centro Comercial, colegios y polo médico de Nordelta."
  }
}

export default function NordeltaMasterplan() {
  const [selectedKey, setSelectedKey] = useState<string>("Corredor Bancalari")
  const [filterCategory, setFilterCategory] = useState<'todos' | 'calles' | 'sur' | 'centro' | 'norte' | 'nautico'>('todos')

  const activeItem = ITEMS_DATA[selectedKey] || ITEMS_DATA["Corredor Bancalari"]

  const handleItemClick = (key: string) => {
    setSelectedKey(key)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. ENCABEZADO Y CONTEXTO REGIONAL */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Compass size={20} />
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Anatomía Vial y Geografía de Nordelta
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Visualización con <strong className="text-white">Corredor Bancalari (Lateral Oeste)</strong>, <strong className="text-white">Ruta 27 (Norte)</strong>, <strong className="text-white">Camino de los Remeros (Este)</strong> y todos los barrios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
            <Navigation size={13} /> Bancalari: Lateral Oeste
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Navigation size={13} /> Ruta 27: Lateral Norte
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
            <Waves size={13} /> Lago Central: 180 ha
          </span>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS */}
      <div className="bg-slate-900/60 border border-white/10 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] mr-1">Capas:</span>
          {(['todos', 'calles', 'sur', 'centro', 'norte', 'nautico'] as const).map(cat => {
            const labels: Record<string, string> = {
              todos: 'Ver Todo',
              calles: '🛣️ Arterias y Calles',
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
          Haz clic en cualquier calle o barrio para inspeccionar su trazado
        </span>
      </div>

      {/* 3. CONTENEDOR GRID: MAPA DETALLADO + FICHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAPA SVG CARTOGRÁFICO (8 columnas) */}
        <div className="lg:col-span-8 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Leyenda Superior */}
          <div className="w-full flex flex-wrap items-center justify-between text-[11px] text-slate-400 mb-2 px-1 gap-2">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-1.5 rounded bg-amber-500"></span> Calles / Rutas Principales
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3 h-1.5 rounded bg-cyan-400"></span> Espejos de Agua & Río
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span> Garitas de Acceso
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-500">
              <span className="w-3 h-1 border-t-2 border-dashed border-slate-500"></span> FFCC Mitre
            </span>
          </div>

          <div className="w-full aspect-[4/3] max-h-[600px]">
            <svg viewBox="0 0 980 720" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="nmWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85"/>
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95"/>
                </linearGradient>
                <linearGradient id="nmPerimeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95"/>
                </linearGradient>
                <linearGradient id="roadAsphalt" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#334155"/>
                  <stop offset="50%" stopColor="#475569"/>
                  <stop offset="100%" stopColor="#334155"/>
                </linearGradient>
              </defs>

              {/* FONDO REGIONAL: TERRENO EXTERIOR */}
              <rect x="0" y="0" width="980" height="720" fill="#090d16" />

              {/* ---------------- 1. ZONAS Y BARRIOS EXTERIORES LINDEROS ---------------- */}
              
              {/* Santa Bárbara (Oeste del Corredor Bancalari) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Santa Bárbara')}>
                <polygon points="10,650 100,650 90,360 10,380" fill="#1e293b" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7" />
                <ellipse cx="50" cy="510" rx="30" ry="80" fill="#0369a1" opacity="0.4" />
                <text x="25" y="490" fill="#94a3b8" fontSize="12" fontWeight="bold">SANTA</text>
                <text x="20" y="506" fill="#94a3b8" fontSize="12" fontWeight="bold">BÁRBARA</text>
                <text x="18" y="522" fill="#64748b" fontSize="10">(Laguna 55 ha)</text>
              </g>

              {/* Complejo Villa Nueva (Norte de la Ruta 27) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Complejo Villa Nueva')}>
                <polygon points="260,10 740,10 720,70 280,70" fill="#1e293b" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7" />
                <text x="440" y="38" fill="#38bdf8" fontSize="13" fontWeight="900" letterSpacing="1">COMPLEJO VILLA NUEVA</text>
                <text x="390" y="54" fill="#94a3b8" fontSize="11">Santa Teresa • Santa Clara • San Marco • San Isidro Labrador</text>
              </g>

              {/* Rincón de Milberg / Tigre (Este de Camino de los Remeros) */}
              <text x="850" y="520" fill="#475569" fontSize="12" fontWeight="bold" transform="rotate(75, 850, 520)">
                HACIA TIGRE CENTRO / ACCESO TIGRE
              </text>

              {/* ---------------- 2. PERÍMETRO GENERAL NORDELTA (1.600 HA) ---------------- */}
              <polygon points="160,670 210,680 500,690 730,550 820,350 790,150 630,90 280,80 150,220 120,500"
                       fill="url(#nmPerimeterGrad)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" />
              <text x="220" y="705" fill="#3b82f6" fontSize="11" fontWeight="bold" opacity="0.8">
                LÍMITE MASTERPLAN NORDELTA (1.600 HECTÁREAS)
              </text>

              {/* ---------------- 3. RÍO LUJÁN Y CANALES (NORESTE) ---------------- */}
              <path d="M 720,40 Q 820,100 870,200 T 960,320" 
                    fill="none" stroke="#0284c7" strokeWidth="22" strokeLinecap="round" opacity="0.75" />
              <text x="840" y="150" fill="#7dd3fc" fontSize="12" fontWeight="900" transform="rotate(50, 840, 150)">
                RÍO LUJÁN (Navegable al Delta)
              </text>

              {/* ---------------- 4. RED VIAL EXTERIOR: LAS GRANDES LATERALES ---------------- */}
              
              {/* A. CORREDOR BANCALARI (LATERAL OESTE) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Corredor Bancalari')}>
                {/* Asfalto */}
                <path d="M 115,715 L 115,480 Q 115,350 145,210 T 260,80" 
                      fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
                <path d="M 115,715 L 115,480 Q 115,350 145,210 T 260,80" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Línea central amarilla */}
                <path d="M 115,715 L 115,480 Q 115,350 145,210 T 260,80" 
                      fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,5" />
                
                {/* Cartel explicativo vertical */}
                <rect x="25" y="600" width="170" height="26" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="32" y="617" fill="#fbbf24" fontSize="11" fontWeight="900">
                  CORREDOR BANCALARI
                </text>
                <text x="45" y="640" fill="#94a3b8" fontSize="10">
                  ↓ Hacia Panamericana Sur / CABA
                </text>
              </g>

              {/* Vías del Ferrocarril Mitre (Paralelo a Bancalari) */}
              <path d="M 95,715 L 95,470 Q 95,350 125,200 T 240,75" 
                    fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="4,4" opacity="0.6" />
              <text x="65" y="420" fill="#64748b" fontSize="10" transform="rotate(-75, 65, 420)">
                FFCC Mitre (Zárate / Ballester)
              </text>

              {/* B. RUTA PROVINCIAL 27 (LATERAL NORTE Y ESTE) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Ruta Provincial 27')}>
                {/* Asfalto */}
                <path d="M 250,75 L 620,85 Q 730,90 770,160 T 830,340 T 890,560" 
                      fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
                <path d="M 250,75 L 620,85 Q 730,90 770,160 T 830,340 T 890,560" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Línea central */}
                <path d="M 250,75 L 620,85 Q 730,90 770,160 T 830,340 T 890,560" 
                      fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="7,5" />
                
                {/* Carteles Ruta 27 */}
                <rect x="360" y="70" width="165" height="24" rx="6" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                <text x="370" y="86" fill="#34d399" fontSize="11" fontWeight="900">
                  RUTA 27 (LATERAL NORTE)
                </text>
              </g>

              {/* C. CAMINO DE LOS REMEROS (LATERAL ESTE) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Camino de los Remeros')}>
                <path d="M 830,340 Q 860,450 880,590 T 910,710" 
                      fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
                <path d="M 830,340 Q 860,450 880,590 T 910,710" 
                      fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <path d="M 830,340 Q 860,450 880,590 T 910,710" 
                      fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,4" />
                <rect x="800" y="440" width="165" height="24" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="808" y="456" fill="#7dd3fc" fontSize="11" fontWeight="900">
                  CAMINO DE LOS REMEROS
                </text>
                <text x="825" y="478" fill="#94a3b8" fontSize="10">
                  ↓ Directo a Ramal Tigre
                </text>
              </g>

              {/* ---------------- 5. RED VIAL INTERNA DE NORDELTA ---------------- */}

              {/* AVENIDA DE LOS LAGOS (TRONCAL - 8 KM) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Avenida de los Lagos')}>
                {/* Base Asfalto */}
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 600,90" 
                      fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 600,90" 
                      fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
                <path d="M 125,540 Q 220,535 300,520 T 400,430 T 470,290 T 540,170 T 600,90" 
                      fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="7,5" />
                <text x="415" y="420" fill="#fef08a" fontSize="12" fontWeight="900" transform="rotate(-54, 415, 420)">
                  Av. de los Lagos (Troncal 8 km)
                </text>
              </g>

              {/* Ramal Secundario hacia Golf */}
              <path d="M 400,430 Q 320,380 290,260 T 320,130" 
                    fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.75" />
              <text x="290" y="320" fill="#fde68a" fontSize="10" fontWeight="bold" transform="rotate(-75, 290, 320)">
                Av. del Golf
              </text>

              {/* Ramal Secundario hacia Bahía Grande */}
              <path d="M 470,290 Q 570,305 680,315 T 780,325" 
                    fill="none" stroke="#f59e0b" strokeWidth="3.5" opacity="0.75" />
              <text x="610" y="300" fill="#fde68a" fontSize="10" fontWeight="bold">
                Av. de la Bahía
              </text>

              {/* ---------------- 6. LAGOS Y ESPEJOS DE AGUA DE NORDELTA ---------------- */}
              
              {/* LAGO CENTRAL (180 HECTÁREAS) */}
              <path d="M 370,510 C 350,440 400,390 380,320 C 370,270 450,230 490,250 C 550,280 530,360 480,400 C 450,420 450,490 400,520 Z" 
                    fill="url(#nmWaterGrad)" filter="drop-shadow(0 0 10px rgba(14, 165, 233, 0.45))" />
              <text x="420" y="350" fill="#e0f2fe" fontSize="14" fontWeight="900" letterSpacing="1">LAGO CENTRAL</text>
              <text x="445" y="366" fill="#bae6fd" fontSize="12" fontWeight="bold">(180 ha)</text>

              {/* Lago Castaños / Alisos (Sur) */}
              <ellipse cx="280" cy="590" rx="45" ry="30" fill="url(#nmWaterGrad)" />

              {/* Lago Barrancas / Tipa */}
              <ellipse cx="550" cy="420" rx="40" ry="24" fill="url(#nmWaterGrad)" />

              {/* Lago Carpinchos */}
              <ellipse cx="660" cy="210" rx="45" ry="26" fill="url(#nmWaterGrad)" />

              {/* Canal Náutico El Yacht / Bahía Grande con salida al Río Luján */}
              <path d="M 720,260 Q 770,270 810,240 T 870,200" 
                    fill="none" stroke="#0284c7" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
              <text x="770" y="235" fill="#7dd3fc" fontSize="11" fontWeight="bold">Canal Mayor al Río</text>

              {/* ---------------- 7. POLOS URBANOS Y SERVICIOS ---------------- */}

              {/* Centro Comercial Nordelta & Cines & Sanatorio Las Lomas */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Ruta Provincial 27')}>
                <rect x="670" y="360" width="90" height="46" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <text x="678" y="378" fill="#c7d2fe" fontSize="11" fontWeight="900">CENTRO COMERCIAL</text>
                <text x="678" y="392" fill="#a5b4fc" fontSize="10">Jumbo, Cines, Bancos</text>
                <text x="678" y="402" fill="#f472b6" fontSize="9">Sanatorio Las Lomas</text>
              </g>

              {/* Bahía Grande y Hotel Wyndham */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Ruta Provincial 27')}>
                <rect x="735" y="295" width="85" height="42" rx="8" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
                <text x="745" y="313" fill="#bbf7d0" fontSize="11" fontWeight="900">BAHÍA GRANDE</text>
                <text x="745" y="327" fill="#86efac" fontSize="10">Marina & Gastronomía</text>
                <text x="745" y="335" fill="#a7f3d0" fontSize="9">Hotel Wyndham</text>
              </g>

              {/* Cancha de Golf Nicklaus */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Golf')}>
                <path d="M 240,170 C 280,140 370,160 350,220 C 320,250 240,230 240,170 Z" 
                      fill="#064e3b" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7" />
                <text x="260" y="195" fill="#6ee7b7" fontSize="11" fontWeight="900">GOLF CLUB (18 Hoyos)</text>
                <text x="265" y="210" fill="#a7f3d0" fontSize="10">Jack Nicklaus Design</text>
              </g>

              {/* Polo Educativo (Colegios) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Palmar')}>
                <rect x="360" y="565" width="80" height="34" rx="6" fill="#701a75" stroke="#f472b6" strokeWidth="1.5" />
                <text x="368" y="580" fill="#fbcfe8" fontSize="11" fontWeight="bold">COLEGIOS</text>
                <text x="368" y="593" fill="#f472b6" fontSize="10">Northlands, Michael Ham</text>
              </g>

              {/* ---------------- 8. ACCESOS / ENTRADAS (GARITAS DE CONTROL) ---------------- */}

              {/* Acceso Sur (Lateral Bancalari) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Corredor Bancalari')}>
                <circle cx="125" cy="540" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="55" y="500" width="135" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="62" y="516" fill="#fca5a5" fontSize="10" fontWeight="900">
                  GARITA BANCALARI (SUR)
                </text>
              </g>

              {/* Acceso Norte (Lateral Ruta 27) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Ruta Provincial 27')}>
                <circle cx="600" cy="90" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="525" y="58" width="145" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="532" y="74" fill="#fca5a5" fontSize="10" fontWeight="900">
                  GARITA BENAVÍDEZ (NORTE)
                </text>
              </g>

              {/* Acceso Remeros (Lateral Este) */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Camino de los Remeros')}>
                <circle cx="830" cy="340" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <rect x="755" y="355" width="135" height="24" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="762" y="371" fill="#fca5a5" fontSize="10" fontWeight="900">
                  GARITA REMEROS (ESTE)
                </text>
              </g>

              {/* ---------------- 9. NODOS DE LOS BARRIOS ---------------- */}

              {/* Castaños */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Castaños')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="180" y="550" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Castaños' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Castaños' ? 3 : 1.8} />
                <text x="192" y="566" fill="#ffffff" fontSize="12" fontWeight="900">Castaños</text>
                <text x="192" y="578" fill="#93c5fd" fontSize="10">Pegado a entrada</text>
              </g>

              {/* Las Glorietas */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Las Glorietas')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="185" y="465" width="85" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Las Glorietas' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Las Glorietas' ? 3 : 1.8} />
                <text x="195" y="481" fill="#ffffff" fontSize="12" fontWeight="900">Las Glorietas</text>
                <text x="195" y="493" fill="#93c5fd" fontSize="10">Muy arbolado</text>
              </g>

              {/* Los Alisos */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Los Alisos')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="300" y="605" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Alisos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Alisos' ? 3 : 1.8} />
                <text x="310" y="621" fill="#ffffff" fontSize="12" fontWeight="900">Los Alisos</text>
                <text x="310" y="633" fill="#93c5fd" fontSize="10">Lago 10 ha</text>
              </g>

              {/* El Palmar */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Palmar')} opacity={filterCategory === 'todos' || filterCategory === 'sur' ? 1 : 0.2}>
                <rect x="280" y="535" width="68" height="32" rx="7" fill="#312e81" stroke={selectedKey === 'El Palmar' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'El Palmar' ? 3 : 1.5} />
                <text x="288" y="551" fill="#ffffff" fontSize="11" fontWeight="bold">El Palmar</text>
                <text x="288" y="562" fill="#c7d2fe" fontSize="10">Townhouses</text>
              </g>

              {/* La Isla */}
              <g className="cursor-pointer" onClick={() => handleItemClick('La Isla')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="385" y="325" width="65" height="34" rx="8" fill="#831843" stroke={selectedKey === 'La Isla' ? '#38bdf8' : '#f472b6'} strokeWidth={selectedKey === 'La Isla' ? 3 : 2.2} />
                <text x="396" y="342" fill="#ffffff" fontSize="12" fontWeight="900">La Isla</text>
                <text x="396" y="353" fill="#fbcfe8" fontSize="10">Exclusivo</text>
              </g>

              {/* Los Castores */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Los Castores')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="255" y="375" width="85" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Castores' ? '#38bdf8' : '#38bdf8'} strokeWidth={selectedKey === 'Los Castores' ? 3 : 1.8} />
                <text x="265" y="391" fill="#ffffff" fontSize="12" fontWeight="900">Los Castores</text>
                <text x="265" y="403" fill="#bae6fd" fontSize="10">Lago Central</text>
              </g>

              {/* Barrancas del Lago */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Barrancas del Lago')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="500" y="460" width="95" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Barrancas del Lago' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Barrancas del Lago' ? 3 : 1.8} />
                <text x="508" y="476" fill="#ffffff" fontSize="11" fontWeight="900">Barrancas Lago</text>
                <text x="508" y="488" fill="#93c5fd" fontSize="10">Estilo Colonial</text>
              </g>

              {/* Portezuelo */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Portezuelo')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="550" y="515" width="75" height="32" rx="7" fill="#312e81" stroke={selectedKey === 'Portezuelo' ? '#38bdf8' : '#818cf8'} strokeWidth={selectedKey === 'Portezuelo' ? 3 : 1.5} />
                <text x="558" y="531" fill="#ffffff" fontSize="11" fontWeight="bold">Portezuelo</text>
                <text x="558" y="542" fill="#c7d2fe" fontSize="10">Condominios</text>
              </g>

              {/* Las Caletas */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Las Caletas')} opacity={filterCategory === 'todos' || filterCategory === 'nautico' ? 1 : 0.2}>
                <rect x="620" y="445" width="78" height="34" rx="8" fill="#0f766e" stroke={selectedKey === 'Las Caletas' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'Las Caletas' ? 3 : 1.8} />
                <text x="628" y="461" fill="#ffffff" fontSize="11" fontWeight="900">Las Caletas</text>
                <text x="628" y="473" fill="#99f6e4" fontSize="10">Amarras directas</text>
              </g>

              {/* Los Sauces */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Los Sauces')} opacity={filterCategory === 'todos' || filterCategory === 'centro' ? 1 : 0.2}>
                <rect x="370" y="220" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Los Sauces' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Sauces' ? 3 : 1.8} />
                <text x="380" y="236" fill="#ffffff" fontSize="12" fontWeight="900">Los Sauces</text>
                <text x="380" y="248" fill="#93c5fd" fontSize="10">Muy central</text>
              </g>

              {/* Los Tilos */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Los Tilos')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="460" y="190" width="68" height="32" rx="7" fill="#1e3a8a" stroke={selectedKey === 'Los Tilos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Los Tilos' ? 3 : 1.5} />
                <text x="470" y="206" fill="#ffffff" fontSize="11" fontWeight="bold">Los Tilos</text>
                <text x="470" y="217" fill="#93c5fd" fontSize="10">Familiar</text>
              </g>

              {/* La Alameda */}
              <g className="cursor-pointer" onClick={() => handleItemClick('La Alameda')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="525" y="145" width="75" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'La Alameda' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'La Alameda' ? 3 : 1.8} />
                <text x="533" y="161" fill="#ffffff" fontSize="11" fontWeight="900">La Alameda</text>
                <text x="533" y="173" fill="#93c5fd" fontSize="10">Lago 7 ha</text>
              </g>

              {/* El Tipa */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Tipa')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="435" y="140" width="68" height="32" rx="7" fill="#1e3a8a" stroke={selectedKey === 'El Tipa' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'El Tipa' ? 3 : 1.5} />
                <text x="447" y="156" fill="#ffffff" fontSize="11" fontWeight="bold">El Tipa</text>
                <text x="447" y="167" fill="#93c5fd" fontSize="10">Cerca Norte</text>
              </g>

              {/* El Golf */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Golf')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="290" y="115" width="72" height="34" rx="8" fill="#065f46" stroke={selectedKey === 'El Golf' ? '#38bdf8' : '#34d399'} strokeWidth={selectedKey === 'El Golf' ? 3 : 2} />
                <text x="304" y="131" fill="#ffffff" fontSize="12" fontWeight="900">El Golf</text>
                <text x="300" y="143" fill="#a7f3d0" fontSize="10">Cancha Nicklaus</text>
              </g>

              {/* Carpinchos */}
              <g className="cursor-pointer" onClick={() => handleItemClick('Carpinchos')} opacity={filterCategory === 'todos' || filterCategory === 'norte' ? 1 : 0.2}>
                <rect x="625" y="160" width="78" height="34" rx="8" fill="#1e3a8a" stroke={selectedKey === 'Carpinchos' ? '#38bdf8' : '#60a5fa'} strokeWidth={selectedKey === 'Carpinchos' ? 3 : 1.8} />
                <text x="635" y="176" fill="#ffffff" fontSize="11" fontWeight="900">Carpinchos</text>
                <text x="635" y="188" fill="#93c5fd" fontSize="10">Lago 16 ha</text>
              </g>

              {/* El Yacht */}
              <g className="cursor-pointer" onClick={() => handleItemClick('El Yacht')} opacity={filterCategory === 'todos' || filterCategory === 'nautico' ? 1 : 0.2}>
                <rect x="720" y="180" width="72" height="34" rx="8" fill="#0f766e" stroke={selectedKey === 'El Yacht' ? '#38bdf8' : '#2dd4bf'} strokeWidth={selectedKey === 'El Yacht' ? 3 : 2} />
                <text x="734" y="196" fill="#ffffff" fontSize="12" fontWeight="900">El Yacht</text>
                <text x="728" y="208" fill="#99f6e4" fontSize="10">Río Luján</text>
              </g>

            </svg>
          </div>

        </div>

        {/* 4. FICHA TÉCNICA LATERAL (4 columnas) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          
          <div className="border-b border-white/10 pb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wide inline-block ${
              activeItem.isStreet 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {activeItem.tag}
            </span>
            <h4 className="text-2xl font-black text-white mt-2">
              {activeItem.title}
            </h4>
            <p className="text-xs text-slate-400">
              {activeItem.subtitle}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {activeItem.commute && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                <span className="text-slate-400">Tiempo / Conexión:</span>
                <span className="font-black text-emerald-400 font-mono text-sm">{activeItem.commute}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
              <span className="text-slate-400">Tipo de Infraestructura:</span>
              <span className="font-bold text-white text-right">{activeItem.type}</span>
            </div>

            {activeItem.lots && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/10">
                <span className="text-slate-400">Superficie de Lotes:</span>
                <span className="font-bold text-white">{activeItem.lots}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
              <span className="text-slate-400 font-bold block text-xs">Detalle Geográfico & Tránsito:</span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {activeItem.desc}
              </p>
            </div>
          </div>

          {/* Guía Visual Rápida de Orientación */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-2">
            <strong className="text-amber-300 font-black block flex items-center gap-1.5">
              <Navigation size={13} /> Orientación Territorial Real:
            </strong>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>
                <span className="font-bold text-amber-400">Oeste (Lateral izquierdo):</span> <strong>Corredor Bancalari</strong> corre de Sur a Norte, con Santa Bárbara al otro lado de la vía.
              </li>
              <li>
                <span className="font-bold text-emerald-400">Norte (Borde superior):</span> <strong>Ruta 27</strong> comunica Benavídez centro con el Complejo Villa Nueva y Tigre.
              </li>
              <li>
                <span className="font-bold text-cyan-400">Este (Lateral derecho):</span> <strong>Camino de los Remeros</strong> y el <strong>Río Luján</strong> (salida náutica).
              </li>
              <li>
                <span className="font-bold text-blue-400">Centro:</span> La <strong>Avenida de los Lagos</strong> cruza por dentro uniendo la garita Bancalari con la garita Benavídez.
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  )
}
