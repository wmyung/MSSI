-- MSSI production hardening fixes
-- Run in Supabase Dashboard → SQL Editor.
-- Purpose:
-- 1) make optional patient_number safe for repeated blank values
-- 2) reject patient signup with invalid/unapproved hospital_code at DB trigger level
-- 3) normalize empty strings to NULL in profiles

BEGIN;

-- patient_number is optional. Remove any accidental UNIQUE constraint from production.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%patient_number%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.profiles ALTER COLUMN patient_number DROP NOT NULL;
UPDATE public.profiles SET patient_number = NULL WHERE patient_number = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta JSONB := NEW.raw_user_meta_data;
  v_role TEXT;
  v_hospital_code TEXT;
  v_patient_number TEXT;
BEGIN
  v_role := COALESCE(NULLIF(meta->>'role', ''), 'patient');
  v_hospital_code := NULLIF(meta->>'hospital_code', '');
  v_patient_number := NULLIF(meta->>'patient_number', '');

  IF v_role = 'patient' THEN
    IF v_hospital_code IS NULL THEN
      RAISE EXCEPTION '병원코드가 필요합니다.';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE hospital_code = v_hospital_code
        AND role = 'doctor'
    ) THEN
      RAISE EXCEPTION '존재하지 않거나 미승인된 병원코드입니다.';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, username, role,
    doctor_name, hospital_name, hospital_code,
    dob, patient_number,
    full_name
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(meta->>'username', ''), SPLIT_PART(NEW.email, '@', 1)),
    v_role,
    NULLIF(meta->>'doctor_name', ''),
    NULLIF(meta->>'hospital_name', ''),
    v_hospital_code,
    NULLIF(meta->>'dob', ''),
    v_patient_number,
    COALESCE(NULLIF(meta->>'doctor_name', ''), NULLIF(meta->>'username', ''), SPLIT_PART(NEW.email, '@', 1))
  );

  RETURN NEW;
END;
$$;

COMMIT;
