import { useState, useMemo } from 'react';
import { PurchaseItem } from '@/types';

export const usePurchaseFilters = (activityPurchaseItems: PurchaseItem[]) => {
  const [purchaseSearchQuery, setPurchaseSearchQuery] = useState('');
  const [filterPurchaseStatus, setFilterPurchaseStatus] = useState<string>('all');

  const filteredPurchaseItems = useMemo(() => {
    return activityPurchaseItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(purchaseSearchQuery.toLowerCase());
      const matchesStatus = filterPurchaseStatus === 'all' || item.status === filterPurchaseStatus;
      return matchesSearch && matchesStatus;
    });
  }, [activityPurchaseItems, purchaseSearchQuery, filterPurchaseStatus]);

  return {
    purchaseSearchQuery,
    setPurchaseSearchQuery,
    filterPurchaseStatus,
    setFilterPurchaseStatus,
    filteredPurchaseItems,
  };
};
