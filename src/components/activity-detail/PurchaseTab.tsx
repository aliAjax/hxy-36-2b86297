import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { PurchaseItem } from '@/types';
import { PurchaseItemCard } from '@/components/PurchaseItemCard';

interface PurchaseTabProps {
  filteredPurchaseItems: PurchaseItem[];
  activityPurchaseItems: PurchaseItem[];
  purchaseSearchQuery: string;
  setPurchaseSearchQuery: (value: string) => void;
  filterPurchaseStatus: string;
  setFilterPurchaseStatus: (value: string) => void;
  onAddPurchase: () => void;
  onEditPurchase: (item: PurchaseItem) => void;
  onDeletePurchase: (purchaseId: string) => void;
  onConvertPurchase: (purchaseId: string) => void;
}

export const PurchaseTab: React.FC<PurchaseTabProps> = ({
  filteredPurchaseItems,
  activityPurchaseItems,
  purchaseSearchQuery,
  setPurchaseSearchQuery,
  filterPurchaseStatus,
  setFilterPurchaseStatus,
  onAddPurchase,
  onEditPurchase,
  onDeletePurchase,
  onConvertPurchase,
}) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索采购物资名称或供应商..."
            value={purchaseSearchQuery}
            onChange={(e) => setPurchaseSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={filterPurchaseStatus}
            onChange={(e) => setFilterPurchaseStatus(e.target.value)}
            className="pl-11 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all appearance-none"
          >
            <option value="all">全部状态</option>
            <option value="pending">待采购</option>
            <option value="ordered">已下单</option>
            <option value="shipped">已发货</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <button
          onClick={onAddPurchase}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
        >
          <Plus size={18} />
          添加采购计划
        </button>
      </div>

      {filteredPurchaseItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">🛒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {activityPurchaseItems.length === 0
              ? '还没有添加采购计划'
              : '没有找到匹配的采购计划'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activityPurchaseItems.length === 0
              ? '点击上方按钮添加采购计划吧'
              : '试试其他搜索条件'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPurchaseItems.map((item, index) => (
            <div
              key={item.id}
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
            >
              <PurchaseItemCard
                purchaseItem={item}
                onEdit={() => onEditPurchase(item)}
                onDelete={() => onDeletePurchase(item.id)}
                onConvert={() => onConvertPurchase(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
