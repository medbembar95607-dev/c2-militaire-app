import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { Crosshair } from 'lucide-react'
import type { Feature, LineString, Polygon } from 'geojson'
import type { Unite } from '../types'
import { couleurAmie, echelonChiffre, typeUniteSidc, typeUniteStyle } from '../uniteStyle'

function symboleSvg(unite: Pick<Unite, 'typeUnite'>, taille: number) {
  return new ms.Symbol(typeUniteSidc[unite.typeUnite], { size: taille, fillColor: couleurAmie }).asSVG()
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'
const CENTRE_INITIAL: [number, number] = [-11.98, 18.02]
const ZOOM_INITIAL = 13.2

const LIMITE_GTIA: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-12.004, 18.001],
        [-11.953, 18.001],
        [-11.953, 18.036],
        [-12.004, 18.036],
        [-12.004, 18.001],
      ],
    ],
  },
}

const PL_ROUGE: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [-12.001, 18.012],
      [-11.955, 18.028],
    ],
  },
}

interface TacticalMapProps {
  unites: Unite[]
  selectedUniteId: string | null
  onSelectUnite: (id: string) => void
}

export function TacticalMap({ unites, selectedUniteId, onSelectUnite }: TacticalMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const onSelectUniteRef = useRef(onSelectUnite)
  onSelectUniteRef.current = onSelectUnite

  useEffect(() => {
    if (!conteneurRef.current) return

    const map = new maplibregl.Map({
      container: conteneurRef.current,
      style: STYLE_URL,
      center: CENTRE_INITIAL,
      zoom: ZOOM_INITIAL,
    })
    mapRef.current = map
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right')

    const observateurTaille = new ResizeObserver(() => map.resize())
    observateurTaille.observe(conteneurRef.current)

    map.on('load', () => {
      map.addSource('limite-gtia', { type: 'geojson', data: LIMITE_GTIA })
      map.addLayer({
        id: 'limite-gtia-line',
        type: 'line',
        source: 'limite-gtia',
        paint: { 'line-color': '#94a3b8', 'line-width': 1.5, 'line-dasharray': [3, 2] },
      })

      map.addSource('pl-rouge', { type: 'geojson', data: PL_ROUGE })
      map.addLayer({
        id: 'pl-rouge-line',
        type: 'line',
        source: 'pl-rouge',
        paint: { 'line-color': '#f87171', 'line-width': 2, 'line-dasharray': [4, 3] },
      })
      map.addLayer({
        id: 'pl-rouge-label',
        type: 'symbol',
        source: 'pl-rouge',
        layout: { 'symbol-placement': 'line', 'text-field': 'PL ROUGE', 'text-size': 11, 'text-offset': [0, -0.8] },
        paint: { 'text-color': '#f87171' },
      })

      unites.forEach((unite) => {
        const el = document.createElement('button')
        el.className = 'flex flex-col items-center cursor-pointer'
        el.innerHTML = `
          ${
            echelonChiffre[unite.echelon]
              ? `<span class="mb-0.5 text-[11px] font-bold text-white" style="text-shadow:0 1px 3px #000">${echelonChiffre[unite.echelon]}</span>`
              : ''
          }
          <span class="drop-shadow-md">${symboleSvg(unite, 24)}</span>
          <span class="mt-1 whitespace-nowrap rounded bg-slate-950/80 px-1 text-[10px] text-slate-300">${unite.nom}</span>
        `
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectUniteRef.current(unite.id)
        })
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([unite.lon, unite.lat]).addTo(map)
      })
    })

    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    popupRef.current?.remove()
    if (!selectedUniteId) return
    const unite = unites.find((u) => u.id === selectedUniteId)
    if (!unite) return

    const contenu = document.createElement('div')
    contenu.innerHTML = `
      <div class="mb-2 flex items-center gap-2">
        ${symboleSvg(unite, 16)}
        <span class="font-bold text-slate-100">${unite.nom}</span>
      </div>
      <div class="flex justify-between text-slate-400 text-xs">
        <span>${unite.coordonneesMgrs}</span>
        <span class="ml-3">Vu à ${unite.vuA}</span>
      </div>
    `

    popupRef.current = new maplibregl.Popup({ offset: 28, className: 'popup-tactique' })
      .setLngLat([unite.lon, unite.lat])
      .setDOMContent(contenu)
      .addTo(map)
  }, [selectedUniteId, unites])

  function recentrer() {
    mapRef.current?.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-950">
      <div ref={conteneurRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-4 top-4 w-44 rounded border border-slate-700 bg-slate-900/90 p-3 text-xs text-slate-300 backdrop-blur">
        <div className="mb-2 font-bold uppercase tracking-wide text-slate-500">Symbologie</div>
        <div className="space-y-1.5">
          {(Object.keys(typeUniteStyle) as Array<keyof typeof typeUniteStyle>).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <span dangerouslySetInnerHTML={{ __html: symboleSvg({ typeUnite: type }, 16) }} />
              {typeUniteStyle[type].label}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={recentrer}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 backdrop-blur hover:bg-slate-800"
      >
        <Crosshair size={13} /> Recentrer
      </button>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded border border-slate-700 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-400 backdrop-blur">
        <div>MGRS 31U DQ</div>
        <div>ÉCH 1:50 000 · GRILLE 1 km</div>
      </div>

      <div className="pointer-events-none absolute bottom-9 right-6 text-xs font-bold text-slate-400">N ▲</div>
    </div>
  )
}
