import React from 'react';
import { Search, Upload } from 'lucide-react';
import { ClaimRecord, Item } from '@/types';
import { ClaimRecordItem } from '@/components/ClaimRecordItem';

interface RecordsTabProps {
  filteredRecords: ClaimRecord[];
  activityRecords: ClaimRecord[];
  activityItems: Item[];
  recordSearchQuery: string;
  setRecordSearchQuery: (value: string) => void;
  onBatchClaim: () => void;
  onDeleteRecord: (recordId: string) => void;
}

export const RecordsTab: React.FC<RecordsTabProps> = ({
  filteredRecords,
  activityRecords,
  activityItems,
  recordSearchQuery,
  setRecordSearchQuery,
  onBatchClaim,
  onDeleteRecord,
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
            placeholder="搜索领取人姓名或物资名称..."
            value={recordSearchQuery}
            onChange={(e) => setRecordSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
          />
        </div>
        <button
          onClick={onBatchClaim}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm"
        >
          <Upload size={18} />
          批量录入
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {activityRecords.length === 0 ? '还没有领取记录' : '没有找到匹配的记录'}
          </h3>
          <p className="text-gray-500">
            {activityRecords.length === 0
              ? '点击右上角"登记领取"按钮开始登记'
              : '试试其他搜索条件'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {filteredRecords.map((record, index) => {
            const item = activityItems.find((i) => i.id === record.itemId);
            return (
              <div
                key={record.id}
                style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
              >
                <ClaimRecordItem
                  record={record}
                  item={item}
                  onDelete={() => onDeleteRecord(record.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
