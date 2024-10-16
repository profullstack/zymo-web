#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE blogposts SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD OVERWRITE title ON blogposts TYPE option<string>;
DEFINE FIELD OVERWRITE thumbnail ON blogposts TYPE option<string>;
DEFINE FIELD OVERWRITE slug ON blogposts TYPE option<string>;
DEFINE FIELD OVERWRITE tags ON blogposts TYPE option<array>;
DEFINE FIELD OVERWRITE views ON blogposts TYPE option<number> DEFAULT 0;
DEFINE FIELD OVERWRITE authorName ON blogposts TYPE option<string>;
DEFINE FIELD OVERWRITE markdown ON blogposts TYPE option<string>;
DEFINE INDEX OVERWRITE idx_userId ON affiliates COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}