#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE waitlist SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\";
DEFINE INDEX OVERWRITE idx_email ON waitlist COLUMNS email UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}