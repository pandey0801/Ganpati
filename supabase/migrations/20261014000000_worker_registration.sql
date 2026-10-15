DO $$
DECLARE
  service_id_type text;
  status_type text;
  has_pending_enum boolean;
  unmapped_required_columns text;
  id_type text;
  id_default text;
  id_identity text;
  status_check text;
BEGIN
  SELECT format_type(attribute.atttypid, attribute.atttypmod)
  INTO service_id_type
  FROM pg_attribute AS attribute
  JOIN pg_class AS table_class ON table_class.oid = attribute.attrelid
  JOIN pg_namespace AS table_schema ON table_schema.oid = table_class.relnamespace
  WHERE table_schema.nspname = 'public'
    AND table_class.relname = 'services'
    AND attribute.attname = 'id'
    AND attribute.attnum > 0
    AND NOT attribute.attisdropped;

  IF service_id_type IS NULL THEN
    RAISE EXCEPTION 'Expected public.services.id; worker registration needs the existing services table.';
  END IF;

  IF to_regclass('public.worker_requests') IS NULL THEN
    EXECUTE format(
      'CREATE TABLE public.worker_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_name text NOT NULL,
        service_id %s NOT NULL REFERENCES public.services(id),
        description text NOT NULL,
        phone text NOT NULL,
        alternate_phone text,
        years_experience integer,
        address text NOT NULL,
        location text NOT NULL,
        image text NOT NULL,
        status text NOT NULL DEFAULT ''pending'',
        submission_token text,
        photo_sha256 text,
        created_at timestamptz NOT NULL DEFAULT now()
      )',
      service_id_type
    );
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'worker_requests'
        AND column_name = 'service_id'
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.worker_requests ADD COLUMN service_id %s REFERENCES public.services(id)',
        service_id_type
      );
    END IF;

    ALTER TABLE public.worker_requests
      ADD COLUMN IF NOT EXISTS user_name text,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS alternate_phone text,
      ADD COLUMN IF NOT EXISTS years_experience integer,
      ADD COLUMN IF NOT EXISTS address text,
      ADD COLUMN IF NOT EXISTS location text,
      ADD COLUMN IF NOT EXISTS image text,
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS submission_token text,
      ADD COLUMN IF NOT EXISTS photo_sha256 text,
      ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
  END IF;

  SELECT data_type, column_default, is_identity
  INTO id_type, id_default, id_identity
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'worker_requests'
    AND column_name = 'id';

  IF id_type IS NULL THEN
    ALTER TABLE public.worker_requests
      ADD COLUMN id uuid DEFAULT gen_random_uuid() NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS worker_requests_id_uidx
      ON public.worker_requests (id);
  ELSIF id_default IS NULL AND id_identity = 'NO' THEN
    IF id_type = 'uuid' THEN
      ALTER TABLE public.worker_requests
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ELSE
      RAISE EXCEPTION 'public.worker_requests.id has no generated value. Add a safe default before applying this migration.';
    END IF;
  END IF;

  SELECT data_type
  INTO status_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'worker_requests'
    AND column_name = 'status';

  IF status_type NOT IN ('text', 'character varying', 'character') THEN
    SELECT EXISTS (
      SELECT 1
      FROM pg_attribute AS attribute
      JOIN pg_class AS table_class ON table_class.oid = attribute.attrelid
      JOIN pg_namespace AS table_schema ON table_schema.oid = table_class.relnamespace
      JOIN pg_type AS column_type ON column_type.oid = attribute.atttypid
      JOIN pg_enum AS enum_value ON enum_value.enumtypid = column_type.oid
      WHERE table_schema.nspname = 'public'
        AND table_class.relname = 'worker_requests'
        AND attribute.attname = 'status'
        AND enum_value.enumlabel = 'pending'
    )
    INTO has_pending_enum;

    IF NOT COALESCE(has_pending_enum, false) THEN
      RAISE EXCEPTION 'public.worker_requests.status cannot represent pending. Update its existing status convention before applying this migration.';
    END IF;
  END IF;

  FOR status_check IN
    SELECT pg_get_constraintdef(constraint_row.oid)
    FROM pg_constraint AS constraint_row
    WHERE constraint_row.conrelid = 'public.worker_requests'::regclass
      AND constraint_row.contype = 'c'
      AND pg_get_constraintdef(constraint_row.oid) ILIKE '%status%'
  LOOP
    IF status_check NOT ILIKE '%pending%' THEN
      RAISE EXCEPTION 'A worker_requests status constraint does not permit pending: %', status_check;
    END IF;
  END LOOP;

  ALTER TABLE public.worker_requests
    ALTER COLUMN status SET DEFAULT 'pending';

  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO unmapped_required_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'worker_requests'
    AND is_nullable = 'NO'
    AND column_default IS NULL
    AND is_identity = 'NO'
    AND is_generated = 'NEVER'
    AND column_name NOT IN (
      'id',
      'user_name',
      'service_id',
      'description',
      'phone',
      'alternate_phone',
      'years_experience',
      'address',
      'location',
      'image',
      'status',
      'submission_token',
      'photo_sha256',
      'created_at'
    );

  IF unmapped_required_columns IS NOT NULL THEN
    RAISE EXCEPTION 'worker_requests has required columns the registration endpoint does not populate: %', unmapped_required_columns;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger AS trigger_row
    JOIN pg_class AS table_class ON table_class.oid = trigger_row.tgrelid
    JOIN pg_namespace AS table_schema ON table_schema.oid = table_class.relnamespace
    JOIN pg_proc AS trigger_function ON trigger_function.oid = trigger_row.tgfoid
    WHERE table_schema.nspname = 'public'
      AND table_class.relname = 'worker_requests'
      AND NOT trigger_row.tgisinternal
      AND trigger_function.prosrc ~* 'insert[[:space:]]+into[[:space:]]+(public[.])?worker([[:space:]]|[(])'
  ) THEN
    RAISE EXCEPTION 'A worker_requests trigger appears to publish requests into public.worker; remove or change it before enabling registration.';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS worker_requests_submission_token_uidx
  ON public.worker_requests (submission_token);

ALTER TABLE public.worker_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.worker_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.worker_requests TO service_role;

DO $$
DECLARE
  request_sequence text;
BEGIN
  request_sequence := pg_get_serial_sequence('public.worker_requests', 'id');
  IF request_sequence IS NOT NULL THEN
    EXECUTE format(
      'REVOKE ALL ON SEQUENCE %s FROM PUBLIC, anon, authenticated',
      request_sequence
    );
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role', request_sequence);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.worker_request_rate_limits (
  subject_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL
);

REVOKE ALL ON TABLE public.worker_request_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.worker_request_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_worker_request_rate_limit(
  p_ip_hash text,
  p_phone_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_time timestamptz := clock_timestamp();
  rate_key text;
  max_attempts integer;
  window_seconds integer;
  current_attempts integer;
BEGIN
  IF p_ip_hash !~ '^[0-9a-f]{64}$' OR p_phone_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;

  FOR rate_key, max_attempts, window_seconds IN
    SELECT *
    FROM (VALUES
      ('global', 1000, 3600),
      ('ip:' || p_ip_hash, 5, 3600),
      ('phone:' || p_phone_hash, 3, 86400)
    ) AS limits(subject_key, attempt_limit, period_seconds)
  LOOP
    INSERT INTO public.worker_request_rate_limits (
      subject_key,
      window_started_at,
      attempts
    )
    VALUES (rate_key, current_time, 1)
    ON CONFLICT (subject_key) DO UPDATE
      SET window_started_at = CASE
        WHEN public.worker_request_rate_limits.window_started_at
          <= current_time - make_interval(secs => window_seconds)
        THEN current_time
        ELSE public.worker_request_rate_limits.window_started_at
      END,
      attempts = CASE
        WHEN public.worker_request_rate_limits.window_started_at
          <= current_time - make_interval(secs => window_seconds)
        THEN 1
        ELSE public.worker_request_rate_limits.attempts + 1
      END
    RETURNING attempts INTO current_attempts;

    IF current_attempts > max_attempts THEN
      RETURN false;
    END IF;
  END LOOP;

  IF random() < 0.02 THEN
    DELETE FROM public.worker_request_rate_limits
    WHERE window_started_at < current_time - interval '2 days';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_worker_request_rate_limit(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_worker_request_rate_limit(text, text)
  TO service_role;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'worker-request-images',
  'worker-request-images',
  false,
  4194304,
  ARRAY['image/jpeg']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS worker_request_images_block_client_access ON storage.objects;
-- CREATE POLICY worker_request_images_block_client_access
--   ON storage.objects
--   AS RESTRICTIVE
--   FOR ALL
--   TO anon, authenticated
--   USING (bucket_id <> 'worker-request-images')
--   WITH CHECK (bucket_id <> 'worker-request-images');
