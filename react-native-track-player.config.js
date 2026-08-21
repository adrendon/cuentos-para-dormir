/**
 * React Native Track Player configuration for Android foreground service.
 * This file configures the background audio service capabilities.
 */
module.exports = {
  // Capabilities shown in the Android notification
  capabilities: ['play', 'pause', 'stop'],
  // Compact capabilities (shown when notification is collapsed)
  compactCapabilities: ['play', 'pause'],
  // Notification channel name
  notificationCapabilities: ['play', 'pause', 'stop'],
};
