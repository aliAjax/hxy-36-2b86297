import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Activity,
  Item,
  ClaimRecord,
  PurchaseItem,
  AppData,
  ActivityStats,
  ConsumptionData,
  TypeDistributionData,
  ItemType,
  ITEM_TYPE_CONFIG,
  Todo,
  PreClaimant,
  HealthCheckResult,
  HealthIssue,
  MaterialTemplate,
  MaterialTemplateItem,
  TemplateApplyAdjustments,
  MergeResult,
  MergeFieldSummary,
} from '@/types';
import { generateId, getDateKey } from '@/utils/helpers';

interface AppState {
  activities: Activity[];
  items: Item[];
  records: ClaimRecord[];
  purchaseItems: PurchaseItem[];
  todos: Todo[];
  preClaimants: PreClaimant[];
  keyItemIds: string[];

  materialTemplates: MaterialTemplate[];

  addActivity: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  addTodo: (data: Omit<Todo, 'id' | 'createdAt'>) => void;
  updateTodo: (id: string, data: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;

  addItem: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, data: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addRecord: (
    data: Omit<ClaimRecord, 'id' | 'createdAt' | 'isDuplicateWarning'>,
    forceAdd?: boolean
  ) => {
    success: boolean;
    isDuplicate: boolean;
    record?: ClaimRecord;
  };
  addRecordsBatch: (
    data: Omit<ClaimRecord, 'id' | 'createdAt' | 'isDuplicateWarning'>[],
    forceAddDuplicates?: boolean
  ) => {
    successCount: number;
    failCount: number;
    results: {
      index: number;
      success: boolean;
      isDuplicate: boolean;
      error?: string;
      record?: ClaimRecord;
    }[];
  };
  deleteRecord: (id: string) => void;

  addPurchaseItem: (data: Omit<PurchaseItem, 'id' | 'createdAt'>) => void;
  updatePurchaseItem: (id: string, data: Partial<PurchaseItem>) => void;
  deletePurchaseItem: (id: string) => void;
  convertPurchaseToItem: (purchaseId: string, extraData?: { designUrl?: string; distributionRule?: string; note?: string }) => { success: boolean; item?: Item; error?: string };

  addPreClaimant: (data: Omit<PreClaimant, 'id' | 'createdAt'>) => void;
  updatePreClaimant: (id: string, data: Partial<PreClaimant>) => void;
  deletePreClaimant: (id: string) => void;
  findPreClaimantByName: (activityId: string, name: string) => PreClaimant | undefined;

  toggleKeyItem: (itemId: string) => void;
  isKeyItem: (itemId: string) => boolean;

  addMaterialTemplate: (data: Omit<MaterialTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterialTemplate: (id: string, data: Partial<MaterialTemplate>) => void;
  deleteMaterialTemplate: (id: string) => void;
  saveActivityAsTemplate: (
    activityId: string,
    templateName: string,
    description: string,
    selectedItemIds?: string[]
  ) => { success: boolean; template?: MaterialTemplate; error?: string };
  applyTemplateToActivity: (
    templateId: string,
    targetActivityId: string,
    adjustments: TemplateApplyAdjustments
  ) => { success: boolean; createdItems: Item[]; error?: string };

  exportData: () => string;
  importData: (data: AppData) => { success: boolean; error?: string };
  mergeData: (data: AppData) => MergeResult;
  clearAllData: () => void;

  checkDuplicateClaim: (activityId: string, itemId: string, claimerName: string) => boolean;
  getActivityStats: (activityId: string) => ActivityStats;
  getItemConsumptionData: (activityId: string) => ConsumptionData[];
  getTypeDistributionData: (activityId: string) => TypeDistributionData[];
  getTodayClaimQuantity: (activityId: string, itemId?: string) => number;
  getRecentRecords: (activityId: string, limit?: number) => ClaimRecord[];

  runHealthCheck: () => HealthCheckResult;
  fixOrphanItems: () => { deletedCount: number; deletedIds: string[] };
  fixOrphanRecords: () => { deletedCount: number; deletedIds: string[] };
  fixNegativeStock: () => { fixedCount: number; fixedIds: string[] };
  fixStockMismatch: () => { fixedCount: number; fixedIds: string[] };
  fixMissingActivityDate: () => { fixedCount: number; fixedIds: string[] };
  fixMissingActivityStatus: () => { fixedCount: number; fixedIds: string[] };
  fixAllIssues: () => {
    orphanItemsDeleted: number;
    orphanRecordsDeleted: number;
    negativeStockFixed: number;
    stockMismatchFixed: number;
    missingDateFixed: number;
    missingStatusFixed: number;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: [],
      items: [],
      records: [],
      purchaseItems: [],
      todos: [],
      preClaimants: [],
      keyItemIds: [],
      materialTemplates: [],

      addActivity: (data) => {
        const now = new Date().toISOString();
        const newActivity: Activity = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
      },

      updateActivity: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: now } : a
          ),
        }));
      },

      deleteActivity: (id) => {
        set((state) => {
          const activityItemIds = state.items
            .filter((i) => i.activityId === id)
            .map((i) => i.id);
          return {
            activities: state.activities.filter((a) => a.id !== id),
            items: state.items.filter((i) => i.activityId !== id),
            records: state.records.filter((r) => r.activityId !== id),
            purchaseItems: state.purchaseItems.filter((p) => p.activityId !== id),
            todos: state.todos.filter((t) => t.activityId !== id),
            preClaimants: state.preClaimants.filter((p) => p.activityId !== id),
            keyItemIds: state.keyItemIds.filter((kid) => !activityItemIds.includes(kid)),
          };
        });
      },

      addTodo: (data) => {
        const newTodo: Todo = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          todos: [...state.todos, newTodo],
        }));
      },

      updateTodo: (id, data) => {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        }));
      },

      addItem: (data) => {
        const newItem: Item = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, data) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          records: state.records.filter((r) => r.itemId !== id),
          keyItemIds: state.keyItemIds.filter((kid) => kid !== id),
        }));
      },

      addRecord: (data, forceAdd = false) => {
        const { itemId, quantity, activityId } = data;
        const state = get();

        const item = state.items.find((i) => i.id === itemId);
        if (!item) {
          return { success: false, isDuplicate: false };
        }

        if (item.currentStock < quantity) {
          return { success: false, isDuplicate: false };
        }

        const isDuplicate = state.checkDuplicateClaim(activityId, itemId, data.claimerName);
        if (isDuplicate && !forceAdd) {
          return { success: false, isDuplicate: true };
        }

        const newRecord: ClaimRecord = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isDuplicateWarning: isDuplicate,
        };

        set((state) => ({
          records: [...state.records, newRecord],
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, currentStock: i.currentStock - quantity } : i
          ),
        }));

        return { success: true, isDuplicate, record: newRecord };
      },

      addRecordsBatch: (data, forceAddDuplicates = false) => {
        const state = get();
        const results: {
          index: number;
          success: boolean;
          isDuplicate: boolean;
          error?: string;
          record?: ClaimRecord;
        }[] = [];
        const newRecords: ClaimRecord[] = [];
        const stockUpdates: Map<string, number> = new Map();
        const batchClaims: Set<string> = new Set();

        data.forEach((recordData, index) => {
          const { itemId, quantity, activityId, claimerName } = recordData;

          const item = state.items.find((i) => i.id === itemId);
          if (!item) {
            results.push({
              index,
              success: false,
              isDuplicate: false,
              error: '找不到该物资',
            });
            return;
          }

          const claimKey = `${claimerName.trim().toLowerCase()}|${itemId}`;
          const isBatchDuplicate = batchClaims.has(claimKey);
          if (isBatchDuplicate && !forceAddDuplicates) {
            results.push({
              index,
              success: false,
              isDuplicate: true,
              error: '本批次内重复领取',
            });
            return;
          }

          const isHistoricalDuplicate = state.checkDuplicateClaim(activityId, itemId, claimerName);
          if (isHistoricalDuplicate && !forceAddDuplicates) {
            results.push({
              index,
              success: false,
              isDuplicate: true,
              error: '重复领取',
            });
            return;
          }

          const allocatedQuantity = stockUpdates.get(itemId) || 0;
          const availableStock = item.currentStock - allocatedQuantity;
          if (availableStock < quantity) {
            results.push({
              index,
              success: false,
              isDuplicate: false,
              error: `库存不足，剩余 ${availableStock} 个`,
            });
            return;
          }

          const newRecord: ClaimRecord = {
            ...recordData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            isDuplicateWarning: isHistoricalDuplicate || isBatchDuplicate,
          };

          newRecords.push(newRecord);
          stockUpdates.set(itemId, allocatedQuantity + quantity);
          batchClaims.add(claimKey);
          results.push({
            index,
            success: true,
            isDuplicate: isHistoricalDuplicate || isBatchDuplicate,
            record: newRecord,
          });
        });

        set((state) => ({
          records: [...state.records, ...newRecords],
          items: state.items.map((i) => {
            const allocated = stockUpdates.get(i.id);
            if (allocated !== undefined) {
              return { ...i, currentStock: i.currentStock - allocated };
            }
            return i;
          }),
        }));

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        return { successCount, failCount, results };
      },

      deleteRecord: (id) => {
        const state = get();
        const record = state.records.find((r) => r.id === id);
        if (!record) return;

        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          items: state.items.map((i) =>
            i.id === record.itemId
              ? { ...i, currentStock: i.currentStock + record.quantity }
              : i
          ),
        }));
      },

      addPurchaseItem: (data) => {
        const newPurchaseItem: PurchaseItem = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          purchaseItems: [...state.purchaseItems, newPurchaseItem],
        }));
      },

      updatePurchaseItem: (id, data) => {
        set((state) => ({
          purchaseItems: state.purchaseItems.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deletePurchaseItem: (id) => {
        set((state) => ({
          purchaseItems: state.purchaseItems.filter((p) => p.id !== id),
        }));
      },

      convertPurchaseToItem: (purchaseId, extraData) => {
        const state = get();
        const purchaseItem = state.purchaseItems.find((p) => p.id === purchaseId);

        if (!purchaseItem) {
          return { success: false, error: '采购记录不存在' };
        }

        if (purchaseItem.status !== 'completed') {
          return { success: false, error: '只有已完成的采购才能转为正式物资' };
        }

        const newItem: Item = {
          id: generateId(),
          activityId: purchaseItem.activityId,
          name: purchaseItem.name,
          type: purchaseItem.type,
          designUrl: extraData?.designUrl || '',
          budget: purchaseItem.budget,
          supplier: purchaseItem.supplier,
          totalStock: purchaseItem.expectedQuantity,
          currentStock: purchaseItem.expectedQuantity,
          distributionRule: extraData?.distributionRule || '',
          note: extraData?.note !== undefined ? extraData.note : purchaseItem.note,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          items: [...state.items, newItem],
          purchaseItems: state.purchaseItems.filter((p) => p.id !== purchaseId),
        }));

        return { success: true, item: newItem };
      },

      addPreClaimant: (data) => {
        const newPreClaimant: PreClaimant = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          preClaimants: [...state.preClaimants, newPreClaimant],
        }));
      },

      updatePreClaimant: (id, data) => {
        set((state) => ({
          preClaimants: state.preClaimants.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }));
      },

      deletePreClaimant: (id) => {
        set((state) => ({
          preClaimants: state.preClaimants.filter((p) => p.id !== id),
        }));
      },

      findPreClaimantByName: (activityId, name) => {
        const state = get();
        return state.preClaimants.find(
          (p) =>
            p.activityId === activityId &&
            p.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
      },

      toggleKeyItem: (itemId) => {
        set((state) => {
          const exists = state.keyItemIds.includes(itemId);
          return {
            keyItemIds: exists
              ? state.keyItemIds.filter((id) => id !== itemId)
              : [...state.keyItemIds, itemId],
          };
        });
      },

      isKeyItem: (itemId) => {
        return get().keyItemIds.includes(itemId);
      },

      addMaterialTemplate: (data) => {
        const now = new Date().toISOString();
        const newTemplate: MaterialTemplate = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          materialTemplates: [...state.materialTemplates, newTemplate],
        }));
      },

      updateMaterialTemplate: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          materialTemplates: state.materialTemplates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: now } : t
          ),
        }));
      },

      deleteMaterialTemplate: (id) => {
        set((state) => ({
          materialTemplates: state.materialTemplates.filter((t) => t.id !== id),
        }));
      },

      saveActivityAsTemplate: (activityId, templateName, description, selectedItemIds) => {
        const state = get();
        const activity = state.activities.find((a) => a.id === activityId);
        if (!activity) {
          return { success: false, error: '活动不存在' };
        }

        const activityItems = selectedItemIds
          ? state.items.filter((i) => i.activityId === activityId && selectedItemIds.includes(i.id))
          : state.items.filter((i) => i.activityId === activityId);

        if (activityItems.length === 0) {
          return { success: false, error: '该活动没有物资可保存为模板' };
        }

        const templateItems: MaterialTemplateItem[] = activityItems.map((item) => ({
          id: generateId(),
          name: item.name,
          type: item.type,
          designUrl: item.designUrl,
          budget: item.budget,
          supplier: item.supplier,
          totalStock: item.totalStock,
          distributionRule: item.distributionRule,
          note: item.note,
        }));

        const now = new Date().toISOString();
        const newTemplate: MaterialTemplate = {
          id: generateId(),
          name: templateName,
          description,
          items: templateItems,
          sourceActivityId: activityId,
          sourceActivityName: activity.name,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          materialTemplates: [...state.materialTemplates, newTemplate],
        }));

        return { success: true, template: newTemplate };
      },

      applyTemplateToActivity: (templateId, targetActivityId, adjustments) => {
        const state = get();
        const template = state.materialTemplates.find((t) => t.id === templateId);
        if (!template) {
          return { success: false, createdItems: [], error: '模板不存在' };
        }

        const targetActivity = state.activities.find((a) => a.id === targetActivityId);
        if (!targetActivity) {
          return { success: false, createdItems: [], error: '目标活动不存在' };
        }

        let itemsToCreate = template.items;
        if (adjustments.selectedItemIds && adjustments.selectedItemIds.length > 0) {
          itemsToCreate = template.items.filter((item) =>
            adjustments.selectedItemIds!.includes(item.id)
          );
        }

        if (itemsToCreate.length === 0) {
          return { success: false, createdItems: [], error: '请至少选择一项物资' };
        }

        const createdItems: Item[] = itemsToCreate.map((templateItem) => {
          const adjustedStock = Math.round(templateItem.totalStock * adjustments.stockMultiplier);
          const adjustedBudget = Math.round(templateItem.budget * adjustments.budgetMultiplier);
          const finalSupplier = adjustments.supplierOverride.trim() || templateItem.supplier;

          return {
            id: generateId(),
            activityId: targetActivityId,
            name: templateItem.name,
            type: templateItem.type,
            designUrl: templateItem.designUrl,
            budget: adjustedBudget,
            supplier: finalSupplier,
            totalStock: adjustedStock,
            currentStock: adjustedStock,
            distributionRule: templateItem.distributionRule,
            note: templateItem.note,
            createdAt: new Date().toISOString(),
          };
        });

        set((state) => ({
          items: [...state.items, ...createdItems],
        }));

        return { success: true, createdItems };
      },

      exportData: () => {
        const state = get();
        const exportObj: AppData = {
          activities: state.activities,
          items: state.items,
          records: state.records,
          purchaseItems: state.purchaseItems,
          todos: state.todos,
          preClaimants: state.preClaimants,
          materialTemplates: state.materialTemplates,
          keyItemIds: state.keyItemIds,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (data) => {
        try {
          if (
            !Array.isArray(data.activities) ||
            !Array.isArray(data.items) ||
            !Array.isArray(data.records)
          ) {
            return { success: false, error: '数据格式不正确' };
          }

          type TemplateItemWithOptionalId = Omit<MaterialTemplateItem, 'id'> & { id?: string };
          type TemplateWithOptionalId = Omit<MaterialTemplate, 'items'> & {
            items: TemplateItemWithOptionalId[];
          };

          const migratedTemplates: MaterialTemplate[] = Array.isArray(data.materialTemplates)
            ? (data.materialTemplates as TemplateWithOptionalId[]).map((template) => ({
                ...template,
                items: template.items.map((item) => ({
                  ...item,
                  id: item.id || generateId(),
                })),
              }))
            : [];

          set({
            activities: data.activities,
            items: data.items,
            records: data.records,
            purchaseItems: Array.isArray(data.purchaseItems) ? data.purchaseItems : [],
            todos: Array.isArray(data.todos) ? data.todos : [],
            preClaimants: Array.isArray(data.preClaimants) ? data.preClaimants : [],
            materialTemplates: migratedTemplates,
            keyItemIds: Array.isArray(data.keyItemIds) ? data.keyItemIds : [],
          });
          return { success: true };
        } catch (e) {
          return { success: false, error: e instanceof Error ? e.message : '未知错误' };
        }
      },

      mergeData: (data) => {
        try {
          const state = get();

          if (
            !Array.isArray(data.activities) ||
            !Array.isArray(data.items) ||
            !Array.isArray(data.records)
          ) {
            return { success: false, error: '数据格式不正确' };
          }

          const localActivityIds = new Set(state.activities.map((a) => a.id));
          const localItemIds = new Set(state.items.map((i) => i.id));
          const localTemplateIds = new Set(state.materialTemplates.map((t) => t.id));
          const localRecordIds = new Set(state.records.map((r) => r.id));
          const localPurchaseIds = new Set(state.purchaseItems.map((p) => p.id));
          const localTodoIds = new Set(state.todos.map((t) => t.id));
          const localPreClaimantIds = new Set(state.preClaimants.map((p) => p.id));

          const activityIdMap = new Map<string, string>();
          const itemIdMap = new Map<string, string>();
          const templateIdMap = new Map<string, string>();

          const activitySummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const itemSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const recordSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const purchaseSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const todoSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const preClaimantSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };
          const templateSummary: MergeFieldSummary = { kept: 0, added: 0, renamed: 0 };

          activitySummary.kept = state.activities.length;
          itemSummary.kept = state.items.length;
          recordSummary.kept = state.records.length;
          purchaseSummary.kept = state.purchaseItems.length;
          todoSummary.kept = state.todos.length;
          preClaimantSummary.kept = state.preClaimants.length;
          templateSummary.kept = state.materialTemplates.length;

          const mergedActivities: Activity[] = [...state.activities];
          data.activities.forEach((activity) => {
            if (!localActivityIds.has(activity.id)) {
              mergedActivities.push(activity);
              activityIdMap.set(activity.id, activity.id);
              activitySummary.added++;
            } else {
              const newId = generateId();
              activityIdMap.set(activity.id, newId);
              mergedActivities.push({ ...activity, id: newId });
              activitySummary.renamed++;
              activitySummary.added++;
            }
          });

          const mergedItems: Item[] = [...state.items];
          data.items.forEach((item) => {
            const mappedActivityId = activityIdMap.get(item.activityId) || item.activityId;
            if (!localItemIds.has(item.id)) {
              const newItem = { ...item, activityId: mappedActivityId };
              mergedItems.push(newItem);
              itemIdMap.set(item.id, item.id);
              itemSummary.added++;
            } else {
              const newId = generateId();
              itemIdMap.set(item.id, newId);
              mergedItems.push({ ...item, id: newId, activityId: mappedActivityId });
              itemSummary.renamed++;
              itemSummary.added++;
            }
          });

          const mergedRecords: ClaimRecord[] = [...state.records];
          data.records.forEach((record) => {
            const mappedActivityId = activityIdMap.get(record.activityId) || record.activityId;
            const mappedItemId = itemIdMap.get(record.itemId) || record.itemId;

            if (!localRecordIds.has(record.id)) {
              mergedRecords.push({
                ...record,
                activityId: mappedActivityId,
                itemId: mappedItemId,
              });
              recordSummary.added++;
            } else {
              const newId = generateId();
              mergedRecords.push({
                ...record,
                id: newId,
                activityId: mappedActivityId,
                itemId: mappedItemId,
              });
              recordSummary.renamed++;
              recordSummary.added++;
            }
          });

          const importPurchaseItems = Array.isArray(data.purchaseItems) ? data.purchaseItems : [];
          const mergedPurchaseItems: PurchaseItem[] = [...state.purchaseItems];
          importPurchaseItems.forEach((item) => {
            const mappedActivityId = activityIdMap.get(item.activityId) || item.activityId;
            if (!localPurchaseIds.has(item.id)) {
              mergedPurchaseItems.push({ ...item, activityId: mappedActivityId });
              purchaseSummary.added++;
            } else {
              const newId = generateId();
              mergedPurchaseItems.push({ ...item, id: newId, activityId: mappedActivityId });
              purchaseSummary.renamed++;
              purchaseSummary.added++;
            }
          });

          const importTodos = Array.isArray(data.todos) ? data.todos : [];
          const mergedTodos: Todo[] = [...state.todos];
          importTodos.forEach((todo) => {
            const mappedActivityId = activityIdMap.get(todo.activityId) || todo.activityId;
            if (!localTodoIds.has(todo.id)) {
              mergedTodos.push({ ...todo, activityId: mappedActivityId });
              todoSummary.added++;
            } else {
              const newId = generateId();
              mergedTodos.push({ ...todo, id: newId, activityId: mappedActivityId });
              todoSummary.renamed++;
              todoSummary.added++;
            }
          });

          const importPreClaimants = Array.isArray(data.preClaimants) ? data.preClaimants : [];
          const mergedPreClaimants: PreClaimant[] = [...state.preClaimants];
          importPreClaimants.forEach((p) => {
            const mappedActivityId = activityIdMap.get(p.activityId) || p.activityId;
            if (!localPreClaimantIds.has(p.id)) {
              mergedPreClaimants.push({ ...p, activityId: mappedActivityId });
              preClaimantSummary.added++;
            } else {
              const newId = generateId();
              mergedPreClaimants.push({ ...p, id: newId, activityId: mappedActivityId });
              preClaimantSummary.renamed++;
              preClaimantSummary.added++;
            }
          });

          type TemplateItemWithOptionalId = Omit<MaterialTemplateItem, 'id'> & { id?: string };
          type TemplateWithOptionalId = Omit<MaterialTemplate, 'items'> & {
            items: TemplateItemWithOptionalId[];
          };

          const importTemplates = Array.isArray(data.materialTemplates)
            ? (data.materialTemplates as TemplateWithOptionalId[])
            : [];
          const mergedTemplates: MaterialTemplate[] = [...state.materialTemplates];
          importTemplates.forEach((template) => {
            const migratedItems: MaterialTemplateItem[] = template.items.map((item) => ({
              ...item,
              id: item.id || generateId(),
            }));

            if (!localTemplateIds.has(template.id)) {
              const newTemplate: MaterialTemplate = {
                ...template,
                items: migratedItems,
              } as MaterialTemplate;
              mergedTemplates.push(newTemplate);
              templateIdMap.set(template.id, template.id);
              templateSummary.added++;
            } else {
              const newId = generateId();
              templateIdMap.set(template.id, newId);
              const newTemplate: MaterialTemplate = {
                ...template,
                id: newId,
                items: migratedItems,
              } as MaterialTemplate;
              mergedTemplates.push(newTemplate);
              templateSummary.renamed++;
              templateSummary.added++;
            }
          });

          const importKeyItemIds = Array.isArray(data.keyItemIds) ? data.keyItemIds : [];
          const mergedKeyItemIds: string[] = [...state.keyItemIds];
          importKeyItemIds.forEach((itemId) => {
            const mappedId = itemIdMap.get(itemId) || itemId;
            if (!mergedKeyItemIds.includes(mappedId)) {
              mergedKeyItemIds.push(mappedId);
            }
          });

          set({
            activities: mergedActivities,
            items: mergedItems,
            records: mergedRecords,
            purchaseItems: mergedPurchaseItems,
            todos: mergedTodos,
            preClaimants: mergedPreClaimants,
            materialTemplates: mergedTemplates,
            keyItemIds: mergedKeyItemIds,
          });

          return {
            success: true,
            summary: {
              activities: activitySummary,
              items: itemSummary,
              records: recordSummary,
              purchaseItems: purchaseSummary,
              todos: todoSummary,
              preClaimants: preClaimantSummary,
              materialTemplates: templateSummary,
            },
          };
        } catch (e) {
          return { success: false, error: e instanceof Error ? e.message : '未知错误' };
        }
      },

      clearAllData: () => {
        set({
          activities: [],
          items: [],
          records: [],
          purchaseItems: [],
          todos: [],
          preClaimants: [],
          materialTemplates: [],
          keyItemIds: [],
        });
      },

      checkDuplicateClaim: (activityId, itemId, claimerName) => {
        const state = get();
        return state.records.some(
          (r) =>
            r.activityId === activityId &&
            r.itemId === itemId &&
            r.claimerName.trim().toLowerCase() === claimerName.trim().toLowerCase()
        );
      },

      getActivityStats: (activityId) => {
        const state = get();
        const activityItems = state.items.filter((i) => i.activityId === activityId);
        const activityRecords = state.records.filter((r) => r.activityId === activityId);

        const totalStock = activityItems.reduce((sum, i) => sum + i.totalStock, 0);
        const remainingStock = activityItems.reduce((sum, i) => sum + i.currentStock, 0);
        const distributedStock = totalStock - remainingStock;
        const totalBudget = activityItems.reduce((sum, i) => sum + i.budget, 0);
        const uniqueClaimers = new Set(activityRecords.map((r) => r.claimerName)).size;

        return {
          totalItems: activityItems.length,
          totalStock,
          distributedStock,
          remainingStock,
          totalBudget,
          totalClaims: activityRecords.length,
          uniqueClaimers,
        };
      },

      getItemConsumptionData: (activityId) => {
        const state = get();
        const activityRecords = state.records.filter((r) => r.activityId === activityId);

        const dateMap = new Map<string, number>();
        activityRecords.forEach((r) => {
          const dateKey = getDateKey(r.createdAt);
          dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + r.quantity);
        });

        const sortedDates = Array.from(dateMap.keys()).sort();
        return sortedDates.map((date) => ({
          date,
          quantity: dateMap.get(date) || 0,
        }));
      },

      getTypeDistributionData: (activityId) => {
        const state = get();
        const activityItems = state.items.filter((i) => i.activityId === activityId);

        const typeMap = new Map<ItemType, number>();
        activityItems.forEach((i) => {
          typeMap.set(i.type, (typeMap.get(i.type) || 0) + (i.totalStock - i.currentStock));
        });

        const types: ItemType[] = ['lightstick', 'banner', 'sticker', 'freepack', 'lottery', 'other'];
        return types
          .filter((t) => (typeMap.get(t) || 0) > 0)
          .map((type) => ({
            type,
            name: ITEM_TYPE_CONFIG[type].label,
            value: typeMap.get(type) || 0,
            color: ITEM_TYPE_CONFIG[type].color,
          }));
      },

      getTodayClaimQuantity: (activityId, itemId) => {
        const state = get();
        const today = getDateKey(new Date().toISOString());
        return state.records
          .filter((r) => {
            if (r.activityId !== activityId) return false;
            if (itemId && r.itemId !== itemId) return false;
            return getDateKey(r.createdAt) === today;
          })
          .reduce((sum, r) => sum + r.quantity, 0);
      },

      getRecentRecords: (activityId, limit = 10) => {
        const state = get();
        return state.records
          .filter((r) => r.activityId === activityId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },

      runHealthCheck: () => {
        const state = get();
        const issues: HealthIssue[] = [];

        const activityIds = new Set(state.activities.map((a) => a.id));
        const itemIds = new Set(state.items.map((i) => i.id));

        const orphanItems = state.items.filter((i) => !activityIds.has(i.activityId));
        if (orphanItems.length > 0) {
          issues.push({
            type: 'orphan_item',
            severity: 'error',
            title: '孤儿物资',
            description: '存在没有对应活动的物资数据',
            affectedIds: orphanItems.map((i) => i.id),
            affectedItems: orphanItems.map((i) => ({
              id: i.id,
              name: i.name,
              detail: `所属活动ID: ${i.activityId}（不存在）`,
            })),
            fixable: true,
            fixDescription: '删除所有孤儿物资',
          });
        }

        const orphanRecords = state.records.filter(
          (r) => !activityIds.has(r.activityId) || !itemIds.has(r.itemId)
        );
        if (orphanRecords.length > 0) {
          issues.push({
            type: 'orphan_record',
            severity: 'error',
            title: '孤儿领取记录',
            description: '存在没有对应活动或物资的领取记录',
            affectedIds: orphanRecords.map((r) => r.id),
            affectedItems: orphanRecords.map((r) => {
              const hasActivity = activityIds.has(r.activityId);
              const hasItem = itemIds.has(r.itemId);
              let detail = '';
              if (!hasActivity && !hasItem) {
                detail = '活动和物资均不存在';
              } else if (!hasActivity) {
                detail = '所属活动不存在';
              } else {
                detail = '对应物资不存在';
              }
              return {
                id: r.id,
                name: r.claimerName,
                detail,
              };
            }),
            fixable: true,
            fixDescription: '删除所有孤儿领取记录',
          });
        }

        const negativeStockItems = state.items.filter((i) => i.currentStock < 0);
        if (negativeStockItems.length > 0) {
          issues.push({
            type: 'negative_stock',
            severity: 'error',
            title: '库存为负',
            description: '存在库存数量为负数的物资',
            affectedIds: negativeStockItems.map((i) => i.id),
            affectedItems: negativeStockItems.map((i) => ({
              id: i.id,
              name: i.name,
              detail: `当前库存: ${i.currentStock}`,
            })),
            fixable: true,
            fixDescription: '将负库存重置为 0',
          });
        }

        const stockMismatchItems: Item[] = [];
        state.items.forEach((item) => {
          const itemRecords = state.records.filter((r) => r.itemId === item.id);
          const totalClaimed = itemRecords.reduce((sum, r) => sum + r.quantity, 0);
          const calculatedStock = item.totalStock - totalClaimed;
          if (calculatedStock !== item.currentStock) {
            stockMismatchItems.push(item);
          }
        });
        if (stockMismatchItems.length > 0) {
          issues.push({
            type: 'stock_mismatch',
            severity: 'warning',
            title: '库存不一致',
            description: '物资的已发放数量与实际记录数量不一致',
            affectedIds: stockMismatchItems.map((i) => i.id),
            affectedItems: stockMismatchItems.map((i) => {
              const itemRecords = state.records.filter((r) => r.itemId === i.id);
              const totalClaimed = itemRecords.reduce((sum, r) => sum + r.quantity, 0);
              const calculatedStock = i.totalStock - totalClaimed;
              return {
                id: i.id,
                name: i.name,
                detail: `记录库存: ${i.currentStock}, 计算库存: ${calculatedStock} (总库存 ${i.totalStock} - 已领取 ${totalClaimed})`,
              };
            }),
            fixable: true,
            fixDescription: '根据领取记录重新计算并修正库存',
          });
        }

        const missingDateActivities = state.activities.filter(
          (a) => !a.date || a.date.trim() === ''
        );
        if (missingDateActivities.length > 0) {
          issues.push({
            type: 'missing_activity_date',
            severity: 'warning',
            title: '活动日期缺失',
            description: '存在未设置日期的活动',
            affectedIds: missingDateActivities.map((a) => a.id),
            affectedItems: missingDateActivities.map((a) => ({
              id: a.id,
              name: a.name,
              detail: '日期字段为空',
            })),
            fixable: true,
            fixDescription: '将缺失日期的活动日期设为创建日期',
          });
        }

        const missingStatusActivities = state.activities.filter(
          (a) => !a.status || a.status.trim() === ''
        );
        if (missingStatusActivities.length > 0) {
          issues.push({
            type: 'missing_activity_status',
            severity: 'warning',
            title: '活动状态缺失',
            description: '存在未设置状态的活动',
            affectedIds: missingStatusActivities.map((a) => a.id),
            affectedItems: missingStatusActivities.map((a) => ({
              id: a.id,
              name: a.name,
              detail: '状态字段为空',
            })),
            fixable: true,
            fixDescription: '将缺失状态的活动状态设为 "即将开始"',
          });
        }

        const errorCount = issues.filter((i) => i.severity === 'error').length;
        const warningCount = issues.filter((i) => i.severity === 'warning').length;

        return {
          totalIssues: issues.length,
          errorCount,
          warningCount,
          issues,
          checkedAt: new Date().toISOString(),
        };
      },

      fixOrphanItems: () => {
        const state = get();
        const activityIds = new Set(state.activities.map((a) => a.id));
        const orphanItems = state.items.filter((i) => !activityIds.has(i.activityId));
        const deletedIds = orphanItems.map((i) => i.id);

        set((state) => ({
          items: state.items.filter((i) => activityIds.has(i.activityId)),
        }));

        return { deletedCount: orphanItems.length, deletedIds };
      },

      fixOrphanRecords: () => {
        const state = get();
        const activityIds = new Set(state.activities.map((a) => a.id));
        const itemIds = new Set(state.items.map((i) => i.id));
        const orphanRecords = state.records.filter(
          (r) => !activityIds.has(r.activityId) || !itemIds.has(r.itemId)
        );
        const deletedIds = orphanRecords.map((r) => r.id);

        set((state) => ({
          records: state.records.filter(
            (r) => activityIds.has(r.activityId) && itemIds.has(r.itemId)
          ),
        }));

        return { deletedCount: orphanRecords.length, deletedIds };
      },

      fixNegativeStock: () => {
        const state = get();
        const negativeStockItems = state.items.filter((i) => i.currentStock < 0);
        const fixedIds = negativeStockItems.map((i) => i.id);

        set((state) => ({
          items: state.items.map((i) =>
            i.currentStock < 0 ? { ...i, currentStock: 0 } : i
          ),
        }));

        return { fixedCount: negativeStockItems.length, fixedIds };
      },

      fixStockMismatch: () => {
        const state = get();
        const fixedIds: string[] = [];

        const updatedItems = state.items.map((item) => {
          const itemRecords = state.records.filter((r) => r.itemId === item.id);
          const totalClaimed = itemRecords.reduce((sum, r) => sum + r.quantity, 0);
          const calculatedStock = item.totalStock - totalClaimed;
          if (calculatedStock !== item.currentStock) {
            fixedIds.push(item.id);
            return { ...item, currentStock: calculatedStock };
          }
          return item;
        });

        set({ items: updatedItems });

        return { fixedCount: fixedIds.length, fixedIds };
      },

      fixMissingActivityDate: () => {
        const state = get();
        const missingDateActivities = state.activities.filter(
          (a) => !a.date || a.date.trim() === ''
        );
        const fixedIds = missingDateActivities.map((a) => a.id);

        set((state) => ({
          activities: state.activities.map((a) =>
            !a.date || a.date.trim() === '' ? { ...a, date: a.createdAt.split('T')[0] } : a
          ),
        }));

        return { fixedCount: missingDateActivities.length, fixedIds };
      },

      fixMissingActivityStatus: () => {
        const state = get();
        const missingStatusActivities = state.activities.filter(
          (a) => !a.status || a.status.trim() === ''
        );
        const fixedIds = missingStatusActivities.map((a) => a.id);

        set((state) => ({
          activities: state.activities.map((a) =>
            !a.status || a.status.trim() === '' ? { ...a, status: 'upcoming' as const } : a
          ),
        }));

        return { fixedCount: missingStatusActivities.length, fixedIds };
      },

      fixAllIssues: () => {
        const result1 = get().fixOrphanItems();
        const result2 = get().fixOrphanRecords();
        const result3 = get().fixNegativeStock();
        const result4 = get().fixStockMismatch();
        const result5 = get().fixMissingActivityDate();
        const result6 = get().fixMissingActivityStatus();

        return {
          orphanItemsDeleted: result1.deletedCount,
          orphanRecordsDeleted: result2.deletedCount,
          negativeStockFixed: result3.fixedCount,
          stockMismatchFixed: result4.fixedCount,
          missingDateFixed: result5.fixedCount,
          missingStatusFixed: result6.fixedCount,
        };
      },
    }),
    {
      name: 'cheering-material-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        let hasChanges = false;
        const migratedTemplates = state.materialTemplates.map((template) => {
          const migratedItems = template.items.map((item) => {
            if (!item.id) {
              hasChanges = true;
              return { ...item, id: generateId() };
            }
            return item;
          });
          if (migratedItems !== template.items) {
            return { ...template, items: migratedItems };
          }
          return template;
        });
        if (hasChanges) {
          state.materialTemplates = migratedTemplates;
        }
      },
    }
  )
);
