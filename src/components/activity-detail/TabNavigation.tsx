import React from 'react';
import {
  ListTodo,
  ShoppingCart,
  UserCheck,
  Users,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

export type TabType = 'items' | 'records' | 'charts' | 'purchase' | 'todos' | 'preregister';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
  count?: number;
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabs: TabConfig[];
}

const defaultTabs: TabConfig[] = [
  { id: 'items', label: '物资列表', icon: ListTodo },
  { id: 'purchase', label: '采购清单', icon: ShoppingCart },
  { id: 'preregister', label: '预登记', icon: UserCheck },
  { id: 'records', label: '领取记录', icon: Users },
  { id: 'todos', label: '待办事项', icon: ClipboardList },
  { id: 'charts', label: '数据图表', icon: BarChart3 },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs = defaultTabs,
}) => {
  return (
    <div className="flex border-b border-pink-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all',
              isActive
                ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50'
                : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50/30'
            )}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  isActive ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
