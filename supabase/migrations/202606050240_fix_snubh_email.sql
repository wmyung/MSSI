-- Fix snubhteam's email to match login form logic ({username}@doctor.local)
UPDATE auth.users
SET email = 'snubhteam@doctor.local',
    raw_user_meta_data = raw_user_meta_data || '{"email": "snubhteam@doctor.local"}'::jsonb
WHERE id = 'a8b10efc-4ff1-4288-86c8-6bfcf9531f68';

UPDATE auth.identities
SET identity_data = identity_data || '{"email": "snubhteam@doctor.local"}'::jsonb
WHERE user_id = 'a8b10efc-4ff1-4288-86c8-6bfcf9531f68';

UPDATE public.profiles
SET email = 'snubhteam@doctor.local'
WHERE id = 'a8b10efc-4ff1-4288-86c8-6bfcf9531f68';
