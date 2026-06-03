import { CoachProfile } from './types'

export const coaches: CoachProfile[] = [
  { email: 'damianbiniarz@gmail.com', name: 'Damian Biniarz', role: 'admin' },
  { email: 'alexsundqvist@hotmail.com', name: 'Alex Sundqvist', role: 'coach' },
  { email: 'simonhjelte@gmail.com', name: 'Simon Hjelte', role: 'coach' },
  { email: 'andre-andersson@live.se', name: 'Andre Andersson', role: 'coach' },
]

export function getCoachName(email: string): string {
  return coaches.find(c => c.email.toLowerCase() === email.toLowerCase())?.name || email
}

export function isAuthorized(email: string): boolean {
  return coaches.some(c => c.email.toLowerCase() === email.toLowerCase())
}
