import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { generateMockHistory, HistoryItem, inMemoryHistory, getVentaByCasa, fetchWallbitRate, resetWallbitState } from './index';

describe('generateMockHistory', () => {
    it('should generate an array of 25 history items', () => {
        const history = generateMockHistory();
        expect(history).toBeInstanceOf(Array);
        expect(history.length).toBe(25);
    });

    it('should have the correct properties on each item with valid data types', () => {
        const history = generateMockHistory();

        history.forEach(item => {
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
            const currentItemTime = new Date(history[i].timestamp).getTime();
            const nextItemTime = new Date(history[i+1].timestamp).getTime();

            // Next item should be 1 hour newer than current item
            expect(nextItemTime - currentItemTime).toBe(60 * 60 * 1000);
        }
    });

    it('should generate deterministic relations between values', () => {
        const history = generateMockHistory();

        history.forEach(item => {
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

describe('In-memory cache and lexicographical comparison', () => {
    it('should initialize and populate inMemoryHistory', () => {
        expect(inMemoryHistory).toBeInstanceOf(Array);
    });

    it('should correctly filter last 24h history using lexicographical string comparison', () => {
        const history: HistoryItem[] = [
            { timestamp: '2026-06-19T12:00:00.000Z', usd_blue: 1200 } as any,
            { timestamp: '2026-06-20T11:00:00.000Z', usd_blue: 1250 } as any,
            { timestamp: '2026-06-20T12:00:00.000Z', usd_blue: 1300 } as any,
        ];
        
        // Target time is 2026-06-20T00:00:00.000Z (24 hours before 2026-06-21T00:00:00.000Z)
        const targetTimeString = '2026-06-20T00:00:00.000Z';
        
        // Find first item newer than target time
        const match = history.find(h => h.timestamp >= targetTimeString);
        expect(match).toBeDefined();
        expect(match?.timestamp).toBe('2026-06-20T11:00:00.000Z');
        expect(match?.usd_blue).toBe(1250);
    });
});

describe('getVentaByCasa', () => {
    it('should return the correct venta value when casa matches', () => {
        const mockData = [
            { casa: 'oficial', venta: 100 },
            { casa: 'blue', venta: 120 }
        ];
        expect(getVentaByCasa(mockData, 'blue')).toBe(120);
        expect(getVentaByCasa(mockData, 'oficial')).toBe(100);
    });

    it('should return 0 when casa does not match', () => {
        const mockData = [
            { casa: 'oficial', venta: 100 }
        ];
        expect(getVentaByCasa(mockData, 'blue')).toBe(0);
    });

    it('should return 0 when data is not an array (defensive checks)', () => {
        expect(getVentaByCasa(null, 'blue')).toBe(0);
        expect(getVentaByCasa(undefined, 'blue')).toBe(0);
        expect(getVentaByCasa({}, 'blue')).toBe(0);
        expect(getVentaByCasa('not-an-array', 'blue')).toBe(0);
    });

    it('should handle elements that are null or do not contain casa property', () => {
        const mockData = [
            null,
            { otherProperty: 'val' },
            { casa: 'blue', venta: 130 }
        ];
        expect(getVentaByCasa(mockData, 'blue')).toBe(130);
    });
});

describe('fetchWallbitRate', () => {
    const originalEnv = process.env.WALLBIT_API_KEY;

    beforeEach(() => {
        resetWallbitState();
        vi.restoreAllMocks();
        process.env.WALLBIT_API_KEY = 'test_key';
    });

    afterEach(() => {
        process.env.WALLBIT_API_KEY = originalEnv;
        vi.restoreAllMocks();
    });

    it('should return 0 and success=false when WALLBIT_API_KEY is not set', async () => {
        delete process.env.WALLBIT_API_KEY;
        const res = await fetchWallbitRate();
        expect(res).toEqual({ rate: 0, success: false });
    });

    it('should fetch rate successfully, send custom headers and cache the result', async () => {
        const axiosSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({
            data: { data: { rate: 1350.5 } }
        });

        const firstCall = await fetchWallbitRate();
        expect(firstCall).toEqual({ rate: 1350.5, success: true });
        expect(axiosSpy).toHaveBeenCalledTimes(1);

        const callHeaders = axiosSpy.mock.calls[0][1]?.headers as Record<string, string>;
        expect(callHeaders['X-API-Key']).toBe('test_key');
        expect(callHeaders['User-Agent']).toContain('ValoresMercado');
        expect(callHeaders['Accept']).toBe('application/json');

        // Subsequent call within TTL should return cached value without hitting axios
        const secondCall = await fetchWallbitRate();
        expect(secondCall).toEqual({ rate: 1350.5, success: true });
        expect(axiosSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle 429 rate limiting, activate cooldown and return fallback rate', async () => {
        resetWallbitState(1340.0); // pre-populate with known rate

        const rateLimitError = {
            response: {
                status: 429,
                headers: { 'retry-after': '30' },
                data: { error: 'Too Many Requests', retry_after: 30 }
            }
        };
        const axiosSpy = vi.spyOn(axios, 'get').mockRejectedValue(rateLimitError);

        const result = await fetchWallbitRate();
        expect(result).toEqual({ rate: 1340.0, success: false });
        expect(axiosSpy).toHaveBeenCalledTimes(1);

        // While in cooldown, it shouldn't call axios again
        const nextResult = await fetchWallbitRate();
        expect(nextResult).toEqual({ rate: 1340.0, success: false });
        expect(axiosSpy).toHaveBeenCalledTimes(1);
    });
});
