
const ENV = typeof window !== 'undefined' ? window.__ENV__ || {} : {};

export const SUPABASE_URL = ENV.VITE_SUPABASE_URL || "https://gcjdxyauirbugbugltmv.supabase.co";
export const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjamR4eWF1aXJidWdidWdsdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTYxNTAsImV4cCI6MjA5MDk3MjE1MH0.ecHdc18IUGkrissF6tEivQ_F7vMEu9BJtqSTsiGX8qs";

export const PATIENT_EMAIL_DOMAIN = "patient.local";
export const DOCTOR_EMAIL_DOMAIN  = "doctor.local";

export const ADMIN_EMAIL = ENV.ADMIN_EMAIL || "snumood@gmail.com";

export const GOOGLE_SHEETS_WEBHOOK_URL = ENV.GOOGLE_SHEETS_WEBHOOK_URL || "";
