import React from 'react';
import { Edit2, Trash2, ExternalLink, DollarSign, Warehouse, Users, Star } from 'lucide-react';
import { Item, ITEM_TYPE_CONFIG } from '@/types';
import { cn } from '@/utils/helpers';

interface ItemCardProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  isKeyItem?: boolean;
  onToggleKeyItem?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete, isKeyItem, onToggleKeyItem }) => {
  const typeConfig = ITEM_TYPE_CONFIG[item.type];
  const stockPercentage = item.totalStock > 0 ? (item.currentStock / item.totalStock) * 100 : 0;
  const distributed = item.totalStock - item.currentStock;

  const getStockColor = () => {
    if (stockPercentage <= 20) return 'bg-red-400';
    if (stockPercentage <= 50) return 'bg-orange-400';
    return 'bg-green-400';
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border',
      isKeyItem ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-pink-50 hover:border-pink-100'
    )}>
      <div
        className={cn('h-2', isKeyItem && 'bg-gradient-to-r from-yellow-400 to-orange-400')}
        style={!isKeyItem ? { backgroundColor: typeConfig.color } : undefined}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: typeConfig.color + '30' }}
            >
              {item.type === 'lightstick' && '💡'}
              {item.type === 'banner' && '🎏'}
              {item.type === 'sticker' && '🌟'}
              {item.type === 'freepack' && '🎁'}
              {item.type === 'lottery' && '🎰'}
              {item.type === 'other' && '📦'}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: typeConfig.color + '30', color: typeConfig.color }}
              >
                {typeConfig.label}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {onToggleKeyItem && (
              <button
                onClick={onToggleKeyItem}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isKeyItem
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-yellow-500'
                )}
                title={isKeyItem ? '取消重点物资' : '标记为重点物资'}
              >
                <Star size={16} fill={isKeyItem ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {item.designUrl && (
          <a
            href={item.designUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 mb-3 transition-colors"
          >
            <ExternalLink size={14} />
            查看设计稿
          </a>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-xl">
            <Warehouse size={14} className="mx-auto text-green-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">{item.currentStock}</p>
            <p className="text-xs text-gray-500">剩余库存</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-xl">
            <Users size={14} className="mx-auto text-purple-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">{distributed}</p>
            <p className="text-xs text-gray-500">已发放</p>
          </div>
          <div className="text-center p-2 bg-pink-50 rounded-xl">
            <DollarSign size={14} className="mx-auto text-pink-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">¥{item.budget}</p>
            <p className="text-xs text-gray-500">预算</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">库存进度</span>
            <span className="font-medium text-gray-700">
              {item.currentStock} / {item.totalStock}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getStockColor())}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {item.supplier && (
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">供应商：</span>
            {item.supplier}
          </div>
        )}

        {item.distributionRule && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">发放规则：</span>
            {item.distributionRule}
          </div>
        )}

        {item.note && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700">
            💡 {item.note}
          </div>
        )}
      </div>
    </div>
  );
};
