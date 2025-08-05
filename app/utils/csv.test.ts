import { parseUsageCsv, UsageRow } from './csv';
import * as fs from 'fs';
import * as path from 'path';

describe('parseUsageCsv', () => {
    it('parses a simple CSV string', () => {
        const csv = `2024-01-01T00:00;1.23
2024-01-01T01:00;2,34
2024-01-01T02:00;`;
        const result = parseUsageCsv(csv);
        expect(result).toEqual([
            { datetime: '2024-01-01T00:00', usage: 1.23 },
            { datetime: '2024-01-01T01:00', usage: 2.34 },
            { datetime: '2024-01-01T02:00', usage: 0 },
        ]);
    });

    it('skips empty lines', () => {
        const csv = `2024-01-01T00:00;1.23

2024-01-01T01:00;2.34
`;
        const result = parseUsageCsv(csv);
        expect(result.length).toBe(2);
    });

    it('handles invalid lines gracefully', () => {
        const csv = `2024-01-01T00:00;1.23
invalid line
2024-01-01T01:00;2.34`;
        const result = parseUsageCsv(csv);
        expect(result).toEqual([
            { datetime: '2024-01-01T00:00', usage: 1.23 },
            { datetime: '2024-01-01T01:00', usage: 2.34 },
        ]);
    });

    it('loads and parses a CSV file from fixture/', () => {
        const fixturePath = path.join(__dirname, './fixture/sample-jan-2025.csv');
        const csv = fs.readFileSync(fixturePath, 'utf8');
        const result = parseUsageCsv(csv);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toEqual(744);
        expect(result[0]).toHaveProperty('datetime');
        expect(result[0]).toHaveProperty('usage');
    });
});