#!/bin/bash

. .env
. .env.local

#products

DATA="DEFINE TABLE products SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE \$scope = \"allusers\" OR \$scope = \"apiusers\" OR \$scope = \"allnostrusers\",
	FOR delete WHERE id = \$auth.id;
	
DEFINE FIELD IF NOT EXISTS name ON products TYPE string;
DEFINE FIELD IF NOT EXISTS mode ON products TYPE string;
DEFINE FIELD IF NOT EXISTS stripeProductId ON products TYPE string;
DEFINE FIELD IF NOT EXISTS stripePriceId ON products TYPE option<string>;
DEFINE FIELD IF NOT EXISTS price ON products TYPE number;
DEFINE FIELD IF NOT EXISTS subscriptionOptions ON products TYPE option<array>;
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
DEFINE FIELD IF NOT EXISTS status ON payments TYPE string;
DEFINE FIELD IF NOT EXISTS amount ON payments TYPE number;
DEFINE FIELD IF NOT EXISTS subscriptionInterval ON payments TYPE option<string>;
DEFINE FIELD IF NOT EXISTS stripeSubscriptionId ON payments TYPE option<string>;
DEFINE FIELD IF NOT EXISTS stripePaymentIntent ON payments TYPE option<string>;
DEFINE FIELD IF NOT EXISTS refunded ON payments TYPE option<bool>;
DEFINE FIELD IF NOT EXISTS productId ON payments TYPE string;
DEFINE FIELD IF NOT EXISTS renewalDate ON payments TYPE option<number>;
DEFINE FIELD IF NOT EXISTS cancelAtPeriodEnd ON payments TYPE option<bool>;
DEFINE INDEX IF NOT EXISTS idx_userId ON payments COLUMNS userId;
"


curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

