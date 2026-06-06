import React from 'react';
import { Plus, Search } from 'lucide-react';
import { PreClaimant } from '@/types';
import { PreClaimantItem, ClaimStatus } from '@/components/PreClaimantItem';
import { cn } from '@/utils/helpers';

interface PreClaimantStatusCounts {
  total: number;
  'not-claimed': number;
  'partial-claimed': number;
  'fully-claimed': number;
}

interface PreRegisterTabProps {
  filteredPreClaimants: PreClaimant[];
  activityPreClaimants: PreClaimant[];
  preClaimantSearchQuery: string;
  setPreClaimantSearchQuery: (value: string) => void;
  filterPreClaimantStatus: string;
  setFilterPreClaimantStatus: (value: string) => void;
  preClaimantStatusMap: Map<string, ClaimStatus>;
  preClaimantStatusCounts: PreClaimantStatusCounts;
  onAddPreClaimant: () => void;
  onEditPreClaimant: (preClaimant: PreClaimant) => void;
  onDeletePreClaimant: (preClaimantId: string) => void;
}

export const PreRegisterTab: React.FC<PreRegisterTabProps> = ({
  filteredPreClaimants,
  activityPreClaimants,
  preClaimantSearchQuery,
  setPreClaimantSearchQuery,
  filterPreClaimantStatus,
  setFilterPreClaimantStatus,
  preClaimantStatusMap,
  preClaimantStatusCounts,
  onAddPreClaimant,
  onEditPreClaimant,
  onDeletePreClaimant,
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索姓名、联系方式或预期物资..."
            value={preClaimantSearchQuery}
            onChange={(e) => setPreClaimantSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
          />
        </div>
        <button
          onClick={onAddPreClaimant}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
        >
          <Plus size={18} />
          添加预登记
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterPreClaimantStatus('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filterPreClaimantStatus === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          全部 ({preClaimantStatusCounts.total})
        </button>
        <button
          onClick={() => setFilterPreClaimantStatus('not-claimed')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filterPreClaimantStatus === 'not-claimed'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          未领取 ({preClaimantStatusCounts['not-claimed']})
        </button>
        <button
          onClick={() => setFilterPreClaimantStatus('partial-claimed')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filterPreClaimantStatus === 'partial-claimed'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          部分领取 ({preClaimantStatusCounts['partial-claimed']})
        </button>
        <button
          onClick={() => setFilterPreClaimantStatus('fully-claimed')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filterPreClaimantStatus === 'fully-claimed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          已领取 ({preClaimantStatusCounts['fully-claimed']})
        </button>
      </div>

      {filteredPreClaimants.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {activityPreClaimants.length === 0
              ? '还没有添加预登记'
              : '没有找到匹配的预登记'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activityPreClaimants.length === 0
              ? '在活动开始前录入可能来领取的人，领取登记时将自动匹配'
              : '试试其他搜索条件或筛选状态'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPreClaimants.map((preClaimant, index) => (
            <div
              key={preClaimant.id}
              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
            >
              <PreClaimantItem
                preClaimant={preClaimant}
                onEdit={() => onEditPreClaimant(preClaimant)}
                onDelete={() => onDeletePreClaimant(preClaimant.id)}
                claimStatus={preClaimantStatusMap.get(preClaimant.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
