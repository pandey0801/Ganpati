import { supabase } from '@/lib/supabase';
import { Service } from '@/types/service';

export type ServiceSortOrder = 'name' | 'created_at';

export async function getServices(
  sortOrder: ServiceSortOrder = 'name',
): Promise<Service[]> {
  const query = supabase
    .from('services')
    .select('id, name, description, icon, image, category, created_at');
  const orderedQuery = sortOrder === 'created_at'
    ? query
      .order('created_at', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })
    : query.order('name');
  const { data, error } = await orderedQuery.returns<Service[]>();

  if (error) {
    throw error;
  }

  return data;
}
