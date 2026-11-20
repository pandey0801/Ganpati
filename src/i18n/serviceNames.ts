import type { TFunction } from 'i18next';

const serviceNameKeys: Record<string, string> = {
  'ac-repair': 'serviceNames.acRepair',
  electrical: 'serviceNames.electrician',
  electrician: 'serviceNames.electrician',
  plumbing: 'serviceNames.plumber',
  plumber: 'serviceNames.plumber',
  painter: 'serviceNames.painter',
  painting: 'serviceNames.painter',
  cctv: 'serviceNames.cctv',
  carpenter: 'serviceNames.carpenter',
  driver: 'serviceNames.driver',
  cleaning: 'serviceNames.cleaning',
  'home-appliance': 'serviceNames.homeAppliance',
  'home-appliances': 'serviceNames.homeAppliance',
  gardening: 'serviceNames.gardening',
  gardener: 'serviceNames.gardening',
  'beauty-salon': 'serviceNames.beautySalon',
  'construction-worker': 'serviceNames.constructionWorker',
  cook: 'serviceNames.cook',
  'tiles-worker': 'serviceNames.tilesWorker',
  compounder: 'serviceNames.compounder',
  'baby-sitter': 'serviceNames.babySitter',
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
  const normalizedId = serviceId.trim().toLowerCase().replace(/[\s_]+/g, '-');
  const key = serviceNameKeys[normalizedId];
  return key ? t(key, { defaultValue: originalName }) : originalName;
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
