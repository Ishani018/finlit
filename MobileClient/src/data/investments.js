export const INVESTMENTS = [
    // --- EDUCATION (Unlock Careers) ---
    {
        id: 'edu_vocational',
        name: 'Vocational Training',
        type: 'education',
        cost: 50000,
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/mechanic.png'), // Placeholder
        description: 'Trade skills for mechanics, carpenters, and plumbers.'
    },
    {
        id: 'edu_cs_degree',
        name: 'Computer Science Degree',
        type: 'education',
        cost: 2000000, // 20 Lakhs
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/student.png'),
        description: 'Required for Software Engineering roles.'
    },
    {
        id: 'edu_mba',
        name: 'MBA',
        type: 'education',
        cost: 4000000, // 40 Lakhs
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/manager.png'),
        description: 'Master of Business Administration. Unlocks corporate leadership.'
    },
    {
        id: 'edu_medical',
        name: 'Medical Degree',
        type: 'education',
        cost: 5000000,
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/vet.png'), // Placeholder
        description: 'Required for medical professions (Vet, Therapist, etc).'
    },
    {
        id: 'edu_design',
        name: 'Design Diploma',
        type: 'education',
        cost: 300000,
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/indterior designer.png'),
        description: 'Unlocks creative careers like Interior Design.'
    },
    {
        id: 'edu_culinary',
        name: 'Culinary Arts Diploma',
        type: 'education',
        cost: 800000,
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/chef in high end restaurant.png'),
        description: 'Learn to cook at a professional level.'
    },
    {
        id: 'edu_science',
        name: 'Science PhD',
        type: 'education',
        cost: 1500000,
        maintenance: 0,
        revenue: 0,
        image: require('../../assets/jobs/microbiolgist.png'),
        description: 'Advanced research degree for scientists.'
    },

    // --- TIER 1: CORE HOUSING ---
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
        image: require('../../assets/properties/1bhk_starter_apartment.png'), // Placeholder or restored
        revenue: 0,
        description: 'Your first private space. Includes a small kitchen and balcony.'
    },

    // --- TIER 2: OWNED HOUSING ---
    {
        id: 'owned_flat',
        name: '2BHK Family Flat',
        type: 'housing',
        cost: 4500000, // 45 Lakhs
        maintenance: 5000, // HOA
        image: require('../../assets/properties/city_apartment_with_2_bedrooms_and_home_office.png'),
        revenue: 0,
        description: 'A proper home for a family. Good resale value.'
    },
    {
        id: 'luxury_penthouse',
        name: 'Luxury Penthouse',
        type: 'housing',
        cost: 25000000, // 2.5 Crores
        maintenance: 25000,
        image: require('../../assets/properties/modern_family_mansion.png'),
        revenue: 0,
        description: 'Top of the world view. Comes with a private pool access.'
    },
    {
        id: 'villa',
        name: 'Gated Villa',
        type: 'housing',
        cost: 80000000, // 8 Crores
        maintenance: 60000,
        image: require('../../assets/properties/vacation_villa_with_farm_and_pool_for_family_of_4.png'),
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
        id: 'real_estate_rental',
        name: 'Rental Property',
        type: 'business',
        cost: 6000000, // 60 Lakhs
        maintenance: 2000,
        revenue: 25000, // Rent income
        image: require('../../assets/jobs/fine dining restaurant.png'), // Placeholder
        description: 'A second flat you rent out to tenants.'
    }
];
