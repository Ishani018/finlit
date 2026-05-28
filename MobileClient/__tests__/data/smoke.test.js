/**
 * Data layer smoke tests — verify all data files import cleanly and have the
 * expected shape. These catch typos, malformed objects, and missing fields
 * before the app even boots.
 */

import { JOBS } from '../../src/data/jobs';
import { EDUCATION } from '../../src/data/education';
import { STOCKS } from '../../src/data/stocks';
import { MUTUAL_FUNDS } from '../../src/data/mutualFunds';
import { RESIDENTIAL_PROPERTIES, COMMERCIAL_PROPERTIES } from '../../src/data/realEstate';
import { INSURANCE_PLANS } from '../../src/data/insurance';
import { LOAN_TYPES } from '../../src/data/loans';
import { CRISIS_EVENTS } from '../../src/data/crisisEvents';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { GROCERY_ITEMS } from '../../src/data/groceries';
import { GOLD_ASSETS } from '../../src/data/gold';

// ── Jobs ─────────────────────────────────────────────────────────────────────
describe('JOBS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(JOBS)).toBe(true);
    expect(JOBS.length).toBeGreaterThan(0);
  });

  test('every job has required fields', () => {
    JOBS.forEach(job => {
      expect(typeof job.id).toBe('string');
      expect(typeof job.name).toBe('string');
      expect(typeof job.salary).toBe('number');
      expect(job.salary).toBeGreaterThan(0);
    });
  });

  test('no duplicate job ids', () => {
    const ids = JOBS.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── Education ─────────────────────────────────────────────────────────────────
describe('EDUCATION data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(EDUCATION)).toBe(true);
    expect(EDUCATION.length).toBeGreaterThan(0);
  });

  test('every course has id, name, monthly_tuition, and duration', () => {
    EDUCATION.forEach(course => {
      expect(typeof course.id).toBe('string');
      expect(typeof course.name).toBe('string');
      expect(typeof course.monthly_tuition).toBe('number');
      expect(typeof course.duration).toBe('number');
      expect(course.duration).toBeGreaterThan(0);
    });
  });
});

// ── Stocks ────────────────────────────────────────────────────────────────────
describe('STOCKS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(STOCKS)).toBe(true);
    expect(STOCKS.length).toBeGreaterThan(0);
  });

  test('every stock has id, name, ticker, and price', () => {
    STOCKS.forEach(stock => {
      expect(typeof stock.id).toBe('string');
      expect(typeof stock.name).toBe('string');
      expect(typeof stock.ticker).toBe('string');
      expect(typeof stock.price).toBe('number');
      expect(stock.price).toBeGreaterThan(0);
    });
  });

  test('no duplicate stock ids', () => {
    const ids = STOCKS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── Mutual Funds ──────────────────────────────────────────────────────────────
describe('MUTUAL_FUNDS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(MUTUAL_FUNDS)).toBe(true);
    expect(MUTUAL_FUNDS.length).toBeGreaterThan(0);
  });

  test('every fund has id, name, and nav', () => {
    MUTUAL_FUNDS.forEach(mf => {
      expect(typeof mf.id).toBe('string');
      expect(typeof mf.name).toBe('string');
      expect(typeof mf.nav).toBe('number');
      expect(mf.nav).toBeGreaterThan(0);
    });
  });
});

// ── Real Estate ───────────────────────────────────────────────────────────────
describe('Real estate data', () => {
  test('RESIDENTIAL_PROPERTIES is a non-empty array', () => {
    expect(Array.isArray(RESIDENTIAL_PROPERTIES)).toBe(true);
    expect(RESIDENTIAL_PROPERTIES.length).toBeGreaterThan(0);
  });

  test('COMMERCIAL_PROPERTIES is a non-empty array', () => {
    expect(Array.isArray(COMMERCIAL_PROPERTIES)).toBe(true);
    expect(COMMERCIAL_PROPERTIES.length).toBeGreaterThan(0);
  });

  test('residential properties use category="residential"', () => {
    RESIDENTIAL_PROPERTIES.forEach(p => {
      expect(p.category).toBe('residential');
    });
  });

  test('commercial properties use category="commercial"', () => {
    COMMERCIAL_PROPERTIES.forEach(p => {
      expect(p.category).toBe('commercial');
    });
  });

  test('every property has id, name, price > 0', () => {
    [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES].forEach(p => {
      expect(typeof p.id).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
    });
  });

  test('rental income field is rental_income (not rent_income)', () => {
    const withRental = [...RESIDENTIAL_PROPERTIES, ...COMMERCIAL_PROPERTIES].filter(
      p => p.rental_income !== undefined
    );
    // At least some properties should have rental income
    expect(withRental.length).toBeGreaterThan(0);
    withRental.forEach(p => {
      expect(p.rent_income).toBeUndefined();
      expect(typeof p.rental_income).toBe('number');
    });
  });
});

// ── Insurance ─────────────────────────────────────────────────────────────────
describe('INSURANCE_PLANS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(INSURANCE_PLANS)).toBe(true);
    expect(INSURANCE_PLANS.length).toBeGreaterThan(0);
  });

  test('every plan has id, name, and a cost field (premium or premium_rate)', () => {
    INSURANCE_PLANS.forEach(plan => {
      expect(typeof plan.id).toBe('string');
      expect(typeof plan.name).toBe('string');
      // Some plans use a fixed premium; one uses premium_rate (percentage of income)
      const hasCost = typeof plan.premium === 'number' || typeof plan.premium_rate === 'number';
      expect(hasCost).toBe(true);
    });
  });
});

// ── Loans ─────────────────────────────────────────────────────────────────────
describe('LOAN_TYPES data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(LOAN_TYPES)).toBe(true);
    expect(LOAN_TYPES.length).toBeGreaterThan(0);
  });

  test('every loan type has id, name, and base_interest', () => {
    LOAN_TYPES.forEach(loan => {
      expect(typeof loan.id).toBe('string');
      expect(typeof loan.name).toBe('string');
      expect(typeof loan.base_interest).toBe('number');
      expect(loan.base_interest).toBeGreaterThan(0);
    });
  });
});

// ── Crisis Events ─────────────────────────────────────────────────────────────
describe('CRISIS_EVENTS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(CRISIS_EVENTS)).toBe(true);
    expect(CRISIS_EVENTS.length).toBeGreaterThan(0);
  });

  test('every event has id, name, and getMessage function', () => {
    CRISIS_EVENTS.forEach(ev => {
      expect(typeof ev.id).toBe('string');
      expect(typeof ev.name).toBe('string');
      expect(typeof ev.getMessage).toBe('function');
    });
  });
});

// ── Achievements ──────────────────────────────────────────────────────────────
describe('ACHIEVEMENTS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  test('every achievement has id, name, and a check function', () => {
    ACHIEVEMENTS.forEach(ach => {
      expect(typeof ach.id).toBe('string');
      expect(typeof ach.name).toBe('string');
      expect(typeof ach.check).toBe('function');
    });
  });

  test('no duplicate achievement ids', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── Grocery Items ─────────────────────────────────────────────────────────────
describe('GROCERY_ITEMS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(GROCERY_ITEMS)).toBe(true);
    expect(GROCERY_ITEMS.length).toBeGreaterThan(0);
  });

  test('every item has id, name, price, and healthRestore', () => {
    GROCERY_ITEMS.forEach(item => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.name).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(typeof item.healthRestore).toBe('number');
    });
  });
});

// ── Gold ─────────────────────────────────────────────────────────────────────
describe('GOLD_ASSETS data', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(GOLD_ASSETS)).toBe(true);
    expect(GOLD_ASSETS.length).toBeGreaterThan(0);
  });
});
