export const JOBS = [
    // --- TIER 1: GIGS & FREELANCE (Entry Level) ---
    {
        id: 'maid',
        name: 'Maid/Babysitter',
        salary: 12000,
        type: 'Tier 1: Gig',
        image: require('../../assets/jobs/maidbabysitter.png'),
        office_image: require('../../assets/jobs/maidbabysitter.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Reliable, immediate cash flow. Hard physical work with low leverage.'
    },
    {
        id: 'backup_singer',
        name: 'Backup Singer',
        salary: 15000, // Per gig avg
        type: 'Tier 1: Gig',
        image: require('../../assets/jobs/backup singer.png'),
        office_image: require('../../assets/jobs/backup singer.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Gig-based work dependent on tour schedules. Great exposure but unstable pay.'
    },
    {
        id: 'voice_artist',
        name: 'Voice Artist',
        salary: 25000, // Per project avg
        type: 'Tier 1: Service',
        image: require('../../assets/jobs/voice artist.png'),
        office_image: require('../../assets/jobs/voice artist.png'),
        req_net_worth: 20000, // Mic cost
        req_degrees: [],
        description: 'Paid per project. Requires a good mic and a quiet room. High competition.'
    },
    {
        id: 'game_tester',
        name: 'Game Tester',
        salary: 18000,
        type: 'Tier 1: Gig',
        image: require('../../assets/jobs/game tester.png'),
        office_image: require('../../assets/jobs/game tester.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Play games to find bugs. Fun but repetitive with a low salary ceiling.'
    },
    {
        id: 'code_debugger',
        name: 'Code Debugger',
        salary: 30000,
        type: 'Tier 1: Freelance',
        image: require('../../assets/jobs/code debugger.png'),
        office_image: require('../../assets/jobs/code debugger.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Fix other people\'s messy code. Pay is per "bug" squashed. High mental drain.'
    },
    {
        id: 'home_baker',
        name: 'Home Baker',
        salary: 15000, // Variable
        type: 'Tier 1: Biz',
        image: require('../../assets/jobs/home baker.png'),
        office_image: require('../../assets/jobs/home baker.png'),
        req_net_worth: 5000, // Ingredients
        req_degrees: [],
        description: 'Low overhead business. Limited by how many cakes you can bake in a single day.'
    },
    {
        id: 'etsy_maker',
        name: 'Etsy Jewellery Maker',
        salary: 10000, // Variable
        type: 'Tier 1: Creative',
        image: require('../../assets/jobs/etsy jewellery maker.png'),
        office_image: require('../../assets/jobs/etsy jewellery maker.png'),
        req_net_worth: 5000,
        req_degrees: [],
        description: 'Creative work. Income depends entirely on finding the right aesthetic niche.'
    },
    {
        id: 'streamer',
        name: 'Streamer',
        salary: 50000, // High variance avg
        type: 'Tier 1: Creative',
        image: require('../../assets/jobs/streamer.png'),
        office_image: require('../../assets/jobs/streamer.png'),
        req_net_worth: 50000, // PC Setup
        req_degrees: [],
        description: 'High variance role. Could earn zero or millions depending on follower count.'
    },
    {
        id: 'comic_illustrator',
        name: 'Comic Book Illustrator',
        salary: 35000,
        type: 'Tier 1: Creative',
        image: require('../../assets/jobs/comic book illustrator.png'),
        office_image: require('../../assets/jobs/comic book illustrator.png'),
        req_net_worth: 10000, // Tablet
        req_degrees: [],
        description: 'Niche artistic work. Long hours for passion, paid per page or commission.'
    },
    {
        id: 'piano_teacher',
        name: 'Piano Teacher',
        salary: 40000,
        type: 'Tier 1: Service',
        image: require('../../assets/jobs/piano teacher.png'),
        office_image: require('../../assets/jobs/piano teacher.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Skilled labor. Trading hours for cash, but limited by the number of students.'
    },
    {
        id: 'music_teacher',
        name: 'Music Teacher',
        salary: 42000,
        type: 'Tier 1: Service',
        image: require('../../assets/jobs/music teacher.png'),
        office_image: require('../../assets/jobs/music teacher.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Similar to Piano Teacher, but can do group classes for slightly better leverage.'
    },
    {
        id: 'dance_teacher',
        name: 'Dance Teacher',
        salary: 45000,
        type: 'Tier 1: Service',
        image: require('../../assets/jobs/dance teacher.png'),
        office_image: require('../../assets/jobs/dance teacher.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Physically demanding. Paid by the class. High energy required.'
    },
    {
        id: 'yoga_teacher',
        name: 'Yoga Teacher',
        salary: 50000,
        type: 'Tier 1: Service',
        image: require('../../assets/jobs/yoga teacher.png'),
        office_image: require('../../assets/jobs/yoga teacher.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Focus on wellness. Can charge premiums for private sessions.'
    },
    {
        id: 'plumber',
        name: 'Plumber',
        salary: 60000,
        type: 'Tier 1: Trade',
        image: require('../../assets/jobs/plumber.png'),
        office_image: require('../../assets/jobs/plumber.png'),
        req_net_worth: 20000, // Tools
        req_degrees: ['Vocational Training'],
        description: 'Essential trade skill. High demand, messy work, immediate cash payment.'
    },
    {
        id: 'carpenter',
        name: 'Carpenter',
        salary: 55000,
        type: 'Tier 1: Trade',
        image: require('../../assets/jobs/carpenter.png'),
        office_image: require('../../assets/jobs/carpenter.png'),
        req_net_worth: 20000, // Tools
        req_degrees: ['Vocational Training'],
        description: 'Skilled manual labor. Custom furniture pays well, repairs pay less.'
    },
    {
        id: 'tattoo_artist',
        name: 'Tattoo Artist',
        salary: 80000,
        type: 'Tier 1: Creative',
        image: require('../../assets/jobs/tattoo artist.png'),
        office_image: require('../../assets/jobs/tattoo artist.png'),
        req_net_worth: 50000, // Kit
        req_degrees: [],
        description: 'High skill and hygiene requirement. Reputation drives higher hourly rates.'
    },
    {
        id: 'indie_dev',
        name: 'Indie Game Developer',
        salary: 5000, // Until launch
        type: 'Tier 1: Creative',
        image: require('../../assets/jobs/Indie Game Developer.png'),
        office_image: require('../../assets/jobs/Indie Game Developer.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'High risk, high reward. Years of work for a potential hit or a total flop.'
    },

    // --- TIER 2: CAREERS (Salaried Professionals) ---
    {
        id: 'software_engineer',
        name: 'Software Engineer',
        salary: 120000,
        type: 'Tier 2: Tech',
        image: require('../../assets/jobs/software engindeer.png'),
        office_image: require('../../assets/jobs/software engindeer.png'),
        req_net_worth: 0,
        req_degrees: ['Computer Science Degree'],
        description: 'High demand, high salary. The standard safe path to building wealth.'
    },
    {
        id: 'forensic_scientist',
        name: 'Forensic Scientist',
        salary: 90000,
        type: 'Tier 2: Science',
        image: require('../../assets/jobs/forensic scientist.png'),
        office_image: require('../../assets/jobs/forensic scientist.png'),
        req_net_worth: 0,
        req_degrees: ['Science PhD'],
        description: 'Very niche, high stability. Government-backed security with strict procedures.'
    },
    {
        id: 'microbiologist',
        name: 'Microbiologist',
        salary: 85000,
        type: 'Tier 2: Science',
        image: require('../../assets/jobs/microbiolgist.png'),
        office_image: require('../../assets/jobs/microbiolgist.png'),
        req_net_worth: 0,
        req_degrees: ['Science PhD'],
        description: 'Lab-based research work. Consistent salary, low volatility, requires high intellect.'
    },
    {
        id: 'arvr_scientist',
        name: 'AR/VR Scientist',
        salary: 150000,
        type: 'Tier 2: Tech',
        image: require('../../assets/jobs/arvr scientist.png'),
        office_image: require('../../assets/jobs/arvr scientist.png'),
        req_net_worth: 0,
        req_degrees: ['Computer Science Degree'],
        description: 'Cutting-edge tech role. Very high salary but in a volatile, changing industry.'
    },
    {
        id: 'cad_engineer',
        name: 'CAD Engineer',
        salary: 70000,
        type: 'Tier 2: Eng',
        image: require('../../assets/jobs/CAD engineer.png'),
        office_image: require('../../assets/jobs/CAD engineer.png'),
        req_net_worth: 0,
        req_degrees: ['Vocational Training'],
        description: 'Essential for construction and design. Steady, reliable corporate work.'
    },
    {
        id: 'interior_designer',
        name: 'Interior Designer',
        salary: 75000, // + Commission
        type: 'Tier 2: Design',
        image: require('../../assets/jobs/indterior designer.png'),
        office_image: require('../../assets/jobs/indterior designer.png'),
        req_net_worth: 0,
        req_degrees: ['Design Diploma'],
        description: 'High fees for high-end clients. Reputation is everything.'
    },
    {
        id: 'therapist',
        name: 'Therapist',
        salary: 100000,
        type: 'Tier 2: Medical',
        image: require('../../assets/jobs/therapist.png'),
        office_image: require('../../assets/jobs/therapist.png'),
        req_net_worth: 0,
        req_degrees: ['Medical Degree'],
        description: 'High hourly rate. Emotionally taxing work but financially rewarding.'
    },
    {
        id: 'vet',
        name: 'Vet',
        salary: 95000,
        type: 'Tier 2: Medical',
        image: require('../../assets/jobs/vet.png'),
        office_image: require('../../assets/jobs/vet.png'),
        req_net_worth: 0,
        req_degrees: ['Medical Degree'],
        description: 'Recession-proof medical field. People will always pay to save their pets.'
    },
    {
        id: 'govt_job',
        name: 'Government Job',
        salary: 60000,
        type: 'Tier 2: Stable',
        image: require('../../assets/jobs/government job.png'),
        office_image: require('../../assets/jobs/government job.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'The ultimate safety net. Low growth, but zero risk of being fired. Pension benefits.'
    },
    {
        id: 'school_teacher',
        name: 'Middle School Teacher',
        salary: 45000,
        type: 'Tier 2: Edu',
        image: require('../../assets/jobs/middle school teacher.png'),
        office_image: require('../../assets/jobs/middle school teacher.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Stable but capped income. Long holidays, but emotionally draining.'
    },
    {
        id: 'chef',
        name: 'Chef (High End)',
        salary: 110000,
        type: 'Tier 2: Service',
        image: require('../../assets/jobs/chef in high end restaurant.png'),
        office_image: require('../../assets/jobs/chef in high end restaurant.png'),
        req_net_worth: 0,
        req_degrees: ['Culinary Arts Diploma'],
        description: 'High pressure, high prestige. Salary is good, but hours are brutal.'
    },
    {
        id: 'photographer',
        name: 'Commercial Photographer',
        salary: 80000,
        type: 'Tier 2: Creative',
        image: require('../../assets/jobs/Commercial Photographe.png'), // Typo in filename
        office_image: require('../../assets/jobs/Commercial Photographe.png'),
        req_net_worth: 200000, // Gear
        req_degrees: [], // Portfolio based?
        description: 'Corporate clients pay well for consistency. Gear is expensive.'
    },
    {
        id: 'horticulturist',
        name: 'Horticulturist',
        salary: 55000,
        type: 'Tier 2: Science',
        image: require('../../assets/jobs/Horticulturist.png'),
        office_image: require('../../assets/jobs/Horticulturist.png'),
        req_net_worth: 0,
        req_degrees: ['Science PhD'],
        description: 'Plant science specialist. Niche role in agriculture or luxury landscaping.'
    },
    {
        id: 'real_estate_consultant',
        name: 'Luxury Real Estate Consultant',
        salary: 200000, // Commission heavy
        type: 'Tier 2: Sales',
        image: require('../../assets/jobs/Luxury Real Estate Consultant.png'),
        office_image: require('../../assets/jobs/Luxury Real Estate Consultant.png'),
        req_net_worth: 0,
        req_degrees: [],
        description: 'Sales role. Low base pay, but massive commissions on a single sale.'
    },

    // --- TIER 3: SMALL BUSINESS (Active Ownership) ---
    {
        id: 'maggi_cafe',
        name: 'Maggi Cafe Owner',
        salary: 40000, // Profit
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/maggi cafe.png'),
        office_image: require('../../assets/jobs/maggi cafe.png'),
        req_net_worth: 200000, // Setup
        req_degrees: [],
        description: 'Student favorite. Low cost to set up, high volume of cheap sales.'
    },
    {
        id: 'irani_cafe',
        name: 'Irani Cafe Owner',
        salary: 60000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/irani cafe.png'),
        office_image: require('../../assets/jobs/irani cafe.png'),
        req_net_worth: 500000,
        req_degrees: [],
        description: 'Heritage value. Loyal customer base ensures steady, reliable profit.'
    },
    {
        id: 'dosashop',
        name: 'Dosa Shop Owner',
        salary: 80000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/dosashop.png'),
        office_image: require('../../assets/jobs/dosashop.png'),
        req_net_worth: 300000,
        req_degrees: [],
        description: 'High profit margin. Batter is cheap, but Dosa sells for a premium price.'
    },
    {
        id: 'sandwich_shop',
        name: 'Sandwich Shop Owner',
        salary: 50000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/sandwich shop.png'),
        office_image: require('../../assets/jobs/sandwich shop.png'),
        req_net_worth: 400000,
        req_degrees: [],
        description: 'Lunch rush is your only real income time. Location matters more than food.'
    },
    {
        id: 'juice_shop',
        name: 'Juice Shop Owner',
        salary: 45000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/juice shop.png'),
        office_image: require('../../assets/jobs/juice shop.png'),
        req_net_worth: 200000,
        req_degrees: [],
        description: 'Seasonal spikes. High profit on liquids and ice, low cost of goods.'
    },
    {
        id: 'juice_bar',
        name: 'Juice Bar (Premium)',
        salary: 70000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/juice bar.png'),
        office_image: require('../../assets/jobs/juice bar.png'),
        req_net_worth: 800000,
        req_degrees: [],
        description: 'Similar to juice shop but trendier. Higher prices for "organic" branding.'
    },
    {
        id: 'kirana_store',
        name: 'Kirana Store Owner',
        salary: 30000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/kirana store.png'),
        office_image: require('../../assets/jobs/kirana store.png'),
        req_net_worth: 500000,
        req_degrees: [],
        description: 'Tiny margins, but everyone needs groceries. A volume game with long hours.'
    },
    {
        id: 'hardware_shop',
        name: 'Hardware Shop Owner',
        salary: 55000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/hardware shop.png'),
        office_image: require('../../assets/jobs/hardware shop.png'),
        req_net_worth: 1000000, // Stock heavy
        req_degrees: [],
        description: 'Selling tools is safer than using them. Steady local demand for repairs.'
    },
    {
        id: 'florist',
        name: 'Florist',
        salary: 60000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/florist and bouquet shop.png'),
        office_image: require('../../assets/jobs/florist and bouquet shop.png'),
        req_net_worth: 300000,
        req_degrees: [],
        description: 'High risk inventory (flowers rot). High markup on weddings and holidays.'
    },
    {
        id: 'pet_grooming',
        name: 'Pet Grooming Shop',
        salary: 90000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/pet grooming shop.png'),
        office_image: require('../../assets/jobs/pet grooming shop.png'),
        req_net_worth: 600000,
        req_degrees: [],
        description: 'Luxury service for pets. Growing market with high customer retention.'
    },
    {
        id: 'tailor',
        name: 'Tailor Business',
        salary: 40000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/tailor business.png'),
        office_image: require('../../assets/jobs/tailor business.png'),
        req_net_worth: 200000,
        req_degrees: ['Vocational Training'],
        description: 'Custom fits command higher prices than ready-made clothes.'
    },
    {
        id: 'small_candle',
        name: 'Candle Business',
        salary: 20000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/small candle business.png'),
        office_image: require('../../assets/jobs/small candle business.png'),
        req_net_worth: 50000,
        req_degrees: [],
        description: 'Niche aesthetic product. Great for online sales or gift shops.'
    },
    {
        id: 'boots_workshop',
        name: 'Boots Workshop',
        salary: 50000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/boots workshop.png'),
        office_image: require('../../assets/jobs/boots workshop.png'),
        req_net_worth: 400000,
        req_degrees: ['Vocational Training'],
        description: 'Specialized leather goods. Durable products justify high prices.'
    },
    {
        id: 'print_shop',
        name: 'Print Shop',
        salary: 45000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/print shop.png'),
        office_image: require('../../assets/jobs/print shop.png'),
        req_net_worth: 800000, // Printers exp
        req_degrees: [],
        description: 'B2B service. Steady work from local businesses and students.'
    },
    {
        id: 'hairdresser',
        name: 'Hairdresser (Salon Owner)',
        salary: 65000,
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/hairdresser.png'),
        office_image: require('../../assets/jobs/hairdresser.png'),
        req_net_worth: 500000,
        req_degrees: ['Vocational Training'],
        description: 'Recession-proof. Everyone needs a haircut. Tips add to the income.'
    },
    {
        id: 'sweet_shop',
        name: 'Sweet Shop',
        salary: 100000, // High seasonal
        type: 'Tier 3: Biz',
        image: require('../../assets/jobs/sweet shop.png'),
        office_image: require('../../assets/jobs/sweet shop.png'),
        req_net_worth: 1000000,
        req_degrees: [],
        description: 'High volume during festivals. Perishable inventory requires careful management.'
    },

    // --- TIER 4: BIG BUSINESS & ASSETS (High Capital) ---
    {
        id: 'winery',
        name: 'Winery Owner',
        salary: 500000, // Massive delayed
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/wineary.png'), // Typo in filename
        office_image: require('../../assets/jobs/wineary.png'),
        req_net_worth: 50000000, // 5 Cr
        req_degrees: [],
        description: 'Long-term play. Takes years to mature, but vintage wine sells for massive profit.'
    },
    {
        id: 'construction',
        name: 'Construction Site (Developer)',
        salary: 1000000, // Windfalls
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/construction site.png'),
        office_image: require('../../assets/jobs/construction site.png'),
        req_net_worth: 100000000, // 10 Cr
        req_degrees: [],
        description: 'High capital risk. If completed, developer fees are huge.'
    },
    {
        id: 'fine_dining',
        name: 'Fine Dining Restaurateur',
        salary: 300000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/fine dining restaurant.png'),
        office_image: require('../../assets/jobs/fine dining restaurant.png'),
        req_net_worth: 20000000, // 2 Cr
        req_degrees: [],
        description: 'High overheads and staff costs. Prestige brings in the elite spenders.'
    },
    {
        id: 'gold_business',
        name: 'Gold Business Owner',
        salary: 800000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/gold business.png'),
        office_image: require('../../assets/jobs/gold business.png'),
        req_net_worth: 50000000, // 5 Cr stock
        req_degrees: [],
        description: 'Dealing in high-value commodities. Security is a major cost, but margins are absolute.'
    },
    {
        id: 'law_firm',
        name: 'Law Firm Partner',
        salary: 600000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/law firm.png'),
        office_image: require('../../assets/jobs/law firm.png'),
        req_net_worth: 5000000, // Buy in
        req_degrees: ['Law Degree (Implicit)'],
        description: 'You own the partners. They bill hours, you take the profit share.'
    },
    {
        id: 'bridal_lehenga',
        name: 'Bridal Lehenga Shop',
        salary: 400000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/bridal lehenga shop.png'),
        office_image: require('../../assets/jobs/bridal lehenga shop.png'),
        req_net_worth: 10000000, // 1 Cr stock
        req_degrees: [],
        description: 'High ticket items. One sale covers rent for the week. Wedding season is gold.'
    },
    {
        id: 'bridal_boutique',
        name: 'Bridal Boutique Owner',
        salary: 450000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/Indian Bridal Boutique Owner.png'),
        office_image: require('../../assets/jobs/Indian Bridal Boutique Owner.png'),
        req_net_worth: 15000000, // 1.5 Cr
        req_degrees: [],
        description: 'Similar to Lehenga shop but includes wider variety. High inventory costs.'
    },
    {
        id: 'saree_business',
        name: 'Saree Business',
        salary: 350000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/saree business.png'),
        office_image: require('../../assets/jobs/saree business.png'),
        req_net_worth: 8000000, // 80 L
        req_degrees: [],
        description: 'Heritage fabrics. Consistent demand for weddings and festivals.'
    },
    {
        id: '3d_printing',
        name: '3D Printing Workshop',
        salary: 250000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/3d printing workshop.png'),
        office_image: require('../../assets/jobs/3d printing workshop.png'),
        req_net_worth: 5000000, // Machines
        req_degrees: ['Computer Science Degree'],
        description: 'Manufacturing at scale. Serves other businesses (B2B) with rapid prototyping.'
    },
    {
        id: 'podcast_studio',
        name: 'Podcast Studio Owner',
        salary: 150000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/podcast studio.png'),
        office_image: require('../../assets/jobs/podcast studio.png'),
        req_net_worth: 3000000,
        req_degrees: [],
        description: 'Renting out space and gear to creators. Low maintenance, high hourly rent.'
    },
    {
        id: 'coaching_centre',
        name: 'Coaching Centre Owner',
        salary: 600000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/coaching centre.png'),
        office_image: require('../../assets/jobs/coaching centre.png'),
        req_net_worth: 5000000,
        req_degrees: [],
        description: 'Incredibly profitable in education-obsessed markets. Scales well with more students.'
    },
    {
        id: 'preschool',
        name: 'Preschool Owner',
        salary: 500000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/preschool educator.png'),
        office_image: require('../../assets/jobs/preschool educator.png'),
        req_net_worth: 10000000, // Property
        req_degrees: [],
        description: 'If you own the school, it\'s a goldmine. Long-term enrollment fees.'
    },
    {
        id: 'dance_studio_owner',
        name: 'Dance Studio Owner',
        salary: 200000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/dance studio.png'),
        office_image: require('../../assets/jobs/dance studio.png'),
        req_net_worth: 8000000,
        req_degrees: [],
        description: 'Renting space to freelance teachers or running classes. Real estate play.'
    },
    {
        id: 'ceo',
        name: 'CEO',
        salary: 2000000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/CEO.png'),
        office_image: require('../../assets/jobs/CEO.png'),
        req_net_worth: 10000000,
        req_degrees: ['MBA'],
        description: 'The head of the table. Massive salary plus stock options. High stress, high reward.'
    },
    {
        id: 'chemist',
        name: 'Chemist Drugstore',
        salary: 180000,
        type: 'Tier 4: Empire',
        image: require('../../assets/jobs/chemist drugstore.png'),
        office_image: require('../../assets/jobs/chemist drugstore.png'),
        req_net_worth: 6000000,
        req_degrees: ['Medical Degree'], // Pharmacy license usually
        description: 'Essential service. Medicines have fixed margins but guaranteed demand.'
    }
];
