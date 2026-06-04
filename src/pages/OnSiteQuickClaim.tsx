import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Zap,
  X,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, cn } from '@/utils/helpers';
import { ACTIVITY_STATUS_CONFIG } from '@/types';

export const OnSiteQuickClaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    activities,
    items,
    records,
    addRecord,
    checkDuplicateClaim,
    findPreClaimantByName,
    getRecentRecords,
  } = useAppStore();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [claimerName, setClaimerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [preClaimantMatch, setPreClaimantMatch] = useState<{
    name: string;
    contact: string;
    expectedItems: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const activity = activities.find((a) => a.id === id);
  const activityItems = useMemo(
    () => items.filter((i) => i.activityId === id),
    [items, id]
  );
  const availableItems = useMemo(
    () => activityItems.filter((i) => i.currentStock > 0),
    [activityItems]
  );
  const selectedItem = activityItems.find((i) => i.id === selectedItemId);
  const recentRecords = useMemo(() => {
    if (!id) return [];
    return getRecentRecords(id, 15).map((r) => ({
      ...r,
      item: activityItems.find((i) => i.id === r.itemId),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityItems, id, getRecentRecords, records]);

  const lowStockItems = useMemo(
    () => activityItems.filter((i) => i.currentStock > 0 && i.currentStock <= 5),
    [activityItems]
  );

  useEffect(() => {
    if (availableItems.length > 0 && !selectedItemId) {
      setSelectedItemId(availableItems[0].id);
    }
  }, [availableItems, selectedItemId]);

  useEffect(() => {
    if (selectedItemId && claimerName.trim()) {
      const isDuplicate = checkDuplicateClaim(id!, selectedItemId, claimerName);
      setDuplicateWarning(isDuplicate);
    } else {
      setDuplicateWarning(false);
    }

    const matched = findPreClaimantByName(id!, claimerName);
    if (matched && matched.contact) {
      setPreClaimantMatch({
        name: matched.name,
        contact: matched.contact,
        expectedItems: matched.expectedItems,
      });
    } else {
      setPreClaimantMatch(null);
    }
  }, [selectedItemId, claimerName, id, checkDuplicateClaim, findPreClaimantByName]);

  const handleSubmit = () => {
    if (!selectedItemId || !claimerName.trim()) return;
    if (!selectedItem || selectedItem.currentStock < quantity) return;

    const result = addRecord(
      {
        activityId: id!,
        itemId: selectedItemId,
        claimerName: claimerName.trim(),
        contact: preClaimantMatch?.contact || '',
        quantity,
        note: '',
      },
      duplicateWarning
    );

    if (result.success && result.record) {
      setSuccessMessage(`${claimerName} 已领取 ${selectedItem.name} x${quantity}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setClaimerName('');
      setQuantity(1);
      setDuplicateWarning(false);
      setPreClaimantMatch(null);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  };

  const handleForceSubmit = () => {
    if (!selectedItemId || !claimerName.trim()) return;

    const result = addRecord(
      {
        activityId: id!,
        itemId: selectedItemId,
        claimerName: claimerName.trim(),
        contact: preClaimantMatch?.contact || '',
        quantity,
        note: '',
      },
      true
    );

    if (result.success && result.record) {
      setSuccessMessage(`${claimerName} 已重复领取 ${selectedItem?.name} x${quantity}`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setClaimerName('');
      setQuantity(1);
      setDuplicateWarning(false);
      setPreClaimantMatch(null);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedItem) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedItem.currentStock) {
      setQuantity(newQuantity);
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">活动不存在</h2>
          <p className="text-gray-500 mb-4">该活动可能已被删除</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            <ArrowLeft size={18} />
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/activity/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={18} />
                返回详情
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{activity.name}</h1>
                <p className="text-sm text-gray-400">
                  {formatDate(activity.date)} ·{' '}
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: statusConfig.color + '20', color: statusConfig.color }}>
                    {statusConfig.label}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-bold">现场快速领取模式</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            {availableItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <Package className="text-gray-500" size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-300 mb-2">暂无可领取物资</h2>
                <p className="text-gray-500">所有物资库存已耗尽或未添加物资</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-400 mb-3">选择物资</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemSelect(item.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-left',
                          selectedItemId === item.id
                            ? 'border-pink-500 bg-pink-500/20'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        )}
                      >
                        <div className="font-medium text-white mb-1">{item.name}</div>
                        <div className="text-sm text-gray-400">
                          剩余 <span className="text-green-400 font-bold">{item.currentStock}</span> 个
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-400 mb-3">领取人姓名</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={claimerName}
                    onChange={(e) => setClaimerName(e.target.value)}
                    placeholder="请输入姓名"
                    autoFocus
                    className={cn(
                      'w-full px-6 py-5 text-2xl rounded-xl border-2 bg-gray-800 outline-none transition-all',
                      duplicateWarning
                        ? 'border-orange-500 text-orange-300'
                        : preClaimantMatch
                        ? 'border-blue-500 text-blue-300'
                        : 'border-gray-700 text-white focus:border-pink-500'
                    )}
                  />
                  {preClaimantMatch && (
                    <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <UserCheck size={16} />
                        <span>命中预登记：{preClaimantMatch.name}</span>
                        {preClaimantMatch.expectedItems && (
                          <span className="text-blue-300">
                            · 预期物资：{preClaimantMatch.expectedItems}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {duplicateWarning && (
                    <div className="mt-3 p-3 bg-orange-500/20 border border-orange-500/50 rounded-xl">
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <AlertTriangle size={16} />
                        <span>该人员已领取过此物资</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-400 mb-3">领取数量</label>
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className={cn(
                        'w-16 h-16 rounded-xl flex items-center justify-center transition-all',
                        quantity <= 1
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      )}
                    >
                      <Minus size={28} />
                    </button>
                    <div className="text-5xl font-bold text-white w-24 text-center">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={!selectedItem || quantity >= selectedItem.currentStock}
                      className={cn(
                        'w-16 h-16 rounded-xl flex items-center justify-center transition-all',
                        !selectedItem || quantity >= selectedItem.currentStock
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      )}
                    >
                      <Plus size={28} />
                    </button>
                  </div>
                  {selectedItem && (
                    <div className="text-center text-gray-500 text-sm mt-3">
                      库存上限：{selectedItem.currentStock} 个
                    </div>
                  )}
                </div>

                {selectedItem && selectedItem.currentStock < quantity && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={20} />
                      <span>库存不足，当前仅剩 {selectedItem.currentStock} 个</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {duplicateWarning ? (
                    <>
                      <button
                        onClick={handleForceSubmit}
                        className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30"
                      >
                        <CheckCircle className="inline mr-2" size={22} />
                        确认重复发放
                      </button>
                      <button
                        onClick={() => {
                          setClaimerName('');
                          setDuplicateWarning(false);
                          nameInputRef.current?.focus();
                        }}
                        className="w-full py-4 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-all"
                      >
                        <X className="inline mr-2" size={20} />
                        取消，重新输入
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedItemId || !claimerName.trim() || (selectedItem?.currentStock || 0) < quantity}
                      className={cn(
                        'w-full py-5 rounded-xl font-bold text-lg transition-all shadow-lg',
                        !selectedItemId || !claimerName.trim() || (selectedItem?.currentStock || 0) < quantity
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-500/30'
                      )}
                    >
                      <Zap className="inline mr-2" size={22} />
                      快速登记领取
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold text-white">实时状态</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {lowStockItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-orange-400" size={18} />
                <span className="font-medium text-orange-400">库存预警</span>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                  >
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-orange-400 text-sm">
                      仅剩 <span className="font-bold">{item.currentStock}</span> 个
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-purple-400" size={18} />
              <span className="font-medium text-purple-400">今日数据</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{recentRecords.length}</div>
                <div className="text-xs text-gray-400">领取人次</div>
              </div>
              <div className="p-3 bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">
                  {new Set(recentRecords.map((r) => r.claimerName)).size}
                </div>
                <div className="text-xs text-gray-400">参与人数</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="text-green-400" size={18} />
              <span className="font-medium text-green-400">最近领取</span>
            </div>
            {recentRecords.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                暂无领取记录
              </div>
            ) : (
              <div className="space-y-2">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className={cn(
                      'p-3 rounded-lg',
                      record.isDuplicateWarning
                        ? 'bg-orange-500/10 border border-orange-500/30'
                        : 'bg-gray-700/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {record.claimerName}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {record.item?.name} x{record.quantity}
                        </div>
                      </div>
                      {record.isDuplicateWarning && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/30 text-orange-300 rounded">
                          重复
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {new Date(record.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={28} />
            <span className="text-lg font-bold">{successMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
