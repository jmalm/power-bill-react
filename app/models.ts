import exp from "constants";

// power-bill-app/src/models.ts
export interface PriceModel {
  name: string;
  currency: string;
  vatRate: number;
  pricesIncludeVat: boolean;
  fixedFeePerMonth: number;
  usageFeePerKWh: number;
  usageTaxPerKWh: number;
  powerTariffs: PowerTariff[];
}

export interface PowerTariff {
  name: string;
  feePerKW: number;
  numberOfTopPeaksToAverage: number;
  months: number[];
  startTime: string;
  endTime: string;
  nightReduction?: NightReduction;
}

export enum Month {
  January = 0,
  February = 1,
  March = 2,
  April = 3,
  May = 4,
  June = 5,
  July = 6,
  August = 7,
  September = 8,
  October = 9,
  November = 10,
  December = 11,
}

export interface NightReduction {
  startTime: string;
  endTime: string;
  factor: number;
}
