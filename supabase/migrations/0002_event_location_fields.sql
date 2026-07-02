ALTER TABLE events
  ADD COLUMN IF NOT EXISTS end_date      timestamptz,
  ADD COLUMN IF NOT EXISTS location_url  text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS instructions  text,
  ADD COLUMN IF NOT EXISTS organizer     text,
  ADD COLUMN IF NOT EXISTS description   text;
