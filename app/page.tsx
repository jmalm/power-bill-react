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
import {
  calculateTopHoursPerTariff,
  calculateTotalUsagePerFee,
} from "./utils/topHours";

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
  const totalUsagePerFee =
    selected && usageData.length
      ? calculateTotalUsagePerFee(usageData, selected)
      : {};

  // Calculate top hours per tariff for CostBreakdown
  const topHoursPerTariff =
    selected && usageData.length
      ? calculateTopHoursPerTariff(usageData, selected)
      : {};

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Calculate Electricity Cost
      </h1>
      <div className="grid grid-cols-[minmax(0,40rem)] xl:grid-cols-[minmax(18rem,18rem)_minmax(30rem,40rem)_minmax(18rem,18rem)] gap-8 justify-center w-full max-w-8xl mx-auto">
        {/* First Column: Price Model Selection and Editor */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Price Model</h2>
            <PriceModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              priceModels={priceModels}
            />

            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
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
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
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
          </div>
        </div>

        {/* Second Column: File Upload and Cost Breakdown */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Usage Data</h2>
            <div>
              <label className="block mb-2 font-medium">Upload usage CSV</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleCsvUpload(e, setUsageData)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {usageData.length > 0 && (
                <div className="mt-2 text-sm text-green-400">
                  Loaded {usageData.length} usage rows. Total:{" "}
                  {totalUsage.toFixed(2)} kWh
                </div>
              )}
            </div>

            {selected && usageData.length > 0 && (
              <CostBreakdown
                model={selected}
                totalUsagePerFee={totalUsagePerFee}
                topHoursPerTariff={topHoursPerTariff}
              />
            )}
          </div>
        </div>

        {/* Third Column: Help/Information */}
        <div className="text-gray-400">
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <p className="mb-4">
              1. Select a predefined price model or customize your own.
            </p>
            <p className="mb-4">
              2. Upload a CSV file containing your electricity usage data. The
              CSV should have two columns: `timestamp` (e.g., YYYY-MM-DD
              HH:MM:SS) and `usage` (in kWh).
            </p>
            <p className="">
              3. The cost breakdown will automatically update based on your
              selected price model and uploaded usage data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-4">
              Contribute Your Price Model
            </h2>
            <p className="mt-4">
              If you don't find a suitable price model, you can create a new one
              using the editor. Click "Show Details" to access the editor.
              Please consider sharing your model, for others to use, by
            </p>
            <ol className="list-decimal list-inside mt-2">
              <li>Downloading it as a JSON file.</li>
              <li>
                Uploading it to{" "}
                <a
                  href="https://github.com/jmalm/power-bill-react/issues/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Contributed price models on GitHub
                </a>
                .
              </li>
            </ol>
          </div>
        </div>
      </div>

      <footer className="w-full text-center mt-12 p-4 text-gray-500 text-sm">
        <p>
          &copy; 2025{" "}
          <a
            href="https://github.com/jmalm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Jakob Malm
          </a>
        </p>
      </footer>
    </main>
  );
}
