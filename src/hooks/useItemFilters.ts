import { useState, useMemo } from 'react';
import { Item } from '@/types';

interface UseItemFiltersProps {
  activityItems: Item[];
  keyItemIds: string[];
}

export const useItemFilters = ({ activityItems, keyItemIds }: UseItemFiltersProps) => {
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [sortLowStockFirst, setSortLowStockFirst] = useState(false);
  const [showOnlyKeyItems, setShowOnlyKeyItems] = useState(false);

  const filteredItems = useMemo(() => {
    let result = activityItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesType = filterItemType === 'all' || item.type === filterItemType;
      const matchesLowStock = !showOnlyLowStock || item.currentStock < lowStockThreshold;
      const matchesKeyItem = !showOnlyKeyItems || keyItemIds.includes(item.id);
      return matchesSearch && matchesType && matchesLowStock && matchesKeyItem;
    });

    if (sortLowStockFirst) {
      result = [...result].sort((a, b) => {
        const aIsLow = a.currentStock < lowStockThreshold ? 1 : 0;
        const bIsLow = b.currentStock < lowStockThreshold ? 1 : 0;
        if (aIsLow !== bIsLow) {
          return bIsLow - aIsLow;
        }
        if (aIsLow && bIsLow) {
          return a.currentStock - b.currentStock;
        }
        return 0;
      });
    }

    return result;
  }, [
    activityItems,
    itemSearchQuery,
    filterItemType,
    showOnlyLowStock,
    sortLowStockFirst,
    lowStockThreshold,
    showOnlyKeyItems,
    keyItemIds,
  ]);

  const filteredLowStockItemsCount = useMemo(
    () => filteredItems.filter((i) => i.currentStock < lowStockThreshold).length,
    [filteredItems, lowStockThreshold]
  );

  const keyItemCount = useMemo(
    () => activityItems.filter((i) => keyItemIds.includes(i.id)).length,
    [activityItems, keyItemIds]
  );

  return {
    itemSearchQuery,
    setItemSearchQuery,
    filterItemType,
    setFilterItemType,
    lowStockThreshold,
    setLowStockThreshold,
    showOnlyLowStock,
    setShowOnlyLowStock,
    sortLowStockFirst,
    setSortLowStockFirst,
    showOnlyKeyItems,
    setShowOnlyKeyItems,
    filteredItems,
    filteredLowStockItemsCount,
    keyItemCount,
  };
};
