#!/bin/bash

# See: https://gist.githubusercontent.com/koakh/fbbc37cde630bedcf57acfd4d6a6956b/raw/ec0d25ce0dba9b729f4e8d379149e4b99cced7bc/gistfile1.txt

. .env
. .env.local

DATA="DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR select FULL,
    FOR update, delete WHERE id = \$auth.id,
    FOR create NONE;
DEFINE FIELD email ON user TYPE string;
DEFINE FIELD phone ON user TYPE option<string>;
DEFINE FIELD phonePrefix ON user TYPE option<string>;
DEFINE FIELD firstName ON user TYPE string;
DEFINE FIELD lastName ON user TYPE string;
DEFINE FIELD username ON user TYPE string;
DEFINE FIELD createdAt ON user TYPE datetime;
DEFINE FIELD updatedAt ON user TYPE datetime;
DEFINE FIELD loggedInAt ON user TYPE option<datetime>;
DEFINE FIELD password ON user TYPE string;
DEFINE FIELD settings ON user TYPE option<object>;
DEFINE FIELD settings.location ON user TYPE option<geometry<point>>;
DEFINE FIELD settings.timezone ON user TYPE option<string>;
DEFINE FIELD settings.languages ON user TYPE option<array>;
DEFINE FIELD settings.languages.* ON user TYPE option<string>;
DEFINE FIELD settings.offset ON user TYPE option<string>;
DEFINE FIELD verify ON user TYPE option<object>;
DEFINE FIELD verify.email ON user TYPE option<object>;
DEFINE FIELD verify.email.code ON user TYPE option<string>;
DEFINE FIELD verify.email.expiration ON user TYPE option<datetime>;
DEFINE FIELD verify.email.status ON user TYPE option<string>;
DEFINE FIELD verify.phone ON user TYPE option<object>;
DEFINE FIELD verify.phone.code ON user TYPE option<string>;
DEFINE FIELD verify.phone.expiration ON user TYPE option<datetime>;
DEFINE FIELD verify.phone.status ON user TYPE option<string>;
DEFINE INDEX idx_email ON user COLUMNS email UNIQUE;
DEFINE INDEX idx_username ON user COLUMNS username UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE SCOPE allusers
  -- the JWT session will be valid for 14 days
  SESSION 14d
  -- SIGNIN ( SELECT * FROM user WHERE email = \$email AND crypto::argon2::compare(password, \$password) )
  SIGNIN ( SELECT * FROM user WHERE email = \$email AND crypto::argon2::compare(password, \$password) )
  SIGNUP ( CREATE user SET username = \$username, email = \$email, phone = \$phone, phonePrefix = \$phonePrefix, firstName = \$firstName, lastName = \$lastName, password = crypto::argon2::generate(\$password), createdAt = \$createdAt, updatedAt = \$updatedAt )

  -- The optional SIGNUP clause will be run when calling the signup method for this scope
  -- It is designed to create or add a new record to the database.
  -- If set, it needs to return a record or a record id
  -- The variables can be passed in to the signin method
  --	SIGNUP ( CREATE user SET username = \$username, email = \$email, password = crypto::argon2::generate(\$password), phone = \$phone )
  -- The optional SIGNIN clause will be run when calling the signin method for this scope
  -- It is designed to check if a record exists in the database.
  -- If set, it needs to return a record or a record id
  -- The variables can be passed in to the signin method
  -- SIGNIN ( SELECT * FROM user WHERE email = \$email AND crypto::argon2::compare(password, \$password) )
  -- SIGNIN ( SELECT * FROM user WHERE settings.apiKeys.key = \$apikey OR (email = \$email AND crypto::argon2::compare(password, \$password)) )
  -- this optional clause will be run when calling the signup method for this scope
;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

DATA="DEFINE SCOPE apiusers
  -- the JWT session will be valid for 14 days
  SESSION 14d
  SIGNIN ( SELECT *, (SELECT VALUE apikey FROM apikeys WHERE apikeys.createdBy = id) as apikeys FROM user WHERE apikeys contains \$apikey );
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE SCOPE nostrusers
  -- the JWT session will be valid for 14 days
  SESSION 14d
  SIGNIN ( SELECT *, (SELECT * FROM nostrusers) as nostrusers FROM user WHERE nostrpub.id = \$nostrPub )
;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}
