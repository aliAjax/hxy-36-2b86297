import React from 'react';
import { Edit2, Trash2, Package, DollarSign, Truck, CheckCircle } from 'lucide-react';
import { PurchaseItem, ITEM_TYPE_CONFIG, PURCHASE_STATUS_CONFIG } from '@/types';
import { formatDate } from '@/utils/helpers';

interface PurchaseItemCardProps {
  purchaseItem: PurchaseItem;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}

export const PurchaseItemCard: React.FC<PurchaseItemCardProps> = ({
  purchaseItem,
  onEdit,
  onDelete,
  onConvert,
}) => {
  const typeConfig = ITEM_TYPE_CONFIG[purchaseItem.type];
  const statusConfig = PURCHASE_STATUS_CONFIG[purchaseItem.status];
  const canConvert = purchaseItem.status === 'completed';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-pink-50 hover:border-pink-100">
      <div className="h-2" style={{ backgroundColor: statusConfig.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: typeConfig.color + '30' }}
            >
              {purchaseItem.type === 'lightstick' && '💡'}
              {purchaseItem.type === 'banner' && '🎏'}
              {purchaseItem.type === 'sticker' && '🌟'}
              {purchaseItem.type === 'freepack' && '🎁'}
              {purchaseItem.type === 'lottery' && '🎰'}
              {purchaseItem.type === 'other' && '📦'}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{purchaseItem.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: typeConfig.color + '30',
                    color: typeConfig.color,
                  }}
                >
                  {typeConfig.label}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="编辑"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-xl">
            <Package size={14} className="mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">{purchaseItem.expectedQuantity}</p>
            <p className="text-xs text-gray-500">预计数量</p>
          </div>
          <div className="text-center p-2 bg-pink-50 rounded-xl">
            <DollarSign size={14} className="mx-auto text-pink-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">¥{purchaseItem.budget}</p>
            <p className="text-xs text-gray-500">预算</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-xl">
            <Truck size={14} className="mx-auto text-purple-500 mb-1" />
            <p className="text-sm font-bold text-gray-800">
              {purchaseItem.supplier || '-'}
            </p>
            <p className="text-xs text-gray-500">供应商</p>
          </div>
        </div>

        {purchaseItem.note && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700 mb-4">
            💡 {purchaseItem.note}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>创建于 {formatDate(purchaseItem.createdAt)}</span>
          {canConvert && (
            <button
              onClick={onConvert}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
            >
              <CheckCircle size={14} />
              转为正式物资
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
