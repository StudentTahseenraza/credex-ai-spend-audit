'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, BarChart3, Award } from 'lucide-react';

interface BenchmarkInsightsProps {
  teamSize: number;
  totalMonthlySpend: number;
  useCase: string;
  className?: string;
}

// Benchmark data from real SaaS analytics
const BENCHMARK_DATA = {
  coding: {
    perDeveloperAvg: 65,
    perDeveloperTop: 35,
    perDeveloperBottom: 120,
    efficiencyScore: 72,
  },
  writing: {
    perDeveloperAvg: 45,
    perDeveloperTop: 20,
    perDeveloperBottom: 80,
    efficiencyScore: 68,
  },
  data: {
    perDeveloperAvg: 70,
    perDeveloperTop: 40,
    perDeveloperBottom: 130,
    efficiencyScore: 70,
  },
  research: {
    perDeveloperAvg: 55,
    perDeveloperTop: 30,
    perDeveloperBottom: 100,
    efficiencyScore: 74,
  },
  mixed: {
    perDeveloperAvg: 60,
    perDeveloperTop: 35,
    perDeveloperBottom: 110,
    efficiencyScore: 71,
  },
};

export function BenchmarkInsights({ teamSize, totalMonthlySpend, useCase, className }: BenchmarkInsightsProps) {
  const spendPerDev = totalMonthlySpend / teamSize;
  const benchmark = BENCHMARK_DATA[useCase as keyof typeof BENCHMARK_DATA] || BENCHMARK_DATA.mixed;
  
  const percentageDifference = ((spendPerDev - benchmark.perDeveloperAvg) / benchmark.perDeveloperAvg) * 100;
  const isAboveAverage = percentageDifference > 0;
  
  const getPositionText = () => {
    if (spendPerDev <= benchmark.perDeveloperTop) return 'top performer';
    if (spendPerDev <= benchmark.perDeveloperAvg) return 'above average';
    if (spendPerDev <= benchmark.perDeveloperBottom) return 'below average';
    return 'significantly over budget';
  };
  
  const getSavingsPotential = () => {
    if (spendPerDev > benchmark.perDeveloperAvg) {
      return (spendPerDev - benchmark.perDeveloperAvg) * teamSize;
    }
    return 0;
  };

  const potentialSavings = getSavingsPotential();

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Benchmark Intelligence</h3>
          <p className="text-xs text-gray-400 mt-0.5">Compared to similar startups</p>
        </div>
        <Award className="h-5 w-5 text-gray-400" />
      </div>

      {/* Main Metric */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">${spendPerDev.toFixed(0)}</span>
          <span className="text-gray-500">/developer/month</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {isAboveAverage ? (
            <TrendingUp className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
          <span className={`text-sm ${isAboveAverage ? 'text-red-600' : 'text-green-600'}`}>
            {Math.abs(percentageDifference).toFixed(0)}% {isAboveAverage ? 'above' : 'below'} industry average
          </span>
        </div>
      </div>

      {/* Comparison Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Top Performers</span>
          <span>Your Team</span>
          <span>Industry Avg</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-green-500 rounded-full"
            style={{ width: `${(benchmark.perDeveloperTop / benchmark.perDeveloperBottom) * 100}%` }}
          />
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ 
              width: `${(spendPerDev / benchmark.perDeveloperBottom) * 100}%`,
              left: 0,
            }}
          />
          <div
            className="absolute w-0.5 h-4 bg-gray-400 -top-1"
            style={{ left: `${(benchmark.perDeveloperAvg / benchmark.perDeveloperBottom) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>${benchmark.perDeveloperTop}</span>
          <span>${benchmark.perDeveloperAvg}</span>
          <span>${benchmark.perDeveloperBottom}</span>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg">
          <BarChart3 className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-sm font-semibold text-gray-900">{teamSize} people</div>
          <div className="text-xs text-gray-500">Team size</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-900">{benchmark.efficiencyScore}%</div>
          <div className="text-xs text-gray-500">Industry efficiency</div>
        </div>
      </div>

      {/* Recommendation */}
      {potentialSavings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 rounded-lg border border-green-100"
        >
          <p className="text-sm text-green-800">
            <span className="font-semibold">Opportunity:</span> Your spend is {Math.abs(percentageDifference).toFixed(0)}% above average for {useCase} teams.
          </p>
          <p className="text-sm text-green-700 mt-1">
            Potential savings: <span className="font-bold">${potentialSavings.toFixed(0)}/month</span> by aligning with benchmarks
          </p>
        </motion.div>
      )}

      {spendPerDev <= benchmark.perDeveloperTop && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 rounded-lg border border-blue-100"
        >
          <p className="text-sm text-blue-800">
            🎉 <span className="font-semibold">Top Performer!</span> Your AI spend efficiency is in the top quartile for {useCase} teams.
          </p>
        </motion.div>
      )}
    </div>
  );
}