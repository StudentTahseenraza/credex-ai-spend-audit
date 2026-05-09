'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

interface LeadCaptureModalProps {
  auditId: string;
  savingsAmount: number;
  onClose?: () => void;
}

export function LeadCaptureModal({ auditId, savingsAmount, onClose }: LeadCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role, auditId }),
      });
      setSubmitted(true);
      setTimeout(() => onClose?.(), 3000);
    } catch (error) {
      console.error('Lead capture failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">✓ Saved!</h3>
        <p className="text-gray-600">We've sent your audit report to {email}</p>
      </Card>
    );
  }

  const showCredexPrompt = savingsAmount > 500;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-2">Save Your Audit Report</h3>
      {showCredexPrompt && (
        <div className="mb-4 p-3 bg-purple-100 rounded-lg">
          <p className="text-purple-800 font-medium">
            🎉 You're saving over $500/month!
          </p>
          <p className="text-sm text-purple-700 mt-1">
            A Credex specialist will reach out to help you capture even more savings through discounted AI credits.
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Role (optional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting || !email} className="w-full">
          {isSubmitting ? 'Saving...' : 'Get Full Report →'}
        </Button>
        <p className="text-xs text-gray-500 text-center">
          We'll email you the full audit. No spam.
        </p>
      </div>
    </Card>
  );
}