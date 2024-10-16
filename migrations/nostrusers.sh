#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE nostrusers SCHEMALESS
  PERMISSIONS 
    FOR select FULL,
    FOR create NONE,
	FOR update WHERE nip05 = \$auth.nip05,
	FOR delete WHERE nip05 = \$auth.nip05;
    DEFINE INDEX OVERWRITE idx_name ON nostrusers COLUMNS name UNIQUE;
	DEFINE INDEX OVERWRITE idx_nip05 ON nostrusers COLUMNS nip05 UNIQUE;
"
# 	-- FOR select WHERE \$scope = \"allusers\" -- limit to only users in db

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

