import { forward } from 'mgrs'

export function formatMgrs(lon: number, lat: number): string {
  const brut = forward([lon, lat], 3)
  const zoneBande = brut.slice(0, 3)
  const carre = brut.slice(3, 5)
  const reste = brut.slice(5)
  const milieu = reste.length / 2
  return `${zoneBande} ${carre} ${reste.slice(0, milieu)} ${reste.slice(milieu)}`
}

export function formatHeure(horodatage: string): string {
  const d = new Date(horodatage)
  return `${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}`
}
