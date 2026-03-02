import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { PublicShopInfo } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ShopInfoService {
  private apiService = inject(ApiService);

  // Cached shop info
  shopInfo = signal<PublicShopInfo | null>(null);
  logoUrl = signal<string>('assets/logo.svg'); // Default fallback
  loaded = signal(false);

  constructor() {
    this.loadShopInfo();
  }

  private loadShopInfo(): void {
    if (this.loaded()) return;

    this.apiService.getShopInfo().subscribe({
      next: (info) => {
        this.shopInfo.set(info);

        // Set logo URL - use base64 if available, otherwise default
        if (info.logoBase64) {
          // Detect image type from base64 header or use default
          let mimeType = 'image/png';
          if (info.logoFileName) {
            const ext = info.logoFileName.toLowerCase().split('.').pop();
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'svg') mimeType = 'image/svg+xml';
            else if (ext === 'webp') mimeType = 'image/webp';
            else if (ext === 'gif') mimeType = 'image/gif';
          }

          // Check if base64 already has data URI prefix
          if (info.logoBase64.startsWith('data:')) {
            this.logoUrl.set(info.logoBase64);
          } else {
            this.logoUrl.set(`data:${mimeType};base64,${info.logoBase64}`);
          }
        }

        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true); // Mark as loaded even on error to prevent retries
      },
    });
  }
}
