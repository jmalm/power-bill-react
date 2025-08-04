// app/components/PriceModelSelector.tsx
"use client";

import React from 'react';
import { PriceModel } from '../models';

interface PriceModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  priceModels: PriceModel[];
}

export default function PriceModelSelector({
  selectedModel,
  onModelChange,
  priceModels,
}: PriceModelSelectorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="price-model-select" className="block text-sm font-medium text-gray-200 mb-2">
        Select Price Model
      </label>
      <select
        id="price-model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="block w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
      >
        {priceModels.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}