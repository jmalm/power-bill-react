// app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import PriceModelSelector from "./components/PriceModelSelector";
import PriceModelEditor from "./components/PriceModelEditor";
import { PriceModel } from "./models";
import { loadPriceModels } from "./utils/priceModelLoader";
import { downloadJson } from "./utils/downloadJson";
import CostBreakdown from "./components/CostBreakdown";
import {
  UsageRow,
  getAvailableCompleteMonths,
  filterDataByMonth,
} from "./utils/csv";
import CsvUploader from "./components/CsvUploader";
import MonthSelector from "./components/MonthSelector";
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
  const [availableMonths, setAvailableMonths] = useState<
    { year: number; month: number }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    month: number;
  } | null>(null);

  // Load price models on mount
  useEffect(() => {
    loadPriceModels().then((models) => {
      setPriceModels(models);
      // If the current selectedModel is not in the loaded models, select the first one
      if (models.length > 0 && !models.some((m) => m.name === selectedModel)) {
        setSelectedModel(models[0].name);
      }
    });
  }, []);

  // Update editing model when selected model changes
  useEffect(() => {
    setEditingModel(selected ? { ...selected } : null);
  }, [selected]);

  // Handle CSV upload and extract available months
  const handleCsvUpload = (data: UsageRow[]) => {
    setUsageData(data);
    const months = getAvailableCompleteMonths(data);
    setAvailableMonths(months);

    // Set the most recent month as selected by default
    if (months.length > 0) {
      const latestMonth = [...months].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })[0];

      setSelectedMonth(latestMonth);
    } else {
      setSelectedMonth(null);
    }
  };

  // Filter data by selected month
  const filteredData = useMemo(() => {
    if (!selectedMonth || usageData.length === 0) return [];
    return filterDataByMonth(
      usageData,
      selectedMonth.year,
      selectedMonth.month
    );
  }, [usageData, selectedMonth]);

  // Handle month selection change
  const handleMonthChange = (year: number, month: number) => {
    setSelectedMonth({ year, month });
  };

  // Calculate usage and costs using the filtered data
  const totalUsage = useMemo(
    () => filteredData.reduce((sum, row) => sum + row.usage, 0),
    [filteredData]
  );

  const totalUsagePerFee = useMemo(
    () =>
      selected && filteredData.length > 0
        ? calculateTotalUsagePerFee(filteredData, selected)
        : {},
    [selected, filteredData]
  );

  const topHoursPerTariff = useMemo(
    () =>
      selected && filteredData.length > 0
        ? calculateTopHoursPerTariff(filteredData, selected)
        : {},
    [selected, filteredData]
  );

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
            <div className="mb-4">
              <CsvUploader
                setUsageData={handleCsvUpload}
                usageData={usageData}
              />
            </div>

            {availableMonths.length > 0 && selectedMonth && (
              <div className="mt-4">
                <MonthSelector
                  months={availableMonths}
                  selectedMonth={selectedMonth}
                  onMonthChange={handleMonthChange}
                />
              </div>
            )}
          </div>

          {selected && usageData.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg mt-8">
              <CostBreakdown
                model={selected}
                totalUsagePerFee={totalUsagePerFee}
                topHoursPerTariff={topHoursPerTariff}
              />
            </div>
          )}
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
              CSV should contain electricity usage <em>per hour</em>, and have
              two columns:{" "}
              <span style={{ fontFamily: "monospace" }}>timestamp</span> (the
              start of the hour, in YYYY-MM-DD HH:MM format), and{" "}
              <span style={{ fontFamily: "monospace" }}>usage</span>{" "}
              (electricity usage during the following hour, in kWh).
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

            <h2 className="text-xl font-semibold mt-6 mb-4">
              CSV file doesn't load correctly?
            </h2>
            <p className="mb-4">
              If you're having trouble loading your CSV file, please ensure that
              it follows the correct format:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                The first row should contain the headers:{" "}
                <span style={{ fontFamily: "monospace" }}>timestamp</span> and{" "}
                <span style={{ fontFamily: "monospace" }}>usage</span>.
              </li>
              <li>
                Timestamps must be in{" "}
                <span style={{ fontFamily: "monospace" }}>
                  YYYY-MM-DD HH:MM
                </span>{" "}
                format.
              </li>
              <li>
                Ensure there are no empty rows or columns in the CSV file.
              </li>
            </ul>
            <p className="mt-4">
              If you would like the app to support your CSV file format, please
              open an issue on{" "}
              <a
                href="https://github.com/jmalm/power-bill-react/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                GitHub
              </a>
              . Include a sample of your CSV file, and I will try to add support
              for it.
            </p>
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
          . This project is open source and available on{" "}
          <a
            href="https://github.com/jmalm/power-bill-react"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
