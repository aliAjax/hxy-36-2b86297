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
} from '@/types';
import { generateId, getDateKey } from '@/utils/helpers';

interface AppState {
  activities: Activity[];
  items: Item[];
  records: ClaimRecord[];
  purchaseItems: PurchaseItem[];
  todos: Todo[];
  preClaimants: PreClaimant[];

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
  convertPurchaseToItem: (purchaseId: string) => { success: boolean; item?: Item; error?: string };

  addPreClaimant: (data: Omit<PreClaimant, 'id' | 'createdAt'>) => void;
  updatePreClaimant: (id: string, data: Partial<PreClaimant>) => void;
  deletePreClaimant: (id: string) => void;
  findPreClaimantByName: (activityId: string, name: string) => PreClaimant | undefined;

  exportData: () => string;
  importData: (data: AppData) => { success: boolean; error?: string };
  clearAllData: () => void;

  checkDuplicateClaim: (activityId: string, itemId: string, claimerName: string) => boolean;
  getActivityStats: (activityId: string) => ActivityStats;
  getItemConsumptionData: (activityId: string) => ConsumptionData[];
  getTypeDistributionData: (activityId: string) => TypeDistributionData[];
  getTodayClaimQuantity: (activityId: string, itemId?: string) => number;
  getRecentRecords: (activityId: string, limit?: number) => ClaimRecord[];
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
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          items: state.items.filter((i) => i.activityId !== id),
          records: state.records.filter((r) => r.activityId !== id),
          purchaseItems: state.purchaseItems.filter((p) => p.activityId !== id),
          todos: state.todos.filter((t) => t.activityId !== id),
          preClaimants: state.preClaimants.filter((p) => p.activityId !== id),
        }));
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

          const isDuplicate = state.checkDuplicateClaim(activityId, itemId, claimerName);
          if (isDuplicate && !forceAddDuplicates) {
            results.push({
              index,
              success: false,
              isDuplicate: true,
              error: '重复领取',
            });
            return;
          }

          const newRecord: ClaimRecord = {
            ...recordData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            isDuplicateWarning: isDuplicate,
          };

          newRecords.push(newRecord);
          stockUpdates.set(itemId, allocatedQuantity + quantity);
          results.push({
            index,
            success: true,
            isDuplicate,
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

      convertPurchaseToItem: (purchaseId) => {
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
          designUrl: '',
          budget: purchaseItem.budget,
          supplier: purchaseItem.supplier,
          totalStock: purchaseItem.expectedQuantity,
          currentStock: purchaseItem.expectedQuantity,
          distributionRule: '',
          note: purchaseItem.note,
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

      exportData: () => {
        const state = get();
        const exportObj: AppData = {
          activities: state.activities,
          items: state.items,
          records: state.records,
          purchaseItems: state.purchaseItems,
          todos: state.todos,
          preClaimants: state.preClaimants,
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
          set({
            activities: data.activities,
            items: data.items,
            records: data.records,
            purchaseItems: Array.isArray(data.purchaseItems) ? data.purchaseItems : [],
            todos: Array.isArray(data.todos) ? data.todos : [],
            preClaimants: Array.isArray(data.preClaimants) ? data.preClaimants : [],
          });
          return { success: true };
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
    }),
    {
      name: 'cheering-material-storage',
    }
  )
);
