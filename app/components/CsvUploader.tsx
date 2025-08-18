"use client";

import React, { useState } from 'react';
import { UsageRow } from '../utils/csv';

interface CsvUploaderProps {
  onUpload: (data: UsageRow[]) => void;
  disabled?: boolean;
}

export default function CsvUploader({ onUpload, disabled = false }: CsvUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<UsageRow[] | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const { parseUsageCsv } = await import('../utils/csv');
      const parsed = parseUsageCsv(text);
      
      if (parsed.length < 2) {
        throw new Error('CSV must contain at least 2 data points');
      }
      
      setData(parsed);
      onUpload(parsed);
    } catch (err) {
      console.error('Error processing CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setIsUploading(false);
      // Reset the input to allow re-uploading the same file if there was an error
      event.target.value = '';
    }
  };

  const handleDismissError = () => {
    setError(null);
    setFileName(null);
    setData(null);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Choose File
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-700 truncate max-w-xs">
            {fileName || 'No file chosen'}
          </span>
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">Error processing {fileName || 'file'}:</div>
              <div className="mt-1">{error}</div>
            </div>
            <button
              onClick={handleDismissError}
              className="ml-4 text-red-700 hover:text-red-900 focus:outline-none"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {fileName && !error && !isUploading && (
        <div className="mt-2 text-sm text-green-700">
          Successfully loaded {data?.length} data points
        </div>
      )}
    </div>
  );
}
