-- Write your SQL migration up query here for affiliates

-- Define the affiliates table with schema and permissions
DEFINE TABLE affiliates SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD balance ON affiliates TYPE option<number> DEFAULT 0;
DEFINE FIELD payoutMethods ON affiliates TYPE option<array> DEFAULT [];
DEFINE INDEX idx_userId ON affiliates COLUMNS userId UNIQUE;

-- Define the referralCodes table with schema and permissions
DEFINE TABLE referralCodes SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD name ON TABLE referralCodes TYPE string;
DEFINE FIELD clicks ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD conversions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD commissions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE INDEX idx_userId ON referralCodes COLUMNS userId;
DEFINE INDEX idx_affiliateId ON referralCodes COLUMNS affiliateId;
DEFINE INDEX idx_code ON referralCodes COLUMNS code UNIQUE;

-- Define the referrals table with schema and permissions
DEFINE TABLE referrals SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD referralCode ON referrals TYPE string;
DEFINE INDEX idx_userId ON referrals COLUMNS userId UNIQUE;
