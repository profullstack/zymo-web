-- Add unsubscribe_token field to email_delivery table
DEFINE FIELD unsubscribe_token ON email_delivery TYPE string;

-- Add user_id field to email_delivery table
DEFINE FIELD user_id ON email_delivery TYPE record(user);

-- Add index on unsubscribe_token for faster lookups
DEFINE INDEX idx_unsubscribe_token ON email_delivery FIELDS unsubscribe_token;