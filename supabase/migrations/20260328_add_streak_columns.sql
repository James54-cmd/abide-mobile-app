ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_count int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_last_active date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tree_stage int DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;

CREATE TABLE IF NOT EXISTS streak_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  date date NOT NULL,
  activity_type text,
  created_at timestamptz DEFAULT now()
);
