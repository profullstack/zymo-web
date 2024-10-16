#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE affiliates SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE balance ON affiliates TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE payoutMethods ON affiliates TYPE option<array> DEFAULT [];
DEFINE INDEX OVERWRITE idx_userId ON affiliates COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

DATA="DEFINE TABLE OVERWRITE referralCodes SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE name ON TABLE referralCodes TYPE string;
DEFINE FIELD OVERWRITE clicks ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE conversions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE commissions ON TABLE referralCodes TYPE option<number> DEFAULT 0;
DEFINE INDEX OVERWRITE idx_userId ON referralCodes COLUMNS userId;
DEFINE INDEX OVERWRITE idx_affiliateId ON referralCodes COLUMNS affiliateId;
DEFINE INDEX OVERWRITE idx_code ON referralCodes COLUMNS code UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE TABLE OVERWRITE referrals SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE referralCode ON referrals TYPE string;
DEFINE INDEX OVERWRITE idx_userId ON referrals COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}