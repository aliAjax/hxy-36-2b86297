import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ConsumptionData } from '@/types';

interface ConsumptionChartProps {
  data: ConsumptionData[];
  chartType?: 'bar' | 'line';
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data, chartType = 'bar' }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-4xl mb-2">📊</span>
        <p>暂无领取数据</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-pink-100">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-sm text-pink-500">
            发放数量: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB6C1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#E6E6FA" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 182, 193, 0.1)' }} />
            <Bar dataKey="quantity" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFB6C1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E6E6FA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#FFB6C1"
              strokeWidth={3}
              dot={{ fill: '#FFB6C1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#E6E6FA', stroke: '#FFB6C1', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
