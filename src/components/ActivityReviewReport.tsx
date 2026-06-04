import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Users,
  DollarSign,
  Gift,
  Eye,
  EyeOff,
  Download,
  Printer,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  FileText,
  CheckCircle,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatsCard } from '@/components/StatsCard';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { TypeDistributionChart } from '@/components/TypeDistributionChart';
import { formatDate, formatDateTime, cn, downloadFile } from '@/utils/helpers';
import {
  ClaimRecord,
  ACTIVITY_STATUS_CONFIG,
  ITEM_TYPE_CONFIG,
  ActivityStats,
  ConsumptionData,
  TypeDistributionData,
} from '@/types';

interface BudgetItem {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  budget: number;
  totalStock: number;
  distributedStock: number;
  remainingStock: number;
  distributionRate: number;
}

interface ClaimerSummary {
  name: string;
  contact: string;
  claimCount: number;
  totalQuantity: number;
  items: string[];
}

interface ReviewReportJSON {
  reportTitle: string;
  generatedAt: string;
  activity: {
    id: string;
    name: string;
    description: string;
    date: string;
    status: string;
    statusLabel: string;
  };
  stats: ActivityStats;
  budgetBreakdown: BudgetItem[];
  claimerSummary: ClaimerSummary[];
  duplicateRecords: ClaimRecord[];
  consumptionTrend: ConsumptionData[];
  typeDistribution: TypeDistributionData[];
  hideContact: boolean;
}

export const ActivityReviewReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const activities = useAppStore((state) => state.activities);
  const items = useAppStore((state) => state.items);
  const records = useAppStore((state) => state.records);
  const getActivityStats = useAppStore((state) => state.getActivityStats);
  const getItemConsumptionData = useAppStore((state) => state.getItemConsumptionData);
  const getTypeDistributionData = useAppStore((state) => state.getTypeDistributionData);

  const [hideContact, setHideContact] = useState(false);

  const activity = useMemo(
    () => activities.find((a) => a.id === id),
    [activities, id]
  );

  const activityItems = useMemo(
    () => items.filter((i) => i.activityId === id),
    [items, id]
  );

  const activityRecords = useMemo(
    () =>
      records
        .filter((r) => r.activityId === id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [records, id]
  );

  const stats = useMemo(
    () => (id ? getActivityStats(id) : null),
    [id, getActivityStats]
  );

  const consumptionData = useMemo(
    () => (id ? getItemConsumptionData(id) : []),
    [id, getItemConsumptionData]
  );

  const typeDistributionData = useMemo(
    () => (id ? getTypeDistributionData(id) : []),
    [id, getTypeDistributionData]
  );

  const duplicateRecords = useMemo(
    () => activityRecords.filter((r) => r.isDuplicateWarning),
    [activityRecords]
  );

  const budgetBreakdown = useMemo<BudgetItem[]>(() => {
    return activityItems.map((item) => {
      const distributed = item.totalStock - item.currentStock;
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        typeLabel: ITEM_TYPE_CONFIG[item.type].label,
        budget: item.budget,
        totalStock: item.totalStock,
        distributedStock: distributed,
        remainingStock: item.currentStock,
        distributionRate:
          item.totalStock > 0
            ? Math.round((distributed / item.totalStock) * 100)
            : 0,
      };
    });
  }, [activityItems]);

  const totalBudget = useMemo(
    () => budgetBreakdown.reduce((sum, b) => sum + b.budget, 0),
    [budgetBreakdown]
  );

  const claimerSummary = useMemo<ClaimerSummary[]>(() => {
    const map = new Map<
      string,
      { name: string; contact: string; count: number; quantity: number; itemNames: Set<string> }
    >();
    activityRecords.forEach((r) => {
      const key = r.claimerName.trim().toLowerCase();
      const existing = map.get(key);
      const item = activityItems.find((i) => i.id === r.itemId);
      if (existing) {
        existing.count += 1;
        existing.quantity += r.quantity;
        if (item) existing.itemNames.add(item.name);
      } else {
        map.set(key, {
          name: r.claimerName,
          contact: r.contact,
          count: 1,
          quantity: r.quantity,
          itemNames: new Set(item ? [item.name] : []),
        });
      }
    });
    return Array.from(map.values())
      .map((v) => ({
        name: v.name,
        contact: v.contact,
        claimCount: v.count,
        totalQuantity: v.quantity,
        items: Array.from(v.itemNames),
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [activityRecords, activityItems]);

  const maskContact = useCallback(
    (contact: string): string => {
      if (!hideContact || !contact) return contact;
      if (contact.includes('@')) {
        const [user, domain] = contact.split('@');
        return `${user[0]}***@${domain}`;
      }
      if (/^\d+$/.test(contact)) {
        if (contact.length >= 7) {
          return contact.slice(0, 3) + '****' + contact.slice(-4);
        }
        return '***';
      }
      if (contact.length > 2) {
        return contact[0] + '*'.repeat(contact.length - 2) + contact[contact.length - 1];
      }
      return '***';
    },
    [hideContact]
  );

  const handleExportJSON = useCallback(() => {
    if (!activity || !stats) return;
    const reportData: ReviewReportJSON = {
      reportTitle: `${activity.name} - 活动复盘报告`,
      generatedAt: new Date().toISOString(),
      activity: {
        id: activity.id,
        name: activity.name,
        description: activity.description,
        date: activity.date,
        status: activity.status,
        statusLabel: ACTIVITY_STATUS_CONFIG[activity.status].label,
      },
      stats,
      budgetBreakdown,
      claimerSummary: hideContact
        ? claimerSummary.map((c) => ({ ...c, contact: maskContact(c.contact) }))
        : claimerSummary,
      duplicateRecords: hideContact
        ? duplicateRecords.map((r) => ({ ...r, contact: maskContact(r.contact) }))
        : duplicateRecords,
      consumptionTrend: consumptionData,
      typeDistribution: typeDistributionData,
      hideContact,
    };
    const json = JSON.stringify(reportData, null, 2);
    const filename = `复盘报告_${activity.name}_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
  }, [
    activity,
    stats,
    budgetBreakdown,
    claimerSummary,
    duplicateRecords,
    consumptionData,
    typeDistributionData,
    hideContact,
    maskContact,
  ]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleNavigateBack = useCallback(() => {
    navigate(`/activity/${id}`);
  }, [navigate, id]);

  const handleToggleHideContact = useCallback(() => {
    setHideContact((prev) => !prev);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="print:hidden bg-white border-b border-pink-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleNavigateBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={18} />
              返回详情
            </button>
            <div className="flex items-center gap-2">
              <FileText className="text-pink-500" size={22} />
              <h1 className="text-lg font-bold text-gray-800">活动复盘报告</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleHideContact}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                hideContact
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              )}
            >
              {hideContact ? <EyeOff size={16} /> : <Eye size={16} />}
              {hideContact ? '已隐藏联系方式' : '隐藏联系方式'}
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm"
            >
              <Download size={16} />
              导出 JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
            >
              <Printer size={16} />
              打印报告
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:max-w-none print:px-8 print:py-6">
        <div className="print:block mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 rounded-full text-pink-600 text-sm font-medium mb-4 print:bg-transparent print:px-0">
            <Shield size={14} />
            {hideContact ? '联系方式已隐藏' : '联系方式可见'}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 print:text-2xl">
            {activity.name}
          </h1>
          <p className="text-gray-500 mb-1">
            {formatDate(activity.date)} · {statusConfig.label}
          </p>
          {activity.description && (
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {activity.description}
            </p>
          )}
          <p className="text-xs text-gray-300 mt-3 print:text-gray-400">
            报告生成时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>

        {stats && (
          <section className="mb-10 print:mb-6">
            <SectionTitle icon={BarChart3} title="数据概览" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
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
                title="领取人数"
                value={stats.uniqueClaimers}
                icon={Users}
                color="blue"
                subtitle={`${stats.totalClaims} 次领取`}
              />
              <StatsCard
                title="总预算"
                value={`¥${stats.totalBudget}`}
                icon={DollarSign}
                color="orange"
                subtitle={stats.remainingStock > 0 ? `${stats.remainingStock} 件剩余` : '已发完'}
              />
            </div>
          </section>
        )}

        <section className="mb-10 print:mb-6">
          <SectionTitle icon={TrendingUp} title="物资消耗趋势" />
          <div className="bg-white rounded-2xl p-6 border border-pink-50 print:border print:border-gray-200">
            <ConsumptionChart data={consumptionData} chartType="bar" />
          </div>
        </section>

        <section className="mb-10 print:mb-6">
          <SectionTitle icon={PieChartIcon} title="物资类型分布" />
          <div className="bg-white rounded-2xl p-6 border border-pink-50 print:border print:border-gray-200">
            <TypeDistributionChart data={typeDistributionData} />
          </div>
        </section>

        <section className="mb-10 print:mb-6">
          <SectionTitle icon={DollarSign} title="预算汇总" />
          <div className="bg-white rounded-2xl border border-pink-50 overflow-hidden print:border print:border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-50 to-purple-50 print:bg-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      物资名称
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      类型
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      预算
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      总库存
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      已发放
                    </th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                      发放率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetBreakdown.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-t border-gray-50 print:border-gray-200',
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 print:bg-gray-50'
                      )}
                    >
                      <td className="px-5 py-3 font-medium text-gray-800 print:px-3 print:py-2">
                        {item.name}
                      </td>
                      <td className="px-5 py-3 text-gray-600 print:px-3 print:py-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: ITEM_TYPE_CONFIG[item.type as keyof typeof ITEM_TYPE_CONFIG]?.color + '33',
                            color: ITEM_TYPE_CONFIG[item.type as keyof typeof ITEM_TYPE_CONFIG]?.color,
                          }}
                        >
                          {item.typeLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-800 print:px-3 print:py-2">
                        ¥{item.budget}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600 print:px-3 print:py-2">
                        {item.totalStock}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600 print:px-3 print:py-2">
                        {item.distributedStock}
                      </td>
                      <td className="px-5 py-3 text-right print:px-3 print:py-2">
                        <span
                          className={cn(
                            'font-medium',
                            item.distributionRate >= 80
                              ? 'text-green-600'
                              : item.distributionRate >= 50
                              ? 'text-orange-500'
                              : 'text-red-500'
                          )}
                        >
                          {item.distributionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-pink-100 bg-pink-50/50 print:bg-gray-100 print:border-gray-300">
                    <td
                      colSpan={2}
                      className="px-5 py-3 font-bold text-gray-800 print:px-3 print:py-2"
                    >
                      合计
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-800 print:px-3 print:py-2">
                      ¥{totalBudget}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-700 print:px-3 print:py-2">
                      {budgetBreakdown.reduce((s, b) => s + b.totalStock, 0)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-gray-700 print:px-3 print:py-2">
                      {budgetBreakdown.reduce((s, b) => s + b.distributedStock, 0)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold print:px-3 print:py-2">
                      <span
                        className={cn(
                          stats && stats.totalStock > 0
                            ? Math.round(
                                ((stats.distributedStock / stats.totalStock) * 100)
                              ) >= 80
                              ? 'text-green-600'
                              : Math.round(
                                  ((stats.distributedStock / stats.totalStock) * 100)
                                ) >= 50
                              ? 'text-orange-500'
                              : 'text-red-500'
                            : 'text-gray-400'
                        )}
                      >
                        {stats && stats.totalStock > 0
                          ? Math.round(
                              (stats.distributedStock / stats.totalStock) * 100
                            )
                          : 0}
                        %
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-10 print:mb-6">
          <SectionTitle icon={Users} title="领取人数统计" />
          <div className="bg-white rounded-2xl border border-pink-50 overflow-hidden print:border print:border-gray-200">
            {claimerSummary.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users className="mx-auto mb-3" size={40} />
                <p>暂无领取记录</p>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100 print:p-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      领取人数：<span className="font-bold text-gray-800">{claimerSummary.length}</span>
                    </span>
                    <span className="text-gray-500">
                      总领取次数：<span className="font-bold text-gray-800">{stats?.totalClaims || 0}</span>
                    </span>
                    <span className="text-gray-500">
                      总发放数量：<span className="font-bold text-gray-800">{stats?.distributedStock || 0}</span>
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto print:max-h-none">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr className="bg-gradient-to-r from-pink-50 to-purple-50 print:bg-gray-100">
                        <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                          领取人
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                          联系方式
                        </th>
                        <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                          领取次数
                        </th>
                        <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                          总数量
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                          领取物资
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimerSummary.map((claimer, idx) => (
                        <tr
                          key={idx}
                          className={cn(
                            'border-t border-gray-50 print:border-gray-200',
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 print:bg-gray-50'
                          )}
                        >
                          <td className="px-5 py-2.5 font-medium text-gray-800 print:px-3 print:py-2">
                            {claimer.name}
                          </td>
                          <td className="px-5 py-2.5 text-gray-600 print:px-3 print:py-2">
                            {maskContact(claimer.contact)}
                          </td>
                          <td className="px-5 py-2.5 text-right text-gray-600 print:px-3 print:py-2">
                            {claimer.claimCount}
                          </td>
                          <td className="px-5 py-2.5 text-right font-medium text-gray-800 print:px-3 print:py-2">
                            {claimer.totalQuantity}
                          </td>
                          <td className="px-5 py-2.5 text-gray-500 text-xs print:px-3 print:py-2">
                            {claimer.items.join('、')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="mb-10 print:mb-6">
          <SectionTitle
            icon={AlertTriangle}
            title="异常重复领取记录"
            badge={duplicateRecords.length > 0 ? `${duplicateRecords.length} 条` : undefined}
          />
          <div className="bg-white rounded-2xl border border-pink-50 overflow-hidden print:border print:border-gray-200">
            {duplicateRecords.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto mb-3 text-green-400" size={40} />
                <p className="text-green-600 font-medium">未发现异常重复领取记录</p>
                <p className="text-gray-400 text-sm mt-1">所有领取记录均正常</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto print:max-h-none">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-gradient-to-r from-red-50 to-orange-50 print:bg-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        领取人
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        联系方式
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        物资
                      </th>
                      <th className="text-right px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        数量
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        时间
                      </th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-700 print:px-3 print:py-2">
                        备注
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicateRecords.map((record) => {
                      const item = activityItems.find(
                        (i) => i.id === record.itemId
                      );
                      return (
                        <tr
                          key={record.id}
                          className="border-t border-red-50 print:border-gray-200"
                        >
                          <td className="px-5 py-2.5 font-medium text-gray-800 print:px-3 print:py-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                size={14}
                                className="text-orange-400 flex-shrink-0"
                              />
                              {record.claimerName}
                            </div>
                          </td>
                          <td className="px-5 py-2.5 text-gray-600 print:px-3 print:py-2">
                            {maskContact(record.contact)}
                          </td>
                          <td className="px-5 py-2.5 text-gray-600 print:px-3 print:py-2">
                            {item?.name || '未知物资'}
                          </td>
                          <td className="px-5 py-2.5 text-right text-gray-800 print:px-3 print:py-2">
                            {record.quantity}
                          </td>
                          <td className="px-5 py-2.5 text-gray-500 text-xs print:px-3 print:py-2">
                            {formatDateTime(record.createdAt)}
                          </td>
                          <td className="px-5 py-2.5 text-gray-400 text-xs max-w-32 truncate print:px-3 print:py-2">
                            {record.note || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <footer className="print:hidden text-center py-8 text-sm text-gray-400 border-t border-gray-100">
          <p>
            活动复盘报告 · {activity.name} · 生成于{' '}
            {new Date().toLocaleString('zh-CN')}
          </p>
          <p className="mt-1">
            {hideContact
              ? '联系方式已隐藏 · 导出的 JSON 数据中联系方式已脱敏'
              : '联系方式未隐藏 · 导出时请注意数据安全'}
          </p>
        </footer>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{
  icon: React.ElementType;
  title: string;
  badge?: string;
}> = ({ icon: Icon, title, badge }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className="text-pink-500 print:text-gray-600" />
      <h2 className="text-lg font-bold text-gray-800 print:text-base">{title}</h2>
      {badge && (
        <span className="px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </div>
  );
};
