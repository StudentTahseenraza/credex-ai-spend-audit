'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { AlertCircle, TrendingDown, Zap, ChevronDown, Target, Clock } from 'lucide-react';

interface Optimization {
  id: string;
  title: string;
  description: string;
  savings: number;
  impact: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'complex';
  icon: React.ReactNode;
}

interface OptimizationOpportunitiesProps {
  tools: Array<{
    name: string;
    plan: string;
    seats: number;
    monthlySpend: number;
    recommendation?: {
      action: string;
      suggestedPlan?: string;
      monthlySavings: number;
      reason: string;
    };
  }>;
  className?: string;
}

export function OptimizationOpportunities({ tools, className }: OptimizationOpportunitiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generateOptimizations = (): Optimization[] => {
    const optimizations: Optimization[] = [];

    tools.forEach(tool => {
      if (tool.recommendation?.monthlySavings && tool.recommendation.monthlySavings > 0) {
        const savings = tool.recommendation.monthlySavings;
        optimizations.push({
          id: tool.name,
          title: `Optimize ${tool.name.charAt(0).toUpperCase() + tool.name.slice(1)} Plan`,
          description: tool.recommendation.reason,
          savings: savings,
          impact: savings > 40 ? 'high' : savings > 20 ? 'medium' : 'low',
          confidence: tool.seats <= 5 ? 'high' : 'medium',
          effort: tool.recommendation.action === 'downgrade' ? 'easy' : 'medium',
          icon: <TrendingDown className="h-4 w-4" />,
        });
      }
    });

    // Add seat consolidation opportunity
    const totalSeats = tools.reduce((sum, t) => sum + t.seats, 0);
    const avgSeats = totalSeats / tools.length;
    if (avgSeats > 2 && tools.length > 1) {
      optimizations.push({
        id: 'seats',
        title: 'Consolidate Underutilized Seats',
        description: `You have ${totalSeats} total seats across ${tools.length} tools. Consider consolidating usage under fewer premium licenses and moving occasional users to pay-as-you-go.`,
        savings: totalSeats * 8,
        impact: 'medium',
        confidence: 'high',
        effort: 'easy',
        icon: <Users className="h-4 w-4" />,
      });
    }

    // Add tool overlap detection
    const hasChatGPT = tools.some(t => t.name === 'chatgpt');
    const hasClaude = tools.some(t => t.name === 'claude');
    if (hasChatGPT && hasClaude) {
      optimizations.push({
        id: 'overlap',
        title: 'Reduce Tool Overlap',
        description: 'ChatGPT and Claude have significant feature overlap for your use case. Standardizing on one platform could reduce complexity and save on redundant subscriptions.',
        savings: 25,
        impact: 'medium',
        confidence: 'medium',
        effort: 'medium',
        icon: <Zap className="h-4 w-4" />,
      });
    }

    return optimizations.sort((a, b) => b.savings - a.savings);
  };

  const optimizations = generateOptimizations();
  const totalSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <Target className="h-3 w-3 text-green-600" />;
      case 'medium': return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  if (optimizations.length === 0) return null;

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Optimization Opportunities</h3>
            <p className="text-sm text-gray-500 mt-1">
              {optimizations.length} opportunities identified · ${totalSavings}/month potential savings
            </p>
          </div>
          <div className="px-3 py-1 bg-green-50 rounded-full">
            <span className="text-xs font-medium text-green-700">Priority: High</span>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="divide-y divide-gray-100">
        {optimizations.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(expandedId === opt.id ? null : opt.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getImpactColor(opt.impact)}`}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {opt.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{opt.description}</p>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        {getConfidenceIcon(opt.confidence)}
                        <span className="text-xs text-gray-500 capitalize">{opt.confidence} confidence</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 capitalize">{opt.effort} implementation</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${opt.savings}</div>
                    <div className="text-xs text-gray-500">/month savings</div>
                  </div>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-gray-400 transition-transform",
                    expandedId === opt.id && "transform rotate-180"
                  )} />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === opt.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Implementation Steps:</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            Review current {opt.id === 'seats' ? 'seat allocation per tool' : `${opt.title.toLowerCase()} usage`}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            {opt.effort === 'easy' 
                              ? 'Adjust subscription settings in vendor dashboard'
                              : 'Contact vendor support to modify plan'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            Monitor impact for 30 days and adjust as needed
                          </li>
                        </ul>
                        
                        {opt.confidence === 'high' && (
                          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                            ✓ High-confidence recommendation based on your usage patterns
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Estimated annual savings</p>
            <p className="text-2xl font-bold text-blue-900">${totalSavings * 12}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Apply All Optimizations
          </button>
        </div>
      </div>
    </div>
  );
}

// Import missing icon
import { Users } from 'lucide-react';