import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, Edit2, Trash2, Users, ClipboardList } from 'lucide-react';
import { Activity, ACTIVITY_STATUS_CONFIG } from '@/types';
import { formatDate, cn } from '@/utils/helpers';
import { useAppStore } from '@/store/useAppStore';

interface ActivityCardProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onEdit, onDelete }) => {
  const { items, records, todos } = useAppStore();
  const activityItems = items.filter((i) => i.activityId === activity.id);
  const activityRecords = records.filter((r) => r.activityId === activity.id);
  const activityTodos = todos.filter((t) => t.activityId === activity.id);
  const itemCount = activityItems.length;
  const claimCount = activityRecords.length;
  const uniqueClaimers = new Set(activityRecords.map((r) => r.claimerName)).size;
  const pendingTodoCount = activityTodos.filter((t) => !t.completed).length;
  const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  return (
    <Link
      to={`/activity/${activity.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-50 hover:border-pink-200 hover:-translate-y-1"
    >
      {activity.coverUrl ? (
        <div className="relative h-40 overflow-hidden">
          <img
            src={activity.coverUrl}
            alt={activity.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative h-40 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 flex items-center justify-center"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/30 blur-xl" />
            <div className="absolute bottom-4 right-8 w-20 h-20 rounded-full bg-white/20 blur-xl" />
          </div>
          <span className="text-4xl">✨</span>
          <span
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
      )}

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors line-clamp-1">
          {activity.name}
        </h3>
        {activity.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{activity.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-pink-400" />
            <span>{formatDate(activity.date)}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-pink-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
              <Package size={14} />
            </div>
            <p className="text-lg font-bold text-gray-800">{itemCount}</p>
            <p className="text-xs text-gray-500">物资种类</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Package size={14} />
            </div>
            <p className="text-lg font-bold text-gray-800">{claimCount}</p>
            <p className="text-xs text-gray-500">领取次数</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Users size={14} />
            </div>
            <p className="text-lg font-bold text-gray-800">{uniqueClaimers}</p>
            <p className="text-xs text-gray-500">参与人数</p>
          </div>
          <div className={cn(
            'text-center p-2 rounded-xl',
            pendingTodoCount > 0 ? 'bg-orange-50' : 'bg-gray-50'
          )}>
            <div className={cn(
              'flex items-center justify-center gap-1 mb-1',
              pendingTodoCount > 0 ? 'text-orange-600' : 'text-gray-400'
            )}>
              <ClipboardList size={14} />
            </div>
            <p className={cn(
              'text-lg font-bold',
              pendingTodoCount > 0 ? 'text-orange-600' : 'text-gray-800'
            )}>
              {pendingTodoCount}
            </p>
            <p className="text-xs text-gray-500">待办事项</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium',
              'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
            )}
          >
            <Edit2 size={16} />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium',
              'bg-red-50 text-red-500 hover:bg-red-100 transition-colors'
            )}
          >
            <Trash2 size={16} />
            删除
          </button>
        </div>
      </div>
    </Link>
  );
};
