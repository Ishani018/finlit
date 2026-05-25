export const INTERVIEW_SCENARIOS = [
    {
        id: 'weekend_work',
        text: "The hiring manager looks over your resume and nods. 'We often have tight deadlines that require working weekends. How do you feel about unpaid overtime?'",
        choices: [
            {
                label: "I'll do whatever it takes to succeed.",
                desc: "The Grinder (Guaranteed Hire, Health/Happiness hit)",
                successChance: 1.0,
                salaryMultiplier: 1.0,
                healthModifier: -15,
                happinessModifier: -15,
                successMsg: "They loved your dedication. You got the job, but say goodbye to your weekends.",
                failMsg: ""
            },
            {
                label: "I value my time. I'll do it, but I want 15% more pay.",
                desc: "The Negotiator (50% Chance, +15% Salary)",
                successChance: 0.5,
                salaryMultiplier: 1.15,
                healthModifier: -5,
                happinessModifier: 0,
                successMsg: "They respected your negotiation skills! You got the job with a higher starting salary.",
                failMsg: "They were offended by your demands and rescinded the offer."
            },
            {
                label: "No, weekends are strictly for me and my family.",
                desc: "The Boundary Setter (60% Chance, +10 Happiness)",
                successChance: 0.6,
                salaryMultiplier: 1.0,
                healthModifier: 0,
                happinessModifier: 10,
                successMsg: "They appreciated your honesty and hired you anyway.",
                failMsg: "They decided you weren't a 'team player' and rejected you."
            }
        ]
    },
    {
        id: 'stress_test',
        text: "'This role is extremely high-pressure,' the recruiter warns. 'How do you handle severe stress in the workplace?'",
        choices: [
            {
                label: "I thrive under pressure. Give it to me.",
                desc: "The Workaholic (Guaranteed Hire, -20 Health)",
                successChance: 1.0,
                salaryMultiplier: 1.0,
                healthModifier: -20,
                happinessModifier: -5,
                successMsg: "They need someone who can take the heat. You're hired.",
                failMsg: ""
            },
            {
                label: "I handle it by organizing my time effectively.",
                desc: "The Professional (75% Chance)",
                successChance: 0.75,
                salaryMultiplier: 1.0,
                healthModifier: 0,
                happinessModifier: 0,
                successMsg: "A solid, safe answer. You got the offer.",
                failMsg: "They felt your answer was too generic and went with someone else."
            },
            {
                label: "If the pressure is unreasonable, I push back on management.",
                desc: "The Rebel (40% Chance, +20% Salary, +10 Happiness)",
                successChance: 0.4,
                salaryMultiplier: 1.20,
                healthModifier: 0,
                happinessModifier: 10,
                successMsg: "They actually loved your boldness and offered you a premium salary!",
                failMsg: "They marked you as 'difficult to manage' and rejected your application."
            }
        ]
    },
    {
        id: 'relocation',
        text: "'We might need you to travel extensively or relocate to a cheaper city in the future. Is that acceptable?'",
        choices: [
            {
                label: "Absolutely, my bags are already packed.",
                desc: "The Nomad (Guaranteed Hire, -15 Happiness)",
                successChance: 1.0,
                salaryMultiplier: 1.0,
                healthModifier: 0,
                happinessModifier: -15,
                successMsg: "They appreciate the flexibility. Welcome aboard.",
                failMsg: ""
            },
            {
                label: "Only if my travel expenses and a stipend are covered.",
                desc: "The Negotiator (60% Chance, +10% Salary)",
                successChance: 0.6,
                salaryMultiplier: 1.10,
                healthModifier: 0,
                happinessModifier: 0,
                successMsg: "They agreed to your terms and bumped your base pay to compensate.",
                failMsg: "They decided your demands were too expensive and passed."
            },
            {
                label: "No, my current location is where I intend to stay.",
                desc: "The Rooted (50% Chance, +15 Happiness)",
                successChance: 0.5,
                salaryMultiplier: 1.0,
                healthModifier: 0,
                happinessModifier: 15,
                successMsg: "They decided they can work around your location. You got the job!",
                failMsg: "The role strictly requires travel. They had to reject you."
            }
        ]
    }
];
