import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface KleinanzeigenSyncResult {
  newListings: number;
  updatedListings: number;
  deactivatedListings: number;
  syncedAt: string;
  error?: string;
}

export interface KleinanzeigenListing {
  id: number;
  externalId: string;
  title: string;
  description?: string;
  price?: number;
  priceText?: string;
  category?: string;
  location?: string;
  externalUrl: string;
  isActive: boolean;
  lastScrapedAt?: string;
  createdAt: string;
  images: KleinanzeigenImage[];
}

export interface KleinanzeigenImage {
  id: number;
  imageUrl: string;
  localPath?: string;
  sortOrder: number;
}

export interface KleinanzeigenCategory {
  name: string;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class KleinanzeigenService {
  private readonly apiUrl = `${environment.apiUrl}/kleinanzeigen`;

  constructor(private readonly http: HttpClient) {}

  triggerSync(): Observable<KleinanzeigenSyncResult> {
    return this.http.post<KleinanzeigenSyncResult>(`${this.apiUrl}/sync`, {});
  }

  getLastSync(): Observable<{ lastSyncedAt: string | null }> {
    return this.http.get<{ lastSyncedAt: string | null }>(
      `${this.apiUrl}/last-sync`,
    );
  }

  getListings(): Observable<KleinanzeigenListing[]> {
    return this.http.get<KleinanzeigenListing[]>(`${this.apiUrl}/listings`);
  }
}
