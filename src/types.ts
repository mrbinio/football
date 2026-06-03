export interface Player {
  id: string
  name: string
  number: number
  position: string
  shirtName: string
  photoURL?: string
}

export interface Lineup {
  id: string
  matchDate: string
  opponent: string
  title: string
  formation: string
  positions: Record<string, string>
  bench: string[]
  notes: string
  result: string
  scorers: string
  rating: number
  createdBy: string
  createdByName: string
  createdAt: number
}

export type Formation = {
  name: string
  positions: { key: string; label: string; x: number; y: number }[]
}

export interface CoachProfile {
  email: string
  name: string
  role: 'admin' | 'coach'
}
