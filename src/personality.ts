/** Small bits of Bobcat personality: rotating campus facts and thank-you lines. */

export const TIPS = [
  'A faucet dripping once a second wastes about 3,000 gallons a year.',
  'Lights left on overnight in one classroom use about as much power as a dorm fridge does in a week.',
  'A running toilet can waste 200 gallons a day. That is a lot of water bottles.',
  'Propping a door open with the AC running is like paying to cool the quad.',
  'Contaminated recycling often gets landfilled. One greasy pizza box can spoil a whole bin.',
  'Reporting takes about ten seconds. Fixing it can save thousands of gallons.',
  'Facilities can only fix what gets reported. You are the sensor.',
  'A single LED tube left on for a weekend burns about 2 kWh. Multiply by a hallway.',
];

export const CHEERS = [
  'Nice catch. The campus owes you a nap.',
  'Bobcat approves. Facilities has it now.',
  'That is one less thing wasting away on campus.',
  'Paws up. This one is on the board.',
  'Good eye. Someone will take a look.',
  'Logged, tagged, and on the Feed.',
];

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
