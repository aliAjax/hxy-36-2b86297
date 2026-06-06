import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MaterialTemplate, MaterialTemplateItem } from '@/types';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: string;
  error?: string;
}

export const TemplateIndependenceVerification: React.FC = () => {
  const {
    addActivity,
    addItem,
    saveActivityAsTemplate,
    applyTemplateToActivity,
    updateMaterialTemplate,
    updateItem,
    deleteActivity,
    deleteMaterialTemplate,
  } = useAppStore();
  
  const getState = useAppStore.getState;

  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'step1',
      title: '步骤 1：创建源活动并添加物资',
      description: '创建一个测试活动，并添加几项初始物资',
      status: 'pending',
    },
    {
      id: 'step2',
      title: '步骤 2：将活动物资保存为模板',
      description: '将源活动的物资配置保存为模板（深拷贝）',
      status: 'pending',
    },
    {
      id: 'step3',
      title: '步骤 3：将模板应用到目标活动',
      description: '创建另一个活动，从模板创建物资（再次深拷贝，分配新 ID）',
      status: 'pending',
    },
    {
      id: 'step4',
      title: '步骤 4：编辑模板中的物资配置',
      description: '修改模板：调整库存、预算、供应商、名称',
      status: 'pending',
    },
    {
      id: 'step5',
      title: '步骤 5：验证已创建的活动物资未被修改',
      description: '对比目标活动物资的值与应用模板时的快照，确认未随模板改变',
      status: 'pending',
    },
    {
      id: 'step6',
      title: '步骤 6：反向验证 - 修改活动物资不影响模板',
      description: '修改目标活动物资的值，确认模板不受影响',
      status: 'pending',
    },
  ]);

  const [activityIds, setActivityIds] = useState<{ source: string | null; target: string | null }>({
    source: null,
    target: null,
  });
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testDataCreated, setTestDataCreated] = useState(false);

  const updateStep = (id: string, updates: Partial<VerificationStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runVerification = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'pending', result: undefined, error: undefined })));
    setActivityIds({ source: null, target: null });
    setTemplateId(null);

    // LOCAL variables for immediate comparison (avoids React state async update issues)
    let localSnapshot: Map<string, MaterialTemplateItem> | null = null;
    let localTemplateSnapshot: MaterialTemplate | null = null;
    let targetActivityLocal: { id: string; name: string } | null = null;
    let templateIdLocal: string | null = null;

    try {
      // ============ Step 1: Create source activity and add items ============
      updateStep('step1', { status: 'running' });
      await delay(600);

      const sourceActivityName = '【验证用】源活动';
      addActivity({
        name: sourceActivityName,
        date: '2026-01-01',
        description: '用于验证模板独立性的测试活动',
        coverUrl: '',
        status: 'ongoing',
      });

      // Find the activity we just created (by name, since it's unique)
      const stateAfterSource = getState();
      const sourceActivity = stateAfterSource.activities.find((a) => a.name === sourceActivityName);
      if (!sourceActivity) {
        throw new Error('无法找到刚创建的源活动');
      }

      const sourceItemsData = [
        { name: '灯牌 A', type: 'lightstick' as const, totalStock: 100, budget: 5000, supplier: '供应商 A' },
        { name: '手幅 B', type: 'banner' as const, totalStock: 200, budget: 2000, supplier: '供应商 B' },
        { name: '贴纸 C', type: 'sticker' as const, totalStock: 500, budget: 1000, supplier: '供应商 C' },
      ];

      sourceItemsData.forEach((data) => {
        addItem({
          activityId: sourceActivity.id,
          name: data.name,
          type: data.type,
          totalStock: data.totalStock,
          currentStock: data.totalStock,
          budget: data.budget,
          supplier: data.supplier,
          designUrl: '',
          distributionRule: '',
          note: '',
        });
      });

      setActivityIds((prev) => ({ ...prev, source: sourceActivity.id }));

      const stateAfterItems = getState();
      const sourceItems = stateAfterItems.items.filter((i) => i.activityId === sourceActivity.id);
      updateStep('step1', {
        status: 'success',
        result: `创建活动"【验证用】源活动" (ID: ${sourceActivity.id.slice(0, 8)}...)，添加 ${sourceItems.length} 项物资：灯牌A(100库存/¥5000)、手幅B(200库存/¥2000)、贴纸C(500库存/¥1000)`,
      });

      // ============ Step 2: Save as template ============
      updateStep('step2', { status: 'running' });
      await delay(600);

      const saveResult = saveActivityAsTemplate(
        sourceActivity.id,
        '【验证用】测试模板',
        '用于验证模板独立性的测试模板'
      );

      if (!saveResult.success || !saveResult.template) {
        throw new Error(saveResult.error || '保存模板失败');
      }

      templateIdLocal = saveResult.template.id;
      setTemplateId(saveResult.template.id);

      updateStep('step2', {
        status: 'success',
        result: `模板"【验证用】测试模板"已创建，包含 ${saveResult.template.items.length} 项物资配置。模板 ID: ${saveResult.template.id.slice(0, 8)}...`,
      });

      // ============ Step 3: Apply template to target activity ============
      updateStep('step3', { status: 'running' });
      await delay(600);

      const targetActivityName = '【验证用】目标活动';
      addActivity({
        name: targetActivityName,
        date: '2026-02-01',
        description: '验证中：从模板创建物资到这里',
        coverUrl: '',
        status: 'ongoing',
      });

      const stateAfterTarget = getState();
      const targetActivity = stateAfterTarget.activities.find((a) => a.name === targetActivityName);
      if (!targetActivity) {
        throw new Error('无法找到刚创建的目标活动');
      }
      targetActivityLocal = { id: targetActivity.id, name: targetActivity.name };

      setActivityIds((prev) => ({ ...prev, target: targetActivity.id }));

      const applyResult = applyTemplateToActivity(saveResult.template.id, targetActivity.id, {
        stockMultiplier: 1,
        budgetMultiplier: 1,
        supplierOverride: '',
      });

      if (!applyResult.success) {
        throw new Error(applyResult.error || '应用模板失败');
      }

      // Take a snapshot of the created items at this moment
      const snap = new Map<string, MaterialTemplateItem>();
      applyResult.createdItems.forEach((item) => {
        snap.set(item.id, {
          id: item.id,
          name: item.name,
          type: item.type,
          designUrl: item.designUrl,
          budget: item.budget,
          supplier: item.supplier,
          totalStock: item.totalStock,
          distributionRule: item.distributionRule,
          note: item.note,
        });
      });
      localSnapshot = snap;

      updateStep('step3', {
        status: 'success',
        result: `已创建目标活动"【验证用】目标活动" (ID: ${targetActivity.id.slice(0, 8)}...)，从模板创建 ${applyResult.createdItems.length} 项物资。所有物资分配了新 ID，与模板没有引用关系。快照已保存 (${snap.size} 项)`,
      });

      // ============ Step 4: Edit the template ============
      updateStep('step4', { status: 'running' });
      await delay(600);

      const updatedTemplateItems = saveResult.template.items.map((item) => {
        if (item.name === '灯牌 A') {
          return {
            ...item,
            name: '灯牌 A (已修改)',
            totalStock: item.totalStock * 2, // 100 -> 200
            budget: Math.round(item.budget * 1.5), // 5000 -> 7500
            supplier: '新供应商 XX',
          };
        }
        if (item.name === '手幅 B') {
          return {
            ...item,
            name: '手幅 B (已修改)',
            totalStock: 999,
            budget: 9999,
          };
        }
        return item;
      });

      updateMaterialTemplate(saveResult.template.id, {
        name: '【验证用】测试模板 (已修改)',
        items: updatedTemplateItems,
      });

      localTemplateSnapshot = JSON.parse(
        JSON.stringify(getState().materialTemplates.find((t) => t.id === saveResult.template.id)!)
      );

      updateStep('step4', {
        status: 'success',
        result: `模板已修改：灯牌A → 灯牌A(已修改)，库存 100→200，预算 5000→7500，供应商变更；手幅B → 手幅B(已修改)，库存 999，预算 9999。反向验证基准快照已更新（基于编辑后模板状态）。`,
      });

      // ============ Step 5: Verify created items are not affected ============
      updateStep('step5', { status: 'running' });
      await delay(800);

      if (!targetActivityLocal) {
        throw new Error('目标活动引用丢失');
      }
      if (!localSnapshot || localSnapshot.size === 0) {
        throw new Error('快照为空或未正确保存，无法进行比较');
      }

      const stateAfterTemplateEdit = getState();
      const currentItems = stateAfterTemplateEdit.items.filter(
        (i) => i.activityId === targetActivityLocal!.id
      );
      const mismatches: string[] = [];
      let comparisonCount = 0;

      // Explicitly verify we have the right number of items to compare
      if (currentItems.length !== localSnapshot.size) {
        throw new Error(
          `物资数量不匹配！快照有 ${localSnapshot.size} 项，当前有 ${currentItems.length} 项`
        );
      }

      currentItems.forEach((item) => {
        const snapItem = localSnapshot!.get(item.id);
        if (!snapItem) {
          mismatches.push(`${item.name}: 快照中找不到该物资的记录！`);
          return;
        }

        const fieldsToCheck = ['name', 'type', 'designUrl', 'budget', 'supplier', 'totalStock', 'distributionRule', 'note'] as const;
        fieldsToCheck.forEach((field) => {
          comparisonCount++;
          if (item[field] !== snapItem[field]) {
            mismatches.push(
              `${item.name} → ${field}: 快照=${snapItem[field]}, 当前=${item[field]}`
            );
          }
        });
      });

      const expectedComparisons = currentItems.length * 8;
      if (comparisonCount !== expectedComparisons) {
        throw new Error(
          `比较执行次数异常！预期 ${expectedComparisons} 次比较，实际只执行了 ${comparisonCount} 次。可能存在空快照跳过比较的问题。`
        );
      }

      if (mismatches.length > 0) {
        throw new Error(
          `正向验证失败！检测到 ${mismatches.length} 处不匹配：\n${mismatches.join('\n')}`
        );
      }

      // Also verify IDs are different (template items don't have IDs, but created items have unique IDs)
      const templateNames = saveResult.template.items.map((i) => i.name);
      const realItemNames = currentItems.map((i) => i.name);
      const namesMatch = templateNames.length === realItemNames.length &&
        templateNames.every((n) => realItemNames.includes(n));

      if (!namesMatch) {
        throw new Error('名称不匹配！应用模板时物资创建可能出错');
      }

      // Verify IDs are unique and not reused
      const stateAll = getState();
      const allIds = new Set<string>();
      stateAll.items.forEach((i) => allIds.add(i.id));
      if (allIds.size !== stateAll.items.length) {
        throw new Error('检测到重复的物资 ID！ID 生成存在问题');
      }

      updateStep('step5', {
        status: 'success',
        result: `✅ 验证通过！对目标活动的 ${currentItems.length} 项物资执行了 ${comparisonCount} 次字段比较（每项 8 个字段），全部保持原始值。灯牌A仍为"灯牌 A"、库存100、预算5000、供应商A。物资 ID 均为新生成，与模板无引用关系。`,
      });

      // ============ Step 6: Reverse verification - activity item edits don't affect template ============
      updateStep('step6', { status: 'running' });
      await delay(800);

      if (!templateIdLocal || !localTemplateSnapshot) {
        throw new Error('模板引用或模板快照丢失');
      }

      // Modify target activity items
      currentItems.forEach((item) => {
        updateItem(item.id, {
          name: `${item.name} (活动内修改)`,
          totalStock: item.totalStock + 12345,
          budget: item.budget + 67890,
        });
      });

      // Check template is unchanged
      const stateAfterActivityEdit = getState();
      const templateAfterActivityEdit = stateAfterActivityEdit.materialTemplates.find(
        (t) => t.id === templateIdLocal!
      );

      let reverseComparisonCount = 0;
      const reverseMismatches: string[] = [];

      if (!templateAfterActivityEdit) {
        throw new Error('修改活动物资后，模板不见了！');
      }

      if (templateAfterActivityEdit.items.length !== localTemplateSnapshot.items.length) {
        throw new Error(
          `模板物资数量变化了！编辑前 ${localTemplateSnapshot.items.length} 项，编辑后 ${templateAfterActivityEdit.items.length} 项`
        );
      }

      for (let i = 0; i < localTemplateSnapshot.items.length; i++) {
        const original = localTemplateSnapshot.items[i];
        const current = templateAfterActivityEdit.items[i];
        const fieldsToCheck = ['name', 'type', 'designUrl', 'budget', 'supplier', 'totalStock', 'distributionRule', 'note'] as const;
        fieldsToCheck.forEach((field) => {
          reverseComparisonCount++;
          if (original[field] !== current[field]) {
            reverseMismatches.push(
              `物资 #${i + 1} "${original.name}" → ${field}: 基准=${original[field]}, 当前=${current[field]}`
            );
          }
        });
      }

      const expectedReverseComparisons = localTemplateSnapshot.items.length * 8;
      if (reverseComparisonCount !== expectedReverseComparisons) {
        throw new Error(
          `反向比较执行次数异常！预期 ${expectedReverseComparisons} 次，实际 ${reverseComparisonCount} 次`
        );
      }

      if (reverseMismatches.length > 0) {
        throw new Error(
          `反向验证失败！检测到 ${reverseMismatches.length} 处不匹配：\n${reverseMismatches.join('\n')}`
        );
      }

      updateStep('step6', {
        status: 'success',
        result: `✅ 反向验证通过！对模板的 ${localTemplateSnapshot.items.length} 项物资执行了 ${reverseComparisonCount} 次字段比较（每项 8 个字段），全部保持不变。修改活动物资（名称追加"活动内修改"、库存+12345、预算+67890）后，模板数据完全独立。`,
      });

      setTestDataCreated(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setSteps((prev) => {
        const currentStep = prev.find((s) => s.status === 'running');
        if (currentStep) {
          return prev.map((s) =>
            s.id === currentStep.id
              ? { ...s, status: 'failed' as const, error: errorMsg }
              : s
          );
        }
        return prev;
      });
    } finally {
      setIsRunning(false);
    }
  };

  const cleanupTestData = () => {
    if (activityIds.source) {
      deleteActivity(activityIds.source);
    }
    if (activityIds.target) {
      deleteActivity(activityIds.target);
    }
    if (templateId) {
      deleteMaterialTemplate(templateId);
    }
    setActivityIds({ source: null, target: null });
    setTemplateId(null);
    setTestDataCreated(false);
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'pending', result: undefined, error: undefined })));
  };

  const failedSteps = steps.filter((s) => s.status === 'failed');
  const allPassed = steps.length > 0 && steps.every((s) => s.status === 'success');

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-6 h-6 rounded-full bg-gray-200" />;
      case 'running':
        return <RefreshCw size={20} className="text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'failed':
        return <AlertTriangle size={20} className="text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">模板独立性验证</h1>
              <p className="text-gray-500 text-sm">
                自动化验证：编辑模板不会影响已创建的活动物资，反之亦然
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">🔍 独立性验证原理</h2>
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-indigo-800 mb-3">
              <strong>核心机制：深拷贝 + 独立 ID</strong>
            </p>
            <ol className="space-y-2 text-sm text-indigo-700">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>保存模板时，完整复制物资数据，创建 <code className="bg-white px-1 rounded">MaterialTemplateItem[]</code>，与原物资无引用关系</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>应用模板时，为每个物资生成 <code className="bg-white px-1 rounded">全新 ID</code>，创建独立的 <code className="bg-white px-1 rounded">Item</code> 记录</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>模板只作为"配方"，与已创建的物资在数据层面完全独立</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-center gap-4 text-2xl text-gray-400 mb-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mb-2">
                📦
              </div>
              <p className="text-xs text-gray-600">活动物资</p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="text-pink-400" />
              <span className="text-xs text-gray-400">保存为模板</span>
              <span className="text-xs text-gray-400">(深拷贝)</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-2">
                📋
              </div>
              <p className="text-xs text-gray-600">模板</p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="text-amber-400" />
              <span className="text-xs text-gray-400">应用模板</span>
              <span className="text-xs text-gray-400">(新ID + 深拷贝)</span>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
                📦
              </div>
              <p className="text-xs text-gray-600">新活动物资</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`bg-white rounded-xl border p-5 transition-all ${
                step.status === 'failed'
                  ? 'border-red-200 bg-red-50/30'
                  : step.status === 'success'
                  ? 'border-green-200 bg-green-50/30'
                  : step.status === 'running'
                  ? 'border-blue-200 bg-blue-50/30'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                  {step.result && (
                    <p className="text-xs text-gray-700 bg-white/70 rounded-lg p-3 whitespace-pre-wrap">
                      {step.result}
                    </p>
                  )}
                  {step.error && (
                    <div className="text-xs text-red-700 bg-red-100 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={runVerification}
            disabled={isRunning}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                验证运行中...
              </>
            ) : (
              <>
                <Activity size={18} />
                运行自动化验证
              </>
            )}
          </button>
          {testDataCreated && (
            <button
              onClick={cleanupTestData}
              className="px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              清理测试数据
            </button>
          )}
        </div>

        {allPassed && (
          <div className="mt-6 p-6 bg-green-50 rounded-2xl border-2 border-green-200 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">所有验证通过！</h3>
            <p className="text-green-700 text-sm">
              模板与活动物资之间完全独立。编辑模板不会影响已创建的活动物资，
              编辑活动物资也不会影响模板。双向独立性已验证。
            </p>
          </div>
        )}

        {failedSteps.length > 0 && (
          <div className="mt-6 p-6 bg-red-50 rounded-2xl border-2 border-red-200">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                验证失败 ({failedSteps.length}/{steps.length} 步失败)
              </h3>
              <p className="text-red-700 text-sm">
                以下步骤未通过验证，请检查失败原因：
              </p>
            </div>
            <div className="space-y-3">
              {failedSteps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white rounded-xl border border-red-200 p-4"
                >
                  <h4 className="font-bold text-red-800 text-sm mb-2">{step.title}</h4>
                  {step.error && (
                    <div className="text-xs text-red-700 bg-red-50 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                      {step.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
