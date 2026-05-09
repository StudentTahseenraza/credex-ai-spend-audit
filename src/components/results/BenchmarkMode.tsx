'use client';

import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react';

interface BenchmarkModeProps {
  teamSize: number;
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  useCase: string;
}

// Industry benchmark data (based on real SaaS benchmarks)
const BENCHMARKS = {
  coding: { avgSpendPerDev: 85, topPerformer: 45, bottomPerformer: 150 },
  writing: { avgSpendPerDev: 45, topPerformer: 20, bottomPerformer: 80 },
  data: { avgSpendPerDev: 70, topPerformer: 35, bottomPerformer: 120 },
  research: { avgSpendPerDev: 60, topPerformer: 30, bottomPerformer: 110 },
  mixed: { avgSpendPerDev: 65, topPerformer: 35, bottomPerformer: 130 },
};

export function BenchmarkMode({ teamSize, totalMonthlySpend, totalMonthlySavings, useCase }: BenchmarkModeProps) {
  const [showBenchmark, setShowBenchmark] = useState(true);
  
  const spendPerDev = totalMonthlySpend / teamSize;
  const benchmark = BENCHMARKS[useCase as keyof typeof BENCHMARKS] || BENCHMARKS.mixed;
  
  let performanceLevel = '';
  let performanceColor = '';
  let recommendation = '';
  
  if (spendPerDev <= benchmark.topPerformer) {
    performanceLevel = 'Top Performer';
    performanceColor = 'text-green-600';
    recommendation = 'You\'re in the top tier! Focus on maintaining this efficiency.';
  } else if (spendPerDev <= benchmark.avgSpendPerDev) {
    performanceLevel = 'Above Average';
    performanceColor = 'text-blue-600';
    recommendation = 'Good position. Implement our recommendations to reach top performer status.';
  } else {
    performanceLevel = 'Below Average';
    performanceColor = 'text-orange-600';
    recommendation = 'Significant optimization opportunities available. Start with our top recommendations.';
  }
  
  const percentageBetter = ((benchmark.avgSpendPerDev - spendPerDev) / benchmark.avgSpendPerDev) * 100;
  const optimizedSpendPerDev = (totalMonthlySpend - totalMonthlySavings) / teamSize;

  if (!showBenchmark) return null;

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Benchmark Mode
          </h3>
          <button 
            onClick={() => setShowBenchmark(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <Users className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
            <div className="text-2xl font-bold">{teamSize}</div>
            <div className="text-xs text-gray-500">Team Size</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <DollarSign className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
            <div className="text-2xl font-bold">${spendPerDev}</div>
            <div className="text-xs text-gray-500">Spend per Developer</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <Zap className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
            <div className={`text-2xl font-bold ${performanceColor}`}>{performanceLevel}</div>
            <div className="text-xs text-gray-500">Performance</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span>Your spend per dev</span>
              <span>Industry average: ${benchmark.avgSpendPerDev}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${Math.min(100, (spendPerDev / benchmark.bottomPerformer) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>Top: ${benchmark.topPerformer}</span>
              <span>Avg: ${benchmark.avgSpendPerDev}</span>
              <span>Bottom: ${benchmark.bottomPerformer}</span>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-800">💡 {recommendation}</div>
            {totalMonthlySavings > 0 && (
              <div className="text-sm text-green-700 mt-1">
                After optimization: ${optimizedSpendPerDev.toFixed(0)}/dev (
                {percentageBetter > 0 
                  ? `${Math.abs(percentageBetter).toFixed(0)}% better than average`
                  : `${Math.abs(percentageBetter).toFixed(0)}% below average`}
                )
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}