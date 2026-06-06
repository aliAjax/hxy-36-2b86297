import { useState, useMemo } from 'react';
import { PreClaimant, ClaimRecord } from '@/types';
import { getExpectedItemCount } from '@/utils/helpers';
import { ClaimStatus } from '@/components/PreClaimantItem';

interface UsePreClaimantFiltersProps {
  activityPreClaimants: PreClaimant[];
  activityRecords: ClaimRecord[];
}

interface PreClaimantStatusCounts {
  total: number;
  'not-claimed': number;
  'partial-claimed': number;
  'fully-claimed': number;
}

export const usePreClaimantFilters = ({
  activityPreClaimants,
  activityRecords,
}: UsePreClaimantFiltersProps) => {
  const [preClaimantSearchQuery, setPreClaimantSearchQuery] = useState('');
  const [filterPreClaimantStatus, setFilterPreClaimantStatus] = useState<string>('all');

  const preClaimantStatusResult = useMemo(() => {
    const statusMap = new Map<string, ClaimStatus>();
    const counts: PreClaimantStatusCounts = {
      total: activityPreClaimants.length,
      'not-claimed': 0,
      'partial-claimed': 0,
      'fully-claimed': 0,
    };

    activityPreClaimants.forEach((preClaimant) => {
      const claimantRecords = activityRecords.filter(
        (r) => r.claimerName.trim().toLowerCase() === preClaimant.name.trim().toLowerCase()
      );

      let status: ClaimStatus = 'not-claimed';
      if (claimantRecords.length > 0) {
        const expectedCount = getExpectedItemCount(preClaimant.expectedItems);
        if (expectedCount > 0) {
          const claimedCount = new Set(claimantRecords.map((r) => r.itemId)).size;
          status = claimedCount >= expectedCount ? 'fully-claimed' : 'partial-claimed';
        } else {
          status = 'fully-claimed';
        }
      }

      statusMap.set(preClaimant.id, status);
      counts[status]++;
    });

    return { statusMap, counts };
  }, [activityPreClaimants, activityRecords]);

  const preClaimantStatusMap = preClaimantStatusResult.statusMap;
  const preClaimantStatusCounts = preClaimantStatusResult.counts;

  const filteredPreClaimants = useMemo(() => {
    return activityPreClaimants.filter((p) => {
      const q = preClaimantSearchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        p.expectedItems.toLowerCase().includes(q);

      const status = preClaimantStatusMap.get(p.id);
      const matchesStatus = filterPreClaimantStatus === 'all' || filterPreClaimantStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [activityPreClaimants, preClaimantSearchQuery, preClaimantStatusMap, filterPreClaimantStatus]);

  return {
    preClaimantSearchQuery,
    setPreClaimantSearchQuery,
    filterPreClaimantStatus,
    setFilterPreClaimantStatus,
    preClaimantStatusMap,
    preClaimantStatusCounts,
    filteredPreClaimants,
  };
};
