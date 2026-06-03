export interface Player {
  id: string
  name: string
  number: number
  position: string
  photoURL?: string
}

export interface Lineup {
  id: string
  matchDate: string
  opponent: string
  formation: string
  positions: Record<string, string> // positionKey -> playerId
  bench: string[] // playerIds
  createdBy: string
  createdAt: number
}

export type Formation = {
  name: string
  positions: { key: string; label: string; x: number; y: number }[]
}
