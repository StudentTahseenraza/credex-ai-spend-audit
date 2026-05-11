import { getToolPricing, PricingTier } from './pricing';

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

// Check if user is overpaying and find the RIGHT plan
function checkPlanOverspending(
  currentPlan: string,
  seats: number,
  monthlySpend: number,
  tiers: PricingTier[] | undefined
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {

  if (!tiers || tiers.length === 0) {
    return null;
  }

  const currentTier = tiers.find(
    (t) => t.name.toLowerCase() === currentPlan.toLowerCase()
  );

  if (!currentTier) return null;

  const actualPricePerSeat = monthlySpend / seats;

  const cheaperTiers = tiers
    .filter((t) => t.monthlyPricePerSeat < actualPricePerSeat)
    .filter((t) => {
      if (t.minSeats && seats < t.minSeats) return false;
      if (t.maxSeats && seats > t.maxSeats) return false;
      return true;
    });

  if (cheaperTiers.length === 0) return null;

  const bestTier = cheaperTiers.sort(
    (a, b) => b.monthlyPricePerSeat - a.monthlyPricePerSeat
  )[0];

  const monthlySavings =
    (actualPricePerSeat - bestTier.monthlyPricePerSeat) * seats;

  if (monthlySavings <= 0) return null;

  return {
    suggestedPlan: bestTier.name,
    monthlySavings,
    reason:
      `${currentPlan} costs $${actualPricePerSeat.toFixed(2)}/seat. ` +
      `${bestTier.name} at $${bestTier.monthlyPricePerSeat}/seat saves you ` +
      `$${monthlySavings}/month.`,
  };
}

// Check logical downgrade paths
function checkSpecificDowngradePath(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[] | undefined
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {

  if (!tiers || tiers.length === 0) return null;

  const currentTier = tiers.find(
    (t) => t.name.toLowerCase() === currentPlan.toLowerCase()
  );

  if (!currentTier) return null;

  const downgradePaths: Record<string, string[]> = {
    Enterprise: ['Business', 'Pro'],
    Business: ['Pro'],
    Team: ['Plus', 'Pro'],
    Max: ['Pro'],
    Ultra: ['Pro'],
  };

  const possibleDowngrades = downgradePaths[currentPlan] || [];

  for (const targetPlan of possibleDowngrades) {
    const targetTier = tiers.find((t) => t.name === targetPlan);

    if (!targetTier) continue;

    if (targetTier.minSeats && seats < targetTier.minSeats) continue;
    if (targetTier.maxSeats && seats > targetTier.maxSeats) continue;

    const monthlySavings =
      (currentTier.monthlyPricePerSeat - targetTier.monthlyPricePerSeat) * seats;

    if (monthlySavings > 0) {
      return {
        suggestedPlan: targetPlan,
        monthlySavings,
        reason:
          `${currentPlan} is overkill for ${seats} user${seats !== 1 ? 's' : ''}. ` +
          `${targetPlan} provides what you need at $${targetTier.monthlyPricePerSeat}/seat.`,
      };
    }
  }

  return null;
}

// Check if enterprise tier is overkill
function checkEnterpriseOverkill(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[] | undefined
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {

  if (!tiers || tiers.length === 0) return null;

  const isEnterprise =
    currentPlan.toLowerCase().includes('enterprise');

  if (!isEnterprise) return null;

  const enterpriseTier = tiers.find((t) =>
    t.name.toLowerCase().includes('enterprise')
  );

  const businessTier = tiers.find(
    (t) => t.name.toLowerCase() === 'business'
  );

  const proTier = tiers.find(
    (t) => t.name.toLowerCase() === 'pro'
  );

  if (enterpriseTier?.minSeats && seats < enterpriseTier.minSeats) {

    const targetTier = businessTier || proTier;

    if (targetTier) {

      const monthlySavings =
        (enterpriseTier.monthlyPricePerSeat -
          targetTier.monthlyPricePerSeat) * seats;

      return {
        suggestedPlan: targetTier.name,
        monthlySavings,
        reason:
          `Enterprise requires ${enterpriseTier.minSeats}+ seats. ` +
          `You have ${seats} seats. ${targetTier.name} is sufficient.`,
      };
    }
  }

  return null;
}

// Check alternative tools
function checkAlternativeTool(
  toolName: string,
  currentPlan: string,
  seats: number,
  monthlySpend: number,
  useCase: string
): AuditResult | null {

  if (useCase !== 'coding') return null;

  const tool = getToolPricing(toolName);

  if (!tool?.alternativeTo) return null;

  for (const altName of tool.alternativeTo) {

    const alt = getToolPricing(altName);

    if (alt) {

      const altProTier = alt.tiers.find(
        (t) => t.name === 'Pro' || t.name === 'Business'
      );

      const altPrice =
        altProTier?.monthlyPricePerSeat ||
        alt.tiers[0]?.monthlyPricePerSeat ||
        0;

      const currentPricePerSeat = monthlySpend / seats;

      if (altPrice > 0 && altPrice < currentPricePerSeat) {

        const savingsPercentage =
          (currentPricePerSeat - altPrice) / currentPricePerSeat;

        if (savingsPercentage > 0.2) {

          const monthlySavings =
            (currentPricePerSeat - altPrice) * seats;

          return {
            action: 'switch',
            suggestedTool: alt.name,
            suggestedPlan:
              altProTier?.name || alt.tiers[0]?.name,
            monthlySavings,
            reason:
              `${alt.name} costs $${altPrice}/seat vs ` +
              `$${currentPricePerSeat.toFixed(2)}/seat for ${tool.name}. ` +
              `Save ${Math.round(savingsPercentage * 100)}% by switching.`,
          };
        }
      }
    }
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
      reason:
        `We don't have pricing data for ${context.toolName} yet. Check back soon.`,
    };
  }

  const tiers = pricing.tiers;

  if (!tiers || tiers.length === 0) {
    return {
      action: 'stay',
      monthlySavings: 0,
      reason:
        `Pricing data for ${context.toolName} is not available.`,
    };
  }

  // Keep Cursor Pro for solo developers
  if (
    context.toolName === 'cursor' &&
    context.currentPlan === 'Pro' &&
    context.teamSize === 1
  ) {
    return {
      action: 'stay',
      suggestedPlan: context.currentPlan,
      monthlySavings: 0,
      reason: 'Cursor Pro is appropriate for a single developer.',
    };
  }

  // Avoid forcing coding optimizations for non-coding users
  if (
    context.toolName === 'cursor' &&
    context.useCase !== 'coding'
  ) {
    return {
      action: 'stay',
      suggestedPlan: context.currentPlan,
      monthlySavings: 0,
      reason: 'No optimization needed for non-coding workflows.',
    };
  }

  // Check enterprise overkill first
  const enterpriseIssue = checkEnterpriseOverkill(
    context.currentPlan,
    context.seats,
    tiers
  );

  if (enterpriseIssue && enterpriseIssue.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: enterpriseIssue.suggestedPlan,
      monthlySavings: enterpriseIssue.monthlySavings,
      reason: enterpriseIssue.reason,
    };
  }

  // Check specific downgrade paths
  const downgradePath = checkSpecificDowngradePath(
    context.currentPlan,
    context.seats,
    tiers
  );

  if (downgradePath && downgradePath.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: downgradePath.suggestedPlan,
      monthlySavings: downgradePath.monthlySavings,
      reason: downgradePath.reason,
    };
  }

  // Check general overspending
  const overspending = checkPlanOverspending(
    context.currentPlan,
    context.seats,
    context.monthlySpend,
    tiers
  );

  if (overspending && overspending.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: overspending.suggestedPlan,
      monthlySavings: overspending.monthlySavings,
      reason: overspending.reason,
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
    reason:
      `Your ${pricing.name} setup is optimized for your team size of ` +
      `${context.seats} user${context.seats !== 1 ? 's' : ''} ` +
      `focused on ${context.useCase}.`,
  };
}