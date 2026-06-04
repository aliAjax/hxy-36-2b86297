import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Warehouse, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { MaterialTemplateItemForm } from '@/components/MaterialTemplateItemForm';
import { MaterialTemplateItem, ITEM_TYPE_CONFIG } from '@/types';

interface EditTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  onSuccess: () => void;
}

export const EditTemplateDialog: React.FC<EditTemplateDialogProps> = ({
  isOpen,
  onClose,
  templateId,
  onSuccess,
}) => {
  const { materialTemplates, updateMaterialTemplate } = useAppStore();

  const template = materialTemplates.find((t) => t.id === templateId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<MaterialTemplateItem[]>([]);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setItems([...template.items]);
      setHasChanges(false);
      setError('');
    }
  }, [template, isOpen]);

  const stats = useMemo(() => {
    const totalStock = items.reduce((sum, i) => sum + i.totalStock, 0);
    const totalBudget = items.reduce((sum, i) => sum + i.budget, 0);
    return { totalStock, totalBudget };
  }, [items]);

  const handleAddItem = () => {
    setEditingItemIndex(null);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    setDeleteItemConfirm(index);
  };

  const confirmDeleteItem = () => {
    if (deleteItemConfirm !== null) {
      setItems((prev) => prev.filter((_, i) => i !== deleteItemConfirm));
      setDeleteItemConfirm(null);
      setHasChanges(true);
    }
  };

  const handleItemFormSubmit = (itemData: MaterialTemplateItem) => {
    if (editingItemIndex !== null) {
      setItems((prev) =>
        prev.map((it, i) => (i === editingItemIndex ? itemData : it))
      );
    } else {
      setItems((prev) => [...prev, itemData]);
    }
    setIsItemFormOpen(false);
    setEditingItemIndex(null);
    setHasChanges(true);
  };

  const handleSave = () => {
    setError('');

    if (!name.trim()) {
      setError('请输入模板名称');
      return;
    }

    if (items.length === 0) {
      setError('模板至少需要包含一项物资');
      return;
    }

    updateMaterialTemplate(templateId, {
      name: name.trim(),
      description: description.trim(),
      items,
    });

    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setItems([]);
    setIsItemFormOpen(false);
    setEditingItemIndex(null);
    setDeleteItemConfirm(null);
    setError('');
    setHasChanges(false);
    onClose();
  };

  if (!template) return null;

  const editingItem = editingItemIndex !== null ? items[editingItemIndex] : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="编辑模板配置" size="xl">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">模板名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasChanges(true);
            }}
            placeholder="例如：常规应援物资包"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">模板描述</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setHasChanges(true);
            }}
            placeholder="描述这个模板的适用场景..."
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">总库存</p>
            <p className="font-bold text-gray-800">{stats.totalStock}</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-xl text-center">
            <p className="text-xs text-gray-500 mb-1">总预算</p>
            <p className="font-bold text-gray-800">¥{stats.totalBudget}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              物资列表 ({items.length} 项)
            </label>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              <Plus size={14} />
              添加物资
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-gray-500 text-sm">
                还没有添加任何物资配置
              </p>
              <p className="text-gray-400 text-xs">
                点击上方"添加物资"按钮开始配置
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {items.map((item, index) => {
                const typeConfig = ITEM_TYPE_CONFIG[item.type];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
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
                        {typeConfig.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      <span className="text-green-600">
                        <Warehouse size={12} className="inline mr-0.5" />
                        {item.totalStock}
                      </span>
                      <span className="text-pink-600">
                        <DollarSign size={12} className="inline mr-0.5" />
                        ¥{item.budget}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditItem(index)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 flex items-start gap-2">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">注意</p>
            <p className="text-amber-600 text-xs">
              修改模板仅影响新创建的物资，不会影响已通过此模板创建到活动里的既有物资。模板和活动物资是独立的。
            </p>
          </div>
        </div>

        {hasChanges && (
          <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            您有未保存的更改，点击下方保存按钮确认修改。
          </div>
        )}

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
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
          >
            保存修改
          </button>
        </div>
      </div>

      {isItemFormOpen && (
        <MaterialTemplateItemForm
          isOpen={true}
          onClose={() => {
            setIsItemFormOpen(false);
            setEditingItemIndex(null);
          }}
          onSubmit={handleItemFormSubmit}
          item={editingItem}
        />
      )}

      <Modal
        isOpen={deleteItemConfirm !== null}
        onClose={() => setDeleteItemConfirm(null)}
        title="确认删除物资"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这项物资配置吗？
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteItemConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDeleteItem}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            确认删除
          </button>
        </div>
      </Modal>
    </Modal>
  );
};
