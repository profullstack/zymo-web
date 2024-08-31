#!/bin/bash

# See: https://gist.githubusercontent.com/koakh/fbbc37cde630bedcf57acfd4d6a6956b/raw/ec0d25ce0dba9b729f4e8d379149e4b99cced7bc/gistfile1.txt

. .env
. .env.local

DATA="DEFINE TABLE user SCHEMAFULL
 PERMISSIONS
  FOR select FULL,
  FOR update, delete WHERE id = \$auth.id OR \$auth.isAdmin = true,
  FOR create NONE;
DEFINE FIELD IF NOT EXISTS email ON user TYPE string;
DEFINE FIELD IF NOT EXISTS isAdmin ON user TYPE option<bool> DEFAULT false;
DEFINE FIELD IF NOT EXISTS phone ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS stripeCustomerId ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS googleRefreshToken ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS phonePrefix ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS firstName ON user TYPE string;
DEFINE FIELD IF NOT EXISTS lastName ON user TYPE string;
DEFINE FIELD IF NOT EXISTS username ON user TYPE string;
DEFINE FIELD IF NOT EXISTS createdAt ON user TYPE datetime;
DEFINE FIELD IF NOT EXISTS updatedAt ON user TYPE datetime;
DEFINE FIELD IF NOT EXISTS loggedInAt ON user TYPE option<datetime>;
DEFINE FIELD IF NOT EXISTS password ON user TYPE string;
DEFINE FIELD IF NOT EXISTS settings ON user TYPE option<object>;
DEFINE FIELD IF NOT EXISTS headers ON user FLEXIBLE TYPE option<object>;
DEFINE FIELD IF NOT EXISTS settings.location ON user TYPE option<geometry<point>>;
DEFINE FIELD IF NOT EXISTS settings.timezone ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS settings.languages ON user TYPE option<array>;
DEFINE FIELD IF NOT EXISTS settings.languages.* ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS settings.offset ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS verify ON user TYPE option<object>;
DEFINE FIELD IF NOT EXISTS verify.email ON user TYPE option<object>;
DEFINE FIELD IF NOT EXISTS verify.email.code ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS verify.email.expiration ON user TYPE option<datetime>;
DEFINE FIELD IF NOT EXISTS verify.email.status ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS verify.phone ON user TYPE option<object>;
DEFINE FIELD IF NOT EXISTS verify.phone.code ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS verify.phone.expiration ON user TYPE option<datetime>;
DEFINE FIELD IF NOT EXISTS verify.phone.status ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS passwordReset ON user TYPE option<object>;
DEFINE FIELD IF NOT EXISTS passwordReset.token ON user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS passwordReset.expiration ON user TYPE option<string>;
DEFINE INDEX IF NOT EXISTS idx_email ON user COLUMNS email UNIQUE;
DEFINE INDEX IF NOT EXISTS idx_username ON user COLUMNS username UNIQUE;
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE SCOPE allusers
 SESSION 14d
 SIGNIN ( SELECT * FROM user WHERE email = \$email AND crypto::argon2::compare(password, \$password) )
 SIGNUP ( CREATE user SET username = \$username, email = \$email, phone = \$phone, phonePrefix = \$phonePrefix, firstName = \$firstName, lastName = \$lastName, password = crypto::argon2::generate(\$password), createdAt = \$createdAt, updatedAt = \$updatedAt, headers = \$headers )
;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

DATA="DEFINE SCOPE apiusers
 SESSION 14d
SIGNIN ( (SELECT *, (SELECT * FROM apikeys WHERE createdBy = \$parent.id AND id = \$apikey) AS apikeys FROM user)[WHERE array::matches(apikeys, {createdBy: id})] )
"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


DATA="DEFINE SCOPE allnostrusers
  SESSION 14d
  SIGNUP ( CREATE nostrusers SET name = \$name, website = \$website, displayName = \$displayName, about = \$about, lud16 = \$lud16, image = \$image, createdAt = \$created_at, updatedAt = \$updatedAt, banner = \$banner, nip05 = \$nip05 )
	SESSION 14d
	SIGNIN ( (SELECT * FROM nostrusers WHERE nip05 = \$nip05) )
;"

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

