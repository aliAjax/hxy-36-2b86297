import React, { useState, useEffect } from 'react';
import { PreClaimant } from '@/types';
import { Modal } from './Modal';

interface PreClaimantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PreClaimant, 'id' | 'createdAt'>) => void;
  activityId: string;
  preClaimant?: PreClaimant | null;
}

export const PreClaimantForm: React.FC<PreClaimantFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  activityId,
  preClaimant,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    expectedItems: '',
    note: '',
    activityId,
  });

  useEffect(() => {
    if (preClaimant) {
      setFormData({
        name: preClaimant.name,
        contact: preClaimant.contact,
        expectedItems: preClaimant.expectedItems,
        note: preClaimant.note,
        activityId: preClaimant.activityId,
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        expectedItems: '',
        note: '',
        activityId,
      });
    }
  }, [preClaimant, isOpen, activityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={preClaimant ? '编辑预登记' : '添加预登记'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">姓名 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="领取人姓名"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            autoFocus
          />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">预期领取物资</label>
          <input
            type="text"
            value={formData.expectedItems}
            onChange={(e) => setFormData({ ...formData, expectedItems: e.target.value })}
            placeholder="例如：灯牌×1、手幅×2..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="其他需要记录的信息..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
          />
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
            {preClaimant ? '保存修改' : '添加预登记'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
