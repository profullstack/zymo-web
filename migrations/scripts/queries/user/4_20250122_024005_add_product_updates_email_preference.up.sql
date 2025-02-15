-- Only set default value if the field is NONE (not if it's already true or false)
DEFINE FIELD settings.notificationPreferences.productUpdatesEmail ON user TYPE option<bool> DEFAULT true;