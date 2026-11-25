import { serviceTranslations } from '@/constants/serviceTranslations';

export interface LocalizableService {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export type LocalizedService<T extends LocalizableService> = Omit<
  T,
  'name' | 'description' | 'category'
> & {
  name: string;
  description?: string;
  category?: string;
};

export function localizeService<T extends LocalizableService>(
  service: T,
  language: string,
): LocalizedService<T> {
  if (language.split('-')[0].toLowerCase() !== 'hi') {
    return service;
  }

  const translation = serviceTranslations[service.id];
  if (!translation) {
    return service;
  }

  return {
    ...service,
    name: translation.name || service.name,
    description: translation.description || service.description,
    category: translation.category || service.category,
  };
}
