# 기분장애 임상평가 자기보고식 설문 시스템 (MSSI)

**Mood Disorder Clinical Assessment Self-Report Survey System**

분당서울대학교병원 정신건강의학과 기분장애클리닉의 임상평가를 위한 자기보고식 설문 웹 애플리케이션입니다.

## 🔗 배포 주소

GitHub Pages: `https://snumood2.github.io/MSSI`

## 🏗 시스템 아키텍처

```
사용자 브라우저 (HTML/CSS/JS)
        │
        ├── GitHub Pages (정적 호스팅)
        │
        └── Supabase (BaaS)
              ├── Auth (이메일 인증)
              ├── PostgreSQL DB (profiles, survey_responses)
              └── RLS (Row Level Security)
```

## 📋 설문 구성 (20개 섹션)

| # | 섹션 | 설명 | 문항 |
|---|------|------|------|
| 1 | Zung SDS | 우울증 선별 | 20 |
| 2 | BAI | 불안 증상 | 21 |
| 3 | TEMPSA-SV | 정서기질 | 39 |
| 4 | MSSI | 기분안정성상태 | 21 |
| 5 | 자살경향성 | 변별진단 | 4 |
| D | 공황장애 | 변별진단 | 3 |
| E | 광장공포증 | 변별진단 | 2 |
| F | 사회공포증 | 변별진단 | 3 |
| G | 강박장애 | 변별진단 | 4 |
| N | 범불안장애 | 변별진단 | 9 |
| 6 | MIQ-T | 기분안정성특성 | 17 |
| 7 | K-MDQ | 한국형 기분장애 | 15 |
| 8 | BAPQ | 행동특성 | 36 |
| 9 | CTQ-SF | 아동기외상 | 28 |
| 10 | IPSM | 대인관계민감성 | 36 |
| 11 | CD-RISC | 회복탄력성 | 25 |
| 12 | ERSQ | 정서조절 | 27 |
| 13 | BIS/BAS | 행동패턴 | 20 |
| 14 | AUDIT-K | 음주선별 | 10 |
| 15 | CSM | 수면양상 | 13 |
| 16 | SPAQ | 계절변화 | 6 |
| 17 | ASRS | 집중력/ADHD | 18 |
| 18 | PAI-BOR | 경계선성격 | 24 |
| 19 | WURS | 아동기ADHD | 25 |
| 20 | PMS | 생리주기변화 | 19 |

## 🚀 시작하기

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor 열기
3. `supabase/migration.sql` 파일 내용 복사 → 붙여넣기 → 실행
4. **Auth 설정**:
   - Settings → Auth → Email Auth → **Confirm email: OFF** (이메일 확인 없이 로그인)
   - Settings → Auth → **Disable "Allow multiple accounts with same email"** (선택)

### 2. GitHub Pages 배포

#### 방법 A: GitHub Actions (자동)
1. 이 레포지토리를 GitHub에 push
2. Settings → Pages → Source: **GitHub Actions** 선택
3. `main` 브랜치에 push 시 자동 배포

#### 방법 B: 수동
1. Settings → Pages → Source: **Deploy from a branch**
2. Branch: `main`, folder: `/ (root)` 선택
3. Save 클릭

### 3. 설정 확인

`config.js`에서 Supabase URL과 anon key가 맞는지 확인:

```js
export const SUPABASE_URL = "https://gcjdxyauirbugbugltmv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbG...";
```

> **⚠️ anon key는 공개되어도 안전합니다.** Supabase의 RLS(Row Level Security)가 데이터를 보호합니다.

## 👤 사용자 역할

| 역할 | 설명 | 권한 |
|------|------|------|
| **응답자 (Patient)** | 설문 작성 및 결과 조회 | 자신의 설문 CRUD |
| **의사 (Doctor)** | 환자 검색 및 결과 열람 | 같은 병원코드 환자 조회 |
| **의사(승인대기)** | 가입 후 관리자 승인 대기 | - |
| **관리자 (Admin)** | 의사 승인, 전체 데이터 관리 | 모든 권한 |

## 🔒 보안

### 적용된 보안 조치

1. **RLS (Row Level Security)**
   - 환자는 자신의 설문 데이터만 접근 가능
   - 의사는 같은 병원코드 환자의 완료된 설문만 조회 가능
   - 관리자만 모든 데이터 접근 가능

2. **개인정보 최소화**
   - ❌ 이름 미수집 (별명/아이디만 사용)
   - ❌ 전화번호, 주소 미수집
   - ❌ 이메일 수집 안함 (환자는 가상 도메인 사용)
   - ✅ 생년월일 (임상 평가 필수)
   - ✅ 성별 (임상 평가 필수)

3. **데이터 암호화**
   - Supabase 전송 시 HTTPS(TLS) 암호화
   - 비밀번호는 bcrypt로 해시 저장
   - Supabase PostgreSQL 데이터 암호화

4. **SECURITY DEFINER 함수**
   - 모든 RPC 함수는 SECURITY DEFINER로 실행
   - 호출자 권한이 아닌 함수 소유자 권한으로 실행
   - 함수 내부에서 권한 재검증

## 📁 프로젝트 구조

```
MSSI/
├── index.html          # 메인 HTML (UI)
├── app.js              # 앱 로직 (Supabase 연동)
├── config.js           # Supabase 설정
├── questions.js        # 설문 문항 데이터
├── scoring.js          # 채점 및 결과 리포트
├── styles.css          # 스타일시트
├── .github/workflows/  # GitHub Actions 배포
├── supabase/           # Supabase SQL 마이그레이션
│   └── migration.sql   # 테이블, RLS, RPC, 트리거
└── .env.example        # 환경변수 예시
```

## 📊 주요 기능

### 환자
- 회원가입/로그인 (병원코드 필요)
- 20개 섹션 설문 작성 (자동저장, 이어하기)
- 시각화된 결과 리포트 (백분위, 컬러코딩)
- 결과 인쇄/PDF 저장

### 의사
- 환자 번호로 검색
- 같은 병원 환자 목록
- 결과 상세 조회

### 관리자
- 의사 승인/관리
- 비밀번호 초기화
- 전체 데이터 JSON 내보내기

## 📝 라이선스

서울대학교병원 정신건강의학과 임상연구용

---

*문의: snumood@gmail.com*
