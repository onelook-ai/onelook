CREATE TABLE session_video_contexts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  timestamp_secs INT NOT NULL,
  content TEXT NOT NULL
);

CREATE INDEX ON session_video_contexts (session_id);