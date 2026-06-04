import React, { useState, useMemo } from 'react';
import { Upload, AlertCircle, CheckCircle, XCircle, AlertTriangle, FileText, Info } from 'lucide-react';
import { Item, ClaimRecord } from '@/types';
import { Modal } from './Modal';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/utils/helpers';

interface BatchClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  items: Item[];
  onSuccess?: (result: { successCount: number; failCount: number }) => void;
}

interface ParsedRow {
  lineNumber: number;
  claimerName: string;
  contact: string;
  itemName: string;
  quantity: number;
  note: string;
  raw: string;
}

interface ValidatedRow extends ParsedRow {
  itemId?: string;
  item?: Item;
  errors: {
    type: 'item_not_found' | 'stock_insufficient' | 'duplicate' | 'invalid_quantity' | 'empty_name';
    message: string;
  }[];
  warnings: {
    type: 'duplicate';
    message: string;
  }[];
}

const SEPARATORS = [',', '\t', ';', '|', '，'];

const parseRow = (line: string, lineNumber: number): ParsedRow | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let separator = ',';
  let maxCount = 0;
  for (const sep of SEPARATORS) {
    const count = trimmed.split(sep).length;
    if (count > maxCount) {
      maxCount = count;
      separator = sep;
    }
  }

  const parts = trimmed.split(separator).map((p) => p.trim());

  const claimerName = parts[0] || '';
  const contact = parts[1] || '';
  const itemName = parts[2] || '';
  const quantity = parseInt(parts[3]) || 1;
  const note = parts.slice(4).join(separator).trim();

  return {
    lineNumber,
    claimerName,
    contact,
    itemName,
    quantity,
    note,
    raw: trimmed,
  };
};

export const BatchClaimForm: React.FC<BatchClaimFormProps> = ({
  isOpen,
  onClose,
  activityId,
  items,
  onSuccess,
}) => {
  const { addRecordsBatch, checkDuplicateClaim } = useAppStore();
  const [rawText, setRawText] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'result'>('input');
  const [forceAddDuplicates, setForceAddDuplicates] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    failCount: number;
    results: {
      index: number;
      success: boolean;
      isDuplicate: boolean;
      error?: string;
      record?: ClaimRecord;
    }[];
  } | null>(null);

  const parsedRows = useMemo(() => {
    if (!rawText.trim()) return [];
    const lines = rawText.split('\n');
    const rows: ParsedRow[] = [];
    lines.forEach((line, index) => {
      const parsed = parseRow(line, index + 1);
      if (parsed) {
        rows.push(parsed);
      }
    });
    return rows;
  }, [rawText]);

  const validatedRows = useMemo((): ValidatedRow[] => {
    const stockAllocated = new Map<string, number>();

    return parsedRows.map((row) => {
      const validated: ValidatedRow = {
        ...row,
        errors: [],
        warnings: [],
      };

      if (!row.claimerName.trim()) {
        validated.errors.push({
          type: 'empty_name',
          message: '领取人姓名不能为空',
        });
        return validated;
      }

      if (row.quantity <= 0 || isNaN(row.quantity)) {
        validated.errors.push({
          type: 'invalid_quantity',
          message: `数量异常：${row.quantity}`,
        });
        return validated;
      }

      const matchedItem = items.find(
        (i) => i.name.toLowerCase().trim() === row.itemName.toLowerCase().trim()
      );

      if (!matchedItem) {
        validated.errors.push({
          type: 'item_not_found',
          message: `找不到物资「${row.itemName}」`,
        });
        return validated;
      }

      validated.itemId = matchedItem.id;
      validated.item = matchedItem;

      const allocated = stockAllocated.get(matchedItem.id) || 0;
      const availableStock = matchedItem.currentStock - allocated;

      if (availableStock < row.quantity) {
        validated.errors.push({
          type: 'stock_insufficient',
          message: `库存不足，当前可用 ${availableStock} 个（已被本批次其他记录占用 ${allocated} 个）`,
        });
      } else {
        stockAllocated.set(matchedItem.id, allocated + row.quantity);
      }

      if (row.claimerName.trim()) {
        const isDuplicate = checkDuplicateClaim(activityId, matchedItem.id, row.claimerName);
        if (isDuplicate) {
          validated.warnings.push({
            type: 'duplicate',
            message: `「${row.claimerName}」已领取过「${matchedItem.name}」`,
          });
          if (!forceAddDuplicates) {
            validated.errors.push({
              type: 'duplicate',
              message: `重复领取，可勾选"强制导入重复记录"跳过此检查`,
            });
          }
        }
      }

      return validated;
    });
  }, [parsedRows, items, activityId, checkDuplicateClaim, forceAddDuplicates]);

  const validRows = useMemo(
    () => validatedRows.filter((r) => r.errors.length === 0),
    [validatedRows]
  );

  const invalidRows = useMemo(
    () => validatedRows.filter((r) => r.errors.length > 0),
    [validatedRows]
  );

  const handlePasteExample = () => {
    setRawText(
      `张三,13800138000,灯牌,1,VIP用户
李四,13800138001,手幅,2,老粉
王五,13800138002,贴纸,5,
赵六,13800138003,无料包,1,朋友代领`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
    };
    reader.readAsText(file);
  };

  const handlePreview = () => {
    if (parsedRows.length === 0) return;
    setStep('preview');
  };

  const handleBack = () => {
    setStep('input');
  };

  const handleImport = () => {
    const recordsToImport = validRows.map((row) => ({
      activityId,
      itemId: row.itemId!,
      claimerName: row.claimerName.trim(),
      contact: row.contact.trim(),
      quantity: row.quantity,
      note: row.note.trim(),
    }));

    const result = addRecordsBatch(recordsToImport, forceAddDuplicates);
    setImportResult(result);
    setStep('result');
    onSuccess?.(result);
  };

  const handleClose = () => {
    setRawText('');
    setStep('input');
    setForceAddDuplicates(false);
    setImportResult(null);
    onClose();
  };

  const getRowStatus = (row: ValidatedRow) => {
    if (row.errors.length > 0) {
      const hasOnlyDuplicateError =
        row.errors.length === 1 && row.errors[0].type === 'duplicate';
      if (hasOnlyDuplicateError && forceAddDuplicates) {
        return 'warning';
      }
      return 'error';
    }
    if (row.warnings.length > 0) {
      return 'warning';
    }
    return 'valid';
  };

  const StatusBadge = ({ status }: { status: 'valid' | 'warning' | 'error' }) => {
    const config = {
      valid: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: '有效' },
      warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: '警告' },
      error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: '无效' },
    };
    const { icon: Icon, color, bg, label } = config[status];
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', bg, color)}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  if (items.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="批量录入领取记录" size="lg">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-500">该活动还没有添加任何物资，请先添加物资后再批量录入。</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="批量录入领取记录" size="xl">
      {step === 'input' && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-blue-800 mb-2">📋 格式说明</p>
                <p className="text-sm text-blue-700 mb-2">
                  每行一条记录，字段顺序为：<code className="bg-blue-100 px-1 rounded">领取人,联系方式,物资名称,数量,备注</code>
                </p>
                <p className="text-sm text-blue-600">
                  支持逗号、制表符、分号、竖线等分隔符；数量和备注可选，数量默认为1。
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">粘贴内容或上传CSV文件</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePasteExample}
                  className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
                >
                  <FileText size={14} />
                  粘贴示例
                </button>
                <label className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer">
                  <Upload size={14} />
                  上传文件
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="张三,13800138000,灯牌,1,VIP用户&#10;李四,13800138001,手幅,2,老粉&#10;王五,13800138002,贴纸,5,"
              className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={forceAddDuplicates}
                onChange={(e) => setForceAddDuplicates(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-gray-600">强制导入重复领取记录</span>
            </label>
            <div className="text-sm text-gray-500">
              已解析 {parsedRows.length} 行数据
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={parsedRows.length === 0}
              className={cn(
                'flex-1 py-3 rounded-xl font-medium transition-all shadow-lg',
                parsedRows.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-200'
              )}
            >
              预览并校验
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              <span className="font-medium text-gray-800">有效：{validRows.length} 条</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="text-red-500" size={20} />
              <span className="font-medium text-gray-800">无效：{invalidRows.length} 条</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceAddDuplicates}
              onChange={(e) => setForceAddDuplicates(e.target.checked)}
              className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600">强制导入重复领取记录</span>
          </label>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {validatedRows.map((row, index) => {
              const status = getRowStatus(row);
              return (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    status === 'valid' && 'border-green-200 bg-green-50/50',
                    status === 'warning' && 'border-orange-200 bg-orange-50/50',
                    status === 'error' && 'border-red-200 bg-red-50/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-400">第 {row.lineNumber} 行</span>
                        <StatusBadge status={status} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">领取人：</span>
                          <span className="font-medium text-gray-800">{row.claimerName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">联系方式：</span>
                          <span className="text-gray-800">{row.contact || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">物资：</span>
                          <span className="font-medium text-gray-800">{row.itemName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">数量：</span>
                          <span className="font-medium text-gray-800">{row.quantity}</span>
                        </div>
                      </div>
                      {row.note && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">备注：</span>
                          <span className="text-gray-700">{row.note}</span>
                        </div>
                      )}
                      {row.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {row.errors.map((error, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sm text-red-600">
                              <AlertCircle size={14} />
                              {error.message}
                            </div>
                          ))}
                        </div>
                      )}
                      {row.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {row.warnings.map((warning, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sm text-orange-600">
                              <AlertTriangle size={14} />
                              {warning.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              返回修改
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={validRows.length === 0}
              className={cn(
                'flex-1 py-3 rounded-xl font-medium transition-all shadow-lg',
                validRows.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-200'
              )}
            >
              确认导入 {validRows.length} 条记录
            </button>
          </div>
        </div>
      )}

      {step === 'result' && importResult && (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">导入完成</h3>
            <p className="text-gray-600">
              成功导入 <span className="text-green-600 font-bold">{importResult.successCount}</span> 条记录，
              失败 <span className="text-red-600 font-bold">{importResult.failCount}</span> 条
            </p>
          </div>

          {importResult.failCount > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              <h4 className="font-medium text-gray-700">失败记录详情：</h4>
              {importResult.results
                .filter((r) => !r.success)
                .map((result, index) => {
                  const row = validatedRows[result.index];
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-red-200 bg-red-50/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="text-red-500" size={16} />
                        <span className="text-sm text-gray-500">第 {row?.lineNumber || '?'} 行</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-1">
                        {row?.claimerName} - {row?.itemName} x {row?.quantity}
                      </p>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl font-medium transition-all shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-pink-200"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
