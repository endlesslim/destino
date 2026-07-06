-- Waitlist emails
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis results (for sharing + retrieval)
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  day INT NOT NULL,
  hour INT,
  name TEXT,
  convergence_rate INT,
  archetype TEXT,
  element_harmony TEXT,
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback on analysis accuracy
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id),
  year INT NOT NULL,
  month INT NOT NULL,
  day INT NOT NULL,
  convergence_rate INT,
  archetype TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('accurate', 'inaccurate')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT NOT NULL UNIQUE,
  amount INT NOT NULL,
  product TEXT,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public-facing features)
CREATE POLICY "Allow anonymous insert" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read by id" ON analyses FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON payments FOR INSERT WITH CHECK (true);

-- Daily email subscribers
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON subscribers FOR INSERT WITH CHECK (true);

-- ━━━ 퍼널 이벤트 (관리자 대시보드용) ━━━
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_step ON events(step);
CREATE INDEX idx_events_created ON events(created_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON events FOR INSERT WITH CHECK (true);

-- ━━━ 추천코드 (결제 완료자에게 발급) ━━━
CREATE TABLE referrals (
  code TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON referrals FOR SELECT USING (true);

-- ━━━ 쿠폰 (추천 보상 등) ━━━
CREATE TABLE coupons (
  code TEXT PRIMARY KEY,
  discount_pct INT NOT NULL,
  source TEXT NOT NULL,                -- 'referral_reward' | 'manual'
  owner_ref_code TEXT,                 -- 추천 보상인 경우 추천인의 추천코드
  used_by_payment_id TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON coupons FOR SELECT USING (true);
-- 미사용 쿠폰만 사용 처리 가능
CREATE POLICY "Allow mark used" ON coupons FOR UPDATE USING (used_at IS NULL) WITH CHECK (true);

-- ━━━ 대시보드 조회 정책 ━━━
-- 권장: Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY를 설정하면 아래 정책 없이도
--       /api/admin/stats가 service role로 조회합니다 (더 안전).
-- service role 키를 쓰지 않는 경우에만 아래 주석을 해제하세요 (anon 키로 공개 조회 허용됨):
-- CREATE POLICY "Allow anonymous select" ON feedback FOR SELECT USING (true);
-- CREATE POLICY "Allow anonymous select" ON events FOR SELECT USING (true);
