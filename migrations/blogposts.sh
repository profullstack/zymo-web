#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE blogposts SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD IF NOT EXISTS title ON blogposts TYPE option<string>;
DEFINE FIELD IF NOT EXISTS thumbnail ON blogposts TYPE option<string>;
DEFINE FIELD IF NOT EXISTS slug ON blogposts TYPE option<string>;
DEFINE FIELD IF NOT EXISTS tags ON blogposts TYPE option<array>;
DEFINE FIELD IF NOT EXISTS views ON blogposts TYPE option<number> DEFAULT 0;
DEFINE FIELD IF NOT EXISTS authorName ON blogposts TYPE option<string>;
DEFINE FIELD IF NOT EXISTS markdown ON blogposts TYPE option<string>;
DEFINE INDEX IF NOT EXISTS idx_userId ON affiliates COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}