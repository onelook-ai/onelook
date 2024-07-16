CREATE TABLE session_analysis_completed_notifications (
  session_id uuid NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  message_id TEXT UNIQUE,
  PRIMARY KEY (session_id, email)
);