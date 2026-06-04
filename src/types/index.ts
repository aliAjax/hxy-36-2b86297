export type ItemType = 'lightstick' | 'banner' | 'sticker' | 'freepack' | 'lottery' | 'other';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed';

export type PurchaseStatus = 'pending' | 'ordered' | 'shipped' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  coverUrl: string;
  status: ActivityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  activityId: string;
  name: string;
  type: ItemType;
  designUrl: string;
  budget: number;
  supplier: string;
  totalStock: number;
  currentStock: number;
  distributionRule: string;
  note: string;
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  activityId: string;
  itemId: string;
  claimerName: string;
  contact: string;
  quantity: number;
  note: string;
  isDuplicateWarning: boolean;
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  activityId: string;
  name: string;
  type: ItemType;
  expectedQuantity: number;
  budget: number;
  supplier: string;
  status: PurchaseStatus;
  note: string;
  createdAt: string;
}

export interface AppData {
  activities: Activity[];
  items: Item[];
  records: ClaimRecord[];
  purchaseItems: PurchaseItem[];
}

export interface ActivityStats {
  totalItems: number;
  totalStock: number;
  distributedStock: number;
  remainingStock: number;
  totalBudget: number;
  totalClaims: number;
  uniqueClaimers: number;
}

export interface ConsumptionData {
  date: string;
  quantity: number;
}

export interface TypeDistributionData {
  type: ItemType;
  name: string;
  value: number;
  color: string;
}

export const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; icon: string; color: string }> = {
  lightstick: { label: '灯牌', icon: 'Lightbulb', color: '#FFB6C1' },
  banner: { label: '手幅', icon: 'Flag', color: '#E6E6FA' },
  sticker: { label: '贴纸', icon: 'Sticker', color: '#98FB98' },
  freepack: { label: '无料包', icon: 'Gift', color: '#FFDAB9' },
  lottery: { label: '抽选礼物', icon: 'Sparkles', color: '#87CEEB' },
  other: { label: '其他', icon: 'Package', color: '#D3D3D3' },
};

export const ACTIVITY_STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string }> = {
  upcoming: { label: '即将开始', color: '#87CEEB' },
  ongoing: { label: '进行中', color: '#98FB98' },
  completed: { label: '已结束', color: '#D3D3D3' },
};

export const PURCHASE_STATUS_CONFIG: Record<PurchaseStatus, { label: string; color: string }> = {
  pending: { label: '待采购', color: '#FFB6C1' },
  ordered: { label: '已下单', color: '#87CEEB' },
  shipped: { label: '已发货', color: '#DDA0DD' },
  completed: { label: '已完成', color: '#98FB98' },
  cancelled: { label: '已取消', color: '#D3D3D3' },
};
