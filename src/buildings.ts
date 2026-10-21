export const BUILDINGS = [
  'Atkinson Hall',
  'Arts & Sciences',
  'Beeson Hall',
  'Bell Hall',
  'Centennial Center',
  'Foundation Hall',
  'Herty Hall',
  'Ina Dillard Russell Library',
  'Kilpatrick Hall',
  'Magnolia Ballroom',
  'Napier Hall',
  'Parkhurst Hall',
  'Sanford Hall',
  'Terrell Hall',
  'The Village',
  'Wells Hall',
  'Wellness & Recreation Center',
  'Other',
] as const;

export type Building = (typeof BUILDINGS)[number];

export const CATEGORIES = ['WATER', 'ENERGY', 'WASTE', 'DAMAGE', 'OTHER'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ['OPEN', 'FIXED', 'PENDING'] as const;
export type Status = (typeof STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  WATER: '💧 Water',
  ENERGY: '💡 Energy',
  WASTE: '🗑️ Waste',
  DAMAGE: '🔧 Damage',
  OTHER: '❓ Other',
};
