import { Formation } from './types'

export const formations: Formation[] = [
  {
    name: '2-3-1',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb1', label: 'CB', x: 30, y: 72 },
      { key: 'cb2', label: 'CB', x: 70, y: 72 },
      { key: 'lm', label: 'LM', x: 20, y: 48 },
      { key: 'cm', label: 'CM', x: 50, y: 50 },
      { key: 'rm', label: 'RM', x: 80, y: 48 },
      { key: 'st', label: 'ST', x: 50, y: 22 },
    ],
  },
  {
    name: '3-2-1',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb1', label: 'CB', x: 25, y: 72 },
      { key: 'cb2', label: 'CB', x: 50, y: 75 },
      { key: 'cb3', label: 'CB', x: 75, y: 72 },
      { key: 'cm1', label: 'CM', x: 35, y: 48 },
      { key: 'cm2', label: 'CM', x: 65, y: 48 },
      { key: 'st', label: 'ST', x: 50, y: 22 },
    ],
  },
  {
    name: '2-1-2-1',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb1', label: 'CB', x: 30, y: 72 },
      { key: 'cb2', label: 'CB', x: 70, y: 72 },
      { key: 'cm', label: 'CM', x: 50, y: 55 },
      { key: 'lw', label: 'LW', x: 25, y: 38 },
      { key: 'rw', label: 'RW', x: 75, y: 38 },
      { key: 'st', label: 'ST', x: 50, y: 18 },
    ],
  },
  {
    name: '1-2-2-1',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb', label: 'CB', x: 50, y: 74 },
      { key: 'cm1', label: 'CM', x: 30, y: 56 },
      { key: 'cm2', label: 'CM', x: 70, y: 56 },
      { key: 'lw', label: 'LW', x: 25, y: 35 },
      { key: 'rw', label: 'RW', x: 75, y: 35 },
      { key: 'st', label: 'ST', x: 50, y: 18 },
    ],
  },
  {
    name: '3-1-2',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb1', label: 'CB', x: 25, y: 72 },
      { key: 'cb2', label: 'CB', x: 50, y: 75 },
      { key: 'cb3', label: 'CB', x: 75, y: 72 },
      { key: 'cm', label: 'CM', x: 50, y: 48 },
      { key: 'st1', label: 'ST', x: 35, y: 22 },
      { key: 'st2', label: 'ST', x: 65, y: 22 },
    ],
  },
]
