import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const BUCKET = 'worker-request-images';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeIndianPhone(value: string): string | null {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

async function sha256(value: string | Uint8Array): Promise<string> {
  const input = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const buffer = new ArrayBuffer(input.byteLength);
  new Uint8Array(buffer).set(input);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const forwardedIp = forwardedFor?.split(',').map((value) => value.trim()).filter(Boolean).at(-1);
  return (
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    forwardedIp ||
    null
  );
}

function hasJpegSignature(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
  }

  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ ok: false, error: 'The uploaded photo is too large.' }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid registration form data.' }, 400);
  }

  const userName = getString(form, 'user_name');
  const phone = normalizeIndianPhone(getString(form, 'phone'));
  const alternatePhoneValue = getString(form, 'alternate_phone');
  const alternatePhone = alternatePhoneValue ? normalizeIndianPhone(alternatePhoneValue) : null;
  const serviceId = getString(form, 'service_id');
  const location = getString(form, 'location');
  const description = getString(form, 'description');
  const yearsExperienceValue = getString(form, 'years_experience');
  const submissionToken = getString(form, 'submission_token');
  const photoValue = form.get('photo');

  if (userName.length < 2 || userName.length > 100) {
    return jsonResponse({ ok: false, error: 'Enter a valid full name.' }, 400);
  }
  if (!phone) {
    return jsonResponse({ ok: false, error: 'Enter a valid 10-digit Indian mobile number.' }, 400);
  }
  if (alternatePhoneValue && !alternatePhone) {
    return jsonResponse({ ok: false, error: 'Enter a valid alternate mobile number.' }, 400);
  }
  if (!serviceId || serviceId.length > 128) {
    return jsonResponse({ ok: false, error: 'Choose a valid service category.' }, 400);
  }
  if (location.length < 2 || location.length > 160) {
    return jsonResponse({ ok: false, error: 'Enter a valid service location.' }, 400);
  }
  if (description.length < 10 || description.length > 500) {
    return jsonResponse({ ok: false, error: 'Enter a work description of 10–500 characters.' }, 400);
  }
  if (yearsExperienceValue && !/^(?:[0-9]|[1-5][0-9]|60)$/.test(yearsExperienceValue)) {
    return jsonResponse({ ok: false, error: 'Experience must be a whole number from 0 to 60.' }, 400);
  }
  if (!/^[A-Za-z0-9-]{20,100}$/.test(submissionToken)) {
    return jsonResponse({ ok: false, error: 'Invalid submission token. Please retry.' }, 400);
  }
  if (!(photoValue instanceof File) || photoValue.size === 0 || photoValue.size > MAX_UPLOAD_BYTES) {
    return jsonResponse({ ok: false, error: 'A valid profile photo smaller than 4 MB is required.' }, 400);
  }
  if (photoValue.type !== 'image/jpeg') {
    return jsonResponse({ ok: false, error: 'The profile photo must be a JPEG image.' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Worker registration server is missing Supabase credentials.');
    return jsonResponse({ ok: false, error: 'Registration is temporarily unavailable.' }, 503);
  }

  const clientIp = getClientIp(request);
  if (!clientIp) {
    return jsonResponse({ ok: false, error: 'Registration could not be verified. Please try again.' }, 503);
  }

  const imageBytes = new Uint8Array(await photoValue.arrayBuffer());
  if (!hasJpegSignature(imageBytes)) {
    return jsonResponse({ ok: false, error: 'The profile photo is not a valid JPEG image.' }, 400);
  }
  const photoHash = await sha256(imageBytes);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id')
    .eq('id', serviceId)
    .maybeSingle();

  if (serviceError) {
    console.error('Unable to validate registration service category:', serviceError.message);
    return jsonResponse({ ok: false, error: 'Unable to verify the selected service. Please retry.' }, 503);
  }
  if (!service) {
    return jsonResponse({ ok: false, error: 'Choose a service category from the list.' }, 400);
  }

  const ipHash = await sha256(`${serviceRoleKey}:ip:${clientIp}`);
  const phoneHash = await sha256(`${serviceRoleKey}:phone:${phone}`);
  const { data: allowed, error: rateLimitError } = await supabase.rpc(
    'consume_worker_request_rate_limit',
    { p_ip_hash: ipHash, p_phone_hash: phoneHash },
  );

  if (rateLimitError) {
    console.error('Unable to apply worker registration rate limits:', rateLimitError.message);
    return jsonResponse({ ok: false, error: 'Registration is temporarily unavailable.' }, 503);
  }
  if (!allowed) {
    return jsonResponse(
      { ok: false, error: 'Too many registration attempts. Please try again later.' },
      429,
    );
  }

  const imagePath = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(imagePath, imageBytes, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Unable to upload private worker registration photo:', uploadError.message);
    return jsonResponse({ ok: false, error: 'Unable to upload your photo. Please try again.' }, 502);
  }

  const { data: savedRequest, error: insertError } = await supabase
    .from('worker_requests')
    .upsert(
      {
        user_name: userName,
        service_id: serviceId,
        description,
        phone,
        alternate_phone: alternatePhone,
        years_experience: yearsExperienceValue ? Number(yearsExperienceValue) : null,
        address: location,
        location,
        image: imagePath,
        status: 'pending',
        submission_token: submissionToken,
        photo_sha256: photoHash,
      },
      { onConflict: 'submission_token', ignoreDuplicates: true },
    )
    .select('submission_token')
    .maybeSingle();

  if (insertError) {
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([imagePath]);
    if (cleanupError) {
      console.error('Failed to remove orphaned worker registration photo:', cleanupError.message);
    }
    console.error('Unable to save worker registration request:', insertError.message);
    return jsonResponse({ ok: false, error: 'Unable to save your registration. Please try again.' }, 500);
  }

  if (!savedRequest) {
    const { data: existingRequest, error: lookupError } = await supabase
      .from('worker_requests')
      .select(
        'user_name, service_id, description, phone, alternate_phone, years_experience, address, image, photo_sha256',
      )
      .eq('submission_token', submissionToken)
      .maybeSingle();
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([imagePath]);
    if (cleanupError) {
      console.error('Failed to remove duplicate worker registration photo:', cleanupError.message);
    }

    if (lookupError) {
      console.error('Unable to verify duplicate worker registration:', lookupError.message);
      return jsonResponse({ ok: false, error: 'Unable to confirm your saved registration. Please retry.' }, 503);
    }

    const sameSubmission =
      existingRequest?.user_name === userName &&
      existingRequest.service_id === serviceId &&
      existingRequest.description === description &&
      existingRequest.phone === phone &&
      existingRequest.alternate_phone === alternatePhone &&
      existingRequest.years_experience === (yearsExperienceValue ? Number(yearsExperienceValue) : null) &&
      existingRequest.address === location &&
      existingRequest.photo_sha256 === photoHash;

    if (!sameSubmission) {
      return jsonResponse(
        { ok: false, error: 'This registration attempt was already used for different details. Start a new registration.' },
        409,
      );
    }
  }

  return jsonResponse({ ok: true, duplicate: !savedRequest });
}

Deno.serve(async (request) => {
  try {
    return await handleRequest(request);
  } catch (cause) {
    console.error('Unexpected worker registration function failure:', cause);
    return jsonResponse({ ok: false, error: 'Registration failed unexpectedly. Please try again.' }, 500);
  }
});
