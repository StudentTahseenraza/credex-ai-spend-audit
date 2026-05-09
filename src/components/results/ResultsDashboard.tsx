'use client';

import { useState } from 'react';
import { SavingsHero } from './SavingsHero';
import { ToolCard } from './ToolCard';
import { AISummary } from './AISummary';
import { SavingsChart } from './SavingsChart';
import { LeadCaptureModal } from './LeadCaptureModal';
import { Button } from '../../components/ui/button';
import { Share2, FileText } from 'lucide-react';

interface ToolRecommendation {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  recommendation: {
    action: string;
    suggestedPlan?: string;
    suggestedTool?: string;
    monthlySavings: number;
    reason: string;
  };
}

interface ResultsDashboardProps {
  audit: {
    shareableId: string;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    tools: ToolRecommendation[];
    aiSummary: string;
    teamSize: number;
    useCase: string;
  };
}

export function ResultsDashboard({ audit }: ResultsDashboardProps) {
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied! Share your audit results.');
  };

  // Calculate data for charts
  const totalCurrentSpend = audit.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalRecommendedSpend = audit.tools.reduce((sum, t) => sum + (t.monthlySpend - t.recommendation.monthlySavings), 0);
  
  const chartData = audit.tools.map(tool => ({
    name: tool.name,
    currentSpend: tool.monthlySpend,
    recommendedSpend: tool.monthlySpend - tool.recommendation.monthlySavings,
    monthlySavings: tool.recommendation.monthlySavings,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero savings section */}
      <SavingsHero 
        monthlySavings={audit.totalMonthlySavings}
        annualSavings={audit.totalAnnualSavings}
      />
      
      {/* Charts Section - NEW */}
      {(audit.totalMonthlySavings > 0 || chartData.length > 0) && (
        <SavingsChart 
          tools={chartData}
          totalCurrentSpend={totalCurrentSpend}
          totalRecommendedSpend={totalRecommendedSpend}
        />
      )}
      
      {/* Per-tool breakdown */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Per-Tool Analysis</h2>
        <div className="space-y-3">
          {audit.tools.map((tool, idx) => (
            <ToolCard
              key={idx}
              name={tool.name}
              currentPlan={tool.plan}
              currentSpend={tool.monthlySpend}
              recommendation={tool.recommendation}
            />
          ))}
        </div>
      </div>
      
      {/* AI Summary */}
      {audit.aiSummary && <AISummary summary={audit.aiSummary} />}
      
      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={handleShare} className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        <Button onClick={() => setShowLeadCapture(true)} className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Get Full Report
        </Button>
      </div>
      
      {/* Lead capture modal */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowLeadCapture(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-200"
            >
              ✕ Close
            </button>
            <LeadCaptureModal 
              auditId={audit.shareableId}
              savingsAmount={audit.totalMonthlySavings}
              onClose={() => setShowLeadCapture(false)}
            />
          </div>
        </div>
      )}
      
      {/* Footer note */}
      {audit.totalMonthlySavings > 500 && (
        <div className="p-4 bg-purple-100 rounded-lg text-center">
          <p className="text-purple-800">
            💰 <strong>High savings detected!</strong> Credex can help you capture even more through discounted AI credits.
          </p>
        </div>
      )}
    </div>
  );
}