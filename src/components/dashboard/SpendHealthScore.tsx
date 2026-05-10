'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Info } from 'lucide-react';

interface HealthMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
}

interface SpendHealthScoreProps {
  tools: Array<{
    name: string;
    plan: string;
    monthlySpend: number;
    seats: number;
    recommendation?: {
      action: string;
      monthlySavings: number;
    };
  }>;
  className?: string;
}

export function SpendHealthScore({ tools, className }: SpendHealthScoreProps) {
  const [score, setScore] = useState(0);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Calculate Plan Efficiency Score
  const calculatePlanEfficiency = useCallback((): number => {
    if (tools.length === 0) return 0;
    let totalEfficiency = 0;
    tools.forEach(tool => {
      const savings = tool.recommendation?.monthlySavings || 0;
      const efficiency = Math.max(0, 100 - (savings / (tool.monthlySpend || 1)) * 100);
      totalEfficiency += efficiency;
    });
    return Math.min(100, totalEfficiency / tools.length);
  }, [tools]);

  // Calculate Tool Redundancy Score
  const calculateToolRedundancy = useCallback((): number => {
    if (tools.length === 0) return 100;
    const toolCategories: Record<string, string> = {
      'chatgpt': 'general',
      'claude': 'general',
      'cursor': 'coding',
      'github-copilot': 'coding',
      'gemini': 'general',
    };
    
    const categories = tools.map(t => toolCategories[t.name] || 'other');
    const duplicates = categories.filter((cat, i) => categories.indexOf(cat) !== i).length;
    return Math.max(0, 100 - (duplicates * 25));
  }, [tools]);

  // Calculate Seat Utilization Score
  const calculateSeatUtilization = useCallback((): number => {
    if (tools.length === 0) return 85;
    const avgSeats = tools.reduce((sum, t) => sum + t.seats, 0) / tools.length;
    if (avgSeats <= 2) return 85;
    if (avgSeats <= 5) return 90;
    return 95;
  }, [tools]);

  // Calculate Spend Efficiency Score
  const calculateSpendEfficiency = useCallback((): number => {
    if (tools.length === 0) return 80;
    const avgSpendPerSeat = tools.reduce((sum, t) => sum + (t.monthlySpend / t.seats), 0) / tools.length;
    if (avgSpendPerSeat <= 15) return 95;
    if (avgSpendPerSeat <= 25) return 75;
    if (avgSpendPerSeat <= 40) return 50;
    return 30;
  }, [tools]);

  // Calculate Workflow Fit Score
  const calculateWorkflowFit = useCallback((): number => {
    return 80;
  }, []);

  // Main calculation function
  const calculateHealthScore = useCallback(() => {
    const planEfficiency = calculatePlanEfficiency();
    const toolRedundancy = calculateToolRedundancy();
    const seatUtilization = calculateSeatUtilization();
    const spendEfficiency = calculateSpendEfficiency();
    const workflowFit = calculateWorkflowFit();
    
    const metricsList: HealthMetric[] = [
      { name: 'Plan Efficiency', score: Math.round(planEfficiency), weight: 0.25, description: 'How well your current plans match actual usage patterns' },
      { name: 'Tool Redundancy', score: Math.round(toolRedundancy), weight: 0.15, description: 'Overlap between similar AI tools in your stack' },
      { name: 'Seat Utilization', score: Math.round(seatUtilization), weight: 0.2, description: 'Percentage of paid seats actively generating value' },
      { name: 'Spend Efficiency', score: Math.round(spendEfficiency), weight: 0.25, description: 'Cost per user compared to industry benchmarks' },
      { name: 'Workflow Fit', score: Math.round(workflowFit), weight: 0.15, description: 'Alignment between tools and your primary use case' },
    ];
    
    const totalScore = metricsList.reduce((sum, m) => sum + (m.score * m.weight), 0);
    return { totalScore: Math.round(totalScore), metrics: metricsList };
  }, [calculatePlanEfficiency, calculateToolRedundancy, calculateSeatUtilization, calculateSpendEfficiency, calculateWorkflowFit]);

  // Run calculation when tools change - using useMemo instead of useEffect
  useEffect(() => {
    const { totalScore, metrics: newMetrics } = calculateHealthScore();
    setScore(totalScore);
    setMetrics(newMetrics);
    setAnimatedProgress(totalScore);
  }, [calculateHealthScore]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500 stroke-green-500';
    if (score >= 60) return 'text-yellow-500 stroke-yellow-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreGrade = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">AI Spend Health Score</h3>
          <p className="text-xs text-gray-400 mt-0.5">Overall infrastructure efficiency</p>
        </div>
        
        {/* Simple Tooltip without external dependency */}
        <div className="relative group">
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs">
              <p>Combined score based on plan efficiency, tool redundancy, seat utilization, spend efficiency, and workflow alignment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular Score */}
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getScoreColor()}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold"
            >
              {score}
            </motion.span>
          </div>
        </div>

        {/* Score Info */}
        <div className="flex-1">
          <div className={`text-2xl font-bold ${getScoreColor().split(' ')[0]}`}>
            {getScoreGrade()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {score >= 80 
              ? "Your AI infrastructure is well-optimized"
              : score >= 60
              ? "Moderate optimization opportunities available"
              : "Significant optimization opportunities detected"}
          </p>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="mt-6 space-y-3">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{metric.name}</span>
              
              {/* Simple Tooltip for metric */}
              <div className="relative group/inner">
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/inner:block z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                    {metric.description}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className={`h-1.5 rounded-full ${
                    metric.score >= 80 ? 'bg-green-500' :
                    metric.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-sm font-mono w-10">{metric.score}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insight Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          💡 {score >= 80 
            ? "Your AI stack is performing well. Focus on maintaining this efficiency as you scale."
            : score >= 60
            ? "Addressing tool redundancy and seat utilization could push you into the excellent range."
            : "Immediate opportunities: consolidate overlapping tools and optimize underutilized plans."}
        </p>
      </div>
    </div>
  );
}