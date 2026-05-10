'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { cn } from '../../lib/utils';

interface ToolData {
  name: string;
  savings: number;
  color?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface SavingsDonutChartProps {
  tools: ToolData[];
  totalSavings: number;
  className?: string;
}

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
  payload?: ChartDataItem;
  percent?: number;
  value?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4'];

export function SavingsDonutChart({ tools, totalSavings, className }: SavingsDonutChartProps) {
  const [_, setActiveIndex] = useState<number | null>(null);
  
  const data: ChartDataItem[] = tools
    .filter(t => t.savings > 0)
    .map((tool, idx) => ({
      name: tool.name.charAt(0).toUpperCase() + tool.name.slice(1),
      value: tool.savings,
      color: COLORS[idx % COLORS.length],
    }));

  const onPieEnter = (_data: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderActiveShape = (props: ActiveShapeProps) => {
const {
  cx = 0,
  cy = 0,
  innerRadius = 0,
  outerRadius = 0,
  startAngle = 0,
  endAngle = 0,
  fill = '#3b82f6',
  payload,
  percent = 0,
  value = 0,
} = props;

return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#1f2937" className="text-sm font-semibold">
          {payload?.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#6b7280" className="text-xs">
          ${value}/mo ({(percent * 100).toFixed(0)}%)
        </text>
      </g>
    );
  };

  // Custom tooltip formatter with proper type handling
  const formatTooltipValue = (value: number | string): string => {
    return `$${value}/month`;
  };

  if (data.length === 0) {
    return (
      <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
        <h3 className="text-sm font-medium text-gray-500 mb-1">Savings Distribution</h3>
        <p className="text-xs text-gray-400 mb-6">Where your savings come from</p>
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-gray-400">No savings detected</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Monthly Savings</span>
            <span className="text-2xl font-bold text-green-600">$0</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">Savings Distribution</h3>
      <p className="text-xs text-gray-400 mb-6">Where your savings come from</p>
      
      <div style={{ width: '100%', height: '260px', minHeight: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatTooltipValue(value as number), 'Savings']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Monthly Savings</span>
          <span className="text-2xl font-bold text-green-600">${totalSavings}</span>
        </div>
      </div>
    </div>
  );
}