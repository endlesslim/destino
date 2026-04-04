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
