import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialogService.state().isOpen) {
      <div class="dialog-overlay" (click)="onOverlayClick($event)">
        <div class="dialog" [class]="'dialog-' + dialogService.state().type">
          <div class="dialog-header">
            <div class="dialog-icon">
              @switch (dialogService.state().type) {
                @case ('danger') {
                  <span class="icon-danger">⚠</span>
                }
                @case ('alert') {
                  <span class="icon-info">ℹ</span>
                }
                @default {
                  <span class="icon-confirm">?</span>
                }
              }
            </div>
            <h3 class="dialog-title">{{ dialogService.state().title }}</h3>
          </div>
          <div class="dialog-body">
            <p class="dialog-message">{{ dialogService.state().message }}</p>
          </div>
          <div class="dialog-actions">
            @if (dialogService.state().type !== 'alert') {
              <button
                class="btn btn-outline"
                (click)="dialogService.close(false)"
              >
                {{ dialogService.state().cancelText }}
              </button>
            }
            <button
              class="btn"
              [class.btn-danger]="dialogService.state().type === 'danger'"
              [class.btn-primary]="dialogService.state().type !== 'danger'"
              (click)="dialogService.close(true)"
            >
              {{ dialogService.state().confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
        padding: 20px;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .dialog {
        background: var(--bg-card, #fff);
        border-radius: 16px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
        max-width: 420px;
        width: 100%;
        animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 24px 24px 0 24px;
      }

      .dialog-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        flex-shrink: 0;
        font-size: 1.4rem;
      }

      .icon-danger {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .icon-info {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .icon-confirm {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
      }

      .dialog-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--text-primary, #1e293b);
        margin: 0;
      }

      .dialog-body {
        padding: 16px 24px 24px 24px;
      }

      .dialog-message {
        font-size: 0.95rem;
        color: var(--text-secondary, #64748b);
        line-height: 1.6;
        margin: 0;
      }

      .dialog-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 24px;
        background: var(--bg-subtle, #f8fafc);
        border-top: 1px solid var(--border-light, #e2e8f0);
      }

      .dialog-actions .btn {
        min-width: 100px;
        padding: 10px 20px;
        font-weight: 500;
      }

      .btn-danger {
        background: #ef4444;
        color: white;
        border-color: #ef4444;
      }

      .btn-danger:hover {
        background: #dc2626;
        border-color: #dc2626;
      }

      @media (max-width: 480px) {
        .dialog {
          max-width: 100%;
        }

        .dialog-actions {
          flex-direction: column-reverse;
        }

        .dialog-actions .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class DialogComponent {
  dialogService = inject(DialogService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (
      this.dialogService.state().isOpen &&
      this.dialogService.state().type !== 'alert'
    ) {
      this.dialogService.close(false);
    }
  }

  @HostListener('document:keydown.enter')
  onEnter() {
    if (this.dialogService.state().isOpen) {
      this.dialogService.close(true);
    }
  }

  onOverlayClick(event: MouseEvent) {
    if (
      event.target === event.currentTarget &&
      this.dialogService.state().type !== 'alert'
    ) {
      this.dialogService.close(false);
    }
  }
}
