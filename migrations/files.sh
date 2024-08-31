#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE files SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
    FOR delete WHERE userId = \$auth.id;
DEFINE FIELD IF NOT EXISTS uuid ON files TYPE option<string>;
DEFINE FIELD IF NOT EXISTS type ON files TYPE option<string>;
DEFINE FIELD IF NOT EXISTS path ON files TYPE option<string>;
DEFINE FIELD IF NOT EXISTS extension ON files TYPE option<string>;
DEFINE FIELD IF NOT EXISTS isPublic ON files TYPE option<bool>;
DEFINE FIELD IF NOT EXISTS publicUrl ON files TYPE option<bool>;
DEFINE INDEX IF NOT EXISTS idx_userId ON files COLUMNS userId;
"

curl -k -L -s --compressed POST \
  --header "Accept: application/json" \
  --header "NS: ${DB_NS}" \
  --header "DB: ${DB_DB}" \
  --user "root:root" \
  --data "${DATA}" \
  ${DB_SQL_URL}
