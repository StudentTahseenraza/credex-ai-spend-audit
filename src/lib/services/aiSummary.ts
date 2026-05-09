// AI Summary Service with GPT-3.5 Turbo via OpenRouter

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

// Fallback summary (used when API fails or rate limited)
function generateFallbackSummary(data: AuditDataForSummary): string {
  if (data.totalMonthlySavings === 0) {
    return `Your AI stack is already optimized. You're spending efficiently for a team of ${data.teamSize} focused on ${data.useCase}. No changes recommended at this time.`;
  }

  const topTool = data.tools.sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const savingsPercent = Math.round((topTool.monthlySavings / (topTool.monthlySavings + 10)) * 100);
  
  let summary = `Based on your ${data.useCase}-focused team of ${data.teamSize}, `;
  summary += `we found $${data.totalMonthlySavings}/month in potential savings ($${data.totalAnnualSavings}/year). `;
  summary += `The biggest opportunity: ${topTool.name} - `;
  
  if (topTool.action === 'downgrade') {
    summary += `downgrading to ${topTool.suggestedPlan} saves $${topTool.monthlySavings}/month (${savingsPercent}% reduction). `;
  } else if (topTool.action === 'switch') {
    summary += `switching to ${topTool.suggestedTool} saves $${topTool.monthlySavings}/month. `;
  } else {
    summary += `optimizing your current setup saves $${topTool.monthlySavings}/month. `;
  }
  
  if (data.totalMonthlySavings > 500) {
    summary += `Given your significant spend, Credex credits could unlock an additional 20% savings. `;
  }
  
  summary += `We recommend reviewing your ${data.tools.filter(t => t.monthlySavings > 0).length} tool${data.tools.filter(t => t.monthlySavings > 0).length !== 1 ? 's' : ''} for immediate savings.`;
  
  return summary;
}

// Generate prompt for GPT-3.5 Turbo
function buildPrompt(data: AuditDataForSummary): string {
  const toolsList = data.tools.map(t => {
    let recommendation = '';
    if (t.action === 'downgrade') {
      recommendation = `downgrade from current plan to ${t.suggestedPlan}`;
    } else if (t.action === 'switch') {
      recommendation = `switch to ${t.suggestedTool}`;
    } else if (t.action === 'stay') {
      recommendation = `already optimized`;
    } else {
      recommendation = `consider Credex for additional savings`;
    }
    return `- ${t.name}: ${recommendation} (save $${t.monthlySavings}/month)`;
  }).join('\n');

  return `You are an AI spending auditor for startups. Analyze this AI tool spending report and write a 100-word personalized summary.

REPORT:
Team size: ${data.teamSize}
Primary use case: ${data.useCase}
Total monthly savings found: $${data.totalMonthlySavings}
Total annual savings: $${data.totalAnnualSavings}

Per-tool breakdown:
${toolsList}

INSTRUCTIONS:
Write a professional, actionable 100-word summary. Be specific about recommendations. Use a helpful, analytical tone. End with a forward-looking statement about optimizing AI costs.

SUMMARY:`;
}

export async function generateAISummary(data: AuditDataForSummary): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

  // If no API key, use fallback immediately
  if (!apiKey) {
    console.log('No OpenRouter API key, using fallback summary');
    return generateFallbackSummary(data);
  }

  const prompt = buildPrompt(data);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Credex AI Spend Audit',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI spending auditor for startups. Provide concise, actionable advice about AI tool costs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000),
    });

    // Handle rate limiting (429) gracefully
    if (response.status === 429) {
      console.log('Rate limited by OpenRouter, using fallback summary');
      return generateFallbackSummary(data);
    }

    if (!response.ok) {
      console.error(`OpenRouter API error: ${response.status}`);
      return generateFallbackSummary(data);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content;

    if (summary && summary.length > 0) {
      // Limit to ~150 words (900 chars)
      const trimmedSummary = summary.slice(0, 900);
      console.log('✅ AI summary generated successfully');
      return trimmedSummary;
    }

    throw new Error('Empty response from API');
    
  } catch (error) {
    // Handle timeout or other errors
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        console.log('AI request timeout, using fallback summary');
      } else {
        console.error('AI summary generation failed:', error.message);
      }
    }
    return generateFallbackSummary(data);
  }
}