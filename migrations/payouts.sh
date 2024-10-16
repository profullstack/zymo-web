#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE payouts SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE method ON payouts TYPE string;
DEFINE FIELD OVERWRITE amount ON payouts TYPE option<number>;
DEFINE FIELD OVERWRITE status ON payouts TYPE option<string>;
DEFINE FIELD OVERWRITE details ON payouts TYPE object;
DEFINE INDEX OVERWRITE idx_userId ON payouts COLUMNS userId;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}