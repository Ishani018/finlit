const coinStack     = require('../../assets/achivements/coin stack.png');
const crestBank     = require('../../assets/achivements/crest with bank.png');
const familyPortrait = require('../../assets/achivements/family portrait.png');
const fist          = require('../../assets/achivements/fist.png');
const graphsStats   = require('../../assets/achivements/graphs and stats.png');
const piggyBank     = require('../../assets/achivements/piggy bank.png');

// Fallbacks for anything not covered by the new set
const apt1bhk       = require('../../assets/properties/1bhk_starter_apartment.png');
const apt3floor     = require('../../assets/properties/city_apartment_with_3_floors.png');
const penthouse     = require('../../assets/properties/3_floor_apartment_complex_with_penthouse.png');
const beach         = require('../../assets/properties/Beach_house_for_family_of_4-5.png');
const ceo           = require('../../assets/jobs/CEO.png');
const coaching      = require('../../assets/jobs/coaching centre.png');

export const ACHIEVEMENT_IMAGES = {
    // Wealth
    lakhpati:       coinStack,
    millionaire:    coinStack,
    crorepati:      graphsStats,
    ten_crore:      coinStack,

    // Career
    first_job:      ceo,
    high_earner:    graphsStats,
    boss_level:     graphsStats,

    // Education
    grad:           coaching,
    over_educated:  coaching,

    // Real estate
    homeowner:      apt1bhk,
    landlord:       apt3floor,
    mogul:          penthouse,

    // Investing
    first_stock:    graphsStats,
    diversified:    graphsStats,
    sip_master:     piggyBank,

    // Savings
    debt_free:      fist,
    emergency_fund: piggyBank,
    ppf_hero:       crestBank,
    fd_king:        crestBank,

    // Family
    married:        familyPortrait,
    parent:         familyPortrait,
    big_family:     familyPortrait,

    // Insurance
    protected:      crestBank,

    // Special
    early_retire:   beach,
    survivor:       fist,
    happiness_max:  familyPortrait,
};

export const GOAL_IMAGES = {
    goal_first_home:  apt1bhk,
    goal_10l:         coinStack,
    goal_1cr:         graphsStats,
    goal_debt_free:   fist,
    goal_family:      familyPortrait,
    goal_retire:      beach,
    goal_3_props:     apt3floor,
    goal_education:   coaching,
};
