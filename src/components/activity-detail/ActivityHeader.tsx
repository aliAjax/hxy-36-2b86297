import React from 'react';
import { ArrowLeft, FileText, Monitor, Zap, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ACTIVITY_STATUS_CONFIG } from '@/types';
import { formatDate } from '@/utils/helpers';

interface ActivityHeaderProps {
  activity: Activity;
  activityId: string;
  onReportConfig: () => void;
  onClaimForm: () => void;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  activity,
  activityId,
  onReportConfig,
  onClaimForm,
}) => {
  const navigate = useNavigate();
  const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status];

  return (
    <div className="relative h-48 overflow-hidden">
      {activity.coverUrl ? (
        <img
          src={activity.coverUrl}
          alt={activity.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-8 left-12 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute bottom-4 right-16 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-700 hover:bg-white transition-colors"
        >
          <ArrowLeft size={18} />
          返回
        </button>
      </div>
      <div className="absolute bottom-4 left-6 right-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{activity.name}</h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-white/80">{formatDate(activity.date)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onReportConfig}
              className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all shadow-lg"
            >
              <FileText size={20} />
              复盘报告
            </button>
            <Link
              to={`/activity/${activityId}/kanban`}
              className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all shadow-lg"
            >
              <Monitor size={20} />
              现场看板
            </Link>
            <Link
              to={`/activity/${activityId}/quick-claim`}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
            >
              <Zap size={20} />
              快速领取
            </Link>
            <button
              onClick={onClaimForm}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-500/30"
            >
              <Gift size={20} />
              登记领取
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
