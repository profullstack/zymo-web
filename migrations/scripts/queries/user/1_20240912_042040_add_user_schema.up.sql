-- Write your SQL migration up query here for user

DEFINE TABLE OVERWRITE user SCHEMAFULL
  PERMISSIONS
    FOR select FULL,
    FOR update, delete WHERE id = $auth.id OR $auth.isAdmin = true,
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
