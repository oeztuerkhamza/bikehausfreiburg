import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  KleinanzeigenListing,
  KleinanzeigenCategory,
  PublicShopInfo,
  NeueFahrrad,
  NeueFahrradCategory,
  PublicBicycle,
  RepairShowcase,
  HomepageAccessory,
  HomepageAccessoryCategory,
  GoogleReviewsResponse,
  PublicRentalBicycle,
  RentalAccessoryPublic,
  RentalBookingCreate,
  RentalBookingResponse,
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
    return this.http
      .get<PublicShopInfo>(`${this.baseUrl}/shop-info`)
      .pipe(catchError(() => of({} as PublicShopInfo)));
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
    return this.http
      .get<NeueFahrradCategory[]>(`${this.baseUrl}/neue-fahrraeder/categories`)
      .pipe(catchError(() => of([])));
  }

  // ── Gebrauchte Fahrräder (Published Used Bicycles) ──
  getGebrauchteFahrraeder(): Observable<PublicBicycle[]> {
    return this.http.get<PublicBicycle[]>(
      `${this.baseUrl}/gebrauchte-fahrraeder`,
    );
  }

  getGebrauchteFahrradById(id: number): Observable<PublicBicycle> {
    return this.http.get<PublicBicycle>(
      `${this.baseUrl}/gebrauchte-fahrraeder/${id}`,
    );
  }

  // ── Repair Showcases ──
  getRepairShowcases(): Observable<RepairShowcase[]> {
    return this.http.get<RepairShowcase[]>(`${this.baseUrl}/repair-showcases`);
  }

  // ── Homepage Accessories ──
  getHomepageAccessories(): Observable<HomepageAccessory[]> {
    return this.http.get<HomepageAccessory[]>(
      `${this.baseUrl}/homepage-accessories`,
    );
  }

  getHomepageAccessoriesByCategory(
    category: string,
  ): Observable<HomepageAccessory[]> {
    return this.http.get<HomepageAccessory[]>(
      `${this.baseUrl}/homepage-accessories/category/${encodeURIComponent(category)}`,
    );
  }

  getHomepageAccessoryById(id: number): Observable<HomepageAccessory> {
    return this.http.get<HomepageAccessory>(
      `${this.baseUrl}/homepage-accessories/${id}`,
    );
  }

  getHomepageAccessoryCategories(): Observable<HomepageAccessoryCategory[]> {
    return this.http.get<HomepageAccessoryCategory[]>(
      `${this.baseUrl}/homepage-accessories/categories`,
    );
  }

  // ── Google Reviews ──

  getGoogleReviews(): Observable<GoogleReviewsResponse> {
    return this.http.get<GoogleReviewsResponse>(
      `${this.baseUrl}/google-reviews`,
    );
  }

  // ── Rental Bikes ──

  getRentableBikes(): Observable<PublicRentalBicycle[]> {
    return this.http.get<PublicRentalBicycle[]>(
      `${this.baseUrl}/rentals/bikes`,
    );
  }

  getRentalAccessories(): Observable<RentalAccessoryPublic[]> {
    return this.http.get<RentalAccessoryPublic[]>(
      `${this.baseUrl}/rentals/accessories`,
    );
  }

  createRentalBooking(
    dto: RentalBookingCreate,
  ): Observable<RentalBookingResponse> {
    return this.http.post<RentalBookingResponse>(
      `${this.baseUrl}/rentals/bookings`,
      dto,
    );
  }

  getRentalBikeBookings(
    bikeId: number,
  ): Observable<{ startDatum: string; endDatum: string }[]> {
    return this.http.get<{ startDatum: string; endDatum: string }[]>(
      `${this.baseUrl}/rentals/bikes/${bikeId}/bookings`,
    );
  }

  getBusyPeriods(
    bikeId: number,
  ): Observable<{ start: string; end: string; type: string }[]> {
    return this.http.get<{ start: string; end: string; type: string }[]>(
      `${this.baseUrl}/rentals/bikes/${bikeId}/busy-periods`,
    );
  }
}
