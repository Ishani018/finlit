// RESIDENTIAL PROPERTIES - Can live in OR rent out
export const RESIDENTIAL_PROPERTIES = [
    // --- TIER 1: Budget & Student Housing ---
    {
        id: '1bhk_starter',
        name: 'Starter 1BHK Apartment',
        category: 'residential',
        price: 2800000,
        maintenance: 1800,
        rental_income: 15000,
        image: require('../../assets/properties/1bhk_starter_apartment.png'),
        description: 'Compact 450 sq. ft. unit. Live here when starting out, or rent to recent graduates for steady income.'
    },
    {
        id: '1bhk_kids',
        name: 'Starter 1BHK with Kids Room',
        category: 'residential',
        price: 3200000,
        maintenance: 2000,
        rental_income: 18000,
        image: require('../../assets/properties/starter_1bhk_with_kids_room.png'),
        description: 'Starter home for a young couple with a child. Rent it to budget-conscious families or live here yourself.'
    },
    {
        id: 'studio_city',
        name: 'City Studio Apartment',
        category: 'residential',
        price: 3500000,
        maintenance: 1200,
        rental_income: 20000,
        image: require('../../assets/properties/studio_apartment.png'),
        description: 'Minimal living space in city center. High demand for rentals to single professionals.'
    },
    {
        id: 'studio_bed',
        name: 'Studio with Single Bed',
        category: 'residential',
        price: 2500000,
        maintenance: 1500,
        rental_income: 12000,
        image: require('../../assets/properties/studio_apartment_with_single_bed.png'),
        description: 'Furnished crash pad for gig workers or students. Frequent furniture repairs if rented out.'
    },
    {
        id: 'shared_apt',
        name: 'Shared Student Apartment',
        category: 'residential',
        price: 4500000,
        maintenance: 5500,
        rental_income: 28000,
        image: require('../../assets/properties/shared_apartment_for_students.png'),
        description: 'Chaotic unit housing multiple students. Excellent rental cash flow, but extreme wear and tear.'
    },
    {
        id: 'hostel_complex',
        name: 'Student Hostel Complex',
        category: 'residential',
        price: 25000000,
        maintenance: 45000,
        rental_income: 150000,
        image: require('../../assets/properties/student_hostel_complex.png'),
        description: 'Dense accommodation block. High rental income but requires full-time staff and heavy utility costs.'
    },
    {
        id: '1bhk_large',
        name: 'Large 1BHK with Balcony',
        category: 'residential',
        price: 4200000,
        maintenance: 2500,
        rental_income: 22000,
        image: require('../../assets/properties/larger_starter_apartment_with_1_bedroom.png'),
        description: 'Standard 1BHK with balcony. Attracts stable young professionals who pay rent on time.'
    },

    // --- TIER 2: Middle Class & Family Homes ---
    {
        id: '2bhk_family',
        name: 'Standard 2BHK Family Apt',
        category: 'residential',
        price: 6500000,
        maintenance: 3500,
        rental_income: 35000,
        image: require('../../assets/properties/bigger_2bhk_with_kids_room.png'),
        description: 'Standard middle-class family apartment. Very stable tenants who usually stay 3-5 years.'
    },
    {
        id: '3bhk_office',
        name: '3BHK with Home Office',
        category: 'residential',
        price: 8500000,
        maintenance: 4200,
        rental_income: 45000,
        image: require('../../assets/properties/budget_apartment_for_family_of_3_with_home_office.png'),
        description: 'Designed for remote workers. Tenants home 24/7 increases utility load, but they pay a premium.'
    },
    {
        id: 'city_2bhk',
        name: 'City 2BHK (Prime Location)',
        category: 'residential',
        price: 9500000,
        maintenance: 5000,
        rental_income: 50000,
        image: require('../../assets/properties/city_apartment_with_2_beds_and_1_bath.png'),
        description: 'Prime location flat for professionals. High society fees due to elevator and security.'
    },
    {
        id: '3bhk_guest',
        name: '3BHK with Guest Room',
        category: 'residential',
        price: 11000000,
        maintenance: 6000,
        rental_income: 55000,
        image: require('../../assets/properties/apartment_for_family_of_3_with_guestbedroom.png'),
        description: 'Spacious unit for families hosting relatives. Low vacancy risk as families settle in.'
    },
    {
        id: 'townhouse',
        name: 'Comfortable Townhouse',
        category: 'residential',
        price: 7500000,
        maintenance: 4500,
        rental_income: 40000,
        image: require('../../assets/properties/comfortable_town_house.png'),
        description: 'Rowhouse in quiet neighborhood. No society fees, but you handle all repairs.'
    },
    {
        id: 'bungal_old',
        name: 'Classic Family Bungalow',
        category: 'residential',
        price: 12000000,
        maintenance: 7000,
        rental_income: 60000,
        image: require('../../assets/properties/lower_end_family_bunglow_for_family_of_4-5.png'),
        description: 'Older standalone house. Spacious but requires constant handyman work for leaks and wiring.'
    },
    {
        id: 'house_garden',
        name: 'Family House with Garden',
        category: 'residential',
        price: 15000000,
        maintenance: 8500,
        rental_income: 75000,
        image: require('../../assets/properties/family_house_with_garden_and_backyard.png'),
        description: 'Desirable family home. Garden adds value but requires seasonal landscaping costs.'
    },

    // --- TIER 3: Luxury & High Net Worth ---
    {
        id: 'bungal_wine',
        name: 'Bungalow with Wine Cellar',
        category: 'residential',
        price: 35000000,
        maintenance: 12000,
        rental_income: 180000,
        image: require('../../assets/properties/family_bunglow_with_large_kitchen_and_wine_cellar.png'),
        description: 'Premium property for entertaining. High-end kitchen appliances cost a fortune to repair.'
    },
    {
        id: 'bungal_pool',
        name: 'Luxury Villa with Pool',
        category: 'residential',
        price: 55000000,
        maintenance: 25000,
        rental_income: 280000,
        image: require('../../assets/properties/family_bunglow_with_pool_and_backyard.png'),
        description: 'Luxury villa with massive pool expense (chemicals, cleaning), but commands premium rental value.'
    },
    {
        id: 'villa_theatre',
        name: 'Smart Villa with Home Theatre',
        category: 'residential',
        price: 75000000,
        maintenance: 30000,
        rental_income: 380000,
        image: require('../../assets/properties/fancy_family_villa_with_home_theatre_and_garden.png'),
        description: 'Tech-heavy smart home for executives with central AC. Automation repairs are costly.'
    },
    {
        id: 'villa_ultra',
        name: 'Ultra-Luxury Movie Villa',
        category: 'residential',
        price: 120000000,
        maintenance: 50000,
        rental_income: 550000,
        image: require('../../assets/properties/fully_furnish_villa_with_movie_theatre.png'),
        description: 'Ultra-luxury residence for celebrities. Must be kept in 5-star hotel condition for premium renters.'
    },
    {
        id: 'farmhouse',
        name: 'Weekend Farmhouse',
        category: 'residential',
        price: 40000000,
        maintenance: 18000,
        rental_income: 150000,
        image: require('../../assets/properties/mid_size_farmhouse_with_pool.png'),
        description: 'City outskirts getaway. Rent for events/weekends or use personally. Requires permanent staff.'
    },
    {
        id: 'beach_house',
        name: 'Premium Beach House',
        category: 'residential',
        price: 60000000,
        maintenance: 15000,
        rental_income: 220000,
        image: require('../../assets/properties/Beach_house_for_family_of_4-5.png'),
        description: 'Premium vacation rental. Salt air corrodes metal/paint, requiring structural maintenance.'
    },
    {
        id: 'villa_unfurn',
        name: 'Large Unfurnished Villa',
        category: 'residential',
        price: 30000000,
        maintenance: 9000,
        rental_income: 140000,
        image: require('../../assets/properties/villa_for_family_of_4-5.png'),
        description: 'Large villa where you maintain structure/walls, tenant handles interiors.'
    },

    // --- TIER 4: Investment Complexes ---
    {
        id: 'complex_penthouse',
        name: 'Apartment Complex + Penthouse',
        category: 'residential',
        price: 150000000,
        maintenance: 28000,
        rental_income: 650000,
        image: require('../../assets/properties/3_floor_apartment_complex_with_penthouse.png'),
        description: 'You own the entire building + luxury penthouse. High rental income but requires property manager.'
    },
    {
        id: 'city_3floor',
        name: '3-Floor City Complex',
        category: 'residential',
        price: 90000000,
        maintenance: 22000,
        rental_income: 400000,
        image: require('../../assets/properties/city_apartment_with_3_floors.png'),
        description: 'Multi-family residential block. Good rental income but requires a manager for tenant disputes.'
    },

    // --- GEMINI GENERATED (Special/Modern) ---
    {
        id: 'gemini_high_density',
        name: 'High-Density Vertical Project',
        category: 'residential',
        price: 200000000,
        maintenance: 15000,
        rental_income: 850000,
        image: require('../../assets/properties/Gemini_Generated_Image_ls1ivyls1ivyls1i.png'),
        description: 'Cross-section view of a high-density vertical housing project. Maximum rental income from urban living.'
    },
    {
        id: 'gemini_luxury_cutaway',
        name: 'Luxury Complex Cutaway',
        category: 'residential',
        price: 250000000,
        maintenance: 20000,
        rental_income: 1100000,
        image: require('../../assets/properties/Gemini_Generated_Image_soqxrtsoqxrtsoqx.png'),
        description: 'Luxury complex cutaway showing elevator shafts and multiple residential layers. Premium rental income.'
    }
];

// COMMERCIAL PROPERTIES - Always rented to businesses
export const COMMERCIAL_PROPERTIES = [
    // --- TIER 1: Small Agricultural & Sports ---
    {
        id: 'cow_shed',
        name: 'Dairy Cow Shed',
        category: 'commercial',
        price: 8000000,
        maintenance: 12000,
        rental_income: 45000,
        image: require('../../assets/properties/investment properties/cow_shed.png'),
        description: 'Small dairy operation. Lease to farmers for milk production. Maintenance includes shed repairs.'
    },
    {
        id: 'small_farm',
        name: 'Small Family Farm',
        category: 'commercial',
        price: 15000000,
        maintenance: 8000,
        rental_income: 60000,
        image: require('../../assets/properties/investment properties/small_farm.png'),
        description: 'Compact farmland for vegetables/crops. Tenant farms it, you collect lease.'
    },
    {
        id: 'badminton_facility',
        name: 'Badminton Sports Facility',
        category: 'commercial',
        price: 25000000,
        maintenance: 15000,
        rental_income: 100000,
        image: require('../../assets/properties/investment properties/badminton_sports_facility.png'),
        description: 'Indoor badminton courts. Rent to sports clubs or coaching centers.'
    },
    {
        id: 'basketball_facility',
        name: 'Basketball Sports Complex',
        category: 'commercial',
        price: 35000000,
        maintenance: 18000,
        rental_income: 140000,
        image: require('../../assets/properties/investment properties/basketball_sports_facility.png'),
        description: 'Outdoor basketball courts with seating. Rent for tournaments and training.'
    },

    // --- TIER 2: Mid-Scale Commercial ---
    {
        id: 'parking_lot',
        name: 'Commercial Parking Lot',
        category: 'commercial',
        price: 20000000,
        maintenance: 5000,
        rental_income: 80000,
        image: require('../../assets/properties/investment properties/commerical_parking_lot.png'),
        description: 'Paved land in business district. Low maintenance, income depends on city traffic patterns.'
    },
    {
        id: 'retail_lot',
        name: 'High-Street Retail Lot',
        category: 'commercial',
        price: 85000000,
        maintenance: 10000,
        rental_income: 320000,
        image: require('../../assets/properties/investment properties/commercial_lot.png'),
        description: 'Retail space with long commercial leases. You pay insurance/compliance, tenant pays interiors.'
    },
    {
        id: 'high_end_gym',
        name: 'Premium Fitness Center',
        category: 'commercial',
        price: 50000000,
        maintenance: 25000,
        rental_income: 200000,
        image: require('../../assets/properties/investment properties/high_end_gym.png'),
        description: 'High-end gym with equipment. Lease to fitness franchises or operators.'
    },
    {
        id: 'banquet_hall',
        name: 'Marriage Banquet Hall',
        category: 'commercial',
        price: 60000000,
        maintenance: 20000,
        rental_income: 250000,
        image: require('../../assets/properties/investment properties/marraige_banquet_hall.png'),
        description: 'Event venue for weddings. High seasonal demand but requires frequent cleaning and repairs.'
    },

    // --- TIER 3: Large Agricultural & Industrial ---
    {
        id: 'coffee_estate',
        name: 'Coffee Estate',
        category: 'commercial',
        price: 80000000,
        maintenance: 30000,
        rental_income: 280000,
        image: require('../../assets/properties/investment properties/coffee_estate.png'),
        description: 'Large coffee plantation. Lease to agricultural companies for cultivation.'
    },
    {
        id: 'high_end_farm',
        name: 'High-End Agricultural Farm',
        category: 'commercial',
        price: 100000000,
        maintenance: 35000,
        rental_income: 350000,
        image: require('../../assets/properties/investment properties/high_end_farm.png'),
        description: 'Premium farmland with modern irrigation. Lease for organic farming or agribusiness.'
    },
    {
        id: 'industrial_lot',
        name: 'Industrial Warehouse Lot',
        category: 'commercial',
        price: 120000000,
        maintenance: 15000,
        rental_income: 450000,
        image: require('../../assets/properties/industrial_lot.png'),
        description: 'Large warehouse space for manufacturing or storage. Long-term commercial leases with stable income.'
    },

    // --- TIER 4: Luxury Commercial ---
    {
        id: 'villa_community',
        name: 'Gated Villa Community',
        category: 'commercial',
        price: 200000000,
        maintenance: 40000,
        rental_income: 800000,
        image: require('../../assets/properties/investment properties/villa_gated_community.png'),
        description: 'Entire gated community of luxury villas. Collect rent from multiple high-end tenants.'
    },
    {
        id: 'shopping_mall',
        name: 'Shopping Mall',
        category: 'commercial',
        price: 500000000,
        maintenance: 80000,
        rental_income: 2000000,
        image: require('../../assets/properties/investment properties/mall.png'),
        description: 'Multi-floor shopping complex. Massive rental income from retail tenants but high upkeep costs.'
    },
    {
        id: 'five_star_resort',
        name: '5-Star Resort',
        category: 'commercial',
        price: 800000000,
        maintenance: 150000,
        rental_income: 3500000,
        image: require('../../assets/properties/investment properties/5_star_resort.png'),
        description: 'Ultra-luxury resort property. Lease to hospitality chains for premium returns.'
    }
];
