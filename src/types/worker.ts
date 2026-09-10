export type WorkerAvailability = 'Available' | 'Busy' | 'Unavailable';

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
}
