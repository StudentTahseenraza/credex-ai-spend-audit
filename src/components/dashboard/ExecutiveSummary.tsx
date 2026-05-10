'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Sparkles, Target, ArrowRight } from 'lucide-react';
import { ImplementationPlan } from './ImplementationPlan';

interface ExecutiveSummaryProps {
  summary: string;
  tools: Array<{
    name: string;
    monthlySavings: number;
    currentPlan?: string;
    recommendedPlan?: string;
    reason?: string;
  }>;
  totalSavings: number;
  healthScore?: number;
  teamSize?: number;
  className?: string;
}

export function ExecutiveSummary({ summary, tools, totalSavings, healthScore, teamSize = 1, className }: ExecutiveSummaryProps) {
  const [showImplementationPlan, setShowImplementationPlan] = useState(false);

  // Calculate ROI
  const estimatedAnnualSavings = totalSavings * 12;
  const roi = Math.min(85, Math.floor((estimatedAnnualSavings / 100) * 10));

  // Prepare tools for implementation plan
  const planTools = tools.map(tool => ({
    name: tool.name,
    currentPlan: tool.currentPlan || 'Current',
    recommendedPlan: tool.recommendedPlan,
    monthlySavings: tool.monthlySavings,
    reason: tool.reason || 'Optimization opportunity detected'
  }));

  return (
    <>
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
            {summary}
          </motion.p>

          {/* Insight Tags */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-500">Annual Impact:</span>
              <span className="text-xs font-medium text-gray-900">${estimatedAnnualSavings}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs text-gray-500">Recommendations:</span>
              <span className="text-xs font-medium text-gray-900">{tools.filter(t => t.monthlySavings > 0).length}</span>
            </div>
            {healthScore && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-xs text-gray-500">Health Score:</span>
                <span className="text-xs font-medium text-gray-900">{healthScore}/100</span>
              </div>
            )}
          </div>

          {/* ROI and CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Estimated annual ROI: {roi}%</span>
            </div>
            <button
              onClick={() => setShowImplementationPlan(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group"
            >
              View Implementation Plan
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Implementation Plan Modal */}
      <ImplementationPlan
        isOpen={showImplementationPlan}
        onClose={() => setShowImplementationPlan(false)}
        tools={planTools}
        totalSavings={totalSavings}
        teamSize={teamSize}
      />
    </>
  );
}