import { Formation } from './types'

export const formations: Formation[] = [
  {
    name: '4-3-3',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'lb', label: 'LB', x: 20, y: 72 },
      { key: 'cb1', label: 'CB', x: 38, y: 75 },
      { key: 'cb2', label: 'CB', x: 62, y: 75 },
      { key: 'rb', label: 'RB', x: 80, y: 72 },
      { key: 'cm1', label: 'CM', x: 30, y: 50 },
      { key: 'cm2', label: 'CM', x: 50, y: 45 },
      { key: 'cm3', label: 'CM', x: 70, y: 50 },
      { key: 'lw', label: 'LW', x: 20, y: 25 },
      { key: 'st', label: 'ST', x: 50, y: 18 },
      { key: 'rw', label: 'RW', x: 80, y: 25 },
    ],
  },
  {
    name: '4-4-2',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'lb', label: 'LB', x: 20, y: 72 },
      { key: 'cb1', label: 'CB', x: 38, y: 75 },
      { key: 'cb2', label: 'CB', x: 62, y: 75 },
      { key: 'rb', label: 'RB', x: 80, y: 72 },
      { key: 'lm', label: 'LM', x: 20, y: 48 },
      { key: 'cm1', label: 'CM', x: 38, y: 50 },
      { key: 'cm2', label: 'CM', x: 62, y: 50 },
      { key: 'rm', label: 'RM', x: 80, y: 48 },
      { key: 'st1', label: 'ST', x: 38, y: 22 },
      { key: 'st2', label: 'ST', x: 62, y: 22 },
    ],
  },
  {
    name: '3-5-2',
    positions: [
      { key: 'gk', label: 'GK', x: 50, y: 90 },
      { key: 'cb1', label: 'CB', x: 30, y: 75 },
      { key: 'cb2', label: 'CB', x: 50, y: 78 },
      { key: 'cb3', label: 'CB', x: 70, y: 75 },
      { key: 'lwb', label: 'LWB', x: 15, y: 50 },
      { key: 'cm1', label: 'CM', x: 35, y: 52 },
      { key: 'cm2', label: 'CM', x: 50, y: 45 },
      { key: 'cm3', label: 'CM', x: 65, y: 52 },
      { key: 'rwb', label: 'RWB', x: 85, y: 50 },
      { key: 'st1', label: 'ST', x: 38, y: 20 },
      { key: 'st2', label: 'ST', x: 62, y: 20 },
    ],
  },
]
