import React, { useState, useCallback } from 'react';
import {
  Heart,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wrench,
  Trash2,
  Database,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { HealthCheckResult, HealthIssue, HealthIssueType } from '@/types';
import { Modal } from './Modal';
import { cn } from '@/utils/helpers';

export const DataHealthCenter: React.FC = () => {
  const {
    runHealthCheck,
    fixOrphanItems,
    fixOrphanRecords,
    fixNegativeStock,
    fixStockMismatch,
    fixMissingActivityDate,
    fixMissingActivityStatus,
    fixAllIssues,
  } = useAppStore();

  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [expandedIssues, setExpandedIssues] = useState<Set<HealthIssueType>>(new Set());
  const [showFixConfirm, setShowFixConfirm] = useState<{
    isOpen: boolean;
    issueType?: HealthIssueType;
    issue?: HealthIssue;
  }>({ isOpen: false });
  const [showFixAllConfirm, setShowFixAllConfirm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const handleRunCheck = useCallback(async () => {
    setIsScanning(true);
    setFixResult(null);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = runHealthCheck();
    setHealthResult(result);
    setIsScanning(false);
  }, [runHealthCheck]);

  const toggleIssue = (type: HealthIssueType) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedIssues(newExpanded);
  };

  const handleFixClick = (issue: HealthIssue) => {
    setShowFixConfirm({ isOpen: true, issueType: issue.type, issue });
  };

  const executeFix = () => {
    if (!showFixConfirm.issueType) return;

    let result: { count: number; message: string };

    switch (showFixConfirm.issueType) {
      case 'orphan_item': {
        const orphanResult = fixOrphanItems();
        result = { count: orphanResult.deletedCount, message: `已删除 ${orphanResult.deletedCount} 个孤儿物资` };
        break;
      }
      case 'orphan_record': {
        const recordResult = fixOrphanRecords();
        result = { count: recordResult.deletedCount, message: `已删除 ${recordResult.deletedCount} 条孤儿领取记录` };
        break;
      }
      case 'negative_stock': {
        const stockResult = fixNegativeStock();
        result = { count: stockResult.fixedCount, message: `已修复 ${stockResult.fixedCount} 个负库存物资` };
        break;
      }
      case 'stock_mismatch': {
        const mismatchResult = fixStockMismatch();
        result = { count: mismatchResult.fixedCount, message: `已修复 ${mismatchResult.fixedCount} 个库存不一致的物资` };
        break;
      }
      case 'missing_activity_date': {
        const dateResult = fixMissingActivityDate();
        result = { count: dateResult.fixedCount, message: `已修复 ${dateResult.fixedCount} 个日期缺失的活动` };
        break;
      }
      case 'missing_activity_status': {
        const statusResult = fixMissingActivityStatus();
        result = { count: statusResult.fixedCount, message: `已修复 ${statusResult.fixedCount} 个状态缺失的活动` };
        break;
      }
      default:
        return;
    }

    setFixResult(result.message);
    setShowFixConfirm({ isOpen: false });
    handleRunCheck();
  };

  const executeFixAll = () => {
    const result = fixAllIssues();
    const totalFixed =
      result.orphanItemsDeleted +
      result.orphanRecordsDeleted +
      result.negativeStockFixed +
      result.stockMismatchFixed +
      result.missingDateFixed +
      result.missingStatusFixed;

    setFixResult(`已完成全部修复，共处理 ${totalFixed} 个问题`);
    setShowFixAllConfirm(false);
    handleRunCheck();
  };

  const getIssueIcon = (severity: 'error' | 'warning') => {
    if (severity === 'error') {
      return <AlertCircle className="text-red-500" size={20} />;
    }
    return <AlertTriangle className="text-orange-500" size={20} />;
  };

  const getIssueBadgeColor = (severity: 'error' | 'warning') => {
    if (severity === 'error') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getFixPreviewChanges = (issue: HealthIssue): string[] => {
    const changes: string[] = [];
    issue.affectedItems?.forEach((item) => {
      changes.push(`${item.name} - ${item.detail}`);
    });
    return changes.slice(0, 10);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
            <Heart className="text-white" size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">数据健康检查中心</h2>
            <p className="text-sm text-gray-500">检测并修复数据异常问题</p>
          </div>
        </div>
        <button
          onClick={handleRunCheck}
          disabled={isScanning}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
            isScanning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-200'
          )}
        >
          <RefreshCw className={cn(isScanning && 'animate-spin')} size={18} />
          {isScanning ? '扫描中...' : '开始检查'}
        </button>
      </div>

      {healthResult && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
              <div className="text-3xl font-bold text-green-600">
                {healthResult.totalIssues === 0 ? (
                  <CheckCircle size={32} className="mx-auto" />
                ) : (
                  healthResult.totalIssues
                )}
              </div>
              <p className="text-sm text-green-700 mt-1">
                {healthResult.totalIssues === 0 ? '数据健康' : '发现问题'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 text-center border border-red-100">
              <div className="text-3xl font-bold text-red-600">{healthResult.errorCount}</div>
              <p className="text-sm text-red-700 mt-1">严重错误</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">{healthResult.warningCount}</div>
              <p className="text-sm text-orange-700 mt-1">警告问题</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Clock size={14} />
            <span>检查时间：{new Date(healthResult.checkedAt).toLocaleString('zh-CN')}</span>
          </div>

          {healthResult.totalIssues > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {healthResult.issues.map((issue) => (
                  <div
                    key={issue.type}
                    className={cn(
                      'border rounded-xl overflow-hidden transition-all',
                      issue.severity === 'error'
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-orange-200 bg-orange-50/50'
                    )}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() => toggleIssue(issue.type)}
                    >
                      <div className="flex items-center gap-3">
                        {getIssueIcon(issue.severity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{issue.title}</span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                getIssueBadgeColor(issue.severity)
                              )}
                            >
                              {issue.severity === 'error' ? '错误' : '警告'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {issue.description}（影响 {issue.affectedIds.length} 项）
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {issue.fixable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFixClick(issue);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <Wrench size={14} />
                            修复
                          </button>
                        )}
                        {expandedIssues.has(issue.type) ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedIssues.has(issue.type) && (
                      <div className="px-4 pb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-100 max-h-60 overflow-y-auto">
                          {issue.affectedItems?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0"
                            >
                              <Database size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">{item.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {issue.fixDescription && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <Sparkles size={14} className="text-pink-500" />
                            <span>修复方案：{issue.fixDescription}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  共发现 {healthResult.totalIssues} 类问题，{healthResult.issues.filter(i => i.fixable).length} 类可自动修复
                </p>
                <button
                  onClick={() => setShowFixAllConfirm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-200"
                >
                  <Wrench size={18} />
                  一键修复所有问题
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-500" size={40} />
              </div>
              <p className="text-lg font-medium text-gray-800">数据状态良好 ✨</p>
              <p className="text-sm text-gray-500 mt-1">未发现任何数据异常问题</p>
            </div>
          )}
        </>
      )}

      {!healthResult && !isScanning && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="text-gray-400" size={40} />
          </div>
          <p className="text-lg font-medium text-gray-600">点击"开始检查"扫描数据健康状态</p>
          <p className="text-sm text-gray-400 mt-1">将检查孤儿数据、库存异常、活动信息缺失等问题</p>
        </div>
      )}

      {fixResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <div className="flex-1">
            <p className="font-medium text-green-800">{fixResult}</p>
          </div>
          <button
            onClick={() => setFixResult(null)}
            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-green-600" />
          </button>
        </div>
      )}

      <Modal
        isOpen={showFixConfirm.isOpen}
        onClose={() => setShowFixConfirm({ isOpen: false })}
        title="确认修复"
        size="md"
      >
        {showFixConfirm.issue && (
          <>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-800 mb-1">修复前请确认</p>
                  <p className="text-sm text-amber-700">
                    以下操作将修改您的数据，建议先导出备份。
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">
                影响范围：{showFixConfirm.issue.affectedIds.length} 项
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto border border-gray-200">
                {getFixPreviewChanges(showFixConfirm.issue).map((change, index) => (
                  <div key={index} className="flex items-start gap-2 py-1.5 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{change}</span>
                  </div>
                ))}
                {showFixConfirm.issue.affectedIds.length > 10 && (
                  <p className="text-sm text-gray-500 pt-2 border-t border-gray-200 mt-2">
                    ...还有 {showFixConfirm.issue.affectedIds.length - 10} 项更多
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">修复方案</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {showFixConfirm.issue.fixDescription}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFixConfirm({ isOpen: false })}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeFix}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                确认修复
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showFixAllConfirm}
        onClose={() => setShowFixAllConfirm(false)}
        title="确认一键修复所有问题"
        size="md"
      >
        {healthResult && (
          <>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-800 mb-1">重要提示</p>
                  <p className="text-sm text-amber-700">
                    此操作将自动修复所有可修复的问题，包括删除孤儿数据和修正异常数据。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-800">将执行以下修复：</h4>
              {healthResult.issues.filter((issue) => issue.fixable).map((issue) => (
                <div key={issue.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{issue.title}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {issue.affectedIds.length} 项
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFixAllConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeFixAll}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                确认一键修复
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
