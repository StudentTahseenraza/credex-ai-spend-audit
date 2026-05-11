'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Clock, 
  TrendingDown, 
  Zap,
  AlertCircle,
  ArrowRight,
  Download,
  Share2,
  Calendar
} from 'lucide-react';

interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  action: string;
  effort: 'easy' | 'medium' | 'complex';
  timeline: string;
  savings: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface ImplementationPlanProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Array<{
    name: string;
    currentPlan: string;
    recommendedPlan?: string;
    monthlySavings: number;
    reason: string;
  }>;
  totalSavings: number;
  teamSize: number;
}

export function ImplementationPlan({ isOpen, onClose, tools, totalSavings, teamSize }: ImplementationPlanProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Generate implementation steps based on audit results
  const generateSteps = (): ImplementationStep[] => {
    const steps: ImplementationStep[] = [];

    // Step 1: Review current subscriptions
    steps.push({
      id: 'review',
      title: 'Audit Current Subscriptions',
      description: 'Review all active AI tool subscriptions and identify unused or underutilized licenses.',
      action: `Log into each vendor dashboard and export your current subscription list for ${tools.length} tools.`,
      effort: 'easy',
      timeline: '1 hour',
      savings: 0,
      status: 'pending'
    });

    // Add steps for each tool with savings
    tools.forEach((tool) => {
      if (tool.monthlySavings > 0) {
        steps.push({
          id: `tool-${tool.name}`,
          title: `Optimize ${tool.name.charAt(0).toUpperCase() + tool.name.slice(1)} Plan`,
          description: tool.reason,
          action: `Go to ${tool.name} billing settings → Change plan from ${tool.currentPlan} to ${tool.recommendedPlan} → Confirm changes.`,
          effort: tool.monthlySavings > 30 ? 'easy' : 'easy',
          timeline: '15 minutes',
          savings: tool.monthlySavings,
          status: 'pending'
        });
      }
    });

    // Step 3: Seat consolidation if team is small
    if (teamSize <= 5 && tools.some(t => t.monthlySavings > 0)) {
      steps.push({
        id: 'seats',
        title: 'Consolidate Team Seats',
        description: 'Review seat allocation across all tools and remove inactive users.',
        action: `Audit ${teamSize} team members' usage → Remove licenses for inactive users → Move occasional users to pay-as-you-go.`,
        effort: 'medium',
        timeline: '2 hours',
        savings: Math.round(totalSavings * 0.3),
        status: 'pending'
      });
    }

    // Step 4: Tool overlap reduction
    const hasOverlap = tools.some(t => t.name === 'chatgpt') && tools.some(t => t.name === 'claude');
    if (hasOverlap) {
      steps.push({
        id: 'overlap',
        title: 'Reduce Tool Overlap',
        description: 'ChatGPT and Claude have significant feature overlap for your use case.',
        action: 'Evaluate which platform better serves your team → Standardize on one primary platform → Cancel the redundant subscription.',
        effort: 'complex',
        timeline: '1 day',
        savings: Math.round(totalSavings * 0.2),
        status: 'pending'
      });
    }

    // Step 5: Setup regular audits
    steps.push({
      id: 'audit',
      title: 'Setup Quarterly Audits',
      description: 'Prevent savings from eroding as your team grows.',
      action: 'Add calendar reminder for quarterly audit → Use this tool again in 90 days → Track savings over time.',
      effort: 'easy',
      timeline: '30 minutes',
      savings: 0,
      status: 'pending'
    });

    return steps;
  };

  const steps = generateSteps();
  const totalSteps = steps.length;
  const completedCount = completedSteps.size;
  const progress = (completedCount / totalSteps) * 100;

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'complex': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'easy': return <Zap className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'complex': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const downloadPlan = () => {
    const planText = `
AI SPEND AUDIT - IMPLEMENTATION PLAN
Generated: ${new Date().toLocaleDateString()}
Total Savings Opportunity: $${totalSavings}/month ($${totalSavings * 12}/year)

IMPLEMENTATION STEPS:
${steps.map((step, idx) => `
${idx + 1}. ${step.title}
   Effort: ${step.effort} | Timeline: ${step.timeline} | Savings: $${step.savings}/month
   Action: ${step.action}
`).join('\n')}

TRACKING:
☐ Step 1: Complete
☐ Step 2: In Progress
☐ Step 3: Not Started

Next Review Date: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
    `;
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `implementation-plan-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sharePlan = async () => {
    const planSummary = `AI Spend Optimization Plan: Save $${totalSavings}/month ($${totalSavings * 12}/year) by following ${steps.filter(s => s.savings > 0).length} optimization steps.`;
    await navigator.clipboard.writeText(planSummary);
    alert('Plan summary copied to clipboard!');
  };

  const addToCalendar = () => {
    const nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Quarterly+AI+Spend+Audit&dates=${nextReview.toISOString().replace(/-|:|\./g, '')}/${nextReview.toISOString().replace(/-|:|\./g, '')}&details=Review+AI+tool+subscriptions+and+optimize+spending.&location=`;
    window.open(calendarUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Implementation Plan</h2>
                  <p className="text-blue-100 mt-1">Step-by-step guide to achieve your savings</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{completedCount}/{totalSteps} completed</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Savings Banner */}
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">Total Savings Opportunity</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${totalSavings}/month</div>
                    <div className="text-xs text-blue-100">${totalSavings * 12}/year</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="overflow-y-auto p-6 space-y-4 max-h-[calc(85vh-280px)]">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`border rounded-xl transition-all ${
                    completedSteps.has(step.id) 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStepComplete(step.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          completedSteps.has(step.id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {completedSteps.has(step.id) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1">
                        <div 
                          className="cursor-pointer"
                          onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-400">Step {idx + 1}</span>
                              <h3 className={`font-semibold ${
                                completedSteps.has(step.id) ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {step.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {step.savings > 0 && (
                                <span className="text-sm font-medium text-green-600">
                                  Save ${step.savings}/mo
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getEffortColor(step.effort)}`}>
                                {getEffortIcon(step.effort)}
                                {step.effort}
                              </span>
                              <ArrowRight className={`h-4 w-4 text-gray-400 transition-transform ${
                                expandedStep === step.id ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                          <p className={`text-sm text-gray-600 mt-1 ${
                            completedSteps.has(step.id) ? 'line-through text-gray-400' : ''
                          }`}>
                            {step.description}
                          </p>
                        </div>

                        {/* Expanded Details */}
                        {expandedStep === step.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-100"
                          >
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Action Required:</strong> {step.action}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Est. {step.timeline}
                                </span>
                                {step.savings > 0 && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <TrendingDown className="h-3 w-3" />
                                    ${step.savings}/month savings
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={downloadPlan}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Plan
                  </button>
                  <button
                    onClick={sharePlan}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={addToCalendar}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Set Reminder
                  </button>
                </div>
                
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Implementing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}