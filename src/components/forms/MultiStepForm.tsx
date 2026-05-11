// src/components/forms/MultiStepForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { ToolInputRow } from './ToolInputRow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface Tool {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

interface FormData {
  tools: Tool[];
  teamSize: number;
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
  email: string;
  company: string;
  role: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const USE_CASES: SelectOption[] = [
  { value: 'coding', label: '💻 Coding / Development' },
  { value: 'writing', label: '✍️ Writing / Content' },
  { value: 'data', label: '📊 Data Analysis' },
  { value: 'research', label: '🔬 Research' },
  { value: 'mixed', label: '🔄 Mixed / General' },
];

type UseCaseValue = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

const getSavingsEstimate = (totalSpend: number, teamSize: number): number => {
  if (totalSpend === 0) return 0;
  const baseRate = 0.28;
  const teamMultiplier = Math.min(1.5, 1 + (teamSize - 1) * 0.05);
  return Math.round(totalSpend * baseRate * teamMultiplier);
};

export function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    tools: [{ name: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 }],
    teamSize: 1,
    useCase: 'mixed',
    email: '',
    company: '',
    role: '',
  });

  useEffect(() => {
    const loadSavedForm = async () => {
      const saved = localStorage.getItem('auditFormData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FormData;
          setFormData(parsed);
        } catch (e) {
          console.error('Failed to load saved form', e);
        }
      }
    };
    void loadSavedForm();
  }, []);

  useEffect(() => {
    localStorage.setItem('auditFormData', JSON.stringify(formData));
  }, [formData]);

  const addTool = (): void => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { name: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 }],
    });
  };

  const updateTool = (index: number, field: string, value: string | number): void => {
    const newTools = [...formData.tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setFormData({ ...formData, tools: newTools });
  };

  const removeTool = (index: number): void => {
    if (formData.tools.length > 1) {
      setFormData({
        ...formData,
        tools: formData.tools.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    console.log('Submitting form data:', formData);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: formData.tools.map(tool => ({
            name: tool.name,
            plan: tool.plan,
            monthlySpend: Number(tool.monthlySpend),
            seats: Number(tool.seats)
          })),
          teamSize: Number(formData.teamSize),
          useCase: formData.useCase,
          email: formData.email,
          company: formData.company,
          role: formData.role,
        }),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) throw new Error(result.error);

      localStorage.setItem('lastAuditResult', JSON.stringify(result));
      router.push(`/audit/${result.shareableId}`);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMonthlySpend: number = formData.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const estimatedSavings = getSavingsEstimate(totalMonthlySpend, formData.teamSize);

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 });
  };

  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({ ...formData, useCase: e.target.value as UseCaseValue });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, email: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const stepIcons = [
    { icon: Zap, label: 'Tools' },
    { icon: Users, label: 'Team' },
    { icon: CheckCircle, label: 'Review' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Premium Step Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {stepIcons.map((s, idx) => {
            const StepIcon = s.icon;
            const isActive = step === idx + 1;
            const isCompleted = step > idx + 1;
            return (
              <div key={idx} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110' 
                      : isCompleted 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-white/50 backdrop-blur-sm text-gray-500 border border-white/30'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < stepIcons.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 transition-all duration-500 rounded-full
                    ${step > idx + 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-white/40'}`}
                    style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Step 1: Tools - Premium Glass Card */}
          {step === 1 && (
            <div className="relative">
              {/* Glass card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/30 to-white/20 rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl" />
              <div className="relative z-10 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      What AI tools are you paying for?
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-10">Add all the tools your team currently uses</p>
                </div>

                {/* Tool Header */}
                <div className="hidden md:grid grid-cols-12 gap-3 mb-3 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider ml-10">
                  <div className="col-span-3">Tool</div>
                  <div className="col-span-3">Plan</div>
                  <div className="col-span-2">Monthly $</div>
                  <div className="col-span-2">Seats</div>
                  <div className="col-span-2"></div>
                </div>

                <div className="space-y-3">
                  {formData.tools.map((tool, idx) => (
                    <ToolInputRow
                      key={idx}
                      index={idx}
                      tool={tool}
                      onUpdate={updateTool}
                      onRemove={removeTool}
                      showRemove={formData.tools.length > 1}
                    />
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={addTool} 
                  className="mt-4 ml-10 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 rounded-xl"
                >
                  <span className="mr-2 text-lg">+</span>
                  Add another tool
                </Button>

                {/* Total Spend Card */}
                <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-5 border border-white/50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-700 font-semibold">Current Monthly Spend</p>
                      <p className="text-3xl font-bold text-gray-900">${totalMonthlySpend}</p>
                      <p className="text-xs text-gray-500 mt-1">Based on your selected tools</p>
                    </div>
                    {estimatedSavings > 0 && (
                      <div className="bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-green-200">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-gray-700">
                            Potential savings: <span className="font-bold text-green-600">~${estimatedSavings}/mo</span>
                          </p>
                        </div>
                      </div>
                    )}
                    <Button 
                      onClick={nextStep} 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Details - Premium Glass Card */}
          {step === 2 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/30 to-white/20 rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl" />
              <div className="relative z-10 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Tell us about your team
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-10">Help us personalize your savings recommendations</p>
                </div>

                <div className="space-y-5 ml-10">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Team size (people)</label>
                    <Input
                      type="number"
                      value={formData.teamSize}
                      onChange={handleTeamSizeChange}
                      min={1}
                      className="text-lg font-medium rounded-xl bg-white/80"
                    />
                    <p className="text-xs text-gray-500 mt-2">Including yourself and any AI tool users</p>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-white/60">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Primary use case for AI</label>
                    <Select
                      value={formData.useCase}
                      options={USE_CASES}
                      onChange={handleUseCaseChange}
                      className="text-base rounded-xl bg-white/80"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8 ml-10">
                  <Button variant="outline" onClick={prevStep} className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl">
                    Review <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review - Premium Glass Card */}
          {step === 3 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/30 to-white/20 rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl" />
              <div className="relative z-10 p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                      Review your AI stack
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 ml-10">
                  {/* Tools Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-800">Your Tools</h3>
                    </div>
                    <div className="grid gap-2">
                      {formData.tools.map((tool, idx) => (
                        <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-white/50 hover:border-blue-200 transition-all duration-300">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{tool.name}</p>
                            <p className="text-sm text-gray-500">{tool.plan} · {tool.seats} seat{tool.seats !== 1 ? 's' : ''}</p>
                          </div>
                          <p className="font-semibold text-gray-900">${tool.monthlySpend}/mo</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Summary */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="text-xl font-bold text-gray-900">{formData.teamSize} people</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Primary Use Case</p>
                        <p className="text-xl font-bold text-gray-900">
                          {USE_CASES.find(c => c.value === formData.useCase)?.label.split(' ')[1] || formData.useCase}
                        </p>
                      </div>
                      <div className="bg-white/50 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-500">Est. Savings</p>
                        <p className="text-xl font-bold text-green-600">${estimatedSavings}/mo</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Capture */}
                  <div className="relative">
                    <label className="text-sm font-medium mb-1 block text-gray-700">
                      Email <span className="text-gray-400">(to save your report)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="pl-10 rounded-xl bg-white/80"
                    />
                    <DollarSign className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll send you the full audit report with personalized recommendations
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 ml-10">
                  <Button variant="outline" onClick={prevStep} className="flex-1 border-gray-300 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} 
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md rounded-xl"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Run Audit <BarChart3 className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}