import React from "react";
import { PowerTariff } from "../models";

interface PowerTariffEditorProps {
  tariff: PowerTariff;
  onChange: (tariff: PowerTariff) => void;
}

export default function PowerTariffEditor({
  tariff,
  onChange,
}: PowerTariffEditorProps) {
  // Handle changes to top-level fields
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = value;
    if (type === "number") newValue = parseFloat(value);
    if (type === "checkbox") newValue = checked;
    onChange({ ...tariff, [name]: newValue });
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm">Tariff name</label>
        <input
          className="block w-full p-2 border rounded"
          name="name"
          value={tariff.name}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Fee per kW</label>
        <input
          className="block w-full p-2 border rounded"
          name="feePerKW"
          type="number"
          value={tariff.feePerKW}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Number of top peaks to average</label>
        <input
          className="block w-full p-2 border rounded"
          name="numberOfTopPeaksToAverage"
          type="number"
          value={tariff.numberOfTopPeaksToAverage}
          onChange={handleFieldChange}
        />
      </div>
      <h4 className="text-md font-semibold mt-2">Time limits (optional)</h4>
      {tariff.timeLimits ? (
        <>
          <div>
            <label className="block text-sm">Start time</label>
            <input
              className="block w-full p-2 border rounded"
              name="startTime"
              type="time"
              value={tariff.timeLimits.startTime}
              onChange={(e) => {
                onChange({
                  ...tariff,
                  timeLimits: {
                    ...tariff.timeLimits!,
                    startTime: e.target.value,
                  },
                });
              }}
            />
          </div>
          <div>
            <label className="block text-sm">End time</label>
            <input
              className="block w-full p-2 border rounded"
              name="endTime"
              type="time"
              value={tariff.timeLimits.endTime}
              onChange={(e) => {
                onChange({
                  ...tariff,
                  timeLimits: {
                    ...tariff.timeLimits!,
                    endTime: e.target.value,
                  },
                });
              }}
            />
            <div>
              <label className="block text-sm">
                Months (1 - 12, comma-separated)
              </label>
              <input
                className="block w-full p-2 border rounded"
                name="months"
                value={tariff.timeLimits.months?.join(",")}
                onChange={(e) => {
                  const monthsArray = e.target.value
                    .split(",")
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n));
                  onChange({
                    ...tariff,
                    timeLimits: { ...tariff.timeLimits!, months: monthsArray },
                  });
                }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...tariff, timeLimits: undefined })}
            className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Remove time limits
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...tariff,
              timeLimits: { startTime: "00:00", endTime: "23:59", months: [] },
            })
          }
          className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add time limits
        </button>
      )}
      <h4 className="text-md font-semibold mt-2">Night reduction (optional)</h4>
      {tariff.reduction ? (
        <>
          <div>
            <label className="block text-sm">Reduction factor</label>
            <input
              className="block w-full p-2 border rounded"
              name="nightReduction.factor"
              type="number"
              step="0.01"
              value={tariff.reduction.factor}
              onChange={(e) => {
                const factor = parseFloat(e.target.value);
                onChange({
                  ...tariff,
                  reduction: {
                    ...tariff.reduction!,
                    factor: isNaN(factor) ? 0 : factor, // Default to 0 if invalid
                  },
                });
              }}
            />
          </div>
          <div>
            <label className="block text-sm">Reduction start time</label>
            <input
              className="block w-full p-2 border rounded"
              name="nightReduction.startTime"
              type="time"
              value={tariff.reduction.startTime}
              onChange={(e) => {
                onChange({
                  ...tariff,
                  reduction: {
                    ...tariff.reduction!,
                    startTime: e.target.value,
                  },
                });
              }}
            />
          </div>
          <div>
            <label className="block text-sm">Reduction end time</label>
            <input
              className="block w-full p-2 border rounded"
              name="nightReduction.endTime"
              type="time"
              value={tariff.reduction.endTime}
              onChange={(e) => {
                onChange({
                  ...tariff,
                  reduction: {
                    ...tariff.reduction!,
                    endTime: e.target.value,
                  },
                });
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...tariff, reduction: undefined })}
            className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Remove night reduction
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...tariff,
              reduction: { factor: 0.5, startTime: "22:00", endTime: "08:00" },
            })
          }
          className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add night reduction
        </button>
      )}
    </div>
  );
}
