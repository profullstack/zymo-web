#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE m3u SCHEMALESS
  PERMISSIONS 
    FOR select FULL,
    FOR create WHERE \$scope = \"allusers\",
	FOR update WHERE createdBy = \$auth.id,
	FOR delete WHERE createdBy = \$auth.id;
	DEFINE INDEX idx_url ON m3u COLUMNS url UNIQUE;

"
# 	-- FOR select WHERE \$scope = \"allusers\" -- limit to only users in db

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

