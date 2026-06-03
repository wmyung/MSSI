
const ENV = typeof window !== 'undefined' ? window.__ENV__ || {} : {};

export const SUPABASE_URL = ENV.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY || "";

export const PATIENT_EMAIL_DOMAIN = "patient.local";
export const DOCTOR_EMAIL_DOMAIN  = "doctor.local";

export const ADMIN_EMAIL = ENV.ADMIN_EMAIL || "";

export const GOOGLE_SHEETS_WEBHOOK_URL = ENV.GOOGLE_SHEETS_WEBHOOK_URL || "";
