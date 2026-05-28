export const SPRITE_MAP = {
    // Static spouse variants (for dating app matches)
    'groom_v1': require('../../assets/sprites/groom normal clothes.png'),
    'groom_v2': require('../../assets/sprites/groom version 2 normal clothes.png'),
    'groom_v3': require('../../assets/sprites/groom version 3 normal clothes.png'),
    'bride_v1': require('../../assets/sprites/bride normal clothes.png'),
    'bride_v2': require('../../assets/sprites/bride version 2 normal clothes.png'),
    'bride_v3': require('../../assets/sprites/bride version 3 normal clothes.png'),

    // Young variants (ages 18–24)
    'young_pia_1':     require('../../assets/sprites/young pia 1.png'),
    'young_raj_1':     require('../../assets/sprites/young raj 1.png'),
    'young_soms_1':    require('../../assets/sprites/young soms 1.png'),
    'young_sia_1':     require('../../assets/sprites/young sia 1.png'),
    'young_soni_1':    require('../../assets/sprites/young soni 1.png'),
    'young_priya_1':   require('../../assets/sprites/young priya 1.png'),
    'young_rahul_1':   require('../../assets/sprites/young rahul 1.png'),
    'young_kav_1':     require('../../assets/sprites/young kav 1.png'),

    // Age variants — pia
    'young_pia_1_mid':    require('../../assets/sprites/pia 25-30.png'),
    'young_pia_1_older':  require('../../assets/sprites/pia middleage.png'),
    'young_pia_1_senior': require('../../assets/sprites/pia 50plus.png'),

    // Age variants — raj
    'young_raj_1_mid':    require('../../assets/sprites/raj 25-30.png'),
    'young_raj_1_older':  require('../../assets/sprites/raj middleage.png'),
    'young_raj_1_senior': require('../../assets/sprites/raj 50plus.png'),

    // Age variants — priya
    'young_priya_1_mid':    require('../../assets/sprites/priya 25-30.png'),
    'young_priya_1_older':  require('../../assets/sprites/priya middleage.png'),
    'young_priya_1_senior': require('../../assets/sprites/priya 50plus.png'),

    // Age variants — kav
    'young_kav_1_mid':    require('../../assets/sprites/kav 25-30.png'),
    'young_kav_1_older':  require('../../assets/sprites/kav middleage.png'),
    'young_kav_1_senior': require('../../assets/sprites/kav 50plus.png'),

    // Age variants — soms
    'young_soms_1_mid':    require('../../assets/sprites/soms 25-30.png'),
    'young_soms_1_older':  require('../../assets/sprites/soms middleage.png'),
    'young_soms_1_senior': require('../../assets/sprites/soms 50plus.png'),

    // Age variants — sia
    'young_sia_1_mid':    require('../../assets/sprites/sia 25-30.png'),
    'young_sia_1_older':  require('../../assets/sprites/sia middleage.png'),
    'young_sia_1_senior': require('../../assets/sprites/sia 50plus.png'),

    // Age variants — soni
    'young_soni_1_mid':    require('../../assets/sprites/soni 25-30.png'),
    'young_soni_1_older':  require('../../assets/sprites/soni middleage.png'),
    'young_soni_1_senior': require('../../assets/sprites/soni 50plus.png'),

    // Age variants — rahul
    'young_rahul_1_mid':    require('../../assets/sprites/rahul 25-30.png'),
    'young_rahul_1_older':  require('../../assets/sprites/rahul middleage.png'),
    'young_rahul_1_senior': require('../../assets/sprites/rahul 50plus.png'),

};

// Age brackets → variant suffix
// young: 18–24 (base sprite, no suffix)
// mid:   25–30
// older: 31–49
// senior: 50+
const AGE_SUFFIX = (age) => {
    if (age >= 50) return '_senior';
    if (age >= 31) return '_older';
    if (age >= 25) return '_mid';
    return '';
};

export const getSpriteImage = (id, age = 18) => {
    if (!id) return null;
    const suffix = AGE_SUFFIX(age);
    // Try age-specific variant first, fall back to base
    return SPRITE_MAP[id + suffix] || SPRITE_MAP[id] || null;
};
