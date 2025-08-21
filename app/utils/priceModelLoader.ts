import {
  PriceModel,
  PowerTariff,
  TimeLimits,
  PowerTariffReduction,
  UsageFee,
} from "../models";

export function mapPriceModel(json: any): PriceModel {
  return {
    name: json.name,
    currency: json.currency,
    vatRate: json.vat_rate,
    pricesIncludeVat: json.prices_include_tax,
    fixedFeePerMonth: json.fixed_fee_per_month,
    usageFees: json.usage_fees?.map(mapUsageFee) || [],
    powerTariffs: json.power_tariffs?.map(mapPowerTariff) || [],
    url: json.url || undefined,
  };
}

function mapUsageFee(json: any): UsageFee {
  return {
    name: json.name,
    feePerKWh: json.fee_per_kw,
    timeLimits: json.time_limits ? mapTimeLimits(json.time_limits) : undefined,
  };
}

function mapPowerTariff(json: any): PowerTariff {
  return {
    name: json.name,
    feePerKW: json.fee_per_kw,
    numberOfTopPeaksToAverage: json.number_of_top_peaks_to_average,
    timeLimits: json.time_limits ? mapTimeLimits(json.time_limits) : undefined,
    reduction: json.reduction ? mapNightReduction(json.reduction) : undefined,
  };
}

function mapTimeLimits(json: any): TimeLimits {
  return {
    startTime: json.start_time,
    endTime: json.end_time,
    months: json.months,
  };
}

function mapNightReduction(json: any): PowerTariffReduction {
  return {
    startTime: json.start_time,
    endTime: json.end_time,
    factor: json.factor,
  };
}

export async function loadPriceModels(): Promise<PriceModel[]> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  // const basePath = '';
  const indexRes = await fetch(`${basePath}/price-models/models-index.json`);
  const indexData = await indexRes.json();
  const files: string[] = indexData.models;

  const models = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`${basePath}/price-models/${file}`);
      const json = await res.json();
      return mapPriceModel(json);
    })
  );
  return models;
}
