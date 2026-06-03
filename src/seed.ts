import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from './firebase'

const initialPlayers = [
  { name: 'Adam Kiersznikiewicz Maburi', shirtName: 'Kiersznikiewicz Maburi', number: 8, position: 'CM' },
  { name: 'Alexander Dziuba', shirtName: 'Dziuba', number: 6, position: 'CB' },
  { name: 'Alexander Sundqvist', shirtName: 'Sundqvist', number: 0, position: 'CM' },
  { name: 'André Leikman', shirtName: 'Leikman', number: 0, position: 'CM' },
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
  { name: 'Simon Hjelte', shirtName: 'S. Hjelte', number: 0, position: 'CM' },
  { name: 'Vincent Leikman', shirtName: 'V. Leikman', number: 17, position: 'LM' },
]

export async function seedPlayers() {
  const snap = await getDocs(collection(db, 'players'))
  const existingNames = snap.docs.map(d => d.data().name as string)

  const toAdd = initialPlayers.filter(p => !existingNames.includes(p.name))
  if (toAdd.length === 0) return

  for (const player of toAdd) {
    await addDoc(collection(db, 'players'), player)
  }
  console.log(`Seeded ${toAdd.length} players`)
}
