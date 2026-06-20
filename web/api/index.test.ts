import { describe, it, expect } from 'vitest';
import { generateMockHistory } from './index.js';
import type { HistoryItem } from './index.js';

describe('generateMockHistory', () => {
    it('should generate an array of 25 history items', () => {
        const history = generateMockHistory();
        expect(history).toBeInstanceOf(Array);
        expect(history.length).toBe(25);
    });

    it('should have the correct properties on each item with valid data types', () => {
        const history = generateMockHistory();

        history.forEach((item: HistoryItem) => {
            expect(item).toHaveProperty('timestamp');
            expect(typeof item.timestamp).toBe('string');
            expect(!isNaN(Date.parse(item.timestamp))).toBe(true);

            const numericProperties = [
                'usd_oficial', 'usd_blue', 'usd_mep', 'usd_ccl', 'usd_cripto', 'usd_tarjeta',
                'ves_oficial', 'ves_paralelo', 'ves_eur_oficial', 'ves_eur_paralelo',
                'uyu_venta', 'clp_venta', 'brl_venta', 'eur_venta',
                'uyu_ar', 'clp_ar', 'brl_ar', 'btc_usd'
            ];

            numericProperties.forEach(prop => {
                expect(item).toHaveProperty(prop);
                expect(typeof (item as any)[prop]).toBe('number');
                expect((item as any)[prop]).toBeGreaterThan(0); // All values generated are > 0
            });
        });
    });

    it('should generate timestamps in descending order (newest last) with 1 hour intervals', () => {
        const history = generateMockHistory();

        for (let i = 0; i < history.length - 1; i++) {
            const currentItem = history[i];
            const nextItem = history[i+1];
            if (!currentItem || !nextItem) continue;
            const currentItemTime = new Date(currentItem.timestamp).getTime();
            const nextItemTime = new Date(nextItem.timestamp).getTime();

            // Next item should be 1 hour newer than current item
            expect(nextItemTime - currentItemTime).toBe(60 * 60 * 1000);
        }
    });

    it('should generate deterministic relations between values', () => {
        const history = generateMockHistory();

        history.forEach((item: HistoryItem) => {
            // Check the deterministic relations defined in generateMockHistory
            expect(item.usd_blue).toBeGreaterThan(item.usd_oficial);
            expect(item.usd_mep).toBeGreaterThan(item.usd_blue);
            expect(item.usd_ccl).toBeGreaterThan(item.usd_mep);
            expect(item.usd_tarjeta).toBeGreaterThan(item.usd_ccl);
            expect(item.usd_cripto).toBeGreaterThan(item.usd_tarjeta);

            expect(item.ves_paralelo).toBeGreaterThan(item.ves_oficial);
            expect(item.ves_eur_oficial).toBeGreaterThan(item.ves_paralelo);
            expect(item.ves_eur_paralelo).toBeGreaterThan(item.ves_eur_oficial);
        });
    });
});
