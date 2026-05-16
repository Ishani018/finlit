// ── Pharmacy ─────────────────────────────────────────────────────────────────
export const PHARMACY_ITEMS = [
    { id: 'paracetamol',   name: 'Paracetamol',       desc: 'Fever & mild pain relief',       price: 50,   healthRestore: 8,  category: 'pharmacy' },
    { id: 'cough_syrup',   name: 'Cough Syrup',        desc: 'Cold & throat relief',           price: 120,  healthRestore: 10, category: 'pharmacy' },
    { id: 'antacid',       name: 'Antacid',            desc: 'Acidity & indigestion',          price: 80,   healthRestore: 6,  category: 'pharmacy' },
    { id: 'vitamin_c',     name: 'Vitamin C',          desc: 'Immunity booster',               price: 200,  healthRestore: 8,  category: 'pharmacy' },
    { id: 'multivitamin',  name: 'Multivitamins',      desc: 'Daily health supplement',        price: 350,  healthRestore: 12, category: 'pharmacy' },
    { id: 'first_aid',     name: 'First Aid Kit',      desc: 'Cuts, burns & emergencies',      price: 500,  healthRestore: 15, category: 'pharmacy' },
    { id: 'antibiotics',   name: 'Antibiotics',        desc: 'Serious infection treatment',    price: 800,  healthRestore: 25, category: 'pharmacy' },
    { id: 'bp_medicine',   name: 'BP Medication',      desc: 'Blood pressure management',      price: 600,  healthRestore: 18, category: 'pharmacy' },
    { id: 'ayurvedic',     name: 'Chyawanprash',       desc: 'Ayurvedic immunity tonic',       price: 280,  healthRestore: 10, category: 'pharmacy' },
    { id: 'calcium',       name: 'Calcium Tablets',    desc: 'Bone & joint strength',          price: 300,  healthRestore: 8,  category: 'pharmacy' },
];

// ── Clothes & Toys ────────────────────────────────────────────────────────────
export const CLOTHES_ITEMS = [
    // Kids
    { id: 'school_bag',    name: 'School Bag',         desc: 'Durable backpack for kids',      price: 800,  happinessBoost: 6,  healthBoost: 0,  for: 'child',  tag: 'KIDS' },
    { id: 'toy_set',       name: 'Toy Set',            desc: 'Building blocks & puzzles',      price: 1500, happinessBoost: 10, healthBoost: 5,  for: 'child',  tag: 'KIDS' },
    { id: 'school_uniform',name: 'School Uniform',     desc: 'Full uniform set',               price: 2000, happinessBoost: 5,  healthBoost: 3,  for: 'child',  tag: 'KIDS' },
    { id: 'kids_books',    name: 'Story Books',        desc: 'Age-appropriate reading',        price: 500,  happinessBoost: 7,  healthBoost: 0,  for: 'child',  tag: 'KIDS' },
    { id: 'sports_kit',    name: 'Sports Kit',         desc: 'Cricket bat, ball & pads',       price: 2500, happinessBoost: 12, healthBoost: 5,  for: 'child',  tag: 'KIDS' },
    { id: 'video_game',    name: 'Video Game',         desc: 'Latest console game',            price: 3000, happinessBoost: 15, healthBoost: 0,  for: 'child',  tag: 'KIDS' },
    // Adults
    { id: 'casual_wear',   name: 'Casual Wear',        desc: 'T-shirts & jeans',               price: 2500, happinessBoost: 6,  healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
    { id: 'ethnic_set',    name: 'Ethnic Outfit',      desc: 'Kurta / saree set',              price: 4000, happinessBoost: 8,  healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
    { id: 'formal_suit',   name: 'Formal Suit',        desc: 'Office-ready attire',            price: 6000, happinessBoost: 8,  healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
    { id: 'party_outfit',  name: 'Party Outfit',       desc: 'Sherwani / party dress',         price: 8000, happinessBoost: 12, healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
    { id: 'sneakers',      name: 'Sneakers',           desc: 'Branded sports shoes',           price: 3500, happinessBoost: 7,  healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
    { id: 'jewellery',     name: 'Jewellery',          desc: 'Gold-plated accessories',        price: 5000, happinessBoost: 10, healthBoost: 0,  for: 'adult',  tag: 'ADULT' },
];

export const SHOP_CATEGORY_COLORS = {
    pharmacy: '#4ade80',
    child: '#60a5fa',
    adult: '#ec4899',
    KIDS: '#60a5fa',
    ADULT: '#ec4899',
};
