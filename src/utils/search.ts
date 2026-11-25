import { Service } from '@/types/service';
import { Worker } from '@/types/worker';

const normalizeCategory = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[\s_-]+/g, ' ')
    .trim();

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

function getCategoryAliases(category: string): string[] {
  const normalizedCategory = normalizeCategory(category);
  const match = Object.entries(categoryAliases).find(
    ([alias]) => normalizeCategory(alias) === normalizedCategory,
  );
  return match?.[1] ?? [category];
}

function matchesCategory(terms: Array<string | undefined>, category: string): boolean {
  const aliases = getCategoryAliases(category).map(normalizeCategory);
  return terms.some((term) => {
    if (!term) {
      return false;
    }

    const normalizedTerm = normalizeCategory(term);
    return aliases.some(
      (alias) =>
        normalizedTerm === alias ||
        normalizedTerm.includes(alias) ||
        alias.includes(normalizedTerm),
    );
  });
}

type LocalizedServiceFields = {
  name: string;
  description?: string;
  category?: string;
};

export function filterServices(
  services: Service[],
  query: string,
  category?: string,
  getLocalizedService?: (service: Service) => LocalizedServiceFields,
) {
  let filteredServices = services;

  if (category) {
    filteredServices = services.filter((service) => {
      const localized = getLocalizedService?.(service);
      return matchesCategory(
        [service.name, service.category, service.id, localized?.name, localized?.category],
        category,
      );
    });
  }

  if (!query.trim()) return filteredServices;

  const normalized = query.toLocaleLowerCase();
  return filteredServices.filter((service) => {
    const localized = getLocalizedService?.(service);
    return [
      service.id,
      service.name,
      service.description,
      service.category,
      localized?.name,
      localized?.description,
      localized?.category,
    ].some((term) => term?.toLocaleLowerCase().includes(normalized));
  });
}

export function filterWorkers(
  workers: Worker[],
  query: string,
  filters: { serviceId?: string; category?: string; availability?: string } = {},
  getLocalizedService?: (
    worker: Worker,
  ) => Pick<LocalizedServiceFields, 'name' | 'category'> | undefined,
) {
  let filteredWorkers = workers;

  if (filters.serviceId) {
    filteredWorkers = filteredWorkers.filter(
      (worker) => worker.serviceId === filters.serviceId,
    );
  }

  if (filters.category) {
    filteredWorkers = filteredWorkers.filter((worker) => {
      const localized = getLocalizedService?.(worker);
      return matchesCategory(
        [
          worker.serviceId,
          worker.service?.name,
          worker.service?.category,
          localized?.name,
          localized?.category,
        ],
        filters.category!,
      );
    });
  }

  if (filters.availability) {
    const availability = normalizeCategory(filters.availability);
    filteredWorkers = filteredWorkers.filter(
      (worker) => normalizeCategory(worker.availability) === availability,
    );
  }

  if (!query.trim()) return filteredWorkers;

  const normalized = query.toLocaleLowerCase();
  return filteredWorkers.filter((worker) => {
    const localized = getLocalizedService?.(worker);
    return [
      worker.name,
      worker.location,
      worker.description,
      worker.serviceId,
      worker.service?.name,
      worker.service?.category,
      localized?.name,
      localized?.category,
    ].some((term) => term?.toLocaleLowerCase().includes(normalized));
  });
}
