import React from "react";
import { PriceModel, PowerTariff } from "../models";

interface CostBreakdownProps {
  model: PriceModel;
  totalUsage: number; // in kWh
  topHours: Record<string, number>; // { [tariff name]: average power of N top hours, kW }
}

export default function CostBreakdown({
  model,
  totalUsage,
  topHours,
}: CostBreakdownProps) {
  // VAT factor
  const vatFactor = model.pricesIncludeVat ? 1 : 1 / (1 + model.vatRate);
  // Fixed fee
  const fixedFee = model.fixedFeePerMonth * vatFactor;

  // Usage fee
  const usageFee = totalUsage * model.usageFeePerKWh * vatFactor;

  // Power tariffs
  const powerTariffRows = model.powerTariffs.map((tariff) => {
    const avgTop = topHours[tariff.name] || 0;
    const tariffFee = avgTop * tariff.feePerKW * vatFactor;
    return {
      name: tariff.name,
      avgTop,
      fee: tariffFee,
      feePerKW: tariff.feePerKW,
      n: tariff.numberOfTopPeaksToAverage,
    };
  });

  // Electricity tax
  const usageTax = totalUsage * model.usageTaxPerKWh * vatFactor;

  // Subtotal before VAT
  const subtotal =
    fixedFee +
    usageFee +
    powerTariffRows.reduce((sum, row) => sum + row.fee, 0) +
    usageTax;

  // VAT
  const vat = subtotal * model.vatRate;

  // Total
  const total = subtotal + vat;

  return (
    <div className="mt-8 p-4 bg-gray-900 rounded shadow text-white">
      <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
      <div className="mb-2">
        Fixed fee:{" "}
        <span className="float-right">
          {fixedFee.toFixed(2)} {model.currency}
        </span>
      </div>
      <div className="mb-2">
        Usage fee ({totalUsage.toFixed(2)} kWh × {model.usageFeePerKWh} {model.currency}
        /kWh):{" "}
        <span className="float-right">
          {usageFee.toFixed(2)} {model.currency}
        </span>
      </div>
      {powerTariffRows.map((row) => (
        <div className="mb-2" key={row.name}>
          {row.name} ({row.avgTop} kW × {row.feePerKW} {model.currency}/kW):{" "}
          <span className="float-right">
            {row.fee.toFixed(2)} {model.currency}
          </span>
        </div>
      ))}
      <div className="mb-2">
        Electricity tax ({totalUsage.toFixed(2)} kWh × {model.usageTaxPerKWh}{" "}
        {model.currency}/kWh):{" "}
        <span className="float-right">
          {usageTax.toFixed(2)} {model.currency}
        </span>
      </div>
      <div className="mb-2">
        VAT ({(model.vatRate * 100).toFixed(1)}%):{" "}
        <span className="float-right">
          {vat.toFixed(2)} {model.currency}
        </span>
      </div>
      <div className="mt-4 font-bold text-lg">
        Total:{" "}
        <span className="float-right">
          {total.toFixed(2)} {model.currency}
        </span>
      </div>
    </div>
  );
}
