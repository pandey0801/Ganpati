export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  image: string;
  category?: string;
  created_at?: string | null;
}
