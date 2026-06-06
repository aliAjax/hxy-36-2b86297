export type ItemType = 'lightstick' | 'banner' | 'sticker' | 'freepack' | 'lottery' | 'other';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed';

export type PurchaseStatus = 'pending' | 'ordered' | 'shipped' | 'completed' | 'cancelled';

export interface Todo {
  id: string;
  activityId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  note: string;
  createdAt: string;
}

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

export interface PreClaimant {
  id: string;
  activityId: string;
  name: string;
  contact: string;
  expectedItems: string;
  note: string;
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

export interface MaterialTemplateItem {
  id: string;
  name: string;
  type: ItemType;
  designUrl: string;
  budget: number;
  supplier: string;
  totalStock: number;
  distributionRule: string;
  note: string;
}

export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  items: MaterialTemplateItem[];
  sourceActivityId: string;
  sourceActivityName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateApplyAdjustments {
  stockMultiplier: number;
  budgetMultiplier: number;
  supplierOverride: string;
  selectedItemIds?: string[];
}

export interface AppData {
  activities: Activity[];
  items: Item[];
  records: ClaimRecord[];
  purchaseItems: PurchaseItem[];
  todos: Todo[];
  preClaimants: PreClaimant[];
  materialTemplates: MaterialTemplate[];
  keyItemIds: string[];
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

export type HealthIssueType =
  | 'orphan_item'
  | 'orphan_record'
  | 'negative_stock'
  | 'stock_mismatch'
  | 'missing_activity_date'
  | 'missing_activity_status';

export interface HealthIssue {
  type: HealthIssueType;
  severity: 'error' | 'warning';
  title: string;
  description: string;
  affectedIds: string[];
  affectedItems?: { id: string; name: string; detail: string }[];
  fixable: boolean;
  fixDescription?: string;
}

export interface HealthCheckResult {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  issues: HealthIssue[];
  checkedAt: string;
}

export interface FixPreview {
  issueType: HealthIssueType;
  title: string;
  affectedCount: number;
  changes: string[];
}

export type ImportMode = 'overwrite' | 'merge';

export interface MergeFieldSummary {
  kept: number;
  added: number;
  renamed: number;
}

export interface MergeResult {
  success: boolean;
  error?: string;
  summary?: {
    activities: MergeFieldSummary;
    items: MergeFieldSummary;
    records: MergeFieldSummary;
    purchaseItems: MergeFieldSummary;
    todos: MergeFieldSummary;
    preClaimants: MergeFieldSummary;
    materialTemplates: MergeFieldSummary;
  };
  idMapping?: {
    activities: Map<string, string>;
    items: Map<string, string>;
    templates: Map<string, string>;
  };
}
