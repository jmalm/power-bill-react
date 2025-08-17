export interface UsageRow {
  datetime: string;
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
    const usageStr = parts[usageCol].trim().replace(',', '.');
    const usage = parseFloat(usageStr) || 0;
    
    // Verify that this timestamp is one hour after the previous timestamp
    if (data.length > 0) {
      const previousTimestamp = data[data.length - 1].datetime;
      const previousDate = new Date(previousTimestamp);
      const currentDate = new Date(timestamp);
      const diffHours = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60);
      if (Math.abs(diffHours - 1) > 0.1) { // Allow small margin for DST changes
        throw new Error(`Timestamps must be 1 hour apart, found ${diffHours} hours`);
      }
    }
    
    // Clean up timestamp (remove timezone if present)
    timestamp = timestamp.replace(/[TZ].*$/, '');
    
    data.push({ datetime: timestamp, usage });
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

    try {
      const parsed = parseUsageCsv(text);
      if (parsed.length < 2) {
        throw new Error('CSV must contain at least 2 data points');
      }
      setUsageData(parsed);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      console.log('CSV content (first 1000 chars):', text.substring(0, 1000));
    }
  };
  reader.readAsText(file);
}
