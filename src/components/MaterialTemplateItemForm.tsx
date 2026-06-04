import React, { useState, useEffect } from 'react';
import { MaterialTemplateItem, ItemType } from '@/types';
import { Modal } from './Modal';

interface MaterialTemplateItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialTemplateItem) => void;
  item?: MaterialTemplateItem | null;
}

const typeOptions: { value: ItemType; label: string; emoji: string }[] = [
  { value: 'lightstick', label: '灯牌', emoji: '💡' },
  { value: 'banner', label: '手幅', emoji: '🎏' },
  { value: 'sticker', label: '贴纸', emoji: '🌟' },
  { value: 'freepack', label: '无料包', emoji: '🎁' },
  { value: 'lottery', label: '抽选礼物', emoji: '🎰' },
  { value: 'other', label: '其他', emoji: '📦' },
];

const defaultFormData: MaterialTemplateItem = {
  name: '',
  type: 'other' as ItemType,
  designUrl: '',
  budget: 0,
  supplier: '',
  totalStock: 0,
  distributionRule: '',
  note: '',
};

export const MaterialTemplateItemForm: React.FC<MaterialTemplateItemFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
}) => {
  const [formData, setFormData] = useState<MaterialTemplateItem>(defaultFormData);

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData(defaultFormData);
    }
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? '编辑模板物资' : '添加模板物资'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">物资名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：XX主播荧光棒"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">物资类型</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">总库存 *</label>
            <input
              type="number"
              min="0"
              value={formData.totalStock}
              onChange={(e) =>
                setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预算 (元)</label>
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">设计稿链接</label>
            <input
              type="url"
              value={formData.designUrl}
              onChange={(e) => setFormData({ ...formData, designUrl: e.target.value })}
              placeholder="https://example.com/design.jpg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">供应商</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="例如：淘宝XX店铺"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">发放规则</label>
            <input
              type="text"
              value={formData.distributionRule}
              onChange={(e) => setFormData({ ...formData, distributionRule: e.target.value })}
              placeholder="例如：关注+转发即可领取"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
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
            {item ? '保存修改' : '添加物资'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
