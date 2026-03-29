/**
 * Push Notification System for LocQar
 * Uses the Notifications API for local notifications
 * In production, this would integrate with a push service (Firebase, OneSignal, etc.)
 */

export const NotificationManager = {
  /**
   * Check if notifications are supported
   */
  isSupported: () => {
    return 'Notification' in window;
  },

  /**
   * Get current notification permission status
   * @returns {'granted' | 'denied' | 'default'}
   */
  getPermission: () => {
    if (!NotificationManager.isSupported()) return 'denied';
    return Notification.permission;
  },

  /**
   * Check if notifications are enabled
   */
  isEnabled: () => {
    return NotificationManager.getPermission() === 'granted';
  },

  /**
   * Request notification permission
   * @returns {Promise<boolean>} true if permission granted
   */
  requestPermission: async () => {
    if (!NotificationManager.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission has been denied. Please enable it in browser settings.');
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        // Store that user has enabled notifications
        localStorage.setItem('notifications_enabled', 'true');
        localStorage.setItem('notifications_enabled_at', new Date().toISOString());
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  },

  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {Object} options - Notification options
   * @returns {Notification} The notification instance
   */
  show: (title, options = {}) => {
    if (!NotificationManager.isEnabled()) {
      console.warn('Cannot show notification: permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      tag: 'locqar-notification',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Auto-close after 6 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 6000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  },

  /**
   * Show package status update notification
   */
  notifyPackageUpdate: (packageData) => {
    const statusEmojis = {
      'Pending': '📦',
      'In Transit': '🚚',
      'Ready': '✅',
      'Delivered': '🎉'
    };

    const emoji = statusEmojis[packageData.status] || '📦';
    const title = `${emoji} Package Update`;

    const body = packageData.status === 'Ready'
      ? `Your package "${packageData.name}" is ready for pickup at ${packageData.location}!`
      : packageData.status === 'Delivered'
      ? `Your package "${packageData.name}" has been delivered!`
      : `Your package "${packageData.name}" is now ${packageData.status}`;

    return NotificationManager.show(title, {
      body,
      tag: `package-${packageData.id}`,
      data: {
        type: 'package_update',
        packageId: packageData.id,
        status: packageData.status
      },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'close', title: 'Close' }
      ]
    });
  },

  /**
   * Show delivery reminder notification
   */
  notifyDeliveryReminder: (packageData) => {
    const title = '⏰ Pickup Reminder';
    const body = `Don't forget to pick up your package "${packageData.name}" from ${packageData.location}`;

    return NotificationManager.show(title, {
      body,
      tag: `reminder-${packageData.id}`,
      data: {
        type: 'pickup_reminder',
        packageId: packageData.id
      },
      requireInteraction: true
    });
  },

  /**
   * Show new message notification
   */
  notifyNewMessage: (message) => {
    const title = '💬 New Message';
    const body = message.preview || 'You have a new message';

    return NotificationManager.show(title, {
      body,
      tag: 'new-message',
      data: {
        type: 'new_message',
        messageId: message.id
      }
    });
  },

  /**
   * Show promo/offer notification
   */
  notifyPromo: (promo) => {
    const title = '🎁 ' + (promo.title || 'Special Offer');
    const body = promo.message || 'Check out our latest offer!';

    return NotificationManager.show(title, {
      body,
      tag: 'promo',
      data: {
        type: 'promo',
        promoId: promo.id
      }
    });
  },

  /**
   * Check if user has dismissed the notification prompt
   */
  hasUserDismissedPrompt: () => {
    return localStorage.getItem('notification_prompt_dismissed') === 'true';
  },

  /**
   * Mark notification prompt as dismissed
   */
  dismissPrompt: () => {
    localStorage.setItem('notification_prompt_dismissed', 'true');
    localStorage.setItem('notification_prompt_dismissed_at', new Date().toISOString());
  },

  /**
   * Clear dismissed prompt flag (for testing)
   */
  clearDismissed: () => {
    localStorage.removeItem('notification_prompt_dismissed');
    localStorage.removeItem('notification_prompt_dismissed_at');
  },

  /**
   * Get notification preferences
   */
  getPreferences: () => {
    return {
      enabled: NotificationManager.isEnabled(),
      packageUpdates: localStorage.getItem('notify_package_updates') !== 'false',
      messages: localStorage.getItem('notify_messages') !== 'false',
      promos: localStorage.getItem('notify_promos') !== 'false'
    };
  },

  /**
   * Update notification preferences
   */
  setPreferences: (prefs) => {
    if (prefs.packageUpdates !== undefined) {
      localStorage.setItem('notify_package_updates', prefs.packageUpdates.toString());
    }
    if (prefs.messages !== undefined) {
      localStorage.setItem('notify_messages', prefs.messages.toString());
    }
    if (prefs.promos !== undefined) {
      localStorage.setItem('notify_promos', prefs.promos.toString());
    }
  }
};

// Listen for notification clicks
if (NotificationManager.isSupported()) {
  // This would be handled by service worker in production
  // For now, we'll just log clicks
  document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
      // Service worker integration would go here
      // navigator.serviceWorker.register('/sw.js')
    }
  });
}
