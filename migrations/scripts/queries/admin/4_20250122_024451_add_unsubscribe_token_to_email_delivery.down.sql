-- Remove index and fields from email_delivery table
REMOVE INDEX idx_unsubscribe_token ON email_delivery;
REMOVE FIELD IF EXISTS unsubscribe_token ON email_delivery;
REMOVE FIELD IF EXISTS user_id ON email_delivery;