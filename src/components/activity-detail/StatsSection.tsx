import React from 'react';
import { Package, Gift, DollarSign } from 'lucide-react';
import { ActivityStats } from '@/types';
import { StatsCard } from '@/components/StatsCard';

interface StatsSectionProps {
  stats: ActivityStats | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="物资种类"
        value={stats.totalItems}
        icon={Package}
        color="pink"
        subtitle="种类型"
      />
      <StatsCard
        title="已发放"
        value={stats.distributedStock}
        icon={Gift}
        color="purple"
        subtitle={`/ ${stats.totalStock} 总库存`}
      />
      <StatsCard
        title="剩余库存"
        value={stats.remainingStock}
        icon={Package}
        color="green"
        subtitle={
          stats.totalStock > 0
            ? `${((stats.remainingStock / stats.totalStock) * 100).toFixed(0)}% 剩余`
            : '无库存'
        }
      />
      <StatsCard
        title="总预算"
        value={`¥${stats.totalBudget}`}
        icon={DollarSign}
        color="orange"
        subtitle={`${stats.uniqueClaimers} 人参与`}
      />
    </div>
  );
};
