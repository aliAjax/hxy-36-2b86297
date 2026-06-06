import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import type { Activity, Item } from '@/types';

describe('useAppStore - 领取与库存回归测试', () => {
  beforeEach(() => {
    const s = useAppStore.getState();
    s.clearAllData();
    localStorage.clear();
  });

  const getState = () => useAppStore.getState();

  const setupTestData = (): {
    activity: Activity;
    item: Item;
  } => {
    const s0 = getState();
    s0.addActivity({
      name: '测试活动',
      description: '测试活动描述',
      date: '2025-01-01',
      coverUrl: '',
      status: 'ongoing',
    });

    const s1 = getState();
    const activity = s1.activities[0];

    s1.addItem({
      activityId: activity.id,
      name: '测试物资',
      type: 'lightstick',
      designUrl: '',
      budget: 100,
      supplier: '测试供应商',
      totalStock: 10,
      currentStock: 10,
      distributionRule: '',
      note: '',
    });

    const s2 = getState();
    const item = s2.items[0];

    return { activity, item };
  };

  describe('addRecord - 单次领取', () => {
    it('单次领取成功后库存应正确扣减', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;
      const claimQuantity = 3;

      const result = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13800138000',
        quantity: claimQuantity,
        note: '',
      });

      expect(result.success).toBe(true);
      expect(result.isDuplicate).toBe(false);
      expect(result.record).toBeDefined();

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - claimQuantity);

      expect(getState().records.length).toBe(1);
      expect(getState().records[0].claimerName).toBe('测试用户');
      expect(getState().records[0].quantity).toBe(claimQuantity);
    });

    it('库存不足时领取应失败', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const result = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13800138000',
        quantity: initialStock + 1,
        note: '',
      });

      expect(result.success).toBe(false);
      expect(result.isDuplicate).toBe(false);
      expect(result.record).toBeUndefined();

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock);

      expect(getState().records.length).toBe(0);
    });

    it('重复领取在未强制时应拦截', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;
      const claimQuantity = 2;

      const firstResult = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13800138000',
        quantity: claimQuantity,
        note: '',
      });
      expect(firstResult.success).toBe(true);

      const secondResult = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13900139000',
        quantity: claimQuantity,
        note: '',
      });

      expect(secondResult.success).toBe(false);
      expect(secondResult.isDuplicate).toBe(true);
      expect(secondResult.record).toBeUndefined();

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - claimQuantity);

      expect(getState().records.length).toBe(1);
    });

    it('重复领取在强制模式下应成功并标记重复警告', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;
      const claimQuantity = 2;

      const firstResult = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13800138000',
        quantity: claimQuantity,
        note: '',
      });
      expect(firstResult.success).toBe(true);

      const secondResult = getState().addRecord(
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '测试用户',
          contact: '13900139000',
          quantity: claimQuantity,
          note: '',
        },
        true
      );

      expect(secondResult.success).toBe(true);
      expect(secondResult.isDuplicate).toBe(true);
      expect(secondResult.record).toBeDefined();
      expect(secondResult.record!.isDuplicateWarning).toBe(true);

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - claimQuantity * 2);

      expect(getState().records.length).toBe(2);
    });

    it('领取人姓名大小写和前后空格不影响重复判断', () => {
      const { activity, item } = setupTestData();

      getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: ' 测试用户 ',
        contact: '13800138000',
        quantity: 1,
        note: '',
      });

      const result = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13900139000',
        quantity: 1,
        note: '',
      });

      expect(result.success).toBe(false);
      expect(result.isDuplicate).toBe(true);
    });
  });

  describe('addRecordsBatch - 批量领取', () => {
    it('批量领取全部成功时库存正确扣减', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const result = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户A',
          contact: '13800000001',
          quantity: 2,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户B',
          contact: '13800000002',
          quantity: 3,
          note: '',
        },
      ]);

      expect(result.successCount).toBe(2);
      expect(result.failCount).toBe(0);
      expect(result.results.length).toBe(2);
      expect(result.results.every((r) => r.success)).toBe(true);

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - 2 - 3);

      expect(getState().records.length).toBe(2);
    });

    it('同一批次内重复领取应被正确拦截', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const result = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '重复用户',
          contact: '13800000001',
          quantity: 2,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '重复用户',
          contact: '13800000002',
          quantity: 3,
          note: '',
        },
      ]);

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);

      expect(result.results[0].success).toBe(true);
      expect(result.results[0].isDuplicate).toBe(false);

      expect(result.results[1].success).toBe(false);
      expect(result.results[1].isDuplicate).toBe(true);
      expect(result.results[1].error).toBe('本批次内重复领取');

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - 2);

      expect(getState().records.length).toBe(1);
    });

    it('历史重复领取应被正确拦截', () => {
      const { activity, item } = setupTestData();

      getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '历史用户',
        contact: '13800000000',
        quantity: 1,
        note: '',
      });
      expect(getState().records.length).toBe(1);

      const stockAfterFirst = getState().items.find((i) => i.id === item.id)!.currentStock;

      const batchResult = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '历史用户',
          contact: '13800000001',
          quantity: 2,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '新用户',
          contact: '13800000002',
          quantity: 3,
          note: '',
        },
      ]);

      expect(batchResult.successCount).toBe(1);
      expect(batchResult.failCount).toBe(1);

      expect(batchResult.results[0].success).toBe(false);
      expect(batchResult.results[0].isDuplicate).toBe(true);
      expect(batchResult.results[0].error).toBe('重复领取');

      expect(batchResult.results[1].success).toBe(true);
      expect(batchResult.results[1].isDuplicate).toBe(false);

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(stockAfterFirst - 3);

      expect(getState().records.length).toBe(2);
    });

    it('批量领取时库存不足应正确返回错误', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const result = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户A',
          contact: '13800000001',
          quantity: 6,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户B',
          contact: '13800000002',
          quantity: 5,
          note: '',
        },
      ]);

      expect(result.successCount).toBe(1);
      expect(result.failCount).toBe(1);

      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].isDuplicate).toBe(false);
      expect(result.results[1].error).toContain('库存不足');

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - 6);

      expect(getState().records.length).toBe(1);
    });

    it('强制模式下批量重复领取应成功并标记警告', () => {
      const { activity, item } = setupTestData();

      getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '历史用户',
        contact: '13800000000',
        quantity: 1,
        note: '',
      });

      const result = getState().addRecordsBatch(
        [
          {
            activityId: activity.id,
            itemId: item.id,
            claimerName: '历史用户',
            contact: '13800000001',
            quantity: 1,
            note: '',
          },
          {
            activityId: activity.id,
            itemId: item.id,
            claimerName: '批次重复',
            contact: '13800000002',
            quantity: 1,
            note: '',
          },
          {
            activityId: activity.id,
            itemId: item.id,
            claimerName: '批次重复',
            contact: '13800000003',
            quantity: 1,
            note: '',
          },
        ],
        true
      );

      expect(result.successCount).toBe(3);
      expect(result.failCount).toBe(0);

      expect(result.results[0].isDuplicate).toBe(true);
      expect(result.results[0].record?.isDuplicateWarning).toBe(true);

      expect(result.results[1].isDuplicate).toBe(false);
      expect(result.results[2].isDuplicate).toBe(true);
      expect(result.results[2].record?.isDuplicateWarning).toBe(true);

      expect(getState().records.length).toBe(4);
    });

    it('批量结果的索引应与输入顺序对应', () => {
      const { activity, item } = setupTestData();

      const result = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户1',
          contact: '1',
          quantity: 1,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: 'nonexistent',
          claimerName: '用户2',
          contact: '2',
          quantity: 1,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户3',
          contact: '3',
          quantity: 1,
          note: '',
        },
      ]);

      expect(result.results[0].index).toBe(0);
      expect(result.results[0].success).toBe(true);

      expect(result.results[1].index).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe('找不到该物资');

      expect(result.results[2].index).toBe(2);
      expect(result.results[2].success).toBe(true);
    });
  });

  describe('deleteRecord - 删除领取记录', () => {
    it('删除领取记录后库存应正确加回', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;
      const claimQuantity = 4;

      const addResult = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '测试用户',
        contact: '13800138000',
        quantity: claimQuantity,
        note: '',
      });

      expect(addResult.success).toBe(true);
      const recordId = addResult.record!.id;

      const itemAfterClaim = getState().items.find((i) => i.id === item.id)!;
      expect(itemAfterClaim.currentStock).toBe(initialStock - claimQuantity);

      getState().deleteRecord(recordId);

      const itemAfterDelete = getState().items.find((i) => i.id === item.id)!;
      expect(itemAfterDelete.currentStock).toBe(initialStock);

      expect(getState().records.length).toBe(0);
    });

    it('删除不存在的记录不会报错也不会影响库存', () => {
      const { item } = setupTestData();
      const initialStock = item.currentStock;

      getState().deleteRecord('nonexistent-id');

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock);
    });

    it('批量领取后删除其中一条记录，库存只加回对应数量', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const batchResult = getState().addRecordsBatch([
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户A',
          contact: '13800000001',
          quantity: 2,
          note: '',
        },
        {
          activityId: activity.id,
          itemId: item.id,
          claimerName: '用户B',
          contact: '13800000002',
          quantity: 3,
          note: '',
        },
      ]);

      expect(batchResult.successCount).toBe(2);
      const recordToDelete = batchResult.results[0].record!;

      getState().deleteRecord(recordToDelete.id);

      const updatedItem = getState().items.find((i) => i.id === item.id)!;
      expect(updatedItem.currentStock).toBe(initialStock - 3);

      expect(getState().records.length).toBe(1);
      expect(getState().records[0].id).toBe(batchResult.results[1].record!.id);
    });
  });

  describe('综合场景', () => {
    it('完整流程：领取 -> 库存不足 -> 删除记录 -> 再次领取成功', () => {
      const { activity, item } = setupTestData();
      const initialStock = item.currentStock;

      const firstClaim = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '用户A',
        contact: '1',
        quantity: 7,
        note: '',
      });
      expect(firstClaim.success).toBe(true);

      const failClaim = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '用户B',
        contact: '2',
        quantity: 5,
        note: '',
      });
      expect(failClaim.success).toBe(false);

      getState().deleteRecord(firstClaim.record!.id);

      const itemAfterDelete = getState().items.find((i) => i.id === item.id)!;
      expect(itemAfterDelete.currentStock).toBe(initialStock);

      const successClaim = getState().addRecord({
        activityId: activity.id,
        itemId: item.id,
        claimerName: '用户B',
        contact: '2',
        quantity: 5,
        note: '',
      });
      expect(successClaim.success).toBe(true);

      const finalItem = getState().items.find((i) => i.id === item.id)!;
      expect(finalItem.currentStock).toBe(initialStock - 5);

      expect(getState().records.length).toBe(1);
      expect(getState().records[0].claimerName).toBe('用户B');
    });
  });
});
