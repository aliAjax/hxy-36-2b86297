import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, FileJson, CheckCircle, AlertTriangle, Database, Image, Merge, Copy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { DataHealthCenter } from '@/components/DataHealthCenter';
import { downloadFile, readFileAsText, formatFileSize } from '@/utils/helpers';
import { AppData, ImportMode, MergeResult } from '@/types';
import { Link } from 'react-router-dom';

interface ImportAnalysis {
  counts: {
    activities: number;
    items: number;
    records: number;
    purchaseItems: number;
    todos: number;
    preClaimants: number;
    materialTemplates: number;
  };
  currentCounts: {
    activities: number;
    items: number;
    records: number;
    purchaseItems: number;
    todos: number;
    preClaimants: number;
    materialTemplates: number;
  };
  missingFields: string[];
}

const DATA_FIELD_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  activities: { label: '活动', icon: '🎪', color: 'pink' },
  items: { label: '物资', icon: '📦', color: 'purple' },
  records: { label: '领取记录', icon: '📝', color: 'blue' },
  purchaseItems: { label: '采购项', icon: '🛒', color: 'orange' },
  todos: { label: '待办', icon: '✅', color: 'green' },
  preClaimants: { label: '预登记', icon: '📋', color: 'yellow' },
  materialTemplates: { label: '模板', icon: '📑', color: 'indigo' },
};

export const DataManagement: React.FC = () => {
  const {
    activities,
    items,
    records,
    purchaseItems,
    todos,
    preClaimants,
    materialTemplates,
    exportData,
    importData,
    mergeData,
    clearAllData,
  } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showMergeResult, setShowMergeResult] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [importPreview, setImportPreview] = useState<AppData | null>(null);
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>('overwrite');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDataSize = new Blob([exportData()]).size;

  const analyzeImportData = (data: AppData): ImportAnalysis => {
    const allFields = ['activities', 'items', 'records', 'purchaseItems', 'todos', 'preClaimants', 'materialTemplates'];
    const missingFields: string[] = [];
    const dataRecord = data as unknown as Record<string, unknown>;

    allFields.forEach((field) => {
      if (!Array.isArray(dataRecord[field])) {
        missingFields.push(field);
      }
    });

    const getCount = (field: string) => {
      const arr = dataRecord[field];
      return Array.isArray(arr) ? arr.length : 0;
    };

    return {
      counts: {
        activities: getCount('activities'),
        items: getCount('items'),
        records: getCount('records'),
        purchaseItems: getCount('purchaseItems'),
        todos: getCount('todos'),
        preClaimants: getCount('preClaimants'),
        materialTemplates: getCount('materialTemplates'),
      },
      currentCounts: {
        activities: activities.length,
        items: items.length,
        records: records.length,
        purchaseItems: purchaseItems.length,
        todos: todos.length,
        preClaimants: preClaimants.length,
        materialTemplates: materialTemplates.length,
      },
      missingFields,
    };
  };

  const handleExport = () => {
    const data = exportData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `cheering-materials-backup-${timestamp}.json`;
    downloadFile(data, filename);
    showToast('数据导出成功！');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const parsedData = JSON.parse(content) as AppData;

      if (
        !Array.isArray(parsedData.activities) ||
        !Array.isArray(parsedData.items) ||
        !Array.isArray(parsedData.records)
      ) {
        throw new Error('数据格式不正确');
      }

      const analysis = analyzeImportData(parsedData);
      setImportPreview(parsedData);
      setImportAnalysis(analysis);
      setImportError(null);
      setShowImportConfirm(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;

    if (importMode === 'overwrite') {
      const result = importData(importPreview);
      if (result.success) {
        showToast('数据导入成功！');
      } else {
        setImportError(result.error || '导入失败');
      }
    } else {
      const result = mergeData(importPreview);
      if (result.success) {
        setMergeResult(result);
        setShowMergeResult(true);
        showToast('合并导入成功！');
      } else {
        setImportError(result.error || '合并失败');
      }
    }
    setShowImportConfirm(false);
    setImportPreview(null);
    setImportAnalysis(null);
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    showToast('数据已清空');
  };

  const showToast = (message: string) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">数据管理 💾</h1>
          <p className="text-gray-500">管理您的应援物资数据，进行备份和恢复操作</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎪</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
            <p className="text-sm text-gray-500">活动数量</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
            <p className="text-sm text-gray-500">物资数量</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{records.length}</p>
            <p className="text-sm text-gray-500">领取记录</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-pink-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">存储信息</h2>
          </div>
          <p className="text-gray-500 mb-4">所有数据保存在您的浏览器本地，不会上传到任何服务器。</p>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <p className="text-sm text-gray-500">数据总大小</p>
              <p className="text-lg font-bold text-gray-800">{formatFileSize(totalDataSize)}</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">存储方式</p>
              <p className="text-lg font-bold text-gray-800">LocalStorage</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <DataHealthCenter />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 mb-6 hover:shadow-md transition-shadow">
          <Link to="/images" className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
              <Image className="text-white" size={26} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">物资图片库</h3>
              <p className="text-gray-500 text-sm">
                集中管理所有活动物资的设计图，支持复制链接和批量编辑
              </p>
            </div>
            <div className="text-pink-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
              <Download className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导出备份</h3>
            <p className="text-gray-500 text-sm mb-4">
              将所有数据导出为 JSON 文件，可用于备份或迁移到其他设备。
            </p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200"
            >
              <FileJson size={18} />
              导出 JSON
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Upload className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导入恢复</h3>
            <p className="text-gray-500 text-sm mb-4">
              从之前导出的 JSON 备份文件恢复数据。支持覆盖导入和合并导入两种模式。
            </p>
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-200"
            >
              <FileJson size={18} />
              导入 JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mb-4 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
              <Trash2 className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">清空数据</h3>
            <p className="text-gray-500 text-sm mb-4">
              清除所有活动、物资和领取记录数据。此操作不可恢复，请谨慎操作。
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-200"
            >
              <Trash2 size={18} />
              清空所有
            </button>
          </div>
        </div>

        {importError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-800">导入失败</p>
              <p className="text-sm text-red-700">{importError}</p>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认清空所有数据"
        size="sm"
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-800">此操作不可恢复</p>
              <p className="text-sm text-red-700">
                将删除 {activities.length} 个活动、{items.length} 个物资和 {records.length} 条领取记录。
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          确定要清空所有数据吗？建议先导出备份。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleClearData}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            确认清空
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setImportPreview(null);
          setImportAnalysis(null);
        }}
        title="导入数据预览"
        size="lg"
      >
        {importAnalysis && importPreview && (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">导入模式</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setImportMode('overwrite')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    importMode === 'overwrite'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Copy size={20} className={importMode === 'overwrite' ? 'text-blue-500' : 'text-gray-400'} />
                    <span className={`font-semibold ${importMode === 'overwrite' ? 'text-blue-700' : 'text-gray-700'}`}>
                      覆盖导入
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    用备份数据替换当前所有数据，原有数据将丢失
                  </p>
                </button>
                <button
                  onClick={() => setImportMode('merge')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    importMode === 'merge'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Merge size={20} className={importMode === 'merge' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className={`font-semibold ${importMode === 'merge' ? 'text-purple-700' : 'text-gray-700'}`}>
                      合并导入
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    将备份数据合并到当前数据中，保留原有数据
                  </p>
                </button>
              </div>
            </div>

            {importMode === 'overwrite' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-amber-800">当前本地数据将被覆盖</p>
                    <p className="text-sm text-amber-700">
                      导入后，当前所有数据将被替换为备份文件中的数据，此操作无法撤销。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {importMode === 'merge' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <Merge className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-purple-800">将保留当前本地数据</p>
                    <p className="text-sm text-purple-700">
                      备份中的数据将合并到当前数据中。如遇ID冲突，将自动为导入的数据生成新ID以避免混淆。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {importAnalysis.missingFields.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-blue-800">
                      备份文件缺少 {importAnalysis.missingFields.length} 项新功能数据
                    </p>
                    <p className="text-sm text-blue-700 mb-2">
                      以下字段在备份中不存在，导入后将使用默认空数组补齐：
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {importAnalysis.missingFields.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-lg text-xs text-blue-700"
                        >
                          <span>{DATA_FIELD_LABELS[field]?.icon}</span>
                          <span>{DATA_FIELD_LABELS[field]?.label || field}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {importMode === 'overwrite' ? '数据详情对比（导入后将替换当前数据）' : '数据详情对比（合并后将累加数据）'}
              </h3>
              <div className="space-y-2">
                {Object.entries(DATA_FIELD_LABELS).map(([field, info]) => {
                  const importCount = importAnalysis.counts[field as keyof typeof importAnalysis.counts];
                  const currentCount = importAnalysis.currentCounts[field as keyof typeof importAnalysis.currentCounts];
                  const isMissing = importAnalysis.missingFields.includes(field);
                  const diff = importCount - currentCount;

                  return (
                    <div
                      key={field}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        isMissing
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800">{info.label}</p>
                          {isMissing && (
                            <p className="text-xs text-gray-400">备份中无此字段</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">当前</p>
                          <p className="font-medium text-gray-500">{currentCount}</p>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">导入后</p>
                          <p className={`font-bold ${isMissing ? 'text-gray-400' : 'text-gray-800'}`}>
                            {importCount}
                          </p>
                        </div>
                        <div className="w-12 text-right">
                          {!isMissing && diff !== 0 && (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                diff > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {diff > 0 ? '+' : ''}
                              {diff}
                            </span>
                          )}
                          {!isMissing && diff === 0 && (
                            <span className="text-xs text-gray-400">不变</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setImportPreview(null);
                  setImportAnalysis(null);
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className={`flex-1 py-3 rounded-xl text-white font-medium transition-all shadow-lg ${
                  importMode === 'overwrite'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-blue-200'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-200'
                }`}
              >
                {importMode === 'overwrite' ? '确认覆盖导入' : '确认合并导入'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={showMergeResult}
        onClose={() => {
          setShowMergeResult(false);
          setMergeResult(null);
        }}
        title="合并导入结果"
        size="lg"
      >
        {mergeResult?.success && mergeResult.summary && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-green-800">合并导入成功</p>
                  <p className="text-sm text-green-700">
                    备份数据已成功合并到当前数据中，原有数据均已保留。
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-500 mb-3">合并详情</h3>
              <div className="space-y-2">
                {Object.entries(DATA_FIELD_LABELS).map(([field, info]) => {
                  const summary = mergeResult.summary![field as keyof typeof mergeResult.summary];
                  if (!summary) return null;

                  return (
                    <div
                      key={field}
                      className="flex items-center justify-between p-3 rounded-xl border bg-white border-gray-100 hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800">{info.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">原有保留</p>
                          <p className="font-medium text-gray-500">{summary.kept}</p>
                        </div>
                        <div className="text-gray-300">+</div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">新增</p>
                          <p className="font-bold text-green-600">{summary.added}</p>
                        </div>
                        {summary.renamed > 0 && (
                          <>
                            <div className="text-gray-300">=</div>
                            <div className="text-right">
                              <p className="text-gray-400 text-xs">ID重命名</p>
                              <p className="font-medium text-amber-600">{summary.renamed}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mt-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-purple-800 mb-1">关于 ID 重命名</p>
                  <p className="text-sm text-purple-700">
                    当备份中的数据 ID 与本地数据 ID 冲突时，系统会自动为导入的数据生成新的唯一 ID，
                    并同步更新所有关联引用（如物资所属活动、领取记录关联的物资等），
                    确保不同来源的数据不会混淆。
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <Database className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800 mb-1">数据健康检查</p>
                  <p className="text-sm text-blue-700">
                    建议合并后前往数据健康检查中心扫描，确认是否存在孤儿数据或库存不一致等问题。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMergeResult(false);
                  setMergeResult(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-200"
              >
                完成
              </button>
            </div>
          </>
        )}
      </Modal>

      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl shadow-lg">
            <CheckCircle size={20} />
            <span className="font-medium">{showSuccessToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};
