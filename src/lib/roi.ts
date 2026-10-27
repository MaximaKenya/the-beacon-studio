import { packForIndustry, packQuote, type IndustryPack } from "@/automations/packs";

export type RoiInput = {
  industry: string;
  /** Hours a week spent on follow-ups, reminders and admin the packs cover. */
  weeklyHours: number;
  /** Total KES currently unpaid by customers. */
  unpaidInvoicesKes: number;
  /** What one staff hour costs the business, in KES. */
  hourlyCostKes: number;
};

export type RoiResult = {
  pack: IndustryPack;
  monthlyHours: number;
  monthlyTimeCostKes: number;
  annualTimeCostKes: number;
  unpaidInvoicesKes: number;
  packMonthlyKes: number;
  packAnnualMonthlyKes: number;
  setupKes: number;
  /** Time cost minus the pack price. Negative means the pack costs more than the hours. */
  monthlyDifferenceKes: number;
  /** Hours the pack price equals at the hourly cost. */
  breakEvenHours: number;
};

const WEEKS_PER_MONTH = 52 / 12;

function clamp(value: number, max: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, max);
}

/** Pure maths from the visitor's own inputs. No assumed recovery or uplift rates. */
export function computeRoi(input: RoiInput): RoiResult {
  const weeklyHours = clamp(input.weeklyHours, 168);
  const hourlyCostKes = clamp(input.hourlyCostKes, 1_000_000);
  const unpaidInvoicesKes = Math.round(clamp(input.unpaidInvoicesKes, 1_000_000_000));
  const pack = packForIndustry(input.industry);
  const monthly = packQuote(pack, "monthly");
  const annual = packQuote(pack, "annual");
  const monthlyHours = Math.round(weeklyHours * WEEKS_PER_MONTH * 10) / 10;
  const monthlyTimeCostKes = Math.round(weeklyHours * WEEKS_PER_MONTH * hourlyCostKes);
  return {
    pack,
    monthlyHours,
    monthlyTimeCostKes,
    annualTimeCostKes: monthlyTimeCostKes * 12,
    unpaidInvoicesKes,
    packMonthlyKes: monthly.recurringMonthlyKes,
    packAnnualMonthlyKes: annual.recurringMonthlyKes,
    setupKes: monthly.setupKes,
    monthlyDifferenceKes: monthlyTimeCostKes - monthly.recurringMonthlyKes,
    breakEvenHours: hourlyCostKes > 0 ? Math.round((monthly.recurringMonthlyKes / hourlyCostKes) * 10) / 10 : 0,
  };
}
