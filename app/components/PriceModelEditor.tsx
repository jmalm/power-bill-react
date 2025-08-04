import React from 'react';
import { PriceModel } from '../models';

interface PriceModelEditorProps {
  model: PriceModel;
  onChange: (model: PriceModel) => void;
}

export default function PriceModelEditor({ model, onChange }: PriceModelEditorProps) {
  // Handle changes to top-level fields
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = value;
    if (type === 'number') newValue = parseFloat(value);
    if (type === 'checkbox') newValue = checked;
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
      {/* You can add editing for powerTariffs here */}
    </form>
  );
}