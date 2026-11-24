import {
  ADS_STORAGE_BUCKET,
  ALL_AD_LOCATION_VALUES,
  DEFAULT_AD_LOCATION,
} from '@/constants/advertisements';
import { supabase } from '@/lib/supabase';
import { Advertisement } from '@/types/advertisement';

interface AdvertisementRecord {
  id: string;
  title: string;
  description: string;
  image_path: string | null;
  click_url: string | null;
  ad_type: string;
  target_location: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  priority: number;
}

function isTargetedToLocation(targetLocation: string | null, location: string): boolean {
  if (!targetLocation) {
    return false;
  }

  const normalizedTarget = targetLocation.trim().toLocaleLowerCase();
  return (
    normalizedTarget === location.trim().toLocaleLowerCase() ||
    ALL_AD_LOCATION_VALUES.some((locationValue) => locationValue === normalizedTarget)
  );
}

function getDateTimestamp(value: string, isEndDate: boolean): number | null {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  if (isEndDate && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return timestamp + 86_400_000 - 1;
  }

  return timestamp;
}

function isWithinSchedule(record: AdvertisementRecord, now: number): boolean {
  if (record.start_date) {
    const start = getDateTimestamp(record.start_date, false);
    if (start === null || start > now) {
      return false;
    }
  }

  if (record.end_date) {
    const end = getDateTimestamp(record.end_date, true);
    if (end === null || end < now) {
      return false;
    }
  }

  return true;
}

function getPublicImageUrl(imagePath: string | null, advertisementId: string): string | null {
  const path = imagePath?.trim();
  if (!path) {
    if (__DEV__) {
      console.warn('[ads] Skipping advertisement without an image path', { advertisementId });
    }
    return null;
  }

  try {
    const { data } = supabase.storage.from(ADS_STORAGE_BUCKET).getPublicUrl(path);
    const url = new URL(data.publicUrl);
    return url.protocol === 'https:' && url.hostname ? url.href : null;
  } catch {
    if (__DEV__) {
      console.warn('[ads] Skipping advertisement with an invalid image URL', { advertisementId });
    }
    return null;
  }
}

export async function getAdvertisements(
  location: string = DEFAULT_AD_LOCATION,
): Promise<Advertisement[]> {
  const { data, error } = await supabase
    .from('ads')
    .select(
      'id, title, description, image_path, click_url, ad_type, target_location, is_active, start_date, end_date, priority',
    )
    .eq('is_active', true)
    .eq('ad_type', 'banner')
    .order('priority', { ascending: true })
    .returns<AdvertisementRecord[]>();

  if (error) {
    throw error;
  }

  const now = Date.now();
  return data
    .filter(
      (record) =>
        isTargetedToLocation(record.target_location, location) && isWithinSchedule(record, now),
    )
    .flatMap((record) => {
      const imageUrl = getPublicImageUrl(record.image_path, record.id);
      if (!imageUrl) {
        return [];
      }

      return [{
        id: record.id,
        title: record.title,
        description: record.description,
        imageUrl,
        clickUrl: record.click_url,
      }];
    });
}
