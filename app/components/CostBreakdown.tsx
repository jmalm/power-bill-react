import React from "react";
import { PriceModel, PowerTariff } from "../models";

interface CostBreakdownProps {
  model: PriceModel;
  totalUsagePerFee: Record<string, number>; // { [fee name]: total usage, kWh }
  topHoursPerTariff: Record<string, number>; // { [tariff name]: average power of N top hours, kW }
}

export default function CostBreakdown({
  model,
  totalUsagePerFee,
  topHoursPerTariff,
}: CostBreakdownProps) {
  // VAT factor
  const vatFactor = model.pricesIncludeVat ? 1 / (1 + model.vatRate) : 1;
  // Fixed fee
  const fixedFee = model.fixedFeePerMonth * vatFactor;

  // Usage fees
  const usageFeeRows = model.usageFees.map((fee) => {
    const feePerKW = fee.feePerKW * vatFactor;
    const totalUsage = totalUsagePerFee[fee.name] || 0;
    const usageFee = totalUsage * feePerKW;
    return {
      name: fee.name,
      fee: usageFee,
      feePerKW,
      totalUsage,
      timeLimits: fee.timeLimits,
    };
  });

  // Power tariffs
  const powerTariffRows = model.powerTariffs.map((tariff) => {
    const avgTop = topHoursPerTariff[tariff.name] || 0;
    const tariffFee = avgTop * tariff.feePerKW * vatFactor;
    return {
      name: tariff.name,
      avgTop,
      fee: tariffFee,
      feePerKW: tariff.feePerKW,
      n: tariff.numberOfTopPeaksToAverage,
    };
  });

  // Subtotal before VAT
  const subtotal =
    fixedFee +
    usageFeeRows.reduce((sum, row) => sum + row.fee, 0) +
    powerTariffRows.reduce((sum, row) => sum + row.fee, 0);

  // VAT
  const vat = subtotal * model.vatRate;

  // Total
  const total = subtotal + vat;

  return (
    <div className="w-full text-gray-900">
      <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
      <table className="w-full text-left table-auto">
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-1">Fixed fee</td>
            <td className="py-1 text-right">
              {fixedFee.toFixed(2)}&nbsp;{model.currency}
            </td>
          </tr>
          {usageFeeRows.map((row) => row.totalUsage > 0 && (
            <tr className="border-b border-gray-200" key={row.name}>
              <td className="py-1">
                {row.name} ({row.totalUsage.toFixed(2)}&nbsp;kWh ×{" "}
                {row.feePerKW.toFixed(2)}&nbsp;{model.currency}&nbsp;/&nbsp;kWh)
              </td>
              <td className="py-1 text-right">
                {row.fee.toFixed(2)}&nbsp;{model.currency}
              </td>
            </tr>
          ))}
          {powerTariffRows.map((row) => row.avgTop > 0 && (
            <tr className="border-b border-gray-200" key={row.name}>
              <td className="py-1">
                {row.name} ({row.avgTop.toFixed(2)}&nbsp;kW ×{" "}
                {(row.feePerKW * vatFactor).toFixed(2)}&nbsp;{model.currency}
                &nbsp;/&nbsp;kW)
              </td>
              <td className="py-1 text-right">
                {row.fee.toFixed(2)}&nbsp;{model.currency}
              </td>
            </tr>
          ))}
          <tr className="border-b border-gray-200">
            <td className="py-1">VAT ({(model.vatRate * 100).toFixed(1)}%)</td>
            <td className="py-1 text-right">
              {vat.toFixed(2)}&nbsp;{model.currency}
            </td>
          </tr>
          <tr className="font-bold text-lg">
            <td className="py-2">Total</td>
            <td className="py-2 text-right">
              {total.toFixed(2)}&nbsp;{model.currency}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
