#!/bin/bash

. .env
. .env.local

#products

DATA="DEFINE TABLE OVERWRITE products SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE id = \$auth.id;
	
DEFINE FIELD OVERWRITE name ON products TYPE string;
DEFINE FIELD OVERWRITE mode ON products TYPE string;
DEFINE FIELD OVERWRITE stripeProductId ON products TYPE string;
DEFINE FIELD OVERWRITE stripePriceId ON products TYPE option<string>;
DEFINE FIELD OVERWRITE price ON products TYPE number;
DEFINE FIELD OVERWRITE subscriptionOptions ON products TYPE option<array>;
"


curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}


#payments

DATA="DEFINE TABLE OVERWRITE payments SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE id = \$auth.id;
DEFINE FIELD OVERWRITE status ON payments TYPE string;
DEFINE FIELD OVERWRITE amount ON payments TYPE number;
DEFINE FIELD OVERWRITE subscriptionInterval ON payments TYPE option<string>;
DEFINE FIELD OVERWRITE stripeSubscriptionId ON payments TYPE option<string>;
DEFINE FIELD OVERWRITE stripePaymentIntent ON payments TYPE option<string>;
DEFINE FIELD OVERWRITE refunded ON payments TYPE option<bool>;
DEFINE FIELD OVERWRITE productId ON payments TYPE string;
DEFINE FIELD OVERWRITE renewalDate ON payments TYPE option<number>;
DEFINE FIELD OVERWRITE cancelAtPeriodEnd ON payments TYPE option<bool>;
DEFINE INDEX OVERWRITE idx_userId ON payments COLUMNS userId;
"


curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "Surreal-NS: ${DB_NS}" \
	--header "Surreal-DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

