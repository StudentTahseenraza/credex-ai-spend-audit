'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { ToolInputRow } from './ToolInputRow';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface Tool {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

const USE_CASES = [
  { value: 'coding', label: '💻 Coding / Development' },
  { value: 'writing', label: '✍️ Writing / Content' },
  { value: 'data', label: '📊 Data Analysis' },
  { value: 'research', label: '🔬 Research' },
  { value: 'mixed', label: '🔄 Mixed / General' },
];

export function MultiStepForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tools: [{ name: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 }],
    teamSize: 1,
    useCase: 'mixed' as const,
    email: '',
    company: '',
    role: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('auditFormData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to load saved form');
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('auditFormData', JSON.stringify(formData));
  }, [formData]);

  const addTool = () => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { name: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 }],
    });
  };

  const updateTool = (index: number, field: string, value: string | number) => {
    const newTools = [...formData.tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setFormData({ ...formData, tools: newTools });
  };

  const removeTool = (index: number) => {
    if (formData.tools.length > 1) {
      setFormData({
        ...formData,
        tools: formData.tools.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async () => {
  setIsSubmitting(true);
  
  // Debug: Check what we're sending
  console.log('Submitting form data:', formData);
  
  try {
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tools: formData.tools.map(tool => ({
          name: tool.name,
          plan: tool.plan,
          monthlySpend: Number(tool.monthlySpend),  // Ensure it's a number
          seats: Number(tool.seats)                 // Ensure it's a number
        })),
        teamSize: Number(formData.teamSize),
        useCase: formData.useCase,
        email: formData.email,
        company: formData.company,
        role: formData.role,
      }),
    });
    
    const result = await response.json();
    console.log('API response:', result);  // Debug: Check what API returns
    
    if (!response.ok) throw new Error(result.error);
    
    // Store for results page
    localStorage.setItem('lastAuditResult', JSON.stringify(result));
    router.push(`/audit/${result.shareableId}`);
  } catch (error) {
    console.error('Submission error:', error);
    alert('Something went wrong. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const totalMonthlySpend = formData.tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex mb-8 border-b">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`pb-3 px-4 text-sm font-medium ${
              step === s
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
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
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total monthly spend: <span className="font-bold text-foreground">${totalMonthlySpend}</span>
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
                onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Primary use case for AI</label>
              <Select
                value={formData.useCase}
                options={USE_CASES}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value as any })}
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
                <div key={idx} className="text-sm p-2 bg-muted rounded">
                  {tool.name} - {tool.plan} - ${tool.monthlySpend}/mo ({tool.seats} seat{tool.seats !== 1 ? 's' : ''})
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-primary/10 rounded-lg">
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">We'll send you the full audit report</p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? <LoadingSpinner /> : 'Run Audit →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}