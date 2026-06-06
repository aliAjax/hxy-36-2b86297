import React from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  AlertTriangle,
  ShoppingCart,
  ClipboardList,
  Package,
  Check,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '@/components/Modal';
import { cn } from '@/utils/helpers';

const REPORT_MODULES = [
  { id: 'consumption', label: '物资消耗', icon: BarChart3, desc: '消耗趋势图与类型分布' },
  { id: 'budget', label: '预算汇总', icon: DollarSign, desc: '各物资预算与发放情况' },
  { id: 'claimers', label: '领取人数', icon: Users, desc: '领取人统计与明细' },
  { id: 'duplicates', label: '重复领取提醒', icon: AlertTriangle, desc: '异常重复领取记录' },
  { id: 'purchase', label: '采购完成情况', icon: ShoppingCart, desc: '采购进度与预算统计' },
  { id: 'todos', label: '待办完成情况', icon: ClipboardList, desc: '待办事项完成进度' },
  { id: 'lowStock', label: '低库存物资', icon: Package, desc: '低于阈值的物资清单' },
];

const DEFAULT_REPORT_MODULES = [
  'consumption',
  'budget',
  'claimers',
  'duplicates',
  'purchase',
  'todos',
  'lowStock',
];

interface ReportConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModules: string[];
  setSelectedModules: (modules: string[]) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
}

export const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
  isOpen,
  onClose,
  selectedModules,
  setSelectedModules,
  lowStockThreshold,
  setLowStockThreshold,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules(
      selectedModules.includes(moduleId)
        ? selectedModules.filter((m) => m !== moduleId)
        : [...selectedModules, moduleId]
    );
  };

  const handleGenerateReport = () => {
    if (selectedModules.length === 0 || !id) return;
    const params = new URLSearchParams();
    params.set('modules', selectedModules.join(','));
    if (selectedModules.includes('lowStock')) {
      params.set('threshold', String(lowStockThreshold));
    }
    navigate(`/activity/${id}/report?${params.toString()}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="生成复盘报告" size="lg">
      <p className="text-gray-500 text-sm mb-6">
        选择要包含在报告中的模块，然后点击"生成报告"查看完整报告。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {REPORT_MODULES.map((module) => {
          const Icon = module.icon;
          const isSelected = selectedModules.includes(module.id);
          return (
            <button
              key={module.id}
              onClick={() => handleToggleModule(module.id)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-pink-400 bg-pink-50/50'
                  : 'border-gray-100 bg-white hover:border-pink-200 hover:bg-pink-50/30'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'
                )}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">{module.label}</h4>
                  {isSelected && <Check size={16} className="text-pink-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{module.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedModules.includes('lowStock') && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">低库存阈值</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="50"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
              className="flex-1 accent-pink-500"
            />
            <span className="w-16 text-center font-bold text-pink-600">
              {lowStockThreshold} 个
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">库存低于此数量的物资将被标记为低库存</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <span>
          已选择{' '}
          <span className="font-bold text-pink-600">{selectedModules.length}</span> 个模块
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedModules(DEFAULT_REPORT_MODULES)}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            全选
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setSelectedModules([])}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            清空
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleGenerateReport}
          disabled={selectedModules.length === 0}
          className={cn(
            'flex-1 py-3 rounded-xl font-medium transition-all',
            selectedModules.length > 0
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          生成报告
        </button>
      </div>
    </Modal>
  );
};
