# Worker registration backend

The app has no user authentication, so it does not insert into `worker_requests`
or upload photos with the public Supabase key. It sends a multipart request to
the `worker-registration` Edge Function. The function validates the submission,
rate-limits IP addresses and phone numbers, uploads one JPEG to the private
`worker-request-images` bucket, then saves a `pending` row. It never inserts
into `public.worker`.

The project database schema and deployed RLS/Storage policies could not be
queried from this workspace. Before deploying to production, inspect the
project's current `public.services`, `public.worker_requests`, and
`storage.objects` policies in the Supabase Dashboard. The migration reuses
`worker_requests` when present, creates it only when absent, matches the
existing `services.id` type, and aborts if it detects an incompatible status,
required columns it cannot populate, or a trigger that inserts into
`public.worker`.

## Deploy

1. Back up the database and apply `migrations/20261014000000_worker_registration.sql`
   to a staging project first. Review any migration error against the actual
   existing `worker_requests` schema; do not remove a failed schema check just
   to force deployment.
2. Verify that `worker_requests` has a `pending` status, that the
   `worker-request-images` bucket is private and accepts JPEGs up to 4 MiB, and
   that anonymous/authenticated roles have no access to requests or objects in
   that bucket. The migration revokes direct request-table privileges and adds
   a restrictive Storage policy for clients. It does not alter
   `worker-images`, `public.worker`, or their policies.
3. Deploy from the repository root:

   ```powershell
   supabase link --project-ref <your-project-ref>
   supabase db push
   supabase functions deploy worker-registration --project-ref <your-project-ref>
   ```

   `config.toml` disables JWT verification only for this public registration
   endpoint because the app has no login. The function uses the Supabase
   Edge Function runtime's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   secrets; never add the service-role key to the app or an `EXPO_PUBLIC_`
   variable. The app calls the function with the existing publishable key.
   The rate-limit function uses a local `v_now` timestamp; the follow-up
   migration `20261016000000_worker_request_rate_limit_clock.sql` updates
   projects where the earlier migration was already applied.
4. Confirm that the function is deployed, its rate-limit RPC succeeds, and a
   request/photo cannot be read by an anonymous client before releasing the
   app. If the migration fails, the registration endpoint must not be exposed.

The database limiter permits at most 5 submissions per IP per hour and 3 per
phone number per day, with a 1,000-request global hourly cap. These limits are
server-side and are not a replacement for monitoring or stronger anti-abuse
controls if traffic warrants them.

Development builds log submission stages, HTTP status, and the Edge Function's
structured error response when a submission fails. Personal form fields, local
photo URIs, photo contents, and authorization credentials are not logged.

## End-to-end test

1. In a staging app build, open Home and tap **Register as a Worker**.
2. Try an empty form, invalid mobile numbers, missing category, and missing
   photo; verify field-specific errors prevent submission.
3. Choose a service loaded from `public.services`, provide valid details, and
   select/capture a photo. Confirm it is cropped/compressed and previewed.
4. Submit once. Confirm the success message appears only after the function
   returns success and one `pending` request appears in `worker_requests`.
5. Check the stored `image` value is an object path in
   `worker-request-images`, not a public URL. Verify anonymous object download
   and direct `worker_requests` reads/inserts are denied.
6. Confirm the request did not create a row in `public.worker` and does not
   appear in Home, Services, Search, or worker-detail results.
7. Test denied gallery/camera permissions, cancellation, network/offline
   failure, a duplicate tap, retry with the same submission, oversized photos,
   invalid service IDs, rate-limit responses, and a forced database insert
   failure. Confirm an uploaded object is removed after an insert failure.
