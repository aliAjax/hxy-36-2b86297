import React, { useState } from 'react';
import { BookTemplate, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { Item, ITEM_TYPE_CONFIG } from '@/types';

interface SaveAsTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  items: Item[];
  onSuccess: () => void;
}

export const SaveAsTemplateDialog: React.FC<SaveAsTemplateDialogProps> = ({
  isOpen,
  onClose,
  activityId,
  items,
  onSuccess,
}) => {
  const { activities, saveActivityAsTemplate } = useAppStore();

  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map((i) => i.id)));
  const [error, setError] = useState('');

  const activity = activities.find((a) => a.id === activityId);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
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
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleSave = () => {
    setError('');

    if (!templateName.trim()) {
      setError('请输入模板名称');
      return;
    }

    if (selectedIds.size === 0) {
      setError('请至少选择一项物资');
      return;
    }

    const result = saveActivityAsTemplate(
      activityId,
      templateName.trim(),
      description.trim(),
      Array.from(selectedIds)
    );

    if (result.success) {
      onSuccess();
      setTemplateName('');
      setDescription('');
      setSelectedIds(new Set(items.map((i) => i.id)));
    } else {
      setError(result.error || '保存失败');
    }
  };

  const handleClose = () => {
    setError('');
    setTemplateName('');
    setDescription('');
    setSelectedIds(new Set(items.map((i) => i.id)));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="保存为物资模板" size="lg">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">模板名称 *</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="例如：常规应援物资包、演唱会标配套装"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">模板描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个模板的适用场景..."
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all text-sm resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              选择物资 ({selectedIds.size}/{items.length})
            </label>
            <button
              onClick={toggleAll}
              className="text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              {selectedIds.size === items.length ? '取消全选' : '全选'}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {items.map((item) => {
              const typeConfig = ITEM_TYPE_CONFIG[item.type];
              const isSelected = selectedIds.has(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    isSelected
                      ? 'border-pink-300 bg-pink-50/50'
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                      isSelected
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ backgroundColor: typeConfig.color + '30' }}
                  >
                    {item.type === 'lightstick' && '💡'}
                    {item.type === 'banner' && '🎏'}
                    {item.type === 'sticker' && '🌟'}
                    {item.type === 'freepack' && '🎁'}
                    {item.type === 'lottery' && '🎰'}
                    {item.type === 'other' && '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      库存 {item.totalStock} · 预算 ¥{item.budget}
                      {item.supplier && ` · ${item.supplier}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {activity && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
            <BookTemplate size={16} />
            <span>来源活动：{activity.name}</span>
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
          💡 保存为模板后，模板与活动物资完全独立。后续修改模板不会影响已创建的活动物资，修改活动物资也不会影响模板。
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
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
          >
            <BookTemplate size={16} className="inline mr-2" />
            保存模板
          </button>
        </div>
      </div>
    </Modal>
  );
};

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
