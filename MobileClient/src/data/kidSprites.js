// One place that decides which picture a child gets at each age (in months), so the Family tab,
// event popups and dialogs never disagree.
const IMG = {
    baby_son:           require('../../assets/dependents/baby_son.png'),
    baby_daughter:      require('../../assets/dependents/baby_daughter.png'),
    adopted_baby:       require('../../assets/dependents/adopted_baby.png'),
    infant_son:         require('../../assets/dependents/crawler_son.png'),
    infant_daughter:    require('../../assets/dependents/sitter_daughter.png'),
    toddler_son:        require('../../assets/dependents/toddler_son.png'),
    toddler_daughter:   require('../../assets/dependents/toddler_daughter.png'),
    child_son:          require('../../assets/dependents/pre_schooler_son.png'),
    child_daughter:     require('../../assets/dependents/pre_schooler_daughter.png'),
    teen_son:           require('../../assets/dependents/teenage_son.png'),
    teen_daughter:      require('../../assets/dependents/teenage_daughter.png'),
};

// baby (swaddled) under 1, crawling/sitting 1-2, toddler 3-4, school child 5-11, teen 12+
export function getKidSprite(gender, ageMonths = 0, adopted = false) {
    const f = String(gender || '').toLowerCase() === 'female';
    const pick = (son, daughter) => (f ? IMG[daughter] : IMG[son]);
    if (ageMonths < 12) return adopted && ageMonths < 6 ? IMG.adopted_baby : pick('baby_son', 'baby_daughter');
    if (ageMonths < 36) return pick('infant_son', 'infant_daughter');
    if (ageMonths < 60) return pick('toddler_son', 'toddler_daughter');
    if (ageMonths < 144) return pick('child_son', 'child_daughter');
    return pick('teen_son', 'teen_daughter');
}
