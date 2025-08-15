import React from "react";
import { PriceModel, PowerTariff, PowerTariffReduction } from "../models";
import PowerTariffEditor from "./PowerTariffEditor";
import UsageEditor from "./UsageEditor";

interface PriceModelEditorProps {
  model: PriceModel;
  onChange: (model: PriceModel) => void;
}

class PowerTariffImpl implements PowerTariff {
  constructor(
    public name: string,
    public feePerKW: number,
    public numberOfTopPeaksToAverage: number = 2,
    public months: number[] = [],
    public startTime: string = "00:00",
    public endTime: string = "23:59",
    public reduction?: PowerTariffReduction
  ) {}
}

export default function PriceModelEditor({
  model,
  onChange,
}: PriceModelEditorProps) {
  // Handle changes to top-level fields
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = value;
    if (type === "number") newValue = parseFloat(value);
    if (type === "checkbox") newValue = checked;
    onChange({ ...model, [name]: newValue });
  };

  return (
    <form className="space-y-2">

      {/* Top-level fields */}
      <div>
        <label className="block text-sm">Name</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name="name"
          value={model.name}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Currency</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name="currency"
          value={model.currency}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">VAT rate</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name="vatRate"
          type="number"
          value={model.vatRate}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="text-sm flex items-center">
          <input
            type="checkbox"
            name="pricesIncludeVat"
            checked={model.pricesIncludeVat}
            onChange={handleFieldChange}
            className="mr-2"
          />
          Prices include VAT
        </label>
      </div>
      <div>
        <label className="block text-sm">Fixed fee per month</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name="fixedFeePerMonth"
          type="number"
          value={model.fixedFeePerMonth}
          onChange={handleFieldChange}
        />
      </div>

      {/* Usage fees */}
      <h3 className="text-lg font-semibold mt-4">Usage fees</h3>
      {model.usageFees.map((usageFee, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded mt-2">
          <UsageEditor
            usageFee={usageFee}
            onChange={(fee) => {
              const newUsageFees = [...model.usageFees];
              newUsageFees[index] = fee;
              onChange({ ...model, usageFees: newUsageFees });
            }}
          />
          <button
            type="button"
            onClick={() => {
              const newFees = [...model.usageFees];
              newFees.splice(index, 1);
              onChange({ ...model, usageFees: newFees });
            }}
            className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Remove Fee
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({
            ...model,
            usageFees: [
              ...model.usageFees,
              { name: "", feePerKW: 0, timeLimits: undefined },
            ],
          })
        }
        className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
      >
        Add Usage Fee
      </button>

      {/* Power tariffs */}{" "}
      <h3 className="text-lg font-semibold mt-4">Power tariffs</h3>
      {model.powerTariffs.map((tariff, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded mt-2">
          <PowerTariffEditor
            tariff={tariff}
            onChange={(updatedTariff) => {
              const newTariffs = [...model.powerTariffs];
              newTariffs[index] = updatedTariff;
              onChange({ ...model, powerTariffs: newTariffs });
            }}
          />
          <button
            type="button"
            onClick={() => {
              const newTariffs = model.powerTariffs.filter(
                (_, i) => i !== index
              );
              onChange({ ...model, powerTariffs: newTariffs });
            }}
            className="mt-2 bg-gray-200 p-2 rounded hover:bg-red-600 hover:text-white"
          >
            Remove tariff
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const newTariffs = [
            ...model.powerTariffs,
            new PowerTariffImpl("New tariff", 0),
          ];
          onChange({ ...model, powerTariffs: newTariffs });
        }}
        className="mt-4 bg-gray-200 p-2 rounded hover:bg-green-600 hover:text-white"
      >
        New tariff
      </button>
    </form>
  );
}
