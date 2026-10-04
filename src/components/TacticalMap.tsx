import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { Crosshair } from 'lucide-react'
import type { Feature, LineString, Polygon } from 'geojson'
import type { Renseignement, Unite } from '../types'
import { couleurAmie, echelonChiffre, typeUniteSidc, typeUniteStyle } from '../uniteStyle'
import { cotationClassName, sidcRenseignement, sourceLabel, statutRenseignementStyle, typeMenaceLabel } from '../renseignementStyle'
import { formatHeure } from '../data/coordonnees'
import { niveauStyle, type NiveauStock } from '../logistiqueStyle'

function symboleSvg(unite: Pick<Unite, 'typeUnite'>, taille: number) {
  return new ms.Symbol(typeUniteSidc[unite.typeUnite], { size: taille, fillColor: couleurAmie }).asSVG()
}

function symboleMenaceSvg(r: Pick<Renseignement, 'typeMenace' | 'affiliation'>, taille: number) {
  return new ms.Symbol(sidcRenseignement(r), { size: taille }).asSVG()
}

const LEGENDE_MENACES: { label: string; r: Pick<Renseignement, 'typeMenace' | 'affiliation'> }[] = [
  { label: 'Hostile', r: { typeMenace: 'infanterie', affiliation: 'hostile' } },
  { label: 'Suspect', r: { typeMenace: 'infanterie', affiliation: 'suspect' } },
  { label: 'Non identifié', r: { typeMenace: 'inconnu', affiliation: 'inconnu' } },
  { label: 'Engin explosif', r: { typeMenace: 'engin_explosif', affiliation: 'hostile' } },
]

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'
// Recentré au nord pour cadrer aussi les menaces au-delà de PL ROUGE.
const CENTRE_INITIAL: [number, number] = [-11.98, 18.026]
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
  renseignements: Renseignement[]
  niveauLogistiqueParUnite: Record<string, NiveauStock>
  selectedUniteId: string | null
  onSelectUnite: (id: string) => void
  selectedRenseignementId: string | null
  onSelectRenseignement: (id: string) => void
  // Mode placement : le prochain clic sur la carte renvoie ses coordonnées.
  modePlacement: boolean
  onPlacer: (lon: number, lat: number) => void
  onAnnulerPlacement: () => void
}

export function TacticalMap({
  unites,
  renseignements,
  niveauLogistiqueParUnite,
  selectedUniteId,
  onSelectUnite,
  selectedRenseignementId,
  onSelectRenseignement,
  modePlacement,
  onPlacer,
  onAnnulerPlacement,
}: TacticalMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const marqueursMenacesRef = useRef<maplibregl.Marker[]>([])
  const pastillesLogRef = useRef(new Map<string, HTMLElement>())
  const [carteChargee, setCarteChargee] = useState(false)
  const onSelectUniteRef = useRef(onSelectUnite)
  onSelectUniteRef.current = onSelectUnite
  const onSelectRenseignementRef = useRef(onSelectRenseignement)
  onSelectRenseignementRef.current = onSelectRenseignement
  const modePlacementRef = useRef(modePlacement)
  modePlacementRef.current = modePlacement
  const onPlacerRef = useRef(onPlacer)
  onPlacerRef.current = onPlacer

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
        layout: {
          'symbol-placement': 'line',
          'text-field': 'PL ROUGE',
          // Police servie par OpenFreeMap (la police par défaut de MapLibre y renvoie 404).
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-offset': [0, -0.8],
        },
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
          <span class="mt-1 flex items-center gap-1 whitespace-nowrap rounded bg-slate-950/80 px-1 text-[10px] text-slate-300">
            <span data-pastille-log class="inline-block h-1.5 w-1.5 rounded-full"></span>${unite.nom}
          </span>
        `
        pastillesLogRef.current.set(unite.id, el.querySelector('[data-pastille-log]')!)
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectUniteRef.current(unite.id)
        })
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([unite.lon, unite.lat]).addTo(map)
      })
      setCarteChargee(true)
    })

    map.on('click', (e) => {
      if (!modePlacementRef.current) return
      onPlacerRef.current(e.lngLat.lng, e.lngLat.lat)
    })

    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
      setCarteChargee(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Menaces : redessinées à chaque changement de la liste (création, statut),
  // contrairement aux unités amies qui sont fixes pendant la session.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteChargee) return
    marqueursMenacesRef.current.forEach((m) => m.remove())
    marqueursMenacesRef.current = renseignements
      .filter((r) => r.statut !== 'neutralise')
      .map((r) => {
        const el = document.createElement('button')
        el.className = 'flex flex-col items-center cursor-pointer'
        el.style.opacity = r.statut === 'perime' ? '0.45' : '1'
        el.title = r.titre
        el.innerHTML = `<span class="drop-shadow-md">${symboleMenaceSvg(r, 22)}</span>`
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          if (modePlacementRef.current) return
          onSelectRenseignementRef.current(r.id)
        })
        return new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([r.lon, r.lat]).addTo(map)
      })
  }, [renseignements, carteChargee])

  // Pastille devant le nom de l'unité : pire niveau de ses stocks.
  useEffect(() => {
    if (!carteChargee) return
    pastillesLogRef.current.forEach((el, uniteId) => {
      const niveau = niveauLogistiqueParUnite[uniteId]
      el.style.background = niveau ? niveauStyle[niveau].pastille : 'transparent'
      el.title = niveau ? `Logistique : ${niveauStyle[niveau].label.toLowerCase()}` : ''
    })
  }, [niveauLogistiqueParUnite, carteChargee])

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas()
    if (canvas) canvas.style.cursor = modePlacement ? 'crosshair' : ''
  }, [modePlacement, carteChargee])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    popupRef.current?.remove()

    const rens = renseignements.find((r) => r.id === selectedRenseignementId)
    if (rens) {
      const contenu = document.createElement('div')
      contenu.className = 'max-w-60'
      contenu.innerHTML = `
        <div class="mb-1 flex items-center gap-2">
          ${symboleMenaceSvg(rens, 16)}
          <span data-titre class="font-bold text-slate-100"></span>
        </div>
        <div class="mb-2 flex flex-wrap items-center gap-1 text-[10px]">
          <span class="rounded border px-1 font-bold ${cotationClassName(rens)}">${rens.fiabiliteSource}${rens.credibiliteInfo}</span>
          <span class="text-slate-400">${sourceLabel[rens.source]} · ${typeMenaceLabel[rens.typeMenace]}</span>
          <span class="rounded px-1 font-bold uppercase ${statutRenseignementStyle[rens.statut].className}">${statutRenseignementStyle[rens.statut].label}</span>
        </div>
        <div class="flex justify-between text-slate-400 text-xs">
          <span>${rens.coordonneesMgrs}</span>
          <span class="ml-3">Obs. ${formatHeure(rens.horodatageObservation)}</span>
        </div>
      `
      // Titre saisi par un utilisateur : textContent, jamais innerHTML.
      contenu.querySelector('[data-titre]')!.textContent = rens.titre
      popupRef.current = new maplibregl.Popup({ offset: 18, className: 'popup-tactique' })
        .setLngLat([rens.lon, rens.lat])
        .setDOMContent(contenu)
        .addTo(map)
      return
    }

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
  }, [selectedUniteId, unites, selectedRenseignementId, renseignements])

  function recentrer() {
    mapRef.current?.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
  }

  return (
    <div className={`relative flex-1 overflow-hidden bg-slate-950 ${modePlacement ? 'placement-actif' : ''}`}>
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
        <div className="mb-2 mt-3 font-bold uppercase tracking-wide text-slate-500">Menaces</div>
        <div className="space-y-1.5">
          {LEGENDE_MENACES.map(({ label, r }) => (
            <div key={label} className="flex items-center gap-2">
              <span dangerouslySetInnerHTML={{ __html: symboleMenaceSvg(r, 14) }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {modePlacement && (
        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-3 rounded border border-red-600 bg-slate-900/95 px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-300">
          Cliquez sur la carte pour positionner le renseignement
          <button
            onClick={onAnnulerPlacement}
            className="rounded border border-slate-600 px-2 py-0.5 text-slate-300 hover:bg-slate-800"
          >
            Annuler
          </button>
        </div>
      )}

      <button
        onClick={recentrer}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 backdrop-blur hover:bg-slate-800"
      >
        <Crosshair size={13} /> Recentrer
      </button>

      <div className="pointer-events-none absolute bottom-4 left-4 rounded border border-slate-700 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-400 backdrop-blur">
        <div>MGRS 29Q JV</div>
        <div>ÉCH 1:50 000 · GRILLE 1 km</div>
      </div>

      <div className="pointer-events-none absolute bottom-9 right-6 text-xs font-bold text-slate-400">N ▲</div>
    </div>
  )
}
