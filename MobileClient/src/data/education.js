export const EDUCATION = [
    {
        id: 'edu_vocational',
        name: 'Vocational Training',
        type: 'certification',
        cost: 50000,
        req_degrees: [],
        image: require('../../assets/jobs/SDE.png'),
        description: 'Trade skills for mechanics, carpenters, and plumbers.'
    },
    {
        id: 'edu_cs_degree',
        name: 'Computer Science Degree',
        type: 'degree',
        cost: 2000000,
        req_degrees: [],
        image: require('../../assets/jobs/SDE.png'),
        description: 'Required for Software Engineering roles.'
    },
    {
        id: 'edu_mba',
        name: 'MBA',
        type: 'degree',
        cost: 4000000,
        req_degrees: ['Computer Science Degree'], // Example prerequisite logic (can be empty)
        image: require('../../assets/jobs/SDE.png'),
        description: 'Master of Business Administration. Unlocks corporate leadership.'
    },
    {
        id: 'edu_medical',
        name: 'Medical Degree',
        type: 'degree',
        cost: 5000000,
        req_degrees: [],
        image: require('../../assets/jobs/vet.png'),
        description: 'Required for medical professions (Vet, Therapist, etc).'
    },
    {
        id: 'edu_design',
        name: 'Design Diploma',
        type: 'diploma',
        cost: 300000,
        req_degrees: [],
        image: require('../../assets/jobs/interior designer.png'),
        description: 'Unlocks creative careers like Interior Design.'
    },
    {
        id: 'edu_culinary',
        name: 'Culinary Arts Diploma',
        type: 'diploma',
        cost: 800000,
        req_degrees: [],
        image: require('../../assets/jobs/chef in high end restaurant.png'),
        description: 'Learn to cook at a professional level.'
    },
    {
        id: 'edu_science',
        name: 'Science PhD',
        type: 'degree',
        cost: 1500000,
        req_degrees: [],
        image: require('../../assets/jobs/microbiologist.png'),
        description: 'Advanced research degree for scientists.'
    }
];
