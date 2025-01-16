-- Write your SQL migration down query here for user
REMOVE FIELD IF EXISTS settings.notificationPreferences.smsNotifications ON user;
