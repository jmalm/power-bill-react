export interface UsageRow {
  datetime: Date;
  usage: number;
}

export function parseUsageCsv(text: string): UsageRow[] {
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
    
    const parts = line.split(';');
    
    // Check if this line is a header
    const isHeader = parts.some(part => 
      part.toLowerCase().includes('time') || 
      part.toLowerCase().includes('usage') ||
      part.toLowerCase().includes('consumption')
    );
    
    if (isHeader) {
      hasHeader = true;
      dataStartIndex = i + 1;
      
      // Determine column indices
      parts.forEach((part, index) => {
        const lowerPart = part.toLowerCase();
        if (lowerPart.includes('timestamp') || lowerPart.includes('start')) {
          timestampCol = index;
        } else if (lowerPart.includes('end')) {
          endTimeCol = index;
        } else if (lowerPart.includes('usage') || lowerPart.includes('consumption')) {
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
    
    const parts = line.split(';');
    
    // Skip if we don't have enough columns
    if (parts.length <= Math.max(timestampCol, usageCol, endTimeCol)) continue;
    
    // Get the values
    let timestamp = parts[timestampCol].trim();
    const datetime = new Date(timestamp);
    const usageStr = parts[usageCol].trim().replace(',', '.');
    const usage = parseFloat(usageStr) || 0;
    
    data.push({ datetime, usage });
  }

  // Verify that the data is valid. We expect at least 100 rows for meaningful analysis.
  if (data.length < 100) {
    throw new Error("Not enough data points. Please provide at least 100 rows of usage data.");
  }
  // Verify that the second timestamp is one hour after the first timestamp
  const diffHours = (data[1].datetime.getTime() - data[0].datetime.getTime()) / 3600000;
  if (Math.abs(diffHours - 1) > 0.01) { // Allow a small margin of error for time adjustments.
    throw new Error("Invalid timestamp interval. Expected 1 hour between data points.");
  }
  // Verify that the timestamps cover approximately one month
  const startDate = data[0].datetime;
  const endDate = data[data.length - 1].datetime;
  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  if (diffDays < 25 || diffDays > 35) {
    throw new Error(`Invalid timestamp range. Expected approximately one month of data. Got ${diffDays.toFixed(0)} days.`);
  }

  return data;
}
