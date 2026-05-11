

export interface PricingTier {
  name: string;
  monthlyPricePerSeat: number;
  minSeats?: number;
  maxSeats?: number;
  features: string[];
}

export interface ToolPricing {
  name: string;
  tiers: PricingTier[];
  alternativeTo?: string[];
}

export const PRICING: Record<string, ToolPricing> = {
  cursor: {
    name: 'Cursor',
    tiers: [
      { name: 'Hobby', monthlyPricePerSeat: 0, features: ['Basic completion', 'Limited context'] },
      { name: 'Pro', monthlyPricePerSeat: 20, features: ['Unlimited completions', 'Full context'] },
      { name: 'Business', monthlyPricePerSeat: 40, minSeats: 2, features: ['Team management', 'SOC2'] },
      { name: 'Enterprise', monthlyPricePerSeat: 60, minSeats: 10, features: ['Custom deployment', 'SLA'] },
    ],
    alternativeTo: ['github-copilot'],
  },
  'github-copilot': {
    name: 'GitHub Copilot',
    tiers: [
      { name: 'Individual', monthlyPricePerSeat: 10, features: ['Basic'] },
      { name: 'Business', monthlyPricePerSeat: 19, minSeats: 2, features: ['License management', 'Org policies'] },
      { name: 'Enterprise', monthlyPricePerSeat: 39, minSeats: 10, features: ['SSO', 'SLA'] },
    ],
    alternativeTo: ['cursor'],
  },
  claude: {
    name: 'Claude',
    tiers: [
      { name: 'Free', monthlyPricePerSeat: 0, features: ['Basic'] },
      { name: 'Pro', monthlyPricePerSeat: 20, features: ['5x usage', 'Priority access'] },
      { name: 'Max', monthlyPricePerSeat: 30, features: ['10x usage'] },
      { name: 'Team', monthlyPricePerSeat: 25, minSeats: 2, features: ['Central billing'] },
      { name: 'Enterprise', monthlyPricePerSeat: 50, minSeats: 10, features: ['Custom'] },
    ],
  },
  chatgpt: {
    name: 'ChatGPT',
    tiers: [
      { name: 'Free', monthlyPricePerSeat: 0, features: ['GPT-3.5'] },
      { name: 'Plus', monthlyPricePerSeat: 20, features: ['GPT-4', 'Web browsing'] },
      { name: 'Team', monthlyPricePerSeat: 25, minSeats: 2, features: ['Team workspace', 'Admin console'] },
      { name: 'Enterprise', monthlyPricePerSeat: 50, minSeats: 10, features: ['Custom', 'SOC2'] },
    ],
  },
  gemini: {
    name: 'Gemini',
    tiers: [
      { name: 'Free', monthlyPricePerSeat: 0, features: ['Basic'] },
      { name: 'Pro', monthlyPricePerSeat: 20, features: ['Advanced reasoning'] },
      { name: 'Ultra', monthlyPricePerSeat: 30, features: ['Most capable'] },
    ],
  },
  anthropic: {
    name: 'Anthropic API',
    tiers: [{ name: 'API Direct', monthlyPricePerSeat: 0, features: ['Pay per token', '$0.008/1k input'] }],
  },
  openai: {
    name: 'OpenAI API',
    tiers: [{ name: 'API Direct', monthlyPricePerSeat: 0, features: ['Pay per token', 'GPT-4 Turbo'] }],
  },
  windsurf: {
    name: 'Windsurf',
    tiers: [
      { name: 'Free', monthlyPricePerSeat: 0, features: ['Basic'] },
      { name: 'Pro', monthlyPricePerSeat: 15, features: ['Full IDE'] },
      { name: 'Team', monthlyPricePerSeat: 30, minSeats: 2, features: ['Team sync'] },
    ],
  },
};

export function getToolPricing(toolName: string): ToolPricing | undefined {
  const normalized = toolName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, value] of Object.entries(PRICING)) {
    if (value.name.toLowerCase() === normalized || key === normalized) {
      return value;
    }
  }
  return undefined;
}