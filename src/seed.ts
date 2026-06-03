import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

const initialPlayers = [
  { name: 'Adam Kiersznikiewicz Maburi', shirtName: 'Kiersznikiewicz Maburi', number: 8, position: 'CM' },
  { name: 'Alexander Dziuba', shirtName: 'Dziuba', number: 6, position: 'CB' },
  { name: 'Caspian Pazaj Dahlqvist', shirtName: 'Pazaj Dahlqvist', number: 12, position: 'LW' },
  { name: 'Elias Hasani', shirtName: 'Hasani', number: 13, position: 'ST' },
  { name: 'Elias Lundqvist Good', shirtName: 'Lundqvist Good', number: 10, position: 'CM' },
  { name: 'Elijah Russom', shirtName: 'Russom', number: 3, position: 'CB' },
  { name: 'Frans Johansson', shirtName: 'Johansson', number: 19, position: 'RW' },
  { name: 'Hugo Ekstam', shirtName: 'Ekstam', number: 18, position: 'CB' },
  { name: 'Kian Svedberg', shirtName: 'Svedberg', number: 7, position: 'CM' },
  { name: 'Leon Biniarz', shirtName: 'Biniarz', number: 9, position: 'ST' },
  { name: 'Liam Siewer Claesson', shirtName: 'Siewer Claesson', number: 11, position: 'LW' },
  { name: 'Melker Gustafsson', shirtName: 'Gustafsson', number: 16, position: 'RW' },
  { name: 'Målvakt', shirtName: 'GK', number: 1, position: 'GK' },
  { name: 'Samuel Hjelte', shirtName: 'Hjelte', number: 5, position: 'CB' },
  { name: 'Vincent Leikman', shirtName: 'V. Leikman', number: 17, position: 'LM' },
]

const initialCoaches = [
  { name: 'Alexander Sundqvist' },
  { name: 'Simon Hjelte' },
  { name: 'André Leikman' },
]

// Names to remove from players collection (coaches added by mistake)
const coachPlayerNames = ['Alexander Sundqvist', 'Simon Hjelte', 'André Leikman']

export async function seedPlayers() {
  // --- Players ---
  const playersSnap = await getDocs(collection(db, 'players'))
  const existingPlayers = playersSnap.docs.map(d => ({ id: d.id, name: d.data().name as string }))

  // Remove coaches from players if mistakenly added
  for (const entry of existingPlayers) {
    if (coachPlayerNames.includes(entry.name)) {
      await deleteDoc(doc(db, 'players', entry.id))
    }
  }

  // Add missing players
  const playerNames = existingPlayers.map(e => e.name).filter(n => !coachPlayerNames.includes(n))
  const playersToAdd = initialPlayers.filter(p => !playerNames.includes(p.name))
  for (const player of playersToAdd) {
    await addDoc(collection(db, 'players'), player)
  }

  // --- Coaches ---
  const coachesSnap = await getDocs(collection(db, 'coaches'))
  const existingCoaches = coachesSnap.docs.map(d => d.data().name as string)
  const coachesToAdd = initialCoaches.filter(c => !existingCoaches.includes(c.name))
  for (const coach of coachesToAdd) {
    await addDoc(collection(db, 'coaches'), coach)
  }
}
