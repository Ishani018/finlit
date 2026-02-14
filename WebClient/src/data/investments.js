export const INVESTMENTS = [
    // --- TIER 1: STARTER HOMES (The Struggle) ---
    {
        id: "studio_starter",
        name: "Starter Studio Apartment",
        cost: 1500000, // ₹15 Lakhs
        revenue: 0, // Homes don't generate revenue unless rented out (simplification: 0 for now or user can add later)
        maintenance: 1500, // ₹1.5k/month
        type: "housing",
        description: "Tiny, cramped, but it's yours. Good for a single student.",
        image: '/assets/properties/starter_studio_apartment.png',
    },
    {
        id: "1bhk_starter",
        name: "1BHK Starter Apartment",
        cost: 2500000, // ₹25 Lakhs
        maintenance: 2500,
        type: "housing",
        revenue: 0,
        description: "A separate bedroom! Now you can invite people over without shame.",
        image: '/assets/properties/1bhk_starter_apartment.png',
    },
    {
        id: "studio_loft",
        name: "Studio with Loft",
        cost: 3000000, // ₹30 Lakhs
        maintenance: 2800,
        type: "housing",
        revenue: 0,
        description: "Hipster vibes. The vertical space makes it feel bigger than it is.",
        image: '/assets/properties/studio_with_loft.png',
    },

    // --- TIER 2: MIDDLE CLASS (Growing Up) ---
    {
        id: "2bhk_budget",
        name: "2BHK in Budget Apartment",
        cost: 4500000, // ₹45 Lakhs
        maintenance: 4000,
        type: "housing",
        revenue: 0,
        description: "Standard family starter pack. Safe, boring, reliable.",
        image: '/assets/properties/2bhk_in_budget_apartment.png',
    },
    {
        id: "townhouse_comfy",
        name: "Comfortable Town House",
        cost: 8500000, // ₹85 Lakhs
        maintenance: 6500,
        type: "housing",
        revenue: 0,
        description: "No upstairs neighbors stomping around! A modest slice of land.",
        image: '/assets/properties/comfortable_town_house.png',
    },
    {
        id: "city_apt_office",
        name: "City Apt w/ Home Office",
        cost: 12000000, // ₹1.2 Cr
        maintenance: 9000,
        type: "housing",
        revenue: 0,
        description: "Perfect for remote work. High-speed internet ready.",
        image: '/assets/properties/city_apartment_with_2_bedrooms_and_home_office.png',
    },

    // --- TIER 3: UPPER CLASS (The Flex) ---
    {
        id: "villa_pool",
        name: "Comfortable Villa with Pool",
        cost: 35000000, // ₹3.5 Cr
        maintenance: 25000, // Pools are expensive to clean!
        type: "housing",
        revenue: 0,
        description: "The ultimate status symbol. Your friends will be jealous.",
        image: '/assets/properties/comfortable_villa_with_pool.png',
    },
    {
        id: "mansion_modern",
        name: "Modern Family Mansion",
        cost: 60000000, // ₹6 Cr
        maintenance: 45000,
        type: "housing",
        revenue: 0,
        description: "Glass walls, minimalism, and too many rooms to clean yourself.",
        image: '/assets/properties/modern_family_mansion.png',
    },
    {
        id: "beach_house_wine",
        name: "Beach House with Wine Cellar",
        cost: 85000000, // ₹8.5 Cr
        maintenance: 60000,
        type: "housing",
        revenue: 0,
        description: "Weekend getaways just got serious. Don't forget the humidity control.",
        image: '/assets/properties/beach_house_fully_furnished_with_wine_cellar.png',
    },

    // --- TIER 4: GENERATIONAL WEALTH (The 1%) ---
    {
        id: "haveli_high_end",
        name: "High End Haveli",
        cost: 150000000, // ₹15 Cr
        maintenance: 120000,
        type: "housing",
        revenue: 0,
        description: "Royal living. You literally need a staff to maintain this.",
        image: '/assets/properties/high_end_haveli.png',
    },
    {
        id: "generational_courtyard",
        name: "Generational Home w/ Courtyard",
        cost: 200000000, // ₹20 Cr
        maintenance: 150000,
        type: "housing",
        revenue: 0,
        description: "A legacy property. It has its own ecosystem.",
        image: '/assets/properties/generational_home_with_courtyard.png',
    },
    {
        id: "vacation_villa_farm",
        name: "Vacation Villa with Farm",
        cost: 250000000, // ₹25 Cr
        maintenance: 200000,
        type: "housing",
        revenue: 0,
        description: "Return to your roots, but in extreme luxury. Organic farming included.",
        image: '/assets/properties/vacation_villa_with_farm_and_pool_for_family_of_4.png',
    }
];
