'use client';

import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

const TOOLS = [
  { value: 'cursor', label: 'Cursor' },
  { value: 'github-copilot', label: 'GitHub Copilot' },
  { value: 'claude', label: 'Claude' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'anthropic', label: 'Anthropic API' },
  { value: 'openai', label: 'OpenAI API' },
  { value: 'windsurf', label: 'Windsurf' },
];

const PLANS: Record<string, { value: string; label: string }[]> = {
  cursor: [
    { value: 'Hobby', label: 'Hobby (Free)' },
    { value: 'Pro', label: 'Pro ($20/mo/seat)' },
    { value: 'Business', label: 'Business ($40/mo/seat)' },
    { value: 'Enterprise', label: 'Enterprise ($60/mo/seat)' },
  ],
  'github-copilot': [
    { value: 'Individual', label: 'Individual ($10/mo/seat)' },
    { value: 'Business', label: 'Business ($19/mo/seat)' },
    { value: 'Enterprise', label: 'Enterprise ($39/mo/seat)' },
  ],
  claude: [
    { value: 'Free', label: 'Free' },
    { value: 'Pro', label: 'Pro ($20/mo)' },
    { value: 'Max', label: 'Max ($30/mo)' },
    { value: 'Team', label: 'Team ($25/mo/seat, min 2)' },
    { value: 'Enterprise', label: 'Enterprise ($50/mo/seat)' },
  ],
  chatgpt: [
    { value: 'Free', label: 'Free' },
    { value: 'Plus', label: 'Plus ($20/mo)' },
    { value: 'Team', label: 'Team ($25/mo/seat, min 2)' },
    { value: 'Enterprise', label: 'Enterprise ($50/mo/seat)' },
  ],
  gemini: [
    { value: 'Free', label: 'Free' },
    { value: 'Pro', label: 'Pro ($20/mo)' },
    { value: 'Ultra', label: 'Ultra ($30/mo)' },
  ],
  anthropic: [{ value: 'API Direct', label: 'API Direct (pay per token)' }],
  openai: [{ value: 'API Direct', label: 'API Direct (pay per token)' }],
  windsurf: [
    { value: 'Free', label: 'Free' },
    { value: 'Pro', label: 'Pro ($15/mo)' },
    { value: 'Team', label: 'Team ($30/mo/seat)' },
  ],
};

interface ToolInputRowProps {
  index: number;
  tool: { name: string; plan: string; monthlySpend: number; seats: number };
  onUpdate: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function ToolInputRow({ index, tool, onUpdate, onRemove, showRemove }: ToolInputRowProps) {
  const planOptions = PLANS[tool.name as keyof typeof PLANS] || [{ value: 'Free', label: 'Free' }];

  return (
    <div className="grid grid-cols-12 gap-3 items-end">
      <div className="col-span-3">
        <label className="text-sm font-medium mb-1 block">Tool</label>
        <Select
          value={tool.name}
          options={TOOLS}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
        />
      </div>
      <div className="col-span-3">
        <label className="text-sm font-medium mb-1 block">Plan</label>
        <Select
          value={tool.plan}
          options={planOptions}
          onChange={(e) => onUpdate(index, 'plan', e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-medium mb-1 block">Monthly $</label>
        <Input
          type="number"
          value={tool.monthlySpend}
          onChange={(e) => onUpdate(index, 'monthlySpend', parseFloat(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      <div className="col-span-2">
        <label className="text-sm font-medium mb-1 block">Seats</label>
        <Input
          type="number"
          value={tool.seats}
          onChange={(e) => onUpdate(index, 'seats', parseInt(e.target.value) || 1)}
          placeholder="1"
        />
      </div>
      <div className="col-span-2">
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}