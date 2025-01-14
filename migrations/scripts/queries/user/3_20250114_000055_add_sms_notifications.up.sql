-- Write your SQL migration up query here for user
-- Add notification preferences to user settings
DEFINE FIELD settings.notificationPreferences.smsNotifications ON user TYPE bool DEFAULT true;

-- Initialize all users with default preferences
-- This only updates the smsNotifications field, 
-- preserving all other fields in settings.notificationPreferences
UPDATE user
SET settings.notificationPreferences.smsNotifications = true;

