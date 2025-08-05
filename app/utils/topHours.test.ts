import { calculateTopHoursPerTariff } from "./topHours";
import { PriceModel } from "../models";
import { parseUsageCsv, UsageRow } from "./csv";
import { mapPriceModel } from "./priceModelLoader";
import path from "path";
import fs from 'fs';

describe("calculateTopHoursPerTariff", () => {
  it("calculates correct top hours for a simple case", () => {
    const model: PriceModel = {
      name: "Test",
      currency: "SEK",
      vatRate: 0.25,
      pricesIncludeVat: true,
      fixedFeePerMonth: 100,
      usageFeePerKWh: 1,
      usageTaxPerKWh: 0.5,
      powerTariffs: [
        {
          name: "TestTariff",
          feePerKW: 10,
          numberOfTopPeaksToAverage: 2,
          months: [],
          startTime: "00:00",
          endTime: "24:00",
        },
      ],
    };
    const usage: UsageRow[] = [
      { datetime: "2024-01-01T00:00", usage: 2 },
      { datetime: "2024-01-01T01:00", usage: 5 },
      { datetime: "2024-01-02T00:00", usage: 3 },
      { datetime: "2024-01-02T01:00", usage: 7 },
    ];
    const result = calculateTopHoursPerTariff(usage, model);
    expect(result["TestTariff"]).toBe((5 + 7) / 2);
  });

  it("calculates correct top hours for real-world sample data", async () => {
    // Load Jönköping Energi, 20 A price model from public/price-models/jönköping-energi-20-a.json
    const res = fs.readFileSync(`./public/price-models/jönköping-energi-20-a.json`, 'utf8');
    const json = JSON.parse(res);
    const model = mapPriceModel(json);

    // Read sample usage data from fixture/sample-jan-2025.csv
    const fixturePath = path.join(__dirname, './fixture/sample-jan-2025.csv');
    const csv = fs.readFileSync(fixturePath, 'utf8');
    const usage = parseUsageCsv(csv);
    const result = calculateTopHoursPerTariff(usage, model);
    expect(result["Baslast"]).toBe((7.86 + 7.36) / 2);
    expect(result["Höglast"]).toBe((7.36 + 7.05) / 2);
  });
});