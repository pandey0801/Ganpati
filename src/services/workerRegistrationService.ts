import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export interface NativeRegistrationPhoto {
  uri: string;
  name: string;
  type: string;
}

type ReactNativeFormData = FormData & {
  append(name: string, value: NativeRegistrationPhoto): void;
};

export interface WorkerRegistrationSubmission {
  userName: string;
  phone: string;
  alternatePhone?: string;
  serviceId: string;
  location: string;
  description: string;
  yearsExperience?: number;
  submissionToken: string;
  photo: Blob | NativeRegistrationPhoto;
}

interface WorkerRegistrationResponse {
  ok: boolean;
  duplicate?: boolean;
  error?: string;
}

interface WorkerRegistrationErrorBody {
  error?: string;
  message?: string;
  code?: string;
  format?: 'json' | 'non-json';
  length?: number;
}

interface WorkerRegistrationErrorDetails {
  kind: 'network' | 'response' | 'other';
  name: string;
  message: string;
  stage: string;
  status?: number;
  responseBody?: WorkerRegistrationErrorBody;
  responseBodyReadError?: { name: string; message: string };
  networkException?: { name: string; message: string };
}

export class WorkerRegistrationSubmissionError extends Error {
  readonly kind: WorkerRegistrationErrorDetails['kind'];
  readonly stage: string;
  readonly status?: number;
  readonly responseBody?: WorkerRegistrationErrorBody;
  readonly responseBodyReadError?: WorkerRegistrationErrorDetails['responseBodyReadError'];
  readonly networkException?: WorkerRegistrationErrorDetails['networkException'];

  constructor(details: WorkerRegistrationErrorDetails) {
    super(details.message);
    this.name = details.name;
    this.kind = details.kind;
    this.stage = details.stage;
    this.status = details.status;
    this.responseBody = details.responseBody;
    this.responseBodyReadError = details.responseBodyReadError;
    this.networkException = details.networkException;
  }
}

function sanitizeDiagnosticText(value: string): string {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted email]')
    .replace(/\+?91[\s.-]?[6-9]\d{4}[\s.-]?\d{5}|\b[6-9]\d{9}\b/g, '[redacted phone]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[redacted token]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\b(sb_(?:publishable|secret)_)[A-Za-z0-9_-]+/g, '[redacted key]')
    .replace(
      /\b(apikey|api[_-]?key|authorization|service[_-]?role[_-]?key)\b\s*[:=]\s*[^\s,;]+/gi,
      '$1=[redacted]',
    )
    .slice(0, 500);
}

function getErrorDetails(cause: unknown): { name: string; message: string } {
  if (cause instanceof Error) {
    return { name: cause.name, message: cause.message };
  }

  if (cause && typeof cause === 'object') {
    const error = cause as { name?: unknown; message?: unknown };
    return {
      name: typeof error.name === 'string' ? error.name : 'UnknownError',
      message: typeof error.message === 'string' ? error.message : 'Unknown error',
    };
  }

  return { name: 'UnknownError', message: String(cause) };
}

function getErrorResponse(cause: unknown): Response | undefined {
  if (
    (cause instanceof FunctionsHttpError || cause instanceof FunctionsRelayError) &&
    cause.context instanceof Response
  ) {
    return cause.context;
  }
  return undefined;
}

function getSafeResponseBody(value: unknown): WorkerRegistrationErrorBody | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const body = value as Record<string, unknown>;
  const safeBody: WorkerRegistrationErrorBody = {};
  for (const key of ['error', 'message', 'code'] as const) {
    if (typeof body[key] === 'string') {
      safeBody[key] = sanitizeDiagnosticText(body[key] as string);
    }
  }
  return safeBody;
}

async function readSafeResponseBody(response: Response): Promise<{
  body?: WorkerRegistrationErrorBody;
  readError?: { name: string; message: string };
}> {
  let text: string;
  try {
    text = await response.clone().text();
  } catch (cause) {
    return {
      body: { format: 'non-json' },
      readError: getErrorDetails(cause),
    };
  }

  if (!text) {
    return {};
  }

  try {
    const body: unknown = JSON.parse(text);
    return {
      body: getSafeResponseBody(body) ?? { format: 'json', length: text.length },
    };
  } catch {
    return { body: { format: 'non-json', length: text.length } };
  }
}

function logStage(stage: string, details?: Record<string, unknown>): void {
  if (__DEV__) {
    console.info(`[worker-registration] ${stage}`, details ?? {});
  }
}

function logFailure(error: WorkerRegistrationSubmissionError): void {
  if (__DEV__) {
    console.error('[worker-registration] Submission failed', {
      stage: error.stage,
      name: error.name,
      message: sanitizeDiagnosticText(error.message),
      status: error.status,
      responseBody: error.responseBody,
      responseBodyReadError: error.responseBodyReadError
        ? {
            name: error.responseBodyReadError.name,
            message: sanitizeDiagnosticText(error.responseBodyReadError.message),
          }
        : undefined,
      networkException: error.networkException
        ? {
            name: error.networkException.name,
            message: sanitizeDiagnosticText(error.networkException.message),
          }
        : undefined,
    });
  }
}

async function createSubmissionError(
  cause: unknown,
  stage: string,
  responseFallback?: Response,
): Promise<WorkerRegistrationSubmissionError> {
  const original = getErrorDetails(cause);
  const response = getErrorResponse(cause) ?? responseFallback;
  const networkException =
    cause instanceof FunctionsFetchError ? getErrorDetails(cause.context) : undefined;
  const responseDetails = response ? await readSafeResponseBody(response) : undefined;

  return new WorkerRegistrationSubmissionError({
    kind:
      cause instanceof FunctionsFetchError
        ? 'network'
        : response
          ? 'response'
          : 'other',
    name: original.name,
    message: original.message,
    stage,
    status: response?.status,
    responseBody: responseDetails?.body,
    responseBodyReadError: responseDetails?.readError,
    networkException,
  });
}

function createNetworkSubmissionError(
  cause: unknown,
  stage: string,
): WorkerRegistrationSubmissionError {
  const networkException = getErrorDetails(cause);
  return new WorkerRegistrationSubmissionError({
    kind: 'network',
    name: networkException.name,
    message: networkException.message,
    stage,
    networkException,
  });
}

function createResponseSubmissionError(
  response: Response,
  stage: string,
  responseDetails: Awaited<ReturnType<typeof readSafeResponseBody>>,
  message: string,
): WorkerRegistrationSubmissionError {
  return new WorkerRegistrationSubmissionError({
    kind: 'response',
    name: 'WorkerRegistrationHttpError',
    message,
    stage,
    status: response.status,
    responseBody: responseDetails.body,
    responseBodyReadError: responseDetails.readError,
  });
}

export async function submitWorkerRegistration(
  submission: WorkerRegistrationSubmission,
): Promise<void> {
  let stage = 'Preparing request';

  try {
    logStage(stage);
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

    stage = 'Appending native photo';
    if ('uri' in submission.photo) {
      logStage(stage, { type: submission.photo.type });
      (formData as ReactNativeFormData).append('photo', submission.photo);
    } else {
      stage = 'Appending web photo';
      logStage(stage, { type: submission.photo.type });
      formData.append('photo', submission.photo, 'profile.jpg');
    }

    let data: WorkerRegistrationResponse | null;
    let responseStatus: number | undefined;
    if ('uri' in submission.photo) {
      stage = 'Calling worker-registration';
      const useReactNativeFetch =
        process.env.EXPO_PUBLIC_USE_RN_FETCH === '1' ||
        process.env.EXPO_PUBLIC_USE_RN_FETCH === 'true';
      if (!useReactNativeFetch) {
        throw new WorkerRegistrationSubmissionError({
          kind: 'other',
          name: 'NativeFetchConfigurationError',
          message: 'Native file uploads require React Native fetch.',
          stage,
        });
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !publishableKey) {
        throw new WorkerRegistrationSubmissionError({
          kind: 'other',
          name: 'SupabaseConfigurationError',
          message: 'The registration service is not configured.',
          stage,
        });
      }

      logStage(stage);
      let response: Response;
      try {
        response = await fetch(
          `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/worker-registration`,
          {
            method: 'POST',
            headers: { apikey: publishableKey },
            body: formData,
          },
        );
      } catch (cause) {
        throw createNetworkSubmissionError(cause, stage);
      }

      stage = 'Received response';
      responseStatus = response.status;
      logStage(stage, { status: response.status });
      stage = 'Parsing response';
      logStage(stage);
      const responseDetails = await readSafeResponseBody(response);

      try {
        data = (await response.clone().json()) as WorkerRegistrationResponse;
      } catch (cause) {
        throw createResponseSubmissionError(
          response,
          stage,
          responseDetails,
          getErrorDetails(cause).message,
        );
      }

      if (!response.ok) {
        throw createResponseSubmissionError(
          response,
          stage,
          responseDetails,
          responseDetails.body?.error ?? `Worker registration failed with status ${response.status}.`,
        );
      }
    } else {
      stage = 'Calling worker-registration';
      logStage(stage);
      const { data: responseData, error, response } =
        await supabase.functions.invoke<WorkerRegistrationResponse>(
          'worker-registration',
          { body: formData },
        );

      stage = 'Received response';
      responseStatus = response?.status;
      logStage(stage, { status: response?.status });
      stage = 'Parsing response';
      logStage(stage);

      if (error) {
        throw await createSubmissionError(error, stage, response);
      }
      data = responseData;
    }

    if (!data?.ok) {
      throw new WorkerRegistrationSubmissionError({
        kind: 'response',
        name: 'WorkerRegistrationResponseError',
        message: data?.error ?? 'The registration service returned an invalid response.',
        stage,
        status: responseStatus,
        responseBody: getSafeResponseBody(data),
      });
    }

    logStage('Registration completed');
  } catch (cause) {
    const error =
      cause instanceof WorkerRegistrationSubmissionError
        ? cause
        : await createSubmissionError(cause, stage);
    logFailure(error);
    throw error;
  }
}
