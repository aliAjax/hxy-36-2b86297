import React, { useState } from 'react';
import { Trash2, Phone, MessageSquare, Package, Edit3 } from 'lucide-react';
import { PreClaimant } from '@/types';
import { cn } from '@/utils/helpers';

interface PreClaimantItemProps {
  preClaimant: PreClaimant;
  onEdit: () => void;
  onDelete: () => void;
}

export const PreClaimantItem: React.FC<PreClaimantItemProps> = ({ preClaimant, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative p-4 rounded-xl border-2 bg-white border-pink-100 hover:border-pink-300 hover:shadow-sm transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold text-sm">
          {preClaimant.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 mb-2">{preClaimant.name}</h4>

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
