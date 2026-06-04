import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Activity,
  Item,
  ClaimRecord,
  AppData,
  ActivityStats,
  ConsumptionData,
  TypeDistributionData,
  ItemType,
  ITEM_TYPE_CONFIG,
} from '@/types';
import { generateId, getDateKey } from '@/utils/helpers';

interface AppState {
  activities: Activity[];
  items: Item[];
  records: ClaimRecord[];

  addActivity: (data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (id: string, data: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

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
  deleteRecord: (id: string) => void;

  exportData: () => string;
  importData: (data: AppData) => { success: boolean; error?: string };
  clearAllData: () => void;

  checkDuplicateClaim: (activityId: string, itemId: string, claimerName: string) => boolean;
  getActivityStats: (activityId: string) => ActivityStats;
  getItemConsumptionData: (activityId: string) => ConsumptionData[];
  getTypeDistributionData: (activityId: string) => TypeDistributionData[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: [],
      items: [],
      records: [],

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

      exportData: () => {
        const state = get();
        const exportObj: AppData = {
          activities: state.activities,
          items: state.items,
          records: state.records,
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
    }),
    {
      name: 'cheering-material-storage',
    }
  )
);
