// Gadgets and appliances you buy, and pets you adopt.
//  run    = monthly running cost (electricity, subscriptions, food, vet visits)
//  saves  = money a gadget saves you every month (gadgets only); pets give no stat perks, they are company and a cost
//  dep    = share of value lost per year (gadgets only)
export const GADGETS = [
    { id: 'phone',           name: 'Smartphone',      price: 25000, run: 400,  saves: 0,   dep: 0.30, perk: 'Always connected.' },
    { id: 'laptop',          name: 'Laptop',          price: 60000, run: 300,  saves: 0,   dep: 0.25, perk: 'Work and play.' },
    { id: 'tv',              name: 'Smart TV',        price: 40000, run: 300,  saves: 300,   dep: 0.15, perk: 'Movie nights at home instead of the cinema.' },
    { id: 'ac',              name: 'Air Conditioner', price: 38000, run: 1200, saves: 0, dep: 0.12, perk: 'Beats the summer heat.' },
    { id: 'fridge',          name: 'Refrigerator',    price: 28000, run: 500,  saves: 700, dep: 0.10, perk: 'Less food goes to waste.' },
    { id: 'washing_machine', name: 'Washing Machine', price: 25000, run: 250,  saves: 600,   dep: 0.10, perk: 'No more laundry bills.' },
    { id: 'console',         name: 'Game Console',    price: 45000, run: 300,  saves: 400,   dep: 0.20, perk: 'Cheaper than a night out.' },
    { id: 'headphones',      name: 'Headphones',      price: 8000,  run: 0,    saves: 0,   dep: 0.20, perk: 'Your own little world.' },
    { id: 'smartwatch',      name: 'Smartwatch',      price: 20000, run: 150,  saves: 0, dep: 0.25, perk: 'Tracks your steps and sleep.' },
    { id: 'camera',          name: 'DSLR Camera',     price: 70000, run: 200,  saves: 0,   dep: 0.15, perk: 'Capture every memory.' },
    { id: 'tablet',          name: 'Tablet',          price: 35000, run: 200,  saves: 200,   dep: 0.22, perk: 'Books and shows without the cinema.' },
    { id: 'microwave',       name: 'Microwave Oven',  price: 9000,  run: 200,  saves: 300,   dep: 0.10, perk: 'Quick meals cost less than ordering in.' },
];
export const GADGET_MOOD_CAP = 3;      // gadgets together can lift your mood by at most this much a month
export const GADGET_HEALTH_CAP = 2;
export const GADGET_RESALE = 0.85;     // used gadgets sell for this share of their depreciated value

export const PETS = [
    { id: 'pet_dog',     name: 'Dog',      price: 15000, run: 4000, mood: 0, health: 0, lifeYears: 13, names: ['Bruno', 'Simba', 'Coco', 'Tommy', 'Rocky'], perk: 'Loyal, loud and loves walks.' },
    { id: 'pet_cat',     name: 'Cat',      price: 8000,  run: 2000, mood: 0, health: 0,   lifeYears: 15, names: ['Mimi', 'Kitty', 'Oscar', 'Luna', 'Mishti'], perk: 'Independent and cuddly.' },
    { id: 'pet_parrot',  name: 'Parrot',   price: 12000, run: 1000, mood: 0, health: 0,   lifeYears: 25, names: ['Mitthu', 'Kiwi', 'Rio', 'Tota'], perk: 'It talks back.' },
    { id: 'pet_rabbit',  name: 'Rabbit',   price: 3000,  run: 800,  mood: 0, health: 0,   lifeYears: 8,  names: ['Snowy', 'Bunny', 'Cotton', 'Thumper'], perk: 'Soft and quiet.' },
    { id: 'pet_hamster', name: 'Hamster',  price: 800,   run: 300,  mood: 0, health: 0,   lifeYears: 2,  names: ['Nibbles', 'Peanut', 'Pip'], perk: 'Tiny and cheap.' },
    { id: 'pet_fish',    name: 'Goldfish', price: 1500,  run: 200,  mood: 0, health: 0,   lifeYears: 3,  names: ['Goldie', 'Nemo', 'Bubbles'], perk: 'Calming to watch.' },
];
export const MAX_PETS = 3;
export const VET_CHANCE = 0.04;        // chance a pet needs the vet in any month
export const VET_BILL = [3000, 10000]; // min and max
export const PET_LOSS_MOOD = 6;        // one-off mood drop when a pet dies

export const GADGET_BY_ID = Object.fromEntries(GADGETS.map(g => [g.id, g]));
export const PET_BY_ID = Object.fromEntries(PETS.map(p => [p.id, p]));

const IMG = {
    phone: require('../../assets/lifestyle/phone.png'),
    laptop: require('../../assets/lifestyle/laptop.png'),
    tv: require('../../assets/lifestyle/tv.png'),
    ac: require('../../assets/lifestyle/ac.png'),
    fridge: require('../../assets/lifestyle/fridge.png'),
    washing_machine: require('../../assets/lifestyle/washing_machine.png'),
    console: require('../../assets/lifestyle/console.png'),
    headphones: require('../../assets/lifestyle/headphones.png'),
    smartwatch: require('../../assets/lifestyle/smartwatch.png'),
    camera: require('../../assets/lifestyle/camera.png'),
    tablet: require('../../assets/lifestyle/tablet.png'),
    microwave: require('../../assets/lifestyle/microwave.png'),
    pet_dog: require('../../assets/lifestyle/pet_dog.png'),
    pet_cat: require('../../assets/lifestyle/pet_cat.png'),
    pet_parrot: require('../../assets/lifestyle/pet_parrot.png'),
    pet_rabbit: require('../../assets/lifestyle/pet_rabbit.png'),
    pet_hamster: require('../../assets/lifestyle/pet_hamster.png'),
    pet_fish: require('../../assets/lifestyle/pet_fish.png'),
};
export const lifestyleImage = (id) => IMG[id];

// Current value of an owned gadget.
export const gadgetValue = (owned, nowMonth) => {
    const g = GADGET_BY_ID[owned.id]; if (!g) return 0;
    const years = Math.max(0, (nowMonth - owned.boughtMonth) / 12);
    return Math.round(owned.paid * Math.pow(1 - g.dep, years) / 100) * 100;
};
