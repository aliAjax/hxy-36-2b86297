import React from 'react';
import { Clock } from 'lucide-react';
import { Activity } from '@/types';

interface CountdownBannerProps {
  activity: Activity;
  pendingTodoCount: number;
  totalTodoCount: number;
}

const getCountdownText = (activity: Activity): string => {
  const now = new Date();
  const activityDate = new Date(activity.date);
  const diffTime = activityDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '活动已结束';
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays <= 7) return `${diffDays} 天后`;
  return `${diffDays} 天后`;
};

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  activity,
  pendingTodoCount,
  totalTodoCount,
}) => {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-pink-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">距离活动开始还有</p>
            <p className="text-3xl font-bold">{getCountdownText(activity)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/80 text-sm mb-1">待办事项</p>
          <p className="text-2xl font-bold">
            <span className={pendingTodoCount > 0 ? 'text-yellow-300' : ''}>
              {pendingTodoCount}
            </span>
            <span className="text-white/60 text-lg"> / {totalTodoCount}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
