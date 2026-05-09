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

// Check if user is overpaying and find the RIGHT plan (not the cheapest)
function checkPlanOverspending(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[]
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {
  // Find current tier
  const currentTier = tiers.find((t) => t.name.toLowerCase() === currentPlan.toLowerCase());
  if (!currentTier) return null;

  // Find tiers that are cheaper than current AND appropriate for seat count
  // But NOT free/Hobby unless the user is actually on a paid plan that's overkill
  const appropriateTiers = tiers
    .filter((t) => t.monthlyPricePerSeat < currentTier.monthlyPricePerSeat)
    .filter((t) => {
      // Check seat requirements
      if (t.minSeats && seats < t.minSeats) return false;
      if (t.maxSeats && seats > t.maxSeats) return false;
      
      // If current plan is paid (not free), don't recommend free unless it's truly the only option
      // But for business logic, we want to avoid recommending free for professional use
      if (currentTier.monthlyPricePerSeat > 0 && t.monthlyPricePerSeat === 0) {
        // Only allow free if the free tier actually has reasonable features
        // For most tools, free tier is too limited for teams
        return false;
      }
      
      return true;
    });

  if (appropriateTiers.length === 0) return null;

  // Sort by price (cheapest first) BUT we want the most expensive of the cheap options
  // This gives the right-fit plan, not the absolute cheapest
  const sortedTiers = appropriateTiers.sort((a, b) => b.monthlyPricePerSeat - a.monthlyPricePerSeat);
  const bestTier = sortedTiers[0];
  
  const monthlySavings = (currentTier.monthlyPricePerSeat - bestTier.monthlyPricePerSeat) * seats;
  
  // Only suggest if savings are meaningful (> $10 total or > 20% savings)
  if (monthlySavings < 10) return null;

  return {
    suggestedPlan: bestTier.name,
    monthlySavings,
    reason: `${currentPlan} costs $${currentTier.monthlyPricePerSeat}/seat. ${bestTier.name} at $${bestTier.monthlyPricePerSeat}/seat is more appropriate for your team size of ${seats}.`,
  };
}

// Special case: Check if user is on a paid plan but could use a lower paid plan
function checkSpecificDowngradePath(
  currentPlan: string,
  seats: number,
  tiers: PricingTier[]
): { suggestedPlan: string; monthlySavings: number; reason: string } | null {
  const currentTier = tiers.find((t) => t.name.toLowerCase() === currentPlan.toLowerCase());
  if (!currentTier) return null;

  // Define logical downgrade paths
  const downgradePaths: Record<string, string[]> = {
    'Enterprise': ['Business', 'Pro', 'Plus'],
    'Business': ['Pro', 'Plus'],
    'Team': ['Plus', 'Pro'],
    'Max': ['Pro'],
    'Ultra': ['Pro'],
  };

  const possibleDowngrades = downgradePaths[currentPlan] || [];
  
  for (const targetPlan of possibleDowngrades) {
    const targetTier = tiers.find((t) => t.name === targetPlan);
    if (!targetTier) continue;
    
    // Check seat requirements for target plan
    if (targetTier.minSeats && seats < targetTier.minSeats) continue;
    if (targetTier.maxSeats && seats > targetTier.maxSeats) continue;
    
    const monthlySavings = (currentTier.monthlyPricePerSeat - targetTier.monthlyPricePerSeat) * seats;
    
    if (monthlySavings > 0) {
      return {
        suggestedPlan: targetPlan,
        monthlySavings,
        reason: `${currentPlan} is overkill for ${seats} ${seats === 1 ? 'user' : 'users'}. ${targetPlan} provides the features you need at $${targetTier.monthlyPricePerSeat}/seat.`,
      };
    }
  }
  
  return null;
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
  const businessTier = tiers.find((t) => t.name.toLowerCase() === 'business');
  const proTier = tiers.find((t) => t.name.toLowerCase() === 'pro');

  // If seats are below enterprise minimum, suggest business or pro
  if (enterpriseTier?.minSeats && seats < enterpriseTier.minSeats) {
    const targetTier = businessTier || proTier;
    if (targetTier) {
      const monthlySavings = (enterpriseTier.monthlyPricePerSeat - targetTier.monthlyPricePerSeat) * seats;
      return {
        suggestedPlan: targetTier.name,
        monthlySavings,
        reason: `Enterprise requires ${enterpriseTier.minSeats}+ seats. You have ${seats} seats. ${targetTier.name} is sufficient.`,
      };
    }
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
        const altBasePrice = alt.tiers.find(t => t.name === 'Pro' || t.name === 'Business')?.monthlyPricePerSeat || alt.tiers[0].monthlyPricePerSeat;
        const currentPricePerSeat = monthlySpend / seats;
        
        // Only suggest switch if savings are > 20%
        const savingsPercentage = (currentPricePerSeat - altBasePrice) / currentPricePerSeat;
        if (altBasePrice < currentPricePerSeat && savingsPercentage > 0.2) {
          const monthlySavings = (currentPricePerSeat - altBasePrice) * seats;
          return {
            action: 'switch',
            suggestedTool: alt.name,
            suggestedPlan: alt.tiers.find(t => t.name === 'Pro' || t.name === 'Business')?.name || alt.tiers[0].name,
            monthlySavings,
            reason: `${alt.name} is $${altBasePrice}/seat for your use case vs $${currentPricePerSeat.toFixed(2)}/seat on ${tool.name}. That's ${Math.round(savingsPercentage * 100)}% savings.`,
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

  // First check: Enterprise overkill (specific case)
  const enterpriseIssue = checkEnterpriseOverkill(context.currentPlan, context.seats, tiers);
  if (enterpriseIssue && enterpriseIssue.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: enterpriseIssue.suggestedPlan,
      monthlySavings: enterpriseIssue.monthlySavings,
      reason: enterpriseIssue.reason,
    };
  }

  // Second: Check logical downgrade paths (Team -> Plus, Business -> Pro, etc.)
  const downgradePath = checkSpecificDowngradePath(context.currentPlan, context.seats, tiers);
  if (downgradePath && downgradePath.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: downgradePath.suggestedPlan,
      monthlySavings: downgradePath.monthlySavings,
      reason: downgradePath.reason,
    };
  }

  // Third: Check general plan overspending
  const overspending = checkPlanOverspending(context.currentPlan, context.seats, tiers);
  if (overspending && overspending.monthlySavings > 0) {
    return {
      action: 'downgrade',
      suggestedPlan: overspending.suggestedPlan,
      monthlySavings: overspending.monthlySavings,
      reason: overspending.reason,
    };
  }

  // Fourth: Check alternative tools (only for coding use cases)
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

  // No savings found - optimized
  return {
    action: 'stay',
    monthlySavings: 0,
    reason: `Your ${pricing.name} setup is optimized for your team size of ${context.seats} ${context.seats === 1 ? 'user' : 'users'} focused on ${context.useCase}. No changes recommended.`,
  };
}