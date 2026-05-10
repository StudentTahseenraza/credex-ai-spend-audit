'use client';

import { TrendingDown } from 'lucide-react';

interface SavingsHeroProps {
  monthlySavings: number;
  annualSavings: number;
}

export function SavingsHero({ monthlySavings, annualSavings }: SavingsHeroProps) {
  const hasSavings = monthlySavings > 0;

  if (!hasSavings) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <TrendingDown className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Your AI Stack Is Optimized
        </h1>
        <p className="text-xl text-gray-600 mt-3">
          You&apos;re spending efficiently. No major changes needed.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
        <TrendingDown className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
        Save ${monthlySavings}/month
      </h1>
      <p className="text-xl text-gray-600 mt-2">
        That&apos;s <span className="font-bold text-green-600">${annualSavings}/year</span> in potential savings
      </p>
      <p className="text-sm text-gray-500 mt-4">
        Based on your team of {monthlySavings > 0 ? 'actual' : ''} usage patterns
      </p>
    </div>
  );
}