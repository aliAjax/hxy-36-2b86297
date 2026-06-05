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
  Clock,
  ClipboardList,
  UserCheck,
  Monitor,
  Upload,
  FileText,
  BookTemplate,
  Copy,
  Zap,
  AlertTriangle,
  ArrowDownUp,
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
import { TodoItem } from '@/components/TodoItem';
import { TodoForm } from '@/components/TodoForm';
import { PreClaimantItem } from '@/components/PreClaimantItem';
import { PreClaimantForm } from '@/components/PreClaimantForm';
import { BatchClaimForm } from '@/components/BatchClaimForm';
import { SaveAsTemplateDialog } from '@/components/SaveAsTemplateDialog';
import { ApplyTemplateDialog } from '@/components/ApplyTemplateDialog';
import { Modal } from '@/components/Modal';
import { formatDate, cn } from '@/utils/helpers';
import { Item, PurchaseItem, Todo, PreClaimant, ACTIVITY_STATUS_CONFIG } from '@/types';

type TabType = 'items' | 'records' | 'charts' | 'purchase' | 'todos' | 'preregister';

export const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    activities,
    items,
    records,
    purchaseItems,
    todos,
    preClaimants,
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
    getActivityStats,
    getItemConsumptionData,
    getTypeDistributionData,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
  const [isPreClaimantFormOpen, setIsPreClaimantFormOpen] = useState(false);
  const [isBatchClaimFormOpen, setIsBatchClaimFormOpen] = useState(false);
  const [isSaveAsTemplateOpen, setIsSaveAsTemplateOpen] = useState(false);
  const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingPreClaimant, setEditingPreClaimant] = useState<PreClaimant | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<string | null>(null);
  const [deleteRecordConfirm, setDeleteRecordConfirm] = useState<string | null>(null);
  const [deletePurchaseConfirm, setDeletePurchaseConfirm] = useState<string | null>(null);
  const [deleteTodoConfirm, setDeleteTodoConfirm] = useState<string | null>(null);
  const [deletePreClaimantConfirm, setDeletePreClaimantConfirm] = useState<string | null>(null);
  const [convertPurchaseConfirm, setConvertPurchaseConfirm] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [purchaseSearchQuery, setPurchaseSearchQuery] = useState('');
  const [todoSearchQuery, setTodoSearchQuery] = useState('');
  const [preClaimantSearchQuery, setPreClaimantSearchQuery] = useState('');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [filterPurchaseStatus, setFilterPurchaseStatus] = useState<string>('all');
  const [filterTodoStatus, setFilterTodoStatus] = useState<string>('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [sortLowStockFirst, setSortLowStockFirst] = useState(false);

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
  const activityTodos = useMemo(
    () => todos.filter((t) => t.activityId === id).sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }),
    [todos, id]
  );
  const activityPreClaimants = useMemo(
    () => preClaimants.filter((p) => p.activityId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [preClaimants, id]
  );
  const stats = id ? getActivityStats(id) : null;
  const consumptionData = id ? getItemConsumptionData(id) : [];
  const typeDistributionData = id ? getTypeDistributionData(id) : [];

  const lowStockItemsCount = useMemo(
    () => activityItems.filter((i) => i.currentStock <= lowStockThreshold).length,
    [activityItems, lowStockThreshold]
  );

  const filteredItems = useMemo(() => {
    let result = activityItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesType = filterItemType === 'all' || item.type === filterItemType;
      const matchesLowStock = !showOnlyLowStock || item.currentStock <= lowStockThreshold;
      return matchesSearch && matchesType && matchesLowStock;
    });

    if (sortLowStockFirst) {
      result = [...result].sort((a, b) => {
        const aIsLow = a.currentStock <= lowStockThreshold ? 1 : 0;
        const bIsLow = b.currentStock <= lowStockThreshold ? 1 : 0;
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
  }, [activityItems, itemSearchQuery, filterItemType, showOnlyLowStock, sortLowStockFirst, lowStockThreshold]);

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

  const filteredTodos = useMemo(() => {
    return activityTodos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(todoSearchQuery.toLowerCase());
      const matchesStatus =
        filterTodoStatus === 'all' ||
        (filterTodoStatus === 'pending' && !todo.completed) ||
        (filterTodoStatus === 'completed' && todo.completed) ||
        (filterTodoStatus === 'overdue' && !todo.completed && new Date(todo.dueDate) < new Date(new Date().toDateString()));
      return matchesSearch && matchesStatus;
    });
  }, [activityTodos, todoSearchQuery, filterTodoStatus]);

  const filteredPreClaimants = useMemo(() => {
    return activityPreClaimants.filter((p) => {
      const q = preClaimantSearchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        p.expectedItems.toLowerCase().includes(q)
      );
    });
  }, [activityPreClaimants, preClaimantSearchQuery]);

  const pendingTodoCount = activityTodos.filter((t) => !t.completed).length;

  const getCountdownText = () => {
    if (!activity) return '';
    const now = new Date();
    const activityDate = new Date(activity.date);
    const diffTime = activityDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '活动已结束';
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays <= 7) return `${diffDays} 天后`;
    return `${diffDays} 天后`;
  };

  const tabs = [
    { id: 'items' as TabType, label: '物资列表', icon: ListTodo, count: activityItems.length },
    { id: 'purchase' as TabType, label: '采购清单', icon: ShoppingCart, count: activityPurchaseItems.length },
    { id: 'preregister' as TabType, label: '预登记', icon: UserCheck, count: activityPreClaimants.length },
    { id: 'records' as TabType, label: '领取记录', icon: Users, count: activityRecords.length },
    { id: 'todos' as TabType, label: '待办事项', icon: ClipboardList, count: pendingTodoCount },
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

  const handleTodoSubmit = (data: Omit<Todo, 'id' | 'createdAt'>) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, data);
    } else {
      addTodo(data);
    }
    setEditingTodo(null);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoFormOpen(true);
  };

  const handleDeleteTodo = (todoId: string) => {
    setDeleteTodoConfirm(todoId);
  };

  const confirmDeleteTodo = () => {
    if (deleteTodoConfirm) {
      deleteTodo(deleteTodoConfirm);
      setDeleteTodoConfirm(null);
    }
  };

  const handlePreClaimantSubmit = (data: Omit<PreClaimant, 'id' | 'createdAt'>) => {
    if (editingPreClaimant) {
      updatePreClaimant(editingPreClaimant.id, data);
    } else {
      addPreClaimant(data);
    }
    setEditingPreClaimant(null);
  };

  const handleEditPreClaimant = (preClaimant: PreClaimant) => {
    setEditingPreClaimant(preClaimant);
    setIsPreClaimantFormOpen(true);
  };

  const handleDeletePreClaimant = (preClaimantId: string) => {
    setDeletePreClaimantConfirm(preClaimantId);
  };

  const confirmDeletePreClaimant = () => {
    if (deletePreClaimantConfirm) {
      deletePreClaimant(deletePreClaimantConfirm);
      setDeletePreClaimantConfirm(null);
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
            <div className="flex gap-3">
              <Link
                to={`/activity/${id}/report`}
                className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all shadow-lg"
              >
                <FileText size={20} />
                复盘报告
              </Link>
              <Link
                to={`/activity/${id}/kanban`}
                className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all shadow-lg"
              >
                <Monitor size={20} />
                现场看板
              </Link>
              <Link
                to={`/activity/${id}/quick-claim`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
              >
                <Zap size={20} />
                快速领取
              </Link>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-pink-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">距离活动开始还有</p>
                <p className="text-3xl font-bold">{getCountdownText()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">待办事项</p>
              <p className="text-2xl font-bold">
                <span className={pendingTodoCount > 0 ? 'text-yellow-300' : ''}>
                  {pendingTodoCount}
                </span>
                <span className="text-white/60 text-lg"> / {activityTodos.length}</span>
              </p>
            </div>
          </div>
        </div>

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
                {lowStockItemsCount > 0 && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="text-orange-500" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-orange-800">库存预警</p>
                        <p className="text-sm text-orange-600">当前有 <span className="font-bold">{lowStockItemsCount}</span> 种物资库存 ≤ {lowStockThreshold} 个</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                  <button
                    onClick={() => setIsApplyTemplateOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm"
                  >
                    <Copy size={18} />
                    从模板创建
                  </button>
                  {activityItems.length > 0 && (
                    <button
                      onClick={() => setIsSaveAsTemplateOpen(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                    >
                      <BookTemplate size={18} />
                      存为模板
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
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
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Math.max(1, parseInt(e.target.value) || 1))}
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
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索领取人姓名或物资名称..."
                      value={recordSearchQuery}
                      onChange={(e) => setRecordSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setIsBatchClaimFormOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm"
                  >
                    <Upload size={18} />
                    批量录入
                  </button>
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

            {activeTab === 'todos' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索待办事项..."
                      value={todoSearchQuery}
                      onChange={(e) => setTodoSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={filterTodoStatus}
                      onChange={(e) => setFilterTodoStatus(e.target.value)}
                      className="pl-11 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all appearance-none"
                    >
                      <option value="all">全部状态</option>
                      <option value="pending">待完成</option>
                      <option value="completed">已完成</option>
                      <option value="overdue">已逾期</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTodo(null);
                      setIsTodoFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    <Plus size={18} />
                    添加待办
                  </button>
                </div>

                {filteredTodos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-pink-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {activityTodos.length === 0 ? '还没有添加待办事项' : '没有找到匹配的待办事项'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {activityTodos.length === 0
                        ? '点击上方按钮添加待办事项吧'
                        : '试试其他搜索条件'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTodos.map((todo, index) => (
                      <div
                        key={todo.id}
                        style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
                      >
                        <TodoItem
                          todo={todo}
                          onToggle={() => toggleTodo(todo.id)}
                          onDelete={() => handleDeleteTodo(todo.id)}
                          onEdit={() => handleEditTodo(todo)}
                        />
                      </div>
                    ))}
                  </div>
                )}
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

            {activeTab === 'preregister' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="搜索姓名、联系方式或预期物资..."
                      value={preClaimantSearchQuery}
                      onChange={(e) => setPreClaimantSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingPreClaimant(null);
                      setIsPreClaimantFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    <Plus size={18} />
                    添加预登记
                  </button>
                </div>

                {filteredPreClaimants.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {activityPreClaimants.length === 0 ? '还没有添加预登记' : '没有找到匹配的预登记'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {activityPreClaimants.length === 0
                        ? '在活动开始前录入可能来领取的人，领取登记时将自动匹配'
                        : '试试其他搜索条件'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPreClaimants.map((preClaimant, index) => (
                      <div
                        key={preClaimant.id}
                        style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both` }}
                      >
                        <PreClaimantItem
                          preClaimant={preClaimant}
                          onEdit={() => handleEditPreClaimant(preClaimant)}
                          onDelete={() => handleDeletePreClaimant(preClaimant.id)}
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

      <TodoForm
        isOpen={isTodoFormOpen}
        onClose={() => {
          setIsTodoFormOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={handleTodoSubmit}
        activityId={id!}
        todo={editingTodo}
      />

      <PreClaimantForm
        isOpen={isPreClaimantFormOpen}
        onClose={() => {
          setIsPreClaimantFormOpen(false);
          setEditingPreClaimant(null);
        }}
        onSubmit={handlePreClaimantSubmit}
        activityId={id!}
        preClaimant={editingPreClaimant}
      />

      <BatchClaimForm
        isOpen={isBatchClaimFormOpen}
        onClose={() => setIsBatchClaimFormOpen(false)}
        activityId={id!}
        items={activityItems}
        onSuccess={(result) => {
          setToastMessage(`批量导入完成：成功 ${result.successCount} 条，失败 ${result.failCount} 条`);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
        }}
      />

      <SaveAsTemplateDialog
        isOpen={isSaveAsTemplateOpen}
        onClose={() => setIsSaveAsTemplateOpen(false)}
        activityId={id!}
        items={activityItems}
        onSuccess={() => {
          setToastMessage('已保存为物资模板！');
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        }}
      />

      {isApplyTemplateOpen && (
        <ApplyTemplateDialog
          isOpen={true}
          onClose={() => setIsApplyTemplateOpen(false)}
          preselectedActivityId={id!}
          onSuccess={(count) => {
            setIsApplyTemplateOpen(false);
            setToastMessage(`已从模板创建 ${count} 项物资`);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
          }}
        />
      )}

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

      <Modal
        isOpen={!!deleteTodoConfirm}
        onClose={() => setDeleteTodoConfirm(null)}
        title="确认删除待办"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这个待办事项吗？该操作无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteTodoConfirm(null)}
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
        isOpen={!!deletePreClaimantConfirm}
        onClose={() => setDeletePreClaimantConfirm(null)}
        title="确认删除预登记"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          确定要删除这条预登记信息吗？该操作无法恢复。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeletePreClaimantConfirm(null)}
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
