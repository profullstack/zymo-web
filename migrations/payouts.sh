#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE payouts SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD IF NOT EXISTS method ON payouts TYPE string;
DEFINE FIELD IF NOT EXISTS amount ON payouts TYPE option<number>;
DEFINE FIELD IF NOT EXISTS status ON payouts TYPE option<string>;
DEFINE FIELD IF NOT EXISTS details ON payouts TYPE object;
DEFINE INDEX IF NOT EXISTS idx_userId ON payouts COLUMNS userId;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}