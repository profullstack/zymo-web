#!/bin/bash

# See: https://gist.githubusercontent.com/koakh/fbbc37cde630bedcf57acfd4d6a6956b/raw/ec0d25ce0dba9b729f4e8d379149e4b99cced7bc/gistfile1.txt

. .env
. .env.local

DATA="DEFINE TABLE OVERWRITE user SCHEMAFULL
 PERMISSIONS
  FOR select FULL,
  FOR update, delete WHERE id = \$auth.id OR \$auth.isAdmin = true,
  FOR create NONE;
DEFINE FIELD OVERWRITE email ON user TYPE string;
DEFINE FIELD OVERWRITE isAdmin ON user TYPE option<bool> DEFAULT false;
DEFINE FIELD OVERWRITE phone ON user TYPE option<string>;
DEFINE FIELD OVERWRITE stripeCustomerId ON user TYPE option<string>;
DEFINE FIELD OVERWRITE googleRefreshToken ON user TYPE option<string>;
DEFINE FIELD OVERWRITE phonePrefix ON user TYPE option<string>;
DEFINE FIELD OVERWRITE firstName ON user TYPE string;
DEFINE FIELD OVERWRITE lastName ON user TYPE string;
DEFINE FIELD OVERWRITE username ON user TYPE string;
DEFINE FIELD OVERWRITE createdAt ON user TYPE datetime;
DEFINE FIELD OVERWRITE updatedAt ON user TYPE datetime;
DEFINE FIELD OVERWRITE loggedInAt ON user TYPE option<datetime>;
DEFINE FIELD OVERWRITE password ON user TYPE string;
DEFINE FIELD OVERWRITE settings ON user TYPE option<object>;
DEFINE FIELD OVERWRITE headers ON user FLEXIBLE TYPE option<object>;
DEFINE FIELD OVERWRITE settings.location ON user TYPE option<geometry<point>>;
DEFINE FIELD OVERWRITE settings.timezone ON user TYPE option<string>;
DEFINE FIELD OVERWRITE settings.languages ON user TYPE option<array>;
DEFINE FIELD OVERWRITE settings.languages.* ON user TYPE option<string>;
DEFINE FIELD OVERWRITE settings.offset ON user TYPE option<string>;
DEFINE FIELD OVERWRITE verify ON user TYPE option<object>;
DEFINE FIELD OVERWRITE verify.email ON user TYPE option<object>;
DEFINE FIELD OVERWRITE verify.email.code ON user TYPE option<string>;
DEFINE FIELD OVERWRITE verify.email.expiration ON user TYPE option<datetime>;
DEFINE FIELD OVERWRITE verify.email.status ON user TYPE option<string>;
DEFINE FIELD OVERWRITE verify.phone ON user TYPE option<object>;
DEFINE FIELD OVERWRITE verify.phone.code ON user TYPE option<string>;
DEFINE FIELD OVERWRITE verify.phone.expiration ON user TYPE option<datetime>;
DEFINE FIELD OVERWRITE verify.phone.status ON user TYPE option<string>;
DEFINE FIELD OVERWRITE passwordReset ON user TYPE option<object>;
DEFINE FIELD OVERWRITE passwordReset.token ON user TYPE option<string>;
DEFINE FIELD OVERWRITE passwordReset.expiration ON user TYPE option<string>;
DEFINE INDEX OVERWRITE idx_email ON user COLUMNS email UNIQUE;
DEFINE INDEX OVERWRITE idx_username ON user COLUMNS username UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE ACCESS OVERWRITE allusers ON DATABASE TYPE RECORD
 SIGNIN ( SELECT * FROM user WHERE email = \$email AND crypto::argon2::compare(password, \$password) )
 SIGNUP ( CREATE user SET username = \$username, email = \$email, phone = \$phone, phonePrefix = \$phonePrefix, firstName = \$firstName, lastName = \$lastName, password = crypto::argon2::generate(\$password), createdAt = \$createdAt, updatedAt = \$updatedAt, headers = \$headers )
 DURATION FOR SESSION 2w
;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

DATA="DEFINE ACCESS OVERWRITE apiusers ON DATABASE TYPE RECORD
SIGNIN ( (SELECT *, (SELECT * FROM apikeys WHERE createdBy = \$parent.id AND id = \$apikey) AS apikeys FROM user)[WHERE array::matches(apikeys, {createdBy: id})] )
 DURATION FOR SESSION 2w
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE ACCESS OVERWRITE allnostrusers ON DATABASE TYPE RECORD
  SIGNUP ( CREATE nostrusers SET name = \$name, website = \$website, displayName = \$displayName, about = \$about, lud16 = \$lud16, image = \$image, createdAt = \$created_at, updatedAt = \$updatedAt, banner = \$banner, nip05 = \$nip05 )
  SIGNIN ( (SELECT * FROM nostrusers WHERE nip05 = \$nip05) )
   DURATION FOR SESSION 2w

;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

