#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE files SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
    FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE uuid ON files TYPE option<string>;
DEFINE FIELD OVERWRITE type ON files TYPE option<string>;
DEFINE FIELD OVERWRITE path ON files TYPE option<string>;
DEFINE FIELD OVERWRITE extension ON files TYPE option<string>;
DEFINE FIELD OVERWRITE isPublic ON files TYPE option<bool>;
DEFINE FIELD OVERWRITE publicUrl ON files TYPE option<bool>;
DEFINE INDEX OVERWRITE idx_userId ON files COLUMNS userId;
"

curl -k -L -s --compressed POST \
  --header "Accept: application/json" \
  --header "NS: ${DB_NS}" \
  --header "DB: ${DB_DB}" \
  --user "root:root" \
  --data "${DATA}" \
  ${DB_SQL_URL}
