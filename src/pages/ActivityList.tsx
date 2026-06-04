import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ActivityCard } from '@/components/ActivityCard';
import { ActivityForm } from '@/components/ActivityForm';
import { Activity } from '@/types';
import { Modal } from '@/components/Modal';

export const ActivityList: React.FC = () => {
  const { activities, addActivity, updateActivity, deleteActivity } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, data);
    } else {
      addActivity(data);
    }
    setEditingActivity(null);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteActivity(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const openCreateForm = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">我的应援活动 ✨</h1>
            <p className="text-gray-500">管理所有的应援活动和物资</p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-200 hover:shadow-pink-300"
          >
            <Plus size={20} />
            创建新活动
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索活动名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-pink-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all shadow-sm"
          />
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎀</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {searchQuery ? '没有找到匹配的活动' : '还没有创建任何活动'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery ? '试试其他关键词搜索' : '点击上方按钮创建你的第一个应援活动吧！'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                <Plus size={20} />
                立即创建
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
              >
                <ActivityCard
                  activity={activity}
                  onEdit={() => handleEdit(activity)}
                  onDelete={() => handleDelete(activity.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <ActivityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSubmit}
        activity={editingActivity}
      />

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个活动吗？该操作将同时删除活动下的所有物资和领取记录，且无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            确认删除
          </button>
        </div>
      </Modal>
    </div>
  );
};
