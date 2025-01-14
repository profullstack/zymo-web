-- Remove notification preferences from user settings
REMOVE FIELD IF EXISTS settings.notificationPreferences.emailNotifications ON user;
REMOVE FIELD IF EXISTS settings.notificationPreferences.emailDigestFrequency ON user;
REMOVE FIELD IF EXISTS settings.notificationPreferences ON user;
