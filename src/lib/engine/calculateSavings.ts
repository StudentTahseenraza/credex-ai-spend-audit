import { AuditResult } from './auditRules';

export interface ToolSavings {
  toolName: string;
  currentMonthlySpend: number;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  action: string;
  reason: string;
}

export function calculateToolSavings(
  toolName: string,
  currentMonthlySpend: number,
  auditResult: AuditResult
): ToolSavings {
  const recommendedMonthlySpend = Math.max(0, currentMonthlySpend - auditResult.monthlySavings);

  return {
    toolName,
    currentMonthlySpend,
    recommendedMonthlySpend,
    monthlySavings: auditResult.monthlySavings,
    action: auditResult.action,
    reason: auditResult.reason,
  };
}

export function calculateTotalSavings(toolSavings: ToolSavings[]): {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
} {
  const totalMonthlySavings = toolSavings.reduce((sum, t) => sum + t.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return { totalMonthlySavings, totalAnnualSavings };
}