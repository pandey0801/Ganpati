import workersData from '@/data/workers.json';
import { Worker } from '@/types/worker';

export async function getWorkersByService(serviceId: string): Promise<Worker[]> {
  const workers = workersData as Worker[];
  return workers.filter((worker) => worker.serviceId === serviceId);
}

export async function getWorkerById(workerId: string): Promise<Worker | undefined> {
  const workers = workersData as Worker[];
  return workers.find((worker) => worker.id === workerId);
}
