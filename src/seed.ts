import type { Category, Severity, Status } from './buildings';

/** Shape of a report as the Feed renders it (mirrors the Amplify Report model). */
export interface ReportItem {
  id: string;
  photoKey: string;
  building: string;
  category: Category;
  title: string;
  description: string;
  impact: string;
  impactScore: number;
  severity: Severity;
  action: string;
  status: Status;
  estimatedCost: number | null;
  actualCost: number | null;
  createdAt: string;
}

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** Demo data shown on the Feed when VITE_DEMO=true or the backend is unreachable. */
export const SEED_REPORTS: ReportItem[] = [
  {
    id: 'seed-1',
    actualCost: null,
    estimatedCost: 120,
    photoKey: 'seed/beeson-faucet.jpg',
    building: 'Beeson Hall',
    category: 'WATER',
    title: 'Faucet running in 2nd floor bathroom',
    description:
      'A sink faucet in the second-floor men’s restroom is running continuously and does not shut off when the handle is closed.',
    impact: '~1,500 gallons/week',
    impactScore: 8,
    severity: 'HIGH',
    action: 'Send a plumber to replace the faucet cartridge or shut the supply valve.',
    status: 'OPEN',
    createdAt: minutesAgo(25),
  },
  {
    id: 'seed-2',
    actualCost: null,
    estimatedCost: 0,
    photoKey: 'seed/arts-sciences-lights.jpg',
    building: 'Arts & Sciences',
    category: 'ENERGY',
    title: 'Lights on in empty classroom 214',
    description:
      'All overhead lights are on in room 214 with nobody inside and no class scheduled for the rest of the evening.',
    impact: '~6 kWh/day',
    impactScore: 4,
    severity: 'MEDIUM',
    action: 'Turn off the lights and check whether the occupancy sensor is working.',
    status: 'OPEN',
    createdAt: minutesAgo(90),
  },
  {
    id: 'seed-3',
    actualCost: null,
    estimatedCost: 25,
    photoKey: 'seed/library-recycling.jpg',
    building: 'Ina Dillard Russell Library',
    category: 'WASTE',
    title: 'Recycling bin overflowing at front entrance',
    description:
      'The blue recycling bin by the main entrance is overflowing, and food containers are mixed in with the paper and plastic.',
    impact: '~40 lbs of recyclables at risk of landfill',
    impactScore: 5,
    severity: 'MEDIUM',
    action: 'Empty the bin and add a clearer sorting sign.',
    status: 'OPEN',
    createdAt: minutesAgo(3 * 60),
  },
  {
    id: 'seed-4',
    actualCost: 410,
    estimatedCost: 350,
    photoKey: 'seed/wells-fountain.jpg',
    building: 'Wells Hall',
    category: 'DAMAGE',
    title: 'Broken water fountain on ground floor',
    description:
      'The water fountain near the ground-floor stairwell sprays sideways and is leaking onto the floor, creating a slip hazard.',
    impact: '~200 gallons/week plus a slip hazard',
    impactScore: 7,
    severity: 'HIGH',
    action: 'Shut off the fountain and repair or replace the bubbler head.',
    status: 'FIXED',
    createdAt: minutesAgo(26 * 60),
  },
  {
    id: 'seed-5',
    actualCost: 45,
    estimatedCost: 60,
    photoKey: 'seed/wellness-doors.jpg',
    building: 'Wellness & Recreation Center',
    category: 'ENERGY',
    title: 'AC running with doors propped open',
    description:
      'Both side entrance doors to the gym are propped open while the air conditioning is running at full blast.',
    impact: '~25 kWh/day',
    impactScore: 6,
    severity: 'MEDIUM',
    action: 'Close the doors and remove the door stops; consider a door-closer.',
    status: 'FIXED',
    createdAt: minutesAgo(2 * 24 * 60),
  },
];
