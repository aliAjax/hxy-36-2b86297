import React, { useState, useEffect } from 'react';
import { PurchaseItem, ItemType, PurchaseStatus } from '@/types';
import { Modal } from './Modal';

interface PurchaseItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PurchaseItem, 'id' | 'createdAt'>) => void;
  activityId: string;
  purchaseItem?: PurchaseItem | null;
}

const typeOptions: { value: ItemType; label: string; emoji: string }[] = [
  { value: 'lightstick', label: '灯牌', emoji: '💡' },
  { value: 'banner', label: '手幅', emoji: '🎏' },
  { value: 'sticker', label: '贴纸', emoji: '🌟' },
  { value: 'freepack', label: '无料包', emoji: '🎁' },
  { value: 'lottery', label: '抽选礼物', emoji: '🎰' },
  { value: 'other', label: '其他', emoji: '📦' },
];

const statusOptions: { value: PurchaseStatus; label: string }[] = [
  { value: 'pending', label: '待采购' },
  { value: 'ordered', label: '已下单' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export const PurchaseItemForm: React.FC<PurchaseItemFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activityId,
  purchaseItem,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as ItemType,
    expectedQuantity: 0,
    budget: 0,
    supplier: '',
    status: 'pending' as PurchaseStatus,
    note: '',
    activityId,
  });

  useEffect(() => {
    if (purchaseItem) {
      setFormData({
        name: purchaseItem.name,
        type: purchaseItem.type,
        expectedQuantity: purchaseItem.expectedQuantity,
        budget: purchaseItem.budget,
        supplier: purchaseItem.supplier,
        status: purchaseItem.status,
        note: purchaseItem.note,
        activityId: purchaseItem.activityId,
      });
    } else {
      setFormData({
        name: '',
        type: 'other',
        expectedQuantity: 0,
        budget: 0,
        supplier: '',
        status: 'pending',
        note: '',
        activityId,
      });
    }
  }, [purchaseItem, isOpen, activityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={purchaseItem ? '编辑采购计划' : '添加采购计划'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物资名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：XX主播荧光棒"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              物资类型
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {typeOptions.map((opt) => {
                const isSelected = formData.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: opt.value })}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? 'border-pink-400 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-pink-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="text-xs font-medium">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预计数量 *
            </label>
            <input
              type="number"
              min="0"
              value={formData.expectedQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expectedQuantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算 (元)
            </label>
            <input
              type="number"
              min="0"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              采购状态
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as PurchaseStatus })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              供应商
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="例如：淘宝XX店铺"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="其他需要注意的事项..."
              rows={2}
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
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-200"
          >
            {purchaseItem ? '保存修改' : '添加采购计划'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
