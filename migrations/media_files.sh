#!/bin/bash

. .env
. .env.local

DATA="DEFINE TABLE media_files SCHEMALESS
  PERMISSIONS 
    FOR select FULL,
    FOR create WHERE \$scope = \"allusers\",
	FOR update WHERE createdBy = \$auth.id,
	FOR delete WHERE createdBy = \$auth.id;
	DEFINE INDEX idx_url_library ON media_files COLUMNS url, libraryId UNIQUE;
	DEFINE INDEX idx_created_by ON media_files COLUMNS createdBy;
	DEFINE INDEX idx_created_at ON media_files COLUMNS createdAt;
	DEFINE INDEX idx_type ON media_files COLUMNS mediaInfo.type;
	DEFINE INDEX idx_video_type ON media_files COLUMNS mediaInfo.videoType;

"
# 	-- FOR select WHERE \$scope = \"allusers\" -- limit to only users in db

curl -k -L -s --compressed POST \
	--header "Accept: application/json" \
	--header "NS: ${DB_NS}" \
	--header "DB: ${DB_DB}" \
	--user "root:root" \
	--data "${DATA}" \
	${DB_SQL_URL}

