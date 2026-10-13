import { Service } from '@/types/service';

export type WorkerAvailability = string;

export type WorkerService = Pick<Service, 'id' | 'name' | 'category' | 'icon' | 'image'>;

export interface Worker {
  id: string;
  name: string;
  serviceId: string;
  phone: string;
  location: string;
  image: string;
  description: string;
  availability: WorkerAvailability;
  rating?: number;
  service?: WorkerService;
}
