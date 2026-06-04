-- =========================================================
-- P0 Security Fixes v2: Fixed FORCE RLS regression
-- =========================================================
BEGIN;

-- =========================================================
-- FIX 1: handle_new_user — reject admin/unknown roles at DB level
-- =========================================================
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

  -- 🔒 P0: Downgrade any attempt to set admin role via registration
  IF v_role = 'admin' THEN
    v_role := 'patient';
  END IF;

  -- 🔒 P0: Downgrade doctor registration to doctor_pending (admin approval required)
  IF v_role = 'doctor' THEN
    v_role := 'doctor_pending';
  END IF;

  -- Validate hospital_code for patients
  IF v_role = 'patient' THEN
    IF v_hospital_code IS NULL THEN
      RAISE EXCEPTION '병원코드가 필요합니다.';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE hospital_code = v_hospital_code
        AND role IN ('doctor', 'admin')
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

-- =========================================================
-- FIX 1a: Ensure handle_new_user trigger exists
-- =========================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- FIX 2: REVERT FORCE RLS — breaks Supabase SECURITY DEFINER helper pattern
-- Supabase recommended approach: keep helper functions as SECURITY DEFINER
-- FORCE RLS would cause infinite recursion in RLS policies that reference profiles
-- =========================================================
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses NO FORCE ROW LEVEL SECURITY;

-- =========================================================
-- FIX 3: Tighten profiles_insert_anyone WITH CHECK
-- Users can only insert their own profile with safe roles
-- =========================================================
DROP POLICY IF EXISTS "profiles_insert_anyone" ON public.profiles;
CREATE POLICY "profiles_insert_anyone" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Must be inserting own profile
    auth.uid() = id
    -- Role must be patient or doctor_pending (never admin or doctor directly)
    AND role IN ('patient', 'doctor_pending')
  );

-- =========================================================
-- FIX 4: Consolidate profiles SELECT policies
-- Use SECURITY DEFINER helpers to avoid RLS recursion
-- =========================================================
-- Clean up old policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_doctor_hospital" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_unified" ON public.profiles;

-- Single unified SELECT policy using SECURITY DEFINER helpers
CREATE POLICY "profiles_select_unified" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR
    public.get_user_role() IN ('doctor'::text, 'admin'::text)
    AND (
      public.get_user_role() = 'admin'::text
      OR profiles.hospital_code = public.get_user_hospital_code()
    )
  );

-- =========================================================
-- FIX 5: Consolidate survey_responses SELECT policies
-- =========================================================
DROP POLICY IF EXISTS "survey_select_own" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_select_doctor" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_responses_self_access" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_select_unified" ON public.survey_responses;

CREATE POLICY "survey_select_unified" ON public.survey_responses
  FOR SELECT USING (
    auth.uid() = patient_id
    OR
    (
      public.get_user_role() IN ('doctor'::text, 'admin'::text)
      AND survey_responses.status = 'completed'
      AND (
        public.get_user_role() = 'admin'::text
        OR survey_responses.hospital_code = public.get_user_hospital_code()
      )
    )
  );

-- =========================================================
-- FIX 6: Ensure helper functions are intact
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_hospital_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT hospital_code FROM public.profiles WHERE id = auth.uid();
$$;

-- =========================================================
-- FIX 7: Ensure check_hospital_code RPC exists
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_hospital_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE hospital_code = p_code
      AND role IN ('doctor', 'admin')
  );
$$;

COMMIT;
