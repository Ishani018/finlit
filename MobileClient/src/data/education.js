// Education System - Duration-based enrollment
// Players enroll, pay monthly tuition, and graduate after N months.
// Can take education loan. Can study while working (part-time = 2x duration).

export const EDUCATION = [
    {
        id: 'edu_vocational',
        name: 'Vocational Training',
        type: 'certification',
        duration: 6,          // 6 months full-time
        monthly_tuition: 8000,
        total_cost: 48000,    // duration × tuition (for display)
        req_degrees: [],
        image: require('../../assets/jobs/SDE.png'),
        description: '6-month trade course. Learn plumbing, carpentry, electrical work.'
    },
    {
        id: 'edu_cs_degree',
        name: 'Computer Science Degree',
        type: 'degree',
        duration: 36,         // 3 years
        monthly_tuition: 55000,
        total_cost: 1980000,
        req_degrees: [],
        image: require('../../assets/jobs/SDE.png'),
        description: '3-year B.Tech in CS. Opens doors to tech careers. Take a loan if needed.'
    },
    {
        id: 'edu_mba',
        name: 'MBA',
        type: 'degree',
        duration: 24,         // 2 years
        monthly_tuition: 165000,
        total_cost: 3960000,
        req_degrees: ['Computer Science Degree'],
        image: require('../../assets/jobs/SDE.png'),
        description: '2-year MBA from a top B-school. Prerequisite: CS Degree. Unlocks CEO path.'
    },
    {
        id: 'edu_medical',
        name: 'Medical Degree',
        type: 'degree',
        duration: 60,         // 5 years
        monthly_tuition: 85000,
        total_cost: 5100000,
        req_degrees: [],
        image: require('../../assets/jobs/vet.png'),
        description: '5-year MBBS. Long and expensive, but doctors earn well and never go jobless.'
    },
    {
        id: 'edu_design',
        name: 'Design Diploma',
        type: 'diploma',
        duration: 12,         // 1 year
        monthly_tuition: 25000,
        total_cost: 300000,
        req_degrees: [],
        image: require('../../assets/jobs/interior designer.png'),
        description: '1-year diploma in design. Quick path to creative careers.'
    },
    {
        id: 'edu_culinary',
        name: 'Culinary Arts Diploma',
        type: 'diploma',
        duration: 12,         // 1 year
        monthly_tuition: 65000,
        total_cost: 780000,
        req_degrees: [],
        image: require('../../assets/jobs/chef in high end restaurant.png'),
        description: '1-year intensive culinary school. Learn to cook at a professional level.'
    },
    {
        id: 'edu_science',
        name: 'Science PhD',
        type: 'degree',
        duration: 48,         // 4 years
        monthly_tuition: 30000,
        total_cost: 1440000,
        req_degrees: [],
        image: require('../../assets/jobs/microbiologist.png'),
        description: '4-year research degree. Low tuition (stipend-funded) but takes years.'
    },
    {
        id: 'edu_law',
        name: 'Law Degree',
        type: 'degree',
        duration: 60,         // 5 years LLB
        monthly_tuition: 70000,
        total_cost: 4200000,
        req_degrees: [],
        image: require('../../assets/jobs/law firm.png'),
        description: '5-year LLB. Gruelling but opens the door to Law Firm Partner — one of the highest-earning careers in the game.'
    }
];
