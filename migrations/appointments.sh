#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE appointments SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD mainCalendarEventId ON appointments TYPE string;
DEFINE FIELD userCalendarEventId ON appointments TYPE string;
DEFINE INDEX idx_userId ON appointments COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}