import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

interface DialogState extends DialogConfig {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  state = signal<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'OK',
    cancelText: 'Abbrechen',
    resolve: null,
  });

  confirm(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        isOpen: true,
        title: config.title,
        message: config.message,
        type: config.type || 'confirm',
        confirmText: config.confirmText || 'OK',
        cancelText: config.cancelText || 'Abbrechen',
        resolve,
      });
    });
  }

  alert(title: string, message: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      type: 'alert',
      confirmText: 'OK',
    });
  }

  danger(
    title: string,
    message: string,
    confirmText = 'Löschen',
  ): Promise<boolean> {
    return this.confirm({
      title,
      message,
      type: 'danger',
      confirmText,
      cancelText: 'Abbrechen',
    });
  }

  close(result: boolean) {
    const current = this.state();
    if (current.resolve) {
      current.resolve(result);
    }
    this.state.update((s) => ({ ...s, isOpen: false, resolve: null }));
  }
}
