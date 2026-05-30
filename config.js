// ──────────────────────────────────────────────────────
// config.js — MSSI 설문조사 앱 설정
// Supabase anon key는 RLS로 보호되므로 공개해도 안전합니다
// ──────────────────────────────────────────────────────

// Supabase 설정 (GitHub Pages에서는 런타임 환경변수 우선, 없으면 기본값 사용)
const ENV = typeof window !== 'undefined' ? window.__ENV__ || {} : {};

export const SUPABASE_URL      = ENV.VITE_SUPABASE_URL      || "https://gcjdxyauirbugbugltmv.supabase.co";
export const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjamR4eWF1aXJidWdidWdsdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk0NjQwODAsImV4cCI6MjAyNTA0MDA4MH0.X8qs";

// 사용자 도메인 (실제 이메일이 아닌 Supabase Auth용 가상 도메인)
export const PATIENT_EMAIL_DOMAIN = "patient.local";
export const DOCTOR_EMAIL_DOMAIN  = "doctor.local";

// 관리자 이메일
export const ADMIN_EMAIL = "snumood@gmail.com";
