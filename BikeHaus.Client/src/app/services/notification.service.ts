import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private counter = 0;

  success(message: string, duration = 4000) {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 6000) {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 5000) {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 4000) {
    this.show({ type: 'info', message, duration });
  }

  private show(notification: Omit<Notification, 'id'>) {
    const id = ++this.counter;
    const newNotification: Notification = { ...notification, id };

    this.notifications.update((list) => [...list, newNotification]);

    if (notification.duration && notification.duration > 0) {
      setTimeout(() => this.remove(id), notification.duration);
    }
  }

  remove(id: number) {
    this.notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll() {
    this.notifications.set([]);
  }
}
