import React, { useState } from 'react';
import { Trash2, Phone, MessageSquare, Package, Edit3, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PreClaimant } from '@/types';
import { cn } from '@/utils/helpers';

export type ClaimStatus = 'not-claimed' | 'partial-claimed' | 'fully-claimed';

interface PreClaimantItemProps {
  preClaimant: PreClaimant;
  onEdit: () => void;
  onDelete: () => void;
  claimStatus?: ClaimStatus;
}

interface StatusStyleConfig {
  label: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  border: string;
  borderHover: string;
  avatarFrom: string;
  avatarTo: string;
  avatarText: string;
}

const STATUS_CONFIG: Record<ClaimStatus, StatusStyleConfig> = {
  'not-claimed': {
    label: '未领取',
    icon: Clock,
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-600',
    border: 'border-pink-100',
    borderHover: 'hover:border-pink-300',
    avatarFrom: 'from-pink-100',
    avatarTo: 'to-purple-100',
    avatarText: 'text-pink-600',
  },
  'partial-claimed': {
    label: '部分领取',
    icon: AlertCircle,
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-600',
    border: 'border-orange-200',
    borderHover: 'hover:border-orange-300',
    avatarFrom: 'from-orange-100',
    avatarTo: 'to-amber-100',
    avatarText: 'text-orange-600',
  },
  'fully-claimed': {
    label: '已领取',
    icon: CheckCircle,
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-600',
    border: 'border-green-200',
    borderHover: 'hover:border-green-300',
    avatarFrom: 'from-green-100',
    avatarTo: 'to-emerald-100',
    avatarText: 'text-green-600',
  },
};

export const PreClaimantItem: React.FC<PreClaimantItemProps> = ({
  preClaimant,
  onEdit,
  onDelete,
  claimStatus = 'not-claimed',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const style = STATUS_CONFIG[claimStatus];
  const StatusIcon = style.icon;

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl border-2 bg-white transition-all duration-200',
        style.border,
        style.borderHover,
        claimStatus === 'not-claimed' && 'hover:shadow-sm'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-sm',
            style.avatarFrom,
            style.avatarTo,
            style.avatarText
          )}
        >
          {preClaimant.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-800">{preClaimant.name}</h4>
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                style.badgeBg,
                style.badgeText
              )}
            >
              <StatusIcon size={12} />
              {style.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {preClaimant.contact && (
              <div className="flex items-center gap-1 text-gray-500">
                <Phone size={14} />
                <span className="line-clamp-1">{preClaimant.contact}</span>
              </div>
            )}

            {preClaimant.expectedItems && (
              <div className="flex items-center gap-1 text-pink-500">
                <Package size={14} />
                <span className="line-clamp-1">{preClaimant.expectedItems}</span>
              </div>
            )}

            {preClaimant.note && (
              <div className="flex items-center gap-1 text-gray-400">
                <MessageSquare size={14} />
                <span className="line-clamp-1">{preClaimant.note}</span>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
