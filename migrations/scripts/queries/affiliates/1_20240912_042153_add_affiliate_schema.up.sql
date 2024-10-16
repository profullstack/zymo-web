-- Write your SQL migration up query here for affiliates

-- Define the affiliates table with schema and permissions
DEFINE TABLE OVERWRITE affiliates SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD OVERWRITE balance ON affiliates TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE payoutMethods ON affiliates TYPE option<array> DEFAULT [];
DEFINE INDEX OVERWRITE idx_userId ON affiliates COLUMNS userId UNIQUE;

-- Define the referralCodes table with schema and permissions
DEFINE TABLE OVERWRITE referralCodes SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD OVERWRITE name ON TABLE referralCodes TYPE string;
DEFINE FIELD OVERWRITE clicks ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE conversions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE commissions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE INDEX OVERWRITE idx_userId ON referralCodes COLUMNS userId;
DEFINE INDEX OVERWRITE idx_affiliateId ON referralCodes COLUMNS affiliateId;
DEFINE INDEX OVERWRITE idx_code ON referralCodes COLUMNS code UNIQUE;

-- Define the referrals table with schema and permissions
DEFINE TABLE OVERWRITE referrals SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
    FOR delete WHERE userId = $auth.id;
DEFINE FIELD OVERWRITE referralCode ON referrals TYPE string;
DEFINE INDEX OVERWRITE idx_userId ON referrals COLUMNS userId UNIQUE;
