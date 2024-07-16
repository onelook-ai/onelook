CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  video_full_storage_path TEXT NOT NULL
);

CREATE TABLE video_screenshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  full_storage_path TEXT NOT NULL,
  timestamp_secs INT NOT NULL,
  extracted_text TEXT NOT NULL
);

CREATE INDEX ON video_screenshots (session_id);

CREATE TABLE analysis_results (
  session_id uuid PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  results JSONB NOT NULL
);