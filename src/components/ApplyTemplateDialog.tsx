import React, { useState, useMemo, useEffect } from 'react';
import { Copy, DollarSign, Warehouse, Truck, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { ITEM_TYPE_CONFIG } from '@/types';

interface ApplyTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  onSuccess: (createdCount: number) => void;
  preselectedActivityId?: string;
}

export const ApplyTemplateDialog: React.FC<ApplyTemplateDialogProps> = ({
  isOpen,
  onClose,
  templateId,
  onSuccess,
  preselectedActivityId,
}) => {
  const { materialTemplates, activities, applyTemplateToActivity } = useAppStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState(templateId || '');
  const [targetActivityId, setTargetActivityId] = useState(preselectedActivityId || '');
  const [stockMultiplier, setStockMultiplier] = useState(1);
  const [budgetMultiplier, setBudgetMultiplier] = useState(1);
  const [supplierOverride, setSupplierOverride] = useState('');
  const [error, setError] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const template = materialTemplates.find((t) => t.id === selectedTemplateId);

  useEffect(() => {
    const tpl = materialTemplates.find((t) => t.id === selectedTemplateId);
    if (tpl && tpl.items.length > 0) {
      setSelectedItemIds(new Set(tpl.items.map((i) => i.id)));
    } else {
      setSelectedItemIds(new Set());
    }
  }, [selectedTemplateId, materialTemplates]);

  const availableActivities = useMemo(
    () => activities.filter((a) => a.status !== 'completed'),
    [activities]
  );

  const needsTemplateSelection = !templateId;

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!template) return;
    if (selectedItemIds.size === template.items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(template.items.map((i) => i.id)));
    }
  };

  const previewItems = useMemo(() => {
    if (!template) return [];
    return template.items
      .filter((item) => selectedItemIds.has(item.id))
      .map((item) => {
        const adjustedStock = Math.round(item.totalStock * stockMultiplier);
        const adjustedBudget = Math.round(item.budget * budgetMultiplier);
        const finalSupplier = supplierOverride.trim() || item.supplier;
        const typeConfig = ITEM_TYPE_CONFIG[item.type];
        return { ...item, adjustedStock, adjustedBudget, finalSupplier, typeConfig };
      });
  }, [template, stockMultiplier, budgetMultiplier, supplierOverride, selectedItemIds]);

  const allTemplateItems = useMemo(() => {
    if (!template) return [];
    return template.items.map((item) => {
      const adjustedStock = Math.round(item.totalStock * stockMultiplier);
      const adjustedBudget = Math.round(item.budget * budgetMultiplier);
      const finalSupplier = supplierOverride.trim() || item.supplier;
      const typeConfig = ITEM_TYPE_CONFIG[item.type];
      return { ...item, adjustedStock, adjustedBudget, finalSupplier, typeConfig };
    });
  }, [template, stockMultiplier, budgetMultiplier, supplierOverride]);

  const totalOriginalBudget = template
    ? template.items.reduce((sum, i) => sum + i.budget, 0)
    : 0;
  const totalAdjustedBudget = previewItems.reduce((sum, i) => sum + i.adjustedBudget, 0);
  const totalOriginalStock = template
    ? template.items.reduce((sum, i) => sum + i.totalStock, 0)
    : 0;
  const totalAdjustedStock = previewItems.reduce((sum, i) => sum + i.adjustedStock, 0);

  const handleApply = () => {
    setError('');

    if (!selectedTemplateId) {
      setError('请选择模板');
      return;
    }

    if (!targetActivityId) {
      setError('请选择目标活动');
      return;
    }

    if (selectedItemIds.size === 0) {
      setError('请至少选择一项物资');
      return;
    }

    const result = applyTemplateToActivity(selectedTemplateId, targetActivityId, {
      stockMultiplier,
      budgetMultiplier,
      supplierOverride,
      selectedItemIds: Array.from(selectedItemIds),
    });

    if (result.success) {
      onSuccess(result.createdItems.length);
      resetForm();
    } else {
      setError(result.error || '应用失败');
    }
  };

  const resetForm = () => {
    setSelectedTemplateId(templateId || '');
    setTargetActivityId(preselectedActivityId || '');
    setStockMultiplier(1);
    setBudgetMultiplier(1);
    setSupplierOverride('');
    setError('');
    setSelectedItemIds(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    setStockMultiplier(1);
    setBudgetMultiplier(1);
    setSupplierOverride('');
    const tpl = materialTemplates.find((t) => t.id === tplId);
    if (tpl) {
      setSelectedItemIds(new Set(tpl.items.map((i) => i.id)));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={template ? `应用模板：${template.name}` : '从模板创建物资'}
      size="xl"
    >
      <div className="space-y-5">
        {needsTemplateSelection && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">选择模板 *</label>
            {materialTemplates.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-500 text-sm mb-2">暂无物资模板</p>
                <p className="text-gray-400 text-xs">请先在活动详情页将物资保存为模板，或前往模板库查看</p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {materialTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedTemplateId === t.id
                        ? 'border-pink-300 bg-pink-50/50'
                        : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        selectedTemplateId === t.id
                          ? 'border-pink-500 bg-pink-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedTemplateId === t.id && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-gray-500">
                        {t.items.length} 项物资 · 来源：{t.sourceActivityName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!preselectedActivityId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">目标活动 *</label>
            <select
              value={targetActivityId}
              onChange={(e) => setTargetActivityId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all text-sm appearance-none"
            >
              <option value="">选择目标活动...</option>
              {availableActivities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {template && (
          <>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Copy size={16} />
                批量调整
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Warehouse size={12} />
                    库存倍率
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={stockMultiplier}
                      onChange={(e) =>
                        setStockMultiplier(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none text-sm"
                    />
                    <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                      × 原始
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[0.5, 1, 1.5, 2, 3].map((v) => (
                      <button
                        key={v}
                        onClick={() => setStockMultiplier(v)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          stockMultiplier === v
                            ? 'bg-pink-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
                        }`}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <DollarSign size={12} />
                    预算倍率
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={budgetMultiplier}
                      onChange={(e) =>
                        setBudgetMultiplier(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none text-sm"
                    />
                    <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                      × 原始
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[0.5, 1, 1.5, 2, 3].map((v) => (
                      <button
                        key={v}
                        onClick={() => setBudgetMultiplier(v)}
                        className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          budgetMultiplier === v
                            ? 'bg-pink-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
                        }`}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Truck size={12} />
                    统一供应商（可选）
                  </label>
                  <input
                    type="text"
                    value={supplierOverride}
                    onChange={(e) => setSupplierOverride(e.target.value)}
                    placeholder="留空则使用模板原始供应商"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none text-sm"
                  />
                  {supplierOverride.trim() && (
                    <p className="mt-1 text-xs text-amber-600">将覆盖所有物资的供应商</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-700">选择要创建的物资</h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  {selectedItemIds.size === template.items.length ? '取消全选' : '全选'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                已选 {selectedItemIds.size} / {template.items.length} 项
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">库存合计</p>
                  <p className="font-bold text-gray-800">
                    {totalAdjustedStock}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      (原 {totalOriginalStock})
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-pink-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">预算合计</p>
                  <p className="font-bold text-gray-800">
                    ¥{totalAdjustedBudget}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      (原 ¥{totalOriginalBudget})
                    </span>
                  </p>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {allTemplateItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-pink-300 bg-pink-50/50'
                          : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: item.typeConfig.color + '30' }}
                      >
                        {item.type === 'lightstick' && '💡'}
                        {item.type === 'banner' && '🎏'}
                        {item.type === 'sticker' && '🌟'}
                        {item.type === 'freepack' && '🎁'}
                        {item.type === 'lottery' && '🎰'}
                        {item.type === 'other' && '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs flex-shrink-0">
                        <span className="text-green-600">
                          {item.adjustedStock}
                          {item.adjustedStock !== item.totalStock && (
                            <span className="text-gray-400">/{item.totalStock}</span>
                          )}
                        </span>
                        <span className="text-pink-600">
                          ¥{item.adjustedBudget}
                          {item.adjustedBudget !== item.budget && (
                            <span className="text-gray-400">/¥{item.budget}</span>
                          )}
                        </span>
                        <span
                          className="text-blue-600 max-w-16 truncate"
                          title={item.finalSupplier}
                        >
                          {item.finalSupplier || '-'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
          💡 应用模板将创建全新的物资记录，与模板完全独立。创建后可自由编辑，不会影响模板或其他活动。
        </div>

        {error && (
          <div className="p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedTemplateId || !targetActivityId || selectedItemIds.size === 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy size={16} className="inline mr-2" />
            {template ? `创建 ${previewItems.length} 项物资` : '应用模板'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
