#!/bin/bash

. .env
. .env.local

#products

DATA="DEFINE TABLE products SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE id = \$auth.id;
	
DEFINE FIELD name ON products TYPE string;
DEFINE FIELD mode ON products TYPE string;
DEFINE FIELD stripeProductId ON products TYPE string;
DEFINE FIELD stripePriceId ON products TYPE option<string>;
DEFINE FIELD price ON products TYPE number;
DEFINE FIELD subscriptionPriceIds ON products TYPE option<array>;
"


curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


#payments

DATA="DEFINE TABLE payments SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE id = \$auth.id;
DEFINE FIELD status ON payments TYPE string;
DEFINE FIELD subscriptionInterval ON payments TYPE option<string>;
DEFINE FIELD stripeSubscriptionId ON payments TYPE option<string>;
DEFINE FIELD productId ON payments TYPE string;
DEFINE FIELD renewalDate ON payments TYPE option<number>;
DEFINE FIELD cancelAtPeriodEnd ON payments TYPE option<bool>;
DEFINE INDEX idx_userId ON payments COLUMNS userId;
"


curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}
