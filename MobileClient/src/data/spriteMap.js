export const SPRITE_MAP = {
    // Static spouse variants (for dating app matches)
    'groom_v1': require('../../assets/sprites/groom_normal_clothes.png'),
    'groom_v2': require('../../assets/sprites/groom_version_2_normal_clothes.png'),
    'groom_v3': require('../../assets/sprites/groom_version_3_normal_clothes.png'),
    'bride_v1': require('../../assets/sprites/bride_normal_clothes.png'),
    'bride_v2': require('../../assets/sprites/bride_version_2_normal_clothes.png'),
    'bride_v3': require('../../assets/sprites/bride_version_3_normal_clothes.png'),

    // Young variants (ages 18–24)
    'young_pia_1':     require('../../assets/sprites/young_pia_1.png'),
    'young_raj_1':     require('../../assets/sprites/young_raj_1.png'),
    'young_soms_1':    require('../../assets/sprites/young_soms_1.png'),
    'young_sia_1':     require('../../assets/sprites/young_sia_1.png'),
    'young_soni_1':    require('../../assets/sprites/young_soni_1.png'),
    'young_priya_1':   require('../../assets/sprites/young_priya_1.png'),
    'young_rahul_1':   require('../../assets/sprites/young_rahul_1.png'),
    'young_kav_1':     require('../../assets/sprites/young_kav_1.png'),

    // Age variants — pia
    'young_pia_1_mid':    require('../../assets/sprites/pia_25-30.png'),
    'young_pia_1_older':  require('../../assets/sprites/pia_middleage.png'),
    'young_pia_1_senior': require('../../assets/sprites/pia_50plus.png'),

    // Age variants — raj
    'young_raj_1_mid':    require('../../assets/sprites/raj_25-30.png'),
    'young_raj_1_older':  require('../../assets/sprites/raj_middleage.png'),
    'young_raj_1_senior': require('../../assets/sprites/raj_50plus.png'),

    // Age variants — priya
    'young_priya_1_mid':    require('../../assets/sprites/priya_25-30.png'),
    'young_priya_1_older':  require('../../assets/sprites/priya_middleage.png'),
    'young_priya_1_senior': require('../../assets/sprites/priya_50plus.png'),

    // Age variants — kav
    'young_kav_1_mid':    require('../../assets/sprites/kav_25-30.png'),
    'young_kav_1_older':  require('../../assets/sprites/kav_middleage.png'),
    'young_kav_1_senior': require('../../assets/sprites/kav_50plus.png'),

    // Age variants — soms
    'young_soms_1_mid':    require('../../assets/sprites/soms_25-30.png'),
    'young_soms_1_older':  require('../../assets/sprites/soms_middleage.png'),
    'young_soms_1_senior': require('../../assets/sprites/soms_50plus.png'),

    // Age variants — sia
    'young_sia_1_mid':    require('../../assets/sprites/sia_25-30.png'),
    'young_sia_1_older':  require('../../assets/sprites/sia_middleage.png'),
    'young_sia_1_senior': require('../../assets/sprites/sia_50plus.png'),

    // Age variants — soni
    'young_soni_1_mid':    require('../../assets/sprites/soni_25-30.png'),
    'young_soni_1_older':  require('../../assets/sprites/soni_middleage.png'),
    'young_soni_1_senior': require('../../assets/sprites/soni_50plus.png'),

    // Age variants — rahul
    'young_rahul_1_mid':    require('../../assets/sprites/rahul_25-30.png'),
    'young_rahul_1_older':  require('../../assets/sprites/rahul_middleage.png'),
    'young_rahul_1_senior': require('../../assets/sprites/rahul_50plus.png'),

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
