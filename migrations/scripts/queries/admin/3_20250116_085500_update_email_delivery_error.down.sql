-- Revert error field to required in email_delivery table
REMOVE FIELD IF EXISTS error FROM email_delivery;