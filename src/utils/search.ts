import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

const normalizeCategory = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categoryAliases: Record<string, string[]> = {
  'ac-repair': ['ac-repair', 'ac repair', 'air-conditioner', 'air conditioner', 'ac'],
  electrical: ['electrical', 'electrician', 'electric'],
  plumbing: ['plumbing', 'plumber', 'pipe', 'water'],
  painting: ['painting', 'painter', 'paint'],
  cleaning: ['cleaning', 'cleaner'],
  gardening: ['gardening', 'gardener', 'plant-care', 'plant care'],
  'home-appliance': ['home-appliance', 'home appliance', 'appliance'],
  'beauty-salon': ['beauty-salon', 'beauty and salon', 'beauty', 'salon'],
  cctv: ['cctv', 'camera', 'security'],
  carpenter: ['carpenter', 'woodwork', 'furniture'],
  driver: ['driver', 'transport'],
};

export function filterServices(services: Service[], query: string, category?: string) {
  let filteredServices = services;

  if (category) {
    const normalizedCategory = normalizeCategory(category);
    const aliases = categoryAliases[normalizedCategory] || [normalizedCategory];

    filteredServices = services.filter((service) => {
      const serviceTerms = [service.name, service.category || '', service.id];
      return serviceTerms.some((term) => {
        const normalizedTerm = normalizeCategory(term);
        return aliases.some((alias) => {
          const normalizedAlias = normalizeCategory(alias);
          return normalizedTerm === normalizedAlias || normalizedTerm.includes(normalizedAlias);
        });
      });
    });
  }

  if (!query.trim()) return filteredServices;

  const normalized = query.toLowerCase();
  return filteredServices.filter((service) =>
    service.name.toLowerCase().includes(normalized) ||
    (service.description || '').toLowerCase().includes(normalized) ||
    (service.category || '').toLowerCase().includes(normalized),
  );
}

export function filterWorkers(
  workers: Worker[],
  query: string,
  filters: { serviceId?: string; category?: string; availability?: string } = {},
) {
  let filteredWorkers = workers;

  if (filters.serviceId) {
    filteredWorkers = filteredWorkers.filter(
      (worker) => worker.serviceId === filters.serviceId,
    );
  }

  if (filters.category) {
    const category = normalizeCategory(filters.category);
    const aliases = categoryAliases[category] ?? [category];
    filteredWorkers = filteredWorkers.filter((worker) =>
      [worker.serviceId, worker.service?.name ?? '', worker.service?.category ?? '']
        .some((term) => {
          const normalizedTerm = normalizeCategory(term);
          return aliases.some((alias) => {
            const normalizedAlias = normalizeCategory(alias);
            return (
              normalizedTerm === normalizedAlias ||
              normalizedTerm.includes(normalizedAlias) ||
              normalizedAlias.includes(normalizedTerm)
            );
          });
        }),
    );
  }

  if (filters.availability) {
    const availability = normalizeCategory(filters.availability);
    filteredWorkers = filteredWorkers.filter(
      (worker) => normalizeCategory(worker.availability) === availability,
    );
  }

  if (!query.trim()) return filteredWorkers;

  const normalized = query.toLowerCase();
  return filteredWorkers.filter((worker) =>
    worker.name.toLowerCase().includes(normalized) ||
    worker.location.toLowerCase().includes(normalized) ||
    worker.description.toLowerCase().includes(normalized) ||
    worker.serviceId.toLowerCase().includes(normalized) ||
    (worker.service?.name ?? '').toLowerCase().includes(normalized) ||
    (worker.service?.category ?? '').toLowerCase().includes(normalized),
  );
}
