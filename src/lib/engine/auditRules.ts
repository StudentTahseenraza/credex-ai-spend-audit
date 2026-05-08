import { PRICING, getToolPricing, PricingTier } from './pricing';

export interface AuditContext {
  toolName: string;
  currentPlan: string;
  seats: number;
  monthlySpend: number;
  useCase: string;
  teamSize: number;
}

export interface AuditResult {
  action: 'downgrade' | 'upgrade' | 'switch' | 'stay' | 'consider_credex';
  suggestedTool?: string;
  suggestedPlan?: string;
  monthlySavings: number;
  reason: string;
}

// Check if user is overpaying for plan based on seats
function checkPlanOverspending(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[]
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {
  // Find current tier
  const currentTier = tiers.find((t) => t.name.toLowerCase() === currentPlan.toLowerCase());
  if (!currentTier) return null;

  // Find cheaper tier that fits seat count
  const cheaperTiers = tiers
    .filter((t) => t.monthlyPricePerSeat < currentTier.monthlyPricePerSeat)
    .filter((t) => !t.minSeats || seats >= t.minSeats)
    .filter((t) => !t.maxSeats || seats <= t.maxSeats);

  if (cheaperTiers.length === 0) return null;

  const bestTier = cheaperTiers.sort((a, b) => a.monthlyPricePerSeat - b.monthlyPricePerSeat)[0];
  const monthlySavings = (currentTier.monthlyPricePerSeat - bestTier.monthlyPricePerSeat) * seats;

  return {
    suggestedPlan: bestTier.name,
    monthlySavings,
    reason: `${currentPlan} costs $${currentTier.monthlyPricePerSeat}/seat. ${bestTier.name} at $${bestTier.monthlyPricePerSeat}/seat gives you the features you need.`,
  };
}

// Check if enterprise tier is overkill
function checkEnterpriseOverkill(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[]
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {
  const isEnterprise = currentPlan.toLowerCase().includes('enterprise');
  if (!isEnterprise) return null;

  const enterpriseTier = tiers.find((t) => t.name.toLowerCase().includes('enterprise'));
  const proTier = tiers.find((t) => t.name.toLowerCase() === 'pro' || t.name.toLowerCase() === 'business');

  if (!enterpriseTier || !proTier) return null;

  // Enterprise is overkill for small teams
  if (enterpriseTier.minSeats && seats < enterpriseTier.minSeats) {
    const monthlySavings = (enterpriseTier.monthlyPricePerSeat - proTier.monthlyPricePerSeat) * seats;
    return {
      suggestedPlan: proTier.name,
      monthlySavings,
      reason: `Enterprise requires ${enterpriseTier.minSeats}+ seats. You have ${seats} seats. ${proTier.name} is sufficient.`,
    };
  }

  return null;
}

// Check if user should switch to alternative tool
function checkAlternativeTool(
  toolName: string,
  currentPlan: string,
  seats: number,
  monthlySpend: number,
  useCase: string
): AuditResult | null {
  const tool = getToolPricing(toolName);
  if (!tool?.alternativeTo) return null;

  // For coding use cases, check alternatives
  if (useCase === 'coding') {
    for (const altName of tool.alternativeTo) {
      const alt = getToolPricing(altName);
      if (alt) {
        const altBasePrice = alt.tiers[0].monthlyPricePerSeat;
        const currentPricePerSeat = monthlySpend / seats;

        if (altBasePrice < currentPricePerSeat) {
          const monthlySavings = (currentPricePerSeat - altBasePrice) * seats;
          return {
            action: 'switch',
            suggestedTool: alt.name,
            suggestedPlan: alt.tiers[0].name,
            monthlySavings,
            reason: `${alt.name} is $${altBasePrice}/seat for your use case vs $${currentPricePerSeat}/seat on ${toolName}.`,
          };
        }
      }
    }
  }

  return null;
}

// High savings → suggest Credex
function checkCredexOpportunity(totalMonthlySavings: number): AuditResult | null {
  if (totalMonthlySavings > 500) {
    return {
      action: 'consider_credex',
      monthlySavings: totalMonthlySavings * 0.2, // Additional 20% through credits
      reason: `You're saving $${totalMonthlySavings}/month through our recommendations. Credex credits can save you an additional 20% on your AI spend.`,
    };
  }
  return null;
}

// Main audit function
export function auditTool(context: AuditContext): AuditResult {
  const pricing = getToolPricing(context.toolName);
  if (!pricing) {
    return {
      action: 'stay',
      monthlySavings: 0,
      reason: `We don't have pricing data for ${context.toolName} yet. Check back soon.`,
    };
  }

  const tiers = pricing.tiers;

  // Check plan overspending
  const overspending = checkPlanOverspending(context.currentPlan, context.seats, tiers);
  if (overspending && overspending.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: overspending.suggestedPlan,
      monthlySavings: overspending.monthlySavings,
      reason: overspending.reason,
    };
  }

  // Check enterprise overkill
  const enterpriseIssue = checkEnterpriseOverkill(context.currentPlan, context.seats, tiers);
  if (enterpriseIssue && enterpriseIssue.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: enterpriseIssue.suggestedPlan,
      monthlySavings: enterpriseIssue.monthlySavings,
      reason: enterpriseIssue.reason,
    };
  }

  // Check alternative tools
  const alternative = checkAlternativeTool(
    context.toolName,
    context.currentPlan,
    context.seats,
    context.monthlySpend,
    context.useCase
  );
  if (alternative && alternative.monthlySavings > 0) {
    return alternative;
  }

  // No savings found
  return {
    action: 'stay',
    monthlySavings: 0,
    reason: `Your ${context.toolName} setup looks optimized for your team size and use case.`,
  };
}