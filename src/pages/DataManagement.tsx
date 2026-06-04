import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, FileJson, CheckCircle, AlertTriangle, Database, Image } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Modal } from '@/components/Modal';
import { DataHealthCenter } from '@/components/DataHealthCenter';
import { downloadFile, readFileAsText, formatFileSize } from '@/utils/helpers';
import { AppData } from '@/types';
import { Link } from 'react-router-dom';

export const DataManagement: React.FC = () => {
  const { activities, items, records, exportData, importData, clearAllData } = useAppStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<AppData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDataSize = new Blob([exportData()]).size;

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

      setImportPreview(parsedData);
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

    const result = importData(importPreview);
    if (result.success) {
      showToast('数据导入成功！');
    } else {
      setImportError(result.error || '导入失败');
    }
    setShowImportConfirm(false);
    setImportPreview(null);
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
              从之前导出的 JSON 备份文件恢复数据。此操作将覆盖现有数据。
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
        }}
        title="确认导入数据"
        size="md"
      >
        {importPreview && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-800">将覆盖现有数据</p>
                  <p className="text-sm text-blue-700">
                    导入后，当前所有数据将被替换为文件中的数据。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{importPreview.activities.length}</p>
                <p className="text-sm text-gray-500">活动</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{importPreview.items.length}</p>
                <p className="text-sm text-gray-500">物资</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{importPreview.records.length}</p>
                <p className="text-sm text-gray-500">领取记录</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setImportPreview(null);
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                确认导入
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
