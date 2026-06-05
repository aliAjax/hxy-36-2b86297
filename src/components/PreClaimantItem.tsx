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

const statusConfig: Record<ClaimStatus, { label: string; icon: React.ElementType; bgColor: string; textColor: string; borderColor: string }> = {
  'not-claimed': { label: '未领取', icon: Clock, bgColor: 'bg-gray-100', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
  'partial-claimed': { label: '部分领取', icon: AlertCircle, bgColor: 'bg-orange-100', textColor: 'text-orange-600', borderColor: 'border-orange-200' },
  'fully-claimed': { label: '已领取', icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600', borderColor: 'border-green-200' },
};

export const PreClaimantItem: React.FC<PreClaimantItemProps> = ({ preClaimant, onEdit, onDelete, claimStatus = 'not-claimed' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = statusConfig[claimStatus];
  const StatusIcon = status.icon;

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl border-2 bg-white transition-all duration-200',
        claimStatus === 'fully-claimed' ? 'border-green-200 hover:border-green-300' :
        claimStatus === 'partial-claimed' ? 'border-orange-200 hover:border-orange-300' :
        'border-pink-100 hover:border-pink-300 hover:shadow-sm'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
          claimStatus === 'fully-claimed' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
          claimStatus === 'partial-claimed' ? 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600' :
          'bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600'
        )}>
          {preClaimant.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-800">{preClaimant.name}</h4>
            <span className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              status.bgColor,
              status.textColor
            )}>
              <StatusIcon size={12} />
              {status.label}
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
