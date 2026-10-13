import { useCallback, useEffect, useState } from 'react';

import { getWorkerById, getWorkers, getWorkersByService } from '@/services/workerService';
import { Worker } from '@/types/worker';

interface WorkerFilters {
  workerId?: string;
  serviceId?: string;
}

interface UseWorkersResult {
  workers: Worker[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useWorkers(filters: WorkerFilters = {}): UseWorkersResult {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState(0);

  const retry = useCallback(() => {
    setRequestId((currentRequestId) => currentRequestId + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadWorkers = async () => {
      setIsLoading(true);
      setError(null);
      setWorkers([]);

      try {
        const fetchedWorkers = filters.workerId
          ? await getWorkerById(filters.workerId).then((worker) => worker ? [worker] : [])
          : filters.serviceId
            ? await getWorkersByService(filters.serviceId)
            : await getWorkers();

        if (isActive) {
          setWorkers(fetchedWorkers);
        }
      } catch (cause) {
        if (__DEV__) {
          console.error('Failed to load workers from Supabase:', cause);
        }

        if (isActive) {
          setError(
            cause instanceof Error
              ? cause
              : new Error('An unexpected error occurred while loading workers.'),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkers();

    return () => {
      isActive = false;
    };
  }, [filters.serviceId, filters.workerId, requestId]);

  return { workers, isLoading, error, retry };
}
