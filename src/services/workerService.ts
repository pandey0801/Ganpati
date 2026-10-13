import { supabase } from '@/lib/supabase';
import { Worker, WorkerService } from '@/types/worker';

interface WorkerRecord {
  id: string;
  name: string;
  service_id: string;
  phone: string;
  location: string;
  image: string | null;
  description: string;
  availability: string;
  rating: number | null;
  services: WorkerService | WorkerService[] | null;
}

const workerSelection = `
  *,
  services (
    id,
    name,
    category,
    icon,
    image
  )
`;

interface WorkerFilters {
  id?: string;
  serviceId?: string;
}

function mapWorker(record: WorkerRecord): Worker {
  const relatedService = Array.isArray(record.services)
    ? record.services[0]
    : record.services;

  return {
    id: record.id,
    name: record.name,
    serviceId: record.service_id,
    phone: record.phone,
    location: record.location,
    image: record.image ?? '',
    description: record.description,
    availability: record.availability,
    rating: record.rating ?? undefined,
    service: relatedService ?? undefined,
  };
}

async function fetchWorkers(filters: WorkerFilters = {}): Promise<Worker[]> {
  let query = supabase
    .from('worker')
    .select(workerSelection)
    .order('name');

  if (filters.id) {
    query = query.eq('id', filters.id);
  }

  if (filters.serviceId) {
    query = query.eq('service_id', filters.serviceId);
  }

  const { data, error } = await query.returns<WorkerRecord[]>();

  if (error) {
    throw error;
  }

  return data.map(mapWorker);
}

export function getWorkers(): Promise<Worker[]> {
  return fetchWorkers();
}

export async function getWorkerById(workerId: string): Promise<Worker | undefined> {
  const workers = await fetchWorkers({ id: workerId });
  return workers[0];
}

export function getWorkersByService(serviceId: string): Promise<Worker[]> {
  return fetchWorkers({ serviceId });
}
