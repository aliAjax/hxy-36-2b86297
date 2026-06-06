import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  List,
  LayoutGrid,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, cn } from '@/utils/helpers';
import { ACTIVITY_STATUS_CONFIG, Item, ClaimRecord } from '@/types';

type ClaimMode = 'single' | 'multi';

interface MultiClaimItem {
  itemId: string;
  quantity: number;
  selected: boolean;
}

interface MultiClaimResult {
  item: Item;
  quantity: number;
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
  record?: ClaimRecord;
}

export const OnSiteQuickClaim: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    activities,
    items,
    addRecord,
    addRecordsBatch,
    checkDuplicateClaim,
    findPreClaimantByName,
    getRecentRecords,
  } = useAppStore();

  const [claimMode, setClaimMode] = useState<ClaimMode>('single');

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

  const [multiClaimItems, setMultiClaimItems] = useState<MultiClaimItem[]>([]);
  const [multiClaimResults, setMultiClaimResults] = useState<MultiClaimResult[] | null>(null);
  const [showMultiResult, setShowMultiResult] = useState(false);
  const [multiForceSubmit, setMultiForceSubmit] = useState(false);

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
  }, [id, getRecentRecords, activityItems]);

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
    if (claimMode === 'multi' && activityItems.length > 0) {
      const existingIds = new Set(multiClaimItems.map((m) => m.itemId));
      const hasAll = activityItems.every((item) => existingIds.has(item.id));
      if (!hasAll || multiClaimItems.length === 0) {
        setMultiClaimItems(
          activityItems.map((item) => {
            const existing = multiClaimItems.find((m) => m.itemId === item.id);
            return existing || { itemId: item.id, quantity: 1, selected: false };
          })
        );
      }
    }
  }, [activityItems, claimMode, multiClaimItems]);

  useEffect(() => {
    if (claimMode === 'single' && selectedItemId && claimerName.trim()) {
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
  }, [selectedItemId, claimerName, id, checkDuplicateClaim, findPreClaimantByName, claimMode]);

  const getMultiItemStatus = useCallback(
    (itemId: string) => {
      const item = activityItems.find((i) => i.id === itemId);
      const multiItem = multiClaimItems.find((m) => m.itemId === itemId);

      if (!item || !multiItem || !multiItem.selected) return null;

      const isDuplicate = checkDuplicateClaim(id!, itemId, claimerName);

      let status: 'valid' | 'warning' | 'error' = 'valid';
      let message = '';

      if (!claimerName.trim()) {
        status = 'warning';
        message = '请先输入领取人姓名';
      } else if (item.currentStock < multiItem.quantity) {
        status = 'error';
        message = `库存不足，仅剩 ${item.currentStock} 个`;
      } else if (isDuplicate && !multiForceSubmit) {
        status = 'warning';
        message = '该人员已领取过此物资';
      }

      return { status, message, isDuplicate };
    },
    [activityItems, multiClaimItems, checkDuplicateClaim, id, claimerName, multiForceSubmit]
  );

  const selectedMultiItems = useMemo(
    () => multiClaimItems.filter((m) => m.selected),
    [multiClaimItems]
  );

  const canMultiSubmit = useMemo(() => {
    if (!claimerName.trim()) return false;
    return selectedMultiItems.length > 0;
  }, [claimerName, selectedMultiItems]);

  const hasMultiErrors = useMemo(() => {
    return selectedMultiItems.some((m) => {
      const status = getMultiItemStatus(m.itemId);
      return status?.status === 'error';
    });
  }, [selectedMultiItems, getMultiItemStatus]);

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

  const handleMultiItemToggle = (itemId: string) => {
    setMultiClaimItems((prev) =>
      prev.map((m) =>
        m.itemId === itemId ? { ...m, selected: !m.selected } : m
      )
    );
  };

  const handleMultiQuantityChange = (itemId: string, delta: number) => {
    const item = activityItems.find((i) => i.id === itemId);
    if (!item) return;

    setMultiClaimItems((prev) =>
      prev.map((m) => {
        if (m.itemId !== itemId) return m;
        const newQuantity = m.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= item.currentStock) {
          return { ...m, quantity: newQuantity };
        }
        return m;
      })
    );
  };

  const handleMultiSubmit = () => {
    if (!canMultiSubmit) return;

    const recordsToAdd = selectedMultiItems.map((m) => ({
      activityId: id!,
      itemId: m.itemId,
      claimerName: claimerName.trim(),
      contact: preClaimantMatch?.contact || '',
      quantity: m.quantity,
      note: '',
    }));

    const result = addRecordsBatch(recordsToAdd, multiForceSubmit);

    const claimResults: MultiClaimResult[] = selectedMultiItems.map((m, index) => {
      const item = activityItems.find((i) => i.id === m.itemId)!;
      const batchResult = result.results.find((r) => r.index === index);

      if (batchResult) {
        return {
          item,
          quantity: m.quantity,
          success: batchResult.success,
          error: batchResult.error,
          isDuplicate: batchResult.isDuplicate,
          record: batchResult.record,
        };
      }

      const status = getMultiItemStatus(m.itemId);
      return {
        item,
        quantity: m.quantity,
        success: false,
        error: status?.message || '未知错误',
        isDuplicate: status?.isDuplicate,
      };
    });

    setMultiClaimResults(claimResults);
    setShowMultiResult(true);
  };

  const handleRetryFailed = () => {
    if (!multiClaimResults) return;

    const failedItemIds = new Set(
      multiClaimResults.filter((r) => !r.success).map((r) => r.item.id)
    );

    setMultiClaimItems((prev) =>
      prev.map((m) => ({
        ...m,
        selected: failedItemIds.has(m.itemId),
      }))
    );

    setShowMultiResult(false);
    setMultiClaimResults(null);
  };

  const handleMultiResultClose = () => {
    setShowMultiResult(false);
    setMultiClaimResults(null);
    setClaimerName('');
    setMultiForceSubmit(false);
    setMultiClaimItems((prev) =>
      prev.map((m) => ({ ...m, selected: false, quantity: 1 }))
    );
    setPreClaimantMatch(null);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleModeSwitch = (mode: ClaimMode) => {
    setClaimMode(mode);
    setClaimerName('');
    setDuplicateWarning(false);
    setPreClaimantMatch(null);
    setShowMultiResult(false);
    setMultiClaimResults(null);
    setMultiForceSubmit(false);
    if (mode === 'multi') {
      setMultiClaimItems(
        activityItems.map((item) => ({
          itemId: item.id,
          quantity: 1,
          selected: false,
        }))
      );
    }
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const selectAllItems = () => {
    setMultiClaimItems((prev) =>
      prev.map((m) => ({ ...m, selected: true }))
    );
  };

  const clearAllItems = () => {
    setMultiClaimItems((prev) =>
      prev.map((m) => ({ ...m, selected: false, quantity: 1 }))
    );
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
          <div className="w-full max-w-2xl">
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
                <div className="flex mb-6 bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => handleModeSwitch('single')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
                      claimMode === 'single'
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-gray-300'
                    )}
                  >
                    <LayoutGrid size={18} />
                    单物资领取
                  </button>
                  <button
                    onClick={() => handleModeSwitch('multi')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
                      claimMode === 'multi'
                        ? 'bg-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-gray-300'
                    )}
                  >
                    <List size={18} />
                    多物资领取
                  </button>
                </div>

                {claimMode === 'single' ? (
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
                ) : (
                  <>
                    <div className="mb-6">
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
                          preClaimantMatch
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
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-400">
                        选择物资（已选 {selectedMultiItems.length} 项）
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllItems}
                          className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                        >
                          全选
                        </button>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={clearAllItems}
                          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          清空
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                      {multiClaimItems.map((multiItem) => {
                        const item = activityItems.find((i) => i.id === multiItem.itemId);
                        const status = getMultiItemStatus(multiItem.itemId);
                        const isOutOfStock = item && item.currentStock === 0;

                        if (!item) return null;

                        return (
                          <div
                            key={multiItem.itemId}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all cursor-pointer',
                              multiItem.selected
                                ? status?.status === 'error'
                                  ? 'border-red-500 bg-red-500/10'
                                  : status?.status === 'warning'
                                  ? 'border-orange-500 bg-orange-500/10'
                                  : 'border-pink-500 bg-pink-500/20'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            )}
                            onClick={() => handleMultiItemToggle(multiItem.itemId)}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleMultiItemToggle(multiItem.itemId)}
                                className={cn(
                                  'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                                  multiItem.selected
                                    ? 'bg-pink-500 border-pink-500'
                                    : 'border-gray-500 hover:border-gray-400'
                                )}
                              >
                                {multiItem.selected && (
                                  <CheckCircle size={16} className="text-white" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-white">{item.name}</div>
                                <div className="text-sm text-gray-400">
                                  剩余{' '}
                                  <span
                                    className={cn(
                                      'font-bold',
                                      item.currentStock > 5
                                        ? 'text-green-400'
                                        : item.currentStock > 0
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                    )}
                                  >
                                    {item.currentStock}
                                  </span>{' '}
                                  个
                                </div>
                                {status && status.message && (
                                  <div
                                    className={cn(
                                      'text-sm mt-1 flex items-center gap-1',
                                      status.status === 'error'
                                        ? 'text-red-400'
                                        : 'text-orange-400'
                                    )}
                                  >
                                    {status.status === 'error' ? (
                                      <XCircle size={14} />
                                    ) : (
                                      <AlertTriangle size={14} />
                                    )}
                                    {status.message}
                                  </div>
                                )}
                                {!multiItem.selected && isOutOfStock && (
                                  <div className="text-sm mt-1 flex items-center gap-1 text-red-400">
                                    <XCircle size={14} />
                                    库存已耗尽
                                  </div>
                                )}
                              </div>

                              {multiItem.selected && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMultiQuantityChange(multiItem.itemId, -1);
                                    }}
                                    disabled={multiItem.quantity <= 1}
                                    className={cn(
                                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                                      multiItem.quantity <= 1
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-600 text-white hover:bg-gray-500'
                                    )}
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <div className="text-xl font-bold text-white w-10 text-center">
                                    {multiItem.quantity}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMultiQuantityChange(multiItem.itemId, 1);
                                    }}
                                    disabled={
                                      multiItem.quantity >= item.currentStock ||
                                      item.currentStock === 0
                                    }
                                    className={cn(
                                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                                      multiItem.quantity >= item.currentStock ||
                                      item.currentStock === 0
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-600 text-white hover:bg-gray-500'
                                    )}
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedMultiItems.some((m) => {
                      const status = getMultiItemStatus(m.itemId);
                      return status?.isDuplicate;
                    }) && (
                      <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={multiForceSubmit}
                            onChange={(e) => setMultiForceSubmit(e.target.checked)}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <div>
                            <span className="text-orange-300 font-medium">
                              存在重复领取警告
                            </span>
                            <p className="text-orange-400/70 text-sm mt-1">
                              勾选此项后，将强制发放所有选中的物资（包括重复领取的物资）
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {hasMultiErrors && (
                      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-start gap-2 text-yellow-300 text-sm">
                          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">存在异常物资</p>
                            <p className="text-yellow-400/70 mt-0.5">
                              部分物资库存不足或存在重复领取，提交后将在结果中显示成功/失败详情
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleMultiSubmit}
                      disabled={!canMultiSubmit}
                      className={cn(
                        'w-full py-5 rounded-xl font-bold text-lg transition-all shadow-lg',
                        !canMultiSubmit
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-500/30'
                      )}
                    >
                      <Zap className="inline mr-2" size={22} />
                      批量登记领取（{selectedMultiItems.length} 项）
                    </button>
                  </>
                )}
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

      {showMultiResult && multiClaimResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center',
                  multiClaimResults.every((r) => r.success)
                    ? 'bg-green-500/20'
                    : multiClaimResults.some((r) => r.success)
                    ? 'bg-yellow-500/20'
                    : 'bg-red-500/20'
                )}>
                  {multiClaimResults.every((r) => r.success) ? (
                    <CheckCircle className="text-green-400" size={28} />
                  ) : multiClaimResults.some((r) => r.success) ? (
                    <AlertTriangle className="text-yellow-400" size={28} />
                  ) : (
                    <XCircle className="text-red-400" size={28} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {multiClaimResults.every((r) => r.success)
                      ? '全部领取成功'
                      : multiClaimResults.some((r) => r.success)
                      ? '部分领取成功'
                      : '领取失败'}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    成功 {multiClaimResults.filter((r) => r.success).length} 项，
                    失败 {multiClaimResults.filter((r) => !r.success).length} 项
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3">
              {multiClaimResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border-2',
                    result.success
                      ? result.isDuplicate
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'border-green-500/50 bg-green-500/10'
                      : 'border-red-500/50 bg-red-500/10'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle
                          className={result.isDuplicate ? 'text-orange-400' : 'text-green-400'}
                          size={20}
                        />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )}
                      <div>
                        <div className="font-medium text-white">{result.item.name}</div>
                        <div className="text-sm text-gray-400">
                          数量：{result.quantity} 个
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          'text-sm font-medium px-2 py-1 rounded',
                          result.success
                            ? result.isDuplicate
                              ? 'text-orange-300 bg-orange-500/20'
                              : 'text-green-300 bg-green-500/20'
                            : 'text-red-300 bg-red-500/20'
                        )}
                      >
                        {result.success
                          ? result.isDuplicate
                            ? '重复领取'
                            : '成功'
                          : '失败'}
                      </span>
                    </div>
                  </div>
                  {!result.success && result.error && (
                    <div className="mt-2 text-sm text-red-400 pl-8">
                      {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-700 space-y-3">
              {multiClaimResults.some((r) => !r.success) && (
                <button
                  onClick={handleRetryFailed}
                  className="w-full py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  重试失败项
                </button>
              )}
              <button
                onClick={handleMultiResultClose}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
