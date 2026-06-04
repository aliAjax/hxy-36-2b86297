import React, { useState, useMemo } from 'react';
import {
  BookTemplate,
  Trash2,
  Search,
  Package,
  DollarSign,
  Warehouse,
  Calendar,
  ArrowRight,
  Copy,
  Edit2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { ApplyTemplateDialog } from '@/components/ApplyTemplateDialog';
import { formatDate } from '@/utils/helpers';
import { MaterialTemplate, ITEM_TYPE_CONFIG } from '@/types';

export const MaterialTemplateLibrary: React.FC = () => {
  const {
    materialTemplates,
    deleteMaterialTemplate,
    updateMaterialTemplate,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [applyTemplateId, setApplyTemplateId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredTemplates = useMemo(() => {
    return materialTemplates
      .filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.sourceActivityName.toLowerCase().includes(q) ||
          t.items.some((item) => item.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [materialTemplates, searchQuery]);

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMaterialTemplate(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleStartEdit = (template: MaterialTemplate) => {
    setEditingTemplateId(template.id);
    setEditName(template.name);
    setEditDescription(template.description);
  };

  const handleSaveEdit = () => {
    if (editingTemplateId) {
      updateMaterialTemplate(editingTemplateId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setEditingTemplateId(null);
      setToastMessage('模板已更新');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const handleApplySuccess = (count: number) => {
    setApplyTemplateId(null);
    setToastMessage(`已成功创建 ${count} 个物资`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedTemplateId((prev) => (prev === id ? null : id));
  };

  const getTemplateStats = (template: MaterialTemplate) => {
    const totalStock = template.items.reduce((sum, i) => sum + i.totalStock, 0);
    const totalBudget = template.items.reduce((sum, i) => sum + i.budget, 0);
    const uniqueSuppliers = new Set(template.items.map((i) => i.supplier).filter(Boolean));
    return { totalStock, totalBudget, uniqueSuppliers: uniqueSuppliers.size };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <BookTemplate className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">物资模板库</h1>
              <p className="text-gray-500 text-sm">跨活动复用应援物资配置，一键创建到任意活动</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索模板名称、描述、来源活动或物资名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              {materialTemplates.length === 0 ? '还没有保存任何模板' : '没有找到匹配的模板'}
            </h3>
            <p className="text-gray-500 mb-2">
              {materialTemplates.length === 0
                ? '在活动详情页的物资列表中，点击"存为模板"按钮即可保存'
                : '试试其他搜索条件'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map((template) => {
              const stats = getTemplateStats(template);
              const isExpanded = expandedTemplateId === template.id;
              const isEditing = editingTemplateId === template.id;

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-orange-50 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-3 mb-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none text-sm"
                              placeholder="模板名称"
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none text-sm resize-none"
                              rows={2}
                              placeholder="模板描述"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditingTemplateId(null)}
                                className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-800 truncate">
                                {template.name}
                              </h3>
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                {template.items.length} 项物资
                              </span>
                            </div>
                            {template.description && (
                              <p className="text-gray-500 text-sm mb-2">{template.description}</p>
                            )}
                          </>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(template.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ArrowRight size={12} />
                            来源: {template.sourceActivityName}
                          </span>
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => setApplyTemplateId(template.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                          >
                            <Copy size={14} />
                            应用到活动
                          </button>
                          <button
                            onClick={() => handleStartEdit(template)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(template.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-2.5 bg-blue-50 rounded-xl">
                        <Package size={14} className="mx-auto text-blue-500 mb-1" />
                        <p className="text-sm font-bold text-gray-800">{template.items.length}</p>
                        <p className="text-xs text-gray-500">物资种类</p>
                      </div>
                      <div className="text-center p-2.5 bg-green-50 rounded-xl">
                        <Warehouse size={14} className="mx-auto text-green-500 mb-1" />
                        <p className="text-sm font-bold text-gray-800">{stats.totalStock}</p>
                        <p className="text-xs text-gray-500">总库存</p>
                      </div>
                      <div className="text-center p-2.5 bg-pink-50 rounded-xl">
                        <DollarSign size={14} className="mx-auto text-pink-500 mb-1" />
                        <p className="text-sm font-bold text-gray-800">¥{stats.totalBudget}</p>
                        <p className="text-xs text-gray-500">总预算</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(template.id)}
                      className="w-full mt-4 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      {isExpanded ? '收起详情' : '查看物资详情'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {template.items.map((item, index) => {
                          const typeConfig = ITEM_TYPE_CONFIG[item.type];
                          return (
                            <div
                              key={index}
                              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
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
                                  <p className="font-medium text-gray-800 text-sm truncate">
                                    {item.name}
                                  </p>
                                  <span
                                    className="text-xs px-1.5 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: typeConfig.color + '30',
                                      color: typeConfig.color,
                                    }}
                                  >
                                    {typeConfig.label}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                  <p className="font-bold text-gray-700">{item.totalStock}</p>
                                  <p className="text-gray-500">库存</p>
                                </div>
                                <div className="text-center p-1.5 bg-pink-50 rounded-lg">
                                  <p className="font-bold text-gray-700">¥{item.budget}</p>
                                  <p className="text-gray-500">预算</p>
                                </div>
                                <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                                  <p className="font-bold text-gray-700 truncate" title={item.supplier || '-'}>
                                    {item.supplier || '-'}
                                  </p>
                                  <p className="text-gray-500">供应商</p>
                                </div>
                              </div>
                              {item.note && (
                                <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2">
                                  💡 {item.note}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {applyTemplateId && (
        <ApplyTemplateDialog
          isOpen={true}
          onClose={() => setApplyTemplateId(null)}
          templateId={applyTemplateId}
          onSuccess={handleApplySuccess}
        />
      )}

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除模板"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个物资模板吗？已通过该模板创建的活动物资不会受到影响，该操作无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            确认删除
          </button>
        </div>
      </Modal>

      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg">
            <Package size={20} />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
