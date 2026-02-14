export const JOBS = [
    {
        id: 'student',
        name: 'Student',
        salary: 0,
        type: 'Education',
        image: '/assets/jobs/student.png',
        office_image: '/assets/offices/university_lecture_hall.png', // Placeholder
        req_net_worth: 0,
        req_degrees: [],
        description: 'You are studying hard. No salary yet. Focus on learning!'
    },
    {
        id: 'cafe_worker',
        name: 'Cafe Worker',
        salary: 15000,
        type: 'Service',
        image: '/assets/jobs/cafe.png',
        office_image: '/assets/offices/modern_cafe_interior.png',
        req_net_worth: 0,
        req_degrees: [],
        description: 'Serving coffee and smiles.'
    },
    {
        id: 'mechanic',
        name: 'Mechanic',
        salary: 25000,
        type: 'Trade',
        image: '/assets/jobs/mechanic.png',
        office_image: '/assets/offices/auto_repair_shop.png',
        req_net_worth: 500000, // Tools cost
        req_degrees: ['Vocational Training'],
        description: 'Fixing cars and bikes. Honest work.'
    },
    {
        id: 'software_engineer',
        name: 'Software Engineer',
        salary: 80000,
        type: 'Tech',
        image: '/assets/jobs/developer.png',
        office_image: '/assets/offices/tech_startup_office.png',
        req_net_worth: 2000000, // Education cost
        req_degrees: ['Computer Science Degree', 'Full Stack Bootcamp'],
        description: 'Writing code and fixing bugs in a cool office.'
    },
    {
        id: 'manager',
        name: 'Manager',
        salary: 150000,
        type: 'Corporate',
        image: '/assets/jobs/manager.png',
        office_image: '/assets/offices/corporate_corner_office.png',
        req_net_worth: 5000000,
        req_degrees: ['MBA', 'Management Certification'],
        description: 'Leading teams to success. High stress, high reward.'
    }
];
