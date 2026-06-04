import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Item, ClaimRecord } from '@/types';
import { Modal } from './Modal';
import { useAppStore } from '@/store/useAppStore';

interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  items: Item[];
  onSuccess?: (record: ClaimRecord) => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ isOpen, onClose, activityId, items, onSuccess }) => {
  const { addRecord, checkDuplicateClaim } = useAppStore();
  const [formData, setFormData] = useState({
    itemId: '',
    claimerName: '',
    contact: '',
    quantity: 1,
    note: '',
  });
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        itemId: items.length > 0 ? items[0].id : '',
        claimerName: '',
        contact: '',
        quantity: 1,
        note: '',
      });
      setDuplicateWarning(false);
      setSelectedItem(items.length > 0 ? items[0] : null);
    }
  }, [isOpen, items]);

  useEffect(() => {
    const item = items.find((i) => i.id === formData.itemId);
    setSelectedItem(item || null);
  }, [formData.itemId, items]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, claimerName: name });
    
    if (formData.itemId && name.trim()) {
      const isDuplicate = checkDuplicateClaim(activityId, formData.itemId, name);
      setDuplicateWarning(isDuplicate);
    } else {
      setDuplicateWarning(false);
    }
  };

  const handleItemChange = (itemId: string) => {
    setFormData({ ...formData, itemId });
    if (formData.claimerName.trim()) {
      const isDuplicate = checkDuplicateClaim(activityId, itemId, formData.claimerName);
      setDuplicateWarning(isDuplicate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.claimerName.trim()) return;

    const result = addRecord(
      {
        activityId,
        itemId: formData.itemId,
        claimerName: formData.claimerName.trim(),
        contact: formData.contact.trim(),
        quantity: formData.quantity,
        note: formData.note.trim(),
      },
      duplicateWarning
    );

    if (result.success && result.record) {
      onSuccess?.(result.record);
      onClose();
    } else if (result.isDuplicate) {
      setDuplicateWarning(true);
    }
  };

  const handleForceSubmit = () => {
    const result = addRecord(
      {
        activityId,
        itemId: formData.itemId,
        claimerName: formData.claimerName.trim(),
        contact: formData.contact.trim(),
        quantity: formData.quantity,
        note: formData.note.trim(),
      },
      true
    );

    if (result.success && result.record) {
      onSuccess?.(result.record);
      onClose();
    }
  };

  if (items.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="登记领取">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-500">该活动还没有添加任何物资，请先添加物资后再登记领取。</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="登记领取" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择物资 *</label>
          <select
            value={formData.itemId}
            onChange={(e) => handleItemChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none bg-white"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} (剩余: {item.currentStock})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">领取人姓名 *</label>
            <input
              type="text"
              value={formData.claimerName}
              onChange={handleNameChange}
              placeholder="请输入姓名"
              className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 outline-none transition-all ${
                duplicateWarning
                  ? 'border-orange-400 focus:border-orange-400 focus:ring-orange-100 bg-orange-50'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">领取数量</label>
            <input
              type="number"
              min="1"
              max={selectedItem?.currentStock || 1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            placeholder="QQ/微信/手机号等"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <input
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="其他需要记录的信息"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>

        {duplicateWarning && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-orange-800 mb-1">⚠️ 重复领取提示</p>
                <p className="text-sm text-orange-700 mb-3">
                  该领取人在此活动中已领取过此物资，确定要再次发放吗？
                </p>
                <button
                  type="button"
                  onClick={handleForceSubmit}
                  className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  <CheckCircle size={16} />
                  确认重复发放
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedItem && selectedItem.currentStock < formData.quantity && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-800">库存不足</p>
                <p className="text-sm text-red-700">
                  当前库存：{selectedItem.currentStock}，无法领取 {formData.quantity} 个
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={duplicateWarning || (selectedItem && selectedItem.currentStock < formData.quantity)}
            className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-lg ${
              duplicateWarning || (selectedItem && selectedItem.currentStock < formData.quantity)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-200'
            }`}
          >
            确认领取
          </button>
        </div>
      </form>
    </Modal>
  );
};
