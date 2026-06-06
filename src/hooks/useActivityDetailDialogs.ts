import { useState, useCallback } from 'react';
import { Item, PurchaseItem, Todo, PreClaimant } from '@/types';

export interface ActivityDetailDialogState {
  isItemFormOpen: boolean;
  isClaimFormOpen: boolean;
  isPurchaseFormOpen: boolean;
  isTodoFormOpen: boolean;
  isPreClaimantFormOpen: boolean;
  isBatchClaimFormOpen: boolean;
  isSaveAsTemplateOpen: boolean;
  isApplyTemplateOpen: boolean;
  isReportConfigOpen: boolean;

  editingItem: Item | null;
  editingPurchaseItem: PurchaseItem | null;
  editingTodo: Todo | null;
  editingPreClaimant: PreClaimant | null;

  deleteItemConfirm: string | null;
  deleteRecordConfirm: string | null;
  deletePurchaseConfirm: string | null;
  deleteTodoConfirm: string | null;
  deletePreClaimantConfirm: string | null;

  convertPurchaseItem: PurchaseItem | null;

  selectedReportModules: string[];
  reportLowStockThreshold: number;
}

const initialReportModules = [
  'consumption',
  'budget',
  'claimers',
  'duplicates',
  'purchase',
  'todos',
  'lowStock',
];

export const useActivityDetailDialogs = () => {
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
  const [isPreClaimantFormOpen, setIsPreClaimantFormOpen] = useState(false);
  const [isBatchClaimFormOpen, setIsBatchClaimFormOpen] = useState(false);
  const [isSaveAsTemplateOpen, setIsSaveAsTemplateOpen] = useState(false);
  const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false);
  const [isReportConfigOpen, setIsReportConfigOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingPreClaimant, setEditingPreClaimant] = useState<PreClaimant | null>(null);

  const [deleteItemConfirm, setDeleteItemConfirm] = useState<string | null>(null);
  const [deleteRecordConfirm, setDeleteRecordConfirm] = useState<string | null>(null);
  const [deletePurchaseConfirm, setDeletePurchaseConfirm] = useState<string | null>(null);
  const [deleteTodoConfirm, setDeleteTodoConfirm] = useState<string | null>(null);
  const [deletePreClaimantConfirm, setDeletePreClaimantConfirm] = useState<string | null>(null);

  const [convertPurchaseItem, setConvertPurchaseItem] = useState<PurchaseItem | null>(null);

  const [selectedReportModules, setSelectedReportModules] = useState<string[]>(initialReportModules);
  const [reportLowStockThreshold, setReportLowStockThreshold] = useState(5);

  const openItemForm = useCallback((item?: Item) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem(null);
    }
    setIsItemFormOpen(true);
  }, []);

  const closeItemForm = useCallback(() => {
    setIsItemFormOpen(false);
    setEditingItem(null);
  }, []);

  const openPurchaseForm = useCallback((purchaseItem?: PurchaseItem) => {
    if (purchaseItem) {
      setEditingPurchaseItem(purchaseItem);
    } else {
      setEditingPurchaseItem(null);
    }
    setIsPurchaseFormOpen(true);
  }, []);

  const closePurchaseForm = useCallback(() => {
    setIsPurchaseFormOpen(false);
    setEditingPurchaseItem(null);
  }, []);

  const openTodoForm = useCallback((todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
    } else {
      setEditingTodo(null);
    }
    setIsTodoFormOpen(true);
  }, []);

  const closeTodoForm = useCallback(() => {
    setIsTodoFormOpen(false);
    setEditingTodo(null);
  }, []);

  const openPreClaimantForm = useCallback((preClaimant?: PreClaimant) => {
    if (preClaimant) {
      setEditingPreClaimant(preClaimant);
    } else {
      setEditingPreClaimant(null);
    }
    setIsPreClaimantFormOpen(true);
  }, []);

  const closePreClaimantForm = useCallback(() => {
    setIsPreClaimantFormOpen(false);
    setEditingPreClaimant(null);
  }, []);

  const openReportConfig = useCallback(() => {
    setIsReportConfigOpen(true);
  }, []);

  const closeReportConfig = useCallback(() => {
    setIsReportConfigOpen(false);
  }, []);

  const setReportConfigFromParams = useCallback((modules: string[], threshold: number) => {
    setSelectedReportModules(modules);
    setReportLowStockThreshold(threshold);
  }, []);

  return {
    isItemFormOpen,
    setIsItemFormOpen,
    isClaimFormOpen,
    setIsClaimFormOpen,
    isPurchaseFormOpen,
    setIsPurchaseFormOpen,
    isTodoFormOpen,
    setIsTodoFormOpen,
    isPreClaimantFormOpen,
    setIsPreClaimantFormOpen,
    isBatchClaimFormOpen,
    setIsBatchClaimFormOpen,
    isSaveAsTemplateOpen,
    setIsSaveAsTemplateOpen,
    isApplyTemplateOpen,
    setIsApplyTemplateOpen,
    isReportConfigOpen,
    setIsReportConfigOpen,

    editingItem,
    setEditingItem,
    editingPurchaseItem,
    setEditingPurchaseItem,
    editingTodo,
    setEditingTodo,
    editingPreClaimant,
    setEditingPreClaimant,

    deleteItemConfirm,
    setDeleteItemConfirm,
    deleteRecordConfirm,
    setDeleteRecordConfirm,
    deletePurchaseConfirm,
    setDeletePurchaseConfirm,
    deleteTodoConfirm,
    setDeleteTodoConfirm,
    deletePreClaimantConfirm,
    setDeletePreClaimantConfirm,

    convertPurchaseItem,
    setConvertPurchaseItem,

    selectedReportModules,
    setSelectedReportModules,
    reportLowStockThreshold,
    setReportLowStockThreshold,

    openItemForm,
    closeItemForm,
    openPurchaseForm,
    closePurchaseForm,
    openTodoForm,
    closeTodoForm,
    openPreClaimantForm,
    closePreClaimantForm,
    openReportConfig,
    closeReportConfig,
    setReportConfigFromParams,
  };
};
