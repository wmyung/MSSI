// ──────────────────────────────────────────────────────
// config.js — MSSI 설문조사 앱 설정
// Supabase anon key는 RLS로 보호되므로 공개해도 안전합니다
// ──────────────────────────────────────────────────────

const ENV = typeof window !== 'undefined' ? window.__ENV__ || {} : {};

export const SUPABASE_URL      = ENV.VITE_SUPABASE_URL      || "https://gcjdxyauirbugbugltmv.supabase.co";
export const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY || "eyJhbG...X8qs";

// Supabase Auth용 가상 이메일 도메인 (실제 이메일이 아님)
export const PATIENT_EMAIL_DOMAIN = "patient.local";
export const DOCTOR_EMAIL_DOMAIN  = "doctor.local";

// 관리자 로그인 이메일 (유일한 관리자)
export const ADMIN_EMAIL = "snumood@gmail.com";

// Google Sheets Webhook URL (Apps Script 배포 후 URL로 변경)
export const GOOGLE_SHEETS_WEBHOOK_URL = ""; // ★ 여기에 Apps Script URL 입력
