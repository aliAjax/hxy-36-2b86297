import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TypeDistributionData } from '@/types';

interface TypeDistributionChartProps {
  data: TypeDistributionData[];
}

export const TypeDistributionChart: React.FC<TypeDistributionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-4xl mb-2">🥧</span>
        <p>暂无发放数据</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  interface PieTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: TypeDistributionData }>;
  }

  const CustomTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-pink-100">
          <p className="text-sm font-medium text-gray-700">{item.name}</p>
          <p className="text-sm" style={{ color: item.color }}>
            数量: <span className="font-bold">{item.value}</span> ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  interface PieLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: PieLabelProps) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-64">
      <div className="flex h-full">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-32 flex flex-col justify-center gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-600 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
