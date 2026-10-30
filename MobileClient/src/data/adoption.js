// Adoption: open to anyone aged 25+, married or not. Older children cost less to place and arrive sooner.
export const ADOPTION_MIN_AGE = 25;
export const ADOPTION_MAX_CHILDREN = 4;     // children living with you, adopted or born
export const ADOPTION_OPTIONS = [
    { key: 'baby',    label: 'Baby',    sub: 'Under 6 months', startMonths: 3,  fee: 150000, wait: 6 },
    { key: 'toddler', label: 'Toddler', sub: 'About 3 years',  startMonths: 36, fee: 100000, wait: 4 },
    { key: 'child',   label: 'Child',   sub: 'About 7 years',  startMonths: 84, fee: 75000,  wait: 3 },
];
