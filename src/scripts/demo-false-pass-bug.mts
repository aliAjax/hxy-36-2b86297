// Demo to show the fix for "false pass" bug in template independence verification
// Run with: npx tsx src/scripts/demo-false-pass-bug.mts
// or:       npx ts-node --esm src/scripts/demo-false-pass-bug.mts

console.log('\n' + '='.repeat(80));
console.log('🔍 演示：React state 异步更新导致的"假通过"问题');
console.log('='.repeat(80));
console.log();

// Simulate the React state setter behavior (async update)
function mockReactState<T>(initialValue: T): [() => T, (val: T) => void] {
  let value = initialValue;
  return [
    () => value,
    (val: T) => {
      // Simulate async: value is NOT updated immediately!
      setTimeout(() => {
        value = val;
      }, 0);
    },
  ];
}

// ============ BUGGY VERSION (uses React state directly) ============
console.log('📌 【有问题的版本】使用 React state 存储快照，然后直接读取');
console.log('   （模拟旧代码的行为）');
console.log();

function buggyVerification() {
  const [getSnapshot, setSnapshot] = mockReactState<Map<string, string> | null>(null);

  // Step 1: Save snapshot
  console.log('   步骤 1: 保存快照（调用 setSnapshot）');
  const snap = new Map<string, string>();
  snap.set('item1', '灯牌 A');
  snap.set('item2', '手幅 B');
  snap.set('item3', '贴纸 C');
  setSnapshot(snap);
  console.log(`      快照包含 ${snap.size} 项物资`);

  // Step 2: Immediately try to use the snapshot (in the same function)
  console.log();
  console.log('   步骤 2: 在同一个函数中立即读取 snapshot 进行比较');

  const snapshot = getSnapshot(); // This is STILL null!
  console.log(`      当前 snapshot 值: ${snapshot === null ? 'null ❌' : 'Map 对象 ✓'}`);

  // Simulate the comparison logic from the old code
  const mismatches: string[] = [];
  let comparisonCount = 0;

  const currentItems = [
    { id: 'item1', name: '灯牌 A' },
    { id: 'item2', name: '手幅 B' },
    { id: 'item3', name: '贴纸 C' },
  ];

  console.log();
  console.log('   开始比较循环：');
  currentItems.forEach((item) => {
    const snapItem = snapshot?.get(item.id);
    console.log(`      - 检查 ${item.name}:`);
    console.log(`        snapshot.get('${item.id}') = ${snapItem === undefined ? 'undefined' : snapItem}`);

    // OLD CODE: if (!snapItem) return;  <-- This SKIPS the comparison!
    if (!snapItem) {
      console.log(`        ⚠️  命中 if (!snapItem) return; → 跳过该项比较 ❗`);
      return;
    }

    // This code NEVER runs!
    comparisonCount++;
    if (snapItem !== item.name) {
      mismatches.push(`${item.name} 不匹配`);
    }
  });

  console.log();
  console.log('   比较结果：');
  console.log(`      comparisonCount = ${comparisonCount}`);
  console.log(`      mismatches.length = ${mismatches.length}`);
  console.log();

  if (mismatches.length === 0) {
    console.log('   🎉 验证"通过"！');
    console.log('      ⚠️  但这是【假通过】！比较根本没有执行！');
    console.log(`         预期比较 ${currentItems.length} 次，实际执行 ${comparisonCount} 次`);
  }

  return comparisonCount;
}

const buggyComparisonCount = buggyVerification();

console.log();
console.log('─'.repeat(80));
console.log();

// ============ FIXED VERSION (uses local variable) ============
console.log('📌 【修复后的版本】使用局部变量存储快照');
console.log('   （模拟新代码的行为）');
console.log();

function fixedVerification() {
  const [getSnapshot, setSnapshot] = mockReactState<Map<string, string> | null>(null);

  // Step 1: Save snapshot to BOTH local variable AND React state
  console.log('   步骤 1: 保存快照到局部变量 + React state');
  const snap = new Map<string, string>();
  snap.set('item1', '灯牌 A');
  snap.set('item2', '手幅 B');
  snap.set('item3', '贴纸 C');

  let localSnapshot = snap; // LOCAL variable, updated immediately!
  setSnapshot(snap); // React state for UI display
  console.log(`      快照包含 ${snap.size} 项物资`);
  console.log(`      localSnapshot 大小: ${localSnapshot.size} ✓`);

  // Step 2: Use localSnapshot for comparison
  console.log();
  console.log('   步骤 2: 使用 localSnapshot 进行比较');
  console.log(`      当前 localSnapshot 值: Map 对象 (${localSnapshot.size} 项) ✓`);

  const mismatches: string[] = [];
  let comparisonCount = 0;

  const currentItems = [
    { id: 'item1', name: '灯牌 A' },
    { id: 'item2', name: '手幅 B' },
    { id: 'item3', name: '贴纸 C' },
  ];

  console.log();
  console.log('   开始比较循环：');
  currentItems.forEach((item) => {
    const snapItem = localSnapshot.get(item.id);
    console.log(`      - 检查 ${item.name}:`);
    console.log(`        localSnapshot.get('${item.id}') = ${snapItem}`);

    if (!snapItem) {
      console.log(`        ❌ 快照中找不到该项！`);
      mismatches.push(`${item.name}: 快照中找不到`);
      return;
    }

    comparisonCount++;
    if (snapItem !== item.name) {
      mismatches.push(`${item.name} 不匹配`);
      console.log(`        ❌ 不匹配：快照=${snapItem}, 当前=${item.name}`);
    } else {
      console.log(`        ✅ 匹配：${snapItem}`);
    }
  });

  console.log();
  console.log('   比较结果：');
  console.log(`      comparisonCount = ${comparisonCount}`);
  console.log(`      mismatches.length = ${mismatches.length}`);

  // Additional verification: ensure comparisons actually ran
  const expectedComparisons = currentItems.length;
  if (comparisonCount !== expectedComparisons) {
    console.log();
    console.log(`      ❌ 比较执行次数异常！预期 ${expectedComparisons} 次，实际 ${comparisonCount} 次`);
  }

  console.log();

  if (mismatches.length === 0 && comparisonCount === expectedComparisons) {
    console.log('   🎉 验证【真实】通过！');
    console.log(`      ✅ 执行了 ${comparisonCount} 次比较，全部匹配 ✓`);
  }

  return comparisonCount;
}

const fixedComparisonCount = fixedVerification();

console.log();
console.log('='.repeat(80));
console.log('📊 对比总结');
console.log('='.repeat(80));
console.log();
console.log(`   有问题的版本：执行了 ${buggyComparisonCount} 次比较（预期 3 次）`);
console.log(`   修复后的版本：执行了 ${fixedComparisonCount} 次比较（预期 3 次）`);
console.log();
console.log('✨ 修复要点：');
console.log('   1. 使用局部变量保存快照，避免 React state 异步更新问题');
console.log('   2. 增加比较计数验证：预期 N 次比较，实际必须也是 N 次');
console.log('   3. 增加前置检查：快照不能为空、物资数量必须匹配');
console.log();
console.log('='.repeat(80));
