import type { TFunction } from 'i18next';

const serviceNameKeys: Record<string, string> = {
  'ac-repair': 'serviceNames.acRepair',
  electrical: 'serviceNames.electrician',
  plumbing: 'serviceNames.plumber',
  painter: 'serviceNames.painter',
  painting: 'serviceNames.painter',
  cctv: 'serviceNames.cctv',
  carpenter: 'serviceNames.carpenter',
  driver: 'serviceNames.driver',
  cleaning: 'serviceNames.cleaning',
  'home-appliance': 'serviceNames.homeAppliance',
  gardening: 'serviceNames.gardening',
  'beauty-salon': 'serviceNames.beautySalon',
  'construction-worker': 'serviceNames.constructionWorker',
};

const serviceCategoryKeys: Record<string, string> = {
  'home maintenance': 'serviceCategories.homeMaintenance',
  housekeeping: 'serviceCategories.housekeeping',
  'outdoor care': 'serviceCategories.outdoorCare',
  'home improvement': 'serviceCategories.homeImprovement',
  'security services': 'serviceCategories.securityServices',
  transportation: 'serviceCategories.transportation',
  'home appliances': 'serviceCategories.homeAppliances',
  'personal care': 'serviceCategories.personalCare',
  construction: 'serviceCategories.construction',
};

export function translateServiceName(
  serviceId: string,
  originalName: string,
  t: TFunction,
): string {
  const key = serviceNameKeys[serviceId];
  return key ? t(key) : originalName;
}

export function translateServiceCategory(
  originalCategory: string | undefined,
  t: TFunction,
): string | undefined {
  if (!originalCategory) {
    return undefined;
  }

  const category = originalCategory.trim();
  const key = serviceCategoryKeys[category.toLowerCase()];
  return key ? t(key) : category;
}

export function translateAvailability(value: string, t: TFunction): string {
  const normalized = value.trim().toLowerCase();
  const knownValues: Record<string, string> = {
    available: 'availability.available',
    busy: 'availability.busy',
    unavailable: 'availability.unavailable',
    'not available': 'availability.notAvailable',
  };
  const key = knownValues[normalized];
  return key ? t(key) : value;
}
