#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE blogposts SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE userId = \$auth.id;
DEFINE FIELD title ON blogposts TYPE option<string>;
DEFINE FIELD thumbnail ON blogposts TYPE option<string>;
DEFINE FIELD slug ON blogposts TYPE option<string>;
DEFINE FIELD tags ON blogposts TYPE option<array>;
DEFINE FIELD views ON blogposts TYPE option<number> DEFAULT 0;
DEFINE FIELD authorName ON blogposts TYPE option<string>;
DEFINE FIELD markdown ON blogposts TYPE option<string>;
DEFINE INDEX idx_userId ON affiliates COLUMNS userId UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}