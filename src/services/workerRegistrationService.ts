import { supabase } from '@/lib/supabase';

export interface WorkerRegistrationSubmission {
  userName: string;
  phone: string;
  alternatePhone?: string;
  serviceId: string;
  location: string;
  description: string;
  yearsExperience?: number;
  submissionToken: string;
  photo: Blob;
}

interface WorkerRegistrationResponse {
  ok: boolean;
  duplicate?: boolean;
  error?: string;
}

export async function submitWorkerRegistration(
  submission: WorkerRegistrationSubmission,
): Promise<void> {
  const formData = new FormData();
  formData.append('user_name', submission.userName);
  formData.append('phone', submission.phone);
  formData.append('alternate_phone', submission.alternatePhone ?? '');
  formData.append('service_id', submission.serviceId);
  formData.append('location', submission.location);
  formData.append('description', submission.description);
  formData.append(
    'years_experience',
    submission.yearsExperience === undefined ? '' : String(submission.yearsExperience),
  );
  formData.append('submission_token', submission.submissionToken);
  formData.append('photo', submission.photo, 'profile.jpg');

  const { data, error } = await supabase.functions.invoke<WorkerRegistrationResponse>(
    'worker-registration',
    { body: formData },
  );

  if (error) {
    let responseMessage: string | undefined;
    if (error.context instanceof Response) {
      const body = (await error.context.clone().json().catch(() => null)) as
        | { error?: unknown }
        | null;
      if (typeof body?.error === 'string') {
        responseMessage = body.error;
      }
    }
    throw new Error(
      responseMessage ?? 'Unable to submit your registration. Check your connection and try again.',
    );
  }

  if (!data?.ok) {
    throw new Error(data?.error ?? 'Unable to submit your registration. Please try again.');
  }
}
