-- Approve 분당기분팀 (SNUBH01) as doctor — step 2: update profiles table
UPDATE public.profiles
SET role = 'doctor'
WHERE email = 'snubh-team@doctor.local'
  AND role = 'doctor_pending';
