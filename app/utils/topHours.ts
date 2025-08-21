import { PriceModel, PowerTariff, PowerTariffReduction, TimeLimits } from "../models";
import { UsageRow } from "./csv";

interface TopHoursResult {
  [tariffName: string]: number; // average power for the N highest hours
}

function isWithinReduction(
  hour: number,
  reduction?: PowerTariffReduction
) {
  if (!reduction) return false;
  const start = parseTimeString(reduction.startTime);
  const end = parseTimeString(reduction.endTime);
  if (start === undefined || end === undefined) return false;
  if (start <= end) {
    return hour >= start && hour < end;
  } else {
    // Overnight (e.g., 22-6)
    return hour >= start || hour < end;
  }
}

function parseTimeString(time: string | undefined): number | undefined {
  if (!time) return undefined;
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
}

function isWithinTimeLimits(
  date: Date,
  timeLimits: TimeLimits | undefined
): boolean {
  if (!timeLimits) return true;
  if (!isWithinMonth(date, timeLimits)) return false;
  const hour = date.getHours();
  return isWithinTime(hour, timeLimits);
}

function isWithinMonth(date: Date, timeLimits: TimeLimits | undefined): boolean {
  if (!timeLimits?.months || timeLimits.months.length === 0) return true;
  return timeLimits.months.includes(date.getMonth() + 1); // JS months: 0-11, your config: 1-12
}

function isWithinTime(hour: number, timeLimits: TimeLimits | undefined): boolean {
  if (!timeLimits || !timeLimits.startTime || !timeLimits.endTime) return true;
  const start = parseTimeString(timeLimits.startTime) ?? 0;
  const end = parseTimeString(timeLimits.endTime) ?? 24;
  // If end < start, treat as overnight
  if (start < end) {
    return hour >= start && hour < end;
  } else {
    return hour >= start || hour < end;
  }
}

function groupUsageByDayHour(usageData: UsageRow[]) {
  const usageByDayHour: { [date: string]: { [hour: number]: number } } = {};
  usageData.forEach(({ datetime, usage }) => {
    if (isNaN(datetime.getTime())) return;
    const day = datetime.toISOString().slice(0, 10); // YYYY-MM-DD
    const hour = datetime.getHours();
    if (!usageByDayHour[day]) usageByDayHour[day] = {};
    usageByDayHour[day][hour] = (usageByDayHour[day][hour] || 0) + usage;
  });
  return usageByDayHour;
}

function getTopHourPerDay(
  usageByDayHour: { [hour: number]: number },
  day: string,
  tariff: PowerTariff
): number {
  let topUsage = -Infinity;
  for (let hour = 0; hour < 24; hour++) {
    // Only consider hours within the tariff's time window
    if (!isWithinTime(hour, tariff.timeLimits)) continue;
    let usage = usageByDayHour[hour] || 0;
    // Night reduction if needed (optional, not in your prompt)
    if (tariff.reduction && isWithinReduction(hour, tariff.reduction)) {
      usage *= tariff.reduction.factor;
    }
    if (usage > topUsage) {
      topUsage = usage;
    }
  }
  return topUsage > -Infinity ? topUsage : 0;
}

function getAllTopHoursForTariff(
  usageByDayHour: { [date: string]: { [hour: number]: number } },
  tariff: PowerTariff
): number[] {
  const topHours: number[] = [];
  for (const day in usageByDayHour) {
    const dateObj = new Date(day);
    if (!isWithinMonth(dateObj, tariff.timeLimits)) continue;
    const topHour = getTopHourPerDay(usageByDayHour[day], day, tariff);
    topHours.push(topHour);
  }
  return topHours;
}

function getAverageOfTopN(hours: number[], n: number): number {
  const sorted = [...hours].sort((a, b) => b - a);
  const topN = sorted.slice(0, n);
  if (topN.length === 0) return 0;
  return topN.reduce((sum, val) => sum + val, 0) / topN.length;
}

export function calculateTopHoursPerTariff(
  usageData: UsageRow[],
  model: PriceModel
): TopHoursResult {
  if (!usageData.length) return {};

  const usageByDayHour = groupUsageByDayHour(usageData);
  const result: TopHoursResult = {};

  for (const tariff of model.powerTariffs) {
    const allTopHours = getAllTopHoursForTariff(usageByDayHour, tariff);
    const avg = getAverageOfTopN(allTopHours, tariff.numberOfTopPeaksToAverage);
    result[tariff.name] = avg;
  }

  return result;
}

export function calculateTotalUsagePerFee(
  usageData: UsageRow[],
  model: PriceModel
): Record<string, number> {
  const totalUsagePerFee: Record<string, number> = {};
  for (const usageFee of model.usageFees) {
    totalUsagePerFee[usageFee.name] = 0;
    for (const row of usageData) {
      if (!isWithinTimeLimits(row.datetime, usageFee.timeLimits)) continue;
      totalUsagePerFee[usageFee.name] += row.usage;
    }
  }
  return totalUsagePerFee;
}
