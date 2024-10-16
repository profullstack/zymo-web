#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE apikeys SCHEMALESS
  PERMISSIONS 
    FOR select FULL,
    FOR create WHERE \$scope = \"allusers\",
	FOR update WHERE createdBy = \$auth.id,
	FOR delete WHERE createdBy = \$auth.id;
	DEFINE INDEX OVERWRITE idx_name ON apikeys COLUMNS name UNIQUE;
"
# 	-- FOR select WHERE \$scope = \"allusers\" -- limit to only users in db

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

