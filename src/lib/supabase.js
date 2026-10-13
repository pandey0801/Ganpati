// // import { createClient } from '@supabase/supabase-js';

// // const supabaseUrl = 'YOUR_SUPABASE_URL';
// // const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// // export const supabase = createClient(
// //   supabaseUrl,
// //   supabaseAnonKey
// // );



// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Supabase environment variables are missing.');
// }

// export const supabase = createClient(supabaseUrl, supabaseKey);



import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('Supabase URL loaded:', Boolean(supabaseUrl));
console.log('Supabase key loaded:', Boolean(supabaseKey));

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase URL or publishable key is missing from .env'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export default supabase;
