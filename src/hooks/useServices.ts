import { useCallback, useEffect, useState } from 'react';

import { getServices } from '@/services/serviceService';
import { Service } from '@/types/service';

interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState(0);

  const retry = useCallback(() => {
    setRequestId((currentRequestId) => currentRequestId + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedServices = await getServices();
        if (isActive) {
          setServices(fetchedServices);
        }
      } catch (cause) {
        if (isActive) {
          setError(
            cause instanceof Error
              ? cause
              : new Error('An unexpected error occurred while loading services.'),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadServices();

    return () => {
      isActive = false;
    };
  }, [requestId]);

  return { services, isLoading, error, retry };
}
