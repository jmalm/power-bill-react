import React from "react";
import { UsageFee } from "../models";

interface UsageEditorProps {
  usageFee: UsageFee;
  onChange: (usageFee: UsageFee) => void;
}

export default function UsageEditor({ usageFee, onChange }: UsageEditorProps) {
  // Handle changes to top-level fields
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = value;
    if (type === "number") newValue = parseFloat(value);
    if (type === "checkbox") newValue = checked;
    onChange({ ...usageFee, [name]: newValue });
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm">Fee name</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name={`name`}
          value={usageFee.name}
          onChange={handleFieldChange}
        />
      </div>
      <div>
        <label className="block text-sm">Fee per kWh</label>
        <input
          className="block w-full p-2 bg-white rounded"
          name={`feePerKW`}
          type="number"
          value={usageFee.feePerKWh}
          onChange={handleFieldChange}
        />
      </div>
      {usageFee.timeLimits ? (
        <>
          <div>
            <label className="block text-sm">Start time</label>
            <input
              className="block w-full p-2 bg-white rounded"
              name="startTime"
              type="time"
              value={usageFee.timeLimits.startTime}
              onChange={(e) => {
                onChange({
                  ...usageFee,
                  timeLimits: {
                    ...usageFee.timeLimits!,
                    startTime: e.target.value,
                  },
                });
              }}
            />
          </div>
          <div>
            <label className="block text-sm">End time</label>
            <input
              className="block w-full p-2 bg-white rounded"
              name="endTime"
              type="time"
              value={usageFee.timeLimits.endTime}
              onChange={(e) => {
                onChange({
                  ...usageFee,
                  timeLimits: {
                    ...usageFee.timeLimits!,
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
                className="block w-full p-2 bg-white rounded"
                name="months"
                value={usageFee.timeLimits.months?.join(",")}
                onChange={(e) => {
                  const monthsArray = e.target.value
                    .split(",")
                    .map((s) => parseInt(s.trim()))
                    .filter((n) => !isNaN(n));
                  onChange({
                    ...usageFee,
                    timeLimits: {
                      ...usageFee.timeLimits!,
                      months: monthsArray,
                    },
                  });
                }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...usageFee, timeLimits: undefined })}
            className="mt-2 bg-gray-200 p-2 rounded hover:bg-red-600 hover:text-white"
          >
            Remove time limits
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...usageFee,
              timeLimits: { startTime: "00:00", endTime: "23:59", months: [] },
            })
          }
          className="mt-2 bg-gray-200 p-2 rounded hover:bg-green-600 hover:text-white"
        >
          Add time limits
        </button>
      )}
    </div>
  );

  // Below is the return statement for the PowerTariffEditor component. Pasted here for context.
  // return (
  //   <div className="space-y-2">
  //     <div>
  //       <label className="block text-sm">Tariff name</label>
  //       <input
  //         className="block w-full p-2 bg-white rounded"
  //         name="name"
  //         value={tariff.name}
  //         onChange={handleFieldChange}
  //       />
  //     </div>
  //     <div>
  //       <label className="block text-sm">Fee per kW</label>
  //       <input
  //         className="block w-full p-2 bg-white rounded"
  //         name="feePerKW"
  //         type="number"
  //         value={tariff.feePerKW}
  //         onChange={handleFieldChange}
  //       />
  //     </div>
  //     <div>
  //       <label className="block text-sm">Number of top peaks to average</label>
  //       <input
  //         className="block w-full p-2 bg-white rounded"
  //         name="numberOfTopPeaksToAverage"
  //         type="number"
  //         value={tariff.numberOfTopPeaksToAverage}
  //         onChange={handleFieldChange}
  //       />
  //     </div>
  //     <h4 className="text-md font-semibold mt-2">Time limits (optional)</h4>
  //     {tariff.timeLimits ? (
  //       <>
  //         <div>
  //           <label className="block text-sm">Start time</label>
  //           <input
  //             className="block w-full p-2 bg-white rounded"
  //             name="startTime"
  //             type="time"
  //             value={tariff.timeLimits.startTime}
  //             onChange={(e) => {
  //               onChange({
  //                 ...tariff,
  //                 timeLimits: {
  //                   ...tariff.timeLimits!,
  //                   startTime: e.target.value,
  //                 },
  //               });
  //             }}
  //           />
  //         </div>
  //         <div>
  //           <label className="block text-sm">End time</label>
  //           <input
  //             className="block w-full p-2 bg-white rounded"
  //             name="endTime"
  //             type="time"
  //             value={tariff.timeLimits.endTime}
  //             onChange={(e) => {
  //               onChange({
  //                 ...tariff,
  //                 timeLimits: {
  //                   ...tariff.timeLimits!,
  //                   endTime: e.target.value,
  //                 },
  //               });
  //             }}
  //           />
  //           <div>
  //             <label className="block text-sm">
  //               Months (1 - 12, comma-separated)
  //             </label>
  //             <input
  //               className="block w-full p-2 bg-white rounded"
  //               name="months"
  //               value={tariff.timeLimits.months?.join(",")}
  //               onChange={(e) => {
  //                 const monthsArray = e.target.value
  //                   .split(",")
  //                   .map((s) => parseInt(s.trim()))
  //                   .filter((n) => !isNaN(n));
  //                 onChange({
  //                   ...tariff,
  //                   timeLimits: { ...tariff.timeLimits!, months: monthsArray },
  //                 });
  //               }}
  //             />
  //           </div>
  //         </div>
  //         <button
  //           type="button"
  //           onClick={() => onChange({ ...tariff, timeLimits: undefined })}
  //           className="mt-2 bg-gray-200 p-2 rounded hover:bg-red-600 hover:text-white"
  //         >
  //           Remove time limits
  //         </button>
  //       </>
  //     ) : (
  //       <button
  //         type="button"
  //         onClick={() =>
  //           onChange({
  //             ...tariff,
  //             timeLimits: { startTime: "00:00", endTime: "23:59", months: [] },
  //           })
  //         }
  //         className="mt-2 bg-gray-200 p-2 rounded hover:bg-green-600 hover:text-white"
  //       >
  //         Add time limits
  //       </button>
  //     )}
  //     <h4 className="text-md font-semibold mt-2">Night reduction (optional)</h4>
  //     {tariff.reduction ? (
  //       <>
  //         <div>
  //           <label className="block text-sm">Reduction factor</label>
  //           <input
  //             className="block w-full p-2 bg-white rounded"
  //             name="nightReduction.factor"
  //             type="number"
  //             step="0.01"
  //             value={tariff.reduction.factor}
  //             onChange={(e) => {
  //               const factor = parseFloat(e.target.value);
  //               onChange({
  //                 ...tariff,
  //                 reduction: {
  //                   ...tariff.reduction!,
  //                   factor: isNaN(factor) ? 0 : factor, // Default to 0 if invalid
  //                 },
  //               });
  //             }}
  //           />
  //         </div>
  //         <div>
  //           <label className="block text-sm">Reduction start time</label>
  //           <input
  //             className="block w-full p-2 bg-white rounded"
  //             name="nightReduction.startTime"
  //             type="time"
  //             value={tariff.reduction.startTime}
  //             onChange={(e) => {
  //               onChange({
  //                 ...tariff,
  //                 reduction: {
  //                   ...tariff.reduction!,
  //                   startTime: e.target.value,
  //                 },
  //               });
  //             }}
  //           />
  //         </div>
  //         <div>
  //           <label className="block text-sm">Reduction end time</label>
  //           <input
  //             className="block w-full p-2 bg-white rounded"
  //             name="nightReduction.endTime"
  //             type="time"
  //             value={tariff.reduction.endTime}
  //             onChange={(e) => {
  //               onChange({
  //                 ...tariff,
  //                 reduction: {
  //                   ...tariff.reduction!,
  //                   endTime: e.target.value,
  //                 },
  //               });
  //             }}
  //           />
  //         </div>
  //         <button
  //           type="button"
  //           onClick={() => onChange({ ...tariff, reduction: undefined })}
  //           className="mt-2 bg-gray-200 hover:bg-red-600 hover:text-white p-2 rounded"
  //         >
  //           Remove night reduction
  //         </button>
  //       </>
  //     ) : (
  //       <button
  //         type="button"
  //         onClick={() =>
  //           onChange({
  //             ...tariff,
  //             reduction: { factor: 0.5, startTime: "22:00", endTime: "08:00" },
  //           })
  //         }
  //         className="mt-2 bg-gray-200 hover:bg-green-600 hover:text-white p-2 rounded"
  //       >
  //         Add night reduction
  //       </button>
  //     )}
  //   </div>
  // );
}
