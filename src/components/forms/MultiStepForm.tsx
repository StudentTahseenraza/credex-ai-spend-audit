'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { ToolInputRow } from './ToolInputRow';

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

// Define SelectOption type to match the Select component
interface SelectOption {
  value: string;
  label: string;
}

// Create mutable array for Select component
const USE_CASES: SelectOption[] = [
  { value: 'coding', label: '💻 Coding / Development' },
  { value: 'writing', label: '✍️ Writing / Content' },
  { value: 'data', label: '📊 Data Analysis' },
  { value: 'research', label: '🔬 Research' },
  { value: 'mixed', label: '🔄 Mixed / General' },
];

type UseCaseValue = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

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

  // Load from localStorage on mount
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

  // Save to localStorage on change
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

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 });
  };

  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({ ...formData, useCase: e.target.value as UseCaseValue });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, email: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex mb-8 border-b">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`pb-3 px-4 text-sm font-medium ${step === s
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {s === 1 && '📊 Your Tools'}
            {s === 2 && '👥 Your Team'}
            {s === 3 && '✅ Review'}
          </button>
        ))}
      </div>

      {/* Step 1: Tools */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What AI tools are you paying for?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Button variant="outline" onClick={addTool} className="mt-2">
              + Add another tool
            </Button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Total monthly spend: <span className="font-bold text-gray-900">${totalMonthlySpend}</span>
              </p>
            </div>

            <Button onClick={() => setStep(2)} className="w-full mt-4">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Team Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about your team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Team size (people)</label>
              <Input
                type="number"
                value={formData.teamSize}
                onChange={handleTeamSizeChange}
                min={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Primary use case for AI</label>
              <Select
                value={formData.useCase}
                options={USE_CASES}
                onChange={handleUseCaseChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review + Email Capture */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review your AI stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Tools:</p>
              {formData.tools.map((tool, idx) => (
                <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                  {tool.name} - {tool.plan} - ${tool.monthlySpend}/mo ({tool.seats} seat{tool.seats !== 1 ? 's' : ''})
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Team size:</strong> {formData.teamSize}<br />
                <strong>Primary use case:</strong> {USE_CASES.find(c => c.value === formData.useCase)?.label}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email (to save your report)</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleEmailChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send you the full audit report
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Processing...' : 'Run Audit →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}