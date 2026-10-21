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
  v_now timestamptz := clock_timestamp();
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
    VALUES (rate_key, v_now, 1)
    ON CONFLICT (subject_key) DO UPDATE
      SET window_started_at = CASE
        WHEN public.worker_request_rate_limits.window_started_at
          <= v_now - make_interval(secs => window_seconds)
        THEN v_now
        ELSE public.worker_request_rate_limits.window_started_at
      END,
      attempts = CASE
        WHEN public.worker_request_rate_limits.window_started_at
          <= v_now - make_interval(secs => window_seconds)
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
    WHERE window_started_at < v_now - interval '2 days';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_worker_request_rate_limit(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_worker_request_rate_limit(text, text)
  TO service_role;
