import React, { useState, useEffect } from 'react';
import { Todo } from '@/types';
import { Modal } from './Modal';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Todo, 'id' | 'createdAt'>) => void;
  activityId: string;
  todo?: Todo | null;
}

export const TodoForm: React.FC<TodoFormProps> = ({ isOpen, onClose, onSubmit, activityId, todo }) => {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    note: '',
    activityId,
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        dueDate: todo.dueDate,
        completed: todo.completed,
        note: todo.note,
        activityId: todo.activityId,
      });
    } else {
      setFormData({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        completed: false,
        note: '',
        activityId,
      });
    }
  }, [todo, isOpen, activityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={todo ? '编辑待办' : '添加新待办'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">待办标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="例如：采购灯牌、确认手幅数量..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
            {todo ? '保存修改' : '添加待办'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
