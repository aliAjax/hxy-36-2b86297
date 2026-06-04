import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Filter,
  Package,
  Users,
  Clock,
  AlertTriangle,
  RefreshCw,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ItemType, ITEM_TYPE_CONFIG, ACTIVITY_STATUS_CONFIG } from '@/types';
import { formatDateTime, cn } from '@/utils/helpers';

const TYPE_ICONS: Record<string, string> = {
  lightstick: '💡',
  banner: '🎏',
  sticker: '🌟',
  freepack: '🎁',
  lottery: '🎰',
  other: '📦',
};

export const OnSiteKanban: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    activities,
    items,
    records,
    getTodayClaimQuantity,
  } = useAppStore();

  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activity = activities.find((a) => a.id === id);
  const activityItems = useMemo(
    () => items.filter((i) => i.activityId === id),
    [items, id]
  );
  const recentRecords = useMemo(
    () =>
      records
        .filter((r) => r.activityId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50),
    [records, id]
  );

  const filteredItems = useMemo(() => {
    return activityItems.filter((item) => {
      return selectedType === 'all' || item.type === selectedType;
    });
  }, [activityItems, selectedType]);

  const filteredRecords = useMemo(() => {
    if (selectedType === 'all') return recentRecords.slice(0, 10);
    const filteredItemIds = new Set(filteredItems.map((i) => i.id));
    return recentRecords.filter((r) => filteredItemIds.has(r.itemId)).slice(0, 10);
  }, [recentRecords, selectedType, filteredItems]);

  const typeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    activityItems.forEach((item) => {
      map.set(item.type, (map.get(item.type) || 0) + 1);
    });
    return map;
  }, [activityItems]);

  const filteredStats = useMemo(() => {
    const list = selectedType === 'all' ? activityItems : filteredItems;
    const totalStock = list.reduce((sum, i) => sum + i.totalStock, 0);
    const remainingStock = list.reduce((sum, i) => sum + i.currentStock, 0);
    const todayClaimed = list.reduce(
      (sum, i) => sum + getTodayClaimQuantity(id!, i.id),
      0
    );
    return {
      totalItems: list.length,
      totalStock,
      remainingStock,
      distributedStock: totalStock - remainingStock,
      todayClaimed,
    };
  }, [activityItems, filteredItems, selectedType, id, getTodayClaimQuantity]);

  const getStockColor = (stockPercentage: number) => {
    if (stockPercentage <= 20) return 'bg-red-500';
    if (stockPercentage <= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStockBorderColor = (stockPercentage: number) => {
    if (stockPercentage <= 20) return 'border-red-300';
    if (stockPercentage <= 50) return 'border-orange-300';
    return 'border-green-300';
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">😢</div>
          <h2 className="text-4xl font-bold text-white mb-4">活动不存在</h2>
          <p className="text-gray-400 text-xl mb-8">该活动可能已被删除</p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            <ArrowLeft size={24} />
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="bg-black/30 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/activity/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回详情</span>
              </button>
              <div className="flex items-center gap-3">
                <Monitor size={28} className="text-pink-400" />
                <h1 className="text-3xl font-bold">发放现场看板</h1>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <h2 className="text-2xl font-bold">{activity.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: statusConfig.color, color: '#1f2937' }}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="text-gray-400 text-lg">
                    <Clock size={18} className="inline mr-1" />
                    {currentTime.toLocaleString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-2xl p-6 border border-pink-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-500/30 rounded-2xl flex items-center justify-center">
                <Package size={32} className="text-pink-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">物资种类</p>
                <p className="text-5xl font-bold text-white">{filteredStats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500/30 rounded-2xl flex items-center justify-center">
                <Package size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">剩余库存</p>
                <p className="text-5xl font-bold text-white">{filteredStats.remainingStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500/30 rounded-2xl flex items-center justify-center">
                <Users size={32} className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">今日已发放</p>
                <p className="text-5xl font-bold text-white">{filteredStats.todayClaimed}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center">
                <Users size={32} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-lg">累计发放</p>
                <p className="text-5xl font-bold text-white">{filteredStats.distributedStock}</p>
              </div>
            </div>
          </div>
        </div>

        {selectedType !== 'all' && (
          <div className="mb-8 flex items-center gap-3 px-5 py-3 bg-yellow-500/15 border border-yellow-500/30 rounded-2xl">
            <Filter size={22} className="text-yellow-400" />
            <span className="text-yellow-200 text-lg font-medium">
              当前筛选：{ITEM_TYPE_CONFIG[selectedType].label}（{filteredStats.totalItems} 种物资）
            </span>
            <button
              onClick={() => setSelectedType('all')}
              className="ml-auto px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}

        <div className="bg-white/5 rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter size={28} className="text-pink-400" />
              <h2 className="text-2xl font-bold">物资筛选</h2>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <RefreshCw size={18} />
              刷新数据
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-6 py-3 rounded-xl font-medium text-lg transition-all flex items-center gap-2',
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              )}
            >
              全部
              <span
                className={cn(
                  'ml-1 px-2 py-0.5 rounded-full text-sm font-bold',
                  selectedType === 'all'
                    ? 'bg-white/25 text-white'
                    : 'bg-white/10 text-gray-400'
                )}
              >
                {activityItems.length}
              </span>
            </button>
            {Object.entries(ITEM_TYPE_CONFIG).map(([key, config]) => {
              const count = typeCountMap.get(key) || 0;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedType(key as ItemType)}
                  className={cn(
                    'px-6 py-3 rounded-xl font-medium text-lg transition-all flex items-center gap-2',
                    selectedType === key
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : count === 0
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  )}
                  disabled={count === 0}
                >
                  <span>{TYPE_ICONS[key]}</span>
                  {config.label}
                  <span
                    className={cn(
                      'ml-1 px-2 py-0.5 rounded-full text-sm font-bold',
                      selectedType === key
                        ? 'bg-white/25 text-white'
                        : count === 0
                          ? 'bg-white/5 text-gray-600'
                          : 'bg-white/10 text-gray-400'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Package size={28} className="text-pink-400" />
              库存状态
            </h2>
            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2">
              {filteredItems.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center border border-gray-700">
                  <Package size={64} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-xl text-gray-400">没有找到物资</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const typeConfig = ITEM_TYPE_CONFIG[item.type];
                  const stockPercentage =
                    item.totalStock > 0 ? (item.currentStock / item.totalStock) * 100 : 0;
                  const todayClaimed = getTodayClaimQuantity(id!, item.id);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'bg-white/5 rounded-2xl p-6 border-2 transition-all hover:bg-white/10',
                        getStockBorderColor(stockPercentage)
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                            style={{ backgroundColor: typeConfig.color + '40' }}
                          >
                            {TYPE_ICONS[item.type]}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                            <span
                              className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium"
                              style={{ backgroundColor: typeConfig.color + '30', color: typeConfig.color }}
                            >
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">剩余库存</p>
                          <p className="text-4xl font-bold text-white">{item.currentStock}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-sm mb-1">总库存</p>
                          <p className="text-2xl font-bold text-white">{item.totalStock}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-sm mb-1">今日发放</p>
                          <p className="text-2xl font-bold text-yellow-400">{todayClaimed}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-sm mb-1">累计发放</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {item.totalStock - item.currentStock}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">库存进度</span>
                          <span className="text-white font-medium">
                            {stockPercentage.toFixed(1)}% ({item.currentStock} / {item.totalStock})
                          </span>
                        </div>
                        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              getStockColor(stockPercentage)
                            )}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </div>

                      {stockPercentage <= 20 && (
                        <div className="mt-4 flex items-center gap-2 p-4 bg-red-500/20 rounded-xl border border-red-500/30">
                          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
                          <span className="text-red-300 font-medium">库存不足，请及时补充！</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Clock size={28} className="text-purple-400" />
              最新领取记录
            </h2>
            <div className="bg-white/5 rounded-2xl border border-gray-700 overflow-hidden">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={64} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-xl text-gray-400">暂无领取记录</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700 max-h-[700px] overflow-y-auto">
                  {filteredRecords.map((record, index) => {
                    const item = activityItems.find((i) => i.id === record.itemId);
                    const typeConfig = item ? ITEM_TYPE_CONFIG[item.type] : null;

                    return (
                      <div
                        key={record.id}
                        className={cn(
                          'p-5 transition-colors',
                          index === 0 ? 'bg-pink-500/10' : 'hover:bg-white/5'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: (typeConfig?.color || '#6b7280') + '40' }}
                          >
                            {item ? TYPE_ICONS[item.type] : '📦'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-white truncate">
                                {item?.name || '未知物资'}
                              </h4>
                              {record.isDuplicateWarning && (
                                <span className="flex items-center gap-1 text-xs px-3 py-1 bg-orange-500/30 text-orange-300 rounded-full font-medium">
                                  <AlertTriangle size={14} />
                                  重复领取
                                </span>
                              )}
                              {index === 0 && (
                                <span className="text-xs px-3 py-1 bg-pink-500/30 text-pink-300 rounded-full font-medium">
                                  最新
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-lg">
                              <span className="flex items-center gap-2 text-gray-300">
                                <Users size={20} />
                                <span className="font-medium">{record.claimerName}</span>
                              </span>
                              <span className="text-2xl font-bold text-pink-400">
                                x{record.quantity}
                              </span>
                            </div>
                            <p className="text-gray-500 mt-1 text-base">
                              {formatDateTime(record.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
