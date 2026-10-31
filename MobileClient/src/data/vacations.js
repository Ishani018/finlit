// Holiday destinations. `cost` is per person; a solo trip is one person, a family trip is you plus everyone in your household.
export const VACATION_COOLDOWN_MONTHS = 3;

export const VACATIONS = [
    { id: 'rishikesh', name: 'Rishikesh Retreat',  tag: 'RETREAT', cost: 14000,  mood: 10, health: 12, image: require('../../assets/vacations/rishikesh.jpg'), blurb: 'Yoga by the Ganges. Slow mornings, clear head.' },
    { id: 'goa',       name: 'Goa Beach Break',    tag: 'BEACH',   cost: 20000,  mood: 16, health: 2,  image: require('../../assets/vacations/goa.jpg'),       blurb: 'Sun, sea and shack dinners at sunset.' },
    { id: 'jaipur',    name: 'Jaipur Heritage',    tag: 'CULTURE', cost: 22000,  mood: 14, health: 3,  image: require('../../assets/vacations/jaipur.jpg'),    blurb: 'Forts, palaces and a very good bazaar.' },
    { id: 'manali',    name: 'Manali Hills',       tag: 'MOUNTAIN', cost: 24000, mood: 14, health: 6,  image: require('../../assets/vacations/manali.jpg'),    blurb: 'Snow peaks, pine air and a warm cabin.' },
    { id: 'kerala',    name: 'Kerala Backwaters',  tag: 'NATURE',  cost: 30000,  mood: 15, health: 8,  image: require('../../assets/vacations/kerala.jpg'),    blurb: 'A houseboat, still water and coconut palms.' },
    { id: 'ladakh',    name: 'Ladakh Road Trip',   tag: 'ADVENTURE', cost: 48000, mood: 20, health: 5, image: require('../../assets/vacations/ladakh.jpg'),    blurb: 'High passes, blue lakes and monasteries.' },
    { id: 'singapore', name: 'Singapore',          tag: 'ABROAD',  cost: 95000,  mood: 22, health: 2,  image: require('../../assets/vacations/singapore.jpg'), blurb: 'Your first trip abroad: skyline, gardens, food.' },
    { id: 'maldives',  name: 'Maldives Escape',    tag: 'LUXURY',  cost: 160000, mood: 30, health: 6,  image: require('../../assets/vacations/maldives.jpg'),  blurb: 'An overwater villa and a very blue lagoon.' },
];

export const VACATION_BY_ID = Object.fromEntries(VACATIONS.map(v => [v.id, v]));
