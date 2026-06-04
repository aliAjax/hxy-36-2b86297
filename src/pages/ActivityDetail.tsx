import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Package,
  Users,
  DollarSign,
  Gift,
  BarChart3,
  ListTodo,
  Trash2,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatsCard } from '@/components/StatsCard';
import { ItemCard } from '@/components/ItemCard';
import { ItemForm } from '@/components/ItemForm';
import { ClaimForm } from '@/components/ClaimForm';
import { ClaimRecordItem } from '@/components/ClaimRecordItem';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { TypeDistributionChart } from '@/components/TypeDistributionChart';
import { PurchaseItemForm } from '@/components/PurchaseItemForm';
import { PurchaseItemCard } from '@/components/PurchaseItemCard';
import { Modal } from '@/components/Modal';
import { formatDate, cn } from '@/utils/helpers';
import { Item, PurchaseItem, ACTIVITY_STATUS_CONFIG } from '@/types';

type TabType = 'items' | 'records' | 'charts' | 'purchase';

export const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    activities,
    items,
    records,
    purchaseItems,
    addItem,
    updateItem,
    deleteItem,
    deleteRecord,
    addPurchaseItem,
    updatePurchaseItem,
    deletePurchaseItem,
    convertPurchaseToItem,
    getActivityStats,
    getItemConsumptionData,
    getTypeDistributionData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<string | null>(null);
  const [deleteRecordConfirm, setDeleteRecordConfirm] = useState<string | null>(null);
  const [deletePurchaseConfirm, setDeletePurchaseConfirm] = useState<string | null>(null);
  const [convertPurchaseConfirm, setConvertPurchaseConfirm] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [purchaseSearchQuery, setPurchaseSearchQuery] = useState('');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [filterPurchaseStatus, setFilterPurchaseStatus] = useState<string>('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const activity = activities.find((a) => a.id === id);
  const activityItems = useMemo(
    () => items.filter((i) => i.activityId === id),
    [items, id]
  );
  const activityRecords = useMemo(
    () => records.filter((r) => r.activityId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [records, id]
  );
  const activityPurchaseItems = useMemo(
    () => purchaseItems.filter((p) => p.activityId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [purchaseItems, id]
  );
  const stats = id ? getActivityStats(id) : null;
  const consumptionData = id ? getItemConsumptionData(id) : [];
  const typeDistributionData = id ? getTypeDistributionData(id) : [];

  const filteredItems = useMemo(() => {
    return activityItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesType = filterItemType === 'all' || item.type === filterItemType;
      return matchesSearch && matchesType;
    });
  }, [activityItems, itemSearchQuery, filterItemType]);

  const filteredRecords = useMemo(() => {
    return activityRecords.filter((record) => {
      const item = activityItems.find((i) => i.id === record.itemId);
      return (
        record.claimerName.toLowerCase().includes(recordSearchQuery.toLowerCase()) ||
        item?.name.toLowerCase().includes(recordSearchQuery.toLowerCase())
      );
    });
  }, [activityRecords, activityItems, recordSearchQuery]);

  const filteredPurchaseItems = useMemo(() => {
    return activityPurchaseItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(purchaseSearchQuery.toLowerCase());
      const matchesStatus = filterPurchaseStatus === 'all' || item.status === filterPurchaseStatus;
      return matchesSearch && matchesStatus;
    });
  }, [activityPurchaseItems, purchaseSearchQuery, filterPurchaseStatus]);

  const tabs = [
    { id: 'items' as TabType, label: '物资列表', icon: ListTodo, count: activityItems.length },
    { id: 'purchase' as TabType, label: '采购清单', icon: ShoppingCart, count: activityPurchaseItems.length },
    { id: 'records' as TabType, label: '领取记录', icon: Users, count: activityRecords.length },
    { id: 'charts' as TabType, label: '数据图表', icon: BarChart3 },
  ];

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
            <ArrowLeft size={18} />
            返回活动列表
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = ACTIVITY_STATUS_CONFIG[activity.status];

  const handleItemSubmit = (data: Omit<Item, 'id' | 'createdAt'>) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
    setEditingItem(null);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteItemConfirm(itemId);
  };

  const confirmDeleteItem = () => {
    if (deleteItemConfirm) {
      deleteItem(deleteItemConfirm);
      setDeleteItemConfirm(null);
    }
  };

  const confirmDeleteRecord = () => {
    if (deleteRecordConfirm) {
      deleteRecord(deleteRecordConfirm);
      setDeleteRecordConfirm(null);
    }
  };

  const handleClaimSuccess = () => {
    setToastMessage('领取登记成功！');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handlePurchaseItemSubmit = (data: Omit<PurchaseItem, 'id' | 'createdAt'>) => {
    if (editingPurchaseItem) {
      updatePurchaseItem(editingPurchaseItem.id, data);
    } else {
      addPurchaseItem(data);
    }
    setEditingPurchaseItem(null);
  };

  const handleEditPurchaseItem = (purchaseItem: PurchaseItem) => {
    setEditingPurchaseItem(purchaseItem);
    setIsPurchaseFormOpen(true);
  };

  const handleDeletePurchaseItem = (purchaseId: string) => {
    setDeletePurchaseConfirm(purchaseId);
  };

  const confirmDeletePurchaseItem = () => {
    if (deletePurchaseConfirm) {
      deletePurchaseItem(deletePurchaseConfirm);
      setDeletePurchaseConfirm(null);
    }
  };

  const handleConvertPurchaseItem = (purchaseId: string) => {
    setConvertPurchaseConfirm(purchaseId);
  };

  const confirmConvertPurchaseItem = () => {
    if (convertPurchaseConfirm) {
      const result = convertPurchaseToItem(convertPurchaseConfirm);
      if (result.success) {
        setToastMessage('已成功转为正式物资！');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
      setConvertPurchaseConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="relative h-48 overflow-hidden">
        {activity.coverUrl ? (
          <img
            src={activity.coverUrl}
            alt={activity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-8 left-12 w-24 h-24 rounded-full bg-white/30 blur-2xl" />
              <div className="absolute bottom-4 right-16 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-700 hover:bg-white transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
        </div>
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{activity.name}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: statusConfig.color }}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-white/80">{formatDate(activity.date)}</p>
            </div>
            <button
              onClick={() => setIsClaimFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-500/30"
            >
              <Gift size={20} />
              登记领取
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="物资种类"
              value={stats.totalItems}
              icon={Package}
              color="pink"
              subtitle="种类型"
            />
            <StatsCard
              title="已发放"
              value={stats.distributedStock}
              icon={Gift}
              color="purple"
              subtitle={`/ ${stats.totalStock} 总库存`}
            />
            <StatsCard
              title="剩余库存"
              value={stats.remainingStock}
              icon={Package}
              color="green"
              subtitle={stats.totalStock > 0 ? `${((stats.remainingStock / stats.totalStock) * 100).toFixed(0)}% 剩余` : '无库存'}
            />
            <StatsCard
              title="总预算"
              value={`¥${stats.totalBudget}`}
              icon={DollarSign}
              color="orange"
              subtitle={`${stats.uniqueClaimers} 人参与`}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 mb-6 overflow-hidden">
          <div className="flex border-b border-pink-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-all',
                    isActive
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50/50'
                      : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50/30'
                  )}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        isActive ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'items' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索物资名称或供应商..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    <Plus size={18} />
                    添加物资
                  </button>
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
                      {activityItems.length === 0
                        ? '点击上方按钮添加物资吧'
                        : '试试其他搜索条件'}
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
                          onEdit={() => handleEditItem(item)}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="搜索领取人姓名或物资名称..."
                    value={recordSearchQuery}
                    onChange={(e) => setRecordSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                  />
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📝</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {activityRecords.length === 0 ? '还没有领取记录' : '没有找到匹配的记录'}
                    </h3>
                    <p className="text-gray-500">
                      {activityRecords.length === 0
                        ? '点击右上角"登记领取"按钮开始登记'
                        : '试试其他搜索条件'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredRecords.map((record, index) => {
                      const item = activityItems.find((i) => i.id === record.itemId);
                      return (
                        <div
                          key={record.id}
                          style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
                        >
                          <ClaimRecordItem
                            record={record}
                            item={item}
                            onDelete={() => setDeleteRecordConfirm(record.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📈 物资消耗趋势</h3>
                  <ConsumptionChart data={consumptionData} chartType="bar" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 物资类型分布</h3>
                    <TypeDistributionChart data={typeDistributionData} />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 领取趋势</h3>
                    <ConsumptionChart data={consumptionData} chartType="line" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchase' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索采购物资名称或供应商..."
                      value={purchaseSearchQuery}
                      onChange={(e) => setPurchaseSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                    onClick={() => {
                      setEditingPurchaseItem(null);
                      setIsPurchaseFormOpen(true);
                    }}
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
                      {activityPurchaseItems.length === 0 ? '还没有添加采购计划' : '没有找到匹配的采购计划'}
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
                          onEdit={() => handleEditPurchaseItem(item)}
                          onDelete={() => handleDeletePurchaseItem(item.id)}
                          onConvert={() => handleConvertPurchaseItem(item.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ItemForm
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleItemSubmit}
        activityId={id!}
        item={editingItem}
      />

      <ClaimForm
        isOpen={isClaimFormOpen}
        onClose={() => setIsClaimFormOpen(false)}
        activityId={id!}
        items={activityItems.filter((i) => i.currentStock > 0)}
        onSuccess={handleClaimSuccess}
      />

      <PurchaseItemForm
        isOpen={isPurchaseFormOpen}
        onClose={() => {
          setIsPurchaseFormOpen(false);
          setEditingPurchaseItem(null);
        }}
        onSubmit={handlePurchaseItemSubmit}
        activityId={id!}
        purchaseItem={editingPurchaseItem}
      />

      <Modal
        isOpen={!!deleteItemConfirm}
        onClose={() => setDeleteItemConfirm(null)}
        title="确认删除物资"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个物资吗？该操作将同时删除该物资的所有领取记录，且无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteItemConfirm(null)}
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
        isOpen={!!deleteRecordConfirm}
        onClose={() => setDeleteRecordConfirm(null)}
        title="确认删除领取记录"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这条领取记录吗？删除后库存将自动恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteRecordConfirm(null)}
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
        isOpen={!!deletePurchaseConfirm}
        onClose={() => setDeletePurchaseConfirm(null)}
        title="确认删除采购计划"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个采购计划吗？该操作无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeletePurchaseConfirm(null)}
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

      <Modal
        isOpen={!!convertPurchaseConfirm}
        onClose={() => setConvertPurchaseConfirm(null)}
        title="确认转为正式物资"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要将这个采购计划转为正式物资吗？转换后该采购计划将被移除，并在物资列表中新增一条正式物资记录。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConvertPurchaseConfirm(null)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={confirmConvertPurchaseItem}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            <CheckCircle size={16} className="inline mr-2" />
            确认转换
          </button>
        </div>
      </Modal>

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
