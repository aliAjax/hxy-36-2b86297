import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus } from '@/types';
import { Modal } from './Modal';

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  activity?: Activity | null;
}

const statusOptions: { value: ActivityStatus; label: string }[] = [
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已结束' },
];

export const ActivityForm: React.FC<ActivityFormProps> = ({ isOpen, onClose, onSubmit, activity }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    coverUrl: '',
    status: 'upcoming' as ActivityStatus,
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        description: activity.description,
        date: activity.date,
        coverUrl: activity.coverUrl,
        status: activity.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        coverUrl: '',
        status: 'upcoming',
      });
    }
  }, [activity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activity ? '编辑活动' : '创建新活动'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活动名称 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：XX主播生日会"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活动描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="简单描述一下这个活动..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">活动日期 *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">活动状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ActivityStatus })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">封面图片链接</label>
          <input
            type="url"
            value={formData.coverUrl}
            onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
            placeholder="https://example.com/cover.jpg"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
          />
        </div>

        {formData.coverUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img
              src={formData.coverUrl}
              alt="预览"
              className="w-full h-40 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
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
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-200"
          >
            {activity ? '保存修改' : '创建活动'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
