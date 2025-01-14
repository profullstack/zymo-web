-- Add notification preferences to user settings
DEFINE FIELD settings.notificationPreferences ON user TYPE object DEFAULT {
    emailNotifications: true,
    emailDigestFrequency: 'instant'
};
DEFINE FIELD settings.notificationPreferences.emailNotifications ON user TYPE bool DEFAULT true;
DEFINE FIELD settings.notificationPreferences.emailDigestFrequency ON user TYPE string DEFAULT 'instant';

-- Initialize all users with default preferences
UPDATE user SET settings.notificationPreferences = {
    emailNotifications: true,
    emailDigestFrequency: 'instant'
};
