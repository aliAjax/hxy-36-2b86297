import React from 'react';
import { ConsumptionData, TypeDistributionData } from '@/types';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { TypeDistributionChart } from '@/components/TypeDistributionChart';

interface ChartsTabProps {
  consumptionData: ConsumptionData[];
  typeDistributionData: TypeDistributionData[];
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
  consumptionData,
  typeDistributionData,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 物资消耗趋势</h3>
        <ConsumptionChart data={consumptionData} chartType="bar" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 物资类型分布</h3>
          <TypeDistributionChart data={typeDistributionData} />
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 领取趋势</h3>
          <ConsumptionChart data={consumptionData} chartType="line" />
        </div>
      </div>
    </div>
  );
};
