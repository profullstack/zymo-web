-- Make error field optional in email_delivery table
DEFINE FIELD error ON email_delivery TYPE option<string>;