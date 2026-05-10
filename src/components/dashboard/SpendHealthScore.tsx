'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

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
  const controls = useAnimation();

  useEffect(() => {
    calculateHealthScore();
  }, [tools]);

  const calculateHealthScore = () => {
    // Plan Efficiency Score
    const planEfficiency = calculatePlanEfficiency();
    
    // Tool Redundancy Score
    const toolRedundancy = calculateToolRedundancy();
    
    // Seat Utilization Score
    const seatUtilization = calculateSeatUtilization();
    
    // Spend Efficiency Score
    const spendEfficiency = calculateSpendEfficiency();
    
    // Workflow Fit Score
    const workflowFit = calculateWorkflowFit();
    
    const metricsList: HealthMetric[] = [
      { name: 'Plan Efficiency', score: planEfficiency, weight: 0.25, description: 'How well your current plans match actual usage patterns' },
      { name: 'Tool Redundancy', score: toolRedundancy, weight: 0.15, description: 'Overlap between similar AI tools in your stack' },
      { name: 'Seat Utilization', score: seatUtilization, weight: 0.2, description: 'Percentage of paid seats actively generating value' },
      { name: 'Spend Efficiency', score: spendEfficiency, weight: 0.25, description: 'Cost per user compared to industry benchmarks' },
      { name: 'Workflow Fit', score: workflowFit, weight: 0.15, description: 'Alignment between tools and your primary use case' },
    ];
    
    const totalScore = metricsList.reduce((sum, m) => sum + (m.score * m.weight), 0);
    setScore(Math.round(totalScore));
    setMetrics(metricsList);
    
    // Animate score
    controls.start({ value: totalScore, transition: { duration: 1.5, ease: "easeOut" } });
  };

  const calculatePlanEfficiency = (): number => {
    let totalEfficiency = 0;
    tools.forEach(tool => {
      const savings = tool.recommendation?.monthlySavings || 0;
      const efficiency = Math.max(0, 100 - (savings / (tool.monthlySpend || 1)) * 100);
      totalEfficiency += efficiency;
    });
    return Math.min(100, totalEfficiency / (tools.length || 1));
  };

  const calculateToolRedundancy = (): number => {
    const toolCategories = {
      'chatgpt': 'general',
      'claude': 'general',
      'cursor': 'coding',
      'github-copilot': 'coding',
      'gemini': 'general',
    };
    
    const categories = tools.map(t => toolCategories[t.name as keyof typeof toolCategories] || 'other');
    const duplicates = categories.filter((cat, i) => categories.indexOf(cat) !== i).length;
    return Math.max(0, 100 - (duplicates * 25));
  };

  const calculateSeatUtilization = (): number => {
    // Assume 80% utilization for small teams, 90% for larger
    const avgSeats = tools.reduce((sum, t) => sum + t.seats, 0) / tools.length;
    if (avgSeats <= 2) return 85;
    if (avgSeats <= 5) return 90;
    return 95;
  };

  const calculateSpendEfficiency = (): number => {
    const avgSpendPerSeat = tools.reduce((sum, t) => sum + (t.monthlySpend / t.seats), 0) / tools.length;
    if (avgSpendPerSeat <= 15) return 95;
    if (avgSpendPerSeat <= 25) return 75;
    if (avgSpendPerSeat <= 40) return 50;
    return 30;
  };

  const calculateWorkflowFit = (): number => {
    // Based on tool type vs use case (simplified)
    return 80;
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
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
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">AI Spend Health Score</h3>
          <p className="text-xs text-gray-400 mt-0.5">Overall infrastructure efficiency</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">Combined score based on plan efficiency, tool redundancy, seat utilization, spend efficiency, and workflow alignment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold"
            >
              {score}
            </motion.span>
          </div>
        </div>

        {/* Score Info */}
        <div className="flex-1">
          <div className={`text-2xl font-bold ${getScoreColor()}`}>
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{metric.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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