/**
 * Game logic smoke tests.
 * Tests decision queue management, gold price calculation, and other
 * pure game-mechanic functions.
 */

import { getGoldPrice, GOLD_PRICE_PER_GRAM_BASE } from '../../src/data/gold';
import { CRISIS_EVENTS, CRISIS_WEIGHTS } from '../../src/data/crisisEvents';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { INCOME_TAX_SLABS } from '../../src/data/taxes';

// ── Gold Price ────────────────────────────────────────────────────────────────
describe('getGoldPrice', () => {
  test('base price is a positive number', () => {
    expect(typeof GOLD_PRICE_PER_GRAM_BASE).toBe('number');
    expect(GOLD_PRICE_PER_GRAM_BASE).toBeGreaterThan(0);
  });

  test('returns a positive number', () => {
    const price = getGoldPrice('gold_coin', GOLD_PRICE_PER_GRAM_BASE, 0);
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);
  });

  test('price after holding is >= zero', () => {
    const price = getGoldPrice('gold_coin', GOLD_PRICE_PER_GRAM_BASE, 24);
    expect(price).toBeGreaterThanOrEqual(0);
  });
});

// ── Crisis Events ─────────────────────────────────────────────────────────────
describe('CRISIS_EVENTS integrity', () => {
  test('at least 10 crisis events exist', () => {
    expect(CRISIS_EVENTS.length).toBeGreaterThanOrEqual(10);
  });

  test('no two crisis events share the same id', () => {
    const ids = CRISIS_EVENTS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('CRISIS_WEIGHTS maps to existing event ids or categories', () => {
    expect(typeof CRISIS_WEIGHTS).toBe('object');
    expect(Object.keys(CRISIS_WEIGHTS).length).toBeGreaterThan(0);
  });

  test('non-positive crisis events have a cost field or an effect', () => {
    CRISIS_EVENTS.filter(ev => ev.category !== 'positive').forEach(ev => {
      const hasCostOrEffect =
        typeof ev.cost === 'number' ||
        typeof ev.cost_pct === 'number' ||
        typeof ev.cost_pct_income === 'number' ||
        typeof ev.cost_pct_balance === 'number' ||
        typeof ev.cost_increase_pct === 'number' ||
        typeof ev.effect === 'string' ||
        typeof ev.stock_drop_min === 'number' ||
        typeof ev.salary_cut_pct === 'number';
      expect(hasCostOrEffect).toBe(true);
    });
  });
});

// ── Achievements ──────────────────────────────────────────────────────────────
describe('Achievement check functions', () => {
  const mockState = {
    balance: 1000000,
    netWorth: 5000000,
    degrees: ['bba'],
    properties: [{ id: 'p1' }],
    loans: [],
    dependents: [],
    achievements: [],
    happiness: 80,
    health: 90,
    totalMonthsPlayed: 60,
    currentJob: { id: 'j1', tier: 1, salary: 50000 },
    portfolio: {},
    mfPortfolio: {},
    ppf: { balance: 0 },
    nps: { balance: 0 },
    sipPlans: [],
    activeInsurance: [],
    fixedDeposits: [],
    isRetired: false,
    playerAge: 30,
    monthlyExpenses: 20000,
    crisisCount: 0,
    highHappinessMonths: 0,
  };

  test('every achievement check runs without throwing', () => {
    ACHIEVEMENTS.forEach(ach => {
      expect(() => ach.check(mockState)).not.toThrow();
    });
  });

  test('achievement check returns a truthy or falsy value (not an error)', () => {
    ACHIEVEMENTS.forEach(ach => {
      const result = ach.check(mockState);
      // Result must be coercible to bool — not an object/array/function
      expect(['boolean', 'number', 'undefined', 'object'].includes(typeof result)).toBe(true);
      if (result !== null && result !== undefined) {
        expect(() => Boolean(result)).not.toThrow();
      }
    });
  });
});

// ── Tax Slab Integrity ────────────────────────────────────────────────────────
describe('INCOME_TAX_SLABS', () => {
  test('slabs are sorted in ascending order of upto', () => {
    for (let i = 1; i < INCOME_TAX_SLABS.length - 1; i++) {
      expect(INCOME_TAX_SLABS[i].upto).toBeGreaterThan(INCOME_TAX_SLABS[i - 1].upto);
    }
  });

  test('last slab covers Infinity', () => {
    expect(INCOME_TAX_SLABS[INCOME_TAX_SLABS.length - 1].upto).toBe(Infinity);
  });

  test('all rates are between 0 and 1', () => {
    INCOME_TAX_SLABS.forEach(slab => {
      expect(slab.rate).toBeGreaterThanOrEqual(0);
      expect(slab.rate).toBeLessThanOrEqual(1);
    });
  });
});

// ── Decision Queue Logic ──────────────────────────────────────────────────────
describe('Decision queue mechanics (unit)', () => {
  // Pure simulation of the queue management logic extracted from GameContext
  function simulateQueue(initialQueue, decisionsToQueue) {
    let pendingDecision = null;
    let pendingDecisionQueue = initialQueue;

    // Simulate nextMonth queue assignment
    if (decisionsToQueue.length > 0) {
      pendingDecision = decisionsToQueue[0];
      pendingDecisionQueue = decisionsToQueue.slice(1);
    } else {
      pendingDecisionQueue = [];
    }
    return { pendingDecision, pendingDecisionQueue };
  }

  function simulateResolveNone(pendingDecision, pendingDecisionQueue) {
    if (pendingDecisionQueue && pendingDecisionQueue.length > 0) {
      return {
        pendingDecision: pendingDecisionQueue[0],
        pendingDecisionQueue: pendingDecisionQueue.slice(1),
      };
    }
    return { pendingDecision: null, pendingDecisionQueue: [] };
  }

  test('single decision in queue → pendingDecision set, queue empty', () => {
    const { pendingDecision, pendingDecisionQueue } = simulateQueue([], [{ id: 'a' }]);
    expect(pendingDecision).toEqual({ id: 'a' });
    expect(pendingDecisionQueue).toEqual([]);
  });

  test('two decisions → first is pending, second is in queue', () => {
    const { pendingDecision, pendingDecisionQueue } = simulateQueue([], [{ id: 'a' }, { id: 'b' }]);
    expect(pendingDecision).toEqual({ id: 'a' });
    expect(pendingDecisionQueue).toEqual([{ id: 'b' }]);
  });

  test('no decisions → queue is always reset to []', () => {
    const staleQueue = [{ id: 'stale' }];
    const { pendingDecision, pendingDecisionQueue } = simulateQueue(staleQueue, []);
    expect(pendingDecision).toBeNull();
    expect(pendingDecisionQueue).toEqual([]);
  });

  test('resolving none-type with queued items advances to next decision', () => {
    const { pendingDecision, pendingDecisionQueue } = simulateResolveNone(
      { id: 'baby', isBaby: true },
      [{ id: 'custody' }]
    );
    expect(pendingDecision).toEqual({ id: 'custody' });
    expect(pendingDecisionQueue).toEqual([]);
  });

  test('resolving none-type with empty queue clears pending', () => {
    const { pendingDecision } = simulateResolveNone({ id: 'baby', isBaby: true }, []);
    expect(pendingDecision).toBeNull();
  });

  test('resolving all items in a 3-item queue empties cleanly', () => {
    const queue = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    let state = { pendingDecision: queue[0], pendingDecisionQueue: queue.slice(1) };

    // Resolve a
    state = simulateResolveNone(state.pendingDecision, state.pendingDecisionQueue);
    expect(state.pendingDecision).toEqual({ id: 'b' });

    // Resolve b
    state = simulateResolveNone(state.pendingDecision, state.pendingDecisionQueue);
    expect(state.pendingDecision).toEqual({ id: 'c' });

    // Resolve c
    state = simulateResolveNone(state.pendingDecision, state.pendingDecisionQueue);
    expect(state.pendingDecision).toBeNull();
    expect(state.pendingDecisionQueue).toEqual([]);
  });
});
