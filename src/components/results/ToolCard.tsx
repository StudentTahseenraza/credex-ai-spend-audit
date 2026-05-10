'use client';

interface ToolCardProps {
  name: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: {
    action: string;
    suggestedPlan?: string;
    suggestedTool?: string;
    monthlySavings: number;
    reason: string;
  };
}

const actionColors: Record<string, string> = {
  downgrade: 'text-green-700 bg-green-100',
  upgrade: 'text-yellow-700 bg-yellow-100',
  switch: 'text-blue-700 bg-blue-100',
  stay: 'text-gray-700 bg-gray-100',
  consider_credex: 'text-purple-700 bg-purple-100',
};

const actionLabels: Record<string, string> = {
  downgrade: 'Downgrade to save',
  upgrade: 'Consider upgrading',
  switch: 'Switch tool',
  stay: 'Optimized',
  consider_credex: 'Credex can help',
};

export function ToolCard({ name, currentPlan, currentSpend, recommendation }: ToolCardProps) {
  const hasSavings = recommendation.monthlySavings > 0;
  const actionKey = recommendation.action as keyof typeof actionLabels;
  
  const displayName = name === 'github-copilot' ? 'GitHub Copilot' : 
                      name === 'chatgpt' ? 'ChatGPT' :
                      name === 'claude' ? 'Claude' :
                      name === 'cursor' ? 'Cursor' :
                      name.charAt(0).toUpperCase() + name.slice(1);

  // Debug log
  console.log(`${displayName} - Current Spend: $${currentSpend}, Plan: ${currentPlan}`);

  return (
    <div className={`rounded-xl border p-4 transition-all ${hasSavings ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-gray-600">
            Current: {currentPlan} · ${currentSpend > 0 ? currentSpend : '0'}/month
          </p>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded text-sm font-medium ${actionColors[actionKey] || 'bg-gray-100'}`}>
          <span>{actionLabels[actionKey] || 'Analyzed'}</span>
        </div>
      </div>
      
      {hasSavings && (
        <div className="mt-3 p-2 bg-green-100 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-bold">Save ${recommendation.monthlySavings}/month</span>
            {recommendation.suggestedPlan && ` → Switch to ${recommendation.suggestedPlan}`}
            {recommendation.suggestedTool && ` → Switch to ${recommendation.suggestedTool}`}
          </p>
          <p className="text-xs text-green-700 mt-1">{recommendation.reason}</p>
        </div>
      )}
      
      {!hasSavings && recommendation.action === 'stay' && (
        <div className="mt-3 p-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">{recommendation.reason}</p>
        </div>
      )}
    </div>
  );
}