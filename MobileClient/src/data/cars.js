// Vehicles you can buy new or second-hand. `dep` is the yearly change in value:
// positive = depreciates, negative = appreciates (collectibles).
// `run` is the monthly cost of the car you drive (fuel + service); a parked car costs 35% of it (insurance, parking).
// `mood` is the monthly happiness bonus. `income` is monthly money an earning vehicle brings in when it is your active ride.

export const CAR_TIERS = [
    { key: 'starter',  label: 'STARTER',  color: '#4ade80', minNetWorth: 0 },
    { key: 'everyday', label: 'EVERYDAY', color: '#60a5fa', minNetWorth: 500000 },
    { key: 'premium',  label: 'PREMIUM',  color: '#a78bfa', minNetWorth: 2000000 },
    { key: 'luxury',   label: 'LUXURY',   color: '#fbbf24', minNetWorth: 10000000 },
    { key: 'super',    label: 'SUPER',    color: '#f87171', minNetWorth: 30000000 },
    { key: 'toys',     label: 'TOYS',     color: '#22d3ee', minNetWorth: 50000000 },
];

// What kind of vehicle it is, for the filter chips.
export const VEHICLE_KINDS = [
    { key: 'all',  label: 'ALL' },
    { key: 'car',  label: 'CARS' },
    { key: 'bike', label: 'BIKES' },
    { key: 'toy',  label: 'SEA & AIR' },
];

const img = {
    omni_van: require('../../assets/cars/omni_van.png'),
    alto: require('../../assets/cars/alto.png'),
    auto_rickshaw: require('../../assets/cars/auto_rickshaw.png'),
    royal_enfield: require('../../assets/cars/royal_enfield.png'),
    hyundai_i10: require('../../assets/cars/hyundai_i10.png'),
    honda_city: require('../../assets/cars/honda_city.png'),
    creta: require('../../assets/cars/creta.png'),
    nexon_ev: require('../../assets/cars/nexon_ev.png'),
    innova: require('../../assets/cars/innova.png'),
    thar: require('../../assets/cars/thar.png'),
    fortuner: require('../../assets/cars/fortuner.png'),
    audi_a6: require('../../assets/cars/audi_a6.png'),
    mercedes_e: require('../../assets/cars/mercedes_e.png'),
    tesla_s: require('../../assets/cars/tesla_s.png'),
    porsche_911: require('../../assets/cars/porsche_911.png'),
    bmw_m: require('../../assets/cars/bmw_m.png'),
    range_rover: require('../../assets/cars/range_rover.png'),
    g_wagon: require('../../assets/cars/g_wagon.png'),
    ferrari: require('../../assets/cars/ferrari.png'),
    lamborghini: require('../../assets/cars/lamborghini.png'),
    audi_r8: require('../../assets/cars/audi_r8.png'),
    rolls_royce: require('../../assets/cars/rolls_royce.png'),
    bentley: require('../../assets/cars/bentley.png'),
    maybach: require('../../assets/cars/maybach.png'),
    bicycle: require('../../assets/cars/bicycle.png'),
    scooter: require('../../assets/cars/scooter.png'),
    splendor: require('../../assets/cars/splendor.png'),
    e_scooter: require('../../assets/cars/e_scooter.png'),
    pulsar: require('../../assets/cars/pulsar.png'),
    ktm_duke: require('../../assets/cars/ktm_duke.png'),
    harley: require('../../assets/cars/harley.png'),
    ducati: require('../../assets/cars/ducati.png'),
    speedboat: require('../../assets/cars/speedboat.png'),
    yacht: require('../../assets/cars/yacht.png'),
    helicopter: require('../../assets/cars/helicopter.png'),
    private_jet: require('../../assets/cars/private_jet.png'),
};

const C = (id, name, tier, price, run, mood, dep, perk, extra = {}) => ({ id, name, tier, price, run, mood, dep, perk, kind: 'car', image: img[id], ...extra });

export const CARS = [
    // TWO-WHEELERS (cheap, so they are the first thing a new player can afford)
    C('bicycle', 'Bicycle', 'starter', 8000, 200, 0.1, 0.12, 'Costs almost nothing and keeps you fit.', { kind: 'bike' }),
    C('scooter', 'Honda Activa', 'starter', 85000, 1500, 0.25, 0.10, 'The everyday scooter. Easy and cheap to run.', { kind: 'bike' }),
    C('splendor', 'Hero Splendor', 'starter', 95000, 1500, 0.25, 0.09, 'A commuter bike that never lets you down.', { kind: 'bike' }),
    C('e_scooter', 'Electric Scooter', 'starter', 135000, 500, 0.3, 0.12, 'Almost no running cost.', { kind: 'bike' }),
    C('pulsar', 'Bajaj Pulsar', 'everyday', 165000, 2500, 0.45, 0.09, 'A sporty bike for weekends.', { kind: 'bike' }),
    C('ktm_duke', 'KTM Duke', 'everyday', 260000, 3500, 0.6, 0.10, 'Fast and fun.', { kind: 'bike' }),
    C('harley', 'Harley-Davidson', 'premium', 1700000, 9000, 1.0, 0.07, 'The cruiser. Holds its value well.', { kind: 'bike' }),
    C('ducati', 'Ducati Panigale', 'premium', 3200000, 14000, 1.3, 0.06, 'A superbike for the thrill.', { kind: 'bike' }),
    // BOATS AND AIR (the richest players only)
    C('speedboat', 'Speedboat', 'toys', 15000000, 60000, 2.0, 0.08, 'Weekends on the water.', { kind: 'toy', minNetWorth: 50000000 }),
    C('yacht', 'Luxury Yacht', 'toys', 180000000, 400000, 3.2, 0.05, 'A floating palace.', { kind: 'toy', minNetWorth: 250000000 }),
    C('helicopter', 'Private Helicopter', 'toys', 250000000, 600000, 3.5, 0.06, 'Skip the traffic for good.', { kind: 'toy', minNetWorth: 350000000 }),
    C('private_jet', 'Private Jet', 'toys', 850000000, 1200000, 4.0, 0.04, 'The ultimate status symbol.', { kind: 'toy', minNetWorth: 1000000000 }),
    // STARTER
    C('royal_enfield', 'Royal Enfield Bullet', 'starter', 200000, 2000, 0.3, 0.08, 'Cheap and fun. Great for a first ride.', { kind: 'bike' }),
    C('omni_van', 'Maruti Omni Van', 'starter', 320000, 4000, 0.15, 0.10, 'Runs as a school van: earns ₹6,000 a month when active.', { income: 6000 }),
    C('auto_rickshaw', 'Auto-rickshaw', 'starter', 330000, 5000, 0.1, 0.10, 'Put it on the road for fares: earns ₹11,000 a month when active.', { income: 11000 }),
    C('alto', 'Maruti Alto', 'starter', 350000, 3500, 0.25, 0.10, 'The classic first car. Cheap to run.'),
    // EVERYDAY
    C('hyundai_i10', 'Hyundai i10', 'everyday', 550000, 5000, 0.4, 0.11, 'Easy city hatchback.'),
    C('nexon_ev', 'Tata Nexon EV', 'everyday', 1400000, 2500, 0.5, 0.12, 'Electric: the lowest running cost of any SUV.'),
    C('honda_city', 'Honda City', 'everyday', 1200000, 8000, 0.55, 0.10, 'Comfortable sedan. Holds its value well.'),
    C('creta', 'Hyundai Creta', 'everyday', 1500000, 9000, 0.6, 0.10, 'The family SUV. A safe, popular pick.'),
    // PREMIUM
    C('thar', 'Mahindra Thar', 'premium', 1600000, 10000, 0.8, 0.05, 'Resale stays strong. Great weekend drive.'),
    C('innova', 'Toyota Innova', 'premium', 2000000, 11000, 0.6, 0.07, 'Seats the whole family. Very reliable.'),
    C('fortuner', 'Toyota Fortuner', 'premium', 3800000, 16000, 0.9, 0.08, 'Big SUV with real road presence.'),
    C('audi_a6', 'Audi A6', 'premium', 5500000, 22000, 1.0, 0.13, 'A proper executive sedan.'),
    C('mercedes_e', 'Mercedes E-Class', 'premium', 7000000, 28000, 1.1, 0.13, 'Boardroom status on four wheels.'),
    C('tesla_s', 'Tesla Model S', 'premium', 11000000, 12000, 1.2, 0.12, 'Electric luxury with low running costs.'),
    // LUXURY
    C('bmw_m', 'BMW M-series', 'luxury', 14000000, 40000, 1.4, 0.11, 'A fast coupe that holds its price.'),
    C('porsche_911', 'Porsche 911', 'luxury', 19000000, 45000, 1.6, -0.02, 'A modern classic. It gains value slowly over time.'),
    C('range_rover', 'Range Rover', 'luxury', 22000000, 55000, 1.5, 0.12, 'Luxury SUV for any road.'),
    C('g_wagon', 'Mercedes G-Wagon', 'luxury', 26000000, 60000, 1.7, 0.03, 'An icon. Barely loses value.'),
    // SUPER
    C('audi_r8', 'Audi R8', 'super', 30000000, 90000, 1.9, 0.00, 'A supercar that holds its value.'),
    C('lamborghini', 'Lamborghini Huracán', 'super', 40000000, 110000, 2.2, -0.04, 'A collector piece. Gains value each year.'),
    C('bentley', 'Bentley Continental GT', 'super', 42000000, 130000, 2.0, 0.08, 'Hand-built grand tourer.'),
    C('ferrari', 'Ferrari', 'super', 45000000, 120000, 2.5, -0.05, 'The dream car. A true appreciating asset.'),
    C('maybach', 'Mercedes-Maybach', 'super', 60000000, 150000, 2.3, 0.07, 'The ultimate chauffeur car.'),
    C('rolls_royce', 'Rolls-Royce Phantom', 'super', 70000000, 150000, 2.4, 0.06, 'The summit of luxury.'),
];

export const CAR_BY_ID = Object.fromEntries(CARS.map(c => [c.id, c]));

// Second-hand: a few years old, cheaper to buy but costlier to keep and slower to lose value.
export const USED_PRICE_FACTOR = (car) => (car.dep < 0 ? 0.9 : car.dep === 0 ? 0.85 : 0.62);
export const USED_RUN_FACTOR = 1.3;
export const PARKED_COST_FACTOR = 0.35;
export const CAR_LOAN_DOWN_PCT = 0.2;
export const CAR_LOAN_TENURE = 60;

export const usedPrice = (car) => Math.round(car.price * USED_PRICE_FACTOR(car) / 1000) * 1000;
export const carRunCost = (car, owned) => Math.round(car.run * (owned?.used ? USED_RUN_FACTOR : 1));

// Current market value of an owned car.
export const carValue = (owned, nowMonth) => {
    const car = CAR_BY_ID[owned.id];
    if (!car) return 0;
    const years = Math.max(0, (nowMonth - owned.boughtMonth) / 12);
    const dep = owned.used && car.dep > 0 ? car.dep * 0.75 : car.dep;
    const driveOff = !owned.used && car.dep > 0 ? 0.9 : 1;
    return Math.max(0, Math.round(owned.paid * driveOff * Math.pow(1 - dep, years)));
};

// Not listed in the Bank's loan menu (it would hand out cash with no car); used only when buying a car on finance.
export const CAR_LOAN_TYPE = {
    id: 'car_loan', name: 'Car Loan', type: 'secured', max_amount: 5000000000, base_interest: 9.5,
    max_tenure: 84, min_income: 20000, min_credit_score: 600,
    description: 'Finance a vehicle. Secured by the car.',
};

// The net worth you need for one vehicle (its own limit if it has one, otherwise its tier's).
export const vehicleMinNetWorth = (car) => car.minNetWorth ?? (CAR_TIERS.find(t => t.key === car.tier)?.minNetWorth || 0);
