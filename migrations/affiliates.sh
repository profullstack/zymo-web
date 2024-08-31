#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE affiliates SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD IF NOT EXISTS balance ON affiliates TYPE option<number> DEFAULT 0;
DEFINE FIELD IF NOT EXISTS payoutMethods ON affiliates TYPE option<array> DEFAULT [];
DEFINE INDEX IF NOT EXISTS idx_userId ON affiliates COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

DATA="DEFINE TABLE referralCodes SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD name ON TABLE referralCodes TYPE string;
DEFINE FIELD clicks ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD conversions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD commissions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE INDEX idx_userId ON referralCodes COLUMNS userId;
DEFINE INDEX idx_affiliateId ON referralCodes COLUMNS affiliateId;
DEFINE INDEX idx_code ON referralCodes COLUMNS code UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE TABLE referrals SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD referralCode ON referrals TYPE string;
DEFINE INDEX idx_userId ON referrals COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}