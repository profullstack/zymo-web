-- Write your SQL migration up query here for email_delivery
DEFINE TABLE email_delivery SCHEMAFULL PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;

DEFINE FIELD email_archive_id ON email_delivery TYPE record(email_archive);
DEFINE FIELD recipient ON email_delivery TYPE string;
DEFINE FIELD status ON email_delivery TYPE string;  -- 'pending', 'sent', 'failed'
DEFINE FIELD error ON email_delivery TYPE string;
DEFINE FIELD sent_at ON email_delivery TYPE datetime;
DEFINE FIELD retry_count ON email_delivery TYPE int DEFAULT 0;
DEFINE FIELD last_retry_at ON email_delivery TYPE datetime;
