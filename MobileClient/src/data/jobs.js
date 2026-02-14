export const JOBS = [
    {
        id: 'student',
        name: 'Student',
        salary: 0,
        type: 'Education',
        image: require('../../assets/jobs/student.png'),
        office_image: require('../../assets/jobs/student.png'), // Placeholder
        req_net_worth: 0,
        req_degrees: [],
        description: 'You are studying hard. No salary yet. Focus on learning!'
    },
    {
        id: 'cafe_worker',
        name: 'Cafe Worker',
        salary: 15000,
        type: 'Service',
        image: require('../../assets/jobs/cafe.png'),
        office_image: require('../../assets/jobs/cafe.png'), // Placeholder
        req_net_worth: 0,
        req_degrees: [],
        description: 'Serving coffee and smiles.'
    },
    {
        id: 'mechanic',
        name: 'Mechanic',
        salary: 25000,
        type: 'Trade',
        image: require('../../assets/jobs/mechanic.png'),
        office_image: require('../../assets/jobs/mechanic.png'), // Placeholder
        req_net_worth: 500000, // Tools cost
        req_degrees: ['Vocational Training'],
        description: 'Fixing cars and bikes. Honest work.'
    },
    {
        id: 'software_engineer',
        name: 'Software Engineer',
        salary: 80000,
        type: 'Tech',
        image: require('../../assets/jobs/developer.png'),
        office_image: require('../../assets/jobs/developer.png'), // Placeholder
        req_net_worth: 2000000, // Education cost
        req_degrees: ['Computer Science Degree', 'Full Stack Bootcamp'],
        description: 'Writing code and fixing bugs in a cool office.'
    },
    {
        id: 'manager',
        name: 'Manager',
        salary: 150000,
        type: 'Corporate',
        image: require('../../assets/jobs/manager.png'),
        office_image: require('../../assets/jobs/manager.png'), // Placeholder
        req_net_worth: 5000000,
        req_degrees: ['MBA', 'Management Certification'],
        description: 'Leading teams to success. High stress, high reward.'
    }
];
