#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE files SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
    FOR delete WHERE userId = \$auth.id;
DEFINE FIELD uuid ON files TYPE option<string>;
DEFINE FIELD type ON files TYPE option<string>;
DEFINE FIELD path ON files TYPE option<string>;
DEFINE FIELD extension ON files TYPE option<string>;
DEFINE FIELD isPublic ON files TYPE option<bool>;
DEFINE FIELD publicUrl ON files TYPE option<bool>;
DEFINE INDEX idx_userId ON files COLUMNS userId;
"

curl -k -L -s --compressed POST \
  --header "Accept: application/json" \
  --header "NS: ${DB_NS}" \
  --header "DB: ${DB_DB}" \
  --user "root:root" \
  --data "${DATA}" \
  ${DB_SQL_URL}
