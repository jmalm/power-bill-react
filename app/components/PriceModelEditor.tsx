import React from "react";
import { PriceModel, PowerTariff, PowerTariffReduction } from "../models";
import PowerTariffEditor from "./PowerTariffEditor";

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
      <div>
        <label className="block text-sm">Name</label>
        <input
          className="block w-full p-2 border rounded"
          name="name"
          value={model.name}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Currency</label>
        <input
          className="block w-full p-2 border rounded"
          name="currency"
          value={model.currency}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Tax Rate</label>
        <input
          className="block w-full p-2 border rounded"
          name="taxRate"
          type="number"
          value={model.vatRate}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Usage Tax Per kWh</label>
        <input
          className="block w-full p-2 border rounded"
          name="usageTaxPerKWh"
          type="number"
          value={model.usageTaxPerKWh}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Prices Include Tax</label>
        <input
          type="checkbox"
          name="pricesIncludeTax"
          checked={model.pricesIncludeVat}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Fixed Fee Per Month</label>
        <input
          className="block w-full p-2 border rounded"
          name="fixedFeePerMonth"
          type="number"
          value={model.fixedFeePerMonth}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Usage Fee Per kWh</label>
        <input
          className="block w-full p-2 border rounded"
          name="usageFeePerKWh"
          type="number"
          value={model.usageFeePerKWh}
          onChange={handleFieldChange}
        />
      </div>
      {/* You can add editing for powerTariffs here */}{" "}
      <h3 className="text-lg font-semibold mt-4">Power Tariffs</h3>
      {model.powerTariffs.map((tariff, index) => (
        <div key={index} className="border p-2 rounded mt-2">
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
            className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Remove Tariff
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
        className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Add New Tariff
      </button>
    </form>
  );
}
