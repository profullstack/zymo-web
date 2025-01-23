-- Remove productUpdatesEmail field from user settings.notificationPreferences
REMOVE FIELD IF EXISTS settings.notificationPreferences.productUpdatesEmail ON user;