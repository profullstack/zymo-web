#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE appointments SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE mainCalendarEventId ON appointments TYPE string;
DEFINE FIELD OVERWRITE userCalendarEventId ON appointments TYPE string;
DEFINE INDEX OVERWRITE idx_userId ON appointments COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}