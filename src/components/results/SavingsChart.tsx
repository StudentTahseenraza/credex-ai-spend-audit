'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavingsChartProps {
  tools: Array<{
    name: string;
    currentSpend: number;
    recommendedSpend: number;
    monthlySavings: number;
  }>;
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec489a'];

export function SavingsChart({ tools, totalCurrentSpend, totalRecommendedSpend }: SavingsChartProps) {
  // Prepare data for pie chart (current vs recommended)
  const comparisonData = [
    { name: 'Current Spend', value: totalCurrentSpend, color: '#ef4444' },
    { name: 'Optimized Spend', value: totalRecommendedSpend, color: '#10b981' },
  ];

  // Prepare data for bar chart (per tool)
  const barData = tools.map((tool) => ({
    name: tool.name === 'github-copilot' ? 'Copilot' : 
          tool.name === 'chatgpt' ? 'ChatGPT' :
          tool.name.charAt(0).toUpperCase() + tool.name.slice(1),
    current: tool.currentSpend,
    optimized: tool.recommendedSpend,
    savings: tool.monthlySavings,
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Savings Visualization</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart - Current vs Optimized */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Spend Comparison</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={comparisonData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: $${value}`}
                labelLine={false}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Current: ${totalCurrentSpend}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Optimized: ${totalRecommendedSpend}</span>
            </div>
          </div>
        </div>

        {/* Bar Chart - Per Tool Savings */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Monthly Spend by Tool</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="current" name="Current" fill="#ef4444" />
              <Bar dataKey="optimized" name="Optimized" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Breakdown Table */}
      {tools.some(t => t.monthlySavings > 0) && (
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Savings Breakdown</h4>
          <div className="space-y-2">
            {tools.map((tool, idx) => (
              tool.monthlySavings > 0 && (
                <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium">
                      {tool.name === 'github-copilot' ? 'GitHub Copilot' : 
                       tool.name === 'chatgpt' ? 'ChatGPT' :
                       tool.name.charAt(0).toUpperCase() + tool.name.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ${tool.currentSpend} → ${tool.recommendedSpend}
                    </span>
                  </div>
                  <div className="text-green-600 font-semibold">
                    Save ${tool.monthlySavings}/month
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}