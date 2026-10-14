export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function showAlertNotification(level, message) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const titles = {
    normal: '✅ Alert Level: Normal',
    watch: '⚠️ Tsunami Watch',
    warning: '🚨 TSUNAMI WARNING',
  };

  const notification = new Notification(titles[level] || 'Coastal Alert', {
    body: message,
    tag: 'coastal-alert', // replaces the previous notification instead of stacking multiple
    requireInteraction: level === 'warning', // warning notifications stay on screen until dismissed
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}