export interface UsageRow {
  datetime: Date;
  usage: number;
}

export function getAvailableCompleteMonths(
  usageData: UsageRow[]
): { year: number; month: number }[] {
  const startDate = usageData[0].datetime;
  const endDate = usageData[usageData.length - 1].datetime;

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  const months: { year: number; month: number }[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (
      let month = year === startYear ? startMonth : 0;
      month <= (year === endYear ? endMonth : 11);
      month++
    ) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      if (startDate <= firstDay && lastDay <= endDate) {
        months.push({ year, month });
      }
    }
  }

  return months;
}

export function filterDataByMonth(
  usageData: UsageRow[],
  year: number,
  month: number
): UsageRow[] {
  return usageData.filter((row) => {
    const rowDate = row.datetime;
    return rowDate.getFullYear() === year && rowDate.getMonth() === month;
  });
}

export function parseUsageCsv(text: string, minRows: number = 100): UsageRow[] {
  const lines = text.split(/\r?\n/);
  const data: UsageRow[] = [];

  // Find the first line that looks like a header
  let dataStartIndex = 0;
  let hasHeader = false;
  let timestampCol = -1;
  let endTimeCol = -1;
  let usageCol = -1;

  // Scan for header line and determine column indices
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");

    // Check if this line is a header
    const isHeader = parts.some(
      (part) =>
        part.toLowerCase().includes("time") ||
        part.toLowerCase().includes("usage") ||
        part.toLowerCase().includes("consumption")
    );

    if (isHeader) {
      hasHeader = true;
      dataStartIndex = i + 1;

      // Determine column indices
      parts.forEach((part, index) => {
        const lowerPart = part.toLowerCase();
        if (lowerPart.includes("timestamp") || lowerPart.includes("start")) {
          timestampCol = index;
        } else if (lowerPart.includes("end")) {
          endTimeCol = index;
        } else if (
          lowerPart.includes("usage") ||
          lowerPart.includes("consumption")
        ) {
          usageCol = index;
        }
      });

      // If we couldn't determine usage column, assume it's the last column
      if (usageCol === -1) {
        usageCol = parts.length - 1;
      }

      // If we couldn't determine timestamp column, assume it's the first column
      if (timestampCol === -1) {
        timestampCol = 0;
      }

      break;
    }
  }

  // If no header found, assume first line is data
  if (!hasHeader) {
    dataStartIndex = 0;
    usageCol = 1; // Second column for usage
    timestampCol = 0; // First column for timestamp
  }

  // Process data rows
  for (let i = dataStartIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(";");

    // Skip if we don't have enough columns
    if (parts.length <= Math.max(timestampCol, usageCol, endTimeCol)) continue;

    // Get the values
    let timestamp = parts[timestampCol].trim();
    const datetime = new Date(timestamp);
    const usageStr = parts[usageCol].trim().replace(",", ".");
    const usage = parseFloat(usageStr) || 0;

    // Skip invalid dates
    if (isNaN(datetime.getTime())) continue;

    data.push({ datetime, usage });
  }

  // Verify that the data is valid
  if (data.length < minRows) {
    throw new Error(
      `Not enough data points. Please provide at least ${minRows} rows of usage data.`
    );
  }

  // Verify that the timestamps are in chronological order
  for (let i = 1; i < data.length; i++) {
    const prevTime = data[i - 1].datetime.getTime();
    const currTime = data[i].datetime.getTime();
    if (currTime < prevTime) {
      throw new Error("Timestamps must be in chronological order.");
    }
  }

  // Verify that the timestamps are approximately 1 hour apart
  const diffHours =
    (data[1].datetime.getTime() - data[0].datetime.getTime()) / 3600000;
  if (Math.abs(diffHours - 1) > 0.01) {
    throw new Error(
      "Invalid timestamp interval. Expected 1 hour between data points."
    );
  }

  return data;
}
