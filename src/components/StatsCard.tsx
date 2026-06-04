import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'pink' | 'purple' | 'blue' | 'green' | 'orange';
  subtitle?: string;
}

const colorConfig = {
  pink: {
    bg: 'from-pink-400 to-pink-500',
    light: 'bg-pink-50',
    text: 'text-pink-600',
    iconBg: 'bg-pink-100',
  },
  purple: {
    bg: 'from-purple-400 to-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  blue: {
    bg: 'from-blue-400 to-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  green: {
    bg: 'from-green-400 to-green-500',
    light: 'bg-green-50',
    text: 'text-green-600',
    iconBg: 'bg-green-100',
  },
  orange: {
    bg: 'from-orange-400 to-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const config = colorConfig[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        config.light
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className={cn('absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br', config.bg)} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('text-sm font-medium mb-1', config.text)}>{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={cn('p-3 rounded-xl', config.iconBg)}>
            <Icon className={config.text} size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
