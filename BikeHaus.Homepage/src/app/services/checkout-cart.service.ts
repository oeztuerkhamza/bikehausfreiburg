import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CheckoutCartService {
  private readonly storageKey = 'checkout_accessory_cart_v1';

  getAccessoryQuantities(): Record<number, number> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, number>;
      const normalized: Record<number, number> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const id = Number(key);
        const qty = Math.max(0, Math.min(Number(value) || 0, 10));
        if (id > 0 && qty > 0) {
          normalized[id] = qty;
        }
      }
      return normalized;
    } catch {
      return {};
    }
  }

  setAccessoryQuantity(accessoryId: number, quantity: number): void {
    const safeQuantity = Math.max(0, Math.min(quantity, 10));
    const current = this.getAccessoryQuantities();

    if (safeQuantity === 0) {
      delete current[accessoryId];
    } else {
      current[accessoryId] = safeQuantity;
    }

    this.save(current);
  }

  addAccessory(accessoryId: number, quantity = 1): void {
    const current = this.getAccessoryQuantities();
    const next = (current[accessoryId] || 0) + quantity;
    this.setAccessoryQuantity(accessoryId, next);
  }

  clearAccessories(): void {
    localStorage.removeItem(this.storageKey);
  }

  private save(data: Record<number, number>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}
