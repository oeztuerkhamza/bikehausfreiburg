import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (
        notification of notificationService.notifications();
        track notification.id
      ) {
        <div
          class="notification"
          [class]="'notification-' + notification.type"
          (click)="notificationService.remove(notification.id)"
        >
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') {
                <span>✓</span>
              }
              @case ('error') {
                <span>✕</span>
              }
              @case ('warning') {
                <span>⚠</span>
              }
              @case ('info') {
                <span>ℹ</span>
              }
            }
          </div>
          <div class="notification-content">
            <span class="notification-message">{{ notification.message }}</span>
          </div>
          <button
            class="notification-close"
            (click)="
              notificationService.remove(notification.id);
              $event.stopPropagation()
            "
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      }

      .notification {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        background: var(--bg-card, #fff);
        box-shadow:
          0 8px 32px rgba(0, 0, 0, 0.12),
          0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--border-light, #e2e8f0);
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: pointer;
        pointer-events: auto;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .notification:hover {
        transform: translateX(-4px);
        box-shadow:
          0 12px 40px rgba(0, 0, 0, 0.15),
          0 4px 12px rgba(0, 0, 0, 0.1);
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .notification-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
        font-size: 1rem;
        font-weight: bold;
      }

      .notification-success .notification-icon {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }

      .notification-error .notification-icon {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }

      .notification-warning .notification-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }

      .notification-info .notification-icon {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-message {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-primary, #1e293b);
        line-height: 1.4;
      }

      .notification-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        border-radius: 6px;
        font-size: 1.1rem;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .notification-close:hover {
        background: var(--bg-hover, #f1f5f9);
        color: var(--text-primary, #1e293b);
      }

      /* Border accents */
      .notification-success {
        border-left: 4px solid #10b981;
      }

      .notification-error {
        border-left: 4px solid #ef4444;
      }

      .notification-warning {
        border-left: 4px solid #f59e0b;
      }

      .notification-info {
        border-left: 4px solid #3b82f6;
      }

      @media (max-width: 480px) {
        .notification-container {
          left: 10px;
          right: 10px;
          max-width: none;
        }
      }
    `,
  ],
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
