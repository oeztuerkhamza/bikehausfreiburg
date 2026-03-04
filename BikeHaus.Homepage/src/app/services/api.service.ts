import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  KleinanzeigenListing,
  KleinanzeigenCategory,
  PublicShopInfo,
  NeueFahrrad,
  NeueFahrradCategory,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getListings(): Observable<KleinanzeigenListing[]> {
    return this.http.get<KleinanzeigenListing[]>(`${this.baseUrl}/listings`);
  }

  getListingsByCategory(category: string): Observable<KleinanzeigenListing[]> {
    return this.http.get<KleinanzeigenListing[]>(
      `${this.baseUrl}/listings/category/${encodeURIComponent(category)}`,
    );
  }

  getListingById(id: number): Observable<KleinanzeigenListing> {
    return this.http.get<KleinanzeigenListing>(
      `${this.baseUrl}/listings/${id}`,
    );
  }

  getCategories(): Observable<KleinanzeigenCategory[]> {
    return this.http.get<KleinanzeigenCategory[]>(`${this.baseUrl}/categories`);
  }

  getShopInfo(): Observable<PublicShopInfo> {
    return this.http.get<PublicShopInfo>(`${this.baseUrl}/shop-info`);
  }

  getLastSync(): Observable<string | null> {
    return this.http.get(`${this.baseUrl}/last-sync`, {
      responseType: 'text',
    }) as Observable<string | null>;
  }

  // ── Neue Fahrräder ──

  getNeueFahrraeder(): Observable<NeueFahrrad[]> {
    return this.http.get<NeueFahrrad[]>(`${this.baseUrl}/neue-fahrraeder`);
  }

  getNeueFahrraederByCategory(category: string): Observable<NeueFahrrad[]> {
    return this.http.get<NeueFahrrad[]>(
      `${this.baseUrl}/neue-fahrraeder/category/${encodeURIComponent(category)}`,
    );
  }

  getNeueFahrradById(id: number): Observable<NeueFahrrad> {
    return this.http.get<NeueFahrrad>(`${this.baseUrl}/neue-fahrraeder/${id}`);
  }

  getNeueFahrraederCategories(): Observable<NeueFahrradCategory[]> {
    return this.http.get<NeueFahrradCategory[]>(
      `${this.baseUrl}/neue-fahrraeder/categories`,
    );
  }
}
