import exp from "constants";

// power-bill-app/src/models.ts
export interface PriceModel {
  name: string;
  currency: string;
  vatRate: number;
  pricesIncludeVat: boolean;
  fixedFeePerMonth: number;
  usageFees: UsageFee[];
  powerTariffs: PowerTariff[];
  url?: string;
}

export interface UsageFee {
  name: string;
  feePerKWh: number;
  timeLimits?: TimeLimits;
}

export interface PowerTariff {
  name: string;
  feePerKW: number;
  numberOfTopPeaksToAverage: number;
  timeLimits?: TimeLimits;
  reduction?: PowerTariffReduction;
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

export interface TimeLimits {
  startTime: string;
  endTime: string;
  months: number[];
}

export interface PowerTariffReduction {
  startTime: string;
  endTime: string;
  factor: number;
}
