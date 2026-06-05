import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Truck, Link, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { PurchaseItem, ITEM_TYPE_CONFIG } from '@/types';
import { Modal } from './Modal';

interface PurchaseConvertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { designUrl: string; distributionRule: string; note: string }) => void;
  purchaseItem: PurchaseItem | null;
}

export const PurchaseConvertDialog: React.FC<PurchaseConvertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  purchaseItem,
}) => {
  const [formData, setFormData] = useState({
    designUrl: '',
    distributionRule: '',
    note: '',
  });

  useEffect(() => {
    if (purchaseItem && isOpen) {
      setFormData({
        designUrl: '',
        distributionRule: '',
        note: purchaseItem.note || '',
      });
    }
  }, [purchaseItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  if (!purchaseItem) return null;

  const typeConfig = ITEM_TYPE_CONFIG[purchaseItem.type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="转为正式物资" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
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
              <h3 className="font-bold text-lg text-gray-800">{purchaseItem.name}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: typeConfig.color + '30',
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <Package size={18} className="mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{purchaseItem.expectedQuantity}</p>
              <p className="text-xs text-gray-500">库存数量</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <DollarSign size={18} className="mx-auto text-pink-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">¥{purchaseItem.budget}</p>
              <p className="text-xs text-gray-500">预算</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <Truck size={18} className="mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-gray-800 text-ellipsis overflow-hidden">
                {purchaseItem.supplier || '-'}
              </p>
              <p className="text-xs text-gray-500">供应商</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">转换预览</p>
            <p>转换后将在物资列表中创建一条新的正式物资记录，采购计划将被移除。请补充以下信息：</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link size={16} className="inline mr-2" />
              设计图链接
            </label>
            <input
              type="url"
              value={formData.designUrl}
              onChange={(e) => setFormData({ ...formData, designUrl: e.target.value })}
              placeholder="https://example.com/design.jpg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              发放规则
            </label>
            <input
              type="text"
              value={formData.distributionRule}
              onChange={(e) => setFormData({ ...formData, distributionRule: e.target.value })}
              placeholder="例如：关注+转发即可领取"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="其他需要注意的事项..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200"
          >
            <CheckCircle size={16} className="inline mr-2" />
            确认转换
          </button>
        </div>
      </form>
    </Modal>
  );
};
