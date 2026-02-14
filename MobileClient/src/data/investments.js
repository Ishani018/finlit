export const INVESTMENTS = [
    // --- TIER 1: CORE HOUSING (Starts here) ---
    {
        id: 'hostel',
        name: 'Hostel Shared Room',
        type: 'housing',
        cost: 0, // Default start
        maintenance: 3000, // Rent
        image: require('../../assets/rooms/hostel.png'),
        revenue: 0,
        description: 'A cramping shared room with a bunk bed. Cheap but noisy.'
    },
    {
        id: 'rental_apartment',
        name: '1BHK Apartment (Rent)',
        type: 'housing',
        cost: 50000, // Deposit
        maintenance: 12000, // Rent
        image: require('../../assets/properties/1bhk_starter_apartment.png'), // Updated from placeholder
        revenue: 0,
        description: 'Your first private space. Includes a small kitchen and balcony.'
    },

    // --- TIER 2: OWNED HOUSING ---
    {
        id: 'owned_flat',
        name: '2BHK Formatting Flat',
        type: 'housing',
        cost: 4500000, // 45 Lakhs
        maintenance: 5000, // HOA
        image: require('../../assets/properties/city_apartment_with_2_bedrooms_and_home_office.png'), // Updated from placeholder
        revenue: 0,
        description: 'A proper home for a family. Good resale value.'
    },
    {
        id: 'luxury_penthouse',
        name: 'Luxury Penthouse',
        type: 'housing',
        cost: 25000000, // 2.5 Crores
        maintenance: 25000,
        image: require('../../assets/properties/modern_family_mansion.png'), // Updated from placeholder
        revenue: 0,
        description: 'Top of the world view. Comes with a private pool access.'
    },
    {
        id: 'villa',
        name: 'Gated Villa',
        type: 'housing',
        cost: 80000000, // 8 Crores
        maintenance: 60000,
        image: require('../../assets/rooms/hostel.png'), // Placeholder
        revenue: 0,
        description: 'Massive lawn, 5 bedrooms, and total privacy.'
    },

    // --- TIER 3: BUSINESS INVESTMENTS ---
    {
        id: 'stock_portfolio_basic',
        name: 'Index Fund SIP',
        type: 'business',
        cost: 10000,
        maintenance: 0,
        revenue: 100, // 1% monthly roughly
        image: require('../../assets/jobs/manager.png'), // Placeholder
        description: 'Safe and steady market returns.'
    },
    {
        id: 'food_truck',
        name: 'Food Truck Franchise',
        type: 'business',
        cost: 500000, // 5 Lakhs
        maintenance: 10000,
        revenue: 30000,
        image: require('../../assets/jobs/maggi cafe.png'), // Placeholder
        description: 'Selling momos and burgers. High footfall area.'
    },
    {
        id: 'real_estate_rental',
        name: 'Rental Property',
        type: 'business',
        cost: 6000000, // 60 Lakhs
        maintenance: 2000,
        revenue: 25000, // Rent income
        image: require('../../assets/jobs/fine dining restaurant.png'), // Placeholder
        description: 'A second flat you rent out to tenants.'
    },
    {
        id: 'tech_startup_angel',
        name: 'Startup Angel Check',
        type: 'business',
        cost: 1000000, // 10 Lakhs
        maintenance: 0,
        revenue: 0, // High risk, maybe huge payout event? For now 0 regular.
        image: require('../../assets/jobs/developer.png'), // Placeholder
        description: 'High risk bet on a new app. Could go to zero or 100x.'
    }
];
