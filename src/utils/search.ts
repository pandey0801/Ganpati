import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

export function filterServices(services: Service[], query: string) {
  if (!query.trim()) return services;

  const normalized = query.toLowerCase();
  return services.filter((service) =>
    service.name.toLowerCase().includes(normalized) ||
    service.description.toLowerCase().includes(normalized),
  );
}

export function filterWorkers(workers: Worker[], query: string) {
  if (!query.trim()) return workers;

  const normalized = query.toLowerCase();
  return workers.filter((worker) =>
    worker.name.toLowerCase().includes(normalized) ||
    worker.location.toLowerCase().includes(normalized) ||
    worker.description.toLowerCase().includes(normalized),
  );
}
