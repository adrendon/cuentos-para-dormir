/**
 * Push notification service using Firebase Cloud Messaging.
 *
 * Handles:
 * - FCM token registration
 * - Foreground notification display
 * - Background message handling
 * - Deep linking to specific books when notification is tapped
 */

// Note: @react-native-firebase/messaging requires native setup.
// The google-services.json file must be placed in the project root.

let messagingInstance: any = null;

/**
 * Initialize Firebase Cloud Messaging.
 * Request permission and register token.
 */
export async function initializeNotifications(): Promise<string | null> {
  try {
    const messaging = getMessaging();
    if (!messaging) return null;

    // Request permission (Android 13+ requires runtime permission)
    const authStatus = await messaging.requestPermission();
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2; // PROVISIONAL

    if (!enabled) {
      console.log('FCM permission denied');
      return null;
    }

    // Get FCM token
    const token = await messaging.getToken();
    console.log('FCM Token:', token);

    // Listen for token refresh
    messaging.onTokenRefresh((newToken: string) => {
      console.log('FCM Token refreshed:', newToken);
      // Send to your backend server
      sendTokenToServer(newToken);
    });

    return token;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

/**
 * Set up foreground message handler.
 * Called when the app is in the foreground and receives a push.
 */
export function onForegroundMessage(callback: (message: NotificationMessage) => void): () => void {
  try {
    const messaging = getMessaging();
    if (!messaging) return () => {};

    return messaging.onMessage((remoteMessage: any) => {
      const parsed = parseMessage(remoteMessage);
      if (parsed) {
        callback(parsed);
      }
    });
  } catch {
    return () => {};
  }
}

/**
 * Get the initial notification that opened the app (from killed state).
 */
export async function getInitialNotification(): Promise<NotificationMessage | null> {
  try {
    const messaging = getMessaging();
    if (!messaging) return null;

    const remoteMessage = await messaging.getInitialNotification();
    if (remoteMessage) {
      return parseMessage(remoteMessage);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set up handler for notification tap when app is in background.
 */
export function onNotificationOpenedApp(
  callback: (message: NotificationMessage) => void
): () => void {
  try {
    const messaging = getMessaging();
    if (!messaging) return () => {};

    return messaging.onNotificationOpenedApp((remoteMessage: any) => {
      const parsed = parseMessage(remoteMessage);
      if (parsed) {
        callback(parsed);
      }
    });
  } catch {
    return () => {};
  }
}

/**
 * Subscribe to a topic (e.g., 'new_books')
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    const messaging = getMessaging();
    if (!messaging) return;
    await messaging.subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

// --- Internal helpers ---

interface NotificationMessage {
  title: string;
  body: string;
  bookId?: string;
  type?: 'new_book' | 'general';
}

function getMessaging(): any {
  if (messagingInstance) return messagingInstance;
  try {
    // Dynamic import to avoid crash if Firebase is not configured
    const firebase = require('@react-native-firebase/messaging');
    messagingInstance = firebase.default();
    return messagingInstance;
  } catch {
    console.warn('Firebase Messaging not available');
    return null;
  }
}

function parseMessage(remoteMessage: any): NotificationMessage | null {
  if (!remoteMessage) return null;

  return {
    title: remoteMessage.notification?.title ?? 'Nuevo cuento',
    body: remoteMessage.notification?.body ?? '',
    bookId: remoteMessage.data?.bookId,
    type: remoteMessage.data?.type ?? 'general',
  };
}

function sendTokenToServer(_token: string): void {
  // TODO: Implement your backend token registration
  // This would typically POST the token to your server
  // so you can send targeted push notifications later.
}

/**
 * Background message handler.
 * Must be registered at the top level (outside of any component).
 * Call this in index.ts:
 *   messaging().setBackgroundMessageHandler(backgroundMessageHandler);
 */
export async function backgroundMessageHandler(remoteMessage: any): Promise<void> {
  console.log('Background message received:', remoteMessage.notification?.title);
  // The OS handles showing the notification automatically.
  // No additional processing needed unless you want to update local state.
}
