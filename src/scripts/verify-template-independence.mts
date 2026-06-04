// Verification script for template-item independence
// Run with: npx ts-node --esm src/scripts/verify-template-independence.mts

import { useAppStore } from '../store/useAppStore';
import { MaterialTemplateItem } from '../types';

const { getState } = useAppStore;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 模板-活动物资独立性验证脚本');
  console.log('='.repeat(80));
  console.log();

  // Clean up any previous test data first
  const state0 = getState();
  state0.activities
    .filter((a) => a.name.includes('【脚本验证】'))
    .forEach((a) => state0.deleteActivity(a.id));
  state0.materialTemplates
    .filter((t) => t.name.includes('【脚本验证】'))
    .forEach((t) => state0.deleteMaterialTemplate(t.id));

  // ============ Step 1: Create source activity and add items ============
  console.log('步骤 1: 创建源活动并添加物资...');
  const sourceActivityName = '【脚本验证】源活动';
  getState().addActivity({
    name: sourceActivityName,
    date: '2026-01-01',
    description: '用于验证模板独立性的测试活动',
    coverUrl: '',
    status: 'ongoing',
  });

  const stateAfterSource = getState();
  const sourceActivity = stateAfterSource.activities.find((a) => a.name === sourceActivityName);
  if (!sourceActivity) {
    console.error('❌ 失败: 无法找到刚创建的源活动');
    process.exit(1);
  }

  const sourceItemsData = [
    { name: '灯牌 A', type: 'lightstick' as const, totalStock: 100, budget: 5000, supplier: '供应商 A' },
    { name: '手幅 B', type: 'banner' as const, totalStock: 200, budget: 2000, supplier: '供应商 B' },
    { name: '贴纸 C', type: 'sticker' as const, totalStock: 500, budget: 1000, supplier: '供应商 C' },
  ];

  sourceItemsData.forEach((data) => {
    getState().addItem({
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

  const sourceItems = getState().items.filter((i) => i.activityId === sourceActivity.id);
  console.log(`  ✅ 源活动创建成功，添加 ${sourceItems.length} 项物资`);
  console.log(`     - 灯牌 A: 库存 ${sourceItems[0].totalStock}, 预算 ¥${sourceItems[0].budget}, 供应商 ${sourceItems[0].supplier}`);
  console.log(`     - 手幅 B: 库存 ${sourceItems[1].totalStock}, 预算 ¥${sourceItems[1].budget}, 供应商 ${sourceItems[1].supplier}`);
  console.log(`     - 贴纸 C: 库存 ${sourceItems[2].totalStock}, 预算 ¥${sourceItems[2].budget}, 供应商 ${sourceItems[2].supplier}`);
  console.log();

  // ============ Step 2: Save as template ============
  console.log('步骤 2: 将活动物资保存为模板...');
  const saveResult = getState().saveActivityAsTemplate(
    sourceActivity.id,
    '【脚本验证】测试模板',
    '用于验证模板独立性的测试模板'
  );

  if (!saveResult.success || !saveResult.template) {
    console.error('❌ 失败:', saveResult.error);
    process.exit(1);
  }

  const templateId = saveResult.template.id;
  const templateSnapshot = JSON.parse(JSON.stringify(saveResult.template));
  console.log(`  ✅ 模板创建成功，包含 ${saveResult.template.items.length} 项物资配置`);
  console.log(`     模板 ID: ${templateId.slice(0, 12)}...`);
  console.log();

  // ============ Step 3: Apply template to target activity ============
  console.log('步骤 3: 将模板应用到目标活动...');
  const targetActivityName = '【脚本验证】目标活动';
  getState().addActivity({
    name: targetActivityName,
    date: '2026-02-01',
    description: '验证中：从模板创建物资到这里',
    coverUrl: '',
    status: 'ongoing',
  });

  const stateAfterTarget = getState();
  const targetActivity = stateAfterTarget.activities.find((a) => a.name === targetActivityName);
  if (!targetActivity) {
    console.error('❌ 失败: 无法找到刚创建的目标活动');
    process.exit(1);
  }

  const applyResult = getState().applyTemplateToActivity(templateId, targetActivity.id, {
    stockMultiplier: 1,
    budgetMultiplier: 1,
    supplierOverride: '',
  });

  if (!applyResult.success) {
    console.error('❌ 失败:', applyResult.error);
    process.exit(1);
  }

  // Take a snapshot IMMEDIATELY (not async!)
  const snapshot = new Map<string, MaterialTemplateItem>();
  applyResult.createdItems.forEach((item) => {
    snapshot.set(item.id, {
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

  console.log(`  ✅ 目标活动创建成功，从模板创建 ${applyResult.createdItems.length} 项物资`);
  console.log(`     快照已保存，包含 ${snapshot.size} 项物资的字段值`);
  applyResult.createdItems.forEach((item, idx) => {
    console.log(`     - [${idx}] ${item.name}: ID=${item.id.slice(0, 8)}..., 库存=${item.totalStock}, 预算=¥${item.budget}, 供应商=${item.supplier}`);
  });
  console.log();

  // ============ Step 4: Edit the template ============
  console.log('步骤 4: 编辑模板中的物资配置...');
  const updatedTemplateItems = saveResult.template.items.map((item) => {
    if (item.name === '灯牌 A') {
      return {
        ...item,
        name: '灯牌 A (已修改)',
        totalStock: item.totalStock * 2,
        budget: Math.round(item.budget * 1.5),
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

  getState().updateMaterialTemplate(templateId, {
    name: '【脚本验证】测试模板 (已修改)',
    items: updatedTemplateItems,
  });

  const templateAfterEdit = getState().materialTemplates.find((t) => t.id === templateId);
  console.log(`  ✅ 模板已修改：`);
  templateAfterEdit?.items.forEach((item) => {
    console.log(`     - ${item.name}: 库存=${item.totalStock}, 预算=¥${item.budget}, 供应商=${item.supplier}`);
  });
  console.log();

  // ============ Step 5: Verify created items are NOT affected ============
  console.log('步骤 5: 验证已创建的活动物资未被修改...');
  const stateAfterTemplateEdit = getState();
  const currentItems = stateAfterTemplateEdit.items.filter((i) => i.activityId === targetActivity.id);
  const mismatches: string[] = [];
  let comparisonCount = 0;

  console.log(`  📊 开始比较：${currentItems.length} 项物资 × 4 个字段 = ${currentItems.length * 4} 次比较`);
  console.log();

  if (currentItems.length !== snapshot.size) {
    console.error(`❌ 物资数量不匹配！快照有 ${snapshot.size} 项，当前有 ${currentItems.length} 项`);
    process.exit(1);
  }

  currentItems.forEach((item) => {
    const snapItem = snapshot.get(item.id);
    if (!snapItem) {
      mismatches.push(`${item.name}: 快照中找不到该物资的记录！`);
      console.error(`     ❌ ${item.name}: 快照中找不到 ID ${item.id}`);
      return;
    }

    const fieldsToCheck = ['name', 'totalStock', 'budget', 'supplier'] as const;
    fieldsToCheck.forEach((field) => {
      comparisonCount++;
      const currentVal = item[field];
      const snapshotVal = snapItem[field];
      if (currentVal !== snapshotVal) {
        mismatches.push(
          `${item.name}: ${field} 不匹配！快照=${snapshotVal}, 当前=${currentVal}`
        );
        console.error(`     ❌ ${item.name} → ${field}: 快照=${snapshotVal}, 当前=${currentVal}`);
      } else {
        console.log(`     ✅ ${item.name} → ${field}: ${currentVal} (正确)`);
      }
    });
  });

  // CRITICAL: Verify that comparisons actually ran
  const expectedComparisons = currentItems.length * 4;
  if (comparisonCount !== expectedComparisons) {
    console.error();
    console.error(`❌ 比较执行次数异常！预期 ${expectedComparisons} 次比较，实际只执行了 ${comparisonCount} 次`);
    console.error('   这表明存在"假通过"问题：某些比较被跳过了！');
    process.exit(1);
  }

  if (mismatches.length > 0) {
    console.error();
    console.error(`❌ 检测到 ${mismatches.length} 处不匹配：`);
    mismatches.forEach((m, i) => console.error(`   ${i + 1}. ${m}`));
    process.exit(1);
  }

  console.log();
  console.log(`  ✅ 验证通过！执行了 ${comparisonCount} 次比较，全部匹配`);
  console.log(`     模板编辑没有影响已创建的活动物资`);
  console.log();

  // ============ Step 6: Reverse verification ============
  console.log('步骤 6: 反向验证 - 修改活动物资不影响模板...');
  currentItems.forEach((item) => {
    getState().updateItem(item.id, {
      name: `${item.name} (活动内修改)`,
      totalStock: item.totalStock + 12345,
      budget: item.budget + 67890,
    });
  });

  console.log(`  ✅ 已修改所有活动物资：`);
  getState()
    .items.filter((i) => i.activityId === targetActivity.id)
    .forEach((item) => {
      console.log(`     - ${item.name}: 库存=${item.totalStock}, 预算=¥${item.budget}`);
    });

  const templateAfterActivityEdit = getState().materialTemplates.find((t) => t.id === templateId);
  let reverseMismatch = false;
  let reverseMismatchDetail = '';
  let reverseComparisonCount = 0;

  console.log();
  console.log(`  📊 开始反向比较：${templateSnapshot.items.length} 项物资 × 3 个字段 = ${templateSnapshot.items.length * 3} 次比较`);
  console.log();

  if (!templateAfterActivityEdit) {
    console.error('❌ 修改活动物资后，模板不见了！');
    process.exit(1);
  }

  if (templateAfterActivityEdit.items.length !== templateSnapshot.items.length) {
    console.error('❌ 模板物资数量变化了！');
    process.exit(1);
  }

  for (let i = 0; i < templateSnapshot.items.length; i++) {
    const original = templateSnapshot.items[i];
    const current = templateAfterActivityEdit.items[i];
    const fieldsToCheck = ['name', 'totalStock', 'budget'] as const;
    fieldsToCheck.forEach((field) => {
      reverseComparisonCount++;
      const originalVal = original[field];
      const currentVal = current[field];
      if (originalVal !== currentVal) {
        reverseMismatch = true;
        reverseMismatchDetail = `第 ${i + 1} 项物资 ${field} 不匹配：原始=${originalVal}, 当前=${currentVal}`;
        console.error(`     ❌ ${original.name} → ${field}: 快照=${originalVal}, 当前=${currentVal}`);
      } else {
        console.log(`     ✅ ${original.name} → ${field}: ${currentVal} (正确)`);
      }
    });
    if (reverseMismatch) break;
  }

  const expectedReverseComparisons = templateSnapshot.items.length * 3;
  if (reverseComparisonCount !== expectedReverseComparisons) {
    console.error();
    console.error(`❌ 反向比较执行次数异常！预期 ${expectedReverseComparisons} 次，实际 ${reverseComparisonCount} 次`);
    process.exit(1);
  }

  if (reverseMismatch) {
    console.error();
    console.error(`❌ 反向验证失败！${reverseMismatchDetail}`);
    process.exit(1);
  }

  console.log();
  console.log(`  ✅ 反向验证通过！执行了 ${reverseComparisonCount} 次比较，全部匹配`);
  console.log(`     活动物资编辑没有影响模板`);
  console.log();

  // ============ Step 7: Verify ID uniqueness ============
  console.log('步骤 7: 验证 ID 唯一性（确保没有 ID 重用）...');
  const allItemIds = new Set<string>();
  const allTemplateIds = new Set<string>();
  const allActivityIds = new Set<string>();

  getState().items.forEach((i) => allItemIds.add(i.id));
  getState().materialTemplates.forEach((t) => allTemplateIds.add(t.id));
  getState().activities.forEach((a) => allActivityIds.add(a.id));

  const itemDuplicates = getState().items.length !== allItemIds.size;
  const templateDuplicates = getState().materialTemplates.length !== allTemplateIds.size;
  const activityDuplicates = getState().activities.length !== allActivityIds.size;

  if (itemDuplicates || templateDuplicates || activityDuplicates) {
    console.error('❌ 检测到 ID 重复！');
    console.error(`   - 物资: ${getState().items.length} 条记录, ${allItemIds.size} 个唯一 ID`);
    console.error(`   - 模板: ${getState().materialTemplates.length} 条记录, ${allTemplateIds.size} 个唯一 ID`);
    console.error(`   - 活动: ${getState().activities.length} 条记录, ${allActivityIds.size} 个唯一 ID`);
    process.exit(1);
  }

  console.log(`  ✅ ID 唯一性验证通过：`);
  console.log(`     - 物资: ${getState().items.length} 条记录 → ${allItemIds.size} 个唯一 ID ✓`);
  console.log(`     - 模板: ${getState().materialTemplates.length} 条记录 → ${allTemplateIds.size} 个唯一 ID ✓`);
  console.log(`     - 活动: ${getState().activities.length} 条记录 → ${allActivityIds.size} 个唯一 ID ✓`);
  console.log();

  // ============ Cleanup ============
  console.log('步骤 8: 清理测试数据...');
  getState().deleteActivity(sourceActivity.id);
  getState().deleteActivity(targetActivity.id);
  getState().deleteMaterialTemplate(templateId);
  console.log('  ✅ 测试数据已清理');
  console.log();

  // ============ Final summary ============
  console.log('='.repeat(80));
  console.log('🎉 所有验证通过！');
  console.log('='.repeat(80));
  console.log();
  console.log('验证总结：');
  console.log(`  ✅ 正向独立性：编辑模板 → 已创建的活动物资不变 (${comparisonCount} 次比较)`);
  console.log(`  ✅ 反向独立性：编辑活动物资 → 模板不变 (${reverseComparisonCount} 次比较)`);
  console.log(`  ✅ ID 独立性：活动物资 ID 与模板无关联，全部唯一`);
  console.log(`  ✅ 无假通过：比较次数验证确保每次比较都真实执行`);
  console.log();
  console.log('模板与活动物资是完全独立的两个实体。深拷贝机制确保了：');
  console.log('  • 模板编辑仅影响后续使用该模板创建的新物资');
  console.log('  • 已创建的活动物资与模板无任何引用关系');
  console.log('  • 活动物资编辑也不会反向影响模板');
  console.log();
  console.log('='.repeat(80));
  process.exit(0);
}

runVerification().catch((error) => {
  console.error('\n❌ 验证脚本异常:', error);
  process.exit(1);
});
