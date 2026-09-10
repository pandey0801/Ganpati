import { useMemo } from 'react';

import workersData from '@/data/workers.json';
import { Worker } from '@/types/worker';

export function useWorkers(serviceId?: string) {
  return useMemo(() => {
    const workers = workersData as Worker[];

    if (!serviceId) {
      return workers;
    }

    return workers.filter((worker) => worker.serviceId === serviceId);
  }, [serviceId]);
}
