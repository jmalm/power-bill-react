import { PriceModel, PowerTariff } from "../models";

export function mapPriceModel(json: any): PriceModel {
  return {
    name: json.name,
    currency: json.currency,
    vatRate: json.vat_rate,
    pricesIncludeVat: json.prices_include_tax,
    fixedFeePerMonth: json.fixed_fee_per_month,
    usageFeePerKWh: json.usage_fee_per_kwh,
    usageTaxPerKWh: json.usage_tax_per_kwh,
    powerTariffs: json.power_tariffs?.map(mapPowerTariff) || [],
  };
}

function mapPowerTariff(json: any): PowerTariff {
  return {
    name: json.name,
    feePerKW: json.fee_per_kw,
    numberOfTopPeaksToAverage: json.number_of_top_peaks_to_average,
    months: json.months,
    startTime: json.start_time,
    endTime: json.end_time,
  };
}

export async function loadPriceModels(): Promise<PriceModel[]> {
  const indexRes = await fetch("/price-models/models-index.json");
  const indexData = await indexRes.json();
  const files: string[] = indexData.models;

  const models = await Promise.all(
    files.map(async (file) => {
      const res = await fetch(`/price-models/${file}`);
      const json = await res.json();
      return mapPriceModel(json);
    })
  );
  return models;
}
