const fs = require('fs');

let content = fs.readFileSync('src/context/GameContext.js', 'utf8');

// 1. resolveDecision block
content = content.replace(
    /setPendingDecision\(null\);\s*if \(\!latestCrisis \&\& \!pendingFamilyDemand\) \{\s*setIsPlaying\(true\);\s*\}/,
    `if (pendingDecisionQueue.length > 0) {
            setPendingDecision(pendingDecisionQueue[0]);
            setPendingDecisionQueue(prev => prev.slice(1));
        } else {
            setPendingDecision(null);
            if (!latestCrisis && !pendingFamilyDemand) {
                setIsPlaying(true);
            }
        }`
);

// 2. decisionsToQueue in nextMonth
content = content.replace(
    /const nextMonthNum = turn\.month === 12 \? 1 : turn\.month \+ 1;/,
    `const decisionsToQueue = [];\n        const nextMonthNum = turn.month === 12 ? 1 : turn.month + 1;`
);

// 3. ITR Deadline block
content = content.replace(
    /if \(turn\.month === 7 \&\& \!pendingDecision/,
    `if (turn.month === 7`
);
content = content.replace(
    /setPendingDecision\(\{\s*id: `itr_\$\{gameYear\}`/g,
    `decisionsToQueue.push({\n                    id: \`itr_\${gameYear}\``
);

// 4. Budget Day
content = content.replace(
    /if \(turn\.month === 2 \&\& \!pendingDecision/,
    `if (turn.month === 2`
);
content = content.replace(
    /setPendingDecision\(\{ \.\.\.budgetEvent, isBudget: true \}\);/g,
    `decisionsToQueue.push({ ...budgetEvent, isBudget: true });`
);

// 5. Birthday Mechanics - Player
content = content.replace(
    /if \(bdayMonth \&\& totalMonthsPlayed > 0 \&\& \!pendingDecision\) \{/,
    `if (bdayMonth && totalMonthsPlayed > 0) {`
);
content = content.replace(
    /\} else if \(\!pendingDecision\) \{\s*\/\/ Regular Birthday Party \(Forced\)\s*setPendingDecision\(\{/g,
    `} else {\n                // Regular Birthday Party (Forced)\n                decisionsToQueue.push({`
);

// 6. Birthday Mechanics - Dependents
content = content.replace(
    /\} else if \(\!pendingDecision \&\& totalMonthsPlayed > 0\) \{/,
    `}\n\n        if (totalMonthsPlayed > 0) {`
);
content = content.replace(
    /setPendingDecision\(\{\s*id: `dep_bday_\$\{bdayDependent\.id\}_\$\{totalMonthsPlayed\}`/g,
    `decisionsToQueue.push({\n                    id: \`dep_bday_\${bdayDependent.id}_\${totalMonthsPlayed}\``
);

// 7. Random Crisis
content = content.replace(
    /if \(\!pendingDecision \&\& Math\.random\(\) < CRISIS_PROBABILITY/,
    `if (Math.random() < CRISIS_PROBABILITY`
);
const crisisRegex = /const decision = \{\s*id: `crisis_\$\{totalMonthsPlayed\}`[\s\S]*?setPendingDecision\(decision\);/m;
const crisisMatch = content.match(crisisRegex);
if (crisisMatch) {
    const newCrisis = crisisMatch[0].replace(/setPendingDecision\(decision\);/, 'decisionsToQueue.push(decision);');
    content = content.replace(crisisMatch[0], newCrisis);
}

// 8. End of nextMonth processing queue
content = content.replace(
    /\/\/ Credit Card popup offer/,
    `// Process Queued Decisions
        if (decisionsToQueue.length > 0) {
            setPendingDecision(decisionsToQueue[0]);
            if (decisionsToQueue.length > 1) {
                setPendingDecisionQueue(decisionsToQueue.slice(1));
            }
        }

        // Credit Card popup offer`
);

// 9. Pregnancy Fix
content = content.replace(
    /\/\/ Age children \+ decay dependent health each month\s*const nextDependents = \[\];\s*let setGamePaused = false;/,
    `// Age children + decay dependent health each month
        let setGamePaused = false;`
);

content = content.replace(
    /\/\/ Expecting Child logic/,
    `const nextDependents = [];\n        // Expecting Child logic`
);

const babyBornRegex = /\/\/ Add the child \(with custody undefined initially\)[\s\S]*?setDependents\(prev => \[\.\.\.prev, \{[\s\S]*?bdayMonth: turn\.month,[\s\S]*?monthAdded: totalMonthsPlayed,[\s\S]*?\}\]\);/;
const babyMatch = content.match(babyBornRegex);
if (babyMatch) {
    let replacedBaby = babyMatch[0].replace('setDependents(prev => [...prev, {', 'nextDependents.push({');
    replacedBaby = replacedBaby.replace(/}\]\);/, '});');
    content = content.replace(babyMatch[0], replacedBaby);
}

// 10. Dead Dependents - correctly using targeted replace for both child and parent death blocks
// For child:
content = content.replace(
    /setHappiness\(prev => Math\.max\(0, prev - 80\)\);\s*setGamePaused = true;\s*return;/,
    `setHappiness(prev => Math.max(0, prev - 80));\n                    setGamePaused = true;\n                    nextDependents.push({...d, health: 0, isDead: true});\n                    return;`
);

// For parent:
content = content.replace(
    /setHappiness\(prev => Math\.max\(0, prev - 50\)\);\s*setGamePaused = true;\s*return; \/\/ omit from nextDependents to kill them off/,
    `setHappiness(prev => Math.max(0, prev - 50));\n                    setGamePaused = true;\n                    nextDependents.push({...d, health: 0, isDead: true});\n                    return; // mark dead instead of omitting`
);

// Add pendingDecisionQueue state
content = content.replace('const [pendingDecision, setPendingDecision] = useState(null);', 'const [pendingDecision, setPendingDecision] = useState(null);\n    const [pendingDecisionQueue, setPendingDecisionQueue] = useState([]);');
content = content.replace('pendingDecision: stateRef.current.pendingDecision,', 'pendingDecision: stateRef.current.pendingDecision,\n                pendingDecisionQueue: stateRef.current.pendingDecisionQueue,');
content = content.replace('pendingApplications, pendingDecision, pendingJobInterview', 'pendingApplications, pendingDecision, pendingDecisionQueue, pendingJobInterview');
content = content.replace('setPendingDecision(s.pendingDecision);', 'setPendingDecision(s.pendingDecision);\n                if (s.pendingDecisionQueue) setPendingDecisionQueue(s.pendingDecisionQueue);');

fs.writeFileSync('src/context/GameContext.js', content, 'utf8');
