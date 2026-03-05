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

export interface KleinanzeigenSyncTriggerResponse {
  syncing: boolean;
  started: boolean;
  message: string;
  syncedAt: string;
}

export interface KleinanzeigenSyncStatus {
  syncing: boolean;
  startedAt?: string;
  result?: KleinanzeigenSyncResult;
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

  triggerSync(): Observable<KleinanzeigenSyncTriggerResponse> {
    return this.http.post<KleinanzeigenSyncTriggerResponse>(`${this.apiUrl}/sync`, {});
  }

  getSyncStatus(): Observable<KleinanzeigenSyncStatus> {
    return this.http.get<KleinanzeigenSyncStatus>(`${this.apiUrl}/sync-status`);
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
