'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Sparkles, TrendingDown, Target, Zap } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: string;
  tools: Array<{
    name: string;
    monthlySavings: number;
  }>;
  totalSavings: number;
  healthScore?: number;
  className?: string;
}

export function ExecutiveSummary({ summary, tools, totalSavings, healthScore, className }: ExecutiveSummaryProps) {
  // Enhance the AI summary with executive-level context if needed
  const enhancedSummary = summary.length < 100 
    ? generateEnhancedSummary(tools, totalSavings, healthScore)
    : summary;

  function generateEnhancedSummary(tools: any[], totalSavings: number, healthScore?: number): string {
    const topSavingTool = tools.sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    
    let enhanced = `Strategic Audit Summary: `;
    
    if (totalSavings > 0) {
      enhanced += `Your ${tools.length}-tool AI infrastructure shows $${totalSavings}/month in optimization opportunities ($${totalSavings * 12}/year annualized). `;
      enhanced += `The highest-impact adjustment is ${topSavingTool?.name}, which can be optimized to save $${topSavingTool?.monthlySavings}/month. `;
    } else {
      enhanced += `Your current AI tooling strategy is well-optimized for your team size and use case. `;
    }
    
    if (healthScore) {
      enhanced += `Your overall AI Health Score of ${healthScore}/100 indicates `;
      enhanced += healthScore >= 80 ? `best-in-class infrastructure management. ` : `room for strategic improvement. `;
    }
    
    enhanced += `Recommendation: Implement a quarterly audit cadence and leverage usage analytics to continuously validate ROI as your team scales.`;
    
    return enhanced;
  }

  const insightTags = [
    { label: 'Operational Efficiency', value: totalSavings > 0 ? 'Optimizable' : 'Optimized' },
    { label: 'Annual Impact', value: `$${totalSavings * 12}` },
    { label: 'Recommendation Count', value: tools.filter(t => t.monthlySavings > 0).length.toString() },
  ];

  return (
    <div className={cn("bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 overflow-hidden", className)}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Executive Summary</h3>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI-Generated</span>
        </div>

        {/* Summary Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-700 leading-relaxed mb-6"
        >
          {enhancedSummary}
        </motion.p>

        {/* Insight Tags */}
        <div className="flex gap-4 mb-4">
          {insightTags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-500">{tag.label}:</span>
              <span className="text-xs font-medium text-gray-900">{tag.value}</span>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {totalSavings > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Estimated annual ROI: {Math.min(85, Math.floor((totalSavings * 12) / 100))}%</span>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View Implementation Plan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}