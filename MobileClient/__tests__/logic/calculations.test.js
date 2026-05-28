/**
 * Core calculation smoke tests.
 * These are pure functions with no React/RN deps — fast and reliable.
 */

import { calculateIncomeTax, INCOME_TAX_SLABS } from '../../src/data/taxes';
import { calculateEMI, getAdjustedRate } from '../../src/data/loans';

// ── Income Tax ────────────────────────────────────────────────────────────────
describe('calculateIncomeTax', () => {
  test('zero income → zero tax', () => {
    expect(calculateIncomeTax(0)).toBe(0);
  });

  test('income within 0% slab → zero tax', () => {
    expect(calculateIncomeTax(200000)).toBe(0);
    expect(calculateIncomeTax(300000)).toBe(0);
  });

  test('5% slab (3L–7L) is applied correctly', () => {
    // 400000 - 300000 = 100000 taxable at 5% = 5000
    expect(calculateIncomeTax(400000)).toBe(5000);
  });

  test('10% slab (7L–10L) is applied correctly', () => {
    // 3L–7L: 400000 * 5% = 20000; 7L–8L: 100000 * 10% = 10000; total = 30000
    expect(calculateIncomeTax(800000)).toBe(30000);
  });

  test('30% bracket kicks in above 15L', () => {
    const tax = calculateIncomeTax(2000000); // 20L
    // Should be substantially non-zero and above the 15L baseline
    expect(tax).toBeGreaterThan(0);
    const taxAt15L = calculateIncomeTax(1500000);
    expect(tax).toBeGreaterThan(taxAt15L);
  });

  test('returns an integer (Math.round applied)', () => {
    const result = calculateIncomeTax(550000);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('tax is monotonically increasing with income', () => {
    const incomes = [0, 100000, 300000, 500000, 800000, 1200000, 2000000];
    for (let i = 1; i < incomes.length; i++) {
      expect(calculateIncomeTax(incomes[i])).toBeGreaterThanOrEqual(
        calculateIncomeTax(incomes[i - 1])
      );
    }
  });
});

// ── EMI Calculation ───────────────────────────────────────────────────────────
describe('calculateEMI', () => {
  test('zero interest rate → principal divided by tenure', () => {
    expect(calculateEMI(120000, 0, 12)).toBe(10000);
  });

  test('standard home loan EMI is in a reasonable range', () => {
    // 50L loan, 8.5% annual, 240 months
    const emi = calculateEMI(5000000, 8.5, 240);
    expect(emi).toBeGreaterThan(30000);
    expect(emi).toBeLessThan(60000);
  });

  test('higher principal → higher EMI', () => {
    const low = calculateEMI(1000000, 10, 60);
    const high = calculateEMI(2000000, 10, 60);
    expect(high).toBeGreaterThan(low);
  });

  test('longer tenure → lower EMI', () => {
    const short = calculateEMI(1000000, 10, 60);
    const long  = calculateEMI(1000000, 10, 120);
    expect(long).toBeLessThan(short);
  });

  test('higher interest rate → higher EMI', () => {
    const low  = calculateEMI(1000000, 8, 60);
    const high = calculateEMI(1000000, 14, 60);
    expect(high).toBeGreaterThan(low);
  });

  test('returns an integer', () => {
    expect(Number.isInteger(calculateEMI(500000, 12, 36))).toBe(true);
  });
});

// ── Credit Score Rate Adjustment ──────────────────────────────────────────────
describe('getAdjustedRate', () => {
  const BASE = 10;

  test('800+ credit score → 1% discount', () => {
    expect(getAdjustedRate(BASE, 800)).toBe(9);
    expect(getAdjustedRate(BASE, 850)).toBe(9);
  });

  test('750–799 → 0.5% discount', () => {
    expect(getAdjustedRate(BASE, 750)).toBe(9.5);
    expect(getAdjustedRate(BASE, 780)).toBe(9.5);
  });

  test('700–749 → no adjustment', () => {
    expect(getAdjustedRate(BASE, 700)).toBe(10);
    expect(getAdjustedRate(BASE, 730)).toBe(10);
  });

  test('650–699 → +0.5% penalty', () => {
    expect(getAdjustedRate(BASE, 650)).toBe(10.5);
  });

  test('600–649 → +1.5% penalty', () => {
    expect(getAdjustedRate(BASE, 600)).toBe(11.5);
  });

  test('below 600 → +3% penalty', () => {
    expect(getAdjustedRate(BASE, 550)).toBe(13);
    expect(getAdjustedRate(BASE, 400)).toBe(13);
  });

  test('better score always gives equal or lower rate', () => {
    const scores = [400, 550, 600, 650, 700, 750, 800];
    for (let i = 1; i < scores.length; i++) {
      expect(getAdjustedRate(BASE, scores[i])).toBeLessThanOrEqual(
        getAdjustedRate(BASE, scores[i - 1])
      );
    }
  });
});
