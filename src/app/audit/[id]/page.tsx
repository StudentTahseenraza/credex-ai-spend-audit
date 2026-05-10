'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Mail } from 'lucide-react';

// Premium Components
import { SpendHealthScore } from '../../../components/dashboard/SpendHealthScore';
import { OptimizationOpportunities } from '../../../components/dashboard/OptimizationOpportunities';
import { BenchmarkInsights } from '../../../components/dashboard/BenchmarkInsights';
import { ExecutiveSummary } from '../../../components/dashboard/ExecutiveSummary';
import { SpendBreakdownChart } from '../../../components/charts/SpendBreakdownChart';
import { SavingsDonutChart } from '../../../components/charts/SavingsDonutChart';
import { AuditGenerationLoader } from '../../../components/loading/AuditGenerationLoader';
import { PDFExport } from '../../../components/results/PDFExport';
import { Button } from '../../../components/ui/button';
import { SavingsHero } from '../../../components/results/SavingsHero';
import { ToolCard } from '../../../components/results/ToolCard';
import { LeadCaptureModal } from '../../../components/results/LeadCaptureModal';

// Type definitions
interface ToolRecommendation {
  action: string;
  suggestedPlan?: string;
  suggestedTool?: string;
  monthlySavings: number;
  reason: string;
}

interface Tool {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  recommendation?: ToolRecommendation;
}

// Default recommendation when none exists
const DEFAULT_RECOMMENDATION: ToolRecommendation = {
  action: 'stay',
  monthlySavings: 0,
  reason: 'No optimization needed at this time.'
};

interface AuditData {
  shareableId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  tools: Tool[];
  aiSummary: string;
  teamSize: number;
  useCase: string;
  savedToDb?: boolean;
}

interface ChartDataItem {
  name: string;
  currentSpend: number;
  optimizedSpend: number;
  savings: number;
}

interface OptimizationTool {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  recommendation: ToolRecommendation;
}

interface ExecutiveTool {
  name: string;
  monthlySavings: number;
  currentPlan: string;
  recommendedPlan?: string;
  reason?: string;
}

export default function AuditResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  const fetchAudit = useCallback(async () => {
    try {
      const response = await fetch(`/api/audit/${id}`);

      if (response.ok) {
        const data = await response.json();
        setAudit(data);
      } else {
        const stored = localStorage.getItem('lastAuditResult');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.shareableId === id) {
            setAudit(parsed);
          } else {
            setError('Audit not found');
          }
        } else {
          setError('Audit not found');
        }
      }
    } catch (err) {
      console.error('Failed to load audit:', err);
      setError('Failed to load audit results');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    alert('Link copied! Share your audit results.');
  };

  // Calculate total current spend
  const totalCurrentSpend = audit?.tools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0) || 0;

  // Premium Loading Experience
  if (loading) {
    return <AuditGenerationLoader onComplete={() => setLoading(false)} />;
  }

  // Error state
  if (error || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Audit Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The audit you're looking for doesn't exist or has expired."}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Start New Audit
          </button>
        </motion.div>
      </div>
    );
  }

  // Prepare data for charts with safe fallbacks
  const chartData: ChartDataItem[] = audit.tools.map((tool) => ({
    name: tool.name || 'Unknown',
    currentSpend: tool.monthlySpend || 0,
    optimizedSpend: (tool.monthlySpend || 0) - (tool.recommendation?.monthlySavings || 0),
    savings: tool.recommendation?.monthlySavings || 0,
  }));

  // Prepare tools for optimization opportunities (with guaranteed recommendation)
  const optimizationTools: OptimizationTool[] = audit.tools.map((tool) => ({
    name: tool.name,
    plan: tool.plan,
    monthlySpend: tool.monthlySpend,
    seats: tool.seats,
    recommendation: tool.recommendation || DEFAULT_RECOMMENDATION,
  }));

  // Prepare tools for executive summary
  const executiveTools: ExecutiveTool[] = audit.tools.map((tool) => ({
    name: tool.name,
    monthlySavings: tool.recommendation?.monthlySavings || 0,
    currentPlan: tool.plan,
    recommendedPlan: tool.recommendation?.suggestedPlan || tool.recommendation?.suggestedTool,
    reason: tool.recommendation?.reason,
  }));

  // Calculate health score
  const calculateHealthScore = (): number => {
    const totalSpend = audit.tools.reduce((sum, t) => sum + (t.monthlySpend || 0), 0);
    if (totalSpend === 0) return 75;
    const savingsPercent = (audit.totalMonthlySavings / totalSpend) * 100;
    return Math.max(0, Math.min(100, 100 - savingsPercent));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Hero Section with Savings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SavingsHero
              monthlySavings={audit.totalMonthlySavings}
              annualSavings={audit.totalAnnualSavings}
            />
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <SpendHealthScore tools={optimizationTools} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <SpendBreakdownChart tools={chartData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <OptimizationOpportunities tools={optimizationTools} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Tool Analysis</h2>
                <div className="space-y-3">
                  {audit.tools.map((tool, idx) => (
                    <ToolCard
                      key={`${tool.name}-${idx}`}
                      name={tool.name}
                      currentPlan={tool.plan}
                      currentSpend={tool.monthlySpend || 0}
                      recommendation={tool.recommendation || DEFAULT_RECOMMENDATION}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <BenchmarkInsights
                  teamSize={audit.teamSize}
                  totalMonthlySpend={totalCurrentSpend}
                  useCase={audit.useCase}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <SavingsDonutChart
                  tools={audit.tools.map((t) => ({
                    name: t.name,
                    savings: t.recommendation?.monthlySavings || 0,
                  }))}
                  totalSavings={audit.totalMonthlySavings}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <ExecutiveSummary
                  summary={audit.aiSummary}
                  tools={executiveTools}
                  totalSavings={audit.totalMonthlySavings}
                  healthScore={calculateHealthScore()}
                  teamSize={audit.teamSize}
                />
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <PDFExport audit={audit} />
            <Button variant="outline" onClick={handleShare} className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button onClick={() => setShowLeadCapture(true)} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          </motion.div>

          {/* High Savings Alert */}
          {audit.totalMonthlySavings > 500 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">High Savings Detected!</h3>
                  <p className="text-sm text-purple-700">
                    You're saving over $500/month with our recommendations.
                    A Credex specialist will reach out within 24 hours to help you capture
                    even more through discounted AI credits (additional 20-30% savings).
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer Note */}
          {!audit.savedToDb && (
            <div className="p-3 bg-yellow-50 rounded-xl text-center text-sm text-yellow-700 border border-yellow-200">
              ⚡ Demo mode: Results shown but not saved. Add MONGODB_URI to enable persistence.
            </div>
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadCapture && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowLeadCapture(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
            >
              Close
            </button>
            <LeadCaptureModal
              auditId={audit.shareableId}
              savingsAmount={audit.totalMonthlySavings}
              onClose={() => setShowLeadCapture(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}