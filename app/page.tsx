// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import PriceModelSelector from "./components/PriceModelSelector";
import PriceModelEditor from "./components/PriceModelEditor";
import { PriceModel } from "./models";
import { loadPriceModels } from "./utils/priceModelLoader";
import { downloadJson } from "./utils/downloadJson";
import CostBreakdown from "./components/CostBreakdown";
import { handleCsvUpload, UsageRow } from "./utils/csv";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("custom");
  const [priceModels, setPriceModels] = useState<PriceModel[]>([]);
  const selected =
    priceModels.find((model) => model.name === selectedModel) || null;
  const [editingModel, setEditingModel] = useState<PriceModel | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [usageData, setUsageData] = useState<UsageRow[]>([]);

  useEffect(() => {
    loadPriceModels().then((models) => {
      setPriceModels(models);
      // If the current selectedModel is not in the loaded models, select the first one
      if (models.length > 0 && !models.some((m) => m.name === selectedModel)) {
        setSelectedModel(models[0].name);
      }
    });
  }, []);
  useEffect(() => {
    setEditingModel(selected ? { ...selected } : null);
  }, [selected]);

  // Calculate total usage from the loaded data
  const totalUsage = usageData.reduce((sum, row) => sum + row.usage, 0);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Calculate Electricity Cost
        </h1>

        <PriceModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          priceModels={priceModels}
        />

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowEditor((prev) => !prev)}
        >
          {showEditor ? "Hide Details" : "Show Details"}
        </button>

        {showEditor && editingModel && (
          <>
            <PriceModelEditor
              model={editingModel}
              onChange={(model) => {
                setEditingModel(model);
                setPriceModels((prev) =>
                  prev.map((m) => (m.name === model.name ? model : m))
                );
              }}
            />
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              onClick={() =>
                downloadJson(
                  editingModel,
                  `${editingModel.name || "price-model"}.json`
                )
              }
            >
              Download as JSON
            </button>
          </>
        )}

        <div className="mt-8">
          <label className="block mb-2 font-medium">Upload usage CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => handleCsvUpload(e, setUsageData)}
            className="block"
          />
          {usageData.length > 0 && (
            <div className="mt-2 text-sm text-green-400">
              Loaded {usageData.length} usage rows. Total: {totalUsage.toFixed(2)} kWh
            </div>
          )}
        </div>

        {selected && (
          <CostBreakdown
            model={selected}
            totalUsage={totalUsage}
            topHours={{ Baslast: 4.2, Höglast: 3.5 }}
          />
        )}
      </div>
    </main>
  );
}
