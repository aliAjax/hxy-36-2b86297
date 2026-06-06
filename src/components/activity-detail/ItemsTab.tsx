import React from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowDownUp,
  Star,
  Copy,
  BookTemplate,
} from 'lucide-react';
import { Item } from '@/types';
import { ItemCard } from '@/components/ItemCard';
import { cn } from '@/utils/helpers';

interface ItemsTabProps {
  filteredItems: Item[];
  activityItems: Item[];
  filteredLowStockItemsCount: number;
  keyItemIds: string[];
  keyItemCount: number;
  itemSearchQuery: string;
  setItemSearchQuery: (value: string) => void;
  filterItemType: string;
  setFilterItemType: (value: string) => void;
  showOnlyKeyItems: boolean;
  setShowOnlyKeyItems: (value: boolean) => void;
  showOnlyLowStock: boolean;
  setShowOnlyLowStock: (value: boolean) => void;
  sortLowStockFirst: boolean;
  setSortLowStockFirst: (value: boolean) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (value: number) => void;
  onAddItem: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleKeyItem: (itemId: string) => void;
  onApplyTemplate: () => void;
  onSaveAsTemplate: () => void;
}

export const ItemsTab: React.FC<ItemsTabProps> = ({
  filteredItems,
  activityItems,
  filteredLowStockItemsCount,
  keyItemIds,
  keyItemCount,
  itemSearchQuery,
  setItemSearchQuery,
  filterItemType,
  setFilterItemType,
  showOnlyKeyItems,
  setShowOnlyKeyItems,
  showOnlyLowStock,
  setShowOnlyLowStock,
  sortLowStockFirst,
  setSortLowStockFirst,
  lowStockThreshold,
  setLowStockThreshold,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleKeyItem,
  onApplyTemplate,
  onSaveAsTemplate,
}) => {
  return (
    <div>
      {filteredLowStockItemsCount > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="font-medium text-orange-800">库存预警</p>
              <p className="text-sm text-orange-600">
                当前筛选结果中有 <span className="font-bold">{filteredLowStockItemsCount}</span>{' '}
                种物资库存低于 {lowStockThreshold} 个
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索物资名称或供应商..."
            value={itemSearchQuery}
            onChange={(e) => setItemSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={filterItemType}
            onChange={(e) => setFilterItemType(e.target.value)}
            className="pl-11 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all appearance-none"
          >
            <option value="all">全部类型</option>
            <option value="lightstick">灯牌</option>
            <option value="banner">手幅</option>
            <option value="sticker">贴纸</option>
            <option value="freepack">无料包</option>
            <option value="lottery">抽选礼物</option>
            <option value="other">其他</option>
          </select>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
        >
          <Plus size={18} />
          添加物资
        </button>
        <button
          onClick={onApplyTemplate}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
        >
          <Copy size={18} />
          从模板创建
        </button>
        {activityItems.length > 0 && (
          <button
            onClick={onSaveAsTemplate}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
          >
            <BookTemplate size={18} />
            存为模板
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowOnlyKeyItems(!showOnlyKeyItems)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            showOnlyKeyItems
              ? 'bg-yellow-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Star size={16} fill={showOnlyKeyItems ? 'currentColor' : 'none'} />
          只看重点物资
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
            {keyItemCount}
          </span>
        </button>
        <button
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            showOnlyLowStock
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <AlertTriangle size={16} />
          只看低库存
        </button>
        <button
          onClick={() => setSortLowStockFirst(!sortLowStockFirst)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            sortLowStockFirst
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <ArrowDownUp size={16} />
          低库存优先
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <span className="text-gray-500 text-sm">低库存阈值:</span>
          <input
            type="number"
            min="1"
            max="999"
            value={lowStockThreshold}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                setLowStockThreshold(Math.min(999, Math.max(1, val)));
              }
            }}
            onBlur={(e) => {
              const val = parseInt(e.target.value);
              if (isNaN(val) || val < 1) {
                setLowStockThreshold(1);
              }
            }}
            className="w-16 px-2 py-1 bg-white border border-gray-200 rounded text-center text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-50 outline-none"
          />
          <span className="text-gray-500 text-sm">个</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {activityItems.length === 0 ? '还没有添加任何物资' : '没有找到匹配的物资'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activityItems.length === 0 ? '点击上方按钮添加物资吧' : '试试其他搜索条件'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
            >
              <ItemCard
                item={item}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
                isKeyItem={keyItemIds.includes(item.id)}
                onToggleKeyItem={() => onToggleKeyItem(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
