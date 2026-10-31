import { ACC_LAYERS, SPRITE_RATIO } from './accessoryLayers';

// What the player can wear. `slot` decides which tab it lives on; ids match the
// `category/name` keys in accessoryLayers.js.
export const ACC_SLOTS = [
    { id: 'head', label: 'HEAD', cat: 'beanies' },
    { id: 'neck', label: 'NECK', cat: 'scarves' },
    { id: 'hair', label: 'HAIR', cat: 'hair' },
];

export const ACC_ITEMS = {
    head: [
        { id: 'beanies/mustard_cable',   label: 'Mustard beanie' },
        { id: 'beanies/teal_striped',    label: 'Teal beanie' },
        { id: 'beanies/cream',           label: 'Cream beanie' },
        { id: 'beanies/maroon_striped',  label: 'Maroon beanie' },
        { id: 'beanies/navy',            label: 'Navy beanie' },
        { id: 'beanies/grey_chevron',    label: 'Grey beanie' },
    ],
    neck: [
        { id: 'scarves/mustard',      label: 'Mustard scarf' },
        { id: 'scarves/plaid',        label: 'Plaid scarf' },
        { id: 'scarves/teal_striped', label: 'Teal scarf' },
        { id: 'scarves/cream_cable',  label: 'Cream scarf' },
        { id: 'scarves/navy',         label: 'Navy scarf' },
        { id: 'scarves/pink',         label: 'Pink scarf' },
    ],
    hair: [
        { id: 'hair/hibiscus_pin', label: 'Hibiscus' },
        { id: 'hair/jasmine_clip', label: 'Jasmine' },
        { id: 'hair/gold_clip',    label: 'Gold clip' },
        { id: 'hair/marigold_pin', label: 'Marigold' },
    ],
};

const STAGE = (age) => (age >= 50 ? 'senior' : age >= 31 ? 'older' : age >= 25 ? 'mid' : 'young');

// 'young_pia_1' + age 33 -> 'pia_older'. Returns null for sprites without overlays (spouses, kids).
export function spriteLayerKey(spriteId, age = 18) {
    const m = /^young_([a-z]+)_1$/.exec(spriteId || '');
    return m ? `${m[1]}_${STAGE(age)}` : null;
}

// Layers to draw over a sprite for the given look, in back-to-front order.
export function layersFor(spriteId, age, look) {
    const key = spriteLayerKey(spriteId, age);
    if (!key || !look || !ACC_LAYERS[key]) return { layers: [], ratio: null };
    const layers = ['neck', 'hair', 'head'].map(slot => look[slot] && ACC_LAYERS[key][look[slot]]).filter(Boolean);
    return { layers, ratio: SPRITE_RATIO[key] };
}
