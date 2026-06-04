import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Edit2,
  CheckCircle,
  Filter,
  ImageOff,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Item, ITEM_TYPE_CONFIG, ItemType } from '@/types';
import { Modal } from '@/components/Modal';

export const ImageLibrary: React.FC = () => {
  const { activities, items, updateItem } = useAppStore();
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedActivity !== 'all' && item.activityId !== selectedActivity) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (showEmptyOnly && item.designUrl) return false;
    return true;
  });

  const itemsWithImage = items.filter((item) => item.designUrl).length;
  const itemsWithoutImage = items.filter((item) => !item.designUrl).length;

  const copyToClipboard = async (url: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(itemId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setEditUrl(item.designUrl || '');
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, { designUrl: editUrl });
    setEditingItem(null);
  };

  const getActivityName = (activityId: string) => {
    return activities.find((a) => a.id === activityId)?.name || '未知活动';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">物资图片库 🖼️</h1>
          <p className="text-gray-500">集中管理所有活动物资的设计图</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
            <p className="text-sm text-gray-500">物资总数</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{itemsWithImage}</p>
            <p className="text-sm text-gray-500">有设计图</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{itemsWithoutImage}</p>
            <p className="text-sm text-gray-500">无设计图</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-pink-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">筛选条件</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">按活动</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              >
                <option value="all">全部活动</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">按类型</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ItemType | 'all')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              >
                <option value="all">全部类型</option>
                {Object.entries(ITEM_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showEmptyOnly}
                  onChange={(e) => setShowEmptyOnly(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-300"
                />
                <ImageOff size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">仅显示无设计图</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-500">
            共找到 <span className="font-bold text-gray-800">{filteredItems.length}</span> 个物资
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const typeConfig = ITEM_TYPE_CONFIG[item.type];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-pink-50 hover:border-pink-100"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: typeConfig.color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: typeConfig.color + '30' }}
                      >
                        {item.type === 'lightstick' && '💡'}
                        {item.type === 'banner' && '🎏'}
                        {item.type === 'sticker' && '🌟'}
                        {item.type === 'freepack' && '🎁'}
                        {item.type === 'lottery' && '🎰'}
                        {item.type === 'other' && '📦'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: typeConfig.color + '30', color: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-pink-500 transition-colors"
                      title="编辑图片地址"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    📍 {getActivityName(item.activityId)}
                  </div>

                  {item.designUrl ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <img
                          src={item.designUrl}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="160" viewBox="0 0 200 160"%3E%3Crect fill="%23f3f4f6" width="200" height="160"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(item.designUrl, item.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {copySuccess === item.id ? (
                            <>
                              <CheckCircle size={16} className="text-green-500" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy size={16} />
                              复制链接
                            </>
                          )}
                        </button>
                        <a
                          href={item.designUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-pink-100 text-pink-600 rounded-xl text-sm font-medium hover:bg-pink-200 transition-colors"
                        >
                          <ImageIcon size={16} />
                          查看大图
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-full h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                        <ImageOff size={48} className="mb-2" />
                        <span className="text-sm">暂无设计图</span>
                      </div>
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
                      >
                        <RefreshCw size={16} />
                        添加设计图
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-12 text-center">
            <ImageOff size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">没有找到物资</h3>
            <p className="text-gray-500">尝试调整筛选条件或添加新的物资</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="编辑设计图地址"
        size="md"
      >
        {editingItem && (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: ITEM_TYPE_CONFIG[editingItem.type].color + '30' }}
                >
                  {editingItem.type === 'lightstick' && '💡'}
                  {editingItem.type === 'banner' && '🎏'}
                  {editingItem.type === 'sticker' && '🌟'}
                  {editingItem.type === 'freepack' && '🎁'}
                  {editingItem.type === 'lottery' && '🎰'}
                  {editingItem.type === 'other' && '📦'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{editingItem.name}</h4>
                  <p className="text-sm text-gray-500">{getActivityName(editingItem.activityId)}</p>
                </div>
              </div>
            </div>

            {editUrl && (
              <div className="mb-4">
                <img
                  src={editUrl}
                  alt="预览"
                  className="w-full h-48 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设计图 URL 地址
              </label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="请输入图片链接地址"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                保存修改
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};
