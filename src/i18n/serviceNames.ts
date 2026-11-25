import type { TFunction } from 'i18next';

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
