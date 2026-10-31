import { ACC_LAYERS, SPRITE_RATIO } from './accessoryLayers';

// What the player can wear. `slot` decides which tab it lives on; ids match the
// `category/name` keys in accessoryLayers.js.
export const ACC_SLOTS = [
    { id: 'head', label: 'HEAD', cat: 'beanies' },
    { id: 'neck', label: 'NECK', cat: 'scarves' },
    { id: 'hair', label: 'HAIR', cat: 'hair' },
    { id: 'top', label: 'TOP', cat: 'tops' },
    { id: 'shoes', label: 'SHOES', cat: 'shoes' },
];

export const ACC_ITEMS = {
    top: [
        { id: 'tops/black',   label: 'Black' },
        { id: 'tops/cream',   label: 'Cream' },
        { id: 'tops/mustard', label: 'Mustard' },
        { id: 'tops/pink',    label: 'Pink' },
        { id: 'tops/red',     label: 'Red' },
        { id: 'tops/teal',    label: 'Teal' },
        { id: 'tops/violet',  label: 'Violet' },
    ],
    shoes: [
        { id: 'shoes/black', label: 'Black' },
        { id: 'shoes/white', label: 'White' },
        { id: 'shoes/brown', label: 'Brown' },
        { id: 'shoes/red',   label: 'Red' },
        { id: 'shoes/blue',  label: 'Blue' },
        { id: 'shoes/tan',   label: 'Tan' },
    ],
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

// Does this sprite (at this age) have art for a slot? Clothes and shoes are masked per sprite, so not every sprite has them yet.
export function hasSlot(spriteId, age, slotId) {
    const key = spriteLayerKey(spriteId, age);
    const layers = key && ACC_LAYERS[key];
    if (!layers) return false;
    const slot = ACC_SLOTS.find(s => s.id === slotId);
    return !!slot && Object.keys(layers).some(k => k.startsWith(slot.cat + '/'));
}

// Layers to draw over a sprite for the given look, in back-to-front order.
export function layersFor(spriteId, age, look) {
    const key = spriteLayerKey(spriteId, age);
    if (!key || !look || !ACC_LAYERS[key]) return { layers: [], ratio: null };
    const layers = ['shoes', 'top', 'neck', 'hair', 'head'].map(slot => look[slot] && ACC_LAYERS[key][look[slot]]).filter(Boolean);
    return { layers, ratio: SPRITE_RATIO[key] };
}
