'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface SpendBreakdownChartProps {
  tools: Array<{
    name: string;
    currentSpend: number;
    optimizedSpend: number;
    savings: number;
  }>;
  isLoading?: boolean;
  className?: string;
}

export function SpendBreakdownChart({ tools, isLoading, className }: SpendBreakdownChartProps) {
  const [animatedData, setAnimatedData] = useState(
    tools.map(t => ({ 
      name: t.name, 
      currentSpend: 0, 
      optimizedSpend: 0,
      savings: t.savings 
    }))
  );

  useEffect(() => {
    if (!isLoading && tools.length > 0) {
      const duration = 800;
      const stepTime = 20;
      const steps = duration / stepTime;
      
      const intervals: NodeJS.Timeout[] = [];
      
      tools.forEach((tool, idx) => {
        const currentIncrement = tool.currentSpend / steps;
        const optimizedIncrement = tool.optimizedSpend / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
          currentStep++;
          setAnimatedData(prev => {
            const newData = [...prev];
            if (!newData[idx]) {
              newData[idx] = { 
                name: tool.name, 
                currentSpend: 0, 
                optimizedSpend: 0,
                savings: tool.savings 
              };
            }
            newData[idx] = {
              ...newData[idx],
              currentSpend: Math.min(tool.currentSpend, newData[idx].currentSpend + currentIncrement),
              optimizedSpend: Math.min(tool.optimizedSpend, newData[idx].optimizedSpend + optimizedIncrement),
            };
            return newData;
          });
          if (currentStep >= steps) clearInterval(interval);
        }, stepTime);
        
        intervals.push(interval);
      });
      
      return () => intervals.forEach(interval => clearInterval(interval));
    }
  }, [isLoading, tools]);

  const formatToolName = (name: string) => {
    const names: Record<string, string> = {
      'chatgpt': 'ChatGPT',
      'claude': 'Claude',
      'cursor': 'Cursor',
      'github-copilot': 'Copilot',
      'gemini': 'Gemini',
      'windsurf': 'Windsurf',
      'anthropic': 'Anthropic',
      'openai': 'OpenAI',
    };
    return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  if (tools.length === 0) {
    return (
      <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Spend Breakdown</h3>
        <p className="text-xs text-gray-400 mb-6">Current vs optimized monthly spend by tool</p>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-400">No tool data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">Spend Breakdown</h3>
      <p className="text-xs text-gray-400 mb-6">Current vs optimized monthly spend by tool</p>
      
      <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={animatedData} layout="vertical" margin={{ left: 60, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `$${value}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tickFormatter={formatToolName}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(0)}`, '']}
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
            />
            <Bar 
              dataKey="currentSpend" 
              name="Current Spend" 
              fill="#ef4444" 
              radius={[0, 4, 4, 0]}
              animationDuration={500}
            />
            <Bar 
              dataKey="optimizedSpend" 
              name="Optimized Spend" 
              fill="#10b981" 
              radius={[0, 4, 4, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}