-- Write your SQL migration up query here for user

DEFINE TABLE user SCHEMAFULL
  PERMISSIONS
    FOR select FULL,
    FOR update, delete WHERE id = $auth.id OR $auth.isAdmin = true,
    FOR create NONE;

DEFINE FIELD email ON user TYPE string;
DEFINE FIELD isAdmin ON user TYPE option<bool> DEFAULT false;
DEFINE FIELD phone ON user TYPE option<string>;
DEFINE FIELD stripeCustomerId ON user TYPE option<string>;
DEFINE FIELD googleRefreshToken ON user TYPE option<string>;
DEFINE FIELD phonePrefix ON user TYPE option<string>;
DEFINE FIELD firstName ON user TYPE string;
DEFINE FIELD lastName ON user TYPE string;
DEFINE FIELD username ON user TYPE string;
DEFINE FIELD createdAt ON user TYPE datetime;
DEFINE FIELD updatedAt ON user TYPE datetime;
DEFINE FIELD loggedInAt ON user TYPE option<datetime>;
DEFINE FIELD password ON user TYPE string;
DEFINE FIELD settings ON user TYPE option<object>;
DEFINE FIELD headers ON user FLEXIBLE TYPE option<object>;
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
DEFINE FIELD passwordReset ON user TYPE option<object>;
DEFINE FIELD passwordReset.token ON user TYPE option<string>;
DEFINE FIELD passwordReset.expiration ON user TYPE option<string>;
DEFINE INDEX idx_email ON user COLUMNS email UNIQUE;
DEFINE INDEX idx_username ON user COLUMNS username UNIQUE;
