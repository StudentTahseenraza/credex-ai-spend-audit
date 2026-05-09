'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { SavingsHero } from '../../../components/results/SavingsHero';
import { ToolCard } from '../../../components/results/ToolCard';
import { AISummary } from '../../../components/results/AISummary';
// import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface AuditData {
  shareableId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  tools: any[];
  aiSummary: string;
  savedToDb?: boolean;
}

export default function AuditResultPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    try {
      // Try to fetch from API
      const response = await fetch(`/api/audit/${id}`);

      if (response.ok) {
        const data = await response.json();
        setAudit(data);
      } else {
        // Fallback to localStorage
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

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied! Share your audit results.');
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your audit results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Audit Not Found</h1>
          <p className="text-gray-600">{error || "The audit you're looking for doesn't exist."}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Audit
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <SavingsHero
            monthlySavings={audit.totalMonthlySavings}
            annualSavings={audit.totalAnnualSavings}
          />

          <div>
            <h2 className="text-2xl font-semibold mb-4">Per-Tool Analysis</h2>
            <div className="space-y-3">
              {audit.tools.map((tool, idx) => (
                <ToolCard
                  key={`${tool.name}-${idx}`}
                  name={tool.name}
                  currentPlan={tool.plan}
                  currentSpend={tool.monthlySpend || 0}  // Make sure this has value
                  recommendation={tool.recommendation}
                />
              ))}
            </div>
          </div>

          {audit.aiSummary && <AISummary summary={audit.aiSummary} />}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Results
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Audit
            </button>
          </div>

          {audit.totalMonthlySavings > 500 && (
            <div className="p-4 bg-purple-100 rounded-lg text-center">
              <p className="text-purple-800">
                💰 <strong>High savings detected!</strong> Credex can help you capture even more through discounted AI credits.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}