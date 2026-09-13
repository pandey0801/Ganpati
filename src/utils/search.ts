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

export function filterWorkers(workers: Worker[], query: string) {
  if (!query.trim()) return workers;

  const normalized = query.toLowerCase();
  return workers.filter((worker) =>
    worker.name.toLowerCase().includes(normalized) ||
    worker.location.toLowerCase().includes(normalized) ||
    worker.description.toLowerCase().includes(normalized),
  );
}
