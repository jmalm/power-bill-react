export interface UsageRow {
  datetime: string;
  usage: number;
}

export function parseUsageCsv(text: string): UsageRow[] {
  const lines = text.split(/\r?\n/);
  const data: UsageRow[] = [];
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    // Match datetime;usage (e.g., 2024-01-01T00:00;1.23)
    const match = line.match(/^([^;]+);([\d.,]+)$/);
    if (match) {
      // Replace comma with dot for decimal separator
      const usageStr = match[2].replace(',', '.');
      data.push({ datetime: match[1], usage: parseFloat(usageStr) });
    }
  }
  return data;
}

export function handleCsvUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  setUsageData: (rows: UsageRow[]) => void
) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const parsed = parseUsageCsv(text);
    setUsageData(parsed);
  };
  reader.readAsText(file);
}
