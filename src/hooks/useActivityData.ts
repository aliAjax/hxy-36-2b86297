import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Activity, ActivityStats, ConsumptionData, TypeDistributionData } from '@/types';

export const useActivityData = (activityId: string | undefined) => {
  const {
    activities,
    items,
    records,
    purchaseItems,
    todos,
    preClaimants,
    keyItemIds,
    getActivityStats,
    getItemConsumptionData,
    getTypeDistributionData,
  } = useAppStore();

  const activity = useMemo<Activity | undefined>(
    () => activities.find((a) => a.id === activityId),
    [activities, activityId]
  );

  const activityItems = useMemo(
    () => items.filter((i) => i.activityId === activityId),
    [items, activityId]
  );

  const activityRecords = useMemo(
    () =>
      records
        .filter((r) => r.activityId === activityId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [records, activityId]
  );

  const activityPurchaseItems = useMemo(
    () =>
      purchaseItems
        .filter((p) => p.activityId === activityId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [purchaseItems, activityId]
  );

  const activityTodos = useMemo(() => {
    return todos
      .filter((t) => t.activityId === activityId)
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [todos, activityId]);

  const activityPreClaimants = useMemo(
    () =>
      preClaimants
        .filter((p) => p.activityId === activityId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [preClaimants, activityId]
  );

  const stats: ActivityStats | null = useMemo(
    () => (activityId ? getActivityStats(activityId) : null),
    [activityId, getActivityStats]
  );

  const consumptionData: ConsumptionData[] = useMemo(
    () => (activityId ? getItemConsumptionData(activityId) : []),
    [activityId, getItemConsumptionData]
  );

  const typeDistributionData: TypeDistributionData[] = useMemo(
    () => (activityId ? getTypeDistributionData(activityId) : []),
    [activityId, getTypeDistributionData]
  );

  const pendingTodoCount = useMemo(
    () => activityTodos.filter((t) => !t.completed).length,
    [activityTodos]
  );

  return {
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
  };
};
