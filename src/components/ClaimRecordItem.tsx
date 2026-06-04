import React from 'react';
import { Trash2, AlertTriangle, User, Phone } from 'lucide-react';
import { ClaimRecord, Item, ITEM_TYPE_CONFIG } from '@/types';
import { formatDateTime, cn } from '@/utils/helpers';

interface ClaimRecordItemProps {
  record: ClaimRecord;
  item: Item | undefined;
  onDelete: () => void;
}

export const ClaimRecordItem: React.FC<ClaimRecordItemProps> = ({ record, item, onDelete }) => {
  const typeConfig = item ? ITEM_TYPE_CONFIG[item.type] : null;

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md',
        record.isDuplicateWarning ? 'border-orange-200 bg-orange-50/30' : 'border-pink-50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: typeConfig?.color + '30' || '#f3f4f6' }}
          >
            {item?.type === 'lightstick' && '💡'}
            {item?.type === 'banner' && '🎏'}
            {item?.type === 'sticker' && '🌟'}
            {item?.type === 'freepack' && '🎁'}
            {item?.type === 'lottery' && '🎰'}
            {(!item || item.type === 'other') && '📦'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-800 truncate">{item?.name || '未知物资'}</h4>
              {record.isDuplicateWarning && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                  <AlertTriangle size={10} />
                  重复领取
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User size={12} />
                {record.claimerName}
              </span>
              {record.contact && (
                <span className="flex items-center gap-1">
                  <Phone size={12} />
                  {record.contact}
                </span>
              )}
              <span>x{record.quantity}</span>
            </div>
            
            {record.note && (
              <p className="text-sm text-gray-500 mt-1">{record.note}</p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">{formatDateTime(record.createdAt)}</p>
          </div>
        </div>
        
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
