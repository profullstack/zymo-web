-- Write your SQL migration up query here for email_archive
DEFINE TABLE email_archive SCHEMAFULL PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;

DEFINE FIELD subject ON email_archive TYPE string;
DEFINE FIELD body ON email_archive TYPE string;
DEFINE FIELD sent_at ON email_archive TYPE option<datetime>;
DEFINE FIELD sent_by ON email_archive TYPE record(user);
DEFINE FIELD recipient_type ON email_archive TYPE string;
DEFINE FIELD recipient_count ON email_archive TYPE int;
