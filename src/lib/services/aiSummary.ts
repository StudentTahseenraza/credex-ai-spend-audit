const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

interface AuditDataForSummary {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  tools: Array<{
    name: string;
    action: string;
    suggestedPlan?: string;
    suggestedTool?: string;
    monthlySavings: number;
  }>;
  useCase: string;
  teamSize: number;
}

function generateFallbackSummary(data: AuditDataForSummary): string {
  if (data.totalMonthlySavings === 0) {
    return `Your AI stack is already optimized. You're spending efficiently for a team of ${data.teamSize} focused on ${data.useCase}. No changes recommended at this time.`;
  }

  const topSavingTool = data.tools.sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  return `Based on your ${data.useCase}-focused team of ${data.teamSize}, we found $${data.totalMonthlySavings}/month in potential savings ($${data.totalAnnualSavings}/year). The biggest opportunity: ${topSavingTool.name} - ${topSavingTool.action} to ${topSavingTool.suggestedPlan || topSavingTool.suggestedTool} saves $${topSavingTool.monthlySavings}/month. ${data.totalMonthlySavings > 500 ? 'Given your spend, Credex credits could unlock additional savings.' : 'Your stack shows room for optimization.'}`;
}

export async function generateAISummary(data: AuditDataForSummary): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    console.warn('OpenRouter API key missing. Using fallback summary.');
    return generateFallbackSummary(data);
  }

  const prompt = `You are an AI spending auditor for startups. Analyze this AI tool spending report and write a 100-word personalized summary.

Report:
- Team size: ${data.teamSize}
- Primary use case: ${data.useCase}
- Total monthly savings found: $${data.totalMonthlySavings}
- Total annual savings: $${data.totalAnnualSavings}
- Per-tool breakdown:
${data.tools.map((t) => `  - ${t.name}: ${t.action} → saves $${t.monthlySavings}/month`).join('\n')}

Write a professional, actionable 100-word summary. Be specific about recommendations. End with a forward-looking statement.`;

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content;

    if (summary && summary.length > 0) {
      return summary.slice(0, 600); // Cap at 600 chars (~100 words)
    }

    throw new Error('Empty response from OpenRouter');
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return generateFallbackSummary(data);
  }
}