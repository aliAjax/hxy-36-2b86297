import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ListTodo,
  ShoppingCart,
  UserCheck,
  Users,
  ClipboardList,
  BarChart3,
  Trash2,
  Gift,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useActivityData } from '@/hooks/useActivityData';
import { useItemFilters } from '@/hooks/useItemFilters';
import { usePurchaseFilters } from '@/hooks/usePurchaseFilters';
import { useTodoFilters } from '@/hooks/useTodoFilters';
import { usePreClaimantFilters } from '@/hooks/usePreClaimantFilters';
import { useActivityDetailDialogs } from '@/hooks/useActivityDetailDialogs';
import { useToast } from '@/hooks/useToast';
import { ActivityHeader } from '@/components/activity-detail/ActivityHeader';
import { CountdownBanner } from '@/components/activity-detail/CountdownBanner';
import { StatsSection } from '@/components/activity-detail/StatsSection';
import { TabNavigation, TabType } from '@/components/activity-detail/TabNavigation';
import { ItemsTab } from '@/components/activity-detail/ItemsTab';
import { RecordsTab } from '@/components/activity-detail/RecordsTab';
import { ChartsTab } from '@/components/activity-detail/ChartsTab';
import { PurchaseTab } from '@/components/activity-detail/PurchaseTab';
import { TodosTab } from '@/components/activity-detail/TodosTab';
import { PreRegisterTab } from '@/components/activity-detail/PreRegisterTab';
import { ReportConfigModal } from '@/components/activity-detail/ReportConfigModal';
import { ItemForm } from '@/components/ItemForm';
import { ClaimForm } from '@/components/ClaimForm';
import { PurchaseItemForm } from '@/components/PurchaseItemForm';
import { PurchaseConvertDialog } from '@/components/PurchaseConvertDialog';
import { TodoForm } from '@/components/TodoForm';
import { PreClaimantForm } from '@/components/PreClaimantForm';
import { BatchClaimForm } from '@/components/BatchClaimForm';
import { SaveAsTemplateDialog } from '@/components/SaveAsTemplateDialog';
import { ApplyTemplateDialog } from '@/components/ApplyTemplateDialog';
import { Modal } from '@/components/Modal';
import { Item, PurchaseItem, Todo, PreClaimant } from '@/types';

export const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    addItem,
    updateItem,
    deleteItem,
    deleteRecord,
    addPurchaseItem,
    updatePurchaseItem,
    deletePurchaseItem,
    convertPurchaseToItem,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addPreClaimant,
    updatePreClaimant,
    deletePreClaimant,
    toggleKeyItem,
    purchaseItems,
  } = useAppStore();

  const {
    activity,
    activityItems,
    activityRecords,
    activityPurchaseItems,
    activityTodos,
    activityPreClaimants,
    keyItemIds,
    stats,
    consumptionData,
    typeDistributionData,
    pendingTodoCount,
  } = useActivityData(id);

  const itemFilters = useItemFilters({
    activityItems,
    keyItemIds,
  });

  const [recordSearchQuery, setRecordSearchQuery] = useState('');

  const purchaseFilters = usePurchaseFilters(activityPurchaseItems);

  const todoFilters = useTodoFilters({
    activityTodos,
    activity,
  });

  const preClaimantFilters = usePreClaimantFilters({
    activityPreClaimants,
    activityRecords,
  });

  const dialogs = useActivityDetailDialogs();
  const {
    setSelectedReportModules,
    setReportLowStockThreshold,
    setIsReportConfigOpen,
  } = dialogs;

  const { showSuccessToast, toastMessage, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('items');

  useEffect(() => {
    if (searchParams.get('openReportConfig') === 'true') {
      const modulesParam = searchParams.get('modules');
      if (modulesParam) {
        setSelectedReportModules(modulesParam.split(','));
      }
      const thresholdParam = searchParams.get('threshold');
      if (thresholdParam) {
        const val = parseInt(thresholdParam);
        if (!isNaN(val) && val > 0) {
          setReportLowStockThreshold(val);
        }
      }
      setIsReportConfigOpen(true);
      searchParams.delete('openReportConfig');
      searchParams.delete('modules');
      searchParams.delete('threshold');
      setSearchParams(searchParams, { replace: true });
    }
  }, [
    searchParams,
    setSearchParams,
    setSelectedReportModules,
    setReportLowStockThreshold,
    setIsReportConfigOpen,
  ]);

  const filteredRecords = useMemo(() => {
    return activityRecords.filter((record) => {
      const item = activityItems.find((i) => i.id === record.itemId);
      return (
        record.claimerName.toLowerCase().includes(recordSearchQuery.toLowerCase()) ||
        item?.name.toLowerCase().includes(recordSearchQuery.toLowerCase())
      );
    });
  }, [activityRecords, activityItems, recordSearchQuery]);

  const tabs = [
    { id: 'items' as TabType, label: '物资列表', icon: ListTodo, count: activityItems.length },
    {
      id: 'purchase' as TabType,
      label: '采购清单',
      icon: ShoppingCart,
      count: activityPurchaseItems.length,
    },
    {
      id: 'preregister' as TabType,
      label: '预登记',
      icon: UserCheck,
      count: activityPreClaimants.length,
    },
    { id: 'records' as TabType, label: '领取记录', icon: Users, count: activityRecords.length },
    { id: 'todos' as TabType, label: '待办事项', icon: ClipboardList, count: pendingTodoCount },
    { id: 'charts' as TabType, label: '数据图表', icon: BarChart3 },
  ];

  const handleItemSubmit = (data: Omit<Item, 'id' | 'createdAt'>) => {
    if (dialogs.editingItem) {
      updateItem(dialogs.editingItem.id, data);
    } else {
      addItem(data);
    }
    dialogs.setEditingItem(null);
  };

  const handleEditItem = (item: Item) => {
    dialogs.setEditingItem(item);
    dialogs.setIsItemFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    dialogs.setDeleteItemConfirm(itemId);
  };

  const confirmDeleteItem = () => {
    if (dialogs.deleteItemConfirm) {
      deleteItem(dialogs.deleteItemConfirm);
      dialogs.setDeleteItemConfirm(null);
    }
  };

  const confirmDeleteRecord = () => {
    if (dialogs.deleteRecordConfirm) {
      deleteRecord(dialogs.deleteRecordConfirm);
      dialogs.setDeleteRecordConfirm(null);
    }
  };

  const handleClaimSuccess = () => {
    showToast('领取登记成功！', 3000);
  };

  const handlePurchaseItemSubmit = (data: Omit<PurchaseItem, 'id' | 'createdAt'>) => {
    if (dialogs.editingPurchaseItem) {
      updatePurchaseItem(dialogs.editingPurchaseItem.id, data);
    } else {
      addPurchaseItem(data);
    }
    dialogs.setEditingPurchaseItem(null);
  };

  const handleEditPurchaseItem = (purchaseItem: PurchaseItem) => {
    dialogs.setEditingPurchaseItem(purchaseItem);
    dialogs.setIsPurchaseFormOpen(true);
  };

  const handleDeletePurchaseItem = (purchaseId: string) => {
    dialogs.setDeletePurchaseConfirm(purchaseId);
  };

  const confirmDeletePurchaseItem = () => {
    if (dialogs.deletePurchaseConfirm) {
      deletePurchaseItem(dialogs.deletePurchaseConfirm);
      dialogs.setDeletePurchaseConfirm(null);
    }
  };

  const handleConvertPurchaseItem = (purchaseId: string) => {
    const item = purchaseItems.find((p) => p.id === purchaseId);
    if (item) {
      dialogs.setConvertPurchaseItem(item);
    }
  };

  const confirmConvertPurchaseItem = (data: {
    designUrl: string;
    distributionRule: string;
    note: string;
  }) => {
    if (dialogs.convertPurchaseItem) {
      const result = convertPurchaseToItem(dialogs.convertPurchaseItem.id, data);
      if (result.success) {
        showToast('已成功转为正式物资！已自动跳转至物资列表。', 4000);
        setActiveTab('items');
      }
      dialogs.setConvertPurchaseItem(null);
    }
  };

  const handleTodoSubmit = (data: Omit<Todo, 'id' | 'createdAt'>) => {
    if (dialogs.editingTodo) {
      updateTodo(dialogs.editingTodo.id, data);
    } else {
      addTodo(data);
    }
    dialogs.setEditingTodo(null);
  };

  const handleEditTodo = (todo: Todo) => {
    dialogs.setEditingTodo(todo);
    dialogs.setIsTodoFormOpen(true);
  };

  const handleDeleteTodo = (todoId: string) => {
    dialogs.setDeleteTodoConfirm(todoId);
  };

  const confirmDeleteTodo = () => {
    if (dialogs.deleteTodoConfirm) {
      deleteTodo(dialogs.deleteTodoConfirm);
      dialogs.setDeleteTodoConfirm(null);
    }
  };

  const handlePreClaimantSubmit = (data: Omit<PreClaimant, 'id' | 'createdAt'>) => {
    if (dialogs.editingPreClaimant) {
      updatePreClaimant(dialogs.editingPreClaimant.id, data);
    } else {
      addPreClaimant(data);
    }
    dialogs.setEditingPreClaimant(null);
  };

  const handleEditPreClaimant = (preClaimant: PreClaimant) => {
    dialogs.setEditingPreClaimant(preClaimant);
    dialogs.setIsPreClaimantFormOpen(true);
  };

  const handleDeletePreClaimant = (preClaimantId: string) => {
    dialogs.setDeletePreClaimantConfirm(preClaimantId);
  };

  const confirmDeletePreClaimant = () => {
    if (dialogs.deletePreClaimantConfirm) {
      deletePreClaimant(dialogs.deletePreClaimantConfirm);
      dialogs.setDeletePreClaimantConfirm(null);
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
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <ActivityHeader
        activity={activity}
        activityId={id!}
        onReportConfig={() => dialogs.setIsReportConfigOpen(true)}
        onClaimForm={() => dialogs.setIsClaimFormOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <CountdownBanner
          activity={activity}
          pendingTodoCount={pendingTodoCount}
          totalTodoCount={activityTodos.length}
        />

        <StatsSection stats={stats} />

        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 mb-6 overflow-hidden">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

          <div className="p-6">
            {activeTab === 'items' && (
              <ItemsTab
                filteredItems={itemFilters.filteredItems}
                activityItems={activityItems}
                filteredLowStockItemsCount={itemFilters.filteredLowStockItemsCount}
                keyItemIds={keyItemIds}
                keyItemCount={itemFilters.keyItemCount}
                itemSearchQuery={itemFilters.itemSearchQuery}
                setItemSearchQuery={itemFilters.setItemSearchQuery}
                filterItemType={itemFilters.filterItemType}
                setFilterItemType={itemFilters.setFilterItemType}
                showOnlyKeyItems={itemFilters.showOnlyKeyItems}
                setShowOnlyKeyItems={itemFilters.setShowOnlyKeyItems}
                showOnlyLowStock={itemFilters.showOnlyLowStock}
                setShowOnlyLowStock={itemFilters.setShowOnlyLowStock}
                sortLowStockFirst={itemFilters.sortLowStockFirst}
                setSortLowStockFirst={itemFilters.setSortLowStockFirst}
                lowStockThreshold={itemFilters.lowStockThreshold}
                setLowStockThreshold={itemFilters.setLowStockThreshold}
                onAddItem={() => {
                  dialogs.setEditingItem(null);
                  dialogs.setIsItemFormOpen(true);
                }}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onToggleKeyItem={toggleKeyItem}
                onApplyTemplate={() => dialogs.setIsApplyTemplateOpen(true)}
                onSaveAsTemplate={() => dialogs.setIsSaveAsTemplateOpen(true)}
              />
            )}

            {activeTab === 'records' && (
              <RecordsTab
                filteredRecords={filteredRecords}
                activityRecords={activityRecords}
                activityItems={activityItems}
                recordSearchQuery={recordSearchQuery}
                setRecordSearchQuery={setRecordSearchQuery}
                onBatchClaim={() => dialogs.setIsBatchClaimFormOpen(true)}
                onDeleteRecord={(recordId) => dialogs.setDeleteRecordConfirm(recordId)}
              />
            )}

            {activeTab === 'charts' && (
              <ChartsTab
                consumptionData={consumptionData}
                typeDistributionData={typeDistributionData}
              />
            )}

            {activeTab === 'todos' && (
              <TodosTab
                filteredTodos={todoFilters.filteredTodos}
                activityTodos={activityTodos}
                todoSearchQuery={todoFilters.todoSearchQuery}
                setTodoSearchQuery={todoFilters.setTodoSearchQuery}
                filterTodoStatus={todoFilters.filterTodoStatus}
                setFilterTodoStatus={todoFilters.setFilterTodoStatus}
                todoViewMode={todoFilters.todoViewMode}
                setTodoViewMode={todoFilters.setTodoViewMode}
                groupedTodos={todoFilters.groupedTodos}
                countdownGroupConfig={todoFilters.countdownGroupConfig}
                onAddTodo={() => {
                  dialogs.setEditingTodo(null);
                  dialogs.setIsTodoFormOpen(true);
                }}
                onToggleTodo={toggleTodo}
                onEditTodo={handleEditTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            )}

            {activeTab === 'purchase' && (
              <PurchaseTab
                filteredPurchaseItems={purchaseFilters.filteredPurchaseItems}
                activityPurchaseItems={activityPurchaseItems}
                purchaseSearchQuery={purchaseFilters.purchaseSearchQuery}
                setPurchaseSearchQuery={purchaseFilters.setPurchaseSearchQuery}
                filterPurchaseStatus={purchaseFilters.filterPurchaseStatus}
                setFilterPurchaseStatus={purchaseFilters.setFilterPurchaseStatus}
                onAddPurchase={() => {
                  dialogs.setEditingPurchaseItem(null);
                  dialogs.setIsPurchaseFormOpen(true);
                }}
                onEditPurchase={handleEditPurchaseItem}
                onDeletePurchase={handleDeletePurchaseItem}
                onConvertPurchase={handleConvertPurchaseItem}
              />
            )}

            {activeTab === 'preregister' && (
              <PreRegisterTab
                filteredPreClaimants={preClaimantFilters.filteredPreClaimants}
                activityPreClaimants={activityPreClaimants}
                preClaimantSearchQuery={preClaimantFilters.preClaimantSearchQuery}
                setPreClaimantSearchQuery={preClaimantFilters.setPreClaimantSearchQuery}
                filterPreClaimantStatus={preClaimantFilters.filterPreClaimantStatus}
                setFilterPreClaimantStatus={preClaimantFilters.setFilterPreClaimantStatus}
                preClaimantStatusMap={preClaimantFilters.preClaimantStatusMap}
                preClaimantStatusCounts={preClaimantFilters.preClaimantStatusCounts}
                onAddPreClaimant={() => {
                  dialogs.setEditingPreClaimant(null);
                  dialogs.setIsPreClaimantFormOpen(true);
                }}
                onEditPreClaimant={handleEditPreClaimant}
                onDeletePreClaimant={handleDeletePreClaimant}
              />
            )}
          </div>
        </div>
      </div>

      <ItemForm
        isOpen={dialogs.isItemFormOpen}
        onClose={dialogs.closeItemForm}
        onSubmit={handleItemSubmit}
        activityId={id!}
        item={dialogs.editingItem}
      />

      <ClaimForm
        isOpen={dialogs.isClaimFormOpen}
        onClose={() => dialogs.setIsClaimFormOpen(false)}
        activityId={id!}
        items={activityItems.filter((i) => i.currentStock > 0)}
        onSuccess={handleClaimSuccess}
      />

      <PurchaseItemForm
        isOpen={dialogs.isPurchaseFormOpen}
        onClose={dialogs.closePurchaseForm}
        onSubmit={handlePurchaseItemSubmit}
        activityId={id!}
        purchaseItem={dialogs.editingPurchaseItem}
      />

      <TodoForm
        isOpen={dialogs.isTodoFormOpen}
        onClose={dialogs.closeTodoForm}
        onSubmit={handleTodoSubmit}
        activityId={id!}
        todo={dialogs.editingTodo}
      />

      <PreClaimantForm
        isOpen={dialogs.isPreClaimantFormOpen}
        onClose={dialogs.closePreClaimantForm}
        onSubmit={handlePreClaimantSubmit}
        activityId={id!}
        preClaimant={dialogs.editingPreClaimant}
      />

      <BatchClaimForm
        isOpen={dialogs.isBatchClaimFormOpen}
        onClose={() => dialogs.setIsBatchClaimFormOpen(false)}
        activityId={id!}
        items={activityItems}
        onSuccess={(result) => {
          showToast(`批量导入完成：成功 ${result.successCount} 条，失败 ${result.failCount} 条`, 4000);
        }}
      />

      <SaveAsTemplateDialog
        isOpen={dialogs.isSaveAsTemplateOpen}
        onClose={() => dialogs.setIsSaveAsTemplateOpen(false)}
        activityId={id!}
        items={activityItems}
        onSuccess={() => {
          showToast('已保存为物资模板！', 3000);
        }}
      />

      {dialogs.isApplyTemplateOpen && (
        <ApplyTemplateDialog
          isOpen={true}
          onClose={() => dialogs.setIsApplyTemplateOpen(false)}
          preselectedActivityId={id!}
          onSuccess={(count) => {
            dialogs.setIsApplyTemplateOpen(false);
            showToast(`已从模板创建 ${count} 项物资`, 3000);
          }}
        />
      )}

      <Modal
        isOpen={!!dialogs.deleteItemConfirm}
        onClose={() => dialogs.setDeleteItemConfirm(null)}
        title="确认删除物资"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个物资吗？该操作将同时删除该物资的所有领取记录，且无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => dialogs.setDeleteItemConfirm(null)}
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

      <Modal
        isOpen={!!dialogs.deleteRecordConfirm}
        onClose={() => dialogs.setDeleteRecordConfirm(null)}
        title="确认删除领取记录"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这条领取记录吗？删除后库存将自动恢复。</p>
        <div className="flex gap-3">
          <button
            onClick={() => dialogs.setDeleteRecordConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDeleteRecord}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            确认删除
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!dialogs.deletePurchaseConfirm}
        onClose={() => dialogs.setDeletePurchaseConfirm(null)}
        title="确认删除采购计划"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这个采购计划吗？该操作无法恢复。</p>
        <div className="flex gap-3">
          <button
            onClick={() => dialogs.setDeletePurchaseConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDeletePurchaseItem}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            确认删除
          </button>
        </div>
      </Modal>

      <PurchaseConvertDialog
        isOpen={!!dialogs.convertPurchaseItem}
        onClose={() => dialogs.setConvertPurchaseItem(null)}
        onConfirm={confirmConvertPurchaseItem}
        purchaseItem={dialogs.convertPurchaseItem}
      />

      <Modal
        isOpen={!!dialogs.deleteTodoConfirm}
        onClose={() => dialogs.setDeleteTodoConfirm(null)}
        title="确认删除待办"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这个待办事项吗？该操作无法恢复。</p>
        <div className="flex gap-3">
          <button
            onClick={() => dialogs.setDeleteTodoConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDeleteTodo}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            确认删除
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!dialogs.deletePreClaimantConfirm}
        onClose={() => dialogs.setDeletePreClaimantConfirm(null)}
        title="确认删除预登记"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这条预登记信息吗？该操作无法恢复。</p>
        <div className="flex gap-3">
          <button
            onClick={() => dialogs.setDeletePreClaimantConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmDeletePreClaimant}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="inline mr-2" />
            确认删除
          </button>
        </div>
      </Modal>

      <ReportConfigModal
        isOpen={dialogs.isReportConfigOpen}
        onClose={() => dialogs.setIsReportConfigOpen(false)}
        selectedModules={dialogs.selectedReportModules}
        setSelectedModules={dialogs.setSelectedReportModules}
        lowStockThreshold={dialogs.reportLowStockThreshold}
        setLowStockThreshold={dialogs.setReportLowStockThreshold}
      />

      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg">
            <Gift size={20} />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
